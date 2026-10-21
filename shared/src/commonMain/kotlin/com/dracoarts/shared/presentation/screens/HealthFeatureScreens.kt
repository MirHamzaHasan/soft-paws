package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.state.MedicationReminders
import com.dracoarts.shared.services.DeviceResult
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime

internal val healthRecordScreens = setOf(Feature.Medications, Feature.MedicationForm, Feature.MedicationDetail,
    Feature.MedicationGiven, Feature.MedicationArchive, Feature.MedicationHistory, Feature.Vaccinations, Feature.VaccinationForm)

/** The approved prescribed-care chapter, backed by the existing local repository. */
@Composable
fun HealthFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val selected = context.items.firstOrNull { it.id == page.id }
    val plans = context.items.filter { it.data is CareItemData.Medication }
    when (page.feature) {
        Feature.Health -> {
            SoftPawsHeading("Care, in one place.", "${context.dog.name}’s records and routines", "in one place.")
            SoftPawsRow("Medication plans", "Only your vet’s instructions", "heart-pulse") { context.open(Feature.Medications) }
            SoftPawsRow("Vaccination records", "Dates and documents", "shield-check") { context.open(Feature.Vaccinations) }
        }
        Feature.Medications -> {
            SoftPawsHeading("Your vet’s plan, remembered.", "Record instructions you already have.", "remembered.")
            val active = plans.filter { !(it.data as CareItemData.Medication).archived }
            SoftPawsCard(if (active.isEmpty()) "No active medication plans" else "Your active plans") {
                if (active.isEmpty()) SupportingText("Add the label and schedule exactly as prescribed.")
                active.forEach { PlanRow(it, context) }
                SoftPawsRow("Previous plans", "Archived plans remain in the journal", "archive") { context.open(Feature.MedicationHistory) }
            }
            CaptionText("Soft Paws does not select medication or suggest doses.")
            BoardStickyAction { BarkButton("Add a prescribed plan", { context.open(Feature.MedicationForm) }) }
        }
        Feature.MedicationHistory -> {
            SoftPawsHeading("Care history, kept.", "Archived plans are still part of the journal.", "kept.")
            val archived = plans.filter { (it.data as CareItemData.Medication).archived }
            SoftPawsCard(if (archived.isEmpty()) "No archived plans" else "Previous prescribed plans") {
                if (archived.isEmpty()) SupportingText("Archived prescribed plans and their given history appear here.")
                archived.forEach { PlanRow(it, context) }
            }
            CaptionText("Your entered instructions and administration history stay readable.")
        }
        Feature.MedicationForm -> MedicationPlanEditor(selected, page, context)
        Feature.MedicationDetail, Feature.MedicationArchive -> MedicationPlanDetails(selected, page, context)
        Feature.MedicationGiven -> {
            val given = selected?.data as? CareItemData.Administration
            if (given == null) { FeatureNotice("Record unavailable", "Open Journal to find your recorded care."); return }
            SoftPawsHeading("Recorded as given.", "${given.name} · ${JournalDates.timeLabel(selected.occurredAt, context.zone)}", "given.")
            SoftPawsCard("What you recorded") {
                if (given.amount.isNotBlank()) Text(given.amount)
                if (given.instructions.isNotBlank()) Text(given.instructions)
                CaptionText("${JournalDates.dateLabel(JournalDates.day(selected.occurredAt, context.zone))} · caregiver entry")
            }
            BoardStickyAction {
                BarkButton("Back to plan", { context.navigation.returnTo(Feature.MedicationDetail, given.planId) })
                BarkTextAction("View journal record", { context.navigation.detail(selected.dogId, selected.id) })
            }
        }
        Feature.Vaccinations -> {
            SoftPawsHeading("Dates worth keeping close.", "Follow the schedule from your vet.", "keeping close.")
            val records = context.items.filter { it.data is CareItemData.Vaccination }
            SoftPawsCard(if (records.isEmpty()) "No vaccination records yet" else "Your saved records") {
                if (records.isEmpty()) SupportingText("Keep the date, clinic and document together.")
                records.forEach { item ->
                    val data = item.data as CareItemData.Vaccination
                    SoftPawsRow(data.name, listOf(data.date, data.provider, if (data.documentId != null) "Document attached" else "").filter(String::isNotBlank).joinToString(" · "), "shield-check") { context.open(Feature.VaccinationForm, item.id) }
                }
            }
            CaptionText("The app does not infer which vaccines your cat needs.")
            BoardStickyAction { BarkButton("Add a record", { context.open(Feature.VaccinationForm) }) }
        }
        Feature.VaccinationForm -> VaccinationRecordEditor(selected, page, context)
        else -> error("Not a health destination")
    }
}

