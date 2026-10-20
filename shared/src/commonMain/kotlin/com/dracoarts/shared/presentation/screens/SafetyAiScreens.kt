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
import kotlinx.coroutines.*

@Composable
internal fun PremiumSafetyGate(context: FeatureContext, feature: PremiumFeature): Boolean {
    val controller = context.companion
    val state = controller?.state?.collectAsState()?.value
    if (state?.premiumAccess == true) return false
    FeatureNotice("Soft Paws Premium", feature.description, "sparkles")
    BarkButton("See Premium", { controller?.requestPremium(feature) }, enabled = controller != null, icon = "sparkles")
    CaptionText("Emergency contacts and your saved journals stay free.")
    return true
}

@Composable
internal fun SafetyAiScreen(context: FeatureContext, toxicity: Boolean, initialTopic: String) {
    val dog = context.dog
    val controller = context.companion
    val state = controller?.state?.collectAsState()?.value
    val purpose = if (toxicity) CompanionAiPurpose.ToxicityEducation else CompanionAiPurpose.SafetyEducation
    val scope = rememberCoroutineScope()
    var query by rememberSaveable(dog.id, initialTopic) { mutableStateOf(initialTopic) }
    var reply by remember(dog.id, initialTopic) { mutableStateOf<CompanionReply?>(null) }
    var error by remember(dog.id, initialTopic) { mutableStateOf<String?>(null) }
    var busy by remember(dog.id, initialTopic) { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    fun cancel() { job?.cancel(); busy = false }
    DisposableEffect(dog.id, initialTopic) { onDispose { job?.cancel() } }
    LaunchedEffect(dog.id, state?.workspace?.weeklyAllowed, state?.premiumAccess, state?.session?.signedIn) { cancel(); reply = null; error = null }
    LaunchedEffect(context.platform) { context.platform.device.foreground.collect { if (!it) { cancel(); reply = null } } }
    ScreenHeading(if (toxicity) "Toxicity lookup" else "Safety for ${dog.name}", "Cat-specific explanations from Soft Paws AI · Premium")
    FeatureNotice("Suspected exposure or urgent signs?", "Call a veterinarian or animal poison service now. An AI answer cannot assess an exposure or tell you it is safe to wait.", "phone", tone = "bad")
    BarkButton("Open emergency contacts", { cancel(); context.open(Feature.Emergency) }, secondary = true, icon = "phone")
    if (PremiumSafetyGate(context, if (toxicity) PremiumFeature.Toxicity else PremiumFeature.SafetyTopics)) return
    if (controller == null || state == null) return
    if (!state.workspace.weeklyAllowed) {
        JournalCard { SectionTitle("Your cat, with your permission"); SupportingText("Soft Paws AI uses ${dog.name}’s saved profile and the past seven days of care records. Your question goes online; photos and location are excluded."); BarkButton("Review AI & your records", controller::requestSafetyConsent, secondary = true) }
        return
    }
    if (!controller.demoResponses && !state.session.signedIn) {
        FeatureNotice("Sign in for Soft Paws AI", "Your journal and emergency calls work without an account.", "user-round")
        BarkButton("Sign in", { controller.go(CompanionScreen.Login) }); return
    }
    if (!toxicity && initialTopic.isBlank()) {
        BoardMenu { SafetyReference.topics.forEach { topic -> FeatureRow(topic.title, "For ${dog.name} · Soft Paws AI", "shield") { context.open(Feature.FirstAid, topic.id) } } }
        return
    }
    val topic = if (toxicity) query else SafetyReference.topics.firstOrNull { it.id == initialTopic }?.title ?: initialTopic
    if (toxicity) BarkField("Substance or product", query, { if (it.length <= 160) { query = it; reply = null; error = null } }, Modifier.fillMaxWidth(), enabled = !busy, placeholder = "e.g. a lily or a product name")
    else SectionTitle(topic)
    CaptionText("Included: ${dog.name}’s profile + seven days of recorded care. Missing logs cannot establish health or safety.")
    BarkButton(if (busy) "Asking Soft Paws AI…" else if (reply != null || error != null) "Ask again" else "Ask Soft Paws AI", {
        error = null; reply = null; busy = true
        job = scope.launch {
            try { reply = controller.safety.answer(dog.id, topic, purpose) }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (failure: AiException) { error = failure.message }
            catch (_: Exception) { error = "Couldn't create an answer. Check your connection and try again. Emergency contacts are still available." }
            finally { busy = false }
        }
    }, enabled = !busy && topic.isNotBlank(), icon = "sparkles")
    if (busy) { LinearProgressIndicator(Modifier.fillMaxWidth().semantics { contentDescription = "Preparing a safety explanation for ${dog.name}" }); BarkTextAction("Cancel answer", ::cancel) }
    error?.let { ErrorCard(it) }
    reply?.let { result ->
        JournalCard {
            CaptionText(if (result.source == "demo") "DESIGN PREVIEW · NOT A LIVE ANSWER" else "SOFT PAWS AI · FOR ${dog.name.uppercase()}")
            result.text.split(Regex("\\n\\s*\\n")).filter(String::isNotBlank).forEach { paragraph -> val lines = paragraph.trim().lines()
                val heading = lines.first().trim().trimStart('#', ' ').replace("**", "").trimEnd(':')
                if (heading.lowercase() in setOf("what to know", "for this cat", "what to tell your vet") || lines.first().startsWith("#")) {
                    SectionTitle(heading)
                    if (lines.size > 1) Text(lines.drop(1).joinToString("\n").replace("**", ""), style = MaterialTheme.typography.bodyMedium)
                } else Text(paragraph.trim().replace("**", ""), style = MaterialTheme.typography.bodyMedium) }
            CaptionText("Generated explanation · may be wrong. For an exposure or health concern, contact a veterinarian.")
        }
    }
    BarkTextAction("Review AI context", controller::requestSafetyConsent, enabled = !busy)
}
