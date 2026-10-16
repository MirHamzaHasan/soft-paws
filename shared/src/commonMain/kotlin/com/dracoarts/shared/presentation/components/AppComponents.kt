package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.TextButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.theme.AppSpacing
import com.dracoarts.shared.presentation.theme.pressMotion
import com.dracoarts.shared.presentation.theme.softBubble
import com.dracoarts.shared.presentation.theme.textEntrance
import com.dracoarts.shared.presentation.theme.glyphPressMotion
import com.dracoarts.shared.presentation.theme.glyphDirection
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.theme.boardColor

@Composable
fun PawMark(modifier: Modifier = Modifier.size(32.dp)) {
    val ink = MaterialTheme.colorScheme.onSurface
    Canvas(modifier.clearAndSetSemantics {}) {
        drawOval(ink, Offset(size.width * .24f, size.height * .48f), Size(size.width * .52f, size.height * .42f))
        listOf(.04f to .30f, .23f to .06f, .54f to .06f, .76f to .30f).forEach { (x, y) ->
            drawOval(ink, Offset(size.width * x, size.height * y), Size(size.width * .20f, size.height * .27f))
        }
    }
}

@Composable
@OptIn(ExperimentalLayoutApi::class)
fun BrandHeader() {
    FlowRow(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            PawMark(Modifier.size(20.dp))
            Text("BarkLog", style = MaterialTheme.typography.labelMedium)
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            BarkIcon("shield-check", Modifier.size(14.dp), MaterialTheme.colorScheme.onSurfaceVariant)
            Text("On this device", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun SectionTitle(text: String) {
    Text(text, style = MaterialTheme.typography.titleLarge, modifier = Modifier.semantics { heading() })
}

@Composable
fun JournalCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(26.dp),
        color = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        tonalElevation = 0.dp, shadowElevation = 0.dp,
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp), content = content)
    }
}

@Composable
fun SupportingText(text: String) {
    Text(text, modifier = textEntrance(), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

@Composable
fun StartupMessage(message: String, onRetry: (() -> Unit)? = null) {
    Box(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing), contentAlignment = Alignment.TopCenter) {
        Column(Modifier.widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth().verticalScroll(rememberScrollState()).padding(AppSpacing.page), verticalArrangement = Arrangement.spacedBy(24.dp)) {
            BrandHeader()
            ScreenHeading(if (onRetry == null) "Opening your journal" else "Couldn't read your journal", if (onRetry == null) "Reading local records…" else "Your stored records have not been cleared.")
            if (onRetry == null) {
                JournalCard { SkeletonLine(180.dp, 88.dp); SkeletonLine(240.dp) }
                repeat(2) { Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { repeat(2) { JournalCard(Modifier.weight(1f)) { SkeletonLine(52.dp, 52.dp); SkeletonLine(80.dp) } } } }
                JournalCard { repeat(3) { Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) { Surface(Modifier.size(38.dp), shape = CircleShape, color = MaterialTheme.colorScheme.surfaceVariant) {}; Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { SkeletonLine(180.dp); SkeletonLine(90.dp) } } } }
            } else {
                JournalCard {
                    BarkIcon("file-text", Modifier.size(28.dp))
                    SupportingText(message)
                    BarkButton("Try again", onRetry, icon = "refresh-cw")
                }
                CaptionText("No account or internet connection is required.")
            }
        }
    }
}

@Composable
fun ScreenHeading(title: String, subtitle: String? = null) {
    LocalBoardFolio.current?.let { BoardHeading(title, subtitle, it); return }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, style = MaterialTheme.typography.displaySmall, modifier = Modifier.semantics { heading() })
        subtitle?.let { SupportingText(it) }
    }
}

@Composable
fun CaptionText(text: String, modifier: Modifier = Modifier) {
    Text(text, modifier.then(textEntrance()), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

@Composable
fun BarkButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, secondary: Boolean = false, icon: String? = null, danger: Boolean = false) {
    val source = remember { MutableInteractionSource() }
    val shape = RoundedCornerShape(50)
    val position = modifier.fillMaxWidth().heightIn(min = AppSpacing.controlHeight).then(pressMotion(source, enabled)).clip(shape)
        .then(softBubble(source, if (secondary) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onPrimary, enabled))
    val content: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit = {
        icon?.let { BarkIcon(it, Modifier.size(18.dp).then(glyphPressMotion(source, glyphDirection(it), enabled))); Spacer(Modifier.width(8.dp)) }
        Text(label, style = MaterialTheme.typography.labelLarge)
    }
    if (secondary) OutlinedButton(onClick, position, enabled, shape = shape,
        colors = ButtonDefaults.outlinedButtonColors(containerColor = MaterialTheme.colorScheme.surface, contentColor = if (danger) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface, disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant),
        border = BorderStroke(1.5.dp, if (danger) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp), interactionSource = source, content = content)
    else Button(onClick, position, enabled, shape = shape, elevation = null,
        colors = ButtonDefaults.buttonColors(containerColor = if (danger) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary, disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant, disabledContentColor = MaterialTheme.colorScheme.onSurface),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp), interactionSource = source, content = content)
}

@Composable
fun BarkTextAction(label: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, icon: String? = null, leading: Boolean = false, danger: Boolean = false) {
    val source = remember { MutableInteractionSource() }
    val underline = boardColor("accent-line")
    TextButton(onClick, modifier.heightIn(min = 48.dp).then(pressMotion(source, enabled)), enabled,
        colors = ButtonDefaults.textButtonColors(contentColor = if (danger) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface),
        interactionSource = source, contentPadding = PaddingValues(horizontal = 0.dp, vertical = 8.dp)) {
        if (leading && icon != null) { BarkIcon(icon, Modifier.size(16.dp).then(glyphPressMotion(source, glyphDirection(icon), enabled))); Spacer(Modifier.width(6.dp)) }
        Text(label, Modifier.drawBehind { drawLine(underline, Offset(0f, size.height - 1.dp.toPx()), Offset(size.width, size.height - 1.dp.toPx()), strokeWidth = 2.dp.toPx()) }, style = MaterialTheme.typography.labelMedium.copy(fontSize = 13.sp, lineHeight = 18.85.sp))
        if (!leading && icon != null) { Spacer(Modifier.width(6.dp)); BarkIcon(icon, Modifier.size(16.dp).then(glyphPressMotion(source, glyphDirection(icon), enabled))) }
    }
}

@Composable
fun PawAvatar(modifier: Modifier = Modifier) {
    Surface(modifier.size(80.dp), shape = CircleShape, color = MaterialTheme.colorScheme.surfaceVariant,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
        Box(contentAlignment = Alignment.Center) { PawMark(Modifier.size(34.dp)) }
    }
}

@Composable
fun SkeletonLine(width: androidx.compose.ui.unit.Dp, height: androidx.compose.ui.unit.Dp = 14.dp) {
    Surface(Modifier.width(width).heightIn(min = height), shape = RoundedCornerShape(4.dp), color = MaterialTheme.colorScheme.surfaceVariant) {}
}

@Composable
fun ErrorCard(message: String) {
    Surface(Modifier.fillMaxWidth().semantics { liveRegion = LiveRegionMode.Polite }, shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error), color = MaterialTheme.colorScheme.surface) {
        Text(message, Modifier.padding(16.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
    }
}