@Composable
private fun PlanRow(item: CareItem, context: FeatureContext) {
    val plan = item.data as CareItemData.Medication
    val given = context.items.count { (it.data as? CareItemData.Administration)?.planId == item.id }
    SoftPawsRow(plan.name, listOf(plan.directions.ifBlank { plan.amount }, "$given recorded as given").joinToString(" · "), "pill") { context.open(Feature.MedicationDetail, item.id) }
}

@Composable
private fun MedicationPlanEditor(selected: CareItem?, page: FeaturePage, context: FeatureContext) {
    val old = selected?.data as? CareItemData.Medication
    if (page.id.isNotBlank() && old == null) { FeatureNotice("Plan unavailable", "Your other records remain saved."); return }
    val initial = mapOf("name" to old?.name.orEmpty(), "amount" to old?.amount.orEmpty(), "directions" to old?.directions.orEmpty(),
        "frequency" to (old?.frequency ?: "As directed"), "date" to (old?.startDate ?: JournalDates.inputDate(context.now, context.zone)),
        "time" to old?.time.orEmpty(), "remind" to (old?.reminder != null).toString(), "reminderTime" to old?.reminder?.time.orEmpty(),
        "reminderRepeat" to (old?.reminder?.repeat ?: Repeat.Daily).name, "reminderZone" to (old?.reminder?.zoneId ?: context.zone.id))
    val form = rememberFeatureForm(context, "medication-${page.id}", initial)
    val scope = rememberCoroutineScope()
    var more by rememberSaveable(form.requestId) { mutableStateOf(false) }
    SoftPawsHeading("Keep the prescribed details.", "Copy from the label or your vet’s plan.", "prescribed details.")
    HealthInput(form, "name", "Medication name", !context.saving, max = 120)
    HealthInput(form, "directions", "Prescribed instructions", !context.saving, multiline = true, max = 500)
    HealthInput(form, "date", "Start date · YYYY-MM-DD", !context.saving, max = 10)
    HealthCheck("Remind me at a time I choose", form["remind"] == "true", !context.saving) { form["remind"] = it.toString() }
    if (form["remind"] == "true") SoftPawsCard("Your chosen reminder") {
        HealthInput(form, "reminderTime", "Reminder time · HH:mm", !context.saving, max = 5)
        ChoiceField("Repeat this reminder", form["reminderRepeat"], Repeat.entries.map { it.name to healthRepeat(it) }, !context.saving) { form["reminderRepeat"] = it }
        CaptionText("Time zone · ${form["reminderZone"]}")
        SupportingText("This is a notification you choose, not instructions for giving medication. Permission is separate from saving the plan.")
    }
    BarkTextAction(if (more) "Hide recorded details" else "Amount and recorded details", { more = !more }, enabled = !context.saving, icon = "sliders-horizontal", leading = true)
    if (more) SoftPawsCard("Details from your plan") {
        HealthInput(form, "amount", "Amount and unit · optional", !context.saving, max = 60)
        HealthInput(form, "frequency", "Written frequency · optional", !context.saving, max = 100)
        HealthInput(form, "time", "Recorded schedule time · HH:mm · optional", !context.saving, max = 5)
        CaptionText("Existing facts stay as entered. The app does not turn this text into a reminder schedule.")
    }
    CaptionText("No dose calculations or treatment recommendations.")
    FeatureFormError(form)
    BoardStickyAction {
        BarkButton(if (context.saving) "Saving on this device…" else "Keep plan", { scope.launch { form.attempt {
            require(form["name"].isNotBlank()) { "Add the medication name." }
            healthDate(form["date"].trim(), "Enter the start date as YYYY-MM-DD.")
            if (form["remind"] == "true") require(runCatching { LocalTime.parse(form["reminderTime"].trim()) }.isSuccess) { "Enter a reminder time as HH:mm." }
            require(form["directions"].isNotBlank() || old != null && old.directions.isBlank() && form["amount"].isNotBlank()) { "Add the prescribed instructions." }
            val reminder = if (form["remind"] == "true") MedicationReminder(form["reminderTime"].trim(), form["reminderZone"], Repeat.valueOf(form["reminderRepeat"])) else null
            val data = CareItemData.Medication(form["name"].trim(), form["amount"].trim(), form["directions"].trim(), form["frequency"].trim().ifBlank { "As directed" }, form["date"].trim(), form["time"].trim(), old?.archived ?: false, reminder)
            val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, data, form.expectedRevision, draftSlot = form.slot)
            if (saved != null) {
                form.completed = true
                context.navigation.replace(Feature.MedicationDetail, saved.id)
            }
        } } }, enabled = !context.saving)
    }
}

