package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.datetime.toInstant

val onboardingBoardIds = listOf("opening-value", "dog-setup", "onboarding-route", "onboarding-identity", "onboarding-breed", "onboarding-age", "onboarding-shortcuts", "onboarding-practice", "onboarding-notes", "onboarding-timeline", "onboarding-storage", "onboarding-ready")

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun OnboardingScreen(controller: JournalController, journal: JournalState, platform: AppPlatform, navigation: AppState, reviewScreen: String? = null, scrollState: ScrollState? = null, onFinished: () -> Unit = {}) {
    var step by rememberSaveable { mutableIntStateOf(onboardingBoardIds.indexOf(reviewScreen).coerceAtLeast(0)) }
    val requestId = rememberSaveable { platform.newId() }
    var name by rememberSaveable { mutableStateOf(if (reviewScreen != null && reviewScreen !in setOf("dog-setup", "opening-value")) "Bruno" else "") }
    var breed by rememberSaveable { mutableStateOf("") }
    var age by rememberSaveable { mutableStateOf("") }
    var photo by rememberSaveable { mutableStateOf("") }
    var shortcuts by rememberSaveable { mutableStateOf("") }
    var note by rememberSaveable { mutableStateOf("") }
    var practiced by rememberSaveable { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope(); val motion = LocalBarkMotion.current
    val navigate = LocalBoardNavigation.current
    var answerJob by remember { mutableStateOf<Job?>(null) }
    fun advanceTo(next: Int) { answerJob?.cancel(); answerJob = null; navigate(if (next < step) BoardNavigationMove.Back else BoardNavigationMove.Carry) { step = next } }
    val cleanName = name.trim().ifBlank { "your dog" }
    var advancing by remember { mutableStateOf(false) }
    LaunchedEffect(step) {
        advancing = false
        // A long choice page may have scrolled to its Continue button. The next
        // step starts at its heading, with Back and Skip reachable immediately.
        scrollState?.scrollTo(0)
    }
    DisposableEffect(step) { onDispose { answerJob?.cancel(); answerJob = null } }
    DisposableEffect(step, journal.saving) {
        navigation.backGuard = if (step > 0) ({ if (!journal.saving) advanceTo(step - 1); true }) else null
        onDispose { navigation.backGuard = null }
    }
    val save: () -> Unit = {
        scope.launch {
            error = null
            try {
                require(name.trim().length in 1..80 && name.none { it.isISOControl() }) { "Enter a dog name from 1 to 80 characters." }
                val shortcutsSaved = withContext(Dispatchers.Default) { runCatching { platform.storage.setString("shortcuts_$requestId", shortcuts) }.isSuccess }
                controller.addDog(name, DogDetails(breed = breed.trim(), age = age, photoId = photo.takeIf { it.isNotBlank() }), requestId)
                val dog = controller.state.value.selectedDog
                if (dog?.id == requestId && !controller.state.value.saving) {
                    if (!shortcutsSaved) controller.setupPreferencesNotSaved()
                    navigate(BoardNavigationMove.Carry) { onFinished() }
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (cause: IllegalArgumentException) { error = cause.message }
            catch (_: Exception) { error = "Couldn't save setup. Your details are still here. Try again." }
        }
    }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        if (step > 0) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            BoardBackButton(navigation::back, !journal.saving)
            if (step >= 2) LinearProgressIndicator(progress = { listOf(0f, 0f, .05f, .15f, .25f, .35f, .45f, .58f, .68f, .78f, .88f, 1f)[step] }, modifier = Modifier.weight(1f).height(6.dp), color = boardColor("ink-strong"), trackColor = boardColor("inset"), drawStopIndicator = {})
            if (step >= 2) BarkTextAction("Skip setup", save, enabled = !journal.saving)
        }
        when (step) {
            0 -> {
                OpeningBoardScreen(platform.timeZone(), { advanceTo(1) })
            }
            1 -> {
                BoardDogPortrait(Modifier.size(96.dp).align(Alignment.CenterHorizontally).then(boardSharedElement("dog", boardColor("ground"))))
                BoardGuideHeading(if (name.isBlank()) "Meet your dog." else "Meet $cleanName.", if (name.isBlank()) "dog." else "$cleanName.", "Their name is all BarkLog needs.")
                BarkField("Dog’s name", name, { if (it.length <= 80) name = it }, Modifier.fillMaxWidth(), enabled = !journal.saving, placeholder = "e.g. Bruno")
                BarkButton(if (journal.saving) "Creating journal…" else if (name.isBlank()) "Start a journal" else "Start $cleanName’s journal", save, enabled = name.isNotBlank() && !journal.saving, icon = "arrow-right")
                BarkButton("Make it yours · optional", { advanceTo(2) }, enabled = name.isNotBlank() && !journal.saving, secondary = true)
                CaptionText("No account. No subscription. Your care records work offline.")
            }
            2 -> {
                BoardGuideHero(cleanName)
                BoardGuideHeading("A journal for $cleanName.", "$cleanName.", "Start now, or try a short hands-on setup.")
                BarkButton("Show me around", { advanceTo(3) }, icon = "arrow-right")
                BarkButton("Start logging now", save, secondary = true, enabled = !journal.saving)
                CaptionText("Everything here is optional. You can change it later in Profile.")
            }
            3 -> {
                if (photo.isBlank()) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(15.dp)) {
                    Surface(shape = RoundedCornerShape(34.dp), color = boardColor("meal-bg"), border = BorderStroke(1.dp, boardColor("meal-line"))) { BoardDogPortrait(Modifier.size(100.dp).padding(7.dp)) }
                    Column { SectionTitle(cleanName); CaptionText("Illustration · no photo needed") }
                } else LocalPhoto(photo, "$cleanName’s selected profile photo", platform.device)
                BoardGuideHeading("Make it $cleanName’s.", "$cleanName’s.", "Add a photo, or keep the illustrated dog.")
                BarkButton("Choose a photo", { scope.launch {
                    when (val result = platform.device.pickPhoto()) {
                        is DeviceResult.Success -> { photo = result.value; error = null }
                        DeviceResult.Cancelled -> Unit
                        DeviceResult.Denied -> error = "This photo wasn't accessible. You can keep the illustration."
                        is DeviceResult.Failed -> error = result.message
                    }
                } }, secondary = true, icon = "image")
                BarkButton("Continue", { advanceTo(4) }, icon = "arrow-right")
                BarkTextAction("Keep illustration", { photo = ""; advanceTo(4) })
                CaptionText("No upload or photo analysis. The system picker controls access.")
            }
            4 -> {
                BoardGuideHeading("What’s the mix?", "mix?", "A profile detail, not a care recommendation.")
                listOf("Mixed breed", "Labrador", "Terrier", "Not sure").chunked(2).forEachIndexed { row, pair -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    pair.forEachIndexed { column, value ->
                        val family = listOf("panel", "walk-bg", "photo-bg", "mood-bg")[row * 2 + column]
                        Surface(onClick = { if (!advancing) { advancing = true; breed = if (value == "Not sure") "" else value; answerJob = scope.launch { if (!motion.reduced) delay(motion.milliseconds(340).toLong()); navigate(BoardNavigationMove.Carry) { step = 5 } } } }, modifier = Modifier.weight(1f).heightIn(min = 155.dp).semantics { selected = breed == value }, enabled = !advancing, shape = RoundedCornerShape(24.dp), color = boardColor(family), border = BorderStroke(if (breed == value) 2.dp else 1.dp, boardColor(if (breed == value) "accent-line" else "hair"))) {
                            Column(Modifier.padding(horizontal = 10.dp, vertical = 20.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) { BoardDogPortrait(Modifier.size(65.dp)); Text(value, style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp)); if (breed == value) BarkIcon("check", Modifier.size(14.dp)) }
                        }
                    }
                } }
                BarkTextAction("Add breed later", { advanceTo(5) })
                CaptionText("These are quick examples. Any breed or mix can be entered later in Profile.")
            }
            5 -> {
                BoardGuideHeading("About how old is $cleanName?", "$cleanName?", "An estimate is fine. Leave it blank if unknown.")
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) { listOf("Under 1 year", "1–3 years", "4–7 years", "8 years or older").forEachIndexed { index, value ->
                    BoardGuideOption(value, listOf("Puppy", "Young adult", "Adult", "Older dog")[index], listOf("meal", "walk", "photo", "mood")[index], listOf("utensils", "footprints", "image", "heart")[index], age == value, !advancing) {
                        advancing = true; age = value; answerJob = scope.launch { if (!motion.reduced) delay(motion.milliseconds(340).toLong()); navigate(BoardNavigationMove.Carry) { step = 6 } }
                    }
                } }
                BarkTextAction("I’m not sure", { age = ""; advanceTo(6) })
            }
            6 -> {
                BoardGuideHeading("Keep a little closer.", "closer.", "Pick up to two shortcuts for Home.")
                val chosen = HomeShortcut.decode(shortcuts)
                HomeShortcut.guidedChoices.forEach { shortcut ->
                    val family = when (shortcut.feature) { Feature.Medications -> "medication"; Feature.Training -> "training"; Feature.Photos -> "photo"; else -> "walk" }
                    BoardGuideOption(shortcut.label, when (shortcut.feature) { Feature.Medications -> "Plans and recorded administrations"; Feature.Training -> "Short, reward-based sessions"; Feature.Photos -> "A local journal of small moments"; else -> "An agenda with optional reminders" }, family, featureIcon(shortcut.feature), shortcut in chosen) {
                        val on = shortcut !in chosen
                        if (!on || chosen.size < 2) {
                            shortcuts = HomeShortcut.encode(HomeShortcut.selecting(chosen, shortcut, on))
                            error = null
                        } else error = "Choose up to two. Turn off a selected shortcut to change it."
                    }
                }
                CaptionText("Poop, Pee, Meal and Walk stay available. No reminders are enabled here.")
                BarkButton("Continue", { advanceTo(7) }, icon = "arrow-right")
            }
            7 -> {
                BoardGuideHeading("Try one little log.", "log.", "Practice only. It won’t enter your journal.")
                PracticeBoardCard(practiced, platform.timeZone()) { practiced = true; platform.haptics.selectionChange() }
                BarkButton("Add a note", { advanceTo(8) }, enabled = practiced, icon = "pencil")
                BarkTextAction("Skip practice", { advanceTo(10) })
                CaptionText("Practice only · not saved")
            }
            8 -> {
                BoardGuideHeading("Keep what you noticed.", "noticed.", "A short note is often the useful part.")
                Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) { EventMark(CareEventType.Walk, 25.dp); Column { SectionTitle("Walk · 18:20"); CaptionText("14 October 2026 · practice only") } }
                BarkField("Practice note", note, { if (it.length <= 2000) note = it }, Modifier.fillMaxWidth(), multiline = true, placeholder = "What would you like to remember?")
                CaptionText("${note.length} / 2,000")
                BarkButton("Preview in Timeline", { advanceTo(9) }, icon = "arrow-right")
                CaptionText("Practice only · not saved")
            }
            9 -> {
                BoardGuideHeading("One day, together.", "together.", "Your time and note stay with the record.")
                JournalCard { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { SectionTitle("Wednesday · 14 October"); CaptionText("Practice") }; Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) { EventMark(CareEventType.Walk); Column { Text("Walk · 18:20", style = MaterialTheme.typography.titleMedium); Text(note.ifBlank { "Practice walk · no note added" }, style = MaterialTheme.typography.bodySmall) } }; Text(note.ifBlank { "No note added. You can add one later." }) }
                FeatureNotice("This was a practice record", "Your actual journal will start empty.", "notebook-pen")
                BarkButton("Continue", { advanceTo(10) }, icon = "arrow-right")
            }
            10 -> {
                BoardGuideHeading("Their journal. This phone.", "phone.", "No account, subscription or cloud sync.")
                Surface(shape = RoundedCornerShape(28.dp), color = boardColor("photo-bg"), border = BorderStroke(1.dp, boardColor("photo-line"))) { Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 25.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) { Surface(shape = RoundedCornerShape(13.dp, 29.dp, 13.dp, 13.dp), color = boardColor("panel"), border = BorderStroke(2.dp, boardColor("photo-ink"))) { Column(Modifier.size(92.dp, 108.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) { PawMark(Modifier.size(34.dp)); CaptionText(cleanName) } }; Row(verticalAlignment = Alignment.CenterVertically) { BarkIcon("smartphone", Modifier.size(25.dp)); Text("  Saved locally") } } }
                StorageFact("Log care offline", "No connection or sign-in is needed.", "wifi-off")
                StorageFact("Keep a copy of your records", "CSV export is free. PDF export and sharing are Premium. Nothing is uploaded by BarkLog.", "file-down")
                StorageFact("Keep your own copy", "Removing the app or its data can remove the journal. There is no cloud backup.", "info")
                BarkButton("Open our journal", { advanceTo(11) }, icon = "arrow-right")
            }
            else -> {
                BoardGuideHero(cleanName)
                BoardGuideHeading("$cleanName’s journal is ready.", "ready.", "Your first real care record starts here.")
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { (listOf(breed, age).filter(String::isNotBlank) + listOf("0 saved logs", "Local only")).forEach { value -> Surface(shape = RoundedCornerShape(12.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) { Text(value, Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.bodySmall) } } }
                if (shortcuts.isNotBlank()) JournalCard { SectionTitle("Your Home shortcuts"); SupportingText(HomeShortcut.decode(shortcuts).joinToString(" · ") { it.label }) }
                BarkButton(if (journal.saving) "Creating journal…" else "Go to Home", save, enabled = !journal.saving, icon = "arrow-right")
                CaptionText("Practice records were not saved. You can change dog details and shortcuts later.")
            }
        }
        error?.let { ErrorCard(it) }; journal.error?.let { ErrorCard(it) }
    }
}

@Composable
private fun StorageFact(title: String, subtitle: String, icon: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) { BarkIcon(icon, Modifier.size(20.dp), boardColor("accent-text")); Column(Modifier.weight(1f)) { Text(title, style = MaterialTheme.typography.titleMedium.copy(fontSize = 13.sp)); Text(subtitle, style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp)) } }
}
