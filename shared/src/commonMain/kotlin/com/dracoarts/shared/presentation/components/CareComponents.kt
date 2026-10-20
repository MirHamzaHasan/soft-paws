package com.dracoarts.shared.presentation.components

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.snap

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import com.dracoarts.shared.presentation.theme.LocalBarkDarkTheme
import androidx.compose.foundation.clickable
import androidx.compose.ui.semantics.Role
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.style.TextOverflow
import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.EventPalette
import com.dracoarts.shared.presentation.theme.pressMotion
import com.dracoarts.shared.presentation.theme.stickerPressMotion
import com.dracoarts.shared.presentation.theme.LocalBarkMotion
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.presentation.theme.LocalDisplayFont
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.Color
import com.dracoarts.shared.presentation.state.observationSummary
import kotlinx.datetime.TimeZone

@Composable
fun EventButton(type: CareEventType, todayCount: Int?, enabled: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val palette = EventPalette.forType(type, LocalBarkDarkTheme.current)
    val interaction = remember { MutableInteractionSource() }
    val motion = LocalBarkMotion.current
    Surface(
        onClick = soundAction(onClick), enabled = enabled, interactionSource = interaction,
        modifier = modifier.heightIn(min = 132.dp).then(pressMotion(interaction, enabled)).semantics { contentDescription = if (todayCount == null) "${type.label}. Reading records." else "Log ${type.label}. $todayCount today." },
        shape = RoundedCornerShape(28.dp), color = palette.background, contentColor = palette.text,
        shadowElevation = 0.dp, tonalElevation = 0.dp,
    ) {
        Column(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Surface(Modifier.then(stickerPressMotion(interaction, enabled)), shape = RoundedCornerShape(50), color = boardColor("${type.key}-dot")) { Box(Modifier.size(48.dp), contentAlignment = Alignment.Center) { BarkIcon(type.iconName(), Modifier.size(22.dp), androidx.compose.ui.graphics.Color.White) } }
                Surface(Modifier.then(stickerPressMotion(interaction, enabled)), shape = RoundedCornerShape(50), color = boardColor("panel")) { Box(Modifier.size(36.dp), contentAlignment = Alignment.Center) { BarkIcon("plus", Modifier.size(18.dp), boardColor("ink-strong")) } }
            }
            Row(Modifier.fillMaxWidth().heightIn(min = 48.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                Text(type.label, style = MaterialTheme.typography.titleLarge.copy(fontSize = 22.sp, letterSpacing = (-.66).sp), modifier = Modifier.weight(1f))
                Column(horizontalAlignment = Alignment.End) {
                    AnimatedContent(todayCount, transitionSpec = {
                        (if (motion.reduced) fadeIn(tween(1)) togetherWith fadeOut(tween(1))
                        else (slideInVertically(tween(motion.milliseconds(320))) { it / 3 } + fadeIn(tween(motion.milliseconds(220)))) togetherWith
                            (slideOutVertically(tween(motion.milliseconds(180))) { -it / 3 } + fadeOut(tween(motion.milliseconds(140)))))
                            .using(SizeTransform(clip = false) { _, _ -> snap() })
                    }, label = "${type.key} count") { count ->
                        Box(Modifier.height(with(androidx.compose.ui.platform.LocalDensity.current) { 34.sp.toDp() })) { Text(count?.toString() ?: "–", modifier = Modifier.wrapContentHeight(Alignment.CenterVertically, unbounded = true), style = MaterialTheme.typography.displayLarge.copy(fontSize = 34.sp, lineHeight = 34.sp, letterSpacing = (-1.7).sp)) }
                    }
                    Text("today", style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp))
                }
            }
        }
    }
}

@Composable
fun TimelineRow(event: CareEvent, zone: TimeZone, includeDate: Boolean = false, onClick: (() -> Unit)? = null, bordered: Boolean = true) {
    val palette = EventPalette.forType(event.type, LocalBarkDarkTheme.current)
    Surface(
        Modifier.fillMaxWidth().heightIn(min = 76.dp).then(if (onClick != null) Modifier.clickable(role = Role.Button, onClickLabel = "View full ${event.type.label} record", onClick = soundAction(onClick)) else Modifier),
        shape = RoundedCornerShape(if (bordered) 12.dp else 0.dp), color = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface, border = if (bordered) BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant) else null,
        tonalElevation = 0.dp, shadowElevation = 0.dp,
    ) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(JournalDates.inputTime(event.occurredAtMillis, zone), Modifier.width(46.dp), style = MaterialTheme.typography.titleMedium.copy(fontFamily = LocalDisplayFont.current, fontWeight = FontWeight.Bold, fontSize = 14.sp))
            EventMark(event.type)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(event.type.label, style = MaterialTheme.typography.titleMedium)
                if (includeDate) CaptionText(JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, zone)))
                Text(observationSummary(event), style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
            if (onClick != null) BarkIcon("chevron-right", Modifier.size(16.dp))
        }
    }
}

@Composable
fun EventMark(type: CareEventType, size: androidx.compose.ui.unit.Dp = 40.dp, modifier: Modifier = Modifier, outlined: Boolean = false) {
    val palette = EventPalette.forType(type, LocalBarkDarkTheme.current)
    Surface(modifier.size(size), shape = RoundedCornerShape(50), border = if (outlined) BorderStroke(2.dp, boardColor("panel")) else null, color = boardColor("${type.key}-dot".takeIf { it in com.dracoarts.shared.presentation.theme.LocalBoardColors.current } ?: "note-dot"), contentColor = androidx.compose.ui.graphics.Color.White) {
        Box(contentAlignment = Alignment.Center) { BarkIcon(type.iconName(), Modifier.size(if (size <= 28.dp) 13.dp else if (size > 40.dp) 30.dp else 21.dp), androidx.compose.ui.graphics.Color.White) }
    }
}

@Composable
fun BoardThreadRow(time: String, title: String, note: String, icon: String, family: String,
    first: Boolean, last: Boolean, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val line = boardColor("hair"); val ground = boardColor("ground")
    Row(Modifier.fillMaxWidth().heightIn(min = 88.dp).drawBehind {
        val x = 80.dp.toPx()
        drawLine(line, Offset(x, if (first) size.height / 2 else 0f), Offset(x, if (last) size.height / 2 else size.height), 3.dp.toPx(), StrokeCap.Round)
        drawCircle(ground, 27.dp.toPx(), Offset(x, size.height / 2))
    }.clickable(interactionSource = source, indication = null, role = Role.Button, onClickLabel = "View $title record", onClick = soundAction(onClick)),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(time, Modifier.width(46.dp), style = MaterialTheme.typography.titleMedium.copy(fontFamily = LocalDisplayFont.current, fontWeight = FontWeight.Bold, fontSize = 14.sp))
        Surface(shape = RoundedCornerShape(50), color = boardColor("$family-dot")) { Box(Modifier.size(44.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(23.dp), Color.White) } }
        Surface(Modifier.weight(1f).padding(vertical = 6.dp), shape = RoundedCornerShape(20.dp), color = boardColor(if (pressed) "inset" else "panel"), border = BorderStroke(1.dp, line)) {
            Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(title, style = MaterialTheme.typography.titleMedium)
                Text(note, style = MaterialTheme.typography.bodySmall, color = boardColor("ink-muted"), maxLines = 2, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}
