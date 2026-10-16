package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.AppSpacing
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.presentation.state.observationSummary
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone

@Composable
fun TimelineScreen(journal: JournalState, controller: TimelineController, now: Long, zone: TimeZone, modifier: Modifier, photos: List<CareItem> = emptyList(), reviewScreen: String? = null, onPhoto: (CareItem) -> Unit = {}, onSwitchDog: () -> Unit = {}, onSelectDog: (String) -> Unit = {}, onDetail: (CareEvent) -> Unit) {
    val dogId = journal.selectedDogId.orEmpty()
    val filteredReview = reviewScreen == "timeline-filtered-empty"
    var typeKey by rememberSaveable { mutableStateOf(if (filteredReview) "medication" else "") }
    var from by rememberSaveable { mutableStateOf(if (filteredReview) "2026-10-01" else "") }
    var through by rememberSaveable { mutableStateOf(if (filteredReview) "2026-10-07" else "") }
    var appliedFrom by rememberSaveable { mutableStateOf(from) }
    var appliedThrough by rememberSaveable { mutableStateOf(through) }
    var dateError by rememberSaveable { mutableStateOf<String?>(null) }
    var limit by rememberSaveable { mutableIntStateOf(50) }
    var retry by remember { mutableIntStateOf(0) }
    var showingFilters by rememberSaveable { mutableStateOf(reviewScreen == "timeline-filters") }
    val state by controller.state.collectAsState()
    val filter = remember(dogId, typeKey, appliedFrom, appliedThrough, zone.id) {
        TimelineFilter(dogId, CareEventType.fromKey(typeKey), appliedFrom.takeIf { it.isNotEmpty() }?.let { JournalDates.dayBounds(LocalDate.parse(it), zone).first },
            appliedThrough.takeIf { it.isNotEmpty() }?.let { JournalDates.dayBounds(LocalDate.parse(it), zone).second })
    }
    LaunchedEffect(filter, limit, retry) { controller.observe(filter, limit) }
    LazyColumn(modifier.fillMaxWidth(), contentPadding = PaddingValues(start = AppSpacing.page, end = AppSpacing.page, top = 12.dp, bottom = 100.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { BoardDogChip(journal.dogs.firstOrNull { it.id == dogId }?.name ?: "Your dog", onSwitchDog); CaptionText("On this device") } }
        item { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { MarkerHeading("Timeline", ""); SupportingText("${journal.dogs.firstOrNull { it.id == dogId }?.name ?: "Selected dog"} · newest first") } }
        item {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (listOf("" to "All") + CareEventType.entries.map { it.key to it.label } + ("photo" to "Photos")).forEach { (key, label) ->
                    val chosen = typeKey == key
                    Surface(onClick = { typeKey = key; limit = 50 }, modifier = Modifier.heightIn(min = 48.dp).semantics { selected = chosen }, shape = RoundedCornerShape(50), color = boardColor(if (chosen) "ball" else "panel"), contentColor = boardColor(if (chosen) "ball-ink" else "ink"), border = if (chosen) null else BorderStroke(1.dp, boardColor("hair"))) {
                        Row(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                            if (key.isNotBlank()) BarkIcon(if (key == "photo") "image" else CareEventType.fromKey(key)!!.iconName(), Modifier.size(16.dp))
                            Text(label, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
        item { BarkTextAction(if (showingFilters) "Hide filters" else "Dates & dog", { showingFilters = !showingFilters }, icon = "sliders-horizontal", leading = true) }
        if (appliedFrom.isNotBlank() || appliedThrough.isNotBlank()) item { CaptionText("${appliedFrom.ifBlank { "Any start date" }} → ${appliedThrough.ifBlank { "Any end date" }}") }
        if (showingFilters) item {
            JournalCard {
                ChoiceField("Dog", dogId, journal.dogs.map { it.id to it.name }) { onSelectDog(it); limit = 50 }
                ChoiceField("Event type", typeKey, listOf("" to "All types") + CareEventType.entries.map { it.key to it.label } + ("photo" to "Photos")) { typeKey = it; limit = 50 }
                FormField("From date (optional)", from, true, { from = it }, maximum = 10, placeholder = "YYYY-MM-DD")
                FormField("Through date (optional)", through, true, { through = it }, maximum = 10, placeholder = "YYYY-MM-DD")
                dateError?.let { ErrorText(it) }
                BarkButton("Apply dates", onClick = {
                    try {
                        val start = from.trim().takeIf { it.isNotEmpty() }?.let { LocalDate.parse(it) }
                        val end = through.trim().takeIf { it.isNotEmpty() }?.let { LocalDate.parse(it) }
                        TimelineFilter(dogId, fromMillis = start?.let { JournalDates.dayBounds(it, zone).first }, untilMillis = end?.let { JournalDates.dayBounds(it, zone).second }).validate()
                        appliedFrom = from.trim(); appliedThrough = through.trim(); dateError = null; limit = 50
                    } catch (_: IllegalArgumentException) { dateError = "Enter valid dates as YYYY-MM-DD, with the end date on or after the start." }
                }, icon = "check")
                BarkTextAction("Clear filters", { from = ""; through = ""; appliedFrom = ""; appliedThrough = ""; typeKey = ""; dateError = null; limit = 50 })
            }
        }
        val photoRows = photos.filter { it.dogId == dogId && it.data is CareItemData.Photo && typeKey in listOf("", "photo") && (filter.fromMillis == null || it.occurredAt >= filter.fromMillis!!) && (filter.untilMillis == null || it.occurredAt < filter.untilMillis!!) }
        val eventRows = if (typeKey == "photo") emptyList() else state.page.events
        val rows = (eventRows.map { TimelineDisplay(it.id, it.occurredAtMillis, event = it) } + photoRows.map { TimelineDisplay(it.id, it.occurredAt, photo = it) }).sortedWith(compareByDescending<TimelineDisplay> { it.at }.thenBy { it.id })
        when {
            state.loading -> item { JournalCard { repeat(3) { SkeletonLine(180.dp); SkeletonLine(120.dp) } } }
            state.error != null -> item { Column(verticalArrangement = Arrangement.spacedBy(16.dp)) { ErrorText(state.error!!); BarkButton("Try again", { retry++ }, icon = "refresh-cw") } }
            rows.isEmpty() -> item { Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { JournalCard { SectionTitle("No matching records"); SupportingText("Change or clear the filters, or add a care log from Home. Nothing has been deleted.") }; BarkButton("Clear filters", { from = ""; through = ""; appliedFrom = ""; appliedThrough = ""; typeKey = ""; limit = 50 }, secondary = true) } }
            else -> {
                item { CaptionText("${(if (typeKey == "photo") 0 else state.page.totalCount) + photoRows.size} records shown") }
                rows.groupBy { JournalDates.day(it.at, zone) }.forEach { (date, records) ->
                    item(key = "day-$date") {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { SectionTitle(if (date == JournalDates.day(now, zone)) "Today" else JournalDates.dateLabel(date)); CaptionText("${records.size} records") }; DayLine(records.mapNotNull { it.event }, now, zone, compact = true, showNow = date == JournalDates.day(now, zone)) }
                    }
                    records.forEachIndexed { index, row -> item(key = row.id) {
                        val event = row.event; val photo = row.photo?.data as? CareItemData.Photo
                        val family = event?.type?.key?.takeIf { "$it-dot" in LocalBoardColors.current } ?: if (photo != null) "photo" else "note"
                        BoardThreadRow(JournalDates.inputTime(row.at, zone), event?.type?.label ?: "Photo", event?.let(::observationSummary) ?: photo?.title.orEmpty(), event?.type?.iconName() ?: "image", family, index == 0, index == records.lastIndex) { if (event != null) onDetail(event) else row.photo?.let(onPhoto) }
                    } }
                }
                if (typeKey != "photo" && state.page.totalCount > state.page.events.size) item {
                    BarkButton("Show older records", { limit = if (limit > Int.MAX_VALUE - 50) Int.MAX_VALUE else limit + 50 }, secondary = true)
                }
            }
        }
    }
}

private data class TimelineDisplay(val id: String, val at: Long, val event: CareEvent? = null, val photo: CareItem? = null)
