package com.dracoarts.shared

import androidx.compose.ui.window.ComposeUIViewController
import androidx.compose.runtime.CompositionLocalProvider
import com.dracoarts.shared.presentation.components.IosMascotFactory
import com.dracoarts.shared.presentation.components.LocalIosMascotFactory

@OptIn(kotlin.experimental.ExperimentalNativeApi::class)
fun MainViewController(reviewEnabled: Boolean = false, reviewStart: String? = null, reviewFixture: String? = null, mascotFactory: IosMascotFactory? = null, videoEngine: com.dracoarts.shared.highlights.IosVideoEngine? = null, authEngine: com.dracoarts.shared.services.NativeAuthEngine = com.dracoarts.shared.services.UnavailableAuthEngine, purchasesEngine: com.dracoarts.shared.services.NativePurchasesEngine = com.dracoarts.shared.services.UnavailablePurchasesEngine, liveAiReview: Boolean = false): platform.UIKit.UIViewController {
    val review = reviewEnabled && kotlin.native.Platform.isDebugBinary
    val fixture = if (review) com.dracoarts.shared.presentation.review.BoardReviewDataSet.entries.firstOrNull { it.key == reviewFixture } else null
    val platform = IosPlatform(fixture, videoEngine, if (fixture != null) com.dracoarts.shared.services.UnavailableAuthEngine else authEngine, if (fixture != null) com.dracoarts.shared.services.UnavailablePurchasesEngine else purchasesEngine)
    val state = AppState()
    return ComposeUIViewController {
        CompositionLocalProvider(LocalIosMascotFactory provides mascotFactory) {
            App(platform, state, reviewEnabled = review, reviewStart = if (review) reviewStart else null, boardFixture = fixture, liveAiReview = review && liveAiReview)
        }
    }
}
