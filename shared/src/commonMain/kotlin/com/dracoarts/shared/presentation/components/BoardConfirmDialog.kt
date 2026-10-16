package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.dracoarts.shared.presentation.theme.boardColor

/** Board-sized modal with a full-width safe action first and native modal focus. */
@Composable
fun BoardConfirmDialog(title: String, description: String, action: String, busy: Boolean, onDismiss: () -> Unit,
    keepLabel: String = "Keep it", danger: Boolean = true, onKeep: () -> Unit = onDismiss, onConfirm: () -> Unit) {
    val keepFocus = remember { FocusRequester() }
    Dialog(onDismissRequest = { if (!busy) onDismiss() }, properties = DialogProperties(dismissOnBackPress = !busy, dismissOnClickOutside = !busy, usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(20.dp), contentAlignment = Alignment.Center) {
            Surface(Modifier.widthIn(max = 420.dp).fillMaxWidth().semantics { paneTitle = title }, shape = RoundedCornerShape(30.dp), color = boardColor("panel"), tonalElevation = 0.dp, shadowElevation = 0.dp) {
                Column(Modifier.verticalScroll(rememberScrollState()).padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    SectionTitle(title)
                    SupportingText(description)
                    BarkButton(keepLabel, onKeep, Modifier.focusRequester(keepFocus), enabled = !busy)
                    BarkButton(if (busy) "Working…" else action, onConfirm, enabled = !busy, secondary = true, danger = danger)
                }
            }
        }
        LaunchedEffect(Unit) { keepFocus.requestFocus() }
    }
}
