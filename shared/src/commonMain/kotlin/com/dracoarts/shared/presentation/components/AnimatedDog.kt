package com.dracoarts.shared.presentation.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Compatibility entry for inherited source references. New Soft Paws screens use AnimatedCat. */
@Deprecated("Soft Paws uses AnimatedCat")
@Composable
fun AnimatedDog(modifier: Modifier = Modifier, reactionId: String? = null, onReacted: (String) -> Unit = {},
                idle: Boolean = true, afterLanding: Boolean = false, cropped: Boolean = false, greetingLabel: String? = null) {
    AnimatedCat(modifier, reactionId, onReacted, idle, afterLanding, cropped, greetingLabel)
}
