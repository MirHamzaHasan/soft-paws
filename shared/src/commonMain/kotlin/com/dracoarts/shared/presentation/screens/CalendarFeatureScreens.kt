package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.state.TaskReminders
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.presentation.theme.SoftPawsDesignTokens
import com.dracoarts.shared.services.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

internal val carePlanningScreens = setOf(Feature.Calendar, Feature.TaskForm, Feature.TaskDetail, Feature.ReminderOptIn)

@Composable
fun CalendarFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val selected = context.items.firstOrNull { it.id == page.id.substringBefore('@') && it.data is CareItemData.Task }
    when (page.feature) {
        Feature.Calendar -> CatCareAgenda(page, context)
        Feature.TaskForm -> CatTaskEditor(page, selected, context)
        Feature.TaskDetail, Feature.ReminderOptIn -> CatTaskDetails(page, selected, context)
        else -> error("Not a calendar destination")
    }
}

@Composable
private fun CatCareAgenda(page: FeaturePage, context: FeatureContext) {
    val today = JournalDates.day(context.now, context.zone)
    val day = runCatching { LocalDate.parse(page.id.substringBefore('@')) }.getOrDefault(today)
    val weekEnd = runCatching { LocalDate.parse(page.id.substringAfter('@', day.toString())) }.getOrDefault(day)
    val start = weekEnd.minus(6, DateTimeUnit.DAY)
    val entries = CareAgenda.day(context.dog.id, context.items, day)
    val tomorrow = day.plus(1, DateTimeUnit.DAY)
    val next = CareAgenda.day(context.dog.id, context.items, tomorrow)
    val scope = rememberCoroutineScope()
    var choosing by remember { mutableStateOf(false) }
    var manual by rememberSaveable { mutableStateOf(false) }
    var datesOpen by rememberSaveable { mutableStateOf(false) }
    var entered by rememberSaveable(day) { mutableStateOf(day.toString()) }
    var error by remember { mutableStateOf<String?>(null) }
    fun select(date: LocalDate) {
        error = null
        context.navigation.rememberCalendarDay(date.toString(), if (date in start..weekEnd) weekEnd.toString() else date.toString())
    }
    SoftPawsHeading("The care you planned.", "Reminders only when you choose them.", "you planned.")
    SoftPawsWeek((0..6).map { start.plus(it, DateTimeUnit.DAY) }, day.toString(), ::select)
    SoftPawsSection(JournalDates.headingDate(day), "Dates") { datesOpen = !datesOpen }
    if (datesOpen) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text("${day.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${day.year}", Modifier.weight(1f), style = MaterialTheme.typography.titleMedium)
        IconButton({ context.navigation.rememberCalendarDay(day.minus(7, DateTimeUnit.DAY).toString(), weekEnd.minus(7, DateTimeUnit.DAY).toString()) }, Modifier.size(48.dp).semantics { contentDescription = "Previous week" }) { BarkIcon("chevron-left", Modifier.size(20.dp)) }
        IconButton({ context.navigation.rememberCalendarDay(day.plus(7, DateTimeUnit.DAY).toString(), weekEnd.plus(7, DateTimeUnit.DAY).toString()) }, Modifier.size(48.dp).semantics { contentDescription = "Next week" }) { BarkIcon("chevron-right", Modifier.size(20.dp)) }
        IconButton({ choosing = true; scope.launch {
            try {
                when (val result = context.platform.device.pickDate(day.toString(), "Choose agenda date")) {
                    is DeviceResult.Success -> select(LocalDate.parse(result.value))
                    DeviceResult.Cancelled -> Unit
                    else -> { manual = true; error = "Couldn't open the calendar picker. Enter a date below." }
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { manual = true; error = "Couldn't use the calendar picker. Enter a date below." }
            finally { choosing = false }
        } }, Modifier.size(48.dp).semantics { contentDescription = "Choose agenda date" }, enabled = !choosing) { BarkIcon("calendar", Modifier.size(20.dp)) }
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        BarkTextAction("Today", { select(today) })
        BarkTextAction(if (manual) "Hide date entry" else "Enter a date", { manual = !manual })
    }
    if (manual) {
        BarkField("Agenda date · YYYY-MM-DD", entered, { if (it.length <= 10) entered = it }, softPaws = true)
        BarkTextAction("Show this date", { runCatching { LocalDate.parse(entered.trim()) }.fold(::select) { error = "Enter a date as YYYY-MM-DD." } })
    }
    }
    error?.let { ErrorCard(it) }
    if (entries.isEmpty()) SoftPawsCard("No planned tasks.") { SupportingText("The tasks you plan for this date will appear here.") }
    entries.forEach { occurrence ->
        val task = occurrence.item.data as CareItemData.Task
        SoftPawsCard(task.title) {
            CaptionText("${task.time} · ${task.zoneId} · ${if (occurrence.completion != null) "Completed" else "Planned"} · ${if (task.remind) "reminder chosen" else "reminders off"}")
            SoftPawsRow("View task", "Edit, complete or reschedule", if (occurrence.completion != null) "circle-check" else "calendar", accessibilityLabel = "View task for ${task.title}") {
                context.open(Feature.TaskDetail, "${occurrence.item.id}@$day")
            }
        }
    }
    SoftPawsSection(if (day == today) "Tomorrow" else "Next day · ${JournalDates.dateLabel(tomorrow)}")
    if (next.isEmpty()) CaptionText("No planned tasks.")
    else SoftPawsRow("${next.size} ${if (next.size == 1) "task" else "tasks"} planned", "View ${JournalDates.dateLabel(tomorrow)}", "calendar") { select(tomorrow) }
    val earlier = context.items.mapNotNull { item ->
        val task = item.data as? CareItemData.Task ?: return@mapNotNull null
        val done = CareReminderSchedule.completed(item, context.items)
        CareSchedule.latestUncompletedBefore(task, minOf(today, day), done)?.let { item to it }
    }
    if (earlier.isNotEmpty()) {
        SoftPawsSection("Earlier, without a completion")
        earlier.forEach { (item, date) ->
            SoftPawsRow((item.data as CareItemData.Task).title, "${JournalDates.dateLabel(date)} · nothing recorded as complete", "calendar") { context.open(Feature.TaskDetail, "${item.id}@$date") }
        }
    }
    CaptionText("Dates follow each task’s saved time zone. Completion is a caregiver entry.")
    BoardStickyAction { BarkButton("Plan a task", { context.open(Feature.TaskForm, "new@$day") }) }
}

