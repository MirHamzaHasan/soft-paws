package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.semantics.password
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

@Composable
fun BarkField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier,
    enabled: Boolean = true, placeholder: String? = null, multiline: Boolean = false,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default, keyboardActions: KeyboardActions = KeyboardActions.Default, trailingText: String? = null, secure: Boolean = false) {
    val interaction = remember { MutableInteractionSource() }
    val focused by interaction.collectIsFocusedAsState()
    val focus = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    val options = if (!multiline && keyboardOptions.imeAction in listOf(ImeAction.Default, ImeAction.Unspecified)) keyboardOptions.copy(imeAction = ImeAction.Done) else keyboardOptions
    val actions = if (!multiline && keyboardActions === KeyboardActions.Default) KeyboardActions(onDone = {
        focus.clearFocus(); keyboard?.hide()
    }) else keyboardActions
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium)
        BasicTextField(value, onChange, enabled = enabled, singleLine = !multiline, minLines = if (multiline) 5 else 1,
            visualTransformation = if (secure) PasswordVisualTransformation() else VisualTransformation.None,
            textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
            keyboardOptions = options, keyboardActions = actions, interactionSource = interaction,
            cursorBrush = SolidColor(MaterialTheme.colorScheme.onSurface),
            modifier = Modifier.fillMaxWidth().heightIn(min = if (multiline) 152.dp else 52.dp).semantics {
                contentDescription = label
                if (secure) password()
                stateDescription = if (secure) { if (value.isEmpty()) "Empty" else "Entered" } else value.ifEmpty { "Empty" }
            },
            decorationBox = { input ->
                Surface(shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(if (focused) 2.dp else 1.5.dp, if (focused) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outlineVariant)) {
                    Row(Modifier.fillMaxWidth().heightIn(min = if (multiline) 152.dp else 52.dp).padding(horizontal = 14.dp, vertical = 13.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = if (multiline) androidx.compose.ui.Alignment.Top else androidx.compose.ui.Alignment.CenterVertically) {
                        Box(Modifier.weight(1f)) { if (value.isEmpty() && placeholder != null) Text(placeholder, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant); input() }
                        trailingText?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                    }
                }
            })
    }
}
