package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import com.dracoarts.shared.generated.resources.Res
import com.dracoarts.shared.generated.resources.care_notebook_rest
import com.dracoarts.shared.presentation.companion.RiveDogAction
import com.dracoarts.shared.presentation.companion.RiveDogCue
import com.dracoarts.shared.presentation.theme.LocalBarkMotion
import kotlinx.coroutines.delay
import org.jetbrains.compose.resources.painterResource

/** The plan companion has bounded reactions, never Home's shuffled idle policy. */
@Composable
internal fun AnimatedCareNotebook(modifier: Modifier = Modifier, reaction: Int = 0) {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val foreground = LocalMascotForeground.current
    val snapshot = LocalMascotSnapshot.current
    val window = LocalWindowInfo.current.containerSize
    var visible by remember { mutableStateOf(true) }
    val eligible = foreground && visible && !snapshot && !motion.reduced
    var ready by remember { mutableStateOf(false) }
    var cue by remember { mutableStateOf<RiveDogCue?>(null) }
    var serial by remember { mutableIntStateOf(0) }
    var playing by remember { mutableStateOf(true) }
    fun act(action: RiveDogAction) { playing = true; cue = RiveDogCue(action, ++serial) }
    LaunchedEffect(eligible) { if (!eligible) { ready = false; cue = null; playing = true } }
    LaunchedEffect(eligible, ready, motion.replay) {
        if (eligible && ready && !restoring) { delay(80); act(RiveDogAction.Hello) }
    }
    LaunchedEffect(reaction) { if (reaction > 0 && eligible && ready) act(RiveDogAction.Curious) }
    LaunchedEffect(cue?.serial, eligible) {
        val action = cue?.action ?: return@LaunchedEffect
        if (!eligible) return@LaunchedEffect
        delay(action.durationMs.toLong())
        if (action == RiveDogAction.Rest) playing = false else act(RiveDogAction.Rest)
    }
    val source = remember { MutableInteractionSource() }
    val hello = soundAction({ act(RiveDogAction.Hello) })
    Box(modifier.clipToBounds().onGloballyPositioned { coordinates ->
        val rect = coordinates.boundsInWindow()
        val width = (minOf(rect.right, window.width.toFloat()) - maxOf(rect.left, 0f)).coerceAtLeast(0f)
        val height = (minOf(rect.bottom, window.height.toFloat()) - maxOf(rect.top, 0f)).coerceAtLeast(0f)
        visible = rect.width > 0 && rect.height > 0 && width * height >= rect.width * rect.height * .15f
    }) {
        val art = Modifier.matchParentSize().clearAndSetSemantics {}
        if (!ready || !eligible) Image(painterResource(Res.drawable.care_notebook_rest), null, art)
        if (eligible) RiveDogSurface(art, cue, playing, { ready = it }, notebook = true)
        if (eligible && ready) Box(Modifier.matchParentSize().semantics { contentDescription = "Say hello to the notebook puppy"; role = Role.Button }
            .clickable(source, indication = null, onClickLabel = "Say hello", onClick = hello))
    }
}
