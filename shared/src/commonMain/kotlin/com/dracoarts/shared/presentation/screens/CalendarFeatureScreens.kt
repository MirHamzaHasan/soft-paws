package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import com.dracoarts.shared.presentation.theme.boardColor
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.CancellationException
import kotlinx.datetime.*

@Composable
fun CalendarFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val today = JournalDates.day(context.now, context.zone)
    val taskId = page.id.substringBefore('@')
    val selected = context.items.firstOrNull { it.id == taskId && it.data is CareItemData.Task }
    when (page.feature) {
        Feature.Calendar -> {
            var dayText by rememberSaveable { mutableStateOf(today.toString()) }
            val day = LocalDate.parse(dayText)
            ScreenHeading("Care calendar", "${context.dog.name} · ${day.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${day.year}")
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                val weekStart = day.minus(day.dayOfWeek.ordinal, DateTimeUnit.DAY)
                repeat(7) { offset -> val date = weekStart.plus(offset, DateTimeUnit.DAY); val chosen = date == day
                    Surface(onClick = { dayText = date.toString() }, modifier = Modifier.widthIn(min = 48.dp).heightIn(min = 58.dp).semantics { this.selected = chosen }, shape = RoundedCornerShape(16.dp), color = boardColor(if (chosen) "ink-strong" else "panel"), contentColor = boardColor(if (chosen) "ground" else "ink"), border = BorderStroke(1.dp, boardColor("hair"))) { Column(Modifier.padding(horizontal = 10.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) { Text(date.day.toString(), style = MaterialTheme.typography.bodySmall); Text(date.dayOfWeek.name.take(1), style = MaterialTheme.typography.bodySmall) } }
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                BarkTextAction("Previous", { dayText = day.minus(1, DateTimeUnit.DAY).toString() }, icon = "arrow-left", leading = true)
                BarkTextAction("Today", { dayText = today.toString() })
                BarkTextAction("Next", { dayText = day.plus(1, DateTimeUnit.DAY).toString() }, icon = "arrow-right")
            }
            BarkButton("Add care task", { context.open(Feature.TaskForm, "new@$dayText") }, secondary = true, icon = "plus")
            SectionTitle(JournalDates.headingDate(day).replace(", ", " · "))
            val completedIds = context.items.mapNotNull { (it.data as? CareItemData.Completion)?.takeIf { it.dueDate == dayText }?.taskId }.toSet()
            val tasks = context.items.filter { (it.data as? CareItemData.Task)?.let { data -> CareSchedule.occurs(data, day) } == true }
                .sortedWith(compareBy<CareItem> { it.id in completedIds }.thenBy { (it.data as CareItemData.Task).time })
            if (tasks.isEmpty()) FeatureNotice("No tasks on this day", "Add a task when you want it in the agenda.", "calendar")
            if (tasks.isNotEmpty()) BoardMenu { tasks.forEach { item -> val data = item.data as CareItemData.Task
                val completion = context.items.firstOrNull { (it.data as? CareItemData.Completion)?.let { it.taskId == item.id && it.dueDate == dayText } == true }
                FeatureRow(data.title, completion?.let { "Completed ${JournalDates.inputTime(it.occurredAt, context.zone)}" } ?: repeatLabel(data.repeat), if (completion != null) "circle-check" else if (data.category == "Preventive") "pill" else "calendar", meta = if (completion != null) "Done" else data.time) { context.open(Feature.TaskDetail, "${item.id}@$dayText") }
            } }
            val overdue = context.items.mapNotNull { item -> val data = item.data as? CareItemData.Task ?: return@mapNotNull null; val first = LocalDate.parse(data.date); if (first >= today) return@mapNotNull null
                val completed = context.items.mapNotNull { (it.data as? CareItemData.Completion)?.takeIf { it.taskId == item.id }?.dueDate }.toSet()
                val date = CareSchedule.latestUncompletedBefore(data, today, completed)
                date?.let { item to it }
            }
            if (overdue.isNotEmpty()) { SectionTitle("Overdue"); BoardMenu { overdue.forEach { (item, date) -> val task = item.data as CareItemData.Task; FeatureRow(task.title, "Due ${JournalDates.dateLabel(date)} · no completion recorded", "alarm-clock", meta = "Overdue", tone = "training") { context.open(Feature.TaskDetail, "${item.id}@$date") } } } }
            CaptionText("Tasks save locally. Reminders are optional.")
        }
        Feature.TaskForm -> {
            val old = selected?.data as? CareItemData.Task
            val initial = mapOf("title" to old?.title.orEmpty(), "date" to (old?.date ?: page.id.substringAfter('@', today.toString())), "time" to (old?.time ?: "09:00"), "repeat" to (old?.repeat?.name ?: "None"), "category" to (old?.category ?: "Custom"), "notes" to old?.notes.orEmpty())
            val form = rememberFeatureForm(context, "task-${page.id}", initial)
            ScreenHeading(if (old == null) "Add care task" else "Edit care task", "Plan what you want to remember.")
            FeatureInput(form, "title", "Task name", !context.saving, max = 160)
            BoardSelect("Category", form["category"], listOf("Refill", "Preventive", "Grooming", "Vaccination", "Vet visit", "Training", "Custom").map { it to it }, !context.saving) { form["category"] = it }
            FeatureInput(form, "date", "First date · YYYY-MM-DD", !context.saving, max = 10)
            FeatureInput(form, "time", "Time · HH:mm", !context.saving, max = 5)
            BoardSelect("Repeat", form["repeat"], Repeat.entries.map { it.name to if (it == Repeat.None) "Does not repeat" else it.name }, !context.saving) { form["repeat"] = it }
            if (form["repeat"] == "Monthly") CaptionText("Monthly uses the same date. Months without that date are skipped.")
            FeatureInput(form, "notes", "Notes · optional", !context.saving, multiline = true)
            CaptionText("Timezone: ${old?.zoneId ?: context.zone.id}. Reminders are optional after saving.")
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Save task", { scope.launch { form.attempt {
                val data = CareItemData.Task(form["title"].trim(), form["date"], form["time"], old?.zoneId ?: context.zone.id, form["category"], Repeat.valueOf(form["repeat"]), form["notes"].trim(), old?.remind ?: false)
                val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, data, form.expectedRevision, draftSlot = form.slot).also { if (it != null) form.completed = true }
                if (saved != null) {
                    if (data.remind) updateTaskReminder(context, saved, false)
                    if (old == null) form.reset(context.platform.newId(), initial)
                    if (data.remind) context.navigation.replace(Feature.TaskDetail, "${saved.id}@${data.date}") else context.navigation.replace(Feature.ReminderOptIn, saved.id)
                }
            } } }, enabled = !context.saving, icon = "check")
        }
        Feature.TaskDetail -> {
            val task = selected?.data as? CareItemData.Task
            if (task == null) { FeatureNotice("Task unavailable", "It may have been removed. Completed care remains in Timeline."); return }
            val date = page.id.split('@').getOrNull(1) ?: task.date
            val complete = context.items.firstOrNull { (it.data as? CareItemData.Completion)?.let { it.taskId == selected.id && it.dueDate == date } == true }
            var completionId by rememberSaveable(selected.id, date) { mutableStateOf(context.platform.newId()) }
            var completionAt by rememberSaveable(selected.id, date) { mutableLongStateOf(0L) }
            var confirmDelete by remember { mutableStateOf(false) }
            var reminderMessage by rememberSaveable(selected.id) { mutableStateOf<String?>(null) }
            if (page.id.endsWith("@delete")) {
                ScreenHeading("Delete this task?", task.title)
                FeatureNotice("Future occurrences will be removed", "Completed records remain in Timeline.", "calendar", tone = "warn")
                BarkButton("Keep task", context.navigation::back)
                BarkButton("Delete task", { confirmDelete = true }, secondary = true, enabled = !context.saving)
                if (confirmDelete) ConfirmChange("Delete this care task?", "Future occurrences and reminders are removed. Completed care records remain.", "Delete task", context.saving, { confirmDelete = false }) { scope.launch { if (context.care.delete(selected)) { context.platform.device.cancelReminder(selected.id); context.navigation.replace(Feature.Calendar) } } }
                return
            }
            if (complete != null) {
                FeatureNotice("Task completed", "${task.title} · ${JournalDates.dateLabel(JournalDates.day(complete.occurredAt, context.zone))} · ${JournalDates.inputTime(complete.occurredAt, context.zone)}", "circle-check-big")
                JournalCard { CaptionText("TIMELINE RECORD"); SectionTitle(task.title); SupportingText("Completed · ${JournalDates.inputTime(complete.occurredAt, context.zone)}") }
                BarkButton("View Timeline", { context.navigation.show(Route.Timeline) })
                BarkButton("Back to calendar", { context.navigation.replace(Feature.Calendar) }, secondary = true)
                return
            }
            val overdue = LocalDate.parse(date) < today
            if (overdue) FeatureNotice("Overdue since ${JournalDates.dateLabel(LocalDate.parse(date))}", "${task.title} · no completion recorded.", "alarm-clock")
            else {
                BoardIdentityHeading(task.title, if (date == today.toString()) "Today · ${task.time}" else "$date · ${task.time}", "calendar", "training", "calendar-task-${selected.id}")
                JournalCard { CaptionText("REPEATS"); BoardTotal(repeatLabel(task.repeat)); SupportingText("Starting ${JournalDates.dateLabel(LocalDate.parse(task.date))}"); if (task.notes.isNotBlank()) Text(task.notes) }
                FeatureNotice(if (task.remind) "Reminder requested" else "Reminder not enabled", "The task is saved and will remain in the calendar.", if (task.remind) "bell" else "bell-off")
            }
            BarkButton(if (context.saving) "Saving…" else if (overdue) "Mark complete now" else "Mark complete", { scope.launch {
                if (completionAt == 0L) completionAt = context.platform.nowMillis()
                val saved = context.care.activity(context.dog.id, completionId, completionAt, CareItemData.Completion(selected.id, task.title, date))
                if (saved != null) { completionId = context.platform.newId(); completionAt = 0L; context.activityLogged(saved); updateTaskReminder(context, selected, false) }
            } }, enabled = !context.saving, icon = "check")
            BarkButton(if (overdue) "Reschedule" else "Edit task", { context.open(Feature.TaskForm, selected.id) }, secondary = true, icon = if (overdue) "calendar" else "pencil")
            if (!task.remind) BarkButton("Set a reminder", { context.open(Feature.ReminderOptIn, selected.id) }, secondary = true, icon = "bell")
            else {
                BarkTextAction("Turn reminder off", { scope.launch {
                    if (context.care.save(selected.dogId, selected.id, selected.occurredAt, task.copy(remind = false), selected.revision) != null) {
                        try { context.platform.device.cancelReminder(selected.id); reminderMessage = "Reminder turned off. Task stays saved." } catch (_: Exception) { reminderMessage = "Task saved. Open BarkLog again to finish updating this reminder." }
                    }
                } }, enabled = !context.saving, icon = "bell-off")
                BarkTextAction("Refresh reminder", { scope.launch { reminderMessage = updateTaskReminder(context, selected, true) } }, enabled = !context.saving, icon = "refresh-cw")
            }
            reminderMessage?.let { FeatureNotice("Reminder status", it, "bell") }
            BarkTextAction("Delete task", { context.open(Feature.TaskDetail, "${selected.id}@$date@delete") }, enabled = !context.saving, danger = true, icon = "trash")
            if (confirmDelete) ConfirmChange("Delete this task?", "Future occurrences and reminders are removed. Completed Timeline records remain.", "Delete task", context.saving, { confirmDelete = false }) {
                scope.launch { if (context.care.delete(selected)) { context.platform.device.cancelReminder(selected.id); context.navigation.back() } }
            }
        }
        Feature.ReminderOptIn -> {
            val task = selected?.data as? CareItemData.Task
            if (task == null) { FeatureNotice("Task unavailable", "Your other tasks remain saved."); return }
            var result by rememberSaveable(selected.id) { mutableStateOf<String?>(null) }
            var outcome by rememberSaveable(selected.id) { mutableStateOf<String?>(null) }
            var requesting by remember { mutableStateOf(false) }
            val enable: (Boolean) -> Unit = { permission -> scope.launch {
                requesting = true
                try {
                    val updated = context.care.save(selected.dogId, selected.id, selected.occurredAt, task.copy(remind = true), selected.revision)
                    if (updated != null) { val attempt = attemptTaskReminder(context, updated, permission); result = attempt.message; outcome = attempt.kind.name }
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { result = "The task is saved. Couldn't schedule this reminder. Try again."; outcome = ReminderOutcomeKind.Failed.name }
                finally { requesting = false }
            }; Unit }
            when (outcome) {
                ReminderOutcomeKind.Denied.name -> {
                    FeatureNotice("Task saved · reminder off", "Notification permission was not granted. The task remains in the calendar.", "bell-off", tone = "warn")
                    var settingsFailed by remember { mutableStateOf(false) }
                    BoardHandoff("settings-2", "Change this later", "Open BarkLog notification settings in the operating system.", "Open system settings") { settingsFailed = !context.platform.device.openSettings() }
                    if (settingsFailed) ErrorCard("Couldn't open system settings. You can change notification access in your device settings.")
                    BarkButton("Done", context.navigation::back)
                }
                ReminderOutcomeKind.Failed.name -> { FeatureNotice("Task saved · reminder not scheduled", result ?: "The calendar entry is safe. Try scheduling its notification again.", "bell-off", tone = "bad"); BarkButton(if (requesting) "Updating reminder…" else "Try reminder again", { enable(false) }, enabled = !requesting && !context.saving, icon = "refresh-cw"); BarkButton("Keep task without reminder", context.navigation::back, secondary = true) }
                ReminderOutcomeKind.Scheduled.name -> { FeatureNotice("Task saved · reminder scheduled", result ?: "${task.title} · ${task.time}", "bell", tone = "good"); CaptionText("Delivery depends on device settings. Open BarkLog periodically to refresh future occurrences."); BarkButton("Done", context.navigation::back) }
                ReminderOutcomeKind.NoFuture.name -> { FeatureNotice("Task saved", result.orEmpty(), "calendar"); BarkButton("Done", context.navigation::back) }
                else -> {
                    ScreenHeading("Remind you at task time?", "The care task is already saved.")
                    BoardHandoff("bell", "Optional notifications", "BarkLog can show this task on this device. It does not contact a clinic, confirm care happened or send your journal anywhere.", if (requesting) "Updating reminder…" else "Continue to system permission", !requesting && !context.saving) { enable(true) }
                    BarkButton("Not now", context.navigation::back, secondary = true)
                    CaptionText("Notifications contain only a care-task prompt. Device settings and battery saving can delay delivery.")
                }
            }
        }
        else -> error("Not a calendar destination")
    }
}

