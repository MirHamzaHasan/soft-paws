package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.launch

val catProfileScreens = setOf(Feature.CatProfile, Feature.DogEdit, Feature.DogSwitcher,
    Feature.DogAdd, Feature.Settings, Feature.DataSettings, Feature.DeleteDog, Feature.DeleteAll, Feature.OfflineGuide)

@Composable
fun SoftPawsProfileScreen(page: FeaturePage, context: FeatureContext) {
    val cat = context.dog
    val scope = rememberCoroutineScope()
    when (page.feature) {
        Feature.CatProfile -> {
            SoftPawsHeading("${cat.name}’s familiar details.", "Everything here can change as you learn.", "familiar details.")
            CatProfilePortrait(context)
            val facts = listOf("Breed" to cat.details.breed, "Age" to cat.details.age,
                "Lifestyle" to cat.details.companion.lifestyle, "Sex" to cat.details.sex,
                "Neuter status" to cat.details.companion.neutered,
                "Weight" to cat.details.companion.weight.takeIf(String::isNotBlank)?.let { "$it ${cat.details.companion.weightUnit}" }.orEmpty())
            facts.chunked(2).forEach { pair -> Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                pair.forEach { (label, value) -> Column(Modifier.weight(1f).padding(vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    CaptionText(label)
                    Text(value.takeUnless { it.isBlank() || it == "Not sure" } ?: "Not recorded", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                    HorizontalDivider(color = boardColor("hair"))
                }
            } } }
            SoftPawsSection("Care notes")
            Text(cat.details.companion.careNotes.ifBlank { "No care notes yet." }, style = MaterialTheme.typography.bodyMedium)
            CaptionText("Profile details are caregiver records, not a clinical assessment.")
            BoardStickyAction { BarkButton("Edit profile", { context.open(Feature.DogEdit) }) }
        }
        Feature.DogEdit -> CatProfileEditor(context)
        Feature.DogSwitcher -> {
            SoftPawsHeading("Every cat, their own story.", "Profiles keep their own records and AI choices.", "their own story.")
            context.journal.dogs.forEach { saved ->
                if (saved.id == cat.id) SoftPawsCard(saved.name) {
                    CatProfilePortrait(context)
                    CaptionText("Current cat · existing records stay available")
                } else SoftPawsRow(saved.name, listOf(saved.details.breed, saved.details.age).filter(String::isNotBlank).joinToString(" · ").ifBlank { "Their own local journal" }, "heart") {
                    scope.launch { context.journalController.selectDog(saved.id); context.navigation.show(Route.Profile) }
                }
            }
            SoftPawsRow("Add another cat", "Premium · full setup with independent details", "plus") { context.open(Feature.DogAdd) }
            CaptionText("Existing profiles and records remain accessible.")
            BoardStickyAction { BarkButton("Back to ${cat.name}", { context.navigation.show(Route.Home) }) }
        }
        Feature.DogAdd -> {
            val companion = context.companion
            val state = companion?.state?.collectAsState()?.value
            SoftPawsHeading("Another little shadow?", "Additional cat creation is Premium.", "little shadow?")
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(184.dp, 200.dp)) }
            SoftPawsCard("Their own beginning") { SupportingText("The full cat setup starts with blank details. A separate draft is kept until final confirmation.") }
            CaptionText("No previous cat’s profile, AI consent or conversation is copied.")
            BoardStickyAction {
                state?.error?.let { ErrorCard(it) }
                BarkButton(if (state?.profileSaving == true) "Opening setup…" else if (companion?.hasPremium == true) "Start separate setup" else "View Premium access", {
                    scope.launch { if (companion?.hasPremium == true) companion.beginAddDog(context.navigation) else companion?.requestPremium(PremiumFeature.AdditionalDog) }
                }, enabled = state?.profileSaving != true)
                BarkTextAction("Keep current journal", { context.navigation.show(Route.Home) }, enabled = state?.profileSaving != true)
            }
        }
        Feature.Settings -> {
            val settings by context.settings.state.collectAsState()
            SoftPawsHeading("Make yourself at home.", accent = "at home.")
            SoftPawsSection("Comfort")
            SoftPawsCard("Appearance") { BoardSelect("Theme", settings.theme, listOf("System", "Light", "Dark").map { it to it }) { scope.launch { context.settings.save(settings.copy(theme = it)) } } }
            SoftPawsCard("Accessibility") {
                FeatureToggle("Larger text", "130% of your phone’s text setting", settings.largeText) { scope.launch { context.settings.save(settings.copy(largeText = it)) } }
                FeatureToggle("Reduced motion", "Same-art still and immediate transitions", settings.reduceMotion) { scope.launch { context.settings.save(settings.copy(reduceMotion = it)) } }
                FeatureToggle("Stronger contrast", "Stronger borders around controls", settings.contrast) { scope.launch { context.settings.save(settings.copy(contrast = it)) } }
            }
            SoftPawsRow("Soft interaction sounds", "Off until enabled · soft wood at 35%", "music") { context.open(Feature.Sounds) }
            SoftPawsSection("Your choices")
            SoftPawsList {
                SoftPawsRow("Notifications", "Choose reminders on an individual task", "bell") { context.open(Feature.Calendar) }
                SoftPawsRow("AI context & consent", "Current cat only · change your choice", "message-square-text") { context.companion?.go(CompanionScreen.AiPrivacy) }
                SoftPawsRow("Local data & exports", "Care stays on this device", "archive") { context.open(Feature.DataSettings) }
                SoftPawsRow("Using Soft Paws offline", "Care and saved contacts remain available", "notebook-pen") { context.open(Feature.OfflineGuide) }
            }
            settings.error?.let { ErrorCard(it) }
            HomeShortcutSettings(context)
            CaptionText("Soft Paws · 1.0.0 · local cat journal")
        }
        Feature.DataSettings -> {
            SoftPawsHeading("Your records, your choice.", "This device is where the journal lives.", "your choice.")
            SoftPawsCard("Local journal") { SupportingText("No cloud journal sync, household sharing or automatic photo upload.") }
            SoftPawsList {
                SoftPawsRow("Export raw CSV", "Free · choose the cat and dates", "table") { context.open(Feature.ReportFormat) }
                SoftPawsRow("Review private photos", "Selected local copies", "image") { context.open(Feature.Photos) }
            }
            SoftPawsSection("Deliberate choices")
            SoftPawsRow("Delete a cat’s local data", "${cat.name} · permanent in this app", "trash") { context.open(Feature.DeleteDog) }
            SoftPawsRow("Account deletion", "Separate from your store subscription", "user-round") { context.companion?.go(CompanionScreen.DeleteAccount) }
            BarkTextAction("Delete every local journal", { context.open(Feature.DeleteAll) }, danger = true)
        }
        Feature.DeleteDog, Feature.DeleteAll -> {
            val all = page.feature == Feature.DeleteAll
            var confirm by remember { mutableStateOf(false) }
            SoftPawsHeading(if (all) "Delete every local journal?" else "Delete ${cat.name}’s local records?", "Export what you want to keep first.", "local records?")
            SoftPawsCard("What this affects", "rose") { SupportingText(if (all) "Every cat’s profile, care records, conversations and private attachments in this journal." else "This cat’s profile, care records, conversations and private attachments. Other cats keep their own data.") }
            BarkTextAction("Export first", { context.open(Feature.Report) }, icon = "file-down")
            CaptionText("Deletion cannot be undone in this app. Unknown files from older versions are left untouched.")
            BoardStickyAction {
                context.careState.error?.let { ErrorCard(it) }
                BarkButton("Keep everything", { context.navigation.back() }, enabled = !context.saving)
                BarkTextAction(if (all) "Delete all data permanently" else "Delete cat permanently", { confirm = true }, enabled = !context.saving, danger = true)
            }
            if (confirm) ConfirmChange(if (all) "Delete every journal?" else "Delete ${cat.name}?", "These local records and references will be permanently removed. Export a copy first if you want to keep them.", "Delete permanently", context.saving, { confirm = false }, keepLabel = "Keep everything") {
                scope.launch { if (if (all) context.care.deleteAll() else context.care.deleteDog(cat.id)) { confirm = false; context.navigation.show(Route.Home) } }
            }
        }
        Feature.OfflineGuide -> {
            SoftPawsHeading("Still here, without a signal.", "Your local journal works without a connection.", "without a signal.")
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(184.dp, 200.dp)) }
            SoftPawsCard("What works offline", "accent-soft") { SupportingText("Care logging, saved records, private photos, on-phone reports and direct access to saved contacts.") }
            CaptionText("AI and map-based search need a connection. Your typed question can stay as a draft.")
            BoardStickyAction {
                BarkButton("Keep a check-in", { context.open(Feature.Chooser) })
                BarkButton("Saved contacts", { context.open(Feature.Emergency) }, secondary = true)
            }
        }
        else -> Unit
    }
}

