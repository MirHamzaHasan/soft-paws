package com.dracoarts.shared.presentation.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** The approved cat accompanies the plan too; bounded greetings and page reactions. */
@Composable
internal fun AnimatedCareNotebook(modifier: Modifier = Modifier, reaction: Int = 0) {
    AnimatedCat(modifier, greetingLabel = "Say hello to the Soft Paws cat", curiousReaction = reaction)
}
