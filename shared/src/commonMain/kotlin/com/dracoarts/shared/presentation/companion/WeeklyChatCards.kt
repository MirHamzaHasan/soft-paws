package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone

internal fun answerSections(text: String): Pair<String, String?> {
    val marker = Regex("\\n+General care ideas:?\\s*\\n", RegexOption.IGNORE_CASE).find(text) ?: return text to null
    return text.substring(0, marker.range.first).trim() to text.substring(marker.range.last + 1).trim().takeIf { it.isNotEmpty() }
}

@Composable internal fun WeeklyLogCard(message: CompanionMessage, onSources: (List<SourceRecord>) -> Unit) {
    val week = message.weekly ?: return
    if (!week.showCard) return
    val name = message.profile?.name ?: "Your dog"
    val type = week.focus
    val count = if (type == null) week.total else week.counts.firstOrNull { it.type == type }?.count ?: 0
    val records = message.records.filter { type == null || it.type == type }.sortedByDescending { it.at }
    val zone = runCatching { TimeZone.of(week.timeZone) }.getOrDefault(TimeZone.UTC)
    val days = week.days.map { day -> if (type == null) day.counts.sumOf { it.count } else day.counts.firstOrNull { it.type == type }?.count ?: 0 }
    val max = maxOf(1, days.maxOrNull() ?: 0)
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) {
        Column(Modifier.padding(17.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon("notebook-pen", Modifier.size(16.dp)); CaptionText("From $name’s logs") }
            Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(count.toString(), style = MaterialTheme.typography.displayMedium.copy(fontSize = 42.sp))
                Text(if (type == null) "care records saved" else "${type.lowercase()} ${if (type == "Walk") "logs" else "entries"} recorded", style = MaterialTheme.typography.bodyMedium)
            }
            CaptionText("${JournalDates.dateLabel(JournalDates.day(week.fromMillis, zone))} – ${JournalDates.dateLabel(JournalDates.day(week.untilMillis - 1, zone))} · past 7 days")
            if (count > 0) {
                Row(Modifier.fillMaxWidth().semantics(mergeDescendants = true) { contentDescription = week.days.mapIndexed { i, day -> "${day.date}: ${days[i]} saved records" }.joinToString("; ") }, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    week.days.forEachIndexed { i, day -> Column(Modifier.weight(1f).clearAndSetSemantics {}, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Box(Modifier.fillMaxWidth().height(37.dp), contentAlignment = Alignment.BottomCenter) {
                            Surface(Modifier.width(26.dp).fillMaxHeight(), shape = RoundedCornerShape(6.dp), color = boardColor("inset")) {}
                            if (days[i] > 0) Surface(Modifier.width(26.dp).fillMaxHeight(days[i].toFloat() / max), shape = RoundedCornerShape(6.dp), color = boardColor("ink-strong")) {}
                        }
                        Text(days[i].toString(), style = MaterialTheme.typography.labelSmall)
                        Text(kotlinx.datetime.LocalDate.parse(day.date).dayOfWeek.name.take(3).lowercase().replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.labelSmall, color = boardColor("ink-muted"))
                    } }
                }
                records.firstOrNull()?.let { latest -> HorizontalDivider(color = boardColor("hair")); CaptionText("Latest · ${JournalDates.dateAndTime(latest.at, zone)}"); Text(latest.note.ifBlank { "No extra note recorded." }, style = MaterialTheme.typography.bodySmall) }
                if (records.isNotEmpty()) BarkButton(if (records.size == count) "View ${records.size} ${type?.lowercase() ?: "care"} logs" else "View ${records.size} of $count note excerpts", { onSources(records) }, secondary = true, icon = "notebook-pen")
            } else CaptionText(if (week.total == 0) "No care records saved this week. $name’s profile is still included." else "No ${type?.lowercase() ?: "matching care"} logs this week. Other care records were included.")
            if (week.shared < week.total) CaptionText("${week.shared} of ${week.total} note excerpts shared. Weekly counts cover all saved records in this range.")
        }
    }
}

