package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.plus
import kotlin.math.roundToInt

/** Approved dated cat journal; every row and count comes from this cat's SQLite records. */
@Composable
fun TimelineScreen(journal: JournalState, controller: TimelineController, now: Long, zone: TimeZone,
    modifier: Modifier, photos: List<CareItem> = emptyList(), reviewScreen: String? = null,
    onPhoto: (CareItem) -> Unit = {}, onSwitchDog: () -> Unit = {}, onSelectDog: (String) -> Unit = {},
    onSettings: () -> Unit = {}, onAdd: () -> Unit = {}, onDetail: (CareEvent) -> Unit) {
    val dogId = journal.selectedDogId.orEmpty()
    val catName = journal.dogs.firstOrNull { it.id == dogId }?.name ?: "Your cat"
    val today = JournalDates.day(now, zone)
    val filteredReview = reviewScreen == "timeline-filtered-empty"
    var typeKey by rememberSaveable { mutableStateOf(if (filteredReview) "medication" else "") }
    var from by rememberSaveable { mutableStateOf(if (filteredReview) "2026-10-01" else today.toString()) }
    var through by rememberSaveable { mutableStateOf(if (filteredReview) "2026-10-07" else today.toString()) }
    var appliedFrom by rememberSaveable { mutableStateOf(from) }
    var appliedThrough by rememberSaveable { mutableStateOf(through) }
    var weekEnd by rememberSaveable { mutableStateOf(today.toString()) }
    var dateError by rememberSaveable { mutableStateOf<String?>(null) }
    var limit by rememberSaveable { mutableIntStateOf(50) }
    var retry by remember { mutableIntStateOf(0) }
    var showingFilters by rememberSaveable { mutableStateOf(reviewScreen == "timeline-filters") }
    val observed by controller.state.collectAsState()
    val filter = remember(dogId, typeKey, appliedFrom, appliedThrough, zone.id) {
        TimelineFilter(dogId, CareEventType.fromKey(typeKey),
            appliedFrom.takeIf(String::isNotEmpty)?.let { JournalDates.dayBounds(LocalDate.parse(it), zone).first },
            appliedThrough.takeIf(String::isNotEmpty)?.let { JournalDates.dayBounds(LocalDate.parse(it), zone).second })
    }
    // A just-changed cat/date must never briefly display the previous query's rows.
    val state = observed.takeIf { it.filter == filter } ?: TimelineState(filter = filter)
    LaunchedEffect(filter, limit, retry) { controller.observe(filter, limit) }
    fun clearFilters() {
        from = ""; through = ""; appliedFrom = ""; appliedThrough = ""; typeKey = ""; dateError = null; limit = 50
    }
    fun selectDay(date: LocalDate) {
        from = date.toString(); through = from; appliedFrom = from; appliedThrough = from; dateError = null; limit = 50
    }
    val photoRows = photos.filter { it.dogId == dogId && it.data is CareItemData.Photo && typeKey in listOf("", "photo") &&
        (filter.fromMillis == null || it.occurredAt >= filter.fromMillis) && (filter.untilMillis == null || it.occurredAt < filter.untilMillis) }
    val eventRows = if (typeKey == "photo") emptyList() else state.page.events
    val rows = (eventRows.map { JournalDisplay(it.id, it.occurredAtMillis, event = it) } +
        photoRows.map { JournalDisplay(it.id, it.occurredAt, photo = it) })
        .sortedWith(compareByDescending<JournalDisplay> { it.at }.thenBy { it.id })
    LazyColumn(modifier.fillMaxWidth(), contentPadding = PaddingValues(horizontal = AppSpacing.page, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        item { SoftPawsTop(onSettings = onSettings) }
        item { SoftPawsHeading("The little things, in order.", "${catName}’s journal", accent = "in order.") }
        item {
            val end = LocalDate.parse(weekEnd)
            SoftPawsWeek((0..6).map { end.plus(it - 6, DateTimeUnit.DAY) }, appliedFrom.takeIf { it == appliedThrough }, ::selectDay)
        }
        item {
            SoftPawsFilterStrip(typeKey) { typeKey = it; limit = 50 }
        }
        item { BarkTextAction(if (showingFilters) "Hide filters" else "Dates & cat", { showingFilters = !showingFilters }, icon = "sliders-horizontal", leading = true) }
        if (showingFilters) item {
            SoftPawsCard("Find a little detail") {
                ChoiceField("Cat", dogId, journal.dogs.map { it.id to it.name }) { onSelectDog(it); limit = 50 }
                BarkTextAction("Switch cat", onSwitchDog)
                ChoiceField("Observation type", typeKey, listOf("" to "All types") + CareEventType.entries.map { it.key to it.label } + ("photo" to "Photos")) { typeKey = it; limit = 50 }
                FormField("From date · optional", from, true, { from = it }, maximum = 10, placeholder = "YYYY-MM-DD")
                FormField("Through date · optional", through, true, { through = it }, maximum = 10, placeholder = "YYYY-MM-DD")
                dateError?.let { ErrorText(it) }
                BarkButton("Apply dates", {
                    try {
                        val start = from.trim().takeIf(String::isNotEmpty)?.let { LocalDate.parse(it) }
                        val end = through.trim().takeIf(String::isNotEmpty)?.let { LocalDate.parse(it) }
                        TimelineFilter(dogId, fromMillis = start?.let { JournalDates.dayBounds(it, zone).first }, untilMillis = end?.let { JournalDates.dayBounds(it, zone).second }).validate()
                        appliedFrom = from.trim(); appliedThrough = through.trim(); dateError = null; limit = 50
                        if (end != null) weekEnd = end.toString() else if (start != null) weekEnd = start.toString()
                        showingFilters = false
                    } catch (_: IllegalArgumentException) { dateError = "Use valid YYYY-MM-DD dates, with the end on or after the start." }
                })
                BarkTextAction("All dates & types", ::clearFilters)
            }
        }
        item {
            CaptionText(when {
                appliedFrom.isBlank() && appliedThrough.isBlank() -> "All saved dates · newest first"
                appliedFrom == appliedThrough -> JournalDates.dateLabel(LocalDate.parse(appliedFrom)) + " · newest first"
                else -> "${appliedFrom.ifBlank { "Any start date" }} → ${appliedThrough.ifBlank { "Any end date" }}"
            })
        }
        when {
            state.loading -> item { SoftPawsCard("Opening the journal") { repeat(3) { SkeletonLine(180.dp); SkeletonLine(120.dp) } } }
            state.error != null -> item { Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { ErrorText(state.error); BarkButton("Try again", { retry++ }) } }
            rows.isEmpty() -> item {
                SoftPawsCard("No matching check-ins yet") {
                    SupportingText("A saved observation will appear here. Choose another day or add a check-in.")
                    BarkTextAction("All dates & types", ::clearFilters)
                }
            }
            else -> {
                rows.groupBy { JournalDates.day(it.at, zone) }.forEach { (date, records) ->
                    if (appliedFrom != appliedThrough || appliedFrom.isBlank()) item(key = "day-$date") { SoftPawsSection(JournalDates.dateLabel(date)) }
                    records.forEach { row -> item(key = row.id) {
                        SoftPawsJournalRow(row.event?.let(::journalRecordTitle) ?: (row.photo!!.data as CareItemData.Photo).title.ifBlank { "A photo, remembered." },
                            row.event?.let(::observationSummary) ?: (row.photo!!.data as CareItemData.Photo).notes,
                            JournalDates.inputTime(row.at, zone), row.event?.type?.iconName() ?: "image", row.event?.type?.key ?: "photo") {
                            row.event?.let(onDetail) ?: row.photo?.let(onPhoto)
                        }
                    } }
                }
                if (typeKey != "photo" && state.page.totalCount > state.page.events.size) item {
                    BarkButton("Show older records", { limit = if (limit > Int.MAX_VALUE - 50) Int.MAX_VALUE else limit + 50 }, secondary = true)
                }
            }
        }
        item { BarkButton("Add a check-in", onAdd); Spacer(Modifier.height(12.dp)) }
    }
}

@Composable
private fun SoftPawsFilterChip(label: String, chosen: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Surface(onClick = soundAction(onClick), modifier = modifier.heightIn(min = 48.dp).semantics { selected = chosen },
        shape = RoundedCornerShape(50), color = boardColor(if (chosen) "accent" else "panel"),
        contentColor = boardColor(if (chosen) "btn-ink" else "ink"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.padding(horizontal = 15.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            if (chosen) BarkIcon("check", Modifier.size(12.dp))
            Text(label, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp))
        }
    }
}

@Composable
private fun SoftPawsFilterStrip(typeKey: String, onPick: (String) -> Unit) {
    val scroll = rememberScrollState()
    var selectedBounds by remember { mutableStateOf<ChoiceBounds?>(null) }
    val density = LocalDensity.current
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val viewport = with(density) { maxWidth.roundToPx() }
        LaunchedEffect(typeKey, selectedBounds, viewport, scroll.maxValue) {
            selectedBounds?.takeIf { it.key == typeKey }?.let { revealChoice(scroll, it.left, it.right, viewport) }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(scroll), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("" to "All", "meal" to "Meals", "litter" to "Litter", "play" to "Play", "note" to "Notes").forEach { (key, label) ->
                SoftPawsFilterChip(label, typeKey == key, Modifier.onGloballyPositioned { coordinates ->
                    if (typeKey == key) {
                        val left = coordinates.positionInParent().x.roundToInt()
                        selectedBounds = ChoiceBounds(key, left, left + coordinates.size.width)
                    }
                }) { onPick(key) }
            }
        }
    }
}

