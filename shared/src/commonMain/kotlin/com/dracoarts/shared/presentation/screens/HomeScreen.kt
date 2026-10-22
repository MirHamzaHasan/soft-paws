package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.companion.CompanionScreen
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*

@Composable
fun HomeScreen(context: FeatureContext) {
    val cat = context.dog
    val journal = context.journal
    val largeText = LocalDensity.current.fontScale >= 1.2f
    val saved = journal.lastSaved?.takeIf { it.dogId == cat.id }
    val today = JournalDates.day(context.now, context.zone)
    SoftPawsTop("${today.dayOfWeek.name.take(3)}, ${today.day} ${today.month.name.take(3)}") { context.open(Feature.Settings) }
    if (!journal.loading && journal.totalCount == 0L) {
        SoftPawsHeading("A little begins here.", "Your first record makes this a journal.", "begins here.")
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(if (largeText) 184.dp else 232.dp, if (largeText) 200.dp else 252.dp), greetingLabel = "Say hello to ${cat.name}") }
        CaptionText("No entries yet. Meals, litter, play and notes will appear here.")
        BoardStickyAction { BarkButton("Keep a first check-in", { context.open(Feature.Chooser) }) }
        return
    }
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp), color = boardColor("cat-field"), border = BorderStroke(1.dp, boardColor("peach-line"))) {
        Box(Modifier.fillMaxWidth().heightIn(min = if (largeText) 350.dp else 235.dp)) {
            AnimatedCat(Modifier.align(Alignment.BottomEnd).offset(x = 8.dp).size(if (largeText) 190.dp else 204.dp, if (largeText) 185.dp else 224.dp), saved?.id, context.journalController::consumedReaction, greetingLabel = "Say hello to ${cat.name}")
            Column(Modifier.fillMaxWidth().padding(22.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
                SoftPawsKicker("A LITTLE CLOSER, EVERY DAY")
                Text("${cat.name}’s\nkind of\nday.", Modifier.widthIn(max = if (largeText) 280.dp else 176.dp).semantics { heading() }, style = MaterialTheme.typography.displaySmall.copy(lineHeight = 35.sp, letterSpacing = (-1.4).sp), color = boardColor("ink-strong"))
                Text("The small things count.", Modifier.widthIn(max = 130.dp), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, lineHeight = 17.sp), color = boardColor("ink-muted"))
            }
        }
    }
    SoftPawsRow(cat.name, listOf("Your cat", cat.details.companion.lifestyle.takeUnless { it == "Not sure" }).filterNotNull().joinToString(" · "), "heart") { context.open(Feature.DogSwitcher) }
    SoftPawsSection("A quick check-in", "See all") { context.open(Feature.Chooser) }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        CareEventType.catQuickActions.forEach { type ->
            Surface(onClick = soundAction({ context.navigation.newLog(cat.id, type, context.platform.newId()) }), modifier = Modifier.weight(1f).heightIn(min = 79.dp), shape = RoundedCornerShape(18.dp), color = boardColor("${type.key}-bg"), contentColor = boardColor("${type.key}-ink"), border = BorderStroke(1.dp, boardColor("${type.key}-line"))) {
                Column(Modifier.padding(vertical = 14.dp, horizontal = 4.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    BarkIcon(type.iconName(), Modifier.size(22.dp), boardColor("${type.key}-ink"))
                    Text(if (type == CareEventType.Note) "Note" else if (type == CareEventType.Play) "Play" else type.label, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp))
                }
            }
        }
    }
    SoftPawsSection("Today’s little things", "Journal") { context.navigation.show(Route.Timeline) }
    journal.feedback?.let { Text(it, Modifier.semantics { liveRegion = LiveRegionMode.Polite }, style = MaterialTheme.typography.bodySmall, color = boardColor("good")) }
    when {
        journal.loading -> JournalCard { repeat(3) { SkeletonLine(180.dp); SkeletonLine(120.dp) } }
        journal.dayEvents.isEmpty() -> SoftPawsCard("Their first little thing.") { SupportingText("A meal, a nap, a note. Start with what you noticed.") }
        else -> Column { journal.dayEvents.sortedByDescending { it.occurredAtMillis }.forEach { event ->
            SoftPawsRow("${event.type.label} · ${JournalDates.inputTime(event.occurredAtMillis, context.zone)}", observationSummary(event), event.type.iconName()) { context.navigation.detail(cat.id, event.id) }
            HorizontalDivider(color = boardColor("hair"))
        } }
    }
    SoftPawsCard("Something on your mind?", tone = "lilac") {
        SupportingText("Ask about your cat or reach your saved vet.")
        context.companion?.let { companion ->
            SoftPawsRow("Ask about ${cat.name}", "Soft Paws AI · Premium", "message-square-text") { companion.go(CompanionScreen.AiGate) }
        }
        SoftPawsRow("What are you seeing?", "Saved veterinary contacts · free", "phone") { context.open(Feature.Triage) }
    }
    SoftPawsRow("Care coming up", "Your chosen reminders", "calendar") { context.open(Feature.Calendar) }
}