@Composable
private fun CatTaskEditor(page: FeaturePage, selected: CareItem?, context: FeatureContext) {
    val old = selected?.data as? CareItemData.Task
    val today = JournalDates.day(context.now, context.zone)
    val initial = mapOf("title" to old?.title.orEmpty(), "date" to (old?.date ?: page.id.substringAfter('@', today.toString())),
        "time" to (old?.time ?: "18:00"), "repeat" to (old?.repeat ?: Repeat.None).name,
        "category" to (old?.category ?: "Custom"), "notes" to old?.notes.orEmpty(),
        "remind" to (old?.remind ?: false).toString(), "zone" to (old?.zoneId ?: context.zone.id))
    val form = rememberFeatureForm(context, "task-${selected?.id ?: page.id}", initial)
    val scope = rememberCoroutineScope()
    var extra by rememberSaveable(form.requestId) { mutableStateOf(old?.notes?.isNotBlank() == true || old?.category?.let { it != "Custom" } == true) }
    SoftPawsHeading("Make room for a little care.", accent = "a little care.")
    BarkField("Task", form["title"], { if (it.length <= 160) form["title"] = it }, enabled = !context.saving, softPaws = true)
    CareDateTimeField(form, "date", "Date · YYYY-MM-DD", context)
    CareDateTimeField(form, "time", "Time · HH:mm", context, time = true)
    Surface(shape = RoundedCornerShape(24.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 2.dp).selectableGroup()) {
    Repeat.entries.forEachIndexed { index, repeat ->
        val chosen = form["repeat"] == repeat.name
        val icon = if (repeat == Repeat.Daily) "sun" else "calendar"
        val tone = SoftPawsDesignTokens.iconTones[icon] ?: "mint"
        Surface(onClick = soundAction({ form["repeat"] = repeat.name }), enabled = !context.saving,
            modifier = Modifier.fillMaxWidth().heightIn(min = 62.dp).padding(vertical = if (chosen) 4.dp else 0.dp).semantics { role = Role.RadioButton; this.selected = chosen },
            shape = RoundedCornerShape(if (chosen) 16.dp else 0.dp), color = boardColor(if (chosen) "accent-soft" else "panel"),
            border = if (chosen) BorderStroke(1.dp, boardColor("accent-line")) else null) {
            Row(Modifier.padding(horizontal = if (chosen) 12.dp else 0.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Surface(shape = RoundedCornerShape(14.dp), color = boardColor(tone), border = BorderStroke(1.dp, boardColor("$tone-line"))) {
                    Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(20.dp), boardColor("$tone-ink")) }
                }
                Text(taskRepeat(repeat), Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                if (chosen) BarkIcon("check", Modifier.size(20.dp), boardColor("accent-text")) else Spacer(Modifier.width(20.dp))
            }
        }
        if (index < Repeat.entries.lastIndex) HorizontalDivider(color = boardColor("hair"))
    }
    }
    }
    if (form["repeat"] == Repeat.Monthly.name) CaptionText("Uses the same date each month. Months without that date are skipped.")
    HealthCheck("Remind me for this task", form["remind"] == "true", !context.saving) { form["remind"] = it.toString() }
    CaptionText("Time zone · ${form["zone"]}. Save first; notification permission is a separate choice.")
    BarkTextAction("Category and notes · optional", { extra = !extra }, icon = "sliders-horizontal", leading = true)
    if (extra) {
        ChoiceField("Category", form["category"], listOf("Refill", "Preventive", "Grooming", "Vaccination", "Vet visit", "Training", "Custom").map { it to it }, !context.saving) { form["category"] = it }
        BarkField("Your note · optional", form["notes"], { if (it.length <= 2000) form["notes"] = it }, enabled = !context.saving, multiline = true, softPaws = true)
    }
    FeatureFormError(form)
    BoardStickyAction {
        BarkButton(if (context.saving) "Saving on this device…" else "Keep task", { scope.launch { form.attempt {
            require(form["title"].isNotBlank()) { "Give the task a name." }
            require(runCatching { LocalDate.parse(form["date"].trim()) }.isSuccess) { "Enter a date as YYYY-MM-DD." }
            require(runCatching { LocalTime.parse(form["time"].trim()) }.isSuccess) { "Enter a time as HH:mm." }
            val data = CareItemData.Task(form["title"].trim(), form["date"].trim(), form["time"].trim(), form["zone"], form["category"],
                Repeat.valueOf(form["repeat"]), form["notes"].trim(), form["remind"] == "true")
            val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, data, form.expectedRevision, form.slot)
            if (saved != null) {
                form.completed = true
                val previous = runCatching { LocalDate.parse(page.id.substringAfter('@', old?.date ?: data.date)) }.getOrDefault(LocalDate.parse(data.date))
                val destination = if (old != null && data.date == old.date && CareSchedule.occurs(data, previous)) previous else LocalDate.parse(data.date)
                val agenda = context.navigation.featureStack.lastOrNull { it.feature == Feature.Calendar }?.id?.substringBefore('@')?.takeIf { it.isNotBlank() } ?: today.toString()
                if (agenda != destination.toString()) context.navigation.rememberCalendarDay(destination.toString())
                context.showSavedFeature(Feature.TaskDetail, "${saved.id}@$destination")
            }
        } } }, enabled = !context.saving)
    }
}

