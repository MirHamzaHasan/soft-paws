package com.dracoarts.shared.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.theme.*

data class BoardCoachSpec(val target: Rect, val dismiss: () -> Unit)
val LocalBoardCoach = staticCompositionLocalOf<(BoardCoachSpec?) -> Unit> { {} }

/** The single first-run tip sits over the actual quick-care controls. */
@Composable
fun BoardCoachOverlay(spec: BoardCoachSpec, modifier: Modifier = Modifier) {
    val motion = LocalBarkMotion.current
    val scrim = boardColor("scrim")
    val focus = boardColor("accent")
    var origin by remember { mutableStateOf(Offset.Zero) }
    val progress = remember { Animatable(if (motion.reduced) 1f else 0f) }
    LaunchedEffect(motion.reduced) { if (motion.reduced) progress.snapTo(1f) else progress.animateTo(1f, tween(motion.milliseconds(400), easing = CubicBezierEasing(.23f, 1f, .32f, 1f))) }
    Box(modifier.onGloballyPositioned { origin = it.boundsInWindow().topLeft }) {
        Canvas(Modifier.matchParentSize()) {
            val target = spec.target.translate(-origin).inflate(8.dp.toPx())
            val hole = RoundRect(target, CornerRadius(26.dp.toPx()))
            val path = Path().apply { fillType = PathFillType.EvenOdd; addRect(Rect(Offset.Zero, size)); addRoundRect(hole) }
            drawPath(path, scrim.copy(alpha = .6f * progress.value))
            drawRoundRect(focus.copy(alpha = .95f * progress.value), target.topLeft, target.size, CornerRadius(26.dp.toPx()), style = Stroke(2.dp.toPx()))
        }
        Surface(Modifier.align(Alignment.BottomCenter).padding(start = 24.dp, end = 24.dp, bottom = 88.dp).fillMaxWidth().graphicsLayer { alpha = progress.value; translationY = 8.dp.toPx() * (1 - progress.value) }, shape = RoundedCornerShape(20.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
            Column(Modifier.padding(start = 16.dp, end = 16.dp, top = 14.dp, bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) { Surface(Modifier.size(7.dp), shape = RoundedCornerShape(50), color = boardColor("accent")) {}; Text("ONE QUICK TIP", style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, letterSpacing = 1.1.sp), color = boardColor("accent-text")) }
                Text("Keep what you noticed", style = MaterialTheme.typography.titleMedium.copy(fontSize = 17.sp))
                Text("Choose a check-in, add the details, then save it to your cat’s day.", style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.5.sp, lineHeight = 19.575.sp), color = boardColor("ink-muted"))
                Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { BarkTextAction("Skip the tour", spec.dismiss); Button(spec.dismiss, Modifier.heightIn(min = 48.dp), shape = RoundedCornerShape(50), elevation = null) { Text("Start logging"); Spacer(Modifier.width(6.dp)); BarkIcon("arrow-right", Modifier.size(15.dp)) } }
            }
        }
    }
}