@Composable
private fun SoftPawsWeek(dates: List<LocalDate>, selectedDay: String?, onSelect: (LocalDate) -> Unit) {
    val scroll = rememberScrollState()
    val density = LocalDensity.current
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val width = maxOf(48.dp, (maxWidth - 6.dp) / 7)
        val viewport = with(density) { maxWidth.roundToPx() }
        LaunchedEffect(selectedDay, dates, viewport, scroll.maxValue) {
            val index = dates.indexOfFirst { it.toString() == selectedDay }
            if (index >= 0) {
                val left = with(density) { ((width + 1.dp) * index).roundToPx() }
                revealChoice(scroll, left, left + with(density) { width.roundToPx() }, viewport)
            }
        }
        Row(Modifier.horizontalScroll(scroll), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
            dates.forEach { date ->
                val chosen = date.toString() == selectedDay
                Surface(onClick = soundAction({ onSelect(date) }), modifier = Modifier.width(width).heightIn(min = 64.dp)
                    .semantics(mergeDescendants = true) { contentDescription = JournalDates.dateLabel(date); selected = chosen },
                    shape = RoundedCornerShape(16.dp), color = if (chosen) boardColor("accent") else Color.Transparent,
                    contentColor = boardColor(if (chosen) "btn-ink" else "ink")) {
                    Column(Modifier.padding(vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(date.dayOfWeek.name.take(1), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp))
                        Text(date.day.toString(), style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp, fontWeight = FontWeight.Bold))
                    }
                }
            }
        }
    }
}