@Composable
private fun MedicationPlanDetails(selected: CareItem?, page: FeaturePage, context: FeatureContext) {
    val plan = selected?.data as? CareItemData.Medication
    if (plan == null) { FeatureNotice("Plan unavailable", "Your other records remain saved."); return }
    val scope = rememberCoroutineScope()
    val history = context.items.filter { (it.data as? CareItemData.Administration)?.planId == selected.id }
    var historyLimit by rememberSaveable(selected.id) { mutableIntStateOf(50) }
    if (page.feature == Feature.MedicationArchive) {
        val revision = rememberSaveable(selected.id) { selected.revision }
        SoftPawsHeading("Archive this plan?", "Its history stays in the journal.", "plan?")
        SoftPawsCard(plan.name, "butter") {
                SupportingText("No future reminder will be scheduled for this plan. Its instructions and given history stay saved.")
        }
        BoardStickyAction {
            BarkButton("Keep plan active", context.navigation::back, enabled = !context.saving)
            BarkTextAction("Archive plan", { scope.launch {
                val saved = context.care.save(selected.dogId, selected.id, selected.occurredAt, plan.copy(archived = true), revision)
                if (saved != null) context.navigation.replace(Feature.MedicationHistory)
            } }, enabled = !context.saving, danger = true, icon = "archive")
        }
        return
    }
    var administrationId by rememberSaveable(selected.id) { mutableStateOf(context.platform.newId()) }
    var administrationAt by rememberSaveable(selected.id) { mutableLongStateOf(0L) }
    var failed by rememberSaveable(selected.id) { mutableStateOf(false) }
    var refreshing by remember { mutableStateOf(false) }
    var permission by remember(selected.id, selected.revision) { mutableStateOf<DeviceResult<Unit>?>(null) }
    var reminderResult by rememberSaveable(selected.id) { mutableStateOf<String?>(null) }
    LaunchedEffect(selected.id, selected.revision) {
        permission = context.platform.device.notificationAccess()
        if (!plan.archived && plan.reminder != null) {
            refreshing = true
            try { reminderResult = MedicationReminders.refresh(selected, context.platform.device, context.platform.nowMillis()) }
            finally { refreshing = false }
        }
    }
    fun recordGiven() { scope.launch {
        if (administrationAt == 0L) administrationAt = context.platform.nowMillis()
        val saved = context.care.activity(context.dog.id, administrationId, administrationAt,
            CareItemData.Administration(selected.id, plan.name, plan.amount, plan.directions, selected.revision))
        if (saved != null) {
            failed = false; administrationId = context.platform.newId(); administrationAt = 0L
            context.activityLogged(saved); context.open(Feature.MedicationGiven, saved.id)
        } else failed = true
    } }
    SoftPawsHeading(plan.name, "${context.dog.name} · ${if (plan.archived) "Archived plan" else "Your saved plan"}")
    SoftPawsCard("Your saved instructions") {
        Text(plan.directions.ifBlank { "No separate written instructions recorded." }, style = MaterialTheme.typography.bodyLarge)
        if (plan.amount.isNotBlank()) Text("Amount entered · ${plan.amount}")
        if (plan.frequency != "As directed") CaptionText("Written frequency · ${plan.frequency}")
        if (plan.time.isNotBlank()) CaptionText("Recorded schedule time · ${plan.time}")
        CaptionText("Start date · ${plan.startDate}")
    }
    val reminder = plan.reminder
    if (reminder != null && !plan.archived) SoftPawsCard("Your chosen reminder") {
        Text("${healthRepeat(reminder.repeat)} · ${reminder.time} · ${reminder.zoneId}")
        CaptionText("A notification choice, not proof that medication was given.")
        BarkTextAction(if (refreshing) "Updating reminder…" else if (permission is DeviceResult.Success) "Refresh chosen reminder" else "Enable notifications", {
            scope.launch {
                refreshing = true
                try { reminderResult = MedicationReminders.refresh(selected, context.platform.device, context.platform.nowMillis(), ask = true); permission = context.platform.device.notificationAccess() }
                finally { refreshing = false }
            }
        }, enabled = !refreshing && !context.saving, icon = "bell")
        if (permission == DeviceResult.Denied) BarkTextAction("Open notification settings", { context.platform.device.openSettings() }, icon = "settings")
        reminderResult?.let { SupportingText(it) }
    } else CaptionText(if (plan.archived) "Archived · reminders off" else "No reminder chosen.")
    SoftPawsSection("Given history")
    if (history.isEmpty()) CaptionText("Nothing recorded as given yet.")
    history.take(historyLimit).forEach { item ->
        SoftPawsRow("Recorded as given", "${JournalDates.dateLabel(JournalDates.day(item.occurredAt, context.zone))} · ${JournalDates.inputTime(item.occurredAt, context.zone)}", "circle-check") { context.navigation.detail(item.dogId, item.id) }
    }
    if (history.size > historyLimit) BarkTextAction("Show earlier administrations", { historyLimit = minOf(history.size, historyLimit + 50) }, icon = "archive")
    BarkTextAction("Edit prescribed details", { context.open(Feature.MedicationForm, selected.id) }, enabled = !context.saving, icon = "pencil")
    if (!plan.archived) SoftPawsRow("Archive this plan", "Retain the administration history", "archive") { context.open(Feature.MedicationArchive, selected.id) }
    HealthSource()
    if (failed) {
        ErrorText("No new ‘given’ record was saved. Your existing history is unchanged.")
        CaptionText("Retained time · ${JournalDates.inputDate(administrationAt, context.zone)} ${JournalDates.inputTime(administrationAt, context.zone)}")
        BarkTextAction("Cancel without recording", { failed = false; administrationAt = 0L; administrationId = context.platform.newId(); context.care.clearError() }, enabled = !context.saving)
    }
    if (!plan.archived) BoardStickyAction { BarkButton(if (context.saving) "Saving on this device…" else if (failed) "Retry save" else "Record as given", ::recordGiven, enabled = !context.saving) }
}

