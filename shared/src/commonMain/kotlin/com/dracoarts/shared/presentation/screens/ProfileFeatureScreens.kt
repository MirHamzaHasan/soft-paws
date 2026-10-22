package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun ProfileHub(context: FeatureContext) {
    val dog = context.dog
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { BoardDogChip(dog.name, { context.open(Feature.DogSwitcher) }); BarkTextAction("Safety", { context.open(Feature.Safety) }, icon = "shield", leading = true) }
    BoardHeading("Profile", "Cat details and this device’s journal.", BoardFolio("YOUR CAT, ALL TOGETHER", "user-round", "walk", display = true))
    Surface(shape = RoundedCornerShape(30.dp), color = boardColor("panel")) {
        Box {
            Surface(Modifier.fillMaxWidth().height(72.dp), color = boardColor("ball")) {}
            Row(Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, top = 64.dp, bottom = 20.dp), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.Bottom) {
                Surface(Modifier.size(104.dp), shape = CircleShape, color = boardColor("park-sky"), border = androidx.compose.foundation.BorderStroke(5.dp, boardColor("panel"))) {
                    val photo = dog.details.photoId
                    if (photo == null) BoardDogPortrait(Modifier.padding(5.dp).fillMaxSize()) else LocalPhoto(photo, "${dog.name}'s profile photo", context.platform.device, Modifier.clip(CircleShape))
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(dog.name, style = MaterialTheme.typography.displayLarge.copy(fontSize = 30.sp))
                    Text(listOf(dog.details.breed, dog.details.age).filter { it.isNotBlank() }.joinToString(" · ").ifBlank { "Details optional" }, style = MaterialTheme.typography.bodySmall, color = boardColor("ink-muted"))
                    BarkTextAction("Switch cat", { context.open(Feature.DogSwitcher) }, icon = "chevron-right")
                }
            }
        }
    }
    BoardMenu { listOf(
        Triple(Feature.Health, "Health records", "Medication and vaccination"),
        Triple(Feature.Calendar, "Care calendar", "Tasks and opt-in reminders"),
        Triple(Feature.TrainDog, "Train your cat", "Premium · Coming soon"),
        Triple(Feature.Photos, "Photo journal", "Photos and baselines"),
        Triple(Feature.Expenses, "Expenses", "Local receipts and totals"),
        Triple(Feature.VideoHighlight, "Video highlights", "Free editing and preview · Premium MP4"),
        Triple(Feature.Memory, "Memory Book", "Highlights from your records"),
        Triple(Feature.Safety, "Safety Center", "Offline guidance and contacts"),
    ).forEach { (feature, title, sub) -> FeatureRow(title, sub, featureIcon(feature)) { context.open(feature) } } }
    BoardMenu { FeatureRow("Settings & storage", "Appearance, export and deletion", "settings-2") { context.open(Feature.Settings) } }
    CaptionText("${context.journal.totalCount} saved care records · on this device")
}

fun featureIcon(feature: Feature): String = when (feature) {
    Feature.Health, Feature.Medications -> "pill"; Feature.Calendar -> "calendar"; Feature.Training -> "graduation-cap"
    Feature.Photos -> "image"; Feature.Expenses -> "receipt"; Feature.Memory -> "heart"; Feature.Safety -> "shield"
    Feature.Settings -> "settings-2"; else -> "file-text"
}

