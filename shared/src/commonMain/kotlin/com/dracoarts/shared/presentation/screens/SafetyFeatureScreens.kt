package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first

@Composable
fun SafetyFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val dog = context.dog
    when (page.feature) {
        Feature.Safety -> {
            ScreenHeading("Safety Center", "Offline guidance for urgent moments.")
            SafetyUrgent()
            BoardMenu {
            FeatureRow("Emergency card", "Verified contacts and facts to bring", "phone") { context.open(Feature.Emergency) }
            FeatureRow("Toxicity lookup", "Search the bounded offline list", "search") { context.open(Feature.Toxicity) }
            FeatureRow("First-aid topics", "Protective steps while seeking help", "shield") { context.open(Feature.FirstAid) }
            FeatureRow("What are you seeing?", "Organize observations for a call", "clipboard-list") { context.open(Feature.Triage) }
            }
        }
        Feature.Emergency -> {
            var lastWeight by remember(dog.id) { mutableStateOf<CareEvent?>(null) }
            var weightRead by remember(dog.id) { mutableStateOf(false) }
            var weightFailed by remember(dog.id) { mutableStateOf(false) }
            var weightRetry by remember(dog.id) { mutableIntStateOf(0) }
            LaunchedEffect(dog.id, weightRetry) {
                weightRead = false; weightFailed = false
                try { lastWeight = context.repository.observeTimeline(TimelineFilter(dog.id, CareEventType.Weight), 1).first().events.firstOrNull(); weightRead = true }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { weightFailed = true }
            }
            var dialFailed by remember { mutableStateOf(false) }
            ScreenHeading("Emergency card", "${dog.name} · verify numbers for your location")
            SafetyUrgent()
            JournalCard {
                SectionTitle(dog.details.vetName.ifBlank { "Your veterinarian" })
                if (dog.details.vetPhone.isNotBlank()) BarkButton("Call ${dog.details.vetPhone}", { dialFailed = !context.platform.device.dial(dog.details.vetPhone) }, icon = "phone")
                else SupportingText("No vet number saved. Add a verified local number below.")
                if (dog.details.emergencyPhone.isNotBlank()) BarkButton("Call ${dog.details.emergencyServiceName.ifBlank { "emergency contact" }}", { dialFailed = !context.platform.device.dial(dog.details.emergencyPhone) }, secondary = true, icon = "phone")
            }
            if (dialFailed) ErrorCard("Couldn't open the phone app. Use the saved number to contact your clinic directly.")
            BarkButton("Edit emergency contacts", { context.open(Feature.EmergencyEdit) }, secondary = true, icon = "pencil")
            JournalCard {
                SectionTitle("Facts to bring")
                Text("Dog: ${dog.name}")
                val measurement = lastWeight?.details as? CareDetails.Weight
                if (weightRead) SupportingText(if (measurement != null) "Last recorded weight: ${measurement.amount} ${measurement.unit.label} · ${JournalDates.dateLabel(JournalDates.day(lastWeight!!.occurredAtMillis, context.zone))}" else "No measured weight recorded.")
                if (weightFailed) { CaptionText("Couldn't read the last measured weight. You can still use the contacts above."); BarkTextAction("Try weight again", { weightRetry++ }, icon = "refresh-cw") }
                if (dog.details.breed.isNotBlank()) SupportingText("Breed or mix: ${dog.details.breed}")
                if (dog.details.age.isNotBlank()) SupportingText("Birthday or estimate: ${dog.details.age}")
                context.items.filter { (it.data as? CareItemData.Medication)?.archived == false }.forEach { val plan = it.data as CareItemData.Medication; SupportingText("Recorded plan: ${plan.name} · ${plan.amount}") }
                CaptionText("For an exposure: exact product, possible amount, time, packaging and any observed signs.")
            }
            CaptionText("Service availability and fees vary by location. No example or unverified phone numbers are supplied.")
        }
        Feature.Toxicity -> {
            var query by rememberSaveable(page.id) { mutableStateOf(page.id) }
            var searched by rememberSaveable(page.id) { mutableStateOf(page.id.takeIf(String::isNotBlank)) }
            DisposableEffect(searched) { val guard: (() -> Boolean)? = if (searched != null) ({ searched = null; true }) else null; context.navigation.backGuard = guard; onDispose { if (context.navigation.backGuard === guard) context.navigation.backGuard = null } }
            val result = searched?.let(SafetyReference::lookup)
            if (searched != null) {
                if (result == null) { FeatureNotice("Not found in the offline list", "This does not mean the substance is safe.", "circle-question-mark", tone = "warn"); JournalCard { SectionTitle("Keep the label or packaging"); SupportingText("Contact a veterinarian or poison-control service with the exact product, possible amount and time.") } }
                else { ScreenHeading(result.name, "Offline reference match"); SafetyUrgent(); JournalCard { SectionTitle("Contact a professional now"); SupportingText(result.guidance) }; BarkTextAction("Reference source", { context.platform.device.openSource(result.source) }, icon = "arrow-up-right") }
                BarkButton("Open emergency card", { context.open(Feature.Emergency) }, icon = "phone")
            } else {
                ScreenHeading("Toxicity lookup", "Search the offline reference list.")
                BarkField("Search substance", query, { if (it.length <= 100) query = it }, Modifier.fillMaxWidth(), placeholder = "e.g. chocolate")
                BarkButton("Search", { searched = query.trim() }, enabled = query.isNotBlank(), icon = "search")
                CaptionText("The offline list includes chocolate, grapes/raisins and xylitol. A missing match is not proof of safety.")
            }
        }
        Feature.FirstAid -> {
            val topic = SafetyReference.topics.firstOrNull { it.id == page.id }
            ScreenHeading(topic?.title ?: "First-aid topics", "While contacting a veterinarian")
            SafetyUrgent()
            if (topic == null) SafetyReference.topics.forEach { item -> FeatureRow(item.title, "Offline reference", "shield") { context.open(Feature.FirstAid, item.id) } }
            else { JournalCard { SupportingText(topic.guidance) }; BarkTextAction("Reference source", { context.platform.device.openSource(topic.source) }, icon = "arrow-up-right") }
            BarkButton("Open emergency card", { context.open(Feature.Emergency) }, icon = "phone")
        }
        Feature.Triage -> {
            ScreenHeading("What are you seeing?", "Organize observations for a professional call.")
            SafetyUrgent()
            BoardMenu {
            listOf("Trouble breathing", "Collapse or unresponsiveness", "Possible poisoning", "Another urgent concern").forEach { sign -> FeatureRow(sign, "Contact a professional", "activity") { context.open(if (sign == "Possible poisoning") Feature.Toxicity else Feature.Emergency) } }
            }
            CaptionText("BarkLog does not diagnose or decide that it is safe to wait.")
        }
        else -> error("Not a safety destination")
    }
    CaptionText("Available offline · source set AVMA / Merck Veterinary Manual · checked ${SafetyReference.version}. Reference links need a connection.")
}

@Composable
private fun SafetyUrgent() { FeatureNotice("If your dog may be in immediate danger", SafetyReference.urgent.substringAfter(", ").replaceFirstChar { it.uppercase() }, "phone", tone = "bad") }
