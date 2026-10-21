package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

internal val catSafetyScreens = setOf(Feature.Safety, Feature.Triage, Feature.Emergency, Feature.EmergencyEdit,
    Feature.Toxicity, Feature.FirstAid, Feature.NearestVet, Feature.TrainDog)

private val callChoices = listOf(
    Triple("food", "Eating or drinking differently", "utensils"),
    Triple("litter", "Litter habits changed", "archive"),
    Triple("movement", "Movement or breathing concern", "activity"),
    Triple("behaviour", "A change in behaviour", "heart"),
    Triple("exposure", "Possible poisoning or exposure", "shield-check"),
)

/** Free contact access never depends on Premium, AI, location or a care-items read. */
@Composable
fun SafetyFeatureScreen(page: FeaturePage, context: FeatureContext) {
    when (page.feature) {
        Feature.Safety -> {
            SoftPawsHeading("Something feels different?", "Your saved veterinary contacts stay free.", "different?")
            SoftPawsCard("Need help now?", "rose") {
                SupportingText("Contact your vet or an emergency veterinary clinic.")
                SoftPawsRow("Your saved contacts", "Free · direct contact access", "phone") { context.open(Feature.Emergency) }
            }
            SoftPawsList {
                SoftPawsRow("What are you seeing?", "Free · organise what to tell your vet", "heart") { context.open(Feature.Triage) }
                HorizontalDivider(color = boardColor("hair"))
                SoftPawsRow("Find a nearby vet", "Premium · map search", "map-pin") { context.open(Feature.NearestVet) }
                HorizontalDivider(color = boardColor("hair"))
                SoftPawsRow("Check a possible exposure", "Premium · Soft Paws AI", "search") { context.open(Feature.Toxicity) }
                HorizontalDivider(color = boardColor("hair"))
                SoftPawsRow("Safety topics for ${context.dog.name}", "Premium · educational only", "shield-check") { context.open(Feature.FirstAid) }
            }
        }
        Feature.Triage -> {
            var selected by rememberSaveable(context.dog.id) { mutableStateOf(emptyList<String>()) }
            SoftPawsHeading("What are you seeing?", "Choose what you want to tell your vet.", "seeing?")
            Surface(shape = RoundedCornerShape(24.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
                Column(Modifier.fillMaxWidth().padding(horizontal = 18.dp)) {
                    callChoices.forEachIndexed { index, (key, title, icon) ->
                        Row(Modifier.fillMaxWidth().heightIn(min = 68.dp).toggleable(key in selected, role = Role.Checkbox,
                            onValueChange = { picked -> selected = if (picked) selected + key else selected - key }).padding(vertical = 13.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            SoftPawsIconMark(icon)
                            Text(title, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                            if (key in selected) BarkIcon("check", Modifier.size(20.dp), boardColor("accent"))
                        }
                        if (index < callChoices.lastIndex) HorizontalDivider(color = boardColor("hair"))
                    }
                }
            }
            CaptionText("This list does not assess urgency or diagnose. If you are worried, contact a vet. Don't delay a call to complete this list.")
            BoardStickyAction { BarkButton("Show saved contacts", { context.open(Feature.Emergency, if (selected.isEmpty()) "" else "observations@" + selected.joinToString(",")) }) }
        }
        Feature.Emergency -> if (page.id == "region") EmergencyCountryServices(context) else SavedCatContacts(page, context)
        Feature.EmergencyEdit -> CatContactEditor(page, context)
        Feature.Toxicity -> SafetyAiScreen(context, toxicity = true, initialTopic = page.id)
        Feature.FirstAid -> SafetyAiScreen(context, toxicity = false, initialTopic = page.id)
        Feature.NearestVet -> NearbyVetScreen(page, context)
        Feature.TrainDog -> {
            SoftPawsHeading("Cat enrichment", "Premium · coming soon")
            SoftPawsCard("Something to look forward to") { SupportingText("Guided enrichment for ${context.dog.name} is being planned. It is not available with a subscription yet.") }
            BarkButton("Back to Safety", { context.navigation.back() }, secondary = true)
        }
        else -> error("Not a safety destination")
    }
}

@Composable
private fun SavedCatContacts(page: FeaturePage, context: FeatureContext) {
    val dog = context.dog
    var dialFailed by remember(dog.id) { mutableStateOf(false) }
    var facts by rememberSaveable(dog.id) { mutableStateOf(false) }
    SoftPawsHeading("Your people, close by.", "Direct contact access stays free.", "close by.")
    val selections = page.id.takeIf { it.startsWith("observations@") }?.substringAfter('@')?.split(',').orEmpty()
    if (selections.isNotEmpty()) SoftPawsCard("For your call") {
        callChoices.filter { it.first in selections }.forEach { Text(it.second, style = MaterialTheme.typography.bodyMedium) }
        CaptionText("Your selections for this call, not a diagnosis. Nothing has been added to the journal.")
    }
    val saved = VeterinaryContactKind.entries.filter { !dog.details.veterinaryContact(it).empty }
    if (saved.isEmpty()) SoftPawsCard("No contacts saved yet") { SupportingText("Add your regular vet and an emergency clinic. They stay available offline.") }
    saved.forEach { kind ->
        val contact = dog.details.veterinaryContact(kind)
        SoftPawsCard(contact.name.ifBlank { kind.label }) {
            if (contact.phone.isNotBlank()) Text(contact.phone, style = MaterialTheme.typography.bodyLarge)
            if (contact.note.isNotBlank()) SupportingText(contact.note)
            BarkButton("Call saved ${if (kind == VeterinaryContactKind.Vet) "vet" else "emergency contact"}",
                { dialFailed = !context.platform.device.dial(contact.phone) }, enabled = contact.phone.any(Char::isDigit), icon = "phone")
            BarkTextAction("Edit ${kind.label.lowercase()}", { context.open(Feature.EmergencyEdit, if (kind == VeterinaryContactKind.Emergency) "emergency" else "") }, icon = "pencil")
        }
    }
    if (dialFailed) ErrorCard("Couldn't open the phone app. Dial the displayed number directly.")
    SoftPawsRow("Animal-service contacts", "Choose a region for verified listings", "map-pin") { context.open(Feature.Emergency, "region") }
    CaptionText("No universal veterinary phone number is assumed. Saved details work offline; calling needs phone service.")
    SoftPawsRow("Facts for the call", "${dog.name}’s recorded details and source guidance", "clipboard-list") { facts = !facts }
    if (facts) CatCallFacts(context)
    BoardStickyAction { BarkButton("Save a contact", { context.open(Feature.EmergencyEdit) }) }
}

@Composable
private fun CatCallFacts(context: FeatureContext) {
    val dog = context.dog
    var weight by remember(dog.id) { mutableStateOf<CareEvent?>(null) }
    var failed by remember(dog.id) { mutableStateOf(false) }
    var loaded by remember(dog.id) { mutableStateOf(false) }
    var retry by remember(dog.id) { mutableIntStateOf(0) }
    LaunchedEffect(dog.id, retry) {
        loaded = false; failed = false
        try { weight = context.repository.observeTimeline(TimelineFilter(dog.id, CareEventType.Weight), 1).first().events.firstOrNull(); loaded = true }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { failed = true }
    }
    SoftPawsCard("Facts to bring") {
        Text("Cat: ${dog.name}")
        val measurement = weight?.details as? CareDetails.Weight
        if (!loaded && !failed) SkeletonLine(160.dp)
        if (loaded) SupportingText(if (measurement != null) "Last recorded weight: ${measurement.amount} ${measurement.unit.label} · ${JournalDates.dateLabel(JournalDates.day(weight!!.occurredAtMillis, context.zone))}" else "No measured weight recorded.")
        if (failed) { CaptionText("Couldn't read the last measured weight. Contacts are still available."); BarkTextAction("Try weight again", { retry++ }) }
        if (dog.details.breed.isNotBlank()) SupportingText("Breed or mix: ${dog.details.breed}")
        if (dog.details.age.isNotBlank()) SupportingText("Birthday or estimate: ${dog.details.age}")
        context.items.filter { (it.data as? CareItemData.Medication)?.archived == false }.forEach { val plan = it.data as CareItemData.Medication; SupportingText("Recorded plan: ${plan.name} · ${plan.directions.ifBlank { plan.amount }}") }
        CaptionText("For an exposure: exact product, possible amount, time, packaging and what you observed. Don't delay the call to complete your journal.")
    }
    SafetyReference.topics.filter { it.id in setOf("urination", "lilies", "poison") }.forEach { topic ->
        SoftPawsCard(topic.title, "rose") {
            SupportingText(topic.guidance)
            BarkTextAction("Read ${if (topic.id == "lilies") "FDA" else if (topic.id == "poison") "ASPCA" else "Cornell"} source", { context.platform.device.openSource(topic.source) }, icon = "arrow-up-right")
        }
    }
    CaptionText("General cat guidance · sources checked ${SafetyReference.version}. This does not assess your cat's condition.")
}

@Composable
private fun CatContactEditor(page: FeaturePage, context: FeatureContext) {
    val dog = context.dog
    val initial = mapOf("name" to dog.name, "vet" to dog.details.vetName, "phone" to dog.details.vetPhone,
        "emergencyName" to dog.details.emergencyServiceName, "emergency" to dog.details.emergencyPhone,
        "vetNote" to dog.details.vetNote, "emergencyNote" to dog.details.emergencyNote,
        "contactKind" to if (page.id == "emergency") VeterinaryContactKind.Emergency.name else VeterinaryContactKind.Vet.name)
    // Retain the established emergency-editor draft, including its captured profile revision.
    val form = rememberFeatureForm(context, "profile-${Feature.EmergencyEdit}-${dog.id}", initial)
    val kind = runCatching { VeterinaryContactKind.valueOf(form["contactKind"]) }.getOrDefault(VeterinaryContactKind.Vet)
    var clearing by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    fun value(slot: VeterinaryContactKind) = if (slot == VeterinaryContactKind.Vet) VeterinaryContact(form["vet"], form["phone"], form["vetNote"])
        else VeterinaryContact(form["emergencyName"], form["emergency"], form["emergencyNote"])
    fun save(clear: VeterinaryContactKind? = null) {
        scope.launch { form.attempt {
            var details = dog.details
            VeterinaryContactKind.entries.forEach { slot ->
                val contact = if (slot == clear) VeterinaryContact("", "") else value(slot)
                if (slot == kind || contact != dog.details.veterinaryContact(slot)) details = details.withVeterinaryContact(slot, contact.validated(allowEmpty = slot == clear))
            }
            if (context.care.updateDog(dog.copy(revision = form.expectedRevision ?: dog.revision), dog.name, details, form.slot) != null) {
                form.completed = true; clearing = false
                context.resetFeatureView(FeaturePage(Feature.Emergency))
                context.navigation.returnTo(Feature.Emergency)
            }
        } }
    }
    SoftPawsHeading("Keep a number close.", "Use contact details you have checked.", "close.")
    BoardSelect("Contact kind", kind.name, VeterinaryContactKind.entries.map { it.name to it.label }, !context.saving) { form["contactKind"] = it }
    val vet = kind == VeterinaryContactKind.Vet
    SafetyInput(form, if (vet) "vet" else "emergencyName", "Vet or clinic name", !context.saving, max = 160)
    SafetyInput(form, if (vet) "phone" else "emergency", "Phone number", !context.saving, max = 40)
    SafetyInput(form, if (vet) "vetNote" else "emergencyNote", "Address or note · optional", !context.saving, multiline = true)
    CaptionText("Saved for ${dog.name} on this device. Verify availability with the clinic.")
    if (!dog.details.veterinaryContact(kind).empty) BarkTextAction("Clear this saved contact", { clearing = true }, enabled = !context.saving, icon = "trash")
    BoardStickyAction { FeatureFormError(form); BarkButton(if (context.saving) "Saving…" else "Save contact", { save() }, enabled = !context.saving) }
    if (clearing) ConfirmChange("Clear this saved contact?", form.error ?: context.careState.error ?: "Only ${kind.label.lowercase()} for ${dog.name} will be cleared. The other contact and journal stay saved.",
        "Clear contact", context.saving, { clearing = false }, keepLabel = "Keep contact") { save(kind) }
}

@Composable
private fun SafetyInput(form: FeatureForm, key: String, label: String, enabled: Boolean, multiline: Boolean = false, max: Int = 2000) {
    BarkField(label, form[key], { if (it.length <= max) form[key] = it }, Modifier.fillMaxWidth(), enabled,
        multiline = multiline, softPaws = true,
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = if (label == "Phone number") androidx.compose.ui.text.input.KeyboardType.Phone else androidx.compose.ui.text.input.KeyboardType.Text))
}
