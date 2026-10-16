package com.dracoarts.shared.presentation.theme

import androidx.compose.ui.text.PlatformTextStyle

/** CSS line boxes exclude Android's legacy font padding. iOS already uses native line metrics. */
expect fun boardPlatformTextStyle(): PlatformTextStyle?
