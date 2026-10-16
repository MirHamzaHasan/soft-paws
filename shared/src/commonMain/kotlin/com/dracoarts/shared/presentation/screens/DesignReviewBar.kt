package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.CareEventRules
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.AppState
import com.dracoarts.shared.presentation.navigation.Route
import com.dracoarts.shared.presentation.navigation.designReviewSections

/** Explicit Debug launch only. Uses the real journal: replay never resets drafts or records. */
@Composable
@OptIn(ExperimentalLayoutApi::class)
internal fun DesignReviewBar(state: AppState, dogId: String?, newId: () -> String, speed: Float,
    onSpeed: (Float) -> Unit, onReplay: () -> Unit) {
    var hidden by remember { mutableStateOf(false) }
    var choosing by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        if (hidden) BarkTextAction("Show design review", { hidden = false })
        else {
            CaptionText("Design review · real journal")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                BarkTextAction("Replay", onReplay)
                Box {
                    BarkTextAction("Screen", { choosing = true }, enabled = dogId != null)
                    DropdownMenu(choosing, { choosing = false }) {
                        Route.entries.forEach { route -> DropdownMenuItem(text = { Text(route.label) }, onClick = { choosing = false; state.show(route) }) }
                        CareEventRules.detailedTypes.forEach { type -> DropdownMenuItem(text = { Text("Log ${type.label.lowercase()}") }, onClick = { choosing = false; dogId?.let { state.newLog(it, type, newId()) } }) }
                        HorizontalDivider()
                        designReviewSections.forEach { section ->
                            DropdownMenuItem(text = { Text(section.label) }, onClick = {
                                choosing = false
                                state.open(section.feature)
                            })
                        }
                    }
                }
                BarkTextAction("${speed}×", { onSpeed(when (speed) { 1f -> .5f; .5f -> .25f; else -> 1f }) })
                BarkTextAction("Hide", { hidden = true })
            }
        }
    }
}
