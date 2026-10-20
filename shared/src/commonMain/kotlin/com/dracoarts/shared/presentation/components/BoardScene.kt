package com.dracoarts.shared.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.layer.drawLayer
import androidx.compose.ui.graphics.layer.GraphicsLayer
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.hideFromAccessibility
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.DeviceServices
import com.dracoarts.shared.services.DeviceFrameBounds
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.MutableStateFlow
import kotlin.math.*

private data class SharedBoardPart(val bounds: Rect, val ground: Color, val generation: Int,
    val layer: GraphicsLayer, val recorded: MutableStateFlow<Int>)
private class BoardPartsRegistry {
    var origin = Offset.Zero
    var generation by mutableIntStateOf(0)
    val parts = mutableStateMapOf<String, SharedBoardPart>()
    var hidden by mutableStateOf(emptySet<String>())
}
private val LocalBoardParts = staticCompositionLocalOf<BoardPartsRegistry?> { null }
val LocalBoardNavigation = staticCompositionLocalOf<BoardNavigationHandler> { { _, action -> action() } }
val LocalBoardRestoring = staticCompositionLocalOf { false }
private val boardEmph = CubicBezierEasing(.16f, 1f, .3f, 1f)
private val boardExit = CubicBezierEasing(.4f, 0f, 1f, 1f)
private val boardInOut = CubicBezierEasing(.76f, 0f, .24f, 1f)
private fun phase(ms: Float, duration: Float, delay: Float = 0f) = ((ms - delay) / duration).coerceIn(0f, 1f)

