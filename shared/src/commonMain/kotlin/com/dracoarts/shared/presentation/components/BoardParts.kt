package com.dracoarts.shared.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.theme.*

data class BoardFolio(val eyebrow: String, val icon: String, val family: String, val sticker: String = family, val display: Boolean = false)
val LocalBoardFolio = staticCompositionLocalOf<BoardFolio?> { null }
typealias BoardFooterContent = @Composable () -> Unit
val LocalBoardFooter = staticCompositionLocalOf<(BoardFooterContent?) -> Unit> { {} }

@Composable
fun BoardStickyAction(content: BoardFooterContent) {
    val latest by rememberUpdatedState(content)
    val publish = LocalBoardFooter.current
    DisposableEffect(publish) { publish { latest() }; onDispose { publish(null) } }
}

private val portraitParts by lazy { listOf(
    "dog-ear" to "M24 43C8 38 8 16 19 12c11-4 19 9 21 19",
    "dog-ear" to "M72 43c16-5 16-27 5-31-11-4-19 9-21 19",
    "dog-fur" to "M19 48c0-24 12-37 29-37s29 13 29 37c0 22-12 37-29 37S19 70 19 48Z",
    "dog-muzzle" to "M48 42c14 0 23 9 23 21 0 13-10 22-23 22s-23-9-23-22c0-12 9-21 23-21Z",
    "dog-ink" to "M33.7 43a3.3 4.2 0 1 0 6.6 0a3.3 4.2 0 1 0 -6.6 0Z",
    "dog-ink" to "M55.7 43a3.3 4.2 0 1 0 6.6 0a3.3 4.2 0 1 0 -6.6 0Z",
    "dog-ink" to "M41 58c2-4 12-4 14 0 1 4-3 7-7 7s-8-3-7-7Z",
    "dog-collar" to "M30 79c7 7 29 7 36 0v10H30Z",
    "stroke" to "M39 69c5 5 13 5 18 0",
).map { (token, path) -> token to PathParser().parsePathString(path).toPath() } }

/** Exact 96-point portrait paths from B.dogPortrait, used by the board ID card. */
@Composable
fun BoardDogPortrait(modifier: Modifier = Modifier) {
    val colors = LocalBoardColors.current
    Canvas(modifier.clearAndSetSemantics {}) {
        val scale = minOf(size.width, size.height) / 96f
        withTransform({ translate((size.width - 96 * scale) / 2, (size.height - 96 * scale) / 2); scale(scale, scale, Offset.Zero) }) {
            portraitParts.forEach { (token, path) -> if (token == "stroke") drawPath(path, colors.getValue("dog-ink"), style = Stroke(2.5f, cap = StrokeCap.Round)) else drawPath(path, colors.getValue(token)) }
        }
    }
}

/** Same parts as the live folio: flat family ground, editorial title, tilted sticker. */
@Composable
fun BoardHeading(title: String, subtitle: String?, folio: BoardFolio) {
    val ink = boardColor("${folio.family}-ink")
    Surface(Modifier.fillMaxWidth().heightIn(min = 150.dp), shape = RoundedCornerShape(30.dp), color = boardColor("${folio.family}-bg"), contentColor = ink) {
        Box(Modifier.padding(start = 22.dp, end = 18.dp, top = 22.dp, bottom = 24.dp)) {
            Column(Modifier.fillMaxWidth().padding(end = 74.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(folio.eyebrow, style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.5.sp, lineHeight = 15.225.sp, letterSpacing = .84.sp), color = ink)
                Text(title, style = if (folio.display) MaterialTheme.typography.displayLarge else MaterialTheme.typography.displayLarge.copy(fontSize = 36.sp, lineHeight = 36.72.sp, letterSpacing = (-1.26).sp), color = ink, modifier = Modifier.semantics { heading() })
                subtitle?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = ink.copy(alpha = .86f)) }
            }
            Surface(Modifier.align(Alignment.TopEnd).graphicsLayer { rotationZ = -10f }, shape = CircleShape, color = boardColor("${folio.sticker}-dot")) {
                Box(Modifier.size(62.dp), contentAlignment = Alignment.Center) { BarkIcon(folio.icon, Modifier.size(38.dp), Color.White) }
            }
        }
    }
}

