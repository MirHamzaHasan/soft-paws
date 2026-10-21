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
    if (state?.premiumAccess == true) return true
    com.dracoarts.shared.presentation.components.SoftPawsHeading(feature.title, feature.description)
    com.dracoarts.shared.presentation.components.SoftPawsCard("Your preview stays free") { CaptionText("Read your report or memories on this phone. Your saved records stay here.") }
    BarkButton("See Premium", { controller?.requestPremium(feature) }, enabled = controller != null, icon = "lock-keyhole")
    BarkButton("Back to preview", onBack, secondary = true)
    CaptionText("Soft Paws purchases are not configured. No purchase or charge starts here.")
    return false
}
