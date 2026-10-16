@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.presentation.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.theme.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

/** Practice has an earned landing, but never creates a repository record. */
@Composable
fun PracticeBoardCard(practiced: Boolean, zone: TimeZone, onLanded: () -> Unit) {
    val motion = LocalBarkMotion.current; val density = LocalDensity.current
    var flying by remember { mutableStateOf(false) }
    var origin by remember { mutableStateOf(Offset.Zero) }
    var source by remember { mutableStateOf(Offset.Zero) }
    var target by remember { mutableStateOf<Offset?>(null) }
    val flight = remember { Animatable(1f) }
    val example = remember(zone) { val at = LocalDateTime(2026, 10, 14, 18, 20).toInstant(zone).toEpochMilliseconds(); CareEvent("practice-only", "practice-only", CareEventType.Walk, at, at) }
    LaunchedEffect(flying, motion.reduced) {
        if (flying) {
            flight.snapTo(0f)
            snapshotFlow { target }.first { it != null }
            if (motion.reduced) flight.snapTo(1f) else flight.animateTo(1f, tween(motion.milliseconds(580), easing = LinearEasing))
            flying = false; onLanded()
        }
    }
    Surface(shape = RoundedCornerShape(26.dp), color = boardColor("walk-bg"), border = BorderStroke(1.dp, boardColor("walk-line"))) {
        Box(Modifier.fillMaxWidth().onGloballyPositioned { origin = it.boundsInWindow().topLeft }) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { SectionTitle("14 October"); CaptionText("Practice") }
                EventMark(CareEventType.Walk, 76.dp, Modifier.align(Alignment.CenterHorizontally).onGloballyPositioned { val b = it.boundsInWindow(); source = Offset(b.left + b.width / 2, b.top + b.height / 2) - origin })
                DayLine(if (practiced || flying) listOf(example) else emptyList(), LocalDateTime(2026, 10, 14, 20, 30).toInstant(zone).toEpochMilliseconds(), zone, Modifier.fillMaxWidth(), hiddenId = if (flying) example.id else null, onMarkCenter = { _, point -> target = point - origin })
                CaptionText(if (practiced) "Practice walk · 18:20. The time is kept." else "One tap keeps the time.")
                BarkButton(if (practiced || flying) "Practice walk logged" else "Log a practice walk", { flying = true }, enabled = !practiced && !flying, secondary = true, icon = "footprints")
            }
            if (flying && flight.value < 1f && !motion.reduced) {
                val p = CubicBezierEasing(.76f, 0f, .24f, 1f).transform(flight.value); val q = 1 - p; val dest = target ?: source
                val control = Offset((source.x + dest.x) / 2, minOf(source.y, dest.y) - with(density) { 30.dp.toPx() })
                val point = source * (q * q) + control * (2 * q * p) + dest * (p * p)
                EventMark(CareEventType.Walk, 26.dp, Modifier.offset(with(density) { point.x.toDp() } - 13.dp, with(density) { point.y.toDp() } - 13.dp).graphicsLayer { scaleX = (76f + (26 - 76) * p) / 26; scaleY = scaleX }, outlined = true)
            }
        }
    }
}
