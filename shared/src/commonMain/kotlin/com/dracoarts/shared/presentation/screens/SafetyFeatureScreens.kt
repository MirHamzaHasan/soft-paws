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
            ScreenHeading("Safety Center", "Contacts when you need them. Explanations for your dog.")
            SafetyUrgent()
            BoardMenu {
            FeatureRow("Emergency card", "Verified contacts and facts to bring", "phone") { context.open(Feature.Emergency) }
            FeatureRow("Toxicity lookup", "BarkLog AI · Premium", "search") { context.open(Feature.Toxicity) }
            FeatureRow("Safety topics", "For ${dog.name} · BarkLog AI · Premium", "shield") { context.open(Feature.FirstAid) }
            FeatureRow("Find a vet nearby", "Choose a clinic in Maps, then call · Premium", "map-pin") { context.open(Feature.NearestVet) }
            FeatureRow("Train your dog", "Premium · coming soon", "graduation-cap") { context.open(Feature.TrainDog) }
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
            EmergencyCountryServices(context)
        }
        Feature.Toxicity -> SafetyAiScreen(context, toxicity = true, initialTopic = page.id)
        Feature.FirstAid -> SafetyAiScreen(context, toxicity = false, initialTopic = page.id)
        Feature.NearestVet -> NearbyVetScreen(context)
        Feature.TrainDog -> {
            ScreenHeading("Train your dog", "BarkLog Premium · coming soon")
            FeatureNotice("Something to look forward to", "Guided training for ${dog.name} is being planned. It is not available with a subscription yet.", "graduation-cap")
            BarkButton("Back to Safety", { context.navigation.back() }, secondary = true)
        }
        Feature.Triage -> {
            ScreenHeading("What are you seeing?", "Organize observations for a professional call.")
            SafetyUrgent()
            BoardMenu {
            listOf("Trouble breathing", "Collapse or unresponsiveness", "Possible poisoning", "Another urgent concern").forEach { sign -> FeatureRow(sign, "Contact a professional", "activity") { context.open(Feature.Emergency) } }
            }
            CaptionText("BarkLog does not diagnose or decide that it is safe to wait.")
        }
        else -> error("Not a safety destination")
    }
    if (page.feature in setOf(Feature.Safety, Feature.Triage, Feature.Emergency)) CaptionText("Saved contacts and bundled numbers work without AI. Calling needs phone service. Emergency guidance: AVMA / Merck · checked ${SafetyReference.version}.")
}

@Composable
private fun SafetyUrgent() { FeatureNotice("If your dog may be in immediate danger", SafetyReference.urgent.substringAfter(", ").replaceFirstChar { it.uppercase() }, "phone", tone = "bad") }
