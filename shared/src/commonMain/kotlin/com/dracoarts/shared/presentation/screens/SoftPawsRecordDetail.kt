package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.AppState
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone

/** Record detail and deliberate scoped deletion from the approved cat board. */
@Composable
internal fun SoftPawsRecordDetail(record: CareEvent, catName: String, controller: EventController,
    navigation: AppState, newId: () -> String, zone: TimeZone, context: FeatureContext) {
    var confirmingDelete by rememberSaveable(record.id) { mutableStateOf(context.reviewScreen in setOf("delete-record", "delete-confirmation")) }
    var deletionRevision by rememberSaveable(record.id) { mutableLongStateOf(record.revision) }
    val status by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    DisposableEffect(record.id, confirmingDelete, status.saving) {
        val guard: () -> Boolean = { if (confirmingDelete) { if (!status.saving) confirmingDelete = false; true } else false }
        if (confirmingDelete) navigation.backGuard = guard
        onDispose { if (navigation.backGuard === guard) navigation.backGuard = null }
    }
    BoardBackButton({ if (confirmingDelete) confirmingDelete = false else navigation.back() }, !status.saving)
    val date = JournalDates.dateLabel(JournalDates.day(record.occurredAtMillis, zone))
    val time = JournalDates.inputTime(record.occurredAtMillis, zone)
    if (confirmingDelete) {
        SoftPawsHeading("Delete this record?", "This action needs a deliberate choice.", accent = "record?")
        Surface(shape = RoundedCornerShape(24.dp), color = boardColor("bad-soft"), border = BorderStroke(1.dp, boardColor("bad"))) {
            Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionTitle("This record only")
                Text("${record.type.label} · $catName · $date at $time", style = MaterialTheme.typography.bodyMedium)
                SupportingText("Other cats, records and drafts stay where they are. This record cannot be recovered after deletion.")
            }
        }
        status.error?.let { ErrorText(it) }
        if (status.conflict) BarkTextAction("Review saved record", { confirmingDelete = false; controller.clearError() })
        BoardStickyAction {
            BarkButton("Keep record", { confirmingDelete = false }, enabled = !status.saving)
            BarkTextAction(if (status.saving) "Deleting on this device…" else "Delete permanently", {
                scope.launch {
                    if (controller.delete(record.copy(revision = deletionRevision))) {
                        confirmingDelete = false
                        navigation.backGuard = null
                        navigation.closePage()
                    }
                }
            }, Modifier.fillMaxWidth(), enabled = !status.saving && !status.conflict, danger = true, icon = "trash")
        }
        return
    }
    SoftPawsHeading(journalRecordTitle(record), "$catName · $date")
    SoftPawsCard("What you recorded") {
        val facts = buildList {
            val meal = record.details as? CareDetails.Meal
            if (meal != null) {
                add(Triple("Observation", meal.eaten?.label ?: "Not recorded", "utensils"))
                add(Triple("Recorded amount", meal.offeredGrams?.let { "$it g offered · intake not measured" } ?: "Not measured", "activity"))
                meal.food?.let { add(Triple("Food", it, "utensils")) }
                meal.portion?.let { add(Triple("Portion entered", it, "activity")) }
            } else {
                detailLines(record.details).forEach { line ->
                    val split = line.indexOf(": ")
                    add(Triple(if (split >= 0) line.substring(0, split) else "Observation", if (split >= 0) line.substring(split + 2) else line, record.type.iconName()))
                }
                if (record.details == null) add(Triple("Observation", record.type.label, record.type.iconName()))
            }
            add(Triple("Time", "$time · local time", "clock"))
            record.context.observations.filterKeys { it != "Title" }.forEach { (label, value) -> add(Triple(label, value, "notebook-pen")) }
            if (record.context.location.isNotBlank()) add(Triple("Place", record.context.location, "map-pin"))
            if (record.context.caregiver.isNotBlank()) add(Triple("Recorded by", record.context.caregiver, "user"))
        }
        facts.forEachIndexed { index, (label, value, icon) ->
            if (index > 0) HorizontalDivider(color = boardColor("hair"))
            SoftPawsFact(label, value, icon, record.type.key.takeIf { icon == record.type.iconName() })
        }
    }
    SoftPawsSection("Your note")
    Text(record.note ?: "No note added.", style = MaterialTheme.typography.bodyLarge)
    record.context.photoId?.let { LocalPhoto(it, "Photo attached to this ${record.type.label.lowercase()} record", context.platform.device) }
    CaptionText("A caregiver observation. This does not establish a health condition.")
    CaptionText("Saved on this device · ${if (record.revision > 1) "edited record · revision ${record.revision}" else "original record"}")
    status.error?.let { ErrorText(it) }
    BoardStickyAction {
        if (record.type in CareEventRules.detailedTypes) BarkButton("Edit record", { navigation.edit(record.dogId, record.id, newId()) }, enabled = !status.saving)
        else CaptionText("These activity facts stay as recorded. Manage their plan from Care.")
        BarkTextAction("Delete record", { deletionRevision = record.revision; controller.clearError(); confirmingDelete = true }, Modifier.fillMaxWidth(), enabled = !status.saving, danger = true)
    }
}

@Composable
private fun SoftPawsFact(label: String, value: String, icon: String, family: String? = null) {
    val tone = SoftPawsDesignTokens.iconTones[icon] ?: "mint"
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp).semantics(mergeDescendants = true) {}, horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Surface(shape = RoundedCornerShape(14.dp), color = boardColor(family?.let { "$it-bg" } ?: tone), border = BorderStroke(1.dp, boardColor(family?.let { "$it-line" } ?: "$tone-line"))) {
            Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(20.dp), boardColor(family?.let { "$it-ink" } ?: "$tone-ink")) }
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(label, style = MaterialTheme.typography.bodyMedium)
            Text(value, style = MaterialTheme.typography.bodySmall, color = boardColor("ink-muted"))
        }
    }
}