/** A solid marker under the selected word, not gradient text or a second text layer. */
@Composable
fun MarkerHeading(title: String, marked: String, modifier: Modifier = Modifier, style: TextStyle = MaterialTheme.typography.displayLarge) {
    var layout by remember { mutableStateOf<TextLayoutResult?>(null) }
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val progress = remember { Animatable(if (motion.reduced) 1f else 0f) }
    val ball = boardColor("ball")
    LaunchedEffect(title, marked, motion.reduced, motion.replay, restoring) {
        if (motion.reduced || restoring) progress.snapTo(1f)
        else { progress.snapTo(0f); kotlinx.coroutines.delay(motion.milliseconds(540).toLong()); progress.animateTo(1f, tween(motion.milliseconds(640), easing = CubicBezierEasing(.16f, 1f, .3f, 1f))) }
    }
    Text(title, style = style, onTextLayout = { layout = it },
        modifier = modifier.semantics { heading() }.drawBehind {
            val result = layout ?: return@drawBehind
            val start = title.indexOf(marked)
            if (start >= 0 && marked.isNotEmpty()) {
                val end = start + marked.length
                (start until end).groupBy { result.getLineForOffset(it) }.values.forEach { offsets ->
                    val first = result.getBoundingBox(offsets.first()); val last = result.getBoundingBox(offsets.last())
                    drawRect(ball, Offset(first.left, first.top + first.height * .58f), Size((last.right - first.left) * progress.value, first.height * .34f))
                }
            }
        })
}

@Composable
fun BoardIdentityHeading(title: String, subtitle: String, icon: String, family: String, sharedKey: String? = null) {
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(30.dp), color = boardColor("$family-bg"), contentColor = boardColor("$family-ink")) {
        Row(Modifier.padding(18.dp), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(Modifier.size(84.dp).then(if (sharedKey != null) boardSharedElement(sharedKey, boardColor("$family-bg")) else Modifier), shape = CircleShape, color = boardColor("$family-dot")) { Box(contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(31.dp), Color.White) } }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(title, style = MaterialTheme.typography.displaySmall, modifier = Modifier.semantics { heading() }); Text(subtitle, style = MaterialTheme.typography.bodyMedium) }
        }
    }
}

@Composable
fun BoardTotal(value: String) { Text(value, style = MaterialTheme.typography.displayLarge.copy(fontSize = 30.sp, lineHeight = 31.5.sp, letterSpacing = (-1.05).sp)) }

@Composable
fun BoardHandoff(icon: String, title: String, text: String, action: String, enabled: Boolean = true, onClick: () -> Unit) {
    JournalCard { Surface(shape = CircleShape, color = boardColor("inset")) { Box(Modifier.size(56.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(28.dp)) } }; SectionTitle(title); SupportingText(text); BarkButton(action, onClick, enabled = enabled, secondary = true, icon = icon) }
}

@Composable
fun BoardDogChip(name: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(soundAction(onClick), modifier.heightIn(min = 48.dp).then(pressMotion(source)), interactionSource = source, shape = CircleShape, color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.padding(start = 7.dp, end = 15.dp, top = 7.dp, bottom = 7.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            Surface(Modifier.then(stickerPressMotion(source)), shape = CircleShape, color = boardColor("ball")) { Box(Modifier.size(30.dp), contentAlignment = Alignment.Center) { PawMark(Modifier.size(17.dp)) } }
            Text(name, style = MaterialTheme.typography.titleMedium.copy(fontFamily = LocalDisplayFont.current, fontWeight = FontWeight.Bold, fontSize = 16.sp))
            BarkIcon("chevron-down", Modifier.size(14.dp))
        }
    }
}

@Composable
fun BoardBackButton(onClick: () -> Unit, enabled: Boolean = true) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(soundAction(onClick), Modifier.heightIn(min = 48.dp).then(pressMotion(source, enabled)), enabled = enabled, interactionSource = source, shape = CircleShape, color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.padding(start = 12.dp, end = 16.dp, top = 12.dp, bottom = 12.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon("arrow-left", Modifier.size(16.dp).then(glyphPressMotion(source, -1f, enabled))); Text("Back", style = MaterialTheme.typography.labelMedium) }
    }
}

@Composable
fun BoardGuideHeading(title: String, marked: String, subtitle: String) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { MarkerHeading(title, marked, style = MaterialTheme.typography.displaySmall); SupportingText(subtitle) }
}

