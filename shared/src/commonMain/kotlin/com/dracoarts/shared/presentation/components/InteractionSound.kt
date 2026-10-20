package com.dracoarts.shared.presentation.components

import androidx.compose.runtime.*
import com.dracoarts.shared.services.InteractionSounds
import com.dracoarts.shared.services.SoundCue

val LocalInteractionSounds = staticCompositionLocalOf<InteractionSounds?> { null }

@Composable
fun soundAction(action: () -> Unit, cue: SoundCue = SoundCue.Tap): () -> Unit {
    val sounds = LocalInteractionSounds.current
    return { sounds?.play(cue); action() }
}
