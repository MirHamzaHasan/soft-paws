package com.dracoarts.shared.presentation.theme

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.filterIsInstance
import kotlinx.coroutines.flow.collectLatest
import com.dracoarts.shared.presentation.components.LocalBoardRestoring

data class BarkMotion(val reduced: Boolean = false, val speed: Float = 1f, val replay: Int = 0) {
    fun milliseconds(value: Int) = (value / speed.coerceIn(.25f, 1f)).roundToInt()
}

val LocalBarkMotion = staticCompositionLocalOf { BarkMotion() }

@Composable
expect fun rememberSystemReducedMotion(): Boolean

private val strong = BoardMotionTokens.strongCurve.let { CubicBezierEasing(it[0], it[1], it[2], it[3]) }
private val decel = BoardMotionTokens.decelCurve.let { CubicBezierEasing(it[0], it[1], it[2], it[3]) }

@Composable
fun pressMotion(source: MutableInteractionSource, enabled: Boolean = true): Modifier {
    val pressed by source.collectIsPressedAsState()
    val motion = LocalBarkMotion.current
    val pose = remember { Animatable(0f) }
    val depth = with(LocalDensity.current) { BoardMotionTokens.pressDepth.dp.toPx() }
    LaunchedEffect(pressed, enabled, motion.reduced, motion.speed) {
        val target = if (pressed && enabled && !motion.reduced) 1f else 0f
        val spec = when {
            motion.reduced -> snap<Float>()
            pressed -> tween(motion.milliseconds(BoardMotionTokens.pressDownMs), easing = strong)
            else -> spring(dampingRatio = BoardMotionTokens.releaseDamping,
                stiffness = ((2 * PI / BoardMotionTokens.releaseResponse).pow(2) * motion.speed.pow(2)).toFloat())
        }
        pose.animateTo(target, spec)
    }
    return Modifier.graphicsLayer {
        val fraction = pose.value
        scaleX = 1 - (1 - BoardMotionTokens.pressScale) * fraction
        scaleY = scaleX
        translationY = depth * fraction
    }
}

/** A glyph has its own pose so its response never replaces the control's position. */
@Composable
fun glyphPressMotion(source: MutableInteractionSource, direction: Float = 0f, enabled: Boolean = true): Modifier {
    val pressed by source.collectIsPressedAsState()
    val motion = LocalBarkMotion.current
    val pose = remember { Animatable(0f) }
    LaunchedEffect(pressed, enabled, motion.reduced, motion.speed) {
        if (motion.reduced || !enabled) pose.snapTo(0f)
        else pose.animateTo(if (pressed) 1f else 0f, if (pressed) tween(motion.milliseconds(90), easing = strong)
            else spring(.86f, ((2 * PI / .30).pow(2) * motion.speed.pow(2)).toFloat()))
    }
    return Modifier.graphicsLayer { scaleX = 1 - .1f * pose.value; scaleY = scaleX; translationX = direction * 3.dp.toPx() * pose.value }
}

/** Round stickers give under a finger, then settle once. Reading surfaces stay still. */
@Composable
fun stickerPressMotion(source: MutableInteractionSource, enabled: Boolean = true): Modifier {
    val pressed by source.collectIsPressedAsState()
    val motion = LocalBarkMotion.current
    val pose = remember { Animatable(0f) }
    LaunchedEffect(pressed, enabled, motion.reduced, motion.speed) {
        if (motion.reduced || !enabled) pose.snapTo(0f)
        else pose.animateTo(if (pressed) 1f else 0f, if (pressed) tween(motion.milliseconds(90), easing = strong)
            else spring(.60f, ((2 * PI / .34).pow(2) * motion.speed.pow(2)).toFloat()))
    }
    return Modifier.graphicsLayer { scaleX = 1 + .06f * pose.value; scaleY = 1 / scaleX }
}

