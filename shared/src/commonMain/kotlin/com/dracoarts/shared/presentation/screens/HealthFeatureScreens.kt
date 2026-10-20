package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import androidx.compose.ui.Alignment
import kotlinx.coroutines.launch

@Composable
fun HealthFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val plans = context.items.filter { it.data is CareItemData.Medication }
    val selected = context.items.firstOrNull { it.id == page.id }
    when (page.feature) {
        Feature.Health -> {
            ScreenHeading("Health records", "${context.dog.name} · caregiver records")
            val administrations = context.items.count { it.data is CareItemData.Administration }
            BoardMenu {
                FeatureRow("Medication", "${plans.count { !(it.data as CareItemData.Medication).archived }} active plans · $administrations recorded administrations", "pill") { context.open(Feature.Medications) }
                FeatureRow("Vaccinations", "${context.items.count { it.data is CareItemData.Vaccination }} recorded vaccinations", "shield-check") { context.open(Feature.Vaccinations) }
            }
        }
        Feature.Medications -> {
            val active = plans.count { !(it.data as CareItemData.Medication).archived }
            ScreenHeading("Medication", "${context.dog.name} · $active active ${if (active == 1) "plan" else "plans"}")
            BarkButton("Add medication plan", { context.open(Feature.MedicationForm) }, secondary = true, icon = "plus")
            listOf(false, true).forEach { archived ->
                SectionTitle(if (archived) "Archived" else "Active")
                val group = plans.filter { (it.data as CareItemData.Medication).archived == archived }
                if (group.isEmpty()) { if (archived) JournalCard { SectionTitle("No archived plans"); SupportingText("Plans you archive will stay available as history.") } else FeatureNotice("No active plans", "Add a plan only when you have directions to record.", "pill") }
                else BoardMenu { group.forEach { item -> val plan = item.data as CareItemData.Medication
                    FeatureRow(plan.name, "${plan.amount} · ${plan.frequency.lowercase()} · entered by caregiver", "pill", meta = plan.time) { context.open(Feature.MedicationDetail, item.id) }
                } }
            }
        }
        Feature.MedicationForm -> {
            val old = selected?.data as? CareItemData.Medication
            if (page.id.isNotBlank() && old == null) { FeatureNotice("Plan unavailable", "It may have been removed. Your other records remain saved."); return }
            val initial = mapOf("name" to old?.name.orEmpty(), "amount" to old?.amount.orEmpty(), "directions" to old?.directions.orEmpty(), "frequency" to (old?.frequency ?: "As directed"), "date" to (old?.startDate ?: JournalDates.inputDate(context.now, context.zone)), "time" to (old?.time ?: "20:00"))
            val form = rememberFeatureForm(context, "medication-${page.id}", initial)
            ScreenHeading(if (old == null) "Add medication plan" else "Edit medication plan", "Copy the directions exactly as provided.")
            FeatureInput(form, "name", "Medication name", !context.saving, max = 120)
            FeatureInput(form, "amount", "Amount and unit", !context.saving, max = 60, placeholder = "As prescribed by your vet")
            FeatureInput(form, "directions", "Directions · optional", !context.saving, multiline = true, max = 500)
            BoardSelect("Frequency", form["frequency"], listOf("Once daily", "Twice daily", "Every other day", "As directed").map { it to it }, !context.saving) { form["frequency"] = it }
            FeatureInput(form, "date", "Start date · YYYY-MM-DD", !context.saving, max = 10)
            FeatureInput(form, "time", "Recorded schedule time · HH:mm", !context.saving, max = 5)
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Save plan", { scope.launch { form.attempt {
                val data = CareItemData.Medication(form["name"].trim(), form["amount"].trim(), form["directions"].trim(), form["frequency"], form["date"], form["time"], old?.archived ?: false)
                val item = context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, data, form.expectedRevision, draftSlot = form.slot).also { if (it != null) form.completed = true }
                if (item != null) { if (old == null) form.reset(context.platform.newId(), initial); context.navigation.replace(Feature.MedicationDetail, item.id) }
            } } }, enabled = !context.saving, icon = "check")
        }
        Feature.MedicationDetail, Feature.MedicationArchive -> {
            val plan = selected?.data as? CareItemData.Medication
            if (plan == null) { FeatureNotice("Plan unavailable", "Your other records remain saved."); return }
            if (page.feature == Feature.MedicationArchive) {
                ScreenHeading("Archive this plan?", "Its history stays in the journal.")
                var confirming by remember { mutableStateOf(false) }
                FeatureNotice("Future schedule stops", "No future reminder will be scheduled for this plan.", "archive", tone = "warn")
                BarkButton("Keep plan active", context.navigation::back)
                BarkButton("Archive plan", { confirming = true }, enabled = !context.saving, secondary = true)
                if (confirming) ConfirmChange("Archive ${plan.name}?", "The plan and recorded administration facts remain available as history.", "Archive", context.saving, { confirming = false }) {
                    scope.launch { if (context.care.save(selected.dogId, selected.id, selected.occurredAt, plan.copy(archived = true), selected.revision) != null) context.navigation.replace(Feature.MedicationDetail, selected.id) }
                }
            } else {
                var administrationId by rememberSaveable(selected.id) { mutableStateOf(context.platform.newId()) }
                var administrationAt by rememberSaveable(selected.id) { mutableLongStateOf(0L) }
                var administrationFailed by rememberSaveable(selected.id) { mutableStateOf(false) }
                fun recordGiven() { scope.launch {
                    if (administrationAt == 0L) administrationAt = context.platform.nowMillis()
                    val item = context.care.activity(context.dog.id, administrationId, administrationAt, CareItemData.Administration(selected.id, plan.name, plan.amount))
                    if (item != null) { administrationFailed = false; administrationId = context.platform.newId(); administrationAt = 0L; context.activityLogged(item); context.open(Feature.MedicationGiven, item.id) }
                    else { administrationFailed = true; context.care.clearError() }
                } }
                if (administrationFailed) {
                    FeatureNotice("Administration not saved", "No ‘given’ record was added. Check the time and retry once.", "circle-x", tone = "bad")
                    JournalCard { SectionTitle(plan.name); Text("${JournalDates.dateLabel(JournalDates.day(administrationAt, context.zone))} · ${JournalDates.inputTime(administrationAt, context.zone)} · caregiver entry", style = MaterialTheme.typography.bodyMedium) }
                    BarkButton(if (context.saving) "Saving…" else "Retry save", ::recordGiven, enabled = !context.saving, icon = "refresh-cw")
                    BarkButton("Cancel without recording", { administrationFailed = false; administrationAt = 0L; administrationId = context.platform.newId(); context.care.clearError() }, secondary = true, enabled = !context.saving)
                    HealthSource()
                    return
                }
                BoardIdentityHeading(plan.name, if (plan.archived) "Archived · history retained" else "Active · entered by caregiver", "pill", "medication", "medication-${selected.id}")
                JournalCard { CaptionText("SCHEDULE"); BoardTotal("${plan.amount} · ${plan.time}"); SupportingText(listOf(plan.frequency, plan.directions).filter(String::isNotBlank).joinToString(" · ")); HorizontalDivider(); CaptionText("Started ${JournalDates.dateLabel(kotlinx.datetime.LocalDate.parse(plan.startDate))}") }
                if (!plan.archived) {
                    FeatureNotice("Next planned time · ${plan.time}", "A schedule record is not proof that a dose was given.", "clock")
                    BarkButton(if (context.saving) "Saving…" else "Mark given", ::recordGiven, enabled = !context.saving, icon = "check")
                }
                BarkButton("Edit plan", { context.open(Feature.MedicationForm, selected.id) }, secondary = true, icon = "pencil")
                if (!plan.archived) BarkTextAction("Archive plan", { context.open(Feature.MedicationArchive, selected.id) }, icon = "archive")
                SectionTitle("History")
                val history = context.items.filter { (it.data as? CareItemData.Administration)?.planId == selected.id }
                if (history.isEmpty()) CaptionText("No administrations recorded.")
                if (history.isNotEmpty()) BoardMenu { history.forEach { item ->
                    FeatureRow("Recorded as given", JournalDates.dateLabel(JournalDates.day(item.occurredAt, context.zone)), "circle-check", meta = JournalDates.inputTime(item.occurredAt, context.zone)) { context.navigation.detail(item.dogId, item.id) }
                } }
            }
        }
        Feature.MedicationGiven -> {
            val given = selected?.data as? CareItemData.Administration
            if (given == null) { FeatureNotice("Record unavailable", "Open Timeline to find your recorded care."); return }
            FeatureNotice("Recorded as given", "${given.name} · ${given.amount} · ${JournalDates.timeLabel(selected.occurredAt, context.zone)}", "circle-check")
            JournalCard { CaptionText("TIMELINE RECORD"); Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) { EventMark(CareEventType.Medication); Column(Modifier.weight(1f)) { SectionTitle(given.name); SupportingText("${given.amount} · ${JournalDates.inputTime(selected.occurredAt, context.zone)}"); CaptionText(JournalDates.dateLabel(JournalDates.day(selected.occurredAt, context.zone))) } } }
            BarkButton("Done", { context.navigation.show(Route.Home) }, icon = "check")
            BarkButton("View record", { context.navigation.detail(selected.dogId, selected.id) }, secondary = true)
        }
        Feature.Vaccinations -> {
            ScreenHeading("Vaccinations", "${context.dog.name} · recorded history")
            BarkButton("Add vaccination", { context.open(Feature.VaccinationForm) }, secondary = true, icon = "plus")
            val records = context.items.filter { it.data is CareItemData.Vaccination }
            if (records.isEmpty()) FeatureNotice("No vaccinations recorded", "Add a record from the documentation your provider gave you.", "shield-check")
            if (records.isNotEmpty()) BoardMenu { records.forEach { item -> val data = item.data as CareItemData.Vaccination
                FeatureRow(data.name, "Recorded ${JournalDates.dateLabel(kotlinx.datetime.LocalDate.parse(data.date))}", "shield-check", meta = "Date noted") { context.open(Feature.VaccinationForm, item.id) }
            } }
        }
        Feature.VaccinationForm -> {
            val old = selected?.data as? CareItemData.Vaccination
            val initial = mapOf("name" to old?.name.orEmpty(), "date" to (old?.date ?: JournalDates.inputDate(context.now, context.zone)), "provider" to old?.provider.orEmpty(), "notes" to old?.notes.orEmpty(), "due" to old?.dueDate.orEmpty())
            val form = rememberFeatureForm(context, "vaccination-${page.id}", initial)
            ScreenHeading(if (old == null) "Add vaccination" else "Vaccination record", "Record what was provided.")
            FeatureInput(form, "name", "Vaccination name", !context.saving, max = 120)
            FeatureInput(form, "date", "Date recorded · YYYY-MM-DD", !context.saving, max = 10)
            FeatureInput(form, "provider", "Clinic or provider · optional", !context.saving, max = 160)
            FeatureInput(form, "due", "Provider-entered due date · optional", !context.saving, max = 10)
            FeatureInput(form, "notes", "Notes · optional", !context.saving, multiline = true)
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Save vaccination", { scope.launch { form.attempt {
                val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, selected?.occurredAt ?: form.createdAt, CareItemData.Vaccination(form["name"].trim(), form["date"], form["provider"].trim(), form["notes"].trim(), form["due"]), form.expectedRevision, draftSlot = form.slot).also { if (it != null) form.completed = true }
                if (saved != null) { if (old == null) form.reset(context.platform.newId(), initial); context.navigation.back() }
            } } }, enabled = !context.saving, icon = "check")
        }
        else -> error("Not a health destination")
    }
    HealthSource()
}

@Composable
private fun HealthSource() {
    HorizontalDivider(color = com.dracoarts.shared.presentation.theme.boardColor("hair"))
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Top) { BarkIcon("info", Modifier.size(14.dp)); CaptionText("Caregiver-entered record. Soft Paws does not calculate doses or recommend treatment.", Modifier.weight(1f)) }
}
