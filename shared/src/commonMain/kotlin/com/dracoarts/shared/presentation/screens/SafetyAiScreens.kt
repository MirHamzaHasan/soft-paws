package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.Feature
import com.dracoarts.shared.domain.model.SafetyReference
import com.dracoarts.shared.services.ai.AiException
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.*

@Composable
internal fun PremiumSafetyGate(context: FeatureContext, feature: PremiumFeature): Boolean {
    val controller = context.companion
    val state = controller?.state?.collectAsState()?.value
    if (state?.premiumAccess == true) return false
    SoftPawsCard("Soft Paws Premium") { SupportingText(feature.description) }
    BarkButton("See Premium", { controller?.requestPremium(feature) }, enabled = controller != null, icon = "sparkles")
    CaptionText("Emergency contacts and your saved journals stay free.")
    return true
}

private val catEducationGroups = listOf(
    Triple("household", "Plants & household products", "Bring exact product names to your vet"),
    Triple("storage", "Food & medication storage", "Keep veterinary instructions close"),
    Triple("routines", "Indoor & outdoor routines", "Use your cat's recorded lifestyle"),
)

@Composable
internal fun SafetyAiScreen(context: FeatureContext, toxicity: Boolean, initialTopic: String) {
    val dog = context.dog
    val controller = context.companion
    val state = controller?.state?.collectAsState()?.value
    val premiumFeature = if (toxicity) PremiumFeature.Toxicity else PremiumFeature.SafetyTopics
    if (!toxicity && initialTopic.isBlank()) {
        SoftPawsHeading("Read with ${dog.name} in mind.", "Premium · educational topic suggestions", "${dog.name} in mind.")
        SoftPawsList {
            catEducationGroups.forEachIndexed { index, (key, title, subtitle) ->
                SoftPawsRow(title, subtitle, listOf("shield-check", "archive", "house")[index]) { context.open(Feature.FirstAid, key) }
                if (index < catEducationGroups.lastIndex) HorizontalDivider(color = boardColor("hair"))
            }
        }
        CaptionText("No personalised safety assessment has run. Topic explanations do not diagnose or decide that an exposure is safe.")
        BoardStickyAction {
            BarkButton(if (state?.premiumAccess == true) "Review AI context" else "View Premium access", {
                if (state?.premiumAccess == true) controller?.requestSafetyConsent() else controller?.requestPremium(premiumFeature)
            }, enabled = controller != null)
            BarkTextAction("Saved contacts · free", { context.open(Feature.Emergency) })
        }
        return
    }
    val scope = rememberCoroutineScope()
    var query by rememberSaveable(dog.id, initialTopic) { mutableStateOf(if (toxicity) initialTopic else "") }
    var notes by rememberSaveable(dog.id, initialTopic) { mutableStateOf("") }
    var exploring by rememberSaveable(dog.id, initialTopic) { mutableStateOf(false) }
    var reply by remember(dog.id, initialTopic) { mutableStateOf<CompanionReply?>(null) }
    var error by remember(dog.id, initialTopic) { mutableStateOf<String?>(null) }
    var busy by remember(dog.id, initialTopic) { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    fun cancel() { job?.cancel(); busy = false }
    DisposableEffect(dog.id, initialTopic) { onDispose { job?.cancel() } }
    LaunchedEffect(dog.id, state?.workspace?.weeklyAllowed, state?.premiumAccess, state?.session?.signedIn) { cancel(); reply = null; error = null }
    LaunchedEffect(context.platform) { context.platform.device.foreground.collect { if (!it) { cancel(); reply = null } } }
    val group = catEducationGroups.firstOrNull { it.first == initialTopic }
    val reference = SafetyReference.topics.firstOrNull { it.id == when (initialTopic) { "household" -> "lilies"; "storage" -> "medicines"; else -> initialTopic } }
    val topic = if (toxicity) query else group?.second ?: reference?.title ?: initialTopic
    if (toxicity) {
        SoftPawsHeading("A possible exposure?", "Keep details ready for a veterinary professional.", "exposure?")
        BarkField("Plant, product or substance", query, { if (it.length <= 160) { query = it; reply = null; error = null } }, Modifier.fillMaxWidth(), enabled = !busy, softPaws = true)
        BarkField("What happened, and when?", notes, { if (it.length <= 1000) { notes = it; reply = null; error = null } }, Modifier.fillMaxWidth(), enabled = !busy, multiline = true, softPaws = true)
    } else {
        SoftPawsHeading(topic, "Educational information for your veterinary questions.")
        reference?.let { item -> SoftPawsCard(item.title) {
            SupportingText(item.guidance)
            BarkTextAction("Read the veterinary source", { if (!context.platform.device.openSource(item.source)) error = "Couldn't open the source. Your saved contacts are still available." }, icon = "arrow-up-right")
        } }
    }
    SoftPawsCard("For urgent concerns", "rose") {
        SupportingText("Use your saved vet or emergency clinic contact. An AI lookup is educational and cannot confirm that an exposure is safe.")
    }
    CaptionText("AI lookup is Premium and requires separate cloud consent. Your entries stay on this screen until you explicitly ask AI.")
    if (!context.platform.atlasEnabled && controller?.demoResponses != true) CaptionText("Soft Paws AI isn't connected in this build. Your saved contacts and journal are available.")
    if (exploring) {
        val gated = PremiumSafetyGate(context, premiumFeature)
        if (!gated && controller != null && state != null) {
            when {
                !context.platform.atlasEnabled && !controller.demoResponses -> SoftPawsCard("AI isn't connected yet") { SupportingText("No request has been sent. Use your saved contacts for a concern.") }
                !state.workspace.weeklyAllowed -> SoftPawsCard("Your cat, with your permission") {
                    SupportingText("Soft Paws AI uses ${dog.name}’s saved profile and the past seven calendar days of care. Your question goes online; photos and location are excluded.")
                    BarkButton("Review AI & your records", controller::requestSafetyConsent, secondary = true)
                }
                !controller.demoResponses && !state.session.signedIn -> {
                    SoftPawsCard("Sign in for Soft Paws AI") { SupportingText("Your journal and emergency contacts work without an account.") }
                    BarkButton("Sign in", { controller.go(CompanionScreen.Login) })
                }
                else -> {
                    CaptionText(if (controller.demoResponses) "DESIGN PREVIEW · no online AI request" else "Included: ${dog.name}’s profile and seven days of recorded care. Missing logs cannot establish health or safety.")
                    BarkButton(if (busy) "Asking Soft Paws AI…" else if (reply != null || error != null) "Ask again" else "Ask Soft Paws AI", {
                        error = null; reply = null; busy = true
                        job = scope.launch {
                            try { reply = controller.safety.answer(dog.id, topic, if (toxicity) CompanionAiPurpose.ToxicityEducation else CompanionAiPurpose.SafetyEducation, if (toxicity) notes else "") }
                            catch (cancelled: CancellationException) { throw cancelled }
                            catch (failure: AiException) { error = failure.message }
                            catch (_: Exception) { error = "Couldn't create an answer. Your entries and saved contacts are still available." }
                            finally { busy = false }
                        }
                    }, enabled = !busy && topic.isNotBlank(), icon = "sparkles")
                    BarkTextAction("Review AI context", controller::requestSafetyConsent, enabled = !busy)
                }
            }
        }
    }
    if (busy) { LinearProgressIndicator(Modifier.fillMaxWidth().semantics { contentDescription = "Preparing a safety explanation for ${dog.name}" }); BarkTextAction("Cancel answer", ::cancel) }
    error?.let { ErrorCard(it) }
    reply?.let { result ->
        SoftPawsCard(if (result.source == "demo") "Design preview · not a live answer" else "Soft Paws AI · ${dog.name}") {
            result.text.split(Regex("\\n\\s*\\n")).filter(String::isNotBlank).forEach { paragraph ->
                Text(paragraph.trim().replace("**", ""), style = MaterialTheme.typography.bodyMedium)
            }
            CaptionText("Generated explanation · may be wrong. Contact a veterinarian about an exposure or health concern.")
        }
    }
    BoardStickyAction {
        BarkButton("Saved contacts · free", { cancel(); context.open(Feature.Emergency) })
        if (!exploring) BarkButton(if (toxicity) "Explore AI lookup" else "Explore this topic with AI", { exploring = true }, secondary = true)
    }
}
