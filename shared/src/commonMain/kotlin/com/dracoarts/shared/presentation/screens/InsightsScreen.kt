package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

@Composable
fun InsightsScreen(context: FeatureContext, monthly: Boolean = false) {
    if (monthly) { WalkTrendsScreen(context); return }
    val today = JournalDates.day(context.now, context.zone)
    var anchorText by rememberSaveable(monthly) { mutableStateOf(if (monthly) today.toString().take(7) + "-01" else today.minus(6, DateTimeUnit.DAY).toString()) }
    val start = LocalDate.parse(anchorText)
    val end = if (monthly) start.plus(1, DateTimeUnit.MONTH) else start.plus(7, DateTimeUnit.DAY)
    var records by remember(context.dog.id, start, end) { mutableStateOf<List<CareEvent>?>(null) }
    var facts by remember(context.dog.id, start, end) { mutableStateOf<JournalFacts?>(null) }
    var error by remember { mutableStateOf(false) }; var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, start, end, context.zone.id, retry) {
        records = null; facts = null; error = false
        try {
            val events = context.repository.observeTimeline(TimelineFilter(context.dog.id, fromMillis = JournalDates.dayBounds(start, context.zone).first.coerceAtLeast(0), untilMillis = JournalDates.dayBounds(end, context.zone).first), Int.MAX_VALUE).first().events
            facts = withContext(Dispatchers.Default) { JournalFacts.from(events, context.zone) }; records = events
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        BoardDogChip(context.dog.name, { context.open(Feature.DogSwitcher) })
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon("shield-check", Modifier.size(14.dp), boardColor("ink-muted")); CaptionText("On this device") }
    }
    BoardHeading(if (monthly) "Monthly trends" else "This week", "${context.dog.name} · $start–${end.minus(1, DateTimeUnit.DAY)}", BoardFolio("FROM YOUR RECORDS", "chart-no-axes-column-increasing", "photo", display = !monthly))
    if (monthly) ChoiceField("Month", anchorText, (0..11).map { offset -> start.minus(offset, DateTimeUnit.MONTH).let { it.toString() to "${it.month.name.lowercase().replaceFirstChar { c -> c.uppercase() }} ${it.year}" } }) { anchorText = it }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        BarkTextAction("Previous", { anchorText = if (monthly) start.minus(1, DateTimeUnit.MONTH).toString() else start.minus(7, DateTimeUnit.DAY).toString() }, icon = "arrow-left", leading = true)
        BarkTextAction("Next", { anchorText = end.toString() }, icon = "arrow-right")
    }
    CaptionText("$start through ${end.minus(1, DateTimeUnit.DAY)} · ${context.zone.id}")
    when {
        error -> { ErrorCard("Couldn't summarize these records. Your journal stays saved."); BarkButton("Try again", { retry++ }, icon = "refresh-cw") }
        facts == null -> JournalCard { SkeletonLine(180.dp, 28.dp); SkeletonLine(140.dp) }
        else -> {
            val summary = facts!!
            if (summary.total == 0) FeatureNotice("A quiet page", "Add care from Home. Your own records will form this view.", "chart-no-axes-column-increasing")
            else {
                JournalCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { SectionTitle("When care happened"); CaptionText("${summary.total} logs") }
                    if (!monthly) repeat(7) { index ->
                        val day = start.plus(index, DateTimeUnit.DAY)
                        val dayEvents = records.orEmpty().filter { JournalDates.day(it.occurredAtMillis, context.zone) == day }
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(if (day == today) "Today" else day.dayOfWeek.name.take(3).lowercase().replaceFirstChar { it.uppercase() }, Modifier.width(38.dp), style = MaterialTheme.typography.bodySmall)
                            DayLine(dayEvents, context.now, context.zone, Modifier.weight(1f), compact = true, showNow = day == today)
                            Text(dayEvents.size.toString(), style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    else {
                        summary.perDay.toList().sortedBy { it.first }.forEach { (day, count) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) { Text(day.day.toString(), Modifier.width(24.dp), style = MaterialTheme.typography.bodySmall); DayLine(records.orEmpty().filter { JournalDates.day(it.occurredAtMillis, context.zone) == day }, context.now, context.zone, Modifier.weight(1f), compact = true, showNow = day == today); Text(count.toString(), style = MaterialTheme.typography.bodySmall) }
                        }
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { listOf("06", "09", "12", "15", "18", "21", "00").forEach { CaptionText(it) } }
                    SupportingText("${summary.total} care logs over ${summary.recordedDays} recorded ${if (summary.recordedDays == 1) "day" else "days"}.")
                    CaptionText("No observation means nothing was recorded, not that nothing happened.")
                }
                val maximum = summary.perType.values.maxOrNull()?.coerceAtLeast(1) ?: 1
                JournalCard {
                    SectionTitle("Recorded care")
                    summary.perType.entries.sortedByDescending { it.value }.forEach { (type, count) ->
                    Column(Modifier.semantics { contentDescription = "${type.label}: $count recorded" }, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { Text(type.label, style = MaterialTheme.typography.titleMedium); Text(count.toString(), style = MaterialTheme.typography.titleLarge) }
                        LinearProgressIndicator(progress = { count.toFloat() / maximum }, modifier = Modifier.fillMaxWidth().height(8.dp), color = boardColor("${type.key}-dot".takeIf { it in com.dracoarts.shared.presentation.theme.LocalBoardColors.current } ?: "note-dot"), trackColor = MaterialTheme.colorScheme.surfaceVariant)
                    }
                }
                }
            }
            if (!monthly) BarkButton("View monthly trends", { context.open(Feature.Monthly) }, secondary = true, icon = "chart-no-axes-column-increasing")
            BarkButton("Prepare a vet report", { context.open(Feature.Report) }, icon = "file-text")
            BarkTextAction("Open source records", { context.navigation.show(Route.Timeline) }, icon = "list")
        }
    }
    CaptionText("Descriptive counts only. Soft Paws does not diagnose, predict or recommend treatment.")
}