@Composable
private fun VaccinationRecordEditor(selected: CareItem?, page: FeaturePage, context: FeatureContext) {
    val old = selected?.data as? CareItemData.Vaccination
    if (page.id.isNotBlank() && old == null) { FeatureNotice("Record unavailable", "Your other records remain saved."); return }
    val form = rememberFeatureForm(context, "vaccination-${page.id}", mapOf("name" to old?.name.orEmpty(), "date" to (old?.date ?: JournalDates.inputDate(context.now, context.zone)),
        "provider" to old?.provider.orEmpty(), "due" to old?.dueDate.orEmpty(), "notes" to old?.notes.orEmpty(), "document" to old?.documentId.orEmpty()))
    val scope = rememberCoroutineScope()
    var picking by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    suspend fun retainDocument(value: String) {
        form.attempt {
            form["document"] = value
            context.care.saveDraft(context.dog.id, form.slot, LocalDraft(form.encode(), form.files()))
        }
    }
    SoftPawsHeading("A vaccination, recorded.", "Use the details from your clinic.", "recorded.")
    HealthInput(form, "name", "Name on the record", !context.saving, max = 120)
    HealthInput(form, "date", "Date given · YYYY-MM-DD", !context.saving, max = 10)
    HealthInput(form, "provider", "Clinic or vet · optional", !context.saving, max = 160)
    HealthInput(form, "due", "Next date, if your vet provided one · optional", !context.saving, max = 10)
    BarkTextAction(if (picking) "Opening native picker…" else if (form["document"].isBlank()) "Attach document" else "Change document", {
        scope.launch {
            picking = true
            try { when (val result = context.platform.device.pickReceipt()) {
                is DeviceResult.Success -> { retainDocument(result.value); message = null }
                DeviceResult.Cancelled -> message = "No document added. Your entries are still here."
                DeviceResult.Denied -> message = "This document was not accessible. You can keep the record without it."
                is DeviceResult.Failed -> message = result.message
            } } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { message = "The picker could not open. Your entries are still here." }
            finally { picking = false }
        }
    }, enabled = !picking && !context.saving, icon = "file-text", leading = true)
    CaptionText("Choose a local image or PDF. Nothing is uploaded.")
    if (form["document"].isNotBlank()) {
        VaccinationDocument(form["document"], context)
        BarkTextAction("Remove document", { scope.launch { picking = true; try { retainDocument("") } finally { picking = false } } }, enabled = !context.saving && !picking, icon = "x")
    }
    message?.let { SupportingText(it) }
    HealthInput(form, "notes", "Your note · optional", !context.saving, multiline = true)
    FeatureFormError(form)
    BoardStickyAction {
        BarkButton(if (context.saving) "Saving on this device…" else "Keep record", { scope.launch { form.attempt {
            require(form["name"].isNotBlank()) { "Add the name on the vaccination record." }
            healthDate(form["date"].trim(), "Enter the date given as YYYY-MM-DD.")
            if (form["due"].isNotBlank()) healthDate(form["due"].trim(), "Enter the vet-provided next date as YYYY-MM-DD.")
            val data = CareItemData.Vaccination(form["name"].trim(), form["date"].trim(), form["provider"].trim(), form["notes"].trim(), form["due"].trim(), form["document"].takeIf(String::isNotBlank))
            if (context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, data, form.expectedRevision, form.slot) != null) {
                form.completed = true; context.navigation.returnTo(Feature.Vaccinations)
            }
        } } }, enabled = !context.saving && !picking)
    }
}

