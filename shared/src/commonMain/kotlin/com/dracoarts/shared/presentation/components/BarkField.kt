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
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import com.dracoarts.shared.presentation.theme.boardColor

@Composable
fun BarkField(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier,
    enabled: Boolean = true, placeholder: String? = null, multiline: Boolean = false,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default, keyboardActions: KeyboardActions = KeyboardActions.Default, trailingText: String? = null, secure: Boolean = false,
    softPaws: Boolean = false) {
    val interaction = remember { MutableInteractionSource() }
    val focused by interaction.collectIsFocusedAsState()
    val focus = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    val options = if (!multiline && keyboardOptions.imeAction in listOf(ImeAction.Default, ImeAction.Unspecified)) keyboardOptions.copy(imeAction = ImeAction.Done) else keyboardOptions
    val actions = if (!multiline && keyboardActions === KeyboardActions.Default) KeyboardActions(onDone = {
        focus.clearFocus(); keyboard?.hide()
    }) else keyboardActions
    val minimum = if (softPaws) { if (multiline) 95.dp else 54.dp } else { if (multiline) 152.dp else 52.dp }
    val inputStyle = if (softPaws) MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp, lineHeight = 21.7.sp, color = boardColor("ink"))
        else MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface)
    Column(modifier, verticalArrangement = Arrangement.spacedBy(if (softPaws) 9.dp else 8.dp)) {
        Text(label, style = if (softPaws) MaterialTheme.typography.labelMedium.copy(fontSize = 12.sp, lineHeight = 18.6.sp, fontWeight = FontWeight.Medium) else MaterialTheme.typography.labelMedium)
        BasicTextField(value, onChange, enabled = enabled, singleLine = !multiline, minLines = if (multiline) { if (softPaws) 2 else 5 } else 1,
            visualTransformation = if (secure) PasswordVisualTransformation() else VisualTransformation.None,
            textStyle = inputStyle,
            keyboardOptions = options, keyboardActions = actions, interactionSource = interaction,
            cursorBrush = SolidColor(if (softPaws) boardColor("accent") else MaterialTheme.colorScheme.onSurface),
            modifier = Modifier.fillMaxWidth().heightIn(min = minimum).semantics {
                contentDescription = label
                if (secure) password()
                stateDescription = if (secure) { if (value.isEmpty()) "Empty" else "Entered" } else value.ifEmpty { "Empty" }
            },
            decorationBox = { input ->
                Surface(shape = RoundedCornerShape(16.dp), color = if (softPaws) boardColor("panel") else MaterialTheme.colorScheme.surface,
                    border = BorderStroke(if (focused) 2.dp else if (softPaws) 1.dp else 1.5.dp,
                        if (softPaws) boardColor(if (focused) "accent" else "hair-2") else if (focused) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outlineVariant)) {
                    Row(Modifier.fillMaxWidth().heightIn(min = minimum).padding(horizontal = if (softPaws) 16.dp else 14.dp, vertical = if (softPaws) 14.dp else 13.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = if (multiline) androidx.compose.ui.Alignment.Top else androidx.compose.ui.Alignment.CenterVertically) {
                        Box(Modifier.weight(1f)) { if (value.isEmpty() && placeholder != null) Text(placeholder, style = inputStyle, color = MaterialTheme.colorScheme.onSurfaceVariant); input() }
                        trailingText?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                    }
                }
            })
    }
}
