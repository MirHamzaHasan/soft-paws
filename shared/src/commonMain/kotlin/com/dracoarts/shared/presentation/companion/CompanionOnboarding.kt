package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.launch
import kotlin.math.round

@Composable internal fun ColumnScope.CompanionOnboarding(screen: CompanionScreen, controller: CompanionController, platform: AppPlatform, onDogAdded: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val draft = state.draft; val context = draft.context; val scope = rememberCoroutineScope(); val name = draft.name.ifBlank { "your dog" }
    var error by remember(screen) { mutableStateOf<String?>(null) }
    var practice by rememberSaveable(screen) { mutableStateOf(false) }
    var searched by rememberSaveable(draft.requestId) { mutableStateOf("") }
    var ageMode by rememberSaveable(draft.requestId) { mutableStateOf(if (context.birthday.isNotBlank()) "Birthday" else "Age estimate") }
    fun edit(change: (DogContext) -> DogContext) = controller.editDraft { it.copy(context = change(it.context)) }
    fun next(target: CompanionScreen? = null) { scope.launch { try { controller.state.value.draft.context.validate(); val value = target ?: CompanionScreen.fromBoard(CompanionController.onboardingIds.getOrNull(CompanionController.onboardingIds.indexOf(screen.boardId) + 1)) ?: CompanionScreen.Login; controller.continueTo(if ((draft.editingDogId != null || state.reviewingDraft) && screen != CompanionScreen.ContextReview) CompanionScreen.ContextReview else value) } catch (cause: IllegalArgumentException) { error = cause.message } } }
    fun photo(camera: Boolean = false) { scope.launch { when (val result = if (camera) platform.device.takePhoto() else platform.device.pickPhoto()) { is DeviceResult.Success -> controller.editDraft { it.copy(photoId = result.value) }; DeviceResult.Cancelled -> Unit; DeviceResult.Denied -> controller.setError("Photo access was denied. You can choose a photo later."); is DeviceResult.Failed -> controller.setError(result.message) } } }
    when (screen) {
        CompanionScreen.Opening -> {
            CHeading(if (practice) "A moment, remembered." else "Know the little things.", if (practice) "Exact times. Your words. Ready when you need them." else "A journal for the dog you know best.")
            CDog(name, true, if (practice) "opening-practice" else null)
            if (practice) JournalCard { Text("Walk · just now"); CaptionText("Practice only · nothing was added to your journal") }
            CFoot(if (practice) "Start with my dog" else "Try logging a walk", secondary = "Skip intro", onSecondary = { next(CompanionScreen.Dog) }) { if (practice) next(CompanionScreen.Dog) else practice = true }
            BarkTextAction("I already have an account", { controller.go(CompanionScreen.Login) })
        }
        CompanionScreen.Dog -> {
            CHeading("Who’s your dog?", "We’ll keep their care and conversations together."); JournalCard { if (draft.photoId != null) LocalPhoto(draft.photoId, "$name’s photo", platform.device) else CDog(name); CaptionText("Their own little journal") }
            BarkField("Your dog’s name", draft.name, { controller.editDraft { old -> old.copy(name = it.take(80)) } })
            BarkTextAction("Add a photo", { photo() }, icon = "image"); if (draft.photoId != null) CaptionText("Photo selected")
            CFoot("Continue") { if (draft.name.isBlank()) error = "Enter your dog’s name." else next() }
        }
        CompanionScreen.Stage -> {
            CHeading("What chapter are they in?", "This shapes the journal and AI starter questions.")
            listOf(Triple("Puppy","Still growing","paw-print"), Triple("Adult","Finding their rhythm","sun"),Triple("Senior","Familiar routines","heart"),Triple("Not sure","That’s okay","circle-question-mark")).forEach { (v,sub,icon) -> CChoice(v,sub,icon,context.stage == v) { edit { it.copy(stage = v) }; next() } }
        }
        CompanionScreen.Age -> {
            CHeading("How old is $name?", "A birthday or an estimate adds context."); CDog(name)
            CSegment(listOf("Age estimate","Birthday"),ageMode) { ageMode = it; edit { c -> if (ageMode == "Birthday") c.copy(years = "", months = "") else c.copy(birthday = "") } }
            if (ageMode == "Birthday") BarkField("Birthday",context.birthday,{ v -> edit { it.copy(birthday = v.take(10)) } },placeholder = "YYYY-MM-DD",keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii))
            else Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { BarkField("Years",context.years,{ v -> edit { it.copy(years = v.take(2)) } },Modifier.weight(1f),keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)); BarkField("Months",context.months,{v -> edit { it.copy(months = v.take(2)) } },Modifier.weight(1f),keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)) }
            CFoot("Continue", secondary = "I’m not sure", onSecondary = { edit { it.copy(years = "", months = "", birthday = "") }; next() }) { if (context.birthday.isNotBlank() && runCatching { kotlinx.datetime.LocalDate.parse(context.birthday) > JournalDates.day(platform.nowMillis(), platform.timeZone()) }.getOrDefault(false)) error = "Birthday can’t be in the future." else next() }
        }
        CompanionScreen.Breed -> {
            CHeading("Their breed. Or their mix.", "Choose several, write your own, or leave it open.")
            BarkField("Search or enter a breed",searched,{ searched = it.take(80) },placeholder = "Any breed, from anywhere")
            context.breeds.forEach { value -> BarkTextAction("Remove $value", { edit { it.copy(breeds = it.breeds - value) } }, icon = "x") }
            val suggestions = listOf("Mixed breed","Labrador Retriever","Golden Retriever","German Shepherd","Poodle","Beagle","Bulldog","Shih Tzu","Siberian Husky","Bully Kutta","Indian Pariah Dog","Rajapalayam","Pakistani Mastiff","Chihuahua","Dachshund","Rottweiler","Border Collie","Pug","Cocker Spaniel","Doberman","Dalmatian","Akita","Samoyed","Corgi","Great Dane","Boxer","Belgian Malinois","Jack Russell Terrier","Maltese","Shiba Inu","Whippet","Saluki","Greyhound","Bichon Frise","Cavalier King Charles Spaniel","Pomeranian","Australian Shepherd")
            val custom = searched.trim(); if (custom.isNotEmpty() && context.breeds.none { it.equals(custom,true) }) BarkButton("Add “$custom”", { edit { it.copy(breeds = it.breeds + custom) }; searched = "" },secondary = true)
            suggestions.filter { searched.isBlank() || it.contains(searched,true) }.take(if (searched.isBlank()) 8 else 15).forEach { breed -> CChoice(breed,selected = context.breeds.any {it.equals(breed,true)}, multi = true) { edit { it.copy(breeds = if (it.breeds.any {v->v.equals(breed,true)}) it.breeds.filterNot {v->v.equals(breed,true)} else it.breeds + breed) } } }
            CFoot("Continue") { next() }
        }
        CompanionScreen.Sex -> {
            CHeading("A little more about them.", "Optional details for the care profile.")
            listOf("Male","Female","Not recorded").forEach { sex -> CChoice(if (sex == "Not recorded") "Not sure" else sex,selected = draft.sex == sex) { controller.editDraft { it.copy(sex = sex) } } }
            CaptionText("Neutered or spayed?"); CSegment(listOf("Yes","No","Not sure"),context.neutered) { value -> edit { it.copy(neutered = value) } }; CFoot("Continue") { next() }
        }
        CompanionScreen.Size -> {
            CHeading("Their size, in your words.", "Add a measured weight if you know it.")
            listOf("Tiny","Small","Medium","Large","Giant","Not sure").chunked(3).forEach { row -> Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) {row.forEach {value-> FilterChip(context.size==value,{edit {it.copy(size=value)}},label={Text(value)},modifier=Modifier.weight(1f).heightIn(min=48.dp))}} }
            BarkField("Recorded weight",context.weight,{v -> edit { it.copy(weight = v.take(8)) } },placeholder = "Optional",keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            CSegment(listOf("kg","lb"),context.weightUnit) { unit -> edit { c -> c.copy(weightUnit = unit, weight = c.weight.toDoubleOrNull()?.takeIf { it > 0 }?.let { value -> (round((if (unit == "lb") value * 2.2046226218 else value / 2.2046226218) * 10) / 10).toString() } ?: c.weight) } }
            CFoot("Continue") { next() }
        }
        CompanionScreen.Experience -> { CHeading("How new is dog care?", "We’ll match the amount of guidance to you."); listOf("My first dog","Some experience","Dogs are my life").forEach { value -> CChoice(value,selected = context.experience == value) { edit { it.copy(experience = value) }; next() } } }
        CompanionScreen.Goals -> { CHeading("What would help most?", "Choose all that fit. We’ll keep each one."); CMulti(context.goals,listOf(Triple("Remember daily care","Logs & reminders","clock"),Triple("Understand routines","Records & AI recaps","chart-no-axes-column-increasing"),Triple("Prepare for vet visits","Notes & question lists","notebook-pen"),Triple("Keep their memories","Photos & captions","image")),{v -> edit { it.copy(goals = v) } }); CFoot("Continue") { next() } }
        CompanionScreen.Rhythm -> { CHeading("How does your day go?", "Pick more than one if your week varies."); CMulti(context.routines,listOf(Triple("Morning & evening","Two familiar check-ins","sunrise"),Triple("Little moments all day","Log as things happen","sun"),Triple("Every day is different","Keep the schedule flexible","calendar")),{v -> edit { it.copy(routines = v) } }); CFoot("Continue") { next() } }
        CompanionScreen.Focus -> { CHeading("What are you curious about?", "Choose every topic you’d like to come back to."); CMulti(context.topics,listOf(Triple("Daily routines","See the day together","clock"),Triple("Walks & activity","Review recorded walks","footprints"),Triple("Food & care notes","Keep details together","utensils"),Triple("Questions for the vet","Prepare what to ask","notebook-pen"),Triple("Training & play","Record little wins","graduation-cap"),Triple("Memories & milestones","Words for the moments","heart")),{v -> edit { it.copy(topics = v) } }); CFoot("Continue") { next() } }
        CompanionScreen.Personality -> { CHeading("What’s your dog like?", "Choose the traits you see. These are your observations."); CMulti(context.traits,listOf("Playful","Calm","Social","Shy","Curious","Independent").map { Triple(it,"", "heart") },{v -> edit { it.copy(traits = v) } }); CFoot("Continue") { next() } }
        CompanionScreen.Activities -> { CHeading("What do they enjoy?", "Pick the things that make their day."); CMulti(context.activities,listOf("Sniffing walks","Playing fetch","Training games","Puzzle toys","Quiet time","Water play").map { Triple(it,"","footprints") },{v -> edit { it.copy(activities = v) } }); CFoot("Continue") { next() } }
        CompanionScreen.Food -> { CHeading("What’s on their menu?", "Choose what they eat. Add details you know."); CMulti(context.foods,listOf("Dry food","Wet food","Fresh food","Home-prepared","Vet-provided diet","Still learning").map { Triple(it,"","utensils") },{v -> edit { it.copy(foods = v) } },"Still learning"); BarkField("Known allergies or sensitivities",context.allergies,{v -> edit { it.copy(allergies = v.take(2000)) } },multiline = true); CFoot("Continue") { next() } }
        CompanionScreen.CareNotes -> { CHeading("The things only you know.", "Optional notes. You choose if AI can use them later."); BarkField("Known conditions",context.conditions,{v -> edit { it.copy(conditions = v.take(2000)) } },multiline = true); BarkField("Medications or care instructions",context.medications,{v -> edit { it.copy(medications = v.take(2000)) } },multiline = true); BarkField("Anything else to know?",context.careNotes,{v -> edit { it.copy(careNotes = v.take(2000)) } },multiline = true); CFoot("Continue") { next() } }
        CompanionScreen.Reminder -> {
            CHeading("A little nudge?", "Set a check-in for $name. It stays off until you allow it."); CDog(name)
            Row(Modifier.fillMaxWidth(),horizontalArrangement = Arrangement.SpaceBetween) { listOf("M","T","W","T","F","S","S").forEachIndexed { i, day -> FilterChip((i+1) in context.reminderDays,{ edit { it.copy(reminderDays = if (i+1 in it.reminderDays) it.reminderDays - (i+1) else it.reminderDays + (i+1)) } },label = { Text(day) }, modifier = Modifier.sizeIn(minWidth = 44.dp,minHeight = 48.dp)) } }
            BarkField("Check-in time",context.reminderTime,{v -> edit { it.copy(reminderTime = v.take(5)) } },placeholder = "19:00",keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii)); CaptionText("No reminders are on yet. Choose access on the next screen.")
            CFoot("Choose access",secondary = "Not now",onSecondary = { edit { it.copy(notifications = false) }; next(CompanionScreen.ContextReview) }) { next() }
        }
        CompanionScreen.Permissions -> {
            CHeading("A nudge when it helps.", "Turn notifications on, then choose what you want.")
            var pending by remember { mutableStateOf(false) }; var denied by remember { mutableStateOf(false) }
            var wanted by rememberSaveable { mutableStateOf(context.notifications) }
            val foreground by platform.device.foreground.collectAsState()
            LaunchedEffect(foreground) {if(foreground && wanted) when(platform.device.notificationAccess(false)) {is DeviceResult.Success-> {edit {it.copy(notifications=true)};denied=false};DeviceResult.Denied-> {edit {it.copy(notifications=false)};denied=true};else->Unit}}

            JournalCard {
                CSwitch("Care notifications","The reminders you choose, at the times you set.",context.notifications,!pending) { on -> wanted=on; if (!on) edit { it.copy(notifications = false) } else scope.launch { pending = true; try { when (val result = platform.device.notificationAccess(true)) { is DeviceResult.Success -> { edit { it.copy(notifications = true) }; denied = false }; DeviceResult.Denied -> { denied = true; edit { it.copy(notifications = false) } }; DeviceResult.Cancelled -> Unit; is DeviceResult.Failed -> controller.setError(result.message) } } finally { pending = false } } }
                Surface(shape = androidx.compose.foundation.shape.RoundedCornerShape(18.dp),color = com.dracoarts.shared.presentation.theme.boardColor("ground")) { Column(Modifier.fillMaxWidth().padding(14.dp),verticalArrangement = Arrangement.spacedBy(5.dp)) { CaptionText("BarkLog · ${context.reminderTime}"); Text("A moment for $name"); CaptionText("A quick check-in, then back to your day.") } }
                CaptionText(if (pending) "Waiting for the system permission sheet…" else if (context.notifications) "Allowed · choose your reminder types below." else "Off · logging still works.")
                if (denied) BarkTextAction("Open Settings", { if (!platform.device.openSettings()) controller.setError("Open BarkLog’s notification settings in your device Settings.") })
                if (context.notifications) { CSwitch("Daily check-in","At the days and time you choose.",context.dailyReminder) { v -> edit { it.copy(dailyReminder = v) } }; CSwitch("Care tasks & appointments","Only for tasks you explicitly schedule.",context.taskReminders) {v -> edit { it.copy(taskReminders = v) } }; CSwitch("Medication plans","Only for existing care plans you schedule.",context.medicationReminders) {v -> edit { it.copy(medicationReminders = v) } } }
            }
            JournalCard { Text("Their photo, your choice"); draft.photoId?.let { LocalPhoto(it, "$name’s photo", platform.device) }; BarkButton("Choose photo", { photo() },secondary = true); BarkButton("Take photo", { photo(true) },secondary = true); CaptionText(if (draft.photoId == null) "No photo selected" else "Photo selected") }
            CFoot("Review dog details") { next() }
        }
        CompanionScreen.ContextReview -> {
            CHeading("Does this sound like $name?", "Your details, ready to use. Edit anything here.")
            CDog(name)
            CProfile(ProfileSnapshot(name,draft.sex,context), onEdit = controller::reviewDraftAt)
            BarkTextAction("Edit name", { controller.reviewDraftAt(CompanionScreen.Dog) }, enabled = !state.profileSaving, icon = "pencil")
            CaptionText("These details stay in the profile. AI context is a separate choice.")
            CFoot(if (state.profileSaving) "Saving…" else if (draft.editingDogId != null) "Save profile details" else if (draft.addingDog) "Add $name" else "Use these details", enabled = !state.profileSaving) {
                if (draft.editingDogId != null || draft.addingDog) scope.launch {
                    controller.commitDog()?.let { dog ->
                        if (draft.addingDog) onDogAdded(dog.id) else controller.go(CompanionScreen.DogProfile)
                    }
                } else next(CompanionScreen.Practice)
            }
        }
        CompanionScreen.Practice -> { CHeading("One tap. A little less to remember.", "Time and type now. A note whenever you need one."); CDog(name,reaction = if (practice) "practice" else null); if (practice) JournalCard { Text("Walk · just now"); CaptionText("Practice only · not saved to your journal") }; BarkButton("Log a walk",{practice = true},enabled = !practice,icon = "plus"); CaptionText("Try it once. This won’t become a saved record."); CFoot("See AI in action") { next() } }
        CompanionScreen.AiDemo -> { CaptionText("Premium · example conversation"); CHeading("Your records, in plain words.", "Ask a question. See the moments behind it."); JournalCard { Text("What did today look like?"); SupportingText("An AI reply can organize only the records you choose. It describes your records, not your dog’s health.") }; CaptionText("Example AI reply · no model is connected. Sign-in uses Firebase; your journal stays on this device."); CFoot("Make it ours") { next(CompanionScreen.Login) } }
        else -> Unit
    }
    error?.let { ErrorCard(it) }
}
