package com.dracoarts.shared

import androidx.compose.ui.window.ComposeUIViewController

@OptIn(kotlin.experimental.ExperimentalNativeApi::class)
fun MainViewController(reviewEnabled: Boolean = false, reviewStart: String? = null, reviewFixture: String? = null): platform.UIKit.UIViewController {
    val review = reviewEnabled && kotlin.native.Platform.isDebugBinary
    val fixture = if (review) com.dracoarts.shared.presentation.review.BoardReviewDataSet.entries.firstOrNull { it.key == reviewFixture } else null
    val platform = IosPlatform(fixture)
    val state = AppState()
    return ComposeUIViewController { App(platform, state, reviewEnabled = review, reviewStart = if (review) reviewStart else null, boardFixture = fixture) }
}
