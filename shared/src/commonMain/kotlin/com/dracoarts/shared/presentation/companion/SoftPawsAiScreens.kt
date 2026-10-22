package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.screens.SoftPawsFact
import com.dracoarts.shared.presentation.theme.AppSpacing
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

internal val softPawsAiScreens = setOf(CompanionScreen.AiGate, CompanionScreen.AiPrivacy,
    CompanionScreen.ChatSource, CompanionScreen.ChatUnavailable)

@Composable
internal fun SoftPawsAiScreen(route: CompanionScreen, controller: CompanionController,
    journal: JournalState, repository: JournalRepository, platform: AppPlatform,
    navigation: AppState, applySafeInsets: Boolean, onBack: () -> Unit) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    val cat = journal.selectedDog
    val name = cat?.name ?: "your cat"
    var agree by remember(cat?.id, state.workspace.weeklyAllowed) { mutableStateOf(state.workspace.weeklyAllowed) }
    var sourceError by remember(route, cat?.id) { mutableStateOf<String?>(null) }
    val scroll = rememberScrollState()
    LaunchedEffect(route) { scroll.scrollTo(0) }
    fun free() { if (cat != null) controller.enterJournal(navigation) else controller.go(CompanionScreen.Dog) }
    Column(Modifier.fillMaxSize().then(if (applySafeInsets) Modifier.windowInsetsPadding(WindowInsets.safeDrawing) else Modifier)) {
        Column(Modifier.widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth().weight(1f).align(Alignment.CenterHorizontally)
            .verticalScroll(scroll).padding(horizontal = AppSpacing.page, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                AccountBack(onBack, !state.busy); Spacer(Modifier.weight(1f)); SoftPawsKicker("CAT CARE")
            }
            when (route) {
                CompanionScreen.AiGate -> {
                    SoftPawsHeading("A question about $name?", "Soft Paws AI · Premium", "$name?")
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(184.dp, 200.dp)) }
                    SoftPawsCard("A little context") {
                        SoftPawsFact("General cat-care education", "Answers organised into readable cards", "message-square-text")
                        SoftPawsFact("Your cat’s recent context", "Profile + the past seven calendar days", "notebook-pen")
                    }
                    CaptionText("An account, explicit cloud consent and a configured service are needed. Your journal works without them.")
                    BoardStickyAction {
                        BarkButton("See how context works", { controller.go(CompanionScreen.AiPrivacy, BoardNavigationMove.Push) })
                        BarkButton("View Premium", { controller.go(CompanionScreen.Paywall, BoardNavigationMove.Push) }, secondary = true)
                        BarkTextAction("Keep using the journal", ::free)
                    }
                }
                CompanionScreen.AiPrivacy -> {
                    SoftPawsHeading("You choose the context.", "Before a question goes to Soft Paws AI.", "the context.")
                    SoftPawsCard("What is shared", "accent-soft") {
                        SoftPawsFact("The current cat’s profile", "Name and saved profile details", "heart")
                        SoftPawsFact("The past seven calendar days", "Bounded recent observations and exact counts", "calendar")
                    }
                    SoftPawsCard("What stays out") { SupportingText("Other cats, older journal entries, photos, documents and contacts are not automatically included.") }
                    CaptionText("Consent is specific to this cat and scope. You can turn it off later. AI cannot assess health, diagnose or prescribe.")
                    if (controller.demoResponses) CaptionText("Design review · demo replies. No messages or records leave this phone.")
                    CCheck("I agree to online AI processing of my messages, $name’s profile and the past seven calendar days of care records.", agree, enabled = !state.busy) { agree = it }
                    BoardStickyAction {
                        state.error?.let { ErrorCard(it) }
                        BarkButton(if (controller.demoResponses) "Continue to demo chat" else "Keep context choice", { scope.launch {
                            if (controller.updateAiContext { it.copy(messageConsent = true, profileConsent = true, recordConsent = true,
                                cloudConsent = true, week = true, selectedRecords = emptyList(), weeklyConsentVersion = 1) }) controller.completeAiConsent()
                        } }, enabled = agree && !state.busy && cat != null)
                        BarkTextAction(if (state.workspace.weeklyAllowed) "Turn off Soft Paws AI" else "Keep using the journal", { scope.launch {
                            if (controller.updateAiContext { it.copy(messageConsent = false, profileConsent = false, recordConsent = false,
                                cloudConsent = false, weeklyConsentVersion = 0) }) free()
                        } }, enabled = !state.busy)
                    }
                }
                CompanionScreen.ChatSource -> {
                    SoftPawsHeading("Where that detail came from.", "Recorded facts, separate from the answer.", "detail came from.")
                    val message = state.workspace.thread?.messages?.let { messages ->
                        if (state.sourceMessageId != null) messages.firstOrNull { it.id == state.sourceMessageId && it.assistant }
                        else messages.lastOrNull { it.assistant }
                    }
                    val records = message?.records.orEmpty().filter { it.dogId == cat?.id }
                    if (message?.responseSource == "demo") CaptionText("Demo answer · excerpts from this separate QA journal.")
                    if (records.isEmpty()) SoftPawsCard("No saved source excerpt") { SupportingText("This answer has no saved record excerpt to open. The answer is not a care observation.") }
                    records.forEach { record -> SoftPawsCard(record.type) {
                        CaptionText("$name · ${JournalDates.dateAndTime(record.at, platform.timeZone())}")
                        Text(record.note.ifBlank { "No extra note recorded." }, style = MaterialTheme.typography.bodyMedium)
                        CaptionText("Captured caregiver observation · later edits may differ")
                    } }
                    message?.profile?.let { profile -> SoftPawsCard("Profile used for this answer") {
                        profileFacts(profile).forEach { (label, value) -> SoftPawsFact(label, boundedProfileFact(value), "heart") }
                    } }
                    SoftPawsCard("Scope of this answer") {
                        SupportingText(if (message?.weekly != null) "Current cat only. The past seven calendar days at the time of the answer. Counts are derived from saved records, not model guesses."
                            else "These are the captured sources for this answer, not a new reading of your whole journal.")
                    }
                    BoardStickyAction {
                        sourceError?.let { ErrorCard(it) }
                        BarkButton("Open journal record", { scope.launch {
                            val record = records.firstOrNull() ?: return@launch
                            try {
                                val current = repository.observeEvent(record.dogId, record.id).first()
                                if (current == null || current.dogId != cat?.id) sourceError = "The original record is no longer available. This captured excerpt stays with the answer."
                                else controller.openSourceRecord(navigation, current.dogId, current.id)
                            } catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled }
                            catch (_: Exception) { sourceError = "Couldn't open the original record. The captured excerpt is still here." }
                        } }, enabled = records.isNotEmpty())
                        BarkTextAction("Back to chat", { controller.go(CompanionScreen.Chat, BoardNavigationMove.Back) })
                    }
                }
                CompanionScreen.ChatUnavailable -> {
                    SoftPawsHeading("Your question can wait here.", if (controller.demoResponses) "Design review · real service connection unavailable." else if (!controller.authenticationConfigured) "Sign-in setup is pending." else "The AI request could not finish.", "wait here.")
                    SoftPawsCard("Your question") {
                        Text((state.pendingQuestion ?: state.composer.text).ifBlank { state.workspace.thread?.messages?.lastOrNull { !it.assistant }?.text ?: "Your next question can stay as a draft." }, style = MaterialTheme.typography.bodyMedium)
                    }
                    CaptionText("Your local journal and saved contacts remain available. Returning to chat does not send or retry a request.")
                    state.error?.let { ErrorCard(it) }
                    BoardStickyAction {
                        BarkButton("Back to chat", { controller.go(CompanionScreen.Chat, BoardNavigationMove.Back) })
                        BarkButton("Saved contacts · free", { controller.openJournalTool(navigation, Feature.Emergency) }, secondary = true)
                    }
                }
                else -> Unit
            }
        }
    }
}