private data class ChoiceBounds(val key: String, val left: Int, val right: Int)

/** Reveal only when selection/layout changes; manual horizontal browsing remains free. */
private suspend fun revealChoice(scroll: ScrollState, left: Int, right: Int, viewport: Int) {
    val target = when {
        left < scroll.value -> left
        right > scroll.value + viewport -> right - viewport
        else -> scroll.value
    }
    scroll.scrollTo(target.coerceIn(0, scroll.maxValue))
}

@Composable
private fun SoftPawsJournalRow(title: String, subtitle: String, time: String, icon: String, family: String, onClick: () -> Unit) {
    Column {
        Surface(onClick = soundAction(onClick), modifier = Modifier.fillMaxWidth().heightIn(min = 78.dp), color = Color.Transparent) {
            Row(Modifier.padding(vertical = 15.dp), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(time, Modifier.width(42.dp).padding(top = 4.dp), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp), color = boardColor("ink-muted"))
                Surface(shape = RoundedCornerShape(13.dp), color = boardColor("$family-bg"), border = BorderStroke(1.dp, boardColor("$family-line"))) {
                    Box(Modifier.size(38.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(18.dp), boardColor("$family-ink")) }
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(title, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                    Text(subtitle, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp, lineHeight = 18.sp), color = boardColor("ink-muted"))
                }
            }
        }
        HorizontalDivider(color = boardColor("hair"))
    }
}

private data class JournalDisplay(val id: String, val at: Long, val event: CareEvent? = null, val photo: CareItem? = null)
