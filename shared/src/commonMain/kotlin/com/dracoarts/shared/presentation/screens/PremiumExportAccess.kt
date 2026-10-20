package com.dracoarts.shared.presentation.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import com.dracoarts.shared.presentation.companion.PremiumFeature
import com.dracoarts.shared.presentation.components.BarkButton
import com.dracoarts.shared.presentation.components.CaptionText
import com.dracoarts.shared.presentation.components.ScreenHeading

/** Check at the export destination too, including direct Debug/deep navigation. */
@Composable
internal fun PremiumExportAccess(context: FeatureContext, feature: PremiumFeature, onBack: () -> Unit): Boolean {
    val controller = context.companion
    val state = controller?.state?.collectAsState()?.value
    if (state?.session?.premium == true) return true
    ScreenHeading(feature.title, feature.description)
    FeatureNotice("Your preview stays free", "Read your report or memories on this phone. Your saved records stay here.", "file-text")
    BarkButton("See Premium", { controller?.requestPremium(feature) }, enabled = controller != null, icon = "lock-keyhole")
    BarkButton("Back to preview", onBack, secondary = true)
    CaptionText("Demo build · prices undecided. No purchase or charge starts here.")
    return false
}
