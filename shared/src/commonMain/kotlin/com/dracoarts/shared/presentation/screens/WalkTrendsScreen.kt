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
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

@Composable
fun WalkTrendsScreen(context: FeatureContext) {
    var days by rememberSaveable { mutableIntStateOf(30) }
    var weights by rememberSaveable { mutableStateOf(context.navigation.featurePage?.id == "weight") }
    val today = JournalDates.day(context.now, context.zone)
    val from = today.minus(days - 1, DateTimeUnit.DAY)
    var events by remember(context.dog.id, days) { mutableStateOf<List<CareEvent>?>(null) }
    var error by remember { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, days, retry) {
        error = false; events = null
        try { events = context.repository.observeTimeline(TimelineFilter(context.dog.id, fromMillis = JournalDates.dayBounds(from, context.zone).first.coerceAtLeast(0), untilMillis = JournalDates.dayBounds(today.plus(1, DateTimeUnit.DAY), context.zone).first), Int.MAX_VALUE).first().events }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    ScreenHeading(if (weights) "Weight observations" else "Recorded walk minutes", "${context.dog.name} · recorded observations")
    Surface(shape = RoundedCornerShape(50), color = boardColor("inset"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.fillMaxWidth().padding(3.dp).selectableGroup(), horizontalArrangement = Arrangement.spacedBy(3.dp)) { listOf(7, 30, 90).forEach { range -> val chosen = days == range
            Surface(onClick = { days = range }, modifier = Modifier.weight(1f).heightIn(min = 48.dp).semantics { selected = chosen }, shape = RoundedCornerShape(50), color = boardColor(if (chosen) "panel" else "inset"), border = if (chosen) BorderStroke(1.dp, boardColor("hair")) else null) { Box(Modifier.padding(12.dp), contentAlignment = Alignment.Center) { Text("$range days", style = MaterialTheme.typography.labelMedium) } }
        } }
    }
    when {
        error -> { FeatureNotice("Couldn't summarize these records", "Your journal stays saved.", "circle-x"); BarkButton("Try again", { retry++ }, icon = "refresh-cw") }
        events == null -> JournalCard { SkeletonLine(180.dp, 100.dp); CaptionText("Reading the selected local records…") }
        events!!.isEmpty() -> {
            FeatureNotice("No observations in this range", "Add care records when they happen. Missing observations are not zero activity.", "chart-no-axes-column-increasing")
            BarkButton("Back to Home", { context.navigation.show(Route.Home) }, icon = "plus")
        }
        weights -> {
            val records = events.orEmpty().filter { it.details is CareDetails.Weight }.sortedBy { it.occurredAtMillis }
            if (records.size < 3) FeatureNotice(if (records.isEmpty()) "No weight observations in this range" else "${records.size} recorded ${if (records.size == 1) "weight" else "weights"}", "There are not enough dates to describe a pattern.", "chart-no-axes-column-increasing")
            records.forEach { record -> val measured = record.details as CareDetails.Weight; JournalCard { CaptionText(JournalDates.dateLabel(JournalDates.day(record.occurredAtMillis, context.zone))); BoardTotal("${measured.amount} ${measured.unit.label}"); BarkTextAction("Open record", { context.navigation.detail(record.dogId, record.id) }, icon = "arrow-right") } }
            BarkButton("View weight records", { context.navigation.show(Route.Timeline) }, secondary = true)
        }
        else -> {
            val trend = RecordedWalkTrend.from(events.orEmpty(), today, days, context.zone)
            JournalCard {
                SectionTitle("Walk minutes")
                val maximum = trend.buckets.maxOfOrNull { it.minutes }?.coerceAtLeast(1) ?: 1
                Row(Modifier.fillMaxWidth().height(180.dp).padding(top = 28.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Bottom) {
                    trend.buckets.forEachIndexed { index, bucket -> Column(Modifier.weight(1f).fillMaxHeight().semantics(mergeDescendants = true) { contentDescription = "${bucketLabel(bucket)}: ${bucket.minutes} recorded minutes from ${bucket.recordedDurations} duration entries" }, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Bottom) {
                        Text(bucket.minutes.toString(), style = MaterialTheme.typography.titleLarge.copy(fontSize = 15.sp))
                        Surface(Modifier.padding(top = 8.dp).widthIn(max = 38.dp).fillMaxWidth().height((120f * bucket.minutes / maximum).dp.coerceAtLeast(8.dp)), shape = RoundedCornerShape(topStart = 50.dp, topEnd = 50.dp, bottomStart = 10.dp, bottomEnd = 10.dp), color = boardColor("${listOf("mood", "pee", "walk", "meal")[index % 4]}-dot")) {}
                        Text(bucketLabel(bucket), Modifier.padding(top = 8.dp), style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp))
                    } }
                }
                HorizontalDivider(color = boardColor("hair-2"))
                SupportingText("Text summary")
                CaptionText(trend.buckets.joinToString(". ") { "${bucketLabel(it)}: ${it.minutes} min" } + ". Total: ${trend.minutes} minutes. Missing observations are not zero activity.")
                if (trend.walksWithoutDuration > 0) CaptionText("${trend.walksWithoutDuration} walk ${if (trend.walksWithoutDuration == 1) "record has" else "records have"} no duration. Notes are not used to estimate minutes.")
            }
            BarkButton("Use this range in report", { context.open(Feature.Report, "${trend.from}@${trend.through}@${context.dog.id}@${ReportContent.encode(ReportContent.defaults)}") }, secondary = true, icon = "file-text")
        }
    }
    BarkTextAction(if (weights) "View walk minutes" else "View weight observations", { weights = !weights }, icon = "chart-no-axes-column-increasing")
    CaptionText("Recorded observations only. BarkLog does not diagnose or fill gaps with assumptions.")
}

private fun bucketLabel(bucket: WalkTrendBucket): String = if (bucket.from == bucket.through) bucket.from.day.toString() else if (bucket.from.month == bucket.through.month) "${bucket.from.day}–${bucket.through.day} ${bucket.from.month.name.take(3).lowercase().replaceFirstChar { it.uppercase() }}" else "${bucket.from.day} ${bucket.from.month.name.take(3).lowercase().replaceFirstChar { it.uppercase() }}–${bucket.through.day} ${bucket.through.month.name.take(3).lowercase().replaceFirstChar { it.uppercase() }}"
