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
