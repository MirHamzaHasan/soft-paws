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
import com.dracoarts.shared.generated.resources.spaniel_rest
import com.dracoarts.shared.presentation.companion.RiveDogAction
import com.dracoarts.shared.presentation.companion.RiveDogCue
import com.dracoarts.shared.presentation.companion.RiveDogShuffle
import com.dracoarts.shared.presentation.theme.LocalBarkMotion
import kotlinx.coroutines.delay
import org.jetbrains.compose.resources.painterResource
import kotlin.random.Random

val LocalMascotForeground = staticCompositionLocalOf { true }
// Native Metal/Texture views cannot be recorded into a Compose GraphicsLayer.
val LocalMascotSnapshot = staticCompositionLocalOf { false }

/** Shared policy; the platform boundary only renders the bundled Rive character. */
@Composable
fun AnimatedDog(
    modifier: Modifier = Modifier,
    reactionId: String? = null,
    onReacted: (String) -> Unit = {},
    idle: Boolean = true,
    afterLanding: Boolean = false,
    cropped: Boolean = false,
    greetingLabel: String? = null,
) {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val foreground = LocalMascotForeground.current
    val snapshot = LocalMascotSnapshot.current
    val window = LocalWindowInfo.current.containerSize
    var visible by remember { mutableStateOf(true) }
    var ready by remember { mutableStateOf(false) }
    var cue by remember { mutableStateOf<RiveDogCue?>(null) }
    var serial by remember { mutableIntStateOf(0) }
    val consumed by rememberUpdatedState(onReacted)
    val pendingReaction by rememberUpdatedState(reactionId)
    val bag = remember { RiveDogShuffle() }
    val running = foreground && visible && !motion.reduced && !snapshot
    fun play(action: RiveDogAction) { cue = RiveDogCue(action, ++serial) }

    LaunchedEffect(running, motion.replay) {
        if (!running) { cue = null; ready = false }
    }
    LaunchedEffect(reactionId, running, ready, motion.reduced) {
        val id = reactionId
        if (id == null) {
            if (running && ready && cue?.action == RiveDogAction.Saved) play(RiveDogAction.Rest)
            return@LaunchedEffect
        }
        if (motion.reduced) { consumed(id); return@LaunchedEffect }
        if (!running) return@LaunchedEffect
        if (!ready) {
            // A renderer failure cannot hold feedback or replay an old save later.
            delay(3_000)
            consumed(id)
            return@LaunchedEffect
        }
        if (!afterLanding) delay(640)
        play(RiveDogAction.Saved)
        delay(RiveDogAction.Saved.durationMs + 220L)
        consumed(id)
    }
    LaunchedEffect(idle, running, ready, motion.replay, cue?.serial) {
        if (!idle || !running || !ready) return@LaunchedEffect
        if (cue == null && pendingReaction == null && !restoring) {
            delay(760)
            if (pendingReaction == null) play(RiveDogAction.Hello)
            return@LaunchedEffect
        }
        delay((cue?.action?.durationMs ?: 0) + 220L + Random.nextLong(4_800, 8_201))
        if (pendingReaction == null) play(bag.next())
    }
    val source = remember { MutableInteractionSource() }
    val greetingSound = soundAction({})
    val interaction = if (greetingLabel == null || !running || !ready) Modifier.clearAndSetSemantics {} else
        Modifier.semantics { contentDescription = greetingLabel; role = Role.Button }
            .clickable(source, indication = null, onClickLabel = greetingLabel) {
                if (running && ready && pendingReaction == null) { greetingSound(); play(RiveDogAction.Hello) }
            }

    BoxWithConstraints(modifier.clipToBounds().onGloballyPositioned { coordinates ->
        val rect = coordinates.boundsInWindow()
        val shownWidth = (minOf(rect.right, window.width.toFloat()) - maxOf(rect.left, 0f)).coerceAtLeast(0f)
        val shownHeight = (minOf(rect.bottom, window.height.toFloat()) - maxOf(rect.top, 0f)).coerceAtLeast(0f)
        visible = rect.width > 0 && rect.height > 0 && shownWidth * shownHeight >= rect.width * rect.height * .15f
    }, contentAlignment = Alignment.Center) {
        // The authored square includes transparent motion clearance. Fit the dog, not that margin.
        val size = minOf(maxWidth / if (cropped) .72f else .76f, maxHeight / .86f)
        val art = Modifier.requiredSize(size).clearAndSetSemantics {}
        if (!ready || !running) Image(painterResource(Res.drawable.spaniel_rest), null, art)
        if (running) RiveDogSurface(art, cue, playing = true, onReady = { ready = it })
        Box(Modifier.matchParentSize().then(interaction))
    }
}

@Composable
internal expect fun RiveDogSurface(modifier: Modifier, cue: RiveDogCue?, playing: Boolean, onReady: (Boolean) -> Unit, notebook: Boolean = false)
