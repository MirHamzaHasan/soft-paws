package com.dracoarts.shared.presentation.components

import androidx.compose.runtime.*
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitInteropProperties
import androidx.compose.ui.viewinterop.UIKitView
import com.dracoarts.shared.presentation.companion.CatCue
import platform.UIKit.UIView

/** Swift owns the official Rive runtime; shared Compose owns layout and motion policy. */
interface IosMascotRenderer {
    val view: UIView
    fun update(trigger: String?, serial: Int, playing: Boolean)
    fun close()
}

fun interface IosMascotFactory {
    fun create(onReady: (Boolean) -> Unit): IosMascotRenderer
}

val LocalIosMascotFactory = staticCompositionLocalOf<IosMascotFactory?> { null }

@OptIn(kotlinx.cinterop.ExperimentalForeignApi::class, ExperimentalComposeUiApi::class)
@Composable
internal actual fun RiveCatSurface(modifier: Modifier, cue: CatCue?, playing: Boolean, onReady: (Boolean) -> Unit) {
    val factory = LocalIosMascotFactory.current ?: return
    val callback by rememberUpdatedState(onReady)
    var loaded by remember { mutableStateOf(false) }
    val renderer = remember(factory) { factory.create { loaded = it; callback(it) } }
    DisposableEffect(renderer) { onDispose { renderer.close(); callback(false) } }
    // Drive commands even before attachment; UIKit's deferred update is for view
    // mutations and must not swallow repeated cues on an unchanged native view.
    SideEffect { renderer.update(cue?.action?.trigger, cue?.serial ?: 0, playing) }
    if (loaded) UIKitView(
        factory = { renderer.view }, modifier = modifier,
        properties = UIKitInteropProperties(interactionMode = null, isNativeAccessibilityEnabled = false, placedAsOverlay = true),
    )
}