@Composable
private fun VaccinationDocument(id: String, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    var opening by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var exists by remember(id) { mutableStateOf<Boolean?>(null) }
    LaunchedEffect(id) { exists = runCatching { context.platform.device.photoBytes(id) != null }.getOrDefault(false) }
    if (!id.endsWith(".pdf")) LocalPhoto(id, "Vaccination document on this device", context.platform.device)
    if (exists == false) ErrorText("The document file is missing. The vaccination details stay saved.")
    BarkTextAction(if (opening) "Opening document…" else "Open or share document", { scope.launch {
        opening = true
        try { when (val result = context.platform.device.shareAttachment(id)) {
            is DeviceResult.Success, DeviceResult.Cancelled -> error = null
            DeviceResult.Denied -> error = "The file is not accessible. The vaccination record stays saved."
            is DeviceResult.Failed -> error = result.message
        } } finally { opening = false }
    } }, enabled = !opening && exists == true, icon = "file-text")
    error?.let { ErrorText(it) }
}

@Composable
private fun HealthCheck(label: String, checked: Boolean, enabled: Boolean, changed: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 48.dp).toggleable(checked, enabled = enabled, role = Role.Checkbox, onValueChange = changed),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
        Checkbox(checked, null, enabled = enabled)
    }
}

private fun healthRepeat(repeat: Repeat) = when (repeat) { Repeat.None -> "Just once"; Repeat.Daily -> "Every day"; Repeat.Weekly -> "Every week"; Repeat.Monthly -> "Every month" }

@Composable
private fun HealthSource() { CaptionText("Caregiver-entered record. Soft Paws does not calculate doses or recommend treatment.") }

@Composable
private fun HealthInput(form: FeatureForm, key: String, label: String, enabled: Boolean, multiline: Boolean = false, max: Int = 2000) {
    BarkField(label, form[key], { if (it.length <= max) form[key] = it }, Modifier.fillMaxWidth(), enabled,
        multiline = multiline, softPaws = true)
}

private fun healthDate(value: String, message: String) {
    require(value.length == 10 && value[4] == '-' && value[7] == '-' && runCatching { LocalDate.parse(value) }.isSuccess) { message }
}