@Composable
fun ProfileFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope(); val dog = context.dog
    when (page.feature) {
        Feature.DogSwitcher -> {
            ScreenHeading("Choose a cat", "Each cat keeps their own records and conversations.")
            BoardMenu { context.journal.dogs.forEach { saved -> FeatureRow(saved.name, listOf(saved.details.breed, saved.details.age).filter(String::isNotBlank).joinToString(" · ").ifBlank { "Details optional" }, if (saved.id == dog.id) "circle-check" else "user-round", meta = if (saved.id == dog.id) "Selected" else "") {
                scope.launch { context.journalController.selectDog(saved.id); context.navigation.show(Route.Profile) }
            } } }
            BarkButton("Add another cat", { if (context.companion?.requestPremium(com.dracoarts.shared.presentation.companion.PremiumFeature.AdditionalDog) == true) context.open(Feature.DogAdd) }, secondary = true, icon = "plus")
            CaptionText("Adding another cat is part of Premium. Your existing cats stay available.")
        }
        Feature.DogAdd -> {
            val companion = context.companion
            var retry by remember { mutableIntStateOf(0) }
            var failed by remember { mutableStateOf(false) }
            LaunchedEffect(companion, retry) {
                if (companion?.hasPremium == true) failed = !companion.beginAddDog(context.navigation)
            }
            ScreenHeading("Add another cat", "Their own profile, care records and conversations.")
            if (companion?.hasPremium != true) {
                FeatureNotice("A journal for each cat", "Adding another cat is part of Premium. Your existing cats stay available.", "lock-keyhole")
                BarkButton("See Premium", { companion?.requestPremium(com.dracoarts.shared.presentation.companion.PremiumFeature.AdditionalDog) })
                BarkTextAction("Back to cats", { context.navigation.back() })
            } else if (failed) {
                ErrorCard(companion?.state?.value?.error ?: "Couldn't open cat setup. Please try again.")
                BarkButton("Retry cat setup", { failed = false; retry++ })
            } else CaptionText("Opening cat setup…")
        }
        Feature.DogEdit -> {
            val contacts = false // The dedicated cat contact editor owns EmergencyEdit.
            val initial = mapOf("name" to dog.name, "breed" to dog.details.breed, "age" to dog.details.age, "sex" to dog.details.sex,
                "vet" to dog.details.vetName, "phone" to dog.details.vetPhone, "emergency" to dog.details.emergencyPhone, "emergencyName" to dog.details.emergencyServiceName, "notes" to dog.details.notes, "photo" to dog.details.photoId.orEmpty())
            val form = rememberFeatureForm(context, "profile-${page.feature}-${dog.id}", initial)
            ScreenHeading(if (contacts) "Emergency contacts" else "Edit cat", if (contacts) "Verify each number for your location." else "Only the name is required.")
            var additional by rememberSaveable(page.feature, dog.id) { mutableStateOf(false) }
            if (!contacts) {
                FeatureInput(form, "name", "Cat’s name", !context.saving, max = 80)
                FeatureInput(form, "breed", "Breed or mix · optional", !context.saving, max = 100)
                FeatureInput(form, "age", "Birthday or estimate · optional", !context.saving, max = 60)
                BoardSelect("Sex · optional", form["sex"], listOf("Not recorded", "Female", "Male").map { it to it }, !context.saving) { form["sex"] = it }
                BarkTextAction(if (additional) "Hide optional details" else "Photo and more details", { additional = !additional }, icon = if (additional) "x" else "plus")
                if (additional) { PhotoPickerControl(context, form, "photo", "Profile photo · optional"); FeatureInput(form, "notes", "Profile notes · optional", !context.saving, multiline = true) }
            }
            if (contacts || additional) {
                FeatureInput(form, "vet", if (contacts) "Emergency clinic name" else "Clinic name · optional", !context.saving, max = 160)
                FeatureInput(form, "phone", if (contacts) "Phone number" else "Vet phone · optional", !context.saving, max = 40)
                FeatureInput(form, "emergencyName", "Poison-control service · optional", !context.saving, max = 160)
                FeatureInput(form, "emergency", "Emergency / poison-control phone · optional", !context.saving, max = 40)
            }
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else if (contacts) "Save contacts" else "Save details", {
                scope.launch { form.attempt {
                    val details = dog.details.copy(breed = form["breed"].trim(), age = form["age"].trim(), sex = form["sex"], vetName = form["vet"].trim(), vetPhone = form["phone"].trim(), emergencyPhone = form["emergency"].trim(), emergencyServiceName = form["emergencyName"].trim(), notes = form["notes"].trim(), photoId = form["photo"].takeIf { it.isNotBlank() })
                    if (context.care.updateDog(dog.copy(revision = form.expectedRevision ?: dog.revision), form["name"], details, form.slot).also { if (it != null) form.completed = true } != null) context.navigation.back()
                } }
            }, enabled = !context.saving, icon = "check")
            CaptionText("Profiles and contacts stay on this device.")
        }
        Feature.Settings -> {
            val settings by context.settings.state.collectAsState()
            ScreenHeading("Settings", "Make Soft Paws comfortable for you.")
            FeatureRow("Interaction sounds", "Soft taps, selections and saved notes", "music") { context.open(Feature.Sounds) }
            BoardMenu { FeatureRow("Edit ${dog.name}", "Identity and optional details", "pencil") { context.open(Feature.DogEdit) }; FeatureRow("Export journal", "Free CSV · PDF with Premium", "file-down") { context.open(Feature.Report) } }
            JournalCard { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { SectionTitle("Stored on this device"); BarkIcon("shield-check", Modifier.size(24.dp)) }; SupportingText("Your journal stays on this device. Deleting the app or its data can remove these records.") }
            JournalCard {
                SectionTitle("Accessibility")
                FeatureToggle("Reduce motion", "Keep final states without travel.", settings.reduceMotion) { scope.launch { context.settings.save(settings.copy(reduceMotion = it)) } }
                FeatureToggle("Stronger contrast", "Use stronger control borders.", settings.contrast) { scope.launch { context.settings.save(settings.copy(contrast = it)) } }
            }
            settings.error?.let { ErrorCard(it) }
            BoardMenu { FeatureRow("Delete this cat", "${dog.name} and their records", "trash") { context.open(Feature.DeleteDog) }; FeatureRow("Delete all local data", "Every cat and record in this journal", "trash") { context.open(Feature.DeleteAll) } }
            JournalCard { SectionTitle("Appearance"); ChoiceField("Theme", settings.theme, listOf("System", "Light", "Dark").map { it to it }) { scope.launch { context.settings.save(settings.copy(theme = it)) } } }
            HomeShortcutSettings(context)
            CaptionText("Soft Paws · 1.0.0 · local cat journal")
        }
        Feature.DeleteDog, Feature.DeleteAll -> {
            val all = page.feature == Feature.DeleteAll
            var confirm by remember { mutableStateOf(false) }
            ScreenHeading(if (all) "Delete every local journal?" else "Delete ${dog.name}?", "This cannot be undone.")
            FeatureNotice("Local records will be removed", if (all) "Removes all ${context.journal.dogs.size} cats and their care records, tasks, photos, expenses and memories." else "Removes ${dog.name}, ${context.journal.totalCount} care records and their other saved data. Other cats stay saved.", "trash")
            BarkButton("Export first", { context.open(Feature.Report) }, secondary = true, icon = "file-down")
            BarkButton(if (all) "Delete all data permanently" else "Delete cat permanently", { confirm = true }, enabled = !context.saving, secondary = true)
            if (confirm) ConfirmChange(if (all) "Delete every journal?" else "Delete ${dog.name}?", "These records will be permanently removed from this app. Export a copy first if you want to keep them.", "Delete permanently", context.saving, { confirm = false }) {
                scope.launch {
                    val removed = if (all) context.care.deleteAll() else context.care.deleteDog(dog.id)
                    if (removed) { confirm = false; context.navigation.show(Route.Home) }
                }
            }
            CaptionText("Unknown files from older app versions are left untouched.")
        }
        else -> error("Not a profile destination")
    }
}

