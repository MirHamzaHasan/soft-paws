@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.dracoarts.shared.presentation.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.theme.*
import kotlinx.datetime.*

/** Explicitly illustrated examples. No practice or opening record is sent to a repository. */
@Composable
fun OpeningBoardScreen(zone: TimeZone, next: () -> Unit) {
    val motion = LocalBarkMotion.current
    val density = LocalDensity.current
    val window = LocalWindowInfo.current
    val insets = WindowInsets.safeDrawing.asPaddingValues()
    val height = with(density) { window.containerSize.height.toDp() } - insets.calculateTopPadding() - insets.calculateBottomPadding() - 24.dp
    val clock = remember { Animatable(if (motion.reduced) 4200f else 0f) }
    LaunchedEffect(motion.reduced, motion.replay) {
        if (motion.reduced) clock.snapTo(4200f)
        else { clock.snapTo(0f); clock.animateTo(4200f, tween(motion.milliseconds(4200), easing = LinearEasing)) }
    }
    val examples = remember(zone) { listOf(CareEventType.Poop to "07:40", CareEventType.Meal to "08:15", CareEventType.Pee to "13:05", CareEventType.Walk to "18:20").mapIndexed { index, (type, time) ->
        val at = LocalDateTime.parse("2026-10-14T$time").toInstant(zone).toEpochMilliseconds()
        CareEvent("opening-example-$index", "example-only", type, at, at)
    } }
    val elapsed = clock.value
    val landed = if (motion.reduced) 4 else ((elapsed - 1880f) / 420f).toInt().plus(if (elapsed >= 1880) 1 else 0).coerceIn(0, 4)
    val final = elapsed >= 3340
    val ready = elapsed >= 3600
    var stageOrigin by remember { mutableStateOf(Offset.Zero) }
    var lineOrigin by remember { mutableStateOf(Offset.Zero) }
    var lineWidth by remember { mutableFloatStateOf(0f) }
    Column(Modifier.fillMaxWidth().height(height.coerceAtLeast(if (density.fontScale > 1.1f) 790.dp else 650.dp)).padding(horizontal = 4.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { Surface(shape = CircleShape, color = boardColor("ball")) { Box(Modifier.size(30.dp), contentAlignment = Alignment.Center) { PawMark(Modifier.size(16.dp)) } }; Text("BarkLog", style = MaterialTheme.typography.titleLarge.copy(fontSize = 15.sp)) }
            if (!ready) BarkTextAction("Skip", next)
        }
        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f).onGloballyPositioned { stageOrigin = it.boundsInWindow().topLeft }) {
            Surface(Modifier.align(Alignment.TopCenter).padding(top = 34.dp).size(132.dp, 142.dp).then(boardSharedElement("dog", boardColor("accent-soft"))).graphicsLayer { val p = CubicBezierEasing(.16f, 1f, .3f, 1f).transform(((clock.value - 150) / 560).coerceIn(0f, 1f)); alpha = p; scaleX = .8f + .2f * p; scaleY = scaleX; translationY = 14 * density.density * (1 - p) }, shape = RoundedCornerShape(66.dp, 66.dp, 30.dp, 30.dp), color = boardColor("accent-soft"), border = BorderStroke(1.dp, boardColor("hair"))) { Box(contentAlignment = Alignment.BottomCenter) { BoardDogPortrait(Modifier.size(120.dp)) } }
            Box(Modifier.fillMaxWidth().padding(top = 200.dp)) {
                Surface(Modifier.matchParentSize().graphicsLayer { alpha = if (motion.reduced) 1f else ((clock.value - 3100) / 560).coerceIn(0f, 1f) }, shape = RoundedCornerShape(24.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {}
                Column(Modifier.padding(start = 18.dp, end = 18.dp, top = 18.dp, bottom = 14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("Wednesday · 14 October", style = MaterialTheme.typography.titleMedium); CaptionText("$landed ${if (landed == 1) "moment" else "moments"}") }
                    DayLine(examples.take(landed), LocalDateTime(2026, 10, 14, 20, 30).toInstant(zone).toEpochMilliseconds(), zone, Modifier.fillMaxWidth().onGloballyPositioned { lineOrigin = it.boundsInWindow().topLeft - stageOrigin; lineWidth = it.size.width.toFloat() })
                }
            }
            if (!motion.reduced) examples.forEachIndexed { index, record ->
                val t = ((elapsed - 1300 - index * 420) / 580).coerceIn(0f, 1f)
                if (t > 0 && t < 1) {
                    val p = CubicBezierEasing(.76f, 0f, .24f, 1f).transform(t); val q = 1 - p
                    val time = com.dracoarts.shared.presentation.state.JournalDates.inputTime(record.occurredAtMillis, zone).split(':').map(String::toInt)
                    val from = Offset(with(density) { maxWidth.toPx() } / 2, with(density) { 140.dp.toPx() })
                    val to = lineOrigin + Offset(lineWidth * dayLineFraction(time[0] * 60 + time[1]), with(density) { (63 - if (index == 1) 20 else 0).dp.toPx() })
                    val control = Offset((from.x + to.x) / 2, minOf(from.y, to.y) - with(density) { 34.dp.toPx() })
                    val point = from * (q * q) + control * (2 * q * p) + to * (p * p)
                    EventMark(record.type, 26.dp, Modifier.offset(with(density) { point.x.toDp() } - 13.dp, with(density) { point.y.toDp() } - 13.dp))
                }
            }
        }
        AnimatedContent(final, transitionSpec = { (slideInVertically(tween(motion.milliseconds(520))) { 10 } + fadeIn(tween(motion.milliseconds(520)))) togetherWith (slideOutVertically(tween(motion.milliseconds(240))) { -6 } + fadeOut(tween(motion.milliseconds(240)))) }, label = "opening words") { settled ->
            Column(Modifier.heightIn(min = 104.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { MarkerHeading(if (settled) "Small moments, kept by day." else "Every walk.\nEvery meal.", if (settled) "day." else "", style = MaterialTheme.typography.displaySmall); Text(if (settled) "A private journal on this phone. No account." else "An example day with a dog like yours.", style = MaterialTheme.typography.bodyMedium, color = boardColor("ink-muted")) }
        }
        Box(Modifier.padding(top = 16.dp).heightIn(min = 56.dp)) { if (ready) BarkButton("Add my dog", next, icon = "arrow-right") }
    }
}
