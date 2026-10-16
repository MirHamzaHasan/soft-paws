package com.dracoarts.shared.presentation.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.first

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(context: FeatureContext) {
    val journal = context.journal; val dog = context.dog; val scope = rememberCoroutineScope()
    val motion = LocalBarkMotion.current; val colors = LocalBoardColors.current
    val density = LocalDensity.current
    var shortcuts by remember(dog.id) { mutableStateOf<Set<HomeShortcut>>(emptySet()) }
    var coach by rememberSaveable(dog.id) { mutableStateOf(false) }
    LaunchedEffect(dog.id) {
        val stored = withContext(Dispatchers.Default) {
            runCatching { HomeShortcut.decode(context.platform.storage.getString("shortcuts_${dog.id}")) to (context.platform.storage.getBoolean("coach_shown") ?: false) }.getOrDefault(emptySet<HomeShortcut>() to false)
        }
        shortcuts = stored.first; coach = context.reviewScreen == "home-coach" || !stored.second
    }
    val dismissCoach = {
        coach = false
        scope.launch(Dispatchers.Default) { runCatching { context.platform.storage.setBoolean("coach_shown", true) } }
        Unit
    }
    val publishCoach = LocalBoardCoach.current
    var coachTarget by remember { mutableStateOf<Rect?>(null) }
    val latestDismiss by rememberUpdatedState(dismissCoach)
    LaunchedEffect(coach, coachTarget) { publishCoach(if (coach) coachTarget?.let { BoardCoachSpec(it) { latestDismiss() } } else null) }
    DisposableEffect(publishCoach) { onDispose { publishCoach(null) } }
    val flight = remember { Animatable(1f) }
    val tileCenters = remember { mutableStateMapOf<CareEventType, Offset>() }
    val markCenters = remember { mutableStateMapOf<String, Offset>() }
    var landedQuickId by remember(dog.id) { mutableStateOf<String?>(null) }
    var origin by remember { mutableStateOf(Offset.Zero) }; var landing by remember { mutableStateOf(Offset.Zero) }
    var start by remember { mutableStateOf(Offset.Zero) }; var finish by remember { mutableStateOf(Offset.Zero) }
    val saved = journal.lastSaved?.takeIf { it.dogId == dog.id }
    LaunchedEffect(journal.quickUndo?.id, motion.reduced) {
        val record = journal.quickUndo
        if (record == null || motion.reduced) { flight.snapTo(1f); return@LaunchedEffect }
        val target = snapshotFlow { markCenters[record.id] }.first { it != null }!!
        start = tileCenters[record.type] ?: target; finish = target
        flight.snapTo(0f); flight.animateTo(1f, tween(motion.milliseconds(640), easing = LinearEasing))
        landedQuickId = record.id
    }
    Box(Modifier.fillMaxWidth().onGloballyPositioned { origin = it.boundsInWindow().topLeft }) {
        Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.weight(1f)) { BoardDogChip(dog.name, { context.open(Feature.DogSwitcher) }) }
                Surface(onClick = { context.open(Feature.Safety) }, shape = RoundedCornerShape(50), color = boardColor("symptom-bg"), contentColor = boardColor("symptom-ink"), border = BorderStroke(1.dp, boardColor("symptom-line"))) {
                    Row(Modifier.heightIn(min = 48.dp).padding(horizontal = 15.dp), horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon("shield", Modifier.size(18.dp)); Text("Safety", style = MaterialTheme.typography.bodyMedium) }
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { MarkerHeading("${dog.name}’s day", "${dog.name}’s", boardSharedElement("dog-name", boardColor("ground"))); SupportingText(JournalDates.headingDate(JournalDates.day(context.now, context.zone))) }
            Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(32.dp), color = MaterialTheme.colorScheme.surface, border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
                Column(Modifier.padding(start = 14.dp, end = 14.dp, top = 10.dp, bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(Modifier.fillMaxWidth().heightIn(min = 124.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Column(Modifier.weight(1f)) {
                            AnimatedContent(if (journal.loading) null else journal.dailyCounts.values.sum() - if (journal.quickUndo?.let { it.id != landedQuickId && journal.dayEvents.any { e -> e.id == it.id } } == true && !motion.reduced) 1 else 0, transitionSpec = {
                                (if (motion.reduced) fadeIn(tween(1)) togetherWith fadeOut(tween(1))
                                else (slideInVertically(tween(motion.milliseconds(420))) { it / 3 } + fadeIn(tween(motion.milliseconds(260)))) togetherWith (slideOutVertically(tween(motion.milliseconds(240))) { -it / 3 } + fadeOut(tween(motion.milliseconds(180)))))
                                    .using(SizeTransform(clip = false) { _, _ -> snap() })
                            }, label = "care count") { count -> Box(Modifier.height(with(density) { 60.sp.toDp() })) { Text(count?.toString() ?: "–", modifier = Modifier.wrapContentHeight(Alignment.CenterVertically, unbounded = true), style = MaterialTheme.typography.displayLarge.copy(fontFamily = LocalNumberFont.current, fontSize = 60.sp, fontWeight = FontWeight.ExtraBold, lineHeight = 60.sp, letterSpacing = (-3.6).sp), color = boardColor("ink-strong")) } }
                            Text(if (journal.dailyCounts.values.sum() == 1) "care moment today" else "care moments today", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium), color = boardColor("ink-muted"))
                        }
                        if (journal.loading) Surface(Modifier.size(122.dp, 129.dp), shape = RoundedCornerShape(20.dp), color = boardColor("inset")) {}
                        else AnimatedDog(Modifier.size(122.dp, 129.dp).then(boardSharedElement("dog", boardColor("panel"))), saved?.id?.takeIf { it != journal.quickUndo?.id || it == landedQuickId || motion.reduced }, context.journalController::consumedReaction, afterLanding = saved?.id == landedQuickId, greetingLabel = "Say hello to ${dog.name}")
                    }
                    Row(Modifier.heightIn(min = 20.dp).semantics { liveRegion = LiveRegionMode.Polite }, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            if (journal.loading) { SkeletonLine(160.dp); Spacer(Modifier.weight(1f)) }
                            else { BarkIcon("circle-check", Modifier.size(14.dp), boardColor("good")); Text(journal.feedback ?: journal.dayEvents.lastOrNull()?.let { "Last at ${JournalDates.inputTime(it.occurredAtMillis, context.zone)}" } ?: "Nothing recorded yet today", Modifier.weight(1f), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                        if (journal.quickUndo != null) BarkTextAction("Undo", { scope.launch { context.journalController.undoQuickLog() } }, enabled = !journal.saving, icon = "rotate-ccw")
                    }
                    HomeCareStrip(journal.dayEvents, context.zone, journal.loading, Modifier.fillMaxWidth(),
                        hiddenId = journal.quickUndo?.id?.takeIf { it != landedQuickId && !motion.reduced },
                        landedId = landedQuickId,
                        onRecord = { context.navigation.detail(it.dogId, it.id) },
                        onMarkCenter = { event, point -> markCenters[event.id] = point - origin })
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
              Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                  SectionTitle("Quick care"); BarkTextAction("Add details", { context.open(Feature.Chooser) }, enabled = !journal.loading && !journal.saving, icon = "plus")
              }
            Column(Modifier.onGloballyPositioned { coachTarget = it.boundsInWindow() }, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            CareEventType.quickActions.chunked(2).forEach { row -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { type -> EventButton(type, if (journal.loading) null else journal.dailyCounts[type] ?: 0, !journal.saving && !journal.loading,
                    Modifier.weight(1f).onGloballyPositioned { val box = it.boundsInWindow(); tileCenters[type] = Offset(box.left + with(density) { 40.dp.toPx() }, box.top + with(density) { 38.dp.toPx() }) - origin }) {
                    dismissCoach(); scope.launch { context.journalController.quickLog(type) }
                } }
            } }
            }
            }
            Surface(onClick = { context.open(Feature.Chooser) }, enabled = !journal.loading && !journal.saving, shape = RoundedCornerShape(50), color = boardColor(if (LocalBarkDarkTheme.current) "inset" else "ink-strong"), contentColor = boardColor(if (LocalBarkDarkTheme.current) "ink-strong" else "panel")) {
                Row(Modifier.fillMaxWidth().heightIn(min = 72.dp).padding(10.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(shape = RoundedCornerShape(50), color = boardColor("ball"), contentColor = boardColor("ball-ink")) { Box(Modifier.size(52.dp), contentAlignment = Alignment.Center) { BarkIcon("notebook-pen", Modifier.size(24.dp)) } }
                    Column(Modifier.weight(1f)) { Text("Create a log", style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp)); Text("Observations, notes & the little details", style = MaterialTheme.typography.bodySmall) }; BarkIcon("arrow-right", Modifier.size(20.dp))
                }
            }
            if (shortcuts.isNotEmpty()) {
                SectionTitle("Your shortcuts")
                FlowRow(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    shortcuts.forEach { shortcut ->
                        BarkTextAction(shortcut.label, { context.open(shortcut.feature) }, icon = featureIcon(shortcut.feature))
                    }
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { SectionTitle("Recent care"); BarkTextAction("View all", { context.navigation.show(Route.Timeline) }, icon = "arrow-right") }
            when {
                journal.loading -> JournalCard { repeat(3) { SkeletonLine(180.dp); SkeletonLine(120.dp) } }
                journal.events.isEmpty() -> FeatureNotice("A fresh page", "Tap a care tile when it happens. It lands on today’s line.", "notebook-pen")
                else -> BoardMenu { journal.events.forEach { event -> TimelineRow(event, context.zone, includeDate = JournalDates.day(event.occurredAtMillis, context.zone) != JournalDates.day(context.now, context.zone), onClick = { context.navigation.detail(event.dogId, event.id) }, bordered = false) } }
            }
            context.companion?.let { companion ->
                val companionState by companion.state.collectAsState()
                companionState.error?.let { ErrorCard(it) }
                SectionTitle("With Premium")
                listOf("A week in plain words" to com.dracoarts.shared.presentation.companion.CompanionScreen.WeeklyRecap,"Questions for the vet" to com.dracoarts.shared.presentation.companion.CompanionScreen.VetQuestions,"A caption to keep" to com.dracoarts.shared.presentation.companion.CompanionScreen.MemoryCaption).forEach { (title, screen) -> FeatureRow(title,"From context you choose","message-circle") {companion.go(screen)} }
            }
            CaptionText("Saved on this device. Works offline.")
        }
        val record = journal.quickUndo
        if (record != null && flight.value < 1f && !motion.reduced) {
            val t = flight.value; val p = CubicBezierEasing(.76f, 0f, .24f, 1f).transform(t); val q = 1 - p
            val control = Offset((start.x + finish.x) / 2, minOf(start.y, finish.y) - with(density) { 46.dp.toPx() })
            val point = start * (q * q) + control * (2 * q * p) + finish * (p * p)
            EventMark(record.type, 28.dp, Modifier.offset(x = with(density) { point.x.toDp() } - 14.dp, y = with(density) { point.y.toDp() } - 14.dp))
        }
    }
}

fun dayLineFraction(minutes: Int): Float = ((minutes - 360) / 1080f).coerceIn(0f, 1f)

@Composable
fun DayLine(events: List<CareEvent>, now: Long, zone: kotlinx.datetime.TimeZone, modifier: Modifier = Modifier, compact: Boolean = false, showAxis: Boolean = !compact, showNow: Boolean = true, home: Boolean = false, hiddenId: String? = null, highlightId: String? = null, reveal: Boolean = false, onMarkCenter: (CareEvent, Offset) -> Unit = { _, _ -> }) {
    val colors = LocalBoardColors.current
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val revealClock = remember { Animatable(if (!reveal || motion.reduced || restoring) 1600f else 0f) }
    LaunchedEffect(reveal, motion.reduced, motion.replay, restoring) { if (!reveal || motion.reduced || restoring) revealClock.snapTo(1600f) else { revealClock.snapTo(0f); revealClock.animateTo(1600f, tween(motion.milliseconds(1600), easing = LinearEasing)) } }
    val ease = CubicBezierEasing(.16f, 1f, .3f, 1f)
    val drawn = ease.transform(((revealClock.value - 260) / 760).coerceIn(0f, 1f))
    val points = remember(events, zone.id) {
        val lanes = FloatArray(3) { -1f }
        events.sortedBy { it.occurredAtMillis }.map { event ->
            val clock = JournalDates.inputTime(event.occurredAtMillis, zone).split(':').map(String::toInt)
            val fraction = dayLineFraction(clock[0] * 60 + clock[1])
            val lane = lanes.indexOfFirst { it < 0 || fraction - it >= .082f }.takeIf { it >= 0 } ?: lanes.indices.minBy { lanes[it] }
            lanes[lane] = fraction
            Triple(fraction, event, lane)
        }
    }
    val clock = JournalDates.inputTime(now, zone).split(':').map(String::toInt)
    val current = if (showNow) dayLineFraction(clock[0] * 60 + clock[1]) else 1f
    Column(modifier.semantics(mergeDescendants = true) { contentDescription = "Day line, 06:00 to midnight. ${events.size} recorded moments. " + events.joinToString { "${it.type.label} ${JournalDates.inputTime(it.occurredAtMillis, zone)}" } }, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        val trackHeight = if (home) 60.dp else 84.dp
        BoxWithConstraints(Modifier.fillMaxWidth().height(if (compact) 14.dp else trackHeight)) {
            Canvas(Modifier.fillMaxSize().clearAndSetSemantics {}) {
                val y = if (compact) size.height / 2 else size.height - 1.dp.toPx()
                drawLine(colors.getValue("hair-2").copy(alpha = .45f), Offset(0f, y), Offset(size.width, y), strokeWidth = 2.dp.toPx(), cap = androidx.compose.ui.graphics.StrokeCap.Round)
                drawLine(colors.getValue("ink-muted"), Offset(0f, y), Offset(size.width * current * drawn, y), strokeWidth = 2.dp.toPx(), cap = androidx.compose.ui.graphics.StrokeCap.Round)
                if (compact) points.forEach { (fraction, event, _) -> drawCircle(colors["${event.type.key}-dot"] ?: colors.getValue("note-dot"), 6.dp.toPx(), Offset((size.width * fraction).coerceIn(6.dp.toPx(), size.width - 6.dp.toPx()), y)) }
                if (showNow) {
                val arrived = ease.transform(((revealClock.value - 731) / 380).coerceIn(0f, 1f))
                drawCircle(colors.getValue("ball").copy(alpha = arrived), (if (compact) 6.dp.toPx() else 7.dp.toPx()) * (.5f + .5f * arrived), Offset(size.width * current, y))
                drawCircle(colors.getValue("ink-strong").copy(alpha = arrived), (if (compact) 4.dp.toPx() else 5.dp.toPx()) * (.5f + .5f * arrived), Offset(size.width * current, y))
                drawCircle(colors.getValue("ball").copy(alpha = arrived), (if (compact) 2.dp.toPx() else 3.dp.toPx()) * (.5f + .5f * arrived), Offset(size.width * current, y))
                }
            }
            if (!compact) points.forEach { (fraction, event, lane) ->
                val at = remember(fraction, current) { var lo = 0f; var hi = 1f; repeat(18) { val mid = (lo + hi) / 2; if (ease.transform(mid) < (fraction / current.coerceAtLeast(.01f)).coerceIn(0f, 1f)) lo = mid else hi = mid }; 260 + minOf(lo * 760, 608f) }
                val arriving = ease.transform(((revealClock.value - at) / 380).coerceIn(0f, 1f))
                EventMark(event.type, 26.dp, Modifier.offset(x = (maxWidth * fraction - 13.dp).coerceIn(0.dp, maxWidth - 26.dp), y = trackHeight - (34 + lane * 20).dp).onGloballyPositioned { val b = it.boundsInWindow(); onMarkCenter(event, Offset(b.left + b.width / 2, b.top + b.height / 2)) }.graphicsLayer { alpha = if (event.id == hiddenId) 0f else arriving * if (highlightId != null && event.id != highlightId) .35f else 1f; scaleX = .5f + .5f * arriving; scaleY = scaleX; translationY = 6.dp.toPx() * (1 - arriving) }, outlined = true)
            }
        }
        if (showAxis) Row(Modifier.fillMaxWidth().padding(top = 4.dp).heightIn(min = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) { listOf("06", "09", "12", "15", "18", "21", "00").forEach { Text(it, style = MaterialTheme.typography.labelSmall.copy(fontSize = if (home) 9.sp else 11.sp), color = colors.getValue("ink-muted")) } }
    }
}