@Composable
private fun CatProfilePortrait(context: FeatureContext) {
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        val photo = context.dog.details.photoId
        if (photo == null) AnimatedCat(Modifier.size(122.dp, 132.dp), greetingLabel = "Say hello to ${context.dog.name}")
        else LocalPhoto(photo, "${context.dog.name}’s profile photo", context.platform.device, Modifier.widthIn(max = 220.dp), height = 132.dp)
    }
}

@Composable
private fun CatProfileEditor(context: FeatureContext) {
    val cat = context.dog; val saved = cat.details; val facts = saved.companion
    val scope = rememberCoroutineScope()
    val form = rememberFeatureForm(context, "profile-${Feature.DogEdit}-${cat.id}", mapOf(
        "name" to cat.name, "breed" to saved.breed, "age" to saved.age, "sex" to saved.sex,
        "vet" to saved.vetName, "phone" to saved.vetPhone, "emergency" to saved.emergencyPhone,
        "emergencyName" to saved.emergencyServiceName, "notes" to saved.notes, "photo" to saved.photoId.orEmpty(),
        "careNotes" to facts.careNotes, "lifestyle" to facts.lifestyle, "stage" to facts.stage,
        "neutered" to facts.neutered, "weight" to facts.weight, "weightUnit" to facts.weightUnit, "_revision" to cat.revision.toString()))
    var additional by rememberSaveable(cat.id) { mutableStateOf(false) }
    SoftPawsHeading("Still learning about them.", accent = "about them.")
    BarkField("Cat’s name", form["name"], { form["name"] = it.take(80) }, enabled = !context.saving, softPaws = true)
    BarkField("Breed or mix", form["breed"], { form["breed"] = it.take(100) }, enabled = !context.saving, softPaws = true)
    BarkField("Care notes", form["careNotes"], { form["careNotes"] = it.take(2000) }, enabled = !context.saving, multiline = true, softPaws = true)
    SoftPawsRow("Other profile details", "Age, weight, lifestyle, photo and neuter status", "heart") { additional = !additional }
    if (additional) {
        FeatureInput(form, "age", "Birthday or age note · optional", !context.saving, max = 60)
        listOf(Triple("sex", "Sex", listOf("Not recorded", "Female", "Male")),
            Triple("stage", "Life stage", listOf("Not sure", "Kitten", "Adult", "Mature", "Senior", facts.stage).distinct()),
            Triple("lifestyle", "Lifestyle", listOf("Not sure", "Indoor", "Indoor & outdoor", "Outdoor")),
            Triple("neutered", "Neuter status", listOf("Not sure", "Spayed", "Neutered", "Not neutered", facts.neutered).distinct()),
            Triple("weightUnit", "Weight unit", listOf("kg", "lb"))).forEach { (key, label, choices) -> BoardSelect(label, form[key], choices.map { it to it }, !context.saving) { form[key] = it } }
        FeatureInput(form, "weight", "Recorded weight · optional", !context.saving, max = 20)
        PhotoPickerControl(context, form, "photo", "Profile photo · optional")
        FeatureInput(form, "notes", "Other profile notes · optional", !context.saving, multiline = true)
        FeatureInput(form, "vet", "Clinic name · optional", !context.saving, max = 160)
        FeatureInput(form, "phone", "Vet phone · optional", !context.saving, max = 40)
        FeatureInput(form, "emergencyName", "Emergency service name · optional", !context.saving, max = 160)
        FeatureInput(form, "emergency", "Emergency phone · optional", !context.saving, max = 40)
    }
    CaptionText("Profiles and contacts stay on this device.")
    BoardStickyAction {
        FeatureFormError(form); context.careState.error?.let { ErrorCard(it) }
        BarkButton(if (context.saving) "Keeping changes…" else "Keep changes", { scope.launch { form.attempt {
            val breed = form["breed"].trim()
            if (breed != saved.breed) require(breed.length <= 80) { "Keep a new breed entry within 80 characters." }
            val updatedFacts = facts.copy(careNotes = form["careNotes"].trim(), breeds = if (breed == saved.breed) facts.breeds else listOf(breed).filter(String::isNotBlank),
                lifestyle = form["lifestyle"], stage = form["stage"], neutered = form["neutered"], weight = form["weight"].trim(), weightUnit = form["weightUnit"])
            updatedFacts.validate()
            val details = saved.copy(breed = breed, age = form["age"].trim(), sex = form["sex"], companion = updatedFacts,
                vetName = form["vet"].trim(), vetPhone = form["phone"].trim(), emergencyPhone = form["emergency"].trim(),
                emergencyServiceName = form["emergencyName"].trim(), notes = form["notes"].trim(), photoId = form["photo"].takeIf(String::isNotBlank))
            if (context.care.updateDog(cat.copy(revision = form.expectedRevision ?: cat.revision), form["name"], details, form.slot) != null) {
                form.completed = true; context.navigation.returnTo(Feature.CatProfile)
            }
        } } }, enabled = !context.saving)
    }
}
