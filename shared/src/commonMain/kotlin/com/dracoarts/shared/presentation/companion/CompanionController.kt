package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/** SQLite owns dog context, setup drafts and local conversations; the SDK owns identity. */
class CompanionController(private val documents: LocalDocumentRepository, private val journal: JournalRepository, private val care: CareRepository, private val platform: AppPlatform, private val responder: CompanionResponseProvider = DemoResponseProvider(), dispatcher: CoroutineDispatcher = Dispatchers.Main, private val authentication: Authentication? = null, private val purchases: com.dracoarts.shared.services.NativePurchases? = null) {
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private val json = Json { ignoreUnknownKeys = true }
    private val lock = Mutex()
    private val _state = MutableStateFlow(CompanionState())
    val state = _state.asStateFlow()
    private var draftJob: Job? = null
    private var replyJob: Job? = null
    private var composerRevision = 0L
    private var originalDog: Dog? = null
    private var initialized = false
    private var accountCleanupPending = false
    private var authObserver: Job? = null
    private val authLock = Mutex()
    private val profileLock = Mutex()
    private var foregroundObserver: Job? = null
    private var purchaseObserver: Job? = null
    private var purchaseIdentityObserver: Job? = null
    var navigationHandler: com.dracoarts.shared.presentation.navigation.BoardNavigationHandler? = null
    val safety by lazy { SafetyAiController(journal, platform, responder, { state.value }, { hasPremium }, { authentication?.snapshot?.value?.user?.uid }) }
    var safetyConsentReturn = false
    fun requestSafetyConsent() { safetyConsentReturn = true; go(CompanionScreen.AiPrivacy) }
    fun completeAiConsent() {
        val journalReturn = safetyConsentReturn; safetyConsentReturn = false
        go(if (journalReturn) null else if (hasPremium) CompanionScreen.Chat else CompanionScreen.AiGate)
    }
    val localAi get() = platform.localAi
    val demoResponses get() = responder is DemoResponseProvider
    val atlasOnly get() = responder is AtlasResponseProvider
    val hasPremium get() = purchases?.hasAccess == true || (platform.premiumPreviewAllowed && state.value.session.premium)
    val authenticationConfigured get() = authentication?.configured == true
    val requiresAiConsent get() = if (atlasOnly) !state.value.workspace.weeklyAllowed else !state.value.workspace.messageConsent
    suspend fun prepareModels() {
        try { localAi.restore() }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { setError("Couldn't read the local models. Retry from AI & your records.") }
    }
    fun describePhoto(id: String, dog: Dog) {
        if (atlasOnly) { setError("Photo descriptions are on hold. Photos stay on this phone."); return }
        val owned = state.value.workspace.thread?.messages?.any { id in it.photoIds } == true
        if (!owned || state.value.dogId != dog.id) return
        send("Describe this photo on this device.", dog, emptyList(), includeComposer = false, captionPhotoId = id)
    }
    suspend fun updateAiContext(change: (CompanionWorkspace) -> CompanionWorkspace): Boolean {
        replyJob?.cancelAndJoin()
        return updateWorkspace(change = change)
    }
    suspend fun close() { scope.coroutineContext[Job]?.cancelAndJoin() }
    suspend fun load(dog: Dog?, review: CompanionScreen? = null) {
        try {
            val saved = documents.readDocument("companion-session")?.let { json.decodeFromString<DemoSession>(it) } ?: DemoSession()
            val snapshot = authentication?.snapshot?.value
            val user = snapshot?.user
            val session = saved.copy(signedIn = user != null, provider = user?.provider.orEmpty(), email = user?.email.orEmpty())
            val draft = documents.readDocument("companion-setup")?.let { json.decodeFromString<CompanionDraft>(it) } ?: CompanionDraft(platform.newId(), name = dog?.name.orEmpty(), sex = dog?.details?.sex ?: "Not recorded", photoId = dog?.details?.photoId, context = dog?.details?.companion ?: DogContext.catDefaults())
            _state.value = CompanionState(premiumCustomer = purchases?.state?.value ?: PremiumCustomer(), premiumPreviewAllowed = platform.premiumPreviewAllowed, loading = false, session = session, draft = draft, emailLinkPending = snapshot?.emailLinkPending == true, route = review ?: if (snapshot?.emailLinkPending == true) CompanionScreen.CheckEmail else if (dog == null) CompanionScreen.fromBoard(draft.step) ?: CompanionScreen.Opening else null)
            initialized = true
            if (purchases != null && purchaseObserver == null) purchaseObserver = scope.launch {
                purchases.state.collect { customer -> _state.update { it.copy(premiumCustomer = customer) } }
            }
            if (purchases != null && authentication != null && purchaseIdentityObserver == null) purchaseIdentityObserver = scope.launch {
                authentication.snapshot.map { it.user?.uid }.distinctUntilChanged().collect { purchases.identify(it) }
            }
            if (foregroundObserver == null) foregroundObserver = scope.launch {
                runCatching { platform.device.foreground }.getOrNull()?.collect { if (!it) replyJob?.cancel() else purchases?.perform("refresh") }
            }
            if (authObserver == null && authentication != null) authObserver = scope.launch {
                var previousUid = authentication.snapshot.value.user?.uid
                authentication.snapshot.collect { snapshot ->
                    if (snapshot.user?.uid != previousUid) replyJob?.cancelAndJoin()
                    previousUid = snapshot.user?.uid
                    _state.update { current -> current.copy(session = current.session.copy(signedIn = snapshot.user != null, provider = snapshot.user?.provider.orEmpty(), email = snapshot.user?.email.orEmpty()), emailLinkPending = snapshot.emailLinkPending,
                        route = when {
                            current.authBusy -> current.route
                            snapshot.emailLinkPending -> CompanionScreen.CheckEmail
                            snapshot.user != null && current.route in setOf(CompanionScreen.Login, CompanionScreen.Email, CompanionScreen.CheckEmail) -> if (current.dogId != null) null else CompanionScreen.Plan
                            else -> current.route
                        }) }
                }
            }
            if (dog != null) activateDog(dog.id)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.value = _state.value.copy(loading = false, loadFailed = true, error = "Couldn't read your saved setup. Retry before making changes.") }
    }
    suspend fun activateDog(id: String) {
        if (!initialized || id == state.value.dogId) return
        replyJob?.cancelAndJoin()
        try {
            val workspace = documents.readDocument("companion-chat-$id")?.let { json.decodeFromString<CompanionWorkspace>(it) } ?: CompanionWorkspace()
            val composer = care.loadDraft(id, "chat-composer-v1")?.let { json.decodeFromString<ChatComposerDraft>(it.value) } ?: ChatComposerDraft()
            require(composer.text.length <= 4000 && composer.photoIds.size <= 3 && composer.photoIds.all { LocalAttachmentRules.image.matches(it) })
            composerRevision++
            _state.update { it.copy(dogId = id, composer = composer, workspace = workspace, sourceMessageId = null, conversationsFailed = false, busy = false, streaming = null, error = null) }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.update { it.copy(dogId = id, composer = ChatComposerDraft(), workspace = CompanionWorkspace(), busy = false, conversationsFailed = true, error = "Couldn't open this cat’s conversations. Your journal is still available.") } }
    }
    fun editDraft(change: (CompanionDraft) -> CompanionDraft) {
        if (state.value.profileSaving) return
        _state.update { it.copy(draft = change(it.draft), error = null) }
        draftJob?.cancel(); draftJob = scope.launch { delay(300); persistDraft() }
    }
    private suspend fun persistDraft(): Boolean = operation {
        val draft = state.value.draft
        documents.writeDocument(if (draft.addingDog) ADD_DOG_DRAFT else "companion-setup", json.encodeToString(draft))
    }
    /** A second dog starts with independent facts. Its unfinished setup never replaces first-run/edit setup. */
    suspend fun beginAddDog(navigation: com.dracoarts.shared.presentation.navigation.AppState): Boolean {
        if (!requestPremium(PremiumFeature.AdditionalDog)) return false
        if (!profileLock.tryLock()) return false
        _state.update { it.copy(profileSaving = true) }
        try {
            draftJob?.cancelAndJoin()
            replyJob?.cancelAndJoin()
            var next: CompanionDraft? = null
            if (!operation {
                val saved = documents.readDocument(ADD_DOG_DRAFT)?.let { json.decodeFromString<CompanionDraft>(it) }
                val draft = saved ?: CompanionDraft(platform.newId(), step = CompanionScreen.Dog.boardId, addingDog = true)
                check(draft.addingDog && draft.editingDogId == null && draft.step in dogSetupIds)
                documents.writeDocument(ADD_DOG_DRAFT, json.encodeToString(draft))
                next = draft
            }) return false
            originalDog = null
            val action = {
                navigation.openJournalTool(com.dracoarts.shared.presentation.navigation.Feature.DogSwitcher)
                _state.update { it.copy(draft = next!!, route = CompanionScreen.fromBoard(next!!.step), reviewingDraft = false, error = null) }
            }
            (navigation.navigationHandler ?: navigationHandler)?.invoke(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push, action) ?: action()
            return true
        } finally { _state.update { it.copy(profileSaving = false) }; profileLock.unlock() }
    }
    suspend fun pauseAddDog(navigation: com.dracoarts.shared.presentation.navigation.AppState): Boolean {
        if (!state.value.draft.addingDog || state.value.profileSaving) return false
        draftJob?.cancelAndJoin()
        if (!persistDraft()) return false
        openJournalTool(navigation, com.dracoarts.shared.presentation.navigation.Feature.DogSwitcher)
        return true
    }
    fun reviewDraftAt(screen: CompanionScreen) {
        if (state.value.profileSaving) return
        _state.update { it.copy(reviewingDraft = true) }
        go(screen)
    }
    suspend fun continueTo(screen: CompanionScreen): Boolean {
        draftJob?.cancelAndJoin()
        _state.update { it.copy(draft = it.draft.copy(step = screen.boardId)) }
        if (!persistDraft()) return false
        go(screen); return true
    }
    fun go(screen: CompanionScreen?) = navigate(screen, null)
    /** Account links have an explicit direction; enum order is not a navigation hierarchy. */
    fun go(screen: CompanionScreen?, move: com.dracoarts.shared.presentation.navigation.BoardNavigationMove) = navigate(screen, move)
    private fun navigate(screen: CompanionScreen?, move: com.dracoarts.shared.presentation.navigation.BoardNavigationMove?) {
        if (state.value.route == CompanionScreen.AiPrivacy && screen != CompanionScreen.AiPrivacy) safetyConsentReturn = false
        val action = { _state.update { it.copy(route = screen, error = null, reviewingDraft = it.reviewingDraft && screen != CompanionScreen.ContextReview && screen != null, draft = if (screen?.boardId in onboardingIds) it.draft.copy(step = screen!!.boardId) else it.draft) } }
        val back = screen == null || (screen.ordinal < (state.value.route?.ordinal ?: 0))
        navigationHandler?.invoke(move ?: if(back) com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Back else com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push, action) ?: action()
    }
    fun openJournalTool(navigation: com.dracoarts.shared.presentation.navigation.AppState, feature: com.dracoarts.shared.presentation.navigation.Feature) {
        val action = {
            navigation.openJournalTool(feature)
            _state.update { it.copy(route = null, error = null) }
        }
        navigationHandler?.invoke(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push, action) ?: action()
    }
    fun enterJournal(navigation: com.dracoarts.shared.presentation.navigation.AppState) {
        val action = {
            navigation.enterJournal()
            _state.update { it.copy(route = null, reviewingDraft = false, error = null) }
        }
        navigationHandler?.invoke(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Back, action) ?: action()
    }
    fun navigateTab(navigation: com.dracoarts.shared.presentation.navigation.AppState, tab: com.dracoarts.shared.presentation.navigation.Route) {
        val action = {
            navigation.enterJournal(tab)
            _state.update { it.copy(route = null, reviewingDraft = false, error = null) }
        }
        (navigation.navigationHandler ?: navigationHandler)?.invoke(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Tab, action) ?: action()
    }
    fun prompt(value: String) { _state.update {it.copy(pendingQuestion=value)} }
    fun setError(message: String?) { _state.update { it.copy(error = message) } }
    fun requestPremium(feature: PremiumFeature): Boolean {
        if (hasPremium) return true
        _state.update { it.copy(premiumFeature = feature, premiumReturn = it.route) }
        go(CompanionScreen.Paywall)
        return false
    }
    fun dismissPremium() {
        val destination = state.value.premiumReturn
        _state.update { it.copy(premiumFeature = null, premiumReturn = null) }
        go(destination)
    }
    suspend fun tryDemoPremium(): Boolean {
        if (!platform.premiumPreviewAllowed) { setError("Premium preview is only available in Debug builds."); return false }
        if (!saveSession(state.value.session.copy(premium = true))) return false
        if (state.value.premiumFeature != null) dismissPremium()
        else go(CompanionScreen.PremiumReady)
        return true
    }
    suspend fun purchasePremium(plan: PremiumPlan): Boolean {
        if (state.value.purchaseBusy) return false
        val billing = purchases ?: run { setError("Purchases will be available after store setup."); return false }
        if (!state.value.premiumCustomer.configured || state.value.premiumCustomer.offers.none { it.plan == plan }) {
            setError("This plan isn't available from the store yet."); return false
        }
        return storeRequest { billing.perform("purchase", plan.key) }.also { success ->
            if (success && hasPremium) { if (state.value.premiumFeature != null) dismissPremium() else go(CompanionScreen.PremiumReady) }
        }
    }
    suspend fun restorePremium(): Boolean = storeRequest { purchases?.perform("restore") ?: com.dracoarts.shared.services.NativePurchaseResult("Purchases will be available after store setup.") }
    suspend fun managePremium(): Boolean = storeRequest { purchases?.perform("manage") ?: com.dracoarts.shared.services.NativePurchaseResult("No store subscription is configured yet.") }
    suspend fun refreshPremium() { if (purchases != null && !state.value.purchaseBusy) storeRequest { purchases.perform("refresh") } }
    private suspend fun storeRequest(action: suspend () -> com.dracoarts.shared.services.NativePurchaseResult): Boolean {
        if (state.value.purchaseBusy) return false
        _state.update { it.copy(purchaseBusy = true, error = null) }
        return try {
            val result = action()
            if (result.error != null) setError(result.error)
            !result.cancelled && result.error == null
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { setError("Couldn't finish the store request. Try again."); false }
        finally { _state.update { it.copy(purchaseBusy = false) } }
    }
    suspend fun signIn(provider: String, email: String = ""): Boolean = authOperation {
        authenticationOrThrow().perform(if (provider == "Email") "completeEmail" else "signIn", provider, email.trim())
        syncIdentity()
        check(state.value.session.signedIn) { "Sign-in did not finish. Try again." }
    }
    suspend fun sendEmailLink(email: String): Boolean {
        if (!Regex("[^\\s@]+@[^\\s@]+\\.[^\\s@]+").matches(email.trim())) { setError("Enter a valid email address."); return false }
        return authOperation {
            authenticationOrThrow().perform("sendEmail", "Email", email.trim())
            go(CompanionScreen.CheckEmail)
        }
    }
    suspend fun signInEmail(email: String, password: String, createAccount: Boolean = false): Boolean {
        if (!validEmail(email)) { setError("Enter a valid email address."); return false }
        if (password.isEmpty()) { setError("Enter your password."); return false }
        if (createAccount && password.length < 6) { setError("Use at least 6 characters for your password."); return false }
        return authOperation {
            authenticationOrThrow().perform(if (createAccount) "createEmailAccount" else "signInEmail", "Email", email.trim(), password)
            syncIdentity()
            check(state.value.session.signedIn) { "Sign-in did not finish. Try again." }
        }
    }
    suspend fun resetPassword(email: String): Boolean {
        if (!validEmail(email)) { setError("Enter your email address first."); return false }
        return authOperation { authenticationOrThrow().perform("resetPassword", "Email", email.trim()) }
    }
    private fun validEmail(email: String) = email.trim().length <= 254 && Regex("[^\\s@]+@[^\\s@]+\\.[^\\s@]+").matches(email.trim())
    private fun authenticationOrThrow() = authentication ?: throw AuthenticationException("Real sign-in is unavailable in this host. Your journal still works.")
    private fun syncIdentity() {
        val user = authentication?.snapshot?.value?.user
        _state.update { it.copy(session = it.session.copy(signedIn = user != null, provider = user?.provider.orEmpty(), email = user?.email.orEmpty())) }
    }
    /** The legacy document retains only the explicitly labelled demo Premium setting. */
    suspend fun saveSession(session: DemoSession): Boolean = operation {
        documents.writeDocument("companion-session", json.encodeToString(DemoSession(premium = session.premium)))
        _state.update { it.copy(session = it.session.copy(premium = session.premium)) }
    }
    suspend fun signOut() { authOperation {
        replyJob?.cancelAndJoin()
        authenticationOrThrow().perform("signOut")
        syncIdentity(); go(CompanionScreen.Login)
    } }
    suspend fun deleteAccount(): Boolean = authOperation {
        replyJob?.cancelAndJoin()
        if (!accountCleanupPending || authentication?.snapshot?.value?.user != null) {
            authenticationOrThrow().perform("delete")
            accountCleanupPending = true
        }
        syncIdentity()
        // Cloud identity must be deleted successfully before local conversations are removed.
        documents.removeDocuments("companion-chat-"); documents.removeDocuments("companion-session")
        accountCleanupPending = false
        _state.update { it.copy(session = DemoSession(), workspace = CompanionWorkspace(), route = CompanionScreen.Login) }
    }
    private suspend fun authOperation(block: suspend () -> Unit): Boolean {
        if (!authLock.tryLock()) return false
        _state.update { it.copy(authBusy = true, error = null) }
        return try { block(); true }
        catch (cancelled: CancellationException) { if (!currentCoroutineContext().isActive) throw cancelled; false }
        catch (cause: AuthenticationException) { setError(cause.message); false }
        catch (_: Exception) { setError(if (accountCleanupPending) "Your Firebase account was deleted. Clearing saved conversations on this phone failed. Retry to finish; your journal stays." else "Couldn't finish the account change. Try again. Your journal stays here."); false }
        finally { _state.update { it.copy(authBusy = false) }; authLock.unlock() }
    }
    fun showSources(messageId: String) {
        if (state.value.workspace.thread?.messages?.any { it.id == messageId && it.assistant } != true) return
        _state.update { it.copy(sourceMessageId = messageId) }
        go(CompanionScreen.ChatSource, com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push)
    }
    fun openSourceRecord(navigation: com.dracoarts.shared.presentation.navigation.AppState, catId: String, eventId: String) {
        if (catId != state.value.dogId) return
        val action = { navigation.openJournalRecord(catId, eventId); _state.update { it.copy(route = null, error = null) }; Unit }
        navigationHandler?.invoke(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push, action) ?: action()
    }
    fun beginEdit(dog: Dog) {
        originalDog = dog
        _state.update { it.copy(draft = CompanionDraft(platform.newId(), dog.name, dog.details.sex, dog.details.photoId, dog.details.companion, "next-context-review", dog.id), route = CompanionScreen.ContextReview) }
    }
    suspend fun commitDog(): Dog? {
        if (state.value.draft.addingDog && !requestPremium(PremiumFeature.AdditionalDog)) return null
        if (!profileLock.tryLock()) return null
        _state.update { it.copy(profileSaving = true) }
        try {
        draftJob?.cancelAndJoin()
        var result: Dog? = null
        val saved = operation {
            val draft = state.value.draft; draft.context.validate()
            require(draft.name.trim().length in 1..80 && draft.name.none(Char::isISOControl)) { "Enter a cat name from 1 to 80 characters." }
            if (draft.context.birthday.isNotBlank()) require(kotlinx.datetime.LocalDate.parse(draft.context.birthday) <= com.dracoarts.shared.presentation.state.JournalDates.day(platform.nowMillis(), platform.timeZone())) { "Birthday can’t be in the future." }
            val old = if (draft.editingDogId != null) originalDog ?: journal.observeDogs().first().firstOrNull { it.id == draft.editingDogId } ?: kotlin.error("This cat no longer exists.") else null
            val details = (old?.details ?: DogDetails()).copy(breed = draft.context.breeds.joinToString(" × ").take(100), age = draft.context.ageLabel().take(60), sex = draft.sex, photoId = draft.photoId, companion = draft.context)
            result = if (draft.editingDogId != null) {
                care.updateDog(old!!, draft.name.trim(), details)
            } else journal.addDog(draft.name.trim(), details, draft.requestId)
            documents.removeDocuments(if (draft.addingDog) ADD_DOG_DRAFT else "companion-setup"); originalDog = null
        }
        if (!saved) return null
        result?.let { dog -> reconcileCheckIns(dog, care, platform)?.let(::setError) }
        return result
        } finally { _state.update { it.copy(profileSaving = false) }; profileLock.unlock() }
    }
    suspend fun updateWorkspace(consumeComposer: Boolean = false, change: (CompanionWorkspace) -> CompanionWorkspace): Boolean = operation {
        lock.withLock {
            check(!state.value.conversationsFailed) { "Reopen saved conversations before changing them." }
            val id = state.value.dogId ?: kotlin.error("Open a cat journal first.")
            val next = change(state.value.workspace)
            documents.writeDocument("companion-chat-$id", json.encodeToString(next), id, if (consumeComposer) "chat-composer-v1" else null)
            if (consumeComposer) composerRevision++
            _state.update { it.copy(workspace = next, composer = if (consumeComposer) ChatComposerDraft() else it.composer, pendingQuestion = if (consumeComposer) null else it.pendingQuestion) }
        }
    }
    suspend fun newThread(): Boolean { replyJob?.cancelAndJoin(); return updateWorkspace { it.copy(currentThread = null) } }
    suspend fun openThread(id: String) { replyJob?.cancelAndJoin(); if (updateWorkspace { it.copy(currentThread = id) }) go(if (hasPremium) CompanionScreen.Chat else CompanionScreen.ThreadReadonly) }
    suspend fun deleteThread(id: String): Boolean {
        if (state.value.workspace.currentThread == id) replyJob?.cancelAndJoin()
        return updateWorkspace { it.copy(threads = it.threads.filterNot { t -> t.id == id }, currentThread = it.currentThread.takeUnless { selected -> selected == id }) }
    }
    fun send(question: String, dog: Dog, events: List<CareEvent>, regenerate: Boolean = false, includeComposer: Boolean = true, captionPhotoId: String? = null) {
        val input = question.trim().ifBlank { if (!regenerate && state.value.composer.photoIds.isNotEmpty()) "Photos to discuss with my vet." else "" }; if (input.isBlank() || input.length > 4000 || state.value.busy || state.value.streaming != null || replyJob?.isActive == true) return
        if (!hasPremium) { go(CompanionScreen.AiGate); return }
        if (requiresAiConsent) { go(CompanionScreen.AiPrivacy); return }
        if (state.value.dogId != dog.id) return
        _state.update { it.copy(busy = true) }
        replyJob = scope.launch {
          try {
            val workspace = state.value.workspace
            val previous = workspace.thread
            val cut = if(regenerate) previous?.messages?.indexOfLast { !it.assistant } ?: -1 else -1
            val thread = if(cut >= 0) previous!!.copy(messages = previous.messages.take(cut)) else previous ?: CompanionThread(platform.newId(), input.take(80))
            if (thread.messages.size >= 80) { _state.update { it.copy(busy = false) }; go(CompanionScreen.ChatLimit); return@launch }
            val noSources = captionPhotoId != null || Regex("chocolate|poison|toxic|collaps|breath|seizure|overdose|emergency|dose|diagnos|prescri|medicine|cure",RegexOption.IGNORE_CASE).containsMatchIn(input)
            val weeklyContext = if (workspace.weeklyAllowed && captionPhotoId == null && aiSafetyReply(input) == null) prepareWeeklyContext(journal, dog.id, input, platform.nowMillis(), platform.timeZone()) else null
            val profile = weeklyContext?.profile ?: if (workspace.profileConsent && !noSources) ProfileSnapshot(dog.name, dog.details.sex, dog.details.companion, dog.details.breed, dog.details.age, dog.details.notes) else null
            val records = weeklyContext?.records ?: if (workspace.recordConsent && !noSources) events.filter { it.dogId == dog.id && it.id in workspace.selectedRecords }.take(50).map(::sourceRecord) else emptyList()
            val photos = if (captionPhotoId != null) listOf(captionPhotoId) else if (regenerate) previous?.messages?.lastOrNull { !it.assistant }?.photoIds.orEmpty() else if (includeComposer) state.value.composer.photoIds else emptyList()
            val user = CompanionMessage(platform.newId(), input, false, platform.nowMillis(), photoIds = photos, captionRequest = captionPhotoId != null)
            if (!updateWorkspace(consumeComposer = !regenerate && includeComposer) { it.copy(currentThread = thread.id, threads = it.threads.filterNot { old -> old.id == thread.id } + thread.copy(messages = thread.messages + user)) }) { _state.update { it.copy(busy = false) }; return@launch }
            var text = ""; var source = "demo"; var stopped = false; var failure: String? = null
            var localProfile: ProfileSnapshot? = null
            var localRecords = emptyList<SourceRecord>()
            var retrieved: RetrievedDogContext? = null
            _state.update { it.copy(busy = false, streaming = "") }
            try {
                if (!demoResponses && !atlasOnly && captionPhotoId == null && !ChatHealth.urgent(input) && !ChatHealth.treatment(input) && !ChatHealth.medication(input)) {
                    retrieved = DogContextRetriever(journal).retrieve(dog, input, platform.nowMillis(), platform.timeZone())
                    localProfile = retrieved.profile
                    localRecords = retrieved.records
                }
                responder.response(CompanionAiRequest(input, profile, records, workspace.cloudConsent, thread.messages, captionPhotoId,
                    if (demoResponses) profile else localProfile, if (demoResponses) records else localRecords, platform.nowMillis(), platform.timeZone().id, retrieved?.scope, retrieved?.readings, weeklyContext?.weekly))
                    .collect { reply -> text = reply.text; source = reply.source; _state.update { state -> state.copy(streaming = reply.text) } }
            }
            catch (cancelled: CancellationException) { stopped = true }
            catch (cause: com.dracoarts.shared.services.ai.AiException) { failure = cause.message; text = "" }
            catch (_: Exception) { failure = "Couldn't create the reply. Your message is saved; try again."; text = "" }
            withContext(NonCancellable) {
                val usesContext = !stopped && source in setOf("local", "journal", "atlas", "demo")
                val usedProfile = if (source in setOf("local", "journal")) localProfile else profile
                val usedRecords = if (source in setOf("local", "journal")) localRecords else records
                if (text.isNotBlank() && state.value.dogId == dog.id) updateWorkspace { current -> current.copy(threads = current.threads.map { t -> if (t.id == thread.id) t.copy(messages = t.messages + CompanionMessage(platform.newId(), text, true, platform.nowMillis(), stopped, if (usesContext) usedProfile else null, if (usesContext) usedRecords else emptyList(), responseSource = source, readings = if (usesContext && source in setOf("local", "journal")) retrieved?.readings else null, weekly = if (usesContext) weeklyContext?.weekly else null)) else t }) }
                _state.update { it.copy(streaming = null, error = failure ?: it.error) }
            }
          } catch (cancelled: CancellationException) { throw cancelled }
          catch (_: Exception) { setError("Couldn’t read this cat’s weekly context. Your draft is kept; try again.") }
          finally { _state.update { it.copy(busy = false) } }
        }
    }
    fun composerText(value: String) {
        if (state.value.busy || state.value.conversationsFailed) return
        val dog = state.value.dogId ?: return
        val revision = ++composerRevision
        // One source of truth for the field; disk latency never delays typing.
        _state.update { it.copy(composer = it.composer.copy(text = value.take(4000)), pendingQuestion = null) }
        scope.launch {
            operation {
                lock.withLock {
                    // A queued keystroke must not restore a draft consumed by Send.
                    if (state.value.dogId != dog || composerRevision != revision) return@withLock
                    val draft = state.value.composer
                    care.saveDraft(dog, "chat-composer-v1", LocalDraft(json.encodeToString(draft), draft.photoIds))
                }
            }
        }
    }
    private suspend fun saveComposer(expectedDog: String? = state.value.dogId, change: (ChatComposerDraft) -> ChatComposerDraft): Boolean = operation {
        lock.withLock {
            val id = state.value.dogId ?: error("Open your cat first.")
            check(id == expectedDog && !state.value.conversationsFailed) { "Reopen this cat’s chat before changing its draft." }
            val next = change(state.value.composer)
            require(next.text.length <= 4000 && next.photoIds.size <= 3 && next.photoIds.all { LocalAttachmentRules.image.matches(it) }) { "Choose up to three photos." }
            care.saveDraft(id, "chat-composer-v1", LocalDraft(json.encodeToString(next), next.photoIds))
            _state.update { it.copy(composer = it.composer.copy(photoIds = next.photoIds)) }
        }
    }
    suspend fun attachChatPhoto(camera: Boolean = false) {
        val dogId = state.value.dogId ?: return
        if (state.value.busy || state.value.composer.photoIds.size >= 3 || state.value.streaming != null) return
        _state.update { it.copy(busy = true) }
        var retained: String? = null
        try {
            when (val result = if (camera) platform.device.takePhoto() else platform.device.pickPhoto()) {
                is com.dracoarts.shared.services.DeviceResult.Success -> { retained = result.value; if (state.value.dogId == dogId) saveComposer { it.copy(photoIds = it.photoIds + result.value) } }
                com.dracoarts.shared.services.DeviceResult.Cancelled -> Unit
                com.dracoarts.shared.services.DeviceResult.Denied -> setError("Photo access wasn't available. You can keep chatting without a photo.")
                is com.dracoarts.shared.services.DeviceResult.Failed -> setError(result.message)
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { setError("Couldn't add that photo. Your message and saved attachments stay here.") }
        finally {
            withContext(NonCancellable) { retained?.let { id -> runCatching { if (!care.photoReferenced(id)) platform.device.removePhoto(id) } } }
            _state.update { it.copy(busy = false) }
        }
    }
    fun removeChatPhoto(id: String) { if (state.value.busy || state.value.streaming != null) return; val dog = state.value.dogId; scope.launch { saveComposer(dog) { it.copy(photoIds = it.photoIds - id) } } }
    fun regenerate(dog: Dog, events: List<CareEvent>) {
        val previous = state.value.workspace.thread?.messages?.lastOrNull { !it.assistant } ?: return
        send(previous.text, dog, events, regenerate = true, captionPhotoId = previous.takeIf { it.captionRequest }?.photoIds?.firstOrNull())
    }
    suspend fun reloadConversations() { val id=state.value.dogId ?: return;_state.update {it.copy(dogId=null)};activateDog(id) }
    fun stopReply() { replyJob?.cancel() }
    private suspend fun operation(block: suspend () -> Unit): Boolean = try { block(); _state.update { it.copy(error = null) }; true }
    catch (cancelled: CancellationException) { throw cancelled }
    catch (cause: IllegalArgumentException) { setError(cause.message ?: "Check the details and try again."); false }
    catch (_: Exception) { setError("Couldn't save locally. Your details are still here. Try again."); false }
    companion object {
        private const val ADD_DOG_DRAFT = "companion-add-dog"
        val catSetupIds = listOf("next-dog", "cat-life", "next-stage", "next-breed", "next-size", "next-care-notes", "next-goals", "next-permissions", "next-context-review")
        // Retain readable routes for unfinished inherited setup/profile documents.
        val legacySetupIds = listOf("next-age", "next-sex", "next-experience", "next-rhythm", "next-focus", "next-personality", "next-activities", "next-food", "next-reminder", "next-practice", "next-ai-demo")
        val dogSetupIds = catSetupIds + legacySetupIds
        val onboardingIds = listOf("next-opening") + catSetupIds + legacySetupIds
    }
}