@Composable
internal fun HomeShortcutSettings(context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val dogId = context.dog.id
    var selected by remember(dogId) { mutableStateOf<Set<HomeShortcut>>(emptySet()) }
    var ready by remember(dogId) { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(dogId, retry) {
        try {
            selected = withContext(Dispatchers.Default) { HomeShortcut.decode(context.platform.storage.getString("shortcuts_$dogId")) }
            ready = true; error = null
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = "Couldn't read Home shortcuts. Try again." }
    }
    JournalCard {
        SectionTitle("Home shortcuts")
        CaptionText("Pick up to two for ${context.dog.name}. This does not enable reminders.")
        if (ready) {
            // Keep earlier optional destinations editable without silently dropping preferences.
            (HomeShortcut.guidedChoices + selected.filter { it !in HomeShortcut.guidedChoices }).forEach { shortcut ->
                FeatureToggle(shortcut.label, "Available from Profile too", shortcut in selected) { on ->
                    if (!saving) scope.launch {
                        saving = true
                        try {
                            val next = HomeShortcut.selecting(selected, shortcut, on)
                            val encoded = HomeShortcut.encode(next)
                            withContext(Dispatchers.Default) { context.platform.storage.setString("shortcuts_$dogId", encoded) }
                            selected = next; error = null
                        } catch (cancelled: CancellationException) { throw cancelled }
                        catch (cause: IllegalArgumentException) { error = cause.message }
                        catch (_: Exception) { error = "Couldn't save Home shortcuts. Your previous choices are unchanged." }
                        finally { saving = false }
                    }
                }
            }
        } else if (error == null) CaptionText("Reading shortcuts…")
        if (saving) CaptionText("Saving shortcuts…")
        error?.let { ErrorCard(it) }
        if (!ready && error != null) BarkTextAction("Retry shortcuts", { retry++ }, icon = "rotate-ccw")
    }
}
