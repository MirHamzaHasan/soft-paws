package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.relocation.BringIntoViewRequester
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.AppState
import com.dracoarts.shared.presentation.navigation.JournalPage
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.AppSpacing
import com.dracoarts.shared.presentation.theme.pressMotion
import com.dracoarts.shared.presentation.theme.selectionLanding
import com.dracoarts.shared.presentation.theme.boardColor
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.flow.catch
import kotlinx.serialization.json.Json
import com.dracoarts.shared.domain.repository.LocalDraft
import kotlinx.datetime.TimeZone

@Composable
fun EventPageScreen(page: JournalPage, dogName: String, controller: EventController, navigation: AppState, newId: () -> String, now: Long, zone: TimeZone, context: FeatureContext) {
    val status by controller.state.collectAsState()
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(page, retry) {
        controller.clearError()
        if (page.kind != JournalPage.Kind.New) controller.observe(page.dogId, page.eventId)
    }
    if (page.kind == JournalPage.Kind.New) {
        EventEditor(page.sessionId, EventDraft.fresh(page.eventId, page.dogId, requireNotNull(CareEventType.fromKey(page.typeKey)), now, zone), false, controller, navigation, context)
    } else when {
        status.reading || (status.record != null && (status.record!!.id != page.eventId || status.record!!.dogId != page.dogId)) -> {
            BarkTextAction("Back", navigation::back, icon = "arrow-left", leading = true)
            ScreenHeading("Opening this record")
            JournalCard { SkeletonLine(180.dp, 28.dp); SkeletonLine(220.dp); SkeletonLine(140.dp) }
        }
        status.readError -> { BarkTextAction("Back", navigation::back, icon = "arrow-left", leading = true); ScreenHeading("Couldn't read this record"); ErrorText(status.error ?: "Couldn't read this record."); BarkButton("Try again", { retry++ }, icon = "refresh-cw") }
        status.record == null -> { ScreenHeading("Record unavailable", "This record is no longer available for $dogName."); BarkButton("Back to journal", navigation::closePage, secondary = true) }
        page.kind == JournalPage.Kind.Edit -> EventEditor(page.sessionId, EventDraft.edit(status.record!!, zone), true, controller, navigation, context)
        page.kind == JournalPage.Kind.Saved -> SoftPawsSavedRecord(status.record!!, context)
        else -> EventDetail(status.record!!, dogName, controller, navigation, newId, zone, context)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EventEditor(sessionId: String, initial: EventDraft, editing: Boolean, controller: EventController, navigation: AppState, context: FeatureContext) {
    var draft by rememberSaveable(sessionId, stateSaver = EventDraft.Saver) { mutableStateOf(initial) }
    var validationError by rememberSaveable { mutableStateOf<String?>(null) }
    val status by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    val draftLock = remember(sessionId) { Mutex() }
    val draftSlot = if (editing) "event-edit-${initial.requestId}" else "event-new-${initial.type.key}"
    var baseline by rememberSaveable(sessionId, stateSaver = EventDraft.Saver) { mutableStateOf(initial) }
    var loaded by rememberSaveable(sessionId) { mutableStateOf(false) }
    var restored by rememberSaveable(sessionId) { mutableStateOf(false) }
    var completed by remember { mutableStateOf(false) }
    var confirmClose by remember { mutableStateOf(false) }
    var confirmReload by remember { mutableStateOf(false) }
    var conflictDismissed by rememberSaveable(sessionId) { mutableStateOf(false) }
    LaunchedEffect(sessionId) {
        if (!loaded) {
            try {
                context.care.loadDraft(initial.dogId, draftSlot)?.let { retained ->
                    val saved = Json.decodeFromString(EventDraft.serializer(), retained.value)
                    if (saved.dogId == initial.dogId && saved.type == initial.type && draft == initial) { draft = saved; restored = true }
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { validationError = "Couldn't reopen the retained draft. Your current entries stay here." }
            loaded = true
        }
    }
    LaunchedEffect(draft, completed, loaded) {
        if (loaded && draft != baseline && !completed) {
            delay(350)
            draftLock.withLock {
                if (!completed) try { context.care.saveDraft(draft.dogId, draftSlot, LocalDraft(Json.encodeToString(EventDraft.serializer(), draft), listOfNotNull(draft.photoId))) }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { validationError = "Couldn't retain this draft. Keep this screen open and try saving again." }
            }
        }
    }
    DisposableEffect(sessionId, draft, completed) {
        val guard: () -> Boolean = { if (draft != baseline && !completed) { confirmClose = true; true } else false }
        navigation.backGuard = guard
        onDispose { if (navigation.backGuard === guard) navigation.backGuard = null }
    }
    val keyboard = LocalSoftwareKeyboardController.current
    val errorRequester = remember { BringIntoViewRequester() }
    val error = validationError ?: status.error
    LaunchedEffect(error) { if (error != null) errorRequester.bringIntoView() }
    if (status.conflict && !conflictDismissed) {
        BoardBackButton({ conflictDismissed = true })
        FeatureNotice("This record changed", "A newer saved version is available on this device. Your draft is still here.", "refresh-cw", tone = "warn")
        BarkButton("Review saved version", { scope.launch { draftLock.withLock {
            try {
                context.care.saveDraft(draft.dogId, draftSlot, LocalDraft(Json.encodeToString(EventDraft.serializer(), draft), listOfNotNull(draft.photoId)))
                navigation.backGuard = null; navigation.detail(draft.dogId, draft.requestId)
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { validationError = "Couldn't retain your draft. Keep editing and try again." }
        } } }, icon = "eye")
        BarkButton("Keep editing my draft", { conflictDismissed = true }, secondary = true)
        validationError?.let { ErrorText(it) }
        CaptionText("No automatic merge or hidden overwrite.")
        return
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { BarkTextAction("Close", { keyboard?.hide(); navigation.back() }, enabled = !status.saving, icon = "x", leading = true); CaptionText("${context.dog.name} · local journal") }
    SoftPawsKicker(context.dog.name.uppercase())
    SoftPawsHeading(if (editing) "Edit this ${draft.type.label.lowercase()}." else catLogTitle(draft.type), logSubtitle(draft.type))
    if (restored) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { BarkIcon("notebook-pen", Modifier.size(16.dp)); CaptionText("Draft restored · your notes and choices are here.") }
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        BoardSection("01", logPrompt(draft.type), draft.type.key) {
        when (draft.type) {
            CareEventType.Poop -> ChoiceChips("Consistency · optional", draft.choice, StoolConsistency.entries.map { it.name to it.label }, !status.saving, stoolArt = true) { draft = draft.copy(choice = it) }
            CareEventType.Pee -> ChoiceChips("Amount · optional", draft.choice, ObservedAmount.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
            CareEventType.Meal -> {
                FormField("Amount offered (g) · optional", draft.measuredAmount, !status.saving, { draft = draft.copy(measuredAmount = it) }, maximum = 16, numeric = true)
                ChoiceChips("How much did they eat?", draft.mealEaten, MealEaten.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(mealEaten = it) }
                FormField("Food or recipe · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 200, placeholder = "e.g. chicken kibble")
                val units = listOf("g", "cups", "mL", "Other")
                val unit = draft.second.substringAfterLast(' ').takeIf { it in units } ?: "g"
                val portion = if (draft.second.substringAfterLast(' ') in units) draft.second.substringBeforeLast(' ') else draft.second
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    FormField("Portion · optional", portion, !status.saving, { draft = draft.copy(second = if (it.isBlank()) "" else "$it $unit") }, maximum = 200, numeric = true, placeholder = "e.g. 120", modifier = Modifier.weight(1f))
                    Box(Modifier.weight(1f)) { BoardSelect("Unit", unit, units.map { it to it }, !status.saving) { draft = draft.copy(second = if (portion.isBlank()) "" else "$portion $it") } }
                }
            }
            CareEventType.Walk -> {
                FormField("Duration · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 4, numeric = true, placeholder = "24", trailingText = "minutes")
            }
            CareEventType.Symptom, CareEventType.Behavior -> FormField("What did you observe?", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 2000, multiline = true)
            CareEventType.Mood -> {
                FormField("Context · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 200)
                ChoiceChips("How did they seem?", draft.choice, (listOf(ObservedMood.Settled, ObservedMood.Playful, ObservedMood.Hiding, ObservedMood.Different) + ObservedMood.entries.filter { it.name == draft.choice }).distinct().map { it.name to it.label }, !status.saving, icon = "heart") { draft = draft.copy(choice = it) }
            }
            CareEventType.Grooming -> {
                FormField("Minutes · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 4, numeric = true)
                ChoiceChips("Your care", draft.choice, (listOf(GroomingActivity.Brushing, GroomingActivity.NailsChecked, GroomingActivity.CoatChecked, GroomingActivity.Other) + GroomingActivity.entries.filter { it.name == draft.choice }).distinct().map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
            }
            CareEventType.Weight -> {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    FormField("Measured weight", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 16, numeric = true, modifier = Modifier.weight(1f), placeholder = "14.6")
                    Box(Modifier.weight(.7f)) { BoardSelect("Weight unit", draft.choice, WeightUnit.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) } }
                }
                CaptionText("Use a known measurement. Soft Paws does not estimate weight.")
            }
            CareEventType.Water -> {
                FormField("Measured amount (ml), if known", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 16, numeric = true)
                ChoiceChips("What did you observe?", draft.choice, WaterObservation.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
                CaptionText("A water check is an observation. It does not measure daily intake.")
            }
            CareEventType.Litter -> {
                FormField("Number of visits observed · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 4, numeric = true)
                ChoiceChips("Record what you saw", draft.choice, LitterObservation.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it, urineAmount = "", stoolConsistency = "") }
                if (draft.choice in listOf(LitterObservation.Urine.name, LitterObservation.Both.name)) ChoiceChips("Urine amount · optional", draft.urineAmount, ObservedAmount.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(urineAmount = it) }
                if (draft.choice in listOf(LitterObservation.Stool.name, LitterObservation.Both.name)) ChoiceChips("Stool consistency · optional", draft.stoolConsistency, StoolConsistency.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(stoolConsistency = it) }
                CaptionText("Only the visits and output you observed are recorded.")
            }
            CareEventType.Play -> {
                FormField("Minutes · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 4, numeric = true)
                ChoiceChips("Their pace, their choice", draft.choice, PlayInterest.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
            }
            CareEventType.Sleep -> {
                FormField("Minutes observed · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 4, numeric = true)
                ChoiceChips("Record an observed rest", draft.choice, SleepObservation.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
            }
            CareEventType.Note -> {
                FormField("Title · optional", draft.first, !status.saving, { draft = draft.copy(first = it) }, maximum = 200)
                ChoiceChips("Kind of note", draft.choice, NoteCategory.entries.map { it.name to it.label }, !status.saving) { draft = draft.copy(choice = it) }
            }
            else -> Unit
        }
        val extras = when (draft.type) {
            CareEventType.Poop -> listOf("Color")
            CareEventType.Pee -> listOf("Appearance")
            CareEventType.Meal -> if (draft.observations["Eaten"].isNullOrBlank()) emptyList() else listOf("Eaten")
            CareEventType.Walk -> listOf("Pace")
            CareEventType.Symptom -> listOf("Frequency")
            CareEventType.Behavior -> listOf("Trigger")
            CareEventType.Mood -> emptyList()
            CareEventType.Grooming -> emptyList()
            CareEventType.Weight -> emptyList()
            else -> emptyList()
        }
        extras.forEach { field ->
            val choices = when (field) {
                "Pace" -> listOf("Easy stroll", "Brisk walk", "Run", "Mixed")
                "Eaten" -> listOf("All", "Most", "Some", "None")
                "Color" -> listOf("Brown", "Dark", "Pale", "Other")
                "Appearance" -> listOf("Pale yellow", "Yellow", "Dark", "Other")
                "Frequency" -> listOf("Once", "A few times", "Ongoing", "Not sure")
                "Energy" -> listOf("Usual", "High", "Low", "Not sure")
                "Accident" -> listOf("No accident noticed", "Accident noticed", "Not sure")
                "Blood or mucus" -> listOf("Not noticed", "Noticed", "Not sure")
                else -> emptyList()
            }
            if (choices.isNotEmpty() && field != "Trigger") ChoiceChips(when (field) { "Color" -> "Colour observed · optional"; "Eaten" -> "How much was eaten? · optional"; "Frequency" -> "How often? · optional"; else -> "$field · optional" }, draft.observations[field].orEmpty(), choices.map { it to it }, !status.saving) { draft = draft.copy(observations = draft.observations + (field to it)) }
            else if (field == "Trigger") FormField("What happened just before? · optional", draft.observations[field].orEmpty(), !status.saving, { draft = draft.copy(observations = draft.observations + (field to it)) }, maximum = 240, placeholder = "A visitor arrived, a sound, a new place…")
            else FormField("$field · optional", draft.observations[field].orEmpty(), !status.saving, { draft = draft.copy(observations = draft.observations + (field to it)) }, maximum = 200)
        }
        }
        BoardSection("02", "A note for later", draft.type.key) {
            FormField("Notes (optional)", draft.note, !status.saving, { draft = draft.copy(note = it) }, maximum = 2000, multiline = true, placeholder = when (draft.type) { CareEventType.Walk -> "The route, a new place, a small moment…"; CareEventType.Meal -> "Appetite, a new food, anything different…"; CareEventType.Poop -> "Where it happened or anything else you noticed…"; CareEventType.Symptom -> "When it began, what changed, what happened next…"; CareEventType.Behavior -> "How you responded and what happened afterwards…"; else -> "What would you like to remember?" })
            var help by remember { mutableStateOf(false) }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { BarkTextAction("What could I add?", { help = true }, icon = "info"); CaptionText("${draft.note.length} / 2,000") }
            if (help) ModalBottomSheet(onDismissRequest = { help = false }, containerColor = boardColor("panel")) { Column(Modifier.fillMaxWidth().padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) { SectionTitle("Make this note useful"); SupportingText("Write only the details you noticed."); listOf("Where you were and what was happening.", "Anything different from the usual routine.", "What happened before or afterwards.").forEach { Text("•  $it") }; BarkButton("Done", { help = false }) } }
        }
        var moreContext by rememberSaveable(sessionId) { mutableStateOf(false) }
        JournalCard {
        Surface(onClick = { moreContext = !moreContext }, modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp), color = boardColor("panel")) { Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { BarkIcon("sliders-horizontal", Modifier.size(19.dp), boardColor("${draft.type.key}-ink")); Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) { Text("Add context", style = MaterialTheme.typography.titleMedium); CaptionText("Time, place & attachment") }; BarkIcon(if (moreContext) "x" else "plus", Modifier.size(18.dp)) } }
        if (moreContext) {
            if (LocalDensity.current.fontScale > 1.3f) {
                FormField("Date", draft.date, !status.saving, { draft = draft.copy(date = it) }, maximum = 10, placeholder = "YYYY-MM-DD")
                FormField("Time", draft.time, !status.saving, { draft = draft.copy(time = it) }, maximum = 5, placeholder = "HH:mm")
            } else Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FormField("Date", draft.date, !status.saving, { draft = draft.copy(date = it) }, maximum = 10, modifier = Modifier.weight(1f), placeholder = "YYYY-MM-DD")
                FormField("Time", draft.time, !status.saving, { draft = draft.copy(time = it) }, maximum = 5, modifier = Modifier.weight(1f), placeholder = "HH:mm")
            }
            CaptionText("YYYY-MM-DD · 24-hour time · ${draft.timezoneId}")
            FormField("Place · optional", draft.location, !status.saving, { draft = draft.copy(location = it) }, maximum = 160, placeholder = "e.g. garden, park, at home")
            if (draft.type in setOf(CareEventType.Grooming, CareEventType.Weight)) { val key = if (draft.type == CareEventType.Grooming) "Product" else "Method"; FormField(if (key == "Product") "Products or provider · optional" else "Scale or setting · optional", draft.observations[key].orEmpty(), !status.saving, { draft = draft.copy(observations = draft.observations + (key to it)) }, maximum = if (key == "Product") 200 else 160) }
            if (draft.caregiver.isNotBlank()) FormField("Recorded by · optional", draft.caregiver, !status.saving, { draft = draft.copy(caregiver = it) }, maximum = 100)
            AttachmentPicker(context, draft.photoId, { draft = draft.copy(photoId = it) }, "Attach a photo · optional")
            if (draft.photoId != null) BarkTextAction("Remove attachment", { draft = draft.copy(photoId = null) }, enabled = !status.saving, icon = "x")
        }
        }
        if (editing && initial.expectedRevision != draft.expectedRevision) {
            CaptionText("The saved record changed. Your draft is still here.")
            BarkTextAction("Reload saved details", { confirmReload = true }, enabled = !status.saving, icon = "refresh-cw")
        }
        if (error != null) Box(Modifier.bringIntoViewRequester(errorRequester)) { ErrorText(error) }
        BoardStickyAction {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) { BarkIcon("shield-check", Modifier.size(14.dp)); Spacer(Modifier.width(6.dp)); CaptionText("${draft.date} · ${draft.time}") }
        BarkButton(if (status.saving) "Saving on this device…" else if (editing) "Save changes" else if (draft.type == CareEventType.Note) "Keep this note" else "Keep this check-in", onClick = {
            scope.launch {
                draftLock.withLock {
                    if (completed) return@withLock
                    val input = try { draft.input() } catch (cause: IllegalArgumentException) { validationError = cause.message; return@withLock }
                    validationError = null; conflictDismissed = false; keyboard?.hide()
                    val saved = if (editing) controller.update(draft.originalRecord(), input) else controller.create(draft.dogId, draft.requestId, input)
                    if (saved != null) { completed = true; navigation.backGuard = null; if (editing) navigation.detail(saved.dogId, saved.id) else navigation.saved(saved.dogId, saved.id) }
                }
            }
        }, enabled = !status.saving, icon = "check")
        }
        BarkTextAction("Cancel", navigation::back, enabled = !status.saving)
        CaptionText("Saved on this device. No interpretation or diagnosis.")
    }
    if (confirmReload) BoardConfirmDialog("Replace this draft?", "Your unsaved edits will be replaced with the current saved version. Other records stay unchanged.", "Use saved version", status.saving, { confirmReload = false }, keepLabel = "Keep editing", danger = false) {
        scope.launch { draftLock.withLock {
            try { context.care.discardDraft(draft.dogId, draftSlot); draft = initial; baseline = initial; controller.clearError(); validationError = null; confirmReload = false }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { validationError = "Couldn't reload the saved version. Your draft is still here."; confirmReload = false }
        } }
    }
    if (confirmClose) BoardConfirmDialog("Keep this draft?", validationError ?: "Your notes and choices can wait here until you come back.", "Discard draft", status.saving, { confirmClose = false }, keepLabel = "Keep draft", danger = false,
        onKeep = { scope.launch { draftLock.withLock {
            try { context.care.saveDraft(draft.dogId, draftSlot, LocalDraft(Json.encodeToString(EventDraft.serializer(), draft), listOfNotNull(draft.photoId))); confirmClose = false; navigation.backGuard = null; navigation.backUnconditionally() }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { validationError = "Couldn't keep this draft. Stay here and try again." }
        } } },
        onConfirm = { scope.launch { draftLock.withLock {
            try { context.care.discardDraft(draft.dogId, draftSlot); completed = true; confirmClose = false; navigation.backGuard = null; navigation.backUnconditionally() }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { validationError = "Couldn't discard the draft. Your entries stay here." }
        } } })
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun EventDetail(record: CareEvent, dogName: String, controller: EventController, navigation: AppState, newId: () -> String, zone: TimeZone, context: FeatureContext) {
    var confirmingDelete by rememberSaveable(record.id) { mutableStateOf(false) }
    var deletionRevision by rememberSaveable(record.id) { mutableLongStateOf(record.revision) }
    val status by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    var dayEvents by remember(record.id) { mutableStateOf<List<CareEvent>?>(null) }
    var dayError by remember(record.id) { mutableStateOf(false) }
    var retryDay by remember { mutableIntStateOf(0) }
    LaunchedEffect(record.dogId, record.occurredAtMillis, retryDay) {
        dayError = false
        val (from, until) = JournalDates.dayBounds(JournalDates.day(record.occurredAtMillis, zone), zone)
        context.repository.observeSummary(record.dogId, maxOf(0, from), until).catch { dayError = true }.collect { dayEvents = it.dayEvents }
    }
    BoardBackButton(navigation::back, !status.saving)
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        EventMark(record.type, 64.dp, boardSharedElement("care-${record.type.key}", boardColor("ground")))
        Column(Modifier.weight(1f)) { ScreenHeading(record.type.label, "$dogName · ${JournalDates.dateLabel(JournalDates.day(record.occurredAtMillis, zone))} · ${JournalDates.inputTime(record.occurredAtMillis, zone)}") }
    }
    val lines = detailLines(record.details) + record.context.observations.map { (label, value) -> "$label: $value" } + listOfNotNull(record.context.location.takeIf(String::isNotBlank)?.let { "Place: $it" }, record.context.caregiver.takeIf(String::isNotBlank)?.let { "Recorded by: $it" })
    val family = record.type.key.takeIf { "$it-bg" in com.dracoarts.shared.presentation.theme.LocalBoardColors.current } ?: "note"
    if (lines.isNotEmpty()) FlowRow(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) { lines.forEach { line -> Surface(shape = RoundedCornerShape(10.dp), color = boardColor("$family-bg"), contentColor = boardColor("$family-ink"), border = BorderStroke(1.dp, boardColor("$family-line"))) { Text(line, Modifier.padding(horizontal = 10.dp, vertical = 7.dp), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp)) } } }
    JournalCard {
        CaptionText("A NOTE FOR LATER")
        Text(record.note ?: "No notes recorded.", style = MaterialTheme.typography.bodyLarge.copy(fontSize = 16.sp, lineHeight = 28.sp))
    }
    JournalCard {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { SectionTitle("On the day"); dayEvents?.let { CaptionText("${it.size} records") } }
        when { dayError -> { CaptionText("Couldn't read the day's other records."); BarkTextAction("Try again", { retryDay++ }, icon = "refresh-cw") }; dayEvents == null -> SkeletonLine(220.dp, 84.dp); else -> DayLine(dayEvents!!, context.now, zone, Modifier.fillMaxWidth(), highlightId = record.id, reveal = true) }
    }
    JournalCard {
        Column { listOf("Details" to lines.joinToString(" · ").ifBlank { "No additional details recorded." }, "Recorded" to "${JournalDates.dateLabel(JournalDates.day(record.occurredAtMillis, zone))} · ${JournalDates.inputTime(record.occurredAtMillis, zone)}", "Saved" to "On this device · ${if (record.revision > 1) "edited record · revision ${record.revision}" else "original record"}").forEachIndexed { index, (label, value) -> if (index > 0) HorizontalDivider(color = boardColor("hair")); Row(Modifier.fillMaxWidth().padding(vertical = 13.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { CaptionText(label, Modifier.width(96.dp)); Text(value, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium) } } }
    }
    record.context.photoId?.let { LocalPhoto(it, "Photo attached to this ${record.type.label.lowercase()} record", context.platform.device) }
    status.error?.let { ErrorText(it) }
    if (record.type in CareEventRules.detailedTypes) BarkButton("Edit record", { navigation.edit(record.dogId, record.id, newId()) }, enabled = !status.saving, icon = "pencil")
    else CaptionText("These activity facts are retained as recorded. Manage the plan or program from Profile.")
    BarkTextAction("Delete record", { deletionRevision = record.revision; confirmingDelete = true }, enabled = !status.saving, icon = "trash", danger = true)
    if (confirmingDelete) BoardConfirmDialog("Delete this ${record.type.label.lowercase()} record?", "Removes this record for $dogName at ${JournalDates.inputTime(record.occurredAtMillis, zone)} on ${JournalDates.dateLabel(JournalDates.day(record.occurredAtMillis, zone))}. Other records stay saved. This cannot be undone.", "Delete permanently", status.saving, { confirmingDelete = false }, keepLabel = "Keep record") { scope.launch { if (controller.delete(record.copy(revision = deletionRevision))) { confirmingDelete = false; navigation.closePage() } else confirmingDelete = false } }
}

fun detailLines(details: CareDetails?): List<String> = when (details) {
    is CareDetails.Poop -> listOf("Consistency: ${details.consistency?.label ?: "Not recorded"}")
    is CareDetails.Pee -> listOf("Amount: ${details.amount?.label ?: "Not recorded"}")
    is CareDetails.Meal -> listOf("Food: ${details.food ?: "Not recorded"}", "Portion: ${details.portion ?: "Not recorded"}") + listOfNotNull(details.offeredGrams?.let { "Amount offered: $it g" }, details.eaten?.label)
    is CareDetails.Walk -> listOf("Duration: ${details.durationMinutes?.let { "$it minutes" } ?: "Not recorded"}")
    is CareDetails.Symptom -> listOf("Observed: ${details.observation}")
    is CareDetails.Mood -> listOfNotNull("Observed mood: ${details.observedMood.label}", details.context)
    is CareDetails.Behavior -> listOf("Observed: ${details.observation}")
    is CareDetails.Grooming -> listOfNotNull("Activity: ${details.activity.label}", details.durationMinutes?.let { "$it minutes observed" })
    is CareDetails.Weight -> listOf("Measured weight: ${details.amount} ${details.unit.label}")
    is CareDetails.Medication -> listOf("Medication: ${details.name}", "Amount recorded: ${details.amount}", "Recorded as given by caregiver")
    is CareDetails.Training -> listOf("Program: ${TrainingCatalog.programs.firstOrNull { it.id == details.programId }?.title ?: details.programId}", "Step: ${details.step + 1}", "Duration: ${details.seconds} seconds", "Observed: ${details.rating} · ${details.mood}")
    is CareDetails.Task -> listOf("Task: ${details.title}", "Occurrence: ${details.dueDate}", "Completed by caregiver")
    is CareDetails.Water, is CareDetails.Litter, is CareDetails.Play, is CareDetails.Sleep, is CareDetails.Note -> listOf(JournalReport.details(details))
    null -> emptyList()
}

@Composable
fun FormField(label: String, value: String, enabled: Boolean, onChange: (String) -> Unit, maximum: Int, multiline: Boolean = false, numeric: Boolean = false, modifier: Modifier = Modifier, placeholder: String = "", trailingText: String? = null) {
    BarkField(label, value, { if (it.length <= maximum) onChange(it) }, modifier, enabled, placeholder = placeholder, multiline = multiline,
        keyboardOptions = KeyboardOptions(keyboardType = if (numeric) KeyboardType.Decimal else KeyboardType.Text), trailingText = trailingText)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChoiceField(label: String, value: String, choices: List<Pair<String, String>>, enabled: Boolean = true, onChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    CaptionText(label)
    Box {
        Surface(onClick = { expanded = true }, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).semantics { contentDescription = label },
            shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.surface, border = BorderStroke(1.5.dp, MaterialTheme.colorScheme.outlineVariant)) {
            Row(Modifier.padding(horizontal = 14.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(choices.firstOrNull { it.first == value }?.second ?: "Choose", Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                BarkIcon("chevron-down", Modifier.size(18.dp))
            }
        }
        if (expanded) ModalBottomSheet(onDismissRequest = { expanded = false }, containerColor = boardColor("panel"), shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)) {
            Column(Modifier.fillMaxWidth().heightIn(max = 520.dp).verticalScroll(rememberScrollState()).padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionTitle(label)
                choices.forEach { (key, title) ->
                    Surface(onClick = { expanded = false; onChange(key) }, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp), shape = RoundedCornerShape(20.dp), color = boardColor(if (key == value) "ball" else "inset"), contentColor = boardColor(if (key == value) "ball-ink" else "ink")) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) { Text(title, Modifier.weight(1f)); if (key == value) BarkIcon("check", Modifier.size(18.dp)) }
                    }
                }
                BarkButton("Done", { expanded = false })
            }
        }
    }
    }
}

@Composable
fun ErrorText(message: String) { ErrorCard(message) }

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ChoiceChips(label: String, value: String, choices: List<Pair<String, String>>, enabled: Boolean, stoolArt: Boolean = false, icon: String? = null, onChange: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        CaptionText(label)
        Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            choices.chunked(2).forEachIndexed { row, pair -> Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) { pair.forEachIndexed { column, (key, title) ->
                val chosen = key == value
                val source = remember { MutableInteractionSource() }
                val checkLanding = selectionLanding(chosen, 36)
                Surface(Modifier.weight(1f).heightIn(min = 52.dp).then(pressMotion(source, enabled))
                    .selectable(chosen, enabled = enabled, role = Role.RadioButton, interactionSource = source, indication = null, onClick = { onChange(key) }),
                    shape = RoundedCornerShape(20.dp), color = boardColor(if (chosen) "ball" else "panel"),
                    contentColor = boardColor(if (chosen) "ball-ink" else "ink"),
                    border = if (chosen) null else BorderStroke(1.5.dp, MaterialTheme.colorScheme.outlineVariant)) {
                    Box(Modifier.padding(start = 13.dp, end = 26.dp, top = 12.dp, bottom = 12.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) { if (stoolArt) ObservationArt(row * 2 + column); icon?.let { BarkIcon(it, Modifier.size(21.dp)) }; Text(title, style = MaterialTheme.typography.bodySmall) }
                        if (chosen) BarkIcon("check", Modifier.size(13.dp).align(Alignment.TopEnd).offset(x = 18.dp, y = (-4).dp).then(checkLanding))
                    }
                }
            }; if (pair.size == 1) Spacer(Modifier.weight(1f)) } }
        }
    }
}

private fun logPrompt(type: CareEventType) = when (type) {
    CareEventType.Poop -> "What did you notice?"; CareEventType.Pee -> "A little more context."
    CareEventType.Meal -> "What was on the menu?"; CareEventType.Walk -> "Keep the little details."
    CareEventType.Symptom -> "Write what you can see."; CareEventType.Mood -> "How did they seem?"
    CareEventType.Behavior -> "The moment around it."; CareEventType.Grooming -> "A little care, recorded."
    CareEventType.Weight -> "One measurement at a time."; else -> type.label
}
private fun catLogTitle(type: CareEventType) = when (type) {
    CareEventType.Meal -> "A meal, remembered."
    CareEventType.Water -> "A water check."
    CareEventType.Litter -> "A little litter check."
    CareEventType.Play -> "A moment of play."
    CareEventType.Sleep -> "A quiet stretch."
    CareEventType.Mood -> "How did they seem?"
    CareEventType.Grooming -> "A little freshen-up."
    CareEventType.Weight -> "A measured moment."
    CareEventType.Note -> "One thing to remember."
    else -> "${type.label}, remembered."
}
fun logSubtitle(type: CareEventType) = when (type) {
    CareEventType.Poop -> "Consistency, colour and anything worth remembering."
    CareEventType.Pee -> "Record the amount and what you observed."
    CareEventType.Meal -> "Food, portion and how much was eaten."
    CareEventType.Walk -> "Time outside, the route and your own notes."
    CareEventType.Symptom -> "Describe the observation in your own words."
    CareEventType.Mood -> "Choose what you noticed, then add context."
    CareEventType.Behavior -> "What happened before, during and after?"
    CareEventType.Grooming -> "The activity, products and any notes."
    CareEventType.Weight -> "Keep the measured value, unit and context."; else -> "Caregiver observations only."
}

@Composable
fun AddDetailedLogButton(onType: (CareEventType) -> Unit, compact: Boolean = false, enabled: Boolean = true) {
    var choosing by remember { mutableStateOf(false) }
    if (compact) BarkTextAction("Add details", { choosing = true }, enabled = enabled, icon = "plus")
    else BarkButton("Add detailed log", { choosing = true }, enabled = enabled, secondary = true, icon = "plus")
    if (choosing) Dialog(onDismissRequest = { choosing = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.windowInsetsPadding(WindowInsets.safeDrawing).widthIn(max = AppSpacing.contentMaxWidth)
                .verticalScroll(rememberScrollState()).padding(AppSpacing.page), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                BarkTextAction("Back", { choosing = false }, icon = "arrow-left", leading = true)
                ScreenHeading("What happened?", "Choose a care record to add details.")
                CareEventRules.detailedTypes.forEach { type ->
                    Surface(onClick = { choosing = false; onType(type) }, modifier = Modifier.fillMaxWidth().heightIn(min = 64.dp),
                        shape = RoundedCornerShape(12.dp), border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant), color = MaterialTheme.colorScheme.surface) {
                        Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            EventMark(type); Text(type.label, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium); BarkIcon("chevron-right", Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}