/** Only a new selection earns a pop; restored/preselected values have no entrance. */
@Composable
fun selectionLanding(selected: Boolean, delayMs: Int = 0): Modifier {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    var previous by remember { androidx.compose.runtime.mutableStateOf(selected) }
    val pose = remember { Animatable(1f) }
    LaunchedEffect(selected, motion.reduced, motion.speed, restoring) {
        val earned = selected && !previous
        previous = selected
        if (!earned || motion.reduced || restoring) pose.snapTo(1f)
        else {
            pose.snapTo(.5f)
            delay(motion.milliseconds(delayMs).toLong())
            pose.animateTo(1f, spring(.62f, ((2 * PI / .38).pow(2) * motion.speed.pow(2)).toFloat()))
        }
    }
    return Modifier.graphicsLayer { scaleX = pose.value; scaleY = pose.value }
}

/** The arriving care mark keeps its volume at contact and then goes still. */
@Composable
fun careMarkLanding(landed: Boolean): Modifier {
    val motion = LocalBarkMotion.current
    var previous by remember { androidx.compose.runtime.mutableStateOf(landed) }
    val contact = remember { Animatable(0f) }
    LaunchedEffect(landed, motion.reduced) {
        val earned = landed && !previous
        previous = landed
        if (!earned || motion.reduced) contact.snapTo(0f)
        else { contact.snapTo(1f); contact.animateTo(0f, spring(.62f, ((2 * PI / .38).pow(2) * motion.speed.pow(2)).toFloat())) }
    }
    return Modifier.graphicsLayer { scaleX = 1 + .12f * contact.value; scaleY = 1 / scaleX }
}

fun glyphDirection(icon: String): Float = when (icon) {
    "arrow-left" -> -1f
    "arrow-right", "chevron-right", "plus", "send", "download", "file-down" -> 1f
    else -> 0f
}

@Composable
fun entranceMotion(key: Any): Modifier {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val amount = remember { Animatable(1f) }
    val distance = with(LocalDensity.current) { BoardMotionTokens.riseDistance.dp.toPx() }
    LaunchedEffect(key, motion.reduced, motion.replay, restoring) {
        if (motion.reduced || restoring) amount.snapTo(1f)
        else { amount.snapTo(0f); amount.animateTo(1f, tween(motion.milliseconds(BoardMotionTokens.riseMs), easing = decel)) }
    }
    return Modifier.graphicsLayer { alpha = amount.value; translationY = distance * (1 - amount.value) }
}

@Composable
fun softBubble(source: MutableInteractionSource, color: Color, enabled: Boolean = true): Modifier {
    val motion = LocalBarkMotion.current
    val progress = remember { Animatable(1f) }
    var center by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(Offset.Zero) }
    LaunchedEffect(source, motion.reduced, motion.speed, enabled) {
        if (motion.reduced || !enabled) { progress.snapTo(1f); return@LaunchedEffect }
        source.interactions.filterIsInstance<PressInteraction.Release>().collectLatest { interaction ->
                center = interaction.press.pressPosition
                progress.snapTo(0f); progress.animateTo(1f, tween(motion.milliseconds(480), easing = strong))
        }
    }
    return Modifier.drawWithContent {
        drawContent()
        if (!motion.reduced && progress.value < 1f) drawCircle(color.copy(alpha = .07f * (1 - progress.value)), radius = (4.dp.toPx() + size.maxDimension * .7f * progress.value), center = center)
    }
}

@Composable
fun textEntrance(): Modifier {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val value = remember { Animatable(if (motion.reduced) 1f else 0f) }
    val y = with(LocalDensity.current) { 3.dp.toPx() }
    LaunchedEffect(motion.replay, motion.reduced, restoring) {
        if (motion.reduced || restoring) value.snapTo(1f)
        else { value.snapTo(0f); value.animateTo(1f, tween(motion.milliseconds(260), easing = decel)) }
    }
    return Modifier.graphicsLayer { alpha = value.value; translationY = y * (1 - value.value) }
}