@Composable internal fun ColumnScope.WeeklyAiConsent(controller: CompanionController, name: String) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    var agree by remember(state.workspace.weeklyAllowed) { mutableStateOf(state.workspace.weeklyAllowed) }
    CaptionText("Soft Paws AI")
    CHeading("A little context. A clearer answer.", "Your dog’s week, ready when you ask.")
    listOf(Triple("paw-print", "$name’s profile", "Name, age, breed and the care details you’ve saved."),
        Triple("notebook-pen", "The past seven days", "This dog’s care records are included automatically with each question. No need to select logs."),
        Triple("shield-check", "You stay in control", "Online processing starts when you ask. Photos, contacts, other dogs and older records stay out. Turn off AI at any time.")).forEach { (icon, title, text) ->
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { BarkIcon(icon, Modifier.size(22.dp)); Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) { Text(title, style = MaterialTheme.typography.titleSmall); CaptionText(text) } }
    }
    if (controller.demoResponses) CaptionText("Design review · demo replies. No messages or records leave this phone.")
    CaptionText("Soft Paws AI gives general care information and organizes observations. It cannot assess health, diagnose or prescribe. Your journal works without AI.")
    CCheck("I agree to online AI processing of my messages, $name’s profile and the past seven days of care records.", agree) { agree = it }
    BarkButton("Enable Soft Paws AI", { scope.launch {
        if (controller.updateAiContext { it.copy(messageConsent = true, profileConsent = true, recordConsent = true, cloudConsent = true, week = true, selectedRecords = emptyList(), weeklyConsentVersion = 1) }) controller.completeAiConsent()
    } }, enabled = agree && !state.busy)
    BarkTextAction("Keep using my journal", { scope.launch { if (controller.updateAiContext { it.copy(messageConsent = false, cloudConsent = false, profileConsent = false, recordConsent = false, weeklyConsentVersion = 0) }) controller.go(null) } })
}

@Composable internal fun WeeklyContextDialog(controller: CompanionController, dogId: String, platform: AppPlatform, repository: com.dracoarts.shared.domain.repository.JournalRepository, onDismiss: () -> Unit) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    var context by remember(dogId) { mutableStateOf<PreparedWeeklyContext?>(null) }
    var error by remember { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    var showProfile by remember { mutableStateOf(false) }
    LaunchedEffect(dogId, retry) { error = false; context = null; try { context = prepareWeeklyContext(repository, dogId, state.composer.text, platform.nowMillis(), platform.timeZone()) } catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled } catch (_: Exception) { error = true } }
    CDialog("Included with every question", onDismiss, actions = {
        BarkButton("Back to chat", onDismiss)
        BarkTextAction("Turn off Soft Paws AI", { scope.launch { if (controller.updateAiContext { it.copy(messageConsent = false, cloudConsent = false, profileConsent = false, recordConsent = false, weeklyConsentVersion = 0) }) { onDismiss(); controller.go(null) } } })
    }) {
        CaptionText("The current dog’s saved profile and past seven days are included automatically while Soft Paws AI is enabled. No photos, documents, contacts, other dogs or older records.")
        if (error) { ErrorCard("Couldn’t read weekly context. Your journal is unchanged."); BarkButton("Try again", { retry++ }, secondary = true) }
        else if (context == null) CaptionText("Reading this dog’s week…")
        context?.let { snapshot ->
            Text("${snapshot.profile.name} · ${snapshot.weekly.total} saved records · ${snapshot.weekly.shared} note excerpts")
            BarkButton(if (showProfile) "Hide profile" else "Review ${snapshot.profile.name}’s profile", { showProfile = !showProfile }, secondary = true)
            if (showProfile) profileFacts(snapshot.profile).filter { it.second.isNotBlank() }.forEach { (label, value) -> Column { CaptionText(label); Text(boundedProfileFact(value)) } }
            if (snapshot.weekly.profileLimited) CaptionText("Long profile notes are shortened for this request.")
            snapshot.records.sortedByDescending { it.at }.forEach { record -> Column(verticalArrangement = Arrangement.spacedBy(5.dp)) { Text("${record.type} · ${JournalDates.dateAndTime(record.at, platform.timeZone())}", style = MaterialTheme.typography.titleSmall); Text(record.note.ifBlank { "No extra note recorded." }, style = MaterialTheme.typography.bodySmall) } }
            if (snapshot.weekly.total == 0) CaptionText("No care records saved this week. The dog profile is still included.")
            if (snapshot.weekly.shared < snapshot.weekly.total) CaptionText("Note excerpts are bounded to fit an online reply. Counts still cover the full seven-day range.")
        }
    }
}