private enum class ReminderOutcomeKind { Scheduled, Denied, Failed, NoFuture }
private data class ReminderOutcome(val kind: ReminderOutcomeKind, val message: String)

private suspend fun attemptTaskReminder(context: FeatureContext, item: CareItem, requestPermission: Boolean): ReminderOutcome {
    val task = item.data as CareItemData.Task
    val completed = context.care.items(item.dogId).mapNotNull { (it.data as? CareItemData.Completion)?.takeIf { it.taskId == item.id }?.dueDate }.toSet()
    val next = CareSchedule.next(task, context.platform.nowMillis(), completed)
    if (!task.remind || next == null) { context.platform.device.cancelReminder(item.id); return ReminderOutcome(ReminderOutcomeKind.NoFuture, "Task saved. No future occurrence needs a reminder.") }
    val upcoming = CareSchedule.upcoming(task, context.platform.nowMillis(), completed)
    return when (val result = context.platform.device.scheduleReminder(ReminderRequest(item.id, item.dogId, next.second, task.repeat, task.zoneId, upcoming), requestPermission)) {
        is DeviceResult.Success -> ReminderOutcome(ReminderOutcomeKind.Scheduled, "${task.title} · ${next.first} at ${task.time}.")
        DeviceResult.Denied -> ReminderOutcome(ReminderOutcomeKind.Denied, "Notifications are off. The task stays saved; you can enable reminders in device settings.")
        DeviceResult.Cancelled -> ReminderOutcome(ReminderOutcomeKind.Denied, "No reminder was enabled. The task stays saved.")
        is DeviceResult.Failed -> ReminderOutcome(ReminderOutcomeKind.Failed, result.message)
    }
}

suspend fun updateTaskReminder(context: FeatureContext, item: CareItem, requestPermission: Boolean): String = attemptTaskReminder(context, item, requestPermission).message.also(context.care::notice)

private fun repeatLabel(repeat: Repeat): String = when (repeat) {
    Repeat.None -> "Does not repeat"
    Repeat.Daily -> "Every day"
    Repeat.Weekly -> "Every week"
    Repeat.Monthly -> "Every month"
}
