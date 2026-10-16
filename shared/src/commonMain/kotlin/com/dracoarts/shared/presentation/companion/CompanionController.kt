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

/** SQLite owns durable dog context, setup drafts and local demo conversations. */
class CompanionController(private val documents: LocalDocumentRepository, private val journal: JournalRepository, private val care: CareRepository, private val platform: AppPlatform, private val responder: CompanionResponseProvider = DemoResponseProvider(), dispatcher: CoroutineDispatcher = Dispatchers.Main) {
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private val json = Json { ignoreUnknownKeys = true }
    private val lock = Mutex()
    private val _state = MutableStateFlow(CompanionState())
    val state = _state.asStateFlow()
    private var draftJob: Job? = null
    private var replyJob: Job? = null
    private var originalDog: Dog? = null
    private var initialized = false
    var navigationHandler: com.dracoarts.shared.presentation.navigation.BoardNavigationHandler? = null
    suspend fun close() { scope.coroutineContext[Job]?.cancelAndJoin() }
    suspend fun load(dog: Dog?, review: CompanionScreen? = null) {
        try {
            val session = documents.readDocument("companion-session")?.let { json.decodeFromString<DemoSession>(it) } ?: DemoSession()
            val draft = documents.readDocument("companion-setup")?.let { json.decodeFromString<CompanionDraft>(it) } ?: CompanionDraft(platform.newId(), name = dog?.name.orEmpty(), sex = dog?.details?.sex ?: "Not recorded", photoId = dog?.details?.photoId, context = dog?.details?.companion ?: DogContext())
            _state.value = CompanionState(loading = false, session = session, draft = draft, route = review ?: if (dog == null) CompanionScreen.fromBoard(draft.step) ?: CompanionScreen.Opening else null)
            initialized = true
            if (dog != null) activateDog(dog.id)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.value = _state.value.copy(loading = false, loadFailed = true, error = "Couldn't read your saved setup. Retry before making changes.") }
    }
    suspend fun activateDog(id: String) {
        if (!initialized || id == state.value.dogId) return
        replyJob?.cancelAndJoin()
        try {
            val workspace = documents.readDocument("companion-chat-$id")?.let { json.decodeFromString<CompanionWorkspace>(it) } ?: CompanionWorkspace()
            _state.update { it.copy(dogId = id, workspace = workspace, conversationsFailed = false, streaming = null, error = null) }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.update { it.copy(dogId = id, workspace = CompanionWorkspace(), conversationsFailed = true, error = "Couldn't open this dog’s conversations. Your journal is still available.") } }
    }
    fun editDraft(change: (CompanionDraft) -> CompanionDraft) {
        _state.update { it.copy(draft = change(it.draft), error = null) }
        draftJob?.cancel(); draftJob = scope.launch { delay(300); persistDraft() }
    }
    private suspend fun persistDraft(): Boolean = operation { documents.writeDocument("companion-setup", json.encodeToString(state.value.draft)) }
    suspend fun continueTo(screen: CompanionScreen): Boolean {
        draftJob?.cancelAndJoin()
        _state.update { it.copy(draft = it.draft.copy(step = screen.boardId)) }
        if (!persistDraft()) return false
        go(screen); return true
    }
    fun go(screen: CompanionScreen?) {
        val action = { _state.update { it.copy(route = screen, error = null, draft = if (screen?.boardId in onboardingIds) it.draft.copy(step = screen!!.boardId) else it.draft) } }
        val back = screen == null || (screen.ordinal < (state.value.route?.ordinal ?: 0))
        navigationHandler?.invoke(if(back) com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Back else com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Push, action) ?: action()
    }
    fun prompt(value: String) { _state.update {it.copy(pendingQuestion=value)} }
    fun setError(message: String?) { _state.update { it.copy(error = message) } }
    suspend fun signIn(provider: String, email: String = ""): Boolean {
        if (provider == "Email" && !Regex("[^\\s@]+@[^\\s@]+\\.[^\\s@]+").matches(email.trim())) { setError("Enter a valid email address."); return false }
        val session = state.value.session.copy(signedIn = true, provider = provider, email = if (provider == "Email") email.trim() else "Local demo account")
        return saveSession(session)
    }
    suspend fun saveSession(session: DemoSession): Boolean = operation { documents.writeDocument("companion-session", json.encodeToString(session)); _state.update { it.copy(session = session) } }
    suspend fun signOut() { replyJob?.cancelAndJoin(); if (saveSession(state.value.session.copy(signedIn = false))) go(CompanionScreen.Login) }
    suspend fun deleteAccount(): Boolean = operation {
        replyJob?.cancelAndJoin(); documents.removeDocuments("companion-chat-"); documents.removeDocuments("companion-session")
        _state.update { it.copy(session = DemoSession(), workspace = CompanionWorkspace(), route = CompanionScreen.Login) }
    }
    fun beginEdit(dog: Dog) {
        originalDog = dog
        _state.update { it.copy(draft = CompanionDraft(platform.newId(), dog.name, dog.details.sex, dog.details.photoId, dog.details.companion, "next-context-review", dog.id), route = CompanionScreen.ContextReview) }
    }
    suspend fun commitDog(): Dog? {
        draftJob?.cancelAndJoin()
        var result: Dog? = null
        operation {
            val draft = state.value.draft; draft.context.validate()
            require(draft.name.trim().length in 1..80 && draft.name.none(Char::isISOControl)) { "Enter a dog name from 1 to 80 characters." }
            if (draft.context.birthday.isNotBlank()) require(kotlinx.datetime.LocalDate.parse(draft.context.birthday) <= com.dracoarts.shared.presentation.state.JournalDates.day(platform.nowMillis(), platform.timeZone())) { "Birthday can’t be in the future." }
            val old = if (draft.editingDogId != null) originalDog ?: journal.observeDogs().first().firstOrNull { it.id == draft.editingDogId } ?: kotlin.error("This dog no longer exists.") else null
            val details = (old?.details ?: DogDetails()).copy(breed = draft.context.breeds.joinToString(" × ").take(100), age = draft.context.ageLabel().take(60), sex = draft.sex, photoId = draft.photoId, companion = draft.context)
            result = if (draft.editingDogId != null) {
                care.updateDog(old!!, draft.name.trim(), details)
            } else journal.addDog(draft.name.trim(), details, draft.requestId)
            documents.removeDocuments("companion-setup"); originalDog = null
        }
        result?.let { dog -> reconcileCheckIns(dog, care, platform)?.let(::setError) }
        return result
    }
    suspend fun updateWorkspace(change: (CompanionWorkspace) -> CompanionWorkspace): Boolean = operation {
        lock.withLock {
            check(!state.value.conversationsFailed) { "Reopen saved conversations before changing them." }
            val id = state.value.dogId ?: kotlin.error("Open a dog journal first.")
            val next = change(state.value.workspace)
            documents.writeDocument("companion-chat-$id", json.encodeToString(next), id)
            _state.update { it.copy(workspace = next) }
        }
    }
    suspend fun newThread(): Boolean { replyJob?.cancelAndJoin(); return updateWorkspace { it.copy(currentThread = null) } }
    suspend fun openThread(id: String) { replyJob?.cancelAndJoin(); if (updateWorkspace { it.copy(currentThread = id) }) go(if (state.value.session.premium) CompanionScreen.Chat else CompanionScreen.ThreadReadonly) }
    suspend fun deleteThread(id: String): Boolean {
        if (state.value.workspace.currentThread == id) replyJob?.cancelAndJoin()
        return updateWorkspace { it.copy(threads = it.threads.filterNot { t -> t.id == id }, currentThread = it.currentThread.takeUnless { selected -> selected == id }) }
    }
    fun send(question: String, dog: Dog, events: List<CareEvent>, regenerate: Boolean = false) {
        val input = question.trim(); if (input.isBlank() || input.length > 4000 || state.value.streaming != null || replyJob?.isActive == true) return
        if (!state.value.session.premium) { go(CompanionScreen.AiGate); return }
        if (!state.value.workspace.messageConsent) { go(CompanionScreen.AiPrivacy); return }
        if (state.value.dogId != dog.id) return
        _state.update {it.copy(pendingQuestion=null)}
        replyJob = scope.launch {
            val workspace = state.value.workspace
            val previous = workspace.thread
            val cut = if(regenerate) previous?.messages?.indexOfLast { !it.assistant } ?: -1 else -1
            val thread = if(cut >= 0) previous!!.copy(messages = previous.messages.take(cut)) else previous ?: CompanionThread(platform.newId(), input.take(80))
            if (thread.messages.size >= 80) { go(CompanionScreen.ChatLimit); return@launch }
            val noSources = Regex("chocolate|poison|toxic|collaps|breath|seizure|overdose|emergency|dose|diagnos|prescri|medicine|cure|caption|memory",RegexOption.IGNORE_CASE).containsMatchIn(input)
            val profile = if (workspace.profileConsent && !noSources) ProfileSnapshot(dog.name, dog.details.sex, dog.details.companion) else null
            val records = if (workspace.recordConsent && !noSources) events.filter { it.dogId == dog.id && it.id in workspace.selectedRecords }.take(50).map { SourceRecord(it.id, it.dogId, it.type.label, it.occurredAtMillis, it.note.orEmpty()) } else emptyList()
            val user = CompanionMessage(platform.newId(), input, false, platform.nowMillis())
            if (!updateWorkspace { it.copy(currentThread = thread.id, threads = it.threads.filterNot { old -> old.id == thread.id } + thread.copy(messages = thread.messages + user)) }) return@launch
            var text = ""; var stopped = false; var failed = false
            _state.update { it.copy(streaming = "", submittedId = user.id, submittedQuestion = input) }
            try { responder.response(input, profile, records).collect { text = it; _state.update { state -> state.copy(streaming = it) } } }
            catch (cancelled: CancellationException) { stopped = true }
            catch (_: Exception) { failed = true; text = "" }
            withContext(NonCancellable) {
                if (text.isNotBlank() && state.value.dogId == dog.id) updateWorkspace { current -> current.copy(threads = current.threads.map { t -> if (t.id == thread.id) t.copy(messages = t.messages + CompanionMessage(platform.newId(), text, true, platform.nowMillis(), stopped, if (stopped) null else profile, if (stopped) emptyList() else records)) else t }) }
                _state.update { it.copy(streaming = null, error = if(failed) "Couldn't create the demo reply. Your message is saved; try again." else it.error) }
            }
        }
    }
    fun regenerate(dog: Dog, events: List<CareEvent>) {
        val question = state.value.workspace.thread?.messages?.lastOrNull { !it.assistant }?.text ?: return
        send(question, dog, events, regenerate = true)
    }
    suspend fun reloadConversations() { val id=state.value.dogId ?: return;_state.update {it.copy(dogId=null)};activateDog(id) }
    fun stopReply() { replyJob?.cancel() }
    private suspend fun operation(block: suspend () -> Unit): Boolean = try { block(); _state.update { it.copy(error = null) }; true }
    catch (cancelled: CancellationException) { throw cancelled }
    catch (cause: IllegalArgumentException) { setError(cause.message ?: "Check the details and try again."); false }
    catch (_: Exception) { setError("Couldn't save locally. Your details are still here. Try again."); false }
    companion object {
        val onboardingIds = listOf("next-opening", "next-dog", "next-stage", "next-age", "next-breed", "next-sex", "next-size", "next-experience", "next-goals", "next-rhythm", "next-focus", "next-personality", "next-activities", "next-food", "next-care-notes", "next-reminder", "next-permissions", "next-context-review", "next-practice", "next-ai-demo")
    }
}