/** One live composition. The outgoing frame and carried twins are read-only pixels. */
@Composable
fun BoardScene(state: AppState, device: DeviceServices, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    val motion = LocalBarkMotion.current
    val ground = boardColor("ground")
    val density = LocalDensity.current
    val incomingPaint = remember { Paint() }
    var frameBounds by remember { mutableStateOf(DeviceFrameBounds(0, 0, 0, 0)) }
    val registry = remember { BoardPartsRegistry() }
    val clock = remember { Animatable(1f) }
    var oldImage by remember { mutableStateOf<ImageBitmap?>(null) }
    var twins by remember { mutableStateOf(emptyMap<String, ImageBitmap>()) }
    var oldParts by remember { mutableStateOf(emptyMap<String, SharedBoardPart>()) }
    var newParts by remember { mutableStateOf(emptyMap<String, SharedBoardPart>()) }
    val movingBounds = remember { mutableMapOf<String, Rect>() }
    var move by remember { mutableStateOf(BoardNavigationMove.Cut) }
    var tabDirection by remember { mutableFloatStateOf(1f) }
    var restoring by remember { mutableStateOf(false) }
    var preparing by remember { mutableStateOf(false) }
    var capturing by remember { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    var pending by remember { mutableStateOf<(() -> Unit)?>(null) }
    val scope = rememberCoroutineScope()
    val currentMotion by rememberUpdatedState(motion)
    val navigating by remember { derivedStateOf { oldImage != null && clock.value < 1f } }
    val touchReady by remember { derivedStateOf { oldImage == null || !preparing && clock.value >= when (move) { BoardNavigationMove.Carry -> .25f; BoardNavigationMove.Cover -> .3f; BoardNavigationMove.Back -> .78f; BoardNavigationMove.Tab -> .35f; else -> .15f } } }
    val navigate: BoardNavigationHandler = remember(state) { { intent, action ->
        job?.cancel()
        pending = action
        job = scope.launch {
            val settings = currentMotion
            val fromTab = state.route.ordinal
            val snapshot = if (settings.reduced || intent == BoardNavigationMove.Cut || frameBounds.width == 0) null
                else {
                    // Record the same-art still while native render surfaces are detached.
                    // It carries with Compose's layers instead of leaving a blank/black twin.
                    capturing = true
                    try {
                        withFrameNanos { }; withFrameNanos { }
                        withTimeoutOrNull(160) { device.captureFrame(frameBounds) }
                    } finally { capturing = false }
                }
            oldImage = snapshot; twins = emptyMap()
            oldParts = registry.parts.mapValues { (key, part) -> movingBounds[key]?.let { part.copy(bounds = it) } ?: part }
            newParts = emptyMap(); movingBounds.clear()
            registry.parts.clear(); registry.hidden = emptySet()
            registry.generation++
            move = intent; restoring = intent == BoardNavigationMove.Back || intent == BoardNavigationMove.Tab
            preparing = intent == BoardNavigationMove.Carry && snapshot != null
            clock.snapTo(if (snapshot == null) 1f else 0f)
            action(); pending = null
            tabDirection = if (state.route.ordinal >= fromTab) 1f else -1f
            if (snapshot != null) {
                withFrameNanos { }; withFrameNanos { }
                if (intent == BoardNavigationMove.Carry) {
                    withTimeoutOrNull(180) { snapshotFlow { registry.parts.toMap().filterValues { it.generation == registry.generation } }.first { parts -> parts.keys.any { it in oldParts } } }
                    withFrameNanos { }; withFrameNanos { }
                    val candidates = registry.parts.toMap().filter { (key, part) -> key in oldParts && part.generation == registry.generation && part.bounds.width > 0 && part.bounds.height > 0 && oldParts.getValue(key).bounds.width > 0 && oldParts.getValue(key).bounds.height > 0 }
                    val captured = mutableMapOf<String, ImageBitmap>()
                    // Each part records itself before its displayed copy is hidden.
                    // Capturing a whole faded screen can yield transparent nested
                    // layers; a part's own raster stays independent of that pose.
                    candidates.forEach { (key, part) ->
                        val image = try { withTimeoutOrNull(240) {
                            part.recorded.first { it == part.generation }
                            part.layer.toImageBitmap()
                        } } catch (cancelled: CancellationException) { throw cancelled } catch (_: Exception) { null }
                        if (image != null) captured[key] = image
                    }
                    twins = captured
                    newParts = candidates.filterKeys { it in captured }
                    registry.hidden = captured.keys
                }
                preparing = false
                val duration = when (intent) { BoardNavigationMove.Push -> 540; BoardNavigationMove.Cover -> 640; BoardNavigationMove.Carry -> 900; BoardNavigationMove.Tab -> 530; BoardNavigationMove.Back -> 420; else -> 280 }
                clock.animateTo(1f, tween(settings.milliseconds(duration), easing = LinearEasing))
            }
            registry.hidden = emptySet(); oldImage = null; twins = emptyMap(); movingBounds.clear()
        }
    } }
    DisposableEffect(state, navigate) {
        state.navigationHandler = navigate
        onDispose { if (state.navigationHandler === navigate) state.navigationHandler = null }
    }
    LaunchedEffect(motion.reduced) {
        if (motion.reduced) { job?.cancel(); pending?.invoke(); pending = null; preparing = false; clock.snapTo(1f); registry.hidden = emptySet(); oldImage = null; twins = emptyMap(); movingBounds.clear() }
    }
    CompositionLocalProvider(LocalBoardNavigation provides navigate, LocalBoardParts provides registry, LocalBoardRestoring provides restoring,
        LocalMascotSnapshot provides (capturing || preparing || navigating)) {
        Box(modifier.background(ground).onGloballyPositioned {
            val bounds = it.boundsInWindow(); registry.origin = bounds.topLeft
            frameBounds = DeviceFrameBounds(bounds.left.roundToInt(), bounds.top.roundToInt(), bounds.width.roundToInt(), bounds.height.roundToInt())
        }) {
            Canvas(Modifier.matchParentSize()) {
                val old = oldImage ?: return@Canvas
                if (move == BoardNavigationMove.Back) return@Canvas // The departing page stays above the uncovered page.
                val t = clock.value
                val out = when (move) { BoardNavigationMove.Push -> boardExit.transform(phase(t * 540, 320f)); BoardNavigationMove.Cover -> boardEmph.transform(phase(t * 640, 560f)); BoardNavigationMove.Carry -> boardExit.transform(phase(t * 900, 300f)); BoardNavigationMove.Tab -> boardExit.transform(phase(t * 530, 120f)); else -> 0f }
                val scale = when (move) { BoardNavigationMove.Cover -> 1 - .07f * out; BoardNavigationMove.Carry -> 1 - .02f * out; else -> 1f }
                val alpha = when (move) { BoardNavigationMove.Push -> 1 - .65f * out; BoardNavigationMove.Cover -> 1 - .45f * out; BoardNavigationMove.Carry, BoardNavigationMove.Tab -> 1 - out; else -> 1f }
                clipRect(bottom = if (move == BoardNavigationMove.Tab) (size.height - 92.dp.toPx()).coerceAtLeast(0f) else size.height) {
                withTransform({
                    translate(when (move) { BoardNavigationMove.Push -> -size.width * .16f * out; BoardNavigationMove.Tab -> -20f * density.density * tabDirection * out; else -> 0f }, if (move == BoardNavigationMove.Carry) 10f * density.density * out else 0f)
                    scale(scale, scale, Offset(size.width / 2, size.height * .4f))
                }) {
                    drawImage(old, alpha = alpha)
                    if (move == BoardNavigationMove.Carry) oldParts.filterKeys { it in twins }.values.forEach { part -> drawRect(part.ground, part.bounds.topLeft, part.bounds.size, alpha = alpha) }
                }
                }
            }
            Box(Modifier.fillMaxSize().then(if (navigating) Modifier.semantics { hideFromAccessibility() } else Modifier).pointerInput(touchReady) { if (!touchReady) awaitPointerEventScope { while (true) awaitPointerEvent(PointerEventPass.Initial).changes.forEach { it.consume() } } }.graphicsLayer {
                val t = clock.value
                // Parts must draw while their destination pixels are being captured.
                alpha = 1f
                if (oldImage == null || t >= 1f) { alpha = 1f; translationX = 0f; translationY = 0f }
                else when (move) {
                    BoardNavigationMove.Push -> { translationX = size.width * (1 - boardEmph.transform(phase(t * 540, 520f))); translationY = 0f; alpha = 1f }
                    BoardNavigationMove.Cover -> {
                        val seconds = t * .640f; val omega = (2 * PI / .62).toFloat(); val damping = .9f; val wd = omega * sqrt(1 - damping * damping)
                        val spring = 1 - exp(-damping * omega * seconds) * (cos(wd * seconds) + damping * omega / wd * sin(wd * seconds))
                        translationY = size.height * (1 - spring); translationX = 0f; alpha = 1f
                    }
                    BoardNavigationMove.Carry -> { val entering = boardEmph.transform(phase(t * 900, 520f, 200f)); translationY = if (preparing) 0f else 16f * density.density * (1 - entering); translationX = 0f }
                    BoardNavigationMove.Tab -> { translationX = 40.dp.toPx() * tabDirection * (1 - boardEmph.transform(phase(t * 530, 440f, 90f))); translationY = 0f }
                    BoardNavigationMove.Back -> { translationX = -size.width * .28f * (1 - boardEmph.transform(t)); translationY = 0f }
                    else -> { translationX = 0f; translationY = 0f }
                }
            }.drawWithContent {
                val opacity = if (oldImage == null || clock.value >= 1f) 1f else when (move) {
                    BoardNavigationMove.Carry -> boardEmph.transform(phase(clock.value * 900, 520f, 200f))
                    BoardNavigationMove.Tab -> boardEmph.transform(phase(clock.value * 530, 440f, 90f))
                    BoardNavigationMove.Back -> .7f + .3f * boardEmph.transform(clock.value)
                    else -> 1f
                }
                incomingPaint.alpha = opacity
                drawContext.canvas.saveLayer(Rect(Offset.Zero, size), incomingPaint)
                drawContent()
                drawContext.canvas.restore()
            }.background(ground)) { content() }
            Canvas(Modifier.matchParentSize()) {
                val old = oldImage ?: return@Canvas
                if (move == BoardNavigationMove.Back) withTransform({ translate(size.width * boardExit.transform(phase(clock.value * 420, 320f)), 0f) }) { drawImage(old) }
            }
            Canvas(Modifier.matchParentSize()) {
                val old = oldImage ?: return@Canvas
                if (move != BoardNavigationMove.Carry || twins.isEmpty()) return@Canvas
                val p = boardInOut.transform(phase(clock.value * 900, 680f, 200f))
                newParts.forEach { (key, target) ->
                    val twin = twins.getValue(key)
                    val source = oldParts.getValue(key).bounds; val dest = target.bounds
                    val rect = Rect(source.left + (dest.left - source.left) * p, source.top + (dest.top - source.top) * p, source.right + (dest.right - source.right) * p, source.bottom + (dest.bottom - source.bottom) * p)
                    val blend = ((p - .35f) / .30f).coerceIn(0f, 1f)
                    movingBounds[key] = rect
                    fun crop(image: ImageBitmap, r: Rect, opacity: Float) {
                        val clipped = r.intersect(Rect(0f, 0f, image.width.toFloat(), image.height.toFloat()))
                        if (clipped.width <= 0 || clipped.height <= 0 || rect.width <= 0 || rect.height <= 0 || opacity <= 0) return
                        val x = rect.left + (clipped.left - r.left) / r.width * rect.width
                        val y = rect.top + (clipped.top - r.top) / r.height * rect.height
                        drawImage(image, srcOffset = IntOffset(clipped.left.roundToInt(), clipped.top.roundToInt()), srcSize = IntSize(clipped.width.roundToInt().coerceAtLeast(1), clipped.height.roundToInt().coerceAtLeast(1)),
                            dstOffset = IntOffset(x.roundToInt(), y.roundToInt()), dstSize = IntSize((clipped.width / r.width * rect.width).roundToInt().coerceAtLeast(1), (clipped.height / r.height * rect.height).roundToInt().coerceAtLeast(1)), alpha = opacity)
                    }
                    crop(old, source, 1 - blend); crop(twin, Rect(0f, 0f, twin.width.toFloat(), twin.height.toFloat()), blend)
                }
            }
        }
    }
}

/** Registers final native geometry without composing a second writer for the shared flight. */
@Composable
fun boardSharedElement(key: String, ground: Color): Modifier {
    val registry = LocalBoardParts.current ?: return Modifier
    val nativeSurface = key == "dog" && !LocalMascotSnapshot.current
    val generation = registry.generation
    val layer = rememberGraphicsLayer()
    val recorded = remember { MutableStateFlow(-1) }
    DisposableEffect(registry, key, generation) { onDispose { if (registry.parts[key]?.generation == generation) registry.parts.remove(key) } }
    return Modifier.onGloballyPositioned { if (generation == registry.generation) registry.parts[key] = SharedBoardPart(it.boundsInWindow().translate(-registry.origin), ground, generation, layer, recorded) }
        .drawWithContent {
            if (nativeSurface) drawContent()
            else {
                layer.record { this@drawWithContent.drawContent() }
                recorded.value = generation
                if (key !in registry.hidden) drawLayer(layer)
            }
        }
}