private data class TaskUndo(val completion: CareItem, val eventRevision: Long?)

@Composable
private fun CatTaskDetails(page: FeaturePage, selected: CareItem?, context: FeatureContext) {
    val task = selected?.data as? CareItemData.Task
    if (task == null) {
        SoftPawsHeading("Task unavailable.", "It may have been removed. Your other care stays saved.")
        BarkButton("Back to calendar", { backToAgenda(context) }); return
    }
    val date = runCatching { LocalDate.parse(page.id.split('@').getOrNull(1).orEmpty()) }.getOrDefault(LocalDate.parse(task.date))
    val completion = context.items.firstOrNull { (it.data as? CareItemData.Completion)?.let { saved -> saved.taskId == selected.id && saved.dueDate == date.toString() } == true }
    val scope = rememberCoroutineScope()
    var requestId by rememberSaveable(selected.id, date.toString()) { mutableStateOf(context.platform.newId()) }
    var requestedAt by rememberSaveable(selected.id, date.toString()) { mutableLongStateOf(0L) }
    var removal by remember { mutableStateOf<CareItem?>(null) }
    var undo by remember { mutableStateOf<TaskUndo?>(null) }
    var checking by remember { mutableStateOf(false) }
    var reminderBusy by remember { mutableStateOf(false) }
    var permission by remember(selected.id) { mutableStateOf<DeviceResult<Unit>?>(null) }
    var reminderMessage by remember(selected.id) { mutableStateOf<String?>(null) }
    var actionError by remember(selected.id) { mutableStateOf<String?>(null) }
    val completedDates = CareReminderSchedule.completed(selected, context.items)
    LaunchedEffect(selected.id, selected.revision, completedDates) {
        reminderBusy = true
        try {
            context.care.processCleanup()
            permission = context.platform.device.notificationAccess()
            reminderMessage = TaskReminders.refresh(selected, context.care.items(selected.dogId), context.platform.device, context.platform.nowMillis())
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { reminderMessage = "Your task is saved. Couldn't update its reminder; try again." }
        finally { reminderBusy = false }
    }
    SoftPawsHeading(task.title, "For ${context.dog.name}")
    SoftPawsCard("Your plan") {
        TaskFact("When", "${JournalDates.dateLabel(date)} · ${task.time} · ${task.zoneId}", "clock")
        HorizontalDivider(color = boardColor("hair"))
        TaskFact("Repeat", "${taskRepeat(task.repeat)} · starting ${task.date}", "rotate-ccw")
        HorizontalDivider(color = boardColor("hair"))
        TaskFact("Reminder", if (task.remind) "Chosen for this task" else "Off", "bell")
        if (task.category != "Custom") CaptionText("Category · ${task.category}")
        if (task.notes.isNotBlank()) Text(task.notes)
    }
    val occurs = CareSchedule.occurs(task, date)
    if (!occurs) ErrorCard("This date is no longer part of the plan. Existing completion records remain readable.")
    if (completion != null) {
        SoftPawsCard("Recorded as complete") {
            SupportingText("${JournalDates.dateLabel(JournalDates.day(completion.occurredAt, context.zone))} · ${JournalDates.inputTime(completion.occurredAt, context.zone)} · caregiver entry")
            SoftPawsRow("View Journal record", "This occurrence’s saved entry", "notebook-pen") { context.navigation.detail(completion.dogId, completion.id) }
        }
    } else if (date < JournalDates.day(context.now, context.zone)) CaptionText("Nothing is recorded as complete for this planned date.")
    SoftPawsRow("Reschedule or edit", "Your other tasks stay as they are", "calendar") { context.open(Feature.TaskForm, "${selected.id}@$date") }
    if (task.remind) {
        BarkTextAction(if (reminderBusy) "Updating reminder…" else if (permission is DeviceResult.Success) "Refresh chosen reminder" else "Enable notifications", {
            reminderBusy = true
            scope.launch {
                try { reminderMessage = TaskReminders.refresh(selected, context.care.items(selected.dogId), context.platform.device, context.platform.nowMillis(), ask = true); permission = context.platform.device.notificationAccess() }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { reminderMessage = "Your task is saved. Couldn't update its reminder; try again." }
                finally { reminderBusy = false }
            }
        }, enabled = !reminderBusy && !context.saving, icon = "bell")
        if (permission == DeviceResult.Denied) BarkTextAction("Open notification settings", {
            if (!context.platform.device.openSettings()) actionError = "Couldn't open system settings. You can change notifications in your device settings."
        }, icon = "settings")
        reminderMessage?.let { SupportingText(it) }
        BarkTextAction("Turn reminder off", { scope.launch {
            context.care.save(selected.dogId, selected.id, selected.occurredAt, task.copy(remind = false), selected.revision)
        } }, enabled = !context.saving, icon = "bell-off")
    }
    CaptionText("Tasks are plans. Completion records only what you enter.")
    BoardStickyAction {
        actionError?.let { ErrorCard(it) }
        BarkButton(if (checking) "Opening completion…" else if (completion != null) "Mark incomplete" else "Mark complete", {
            scope.launch {
                if (completion != null) {
                    context.care.clearError()
                    checking = true
                    try { undo = TaskUndo(completion, context.repository.observeEvent(completion.dogId, completion.id).first()?.revision) }
                    catch (cancelled: CancellationException) { throw cancelled }
                    catch (_: Exception) { actionError = "Couldn't open the completion. Your saved care is unchanged; try again." }
                    finally { checking = false }
                } else {
                    if (requestedAt == 0L) requestedAt = context.platform.nowMillis()
                    val saved = context.care.activity(selected.dogId, requestId, requestedAt, CareItemData.Completion(selected.id, task.title, date.toString(), selected.revision))
                    if (saved != null) { requestId = context.platform.newId(); requestedAt = 0L; context.activityLogged(saved); backToAgenda(context) }
                }
            }
        }, enabled = !context.saving && !checking && (occurs || completion != null))
        BarkTextAction("Remove task", { context.care.clearError(); removal = selected }, enabled = !context.saving && !checking, danger = true, icon = "trash")
    }
    removal?.let { captured ->
        BoardConfirmDialog("Remove this task?", "${task.title} and its future reminders will be removed. Previously recorded care stays in Journal." + context.careState.error?.let { "\n\n$it" }.orEmpty(), "Remove planned task", context.saving,
            { removal = null }, keepLabel = "Keep task") { scope.launch { if (context.care.delete(captured)) { removal = null; backToAgenda(context) } } }
    }
    undo?.let { captured ->
        BoardConfirmDialog("Mark this occurrence incomplete?", "Remove its completion mark${if (captured.eventRevision != null) " and linked Journal entry" else ""}. Other occurrences and records stay saved." + context.careState.error?.let { "\n\n$it" }.orEmpty(), "Undo completion", context.saving,
            { undo = null }, keepLabel = "Keep completion") { scope.launch {
            if (context.care.undoTaskCompletion(captured.completion, captured.eventRevision)) { undo = null; backToAgenda(context) }
        } }
    }
}

@Composable
private fun TaskFact(label: String, value: String, icon: String) {
    val tone = SoftPawsDesignTokens.iconTones[icon] ?: "mint"
    Row(Modifier.fillMaxWidth().heightIn(min = 62.dp).padding(vertical = 13.dp).semantics(mergeDescendants = true) {},
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Surface(shape = RoundedCornerShape(14.dp), color = boardColor(tone), border = BorderStroke(1.dp, boardColor("$tone-line"))) {
            Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(20.dp), boardColor("$tone-ink")) }
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) { Text(label, style = MaterialTheme.typography.bodyMedium); CaptionText(value) }
    }
}

private fun backToAgenda(context: FeatureContext) {
    val id = context.navigation.featureStack.lastOrNull { it.feature == Feature.Calendar }?.id.orEmpty()
    context.navigation.returnTo(Feature.Calendar, id)
}

private fun taskRepeat(repeat: Repeat) = when (repeat) { Repeat.None -> "Does not repeat"; Repeat.Daily -> "Every day"; Repeat.Weekly -> "Every week"; Repeat.Monthly -> "Every month" }

/** Retained callers use the same truthful, bounded device reminder boundary. */
suspend fun updateTaskReminder(context: FeatureContext, item: CareItem, requestPermission: Boolean): String =
    TaskReminders.refresh(item, context.care.items(item.dogId), context.platform.device, context.platform.nowMillis(), requestPermission).also(context.care::notice)
