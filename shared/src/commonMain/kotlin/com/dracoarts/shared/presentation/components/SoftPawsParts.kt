package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.theme.*

/** Shared parts from the approved .sp-* board styles. No bitmap screen replicas. */
@Composable
fun SoftPawsTop(kicker: String = "CAT CARE", onSettings: () -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 52.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Soft Paws", Modifier.weight(1f), style = MaterialTheme.typography.titleLarge.copy(fontFamily = LocalDisplayFont.current, fontSize = 23.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = (-1).sp))
        SoftPawsKicker(kicker)
        Surface(onClick = soundAction(onSettings), modifier = Modifier.semantics { contentDescription = "Settings" }, shape = RoundedCornerShape(50), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
            Box(Modifier.size(48.dp), contentAlignment = Alignment.Center) { BarkIcon("sliders-horizontal", Modifier.size(20.dp)) }
        }
    }
}

@Composable
fun SoftPawsKicker(text: String) {
    Text(text, style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, letterSpacing = 1.7.sp, lineHeight = 15.5.sp), color = boardColor("ink-muted"))
}

@Composable
fun SoftPawsHeading(title: String, subtitle: String = "", accent: String? = null) {
    val accentColor = boardColor("accent")
    val emphasis = accent?.let(title::indexOf) ?: -1
    val heading = buildAnnotatedString {
        if (emphasis < 0) append(title) else {
            append(title.substring(0, emphasis))
            withStyle(SpanStyle(color = accentColor)) { append(accent!!) }
            append(title.substring(emphasis + accent!!.length))
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(heading, style = MaterialTheme.typography.displaySmall.copy(lineHeight = 35.7.sp, letterSpacing = (-1.3).sp), color = boardColor("ink-strong"), modifier = Modifier.semantics { heading() })
        if (subtitle.isNotBlank()) Text(subtitle, style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.7.sp), color = boardColor("ink-muted"))
    }
}

@Composable
fun SoftPawsSection(title: String, action: String? = null, onAction: () -> Unit = {}) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, Modifier.weight(1f).semantics { heading() }, style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp, letterSpacing = (-.5).sp))
        if (action != null) BarkTextAction(action, onAction)
    }
}

@Composable
fun SoftPawsRow(title: String, subtitle: String = "", icon: String, onClick: () -> Unit) {
    val tone = SoftPawsDesignTokens.iconTones[icon] ?: "mint"
    Surface(onClick = soundAction(onClick), modifier = Modifier.fillMaxWidth().heightIn(min = 62.dp), color = Color.Transparent) {
        Row(Modifier.padding(vertical = 13.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Surface(shape = RoundedCornerShape(14.dp), color = boardColor(tone), border = BorderStroke(1.dp, boardColor("$tone-line"))) {
                Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(20.dp), boardColor("$tone-ink")) }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                if (subtitle.isNotBlank()) Text(subtitle, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, lineHeight = 16.5.sp), color = boardColor("ink-muted"))
            }
            BarkIcon("chevron-right", Modifier.size(18.dp), boardColor("ink-muted"))
        }
    }
}

@Composable
fun SoftPawsCard(title: String, tone: String? = null, content: @Composable ColumnScope.() -> Unit) {
    Surface(shape = RoundedCornerShape(24.dp), color = boardColor(tone ?: "panel"), border = BorderStroke(1.dp, boardColor(tone?.let { "$it-line" } ?: "hair"))) {
        Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge.copy(fontSize = 22.sp, lineHeight = 25.3.sp, letterSpacing = (-.5).sp))
            content()
        }
    }
}
