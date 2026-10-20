package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.launch

/** Cat setup uses the existing durable independent draft and final-commit boundary. */
@Composable
internal fun ColumnScope.CompanionOnboarding(screen: CompanionScreen, controller: CompanionController, platform: AppPlatform, onDogAdded: suspend (String) -> Unit) {
    val state by controller.state.collectAsState()
    val draft = state.draft
    val context = draft.context
    val name = draft.name.ifBlank { "your cat" }
    val scope = rememberCoroutineScope()
    var error by remember(screen) { mutableStateOf<String?>(null) }
    var beat by rememberSaveable { mutableIntStateOf(0) }
    fun edit(change: (DogContext) -> DogContext) = controller.editDraft { it.copy(context = change(it.context)) }
    fun next(target: CompanionScreen? = null) {
        scope.launch {
            try {
                controller.state.value.draft.context.validate()
                val index = CompanionController.catSetupIds.indexOf(screen.boardId)
                val destination = target ?: CompanionController.catSetupIds.getOrNull(index + 1)?.let(CompanionScreen::fromBoard) ?: CompanionScreen.Plan
                controller.continueTo(if ((draft.editingDogId != null || state.reviewingDraft) && screen != CompanionScreen.ContextReview) CompanionScreen.ContextReview else destination)
            } catch (cause: IllegalArgumentException) { error = cause.message }
        }
    }
    fun commit() { scope.launch { controller.commitDog()?.let { onDogAdded(it.id) } } }
    fun validBirthday(): Boolean {
        val value = controller.state.value.draft.context.birthday
        if (value.isNotBlank() && runCatching { kotlinx.datetime.LocalDate.parse(value) > JournalDates.day(platform.nowMillis(), platform.timeZone()) }.getOrDefault(false)) {
            error = "Birthday can’t be in the future."; return false
        }
        return true
    }
    when (screen) {
        CompanionScreen.Opening -> {
            val beats = listOf(
                "The little things, kept." to "A daily journal for life with your cat.",
                "A bowl. A nap. A note." to "The details are easy to forget.",
                "One small check-in." to "Tap the record to keep this moment.",
                "Their week, in view." to "Find the exact observation when you need it.",
                "A little closer, every day." to "Start with your cat. Keep the rest simple.",
            )
            SoftPawsHeading(beats[beat].first, beats[beat].second)
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(224.dp, 244.dp), greetingLabel = "Say hello to the Soft Paws cat") }
            if (beat == 2) BarkButton("Keep a breakfast note", { beat = 3 }, secondary = true)
            if (beat == 3) SoftPawsCard("Breakfast, mostly eaten") { CaptionText("Today · 08:10 · Example record") }
            CFoot(if (beat == 4) "Meet your cat" else "Next", secondary = "Skip intro", onSecondary = { next(CompanionScreen.Dog) }) { if (beat < 4) beat++ else next(CompanionScreen.Dog) }
        }
        CompanionScreen.Dog -> {
            SoftPawsHeading("Who is your little shadow?", "Start with a name. Details can wait.")
            CDog(name, true)
            BarkField("Cat’s name", draft.name, { value -> controller.editDraft { it.copy(name = value.take(80)) } })
            CFoot("Meet $name", enabled = !state.profileSaving,
                secondary = if (draft.addingDog || draft.editingDogId != null) null else "Start with name only",
                onSecondary = { if (draft.name.isBlank()) error = "Give your cat a name." else commit() }) {
                if (draft.name.isBlank()) error = "Give your cat a name." else next(CompanionScreen.Lifestyle)
            }
        }
        CompanionScreen.Lifestyle -> {
            SoftPawsHeading("Where does $name spend the day?", "This shapes the care shortcuts.")
            CDog(name)
            listOf("Indoor" to "house", "Outdoor" to "trees", "Indoor & outdoor" to "sun", "Not sure" to "circle-question-mark").forEach { (value, icon) ->
                CChoice(if (value == "Indoor & outdoor") "A bit of both" else if (value == "Not sure") "Not sure yet" else value, icon = icon, selected = context.lifestyle == value) { edit { it.copy(lifestyle = value) }; next() }
            }
            CFoot("Skip") { next() }
        }
        CompanionScreen.Stage, CompanionScreen.Age -> {
            SoftPawsHeading("How old is $name?", "An estimate is fine.")
            CDog(name)
            listOf("Kitten" to "Under 1 year", "Adult" to "1–6 years", "Mature" to "7–10 years", "Senior" to "11+ years", "Not sure" to "That’s okay").forEach { (value, sub) ->
                CChoice(if (value == "Not sure") "I’m not sure" else value, sub, selected = context.stage == value) { edit { it.copy(stage = value) }; next(CompanionScreen.Breed) }
            }
            if (screen == CompanionScreen.Age || context.years.isNotBlank() || context.months.isNotBlank()) {
                BarkField("Estimated years", context.years, { value -> edit { it.copy(years = value.take(2)) } }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                BarkField("Estimated months", context.months, { value -> edit { it.copy(months = value.take(2)) } }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            }
            CFoot("Continue") { next(CompanionScreen.Breed) }
        }
        CompanionScreen.Breed, CompanionScreen.Sex -> {
            SoftPawsHeading("A few familiar details.", "Optional now. Editable in their profile.")
            BarkField("Breed or mix", context.breeds.joinToString(" × "), { value -> edit { it.copy(breeds = value.split('×').map(String::trim).filter(String::isNotBlank)) } })
            BarkField("Birthday, if known", context.birthday, { value -> edit { it.copy(birthday = value.take(10)) } }, placeholder = "YYYY-MM-DD")
            SoftPawsSection("Sex & neuter status")
            listOf("Female", "Male", "Not recorded").forEach { value -> CChoice(if (value == "Not recorded") "Unknown" else value, selected = draft.sex == value) { controller.editDraft { it.copy(sex = value) } } }
            listOf("Yes" to "Spayed / neutered", "No" to "Not neutered", "Not sure" to "Not sure").forEach { (value, label) -> CChoice(label, selected = context.neutered == value) { edit { it.copy(neutered = value) } } }
            CFoot("Continue") { if (validBirthday()) next(CompanionScreen.Size) }
        }
        CompanionScreen.Size -> {
            SoftPawsHeading("A starting weight.", "Only record a measurement you know.")
            CDog(name)
            BarkField("Weight in ${context.weightUnit}", context.weight, { value -> edit { it.copy(weight = value.take(12)) } }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            CSegment(listOf("kg", "lb"), context.weightUnit) { unit -> edit { it.copy(weightUnit = unit, weight = "") } }
            CaptionText("No target weight is inferred from this number.")
            CFoot("Continue", secondary = "I don’t know yet", onSecondary = { edit { it.copy(weight = "") }; next() }) { next() }
        }
        CompanionScreen.CareNotes, CompanionScreen.Food -> {
            SoftPawsHeading("Anything to keep in view?", "Your notes, in your own words.")
            BarkField("Food, allergies or care notes", context.careNotes, { value -> edit { it.copy(careNotes = value.take(2000)) } }, multiline = true)
            // Previously recorded facts remain separately editable rather than being collapsed or lost.
            if (context.allergies.isNotBlank() || screen == CompanionScreen.Food) BarkField("Known allergies or sensitivities", context.allergies, { value -> edit { it.copy(allergies = value.take(2000)) } }, multiline = true)
            if (context.conditions.isNotBlank()) BarkField("Known conditions", context.conditions, { value -> edit { it.copy(conditions = value.take(2000)) } }, multiline = true)
            if (context.medications.isNotBlank()) BarkField("Existing care instructions", context.medications, { value -> edit { it.copy(medications = value.take(2000)) } }, multiline = true)
            SoftPawsCard("Your vet’s instructions") { SupportingText("Keep prescribed care here. Soft Paws does not diagnose or recommend treatment.") }
            CaptionText("You can leave this blank.")
            CFoot("Continue") { next(CompanionScreen.Goals) }
        }
        CompanionScreen.Goals, CompanionScreen.Experience, CompanionScreen.Rhythm, CompanionScreen.Focus, CompanionScreen.Personality, CompanionScreen.Activities -> {
            SoftPawsHeading("What would help most?", "Pick the things you want close by.")
            CMulti(context.goals, listOf(Triple("Everyday care", "Meals, litter, play and notes", "notebook-pen"), Triple("Vet prep", "Find the facts before a visit", "heart"), Triple("Little memories", "Photos and their stories", "image"), Triple("Reminders", "Only when you choose them", "calendar")), { values -> edit { it.copy(goals = values) } })
            CFoot("Make a place for $name") { next(CompanionScreen.Permissions) }
        }
        CompanionScreen.Permissions, CompanionScreen.Reminder -> {
            SoftPawsHeading("A nudge, if you want.", "Your journal works without notifications.")
            CDog(name)
            var pending by remember { mutableStateOf(false) }
            var denied by remember { mutableStateOf(false) }
            CSwitch("Care reminders", "Off until you choose a time", context.notifications, !pending) { enabled ->
                if (!enabled) edit { it.copy(notifications = false) }
                else scope.launch {
                    pending = true
                    try {
                        when (val result = platform.device.notificationAccess(true)) {
                            is DeviceResult.Success -> { edit { it.copy(notifications = true) }; denied = false }
                            DeviceResult.Denied -> { denied = true; edit { it.copy(notifications = false) } }
                            DeviceResult.Cancelled -> Unit
                            is DeviceResult.Failed -> controller.setError(result.message)
                        }
                    } finally { pending = false }
                }
            }
            if (context.notifications) {
                BarkField("Daily check-in time", context.reminderTime, { value -> edit { it.copy(reminderTime = value.take(5)) } }, placeholder = "HH:MM")
                CWeekdays(context.reminderDays) { days -> edit { it.copy(reminderDays = days) } }
            }
            if (denied) { CaptionText("Notifications are off. You can still save every record."); BarkTextAction("Open Settings", { platform.device.openSettings() }) }
            CFoot("Continue", enabled = !pending) { next(if (draft.addingDog || draft.editingDogId != null) CompanionScreen.ContextReview else CompanionScreen.Plan) }
        }
        CompanionScreen.ContextReview -> {
            SoftPawsHeading("All the familiar details.", "Your details, ready to keep. Edit anything here.")
            CProfile(ProfileSnapshot(name, draft.sex, context), controller::reviewDraftAt)
            BarkTextAction("Edit name", { controller.reviewDraftAt(CompanionScreen.Dog) }, enabled = !state.profileSaving)
            CFoot(if (state.profileSaving) "Saving…" else if (draft.addingDog) "Add $name" else if (draft.editingDogId != null) "Keep changes" else "Open the journal", enabled = !state.profileSaving) {
                if (draft.editingDogId != null) scope.launch { controller.commitDog()?.let { controller.go(CompanionScreen.DogProfile) } } else commit()
            }
        }
        CompanionScreen.Practice, CompanionScreen.AiDemo -> {
            SoftPawsHeading("A little closer, every day.", "Your first cat’s journal stays free.")
            CDog(name, true)
            CFoot("Review their journal") { next(CompanionScreen.Plan) }
        }
        else -> Unit
    }
    error?.let { ErrorCard(it) }
}
