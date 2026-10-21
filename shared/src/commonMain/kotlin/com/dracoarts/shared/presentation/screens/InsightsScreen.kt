package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
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
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.CancellationException
import kotlinx.datetime.*

@Composable
fun InsightsScreen(context: FeatureContext, monthly: Boolean = false) {
    val today = JournalDates.day(context.now, context.zone)
    var anchor by rememberSaveable(context.dog.id, monthly) { mutableStateOf(today.toString()) }
    val day = LocalDate.parse(anchor)
    val from = if (monthly) LocalDate(day.year, day.month, 1) else day.minus(6, DateTimeUnit.DAY)
    val through = if (monthly) from.plus(1, DateTimeUnit.MONTH).minus(1, DateTimeUnit.DAY) else day
    var records by remember(context.dog.id, from, through, context.zone.id) { mutableStateOf<List<CareEvent>?>(null) }
    var weights by remember(context.dog.id) { mutableStateOf<TimelinePage?>(null) }
    var error by remember(context.dog.id, from, through) { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    var dates by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(context.dog.id, from, through, context.zone.id, retry) {
        error = false
        try {
            context.repository.observeTimeline(TimelineFilter(context.dog.id,
                fromMillis = JournalDates.dayBounds(from, context.zone).first.coerceAtLeast(0),
                untilMillis = JournalDates.dayBounds(through, context.zone).second), Int.MAX_VALUE).collect { records = it.events }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    LaunchedEffect(context.dog.id, retry) {
        try { context.repository.observeTimeline(TimelineFilter(context.dog.id, type = CareEventType.Weight), 1).collect { weights = it } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    if (!monthly) SoftPawsFeatureBack(context)
    SoftPawsHeading(if (monthly) "Their month, in view." else "Their week, in view.", "${catCareDateRange(from, through)} · ${context.dog.name}", "in view.")
    when {
        error -> { ErrorCard("Couldn't read these observations. Your journal stays saved."); BarkButton("Try again", { retry++ }) }
        records == null || weights == null -> SoftPawsCard("Reading observations") { SkeletonLine(180.dp); SkeletonLine(120.dp); Spacer(Modifier.height(100.dp)) }
        else -> {
            val facts = CatCareInsights.from(context.dog.id, from, through, records!!, context.zone)
            SoftPawsCard("${facts.meals.sum()} recorded ${if (facts.meals.sum() == 1) "meal" else "meals"}") {
                CaptionText("Meal observations each day")
                MealObservationBars(facts)
                CaptionText("Counts show what was logged, not all food eaten.")
            }
            val latest = weights!!.events.firstOrNull()
            SoftPawsCard((latest?.details as? CareDetails.Weight)?.let { "${it.amount} ${it.unit.label}" } ?: "No measured weight yet") {
                CaptionText(latest?.let { "Latest measured weight · ${JournalDates.dateLabel(JournalDates.day(it.occurredAtMillis, context.zone))}" } ?: "Add a scale reading when you have one.")
                SoftPawsRow("View measurements", "${weights!!.totalCount} saved entries", "activity") { context.open(Feature.WeightHistory) }
            }
            SoftPawsRow("Prepare a care report", "The selected range, with your notes", "notebook-pen") {
                val argument = CareReportScope(context.dog.id, from.toString(), through.toString()).argument()
                context.resetFeatureView(FeaturePage(Feature.Report, argument))
                context.open(Feature.Report, argument)
            }
            CaptionText("Missing records do not mean missing care. No health scores are inferred.")
            BarkTextAction(if (dates) "Hide date controls" else "Change dates & view counts", { dates = !dates }, icon = "calendar")
            if (dates) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    BarkTextAction("Previous", { anchor = (if (monthly) day.minus(1, DateTimeUnit.MONTH) else day.minus(7, DateTimeUnit.DAY)).toString() }, icon = "chevron-left")
                    BarkTextAction("Next", { anchor = (if (monthly) day.plus(1, DateTimeUnit.MONTH) else day.plus(7, DateTimeUnit.DAY)).toString() }, icon = "chevron-right")
                }
                BarkTextAction("Latest", { anchor = today.toString() })
                facts.counts.entries.sortedBy { it.key.ordinal }.forEach { (type, count) ->
                    SoftPawsFact(type.label, "$count recorded observations", type.iconName())
                }
                CaptionText("${context.zone.id} · Older record types retain their original labels.")
                if (!monthly) BarkTextAction("View monthly observations", { context.open(Feature.Monthly) }, icon = "calendar")
                BarkTextAction("Open source records", { context.navigation.show(Route.Timeline) }, icon = "notebook-pen")
            }
        }
    }
}

@Composable
private fun MealObservationBars(facts: CatCareInsights) {
    val maximum = facts.meals.maxOrNull()?.coerceAtLeast(1) ?: 1
    val scroll = rememberScrollState()
    Row(Modifier.fillMaxWidth().horizontalScroll(scroll).padding(top = 28.dp, bottom = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        facts.days.forEachIndexed { i, day ->
            Column(Modifier.width(if (facts.days.size > 7) 34.dp else 30.dp).semantics(mergeDescendants = true) { contentDescription = "$day: ${facts.meals[i]} meal observations" }, horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.height(104.dp).fillMaxWidth(), contentAlignment = Alignment.BottomCenter) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CaptionText(facts.meals[i].toString())
                        Spacer(Modifier.height(6.dp))
                        Surface(Modifier.width(26.dp).height((facts.meals[i].toFloat() / maximum * 70).dp.coerceAtLeast(1.dp)), shape = RoundedCornerShape(topStart = 5.dp, topEnd = 5.dp), color = boardColor(if (facts.meals[i] == 0) "hair" else "accent")) {}
                    }
                }
                Spacer(Modifier.height(6.dp))
                CaptionText(if (facts.days.size > 7) day.day.toString() else day.dayOfWeek.name.take(1))
            }
        }
    }
}

@Composable
internal fun WeightHistoryScreen(context: FeatureContext) {
    var limit by rememberSaveable(context.dog.id) { mutableIntStateOf(50) }
    var page by remember(context.dog.id, limit) { mutableStateOf<TimelinePage?>(null) }
    var error by remember(context.dog.id) { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, limit, retry) {
        error = false
        try { context.repository.observeTimeline(TimelineFilter(context.dog.id, type = CareEventType.Weight), limit).collect { page = it } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    SoftPawsHeading("Measured, not guessed.", "${context.dog.name} · each reading keeps its saved unit", "not guessed.")
    when {
        error -> { ErrorCard("Couldn't read these measurements. Your records stay saved."); BarkButton("Try again", { retry++ }) }
        page == null -> SoftPawsCard("Reading measurements") { repeat(3) { SkeletonLine(160.dp) } }
        page!!.events.isEmpty() -> SoftPawsCard("Their first reading") { SupportingText("A measured weight will appear here after you save it.") }
        else -> {
            SoftPawsList { page!!.events.forEachIndexed { i, event ->
                if (i > 0) HorizontalDivider(color = boardColor("hair"))
                val detail = event.details as? CareDetails.Weight
                SoftPawsRow(detail?.let { "${it.amount} ${it.unit.label}" } ?: "Saved weight record",
                    listOfNotNull(JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone)), event.context.observations["Method"]?.takeIf(String::isNotBlank), event.context.location.takeIf(String::isNotBlank), event.note?.takeIf(String::isNotBlank)).joinToString(" · "), "activity") { context.navigation.detail(context.dog.id, event.id) }
            } }
            if (page!!.events.size < page!!.totalCount) BarkButton("Load earlier measurements", { limit += 50 }, secondary = true)
        }
    }
    CaptionText("Changes need context. Share concerns with your vet.")
    BoardStickyAction { BarkButton("Add a measurement", { context.navigation.newLog(context.dog.id, CareEventType.Weight, context.platform.newId()) }) }
}

@Composable
internal fun SoftPawsFeatureBack(context: FeatureContext) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Surface(onClick = soundAction(context.navigation::back), enabled = !context.saving,
            modifier = Modifier.size(48.dp).semantics { contentDescription = "Back" }, shape = RoundedCornerShape(50),
            color = boardColor("panel"), border = androidx.compose.foundation.BorderStroke(1.dp, boardColor("hair"))) {
            Box(contentAlignment = Alignment.Center) { BarkIcon("chevron-left", Modifier.size(20.dp)) }
        }
        SoftPawsKicker("CAT CARE")
    }
}

@Composable
internal fun SoftPawsFact(title: String, subtitle: String, icon: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 13.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        SoftPawsIconMark(icon)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.bodyMedium)
            CaptionText(subtitle)
        }
    }
}

internal fun catCareDateRange(from: LocalDate, through: LocalDate): String =
    if (from.year == through.year && from.month == through.month) "${from.day}–${through.day} ${through.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${through.year}"
    else "${JournalDates.dateLabel(from)} – ${JournalDates.dateLabel(through)}"
