package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import com.dracoarts.shared.generated.resources.Res
import com.dracoarts.shared.generated.resources.soft_paws_cat_rest
import com.dracoarts.shared.presentation.companion.CatAction
import com.dracoarts.shared.presentation.companion.CatCue
import com.dracoarts.shared.presentation.theme.LocalBarkMotion
import kotlinx.coroutines.delay
import org.jetbrains.compose.resources.painterResource

val LocalMascotForeground = staticCompositionLocalOf { true }
// Native Metal/Texture views cannot be recorded into a Compose GraphicsLayer.
val LocalMascotSnapshot = staticCompositionLocalOf { false }

/** Shared policy; the platform boundary only renders the bundled Rive character. */
@Composable
fun AnimatedCat(
    modifier: Modifier = Modifier,
    reactionId: String? = null,
    onReacted: (String) -> Unit = {},
    idle: Boolean = true,
    afterLanding: Boolean = false,
    cropped: Boolean = false,
    greetingLabel: String? = null,
    curiousReaction: Int = 0,
) {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val foreground = LocalMascotForeground.current
    val snapshot = LocalMascotSnapshot.current
    val window = LocalWindowInfo.current.containerSize
    var visible by remember { mutableStateOf(true) }
    var ready by remember { mutableStateOf(false) }
    var cue by remember { mutableStateOf<CatCue?>(null) }
    var serial by remember { mutableIntStateOf(0) }
    var playing by remember { mutableStateOf(true) }
    val consumed by rememberUpdatedState(onReacted)
    val pendingReaction by rememberUpdatedState(reactionId)
    val running = foreground && visible && !motion.reduced && !snapshot
    fun play(action: CatAction) { playing = true; cue = CatCue(action, ++serial) }

    LaunchedEffect(running, motion.replay) {
        if (!running) { cue = null; ready = false; playing = true }
    }
    LaunchedEffect(reactionId, running, ready, motion.reduced) {
        val id = reactionId
        if (id == null) {
            if (running && ready && cue?.action == CatAction.Saved) play(CatAction.Rest)
            return@LaunchedEffect
        }
        if (motion.reduced) { consumed(id); return@LaunchedEffect }
        if (!running) { consumed(id); return@LaunchedEffect }
        if (!ready) {
            // A renderer failure cannot hold feedback or replay an old save later.
            delay(3_000)
            consumed(id)
            return@LaunchedEffect
        }
        if (!afterLanding) delay(640)
        play(CatAction.Saved)
        delay(CatAction.Saved.durationMs + 220L)
        consumed(id)
    }
    DisposableEffect(reactionId) { onDispose { reactionId?.let { consumed(it) } } }
    // A bounded greeting returns to the authored gentle idle, never a reward cue.
    LaunchedEffect(idle, running, ready, motion.replay) {
        if (idle && running && ready && pendingReaction == null && !restoring) {
            delay(80)
            play(CatAction.Hello)
        }
    }
    LaunchedEffect(cue?.serial, running, idle) {
        val action = cue?.action ?: return@LaunchedEffect
        if (!running) return@LaunchedEffect
        if (action == CatAction.Rest) {
            delay(action.durationMs.toLong())
            // Rest transitions back to the seven-second breathing/blink/tail loop.
            // Pausing here froze that loop in the application after every greeting.
            playing = idle
        } else {
            delay(action.durationMs.toLong() + 100)
            play(CatAction.Rest)
        }
    }
    LaunchedEffect(curiousReaction) { if (curiousReaction > 0 && running && ready && pendingReaction == null) play(CatAction.Curious) }
    val source = remember { MutableInteractionSource() }
    val greetingSound = soundAction({})
    val interaction = if (greetingLabel == null || !running || !ready) Modifier.clearAndSetSemantics {} else
        Modifier.semantics { contentDescription = greetingLabel; role = Role.Button }
            .clickable(source, indication = null, onClickLabel = greetingLabel) {
                if (running && ready && pendingReaction == null) { greetingSound(); play(CatAction.Hello) }
            }

    BoxWithConstraints(modifier.clipToBounds().onGloballyPositioned { coordinates ->
        val rect = coordinates.boundsInWindow()
        val shownWidth = (minOf(rect.right, window.width.toFloat()) - maxOf(rect.left, 0f)).coerceAtLeast(0f)
        val shownHeight = (minOf(rect.bottom, window.height.toFloat()) - maxOf(rect.top, 0f)).coerceAtLeast(0f)
        visible = rect.width > 0 && rect.height > 0 && shownWidth * shownHeight >= rect.width * rect.height * .15f
    }, contentAlignment = Alignment.Center) {
        // The 480 × 520 cat includes its own transparent motion clearance.
        val art = Modifier.fillMaxSize().clearAndSetSemantics {}
        if (!ready || !running) Image(painterResource(Res.drawable.soft_paws_cat_rest), null, art)
        if (running) RiveCatSurface(art, cue, playing, onReady = { ready = it })
        Box(Modifier.matchParentSize().then(interaction))
    }
}

@Composable
internal expect fun RiveCatSurface(modifier: Modifier, cue: CatCue?, playing: Boolean, onReady: (Boolean) -> Unit)
