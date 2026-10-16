package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.theme.boardColor

/** The board's compact select control, with a bounded, scrollable native Compose menu. */
@Composable
fun BoardSelect(label: String, value: String, choices: List<Pair<String, String>>, enabled: Boolean = true, onChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = choices.firstOrNull { it.first == value }?.second ?: value
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium)
        Box {
            Surface(onClick = { expanded = true }, enabled = enabled, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).semantics {
                contentDescription = "$label, $selectedLabel"
                stateDescription = if (expanded) "Expanded" else "Collapsed"
            }, shape = RoundedCornerShape(16.dp), color = boardColor("panel"), border = BorderStroke(1.5.dp, boardColor("hair"))) {
                Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(selectedLabel, Modifier.weight(1f).clearAndSetSemantics {}, style = MaterialTheme.typography.bodyLarge)
                    BarkIcon("chevron-down", Modifier.size(16.dp).clearAndSetSemantics {})
                }
            }
            DropdownMenu(expanded && enabled, { expanded = false }, modifier = Modifier.heightIn(max = 360.dp), shape = RoundedCornerShape(20.dp), containerColor = boardColor("panel"), tonalElevation = 0.dp, shadowElevation = 0.dp, border = BorderStroke(1.dp, boardColor("hair"))) {
                choices.forEach { (key, text) -> DropdownMenuItem(text = { Text(text, style = MaterialTheme.typography.bodyMedium) }, onClick = { expanded = false; onChange(key) }, modifier = Modifier.heightIn(min = 48.dp).semantics { selected = key == value }, trailingIcon = if (key == value) ({ BarkIcon("check", Modifier.size(18.dp)) }) else null) }
            }
        }
    }
}