@Composable
fun BoardGuideHero(name: String) {
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
      Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 24.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) { Text(name, Modifier.weight(1f).then(boardSharedElement("dog-name", boardColor("panel"))), style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, lineHeight = 18.2.sp)); Text("A local journal", style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp)) }
        AnimatedDog(Modifier.align(Alignment.CenterHorizontally).size(176.dp, 192.dp).then(boardSharedElement("dog", boardColor("panel"))), cropped = true)
      }
    }
}

@Composable
fun BoardGuideOption(title: String, subtitle: String, family: String, icon: String, chosen: Boolean, enabled: Boolean = true, onClick: () -> Unit) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    val checkLanding = selectionLanding(chosen)
    Surface(soundAction(onClick, com.dracoarts.shared.services.SoundCue.Selection), Modifier.fillMaxWidth().heightIn(min = 79.dp).then(pressMotion(source, enabled)).semantics { this.selected = chosen }, enabled = enabled, interactionSource = source, shape = RoundedCornerShape(20.dp), color = boardColor(if (chosen) "accent-soft" else "panel"), border = BorderStroke(1.dp, boardColor(if (chosen) "accent-line" else "hair"))) {
        Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(13.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(Modifier.then(stickerPressMotion(source, enabled)), shape = CircleShape, color = boardColor("$family-dot")) { Box(Modifier.size(45.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(23.dp), Color.White) } }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); Text(subtitle, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp)) }
            Surface(shape = CircleShape, color = if (chosen) boardColor("btn") else Color.Transparent, border = BorderStroke(1.dp, boardColor(if (chosen) "btn" else "hair-2"))) { Box(Modifier.size(22.dp), contentAlignment = Alignment.Center) { if (chosen) BarkIcon("check", Modifier.size(13.dp).then(checkLanding), boardColor("btn-ink")) } }
        }
    }
}

@Composable
fun BoardLogMark(type: com.dracoarts.shared.domain.model.CareEventType, size: androidx.compose.ui.unit.Dp, modifier: Modifier = Modifier, tile: Boolean = false) {
    Surface(modifier.size(size), shape = CircleShape, color = boardColor("${type.key}-dot")) {
        Box(contentAlignment = Alignment.Center) { BarkIcon(type.iconName(), Modifier.size(if (tile) 26.dp else 34.dp), Color.White) }
    }
}

@Composable
fun BoardEditorHero(type: com.dracoarts.shared.domain.model.CareEventType, title: String, subtitle: String, dog: String) {
    Surface(shape = RoundedCornerShape(30.dp), color = boardColor("${type.key}-bg"), contentColor = boardColor("${type.key}-ink")) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 20.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            BoardLogMark(type, 64.dp, Modifier.then(boardSharedElement("care-${type.key}", boardColor("${type.key}-bg"))).graphicsLayer { rotationZ = -7f })
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(when (type) { com.dracoarts.shared.domain.model.CareEventType.Poop, com.dracoarts.shared.domain.model.CareEventType.Pee -> "DAILY CARE"; com.dracoarts.shared.domain.model.CareEventType.Meal, com.dracoarts.shared.domain.model.CareEventType.Walk -> "FOOD & MOVEMENT"; com.dracoarts.shared.domain.model.CareEventType.Grooming, com.dracoarts.shared.domain.model.CareEventType.Weight -> "CARE & MEASURES"; else -> "OBSERVATIONS" }, style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.5.sp, lineHeight = 15.75.sp, letterSpacing = .84.sp))
                Text(title, style = MaterialTheme.typography.headlineSmall.copy(fontSize = 34.sp, lineHeight = 34.68.sp, letterSpacing = (-1.19).sp), modifier = Modifier.semantics { heading() })
                Text(subtitle, style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp, lineHeight = 20.3.sp))
            }
        }
    }
}

@Composable
fun BoardSection(number: String, title: String, family: String = "note", content: @Composable ColumnScope.() -> Unit) {
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
    Column(Modifier.padding(horizontal = 18.dp, vertical = 20.dp), verticalArrangement = Arrangement.spacedBy(17.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            Surface(shape = RoundedCornerShape(8.dp), color = boardColor("$family-bg")) { Box(Modifier.size(25.dp), contentAlignment = Alignment.Center) { Text(number, style = MaterialTheme.typography.labelSmall, color = boardColor("$family-ink")) } }
            Text(title, style = MaterialTheme.typography.titleLarge.copy(fontSize = 21.sp, lineHeight = 24.15.sp), modifier = Modifier.semantics { heading() })
        }
        content()
    }
    }
}
