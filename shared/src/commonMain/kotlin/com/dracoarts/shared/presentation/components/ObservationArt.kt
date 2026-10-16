package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.*
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.*
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.theme.boardColor

/** Six labeled, non-clinical stool silhouettes from the approved observation picker. */
@Composable
fun ObservationArt(index: Int, modifier: Modifier = Modifier) {
    val ink = boardColor("poop-ink").copy(alpha = .85f)
    Canvas(modifier.size(25.dp, 23.dp).clearAndSetSemantics {}) {
        val height = when (index) { 1 -> 15.dp.toPx(); 2 -> 22.dp.toPx(); 3 -> 12.dp.toPx(); 4 -> 9.dp.toPx(); else -> size.height }
        val width = if (index == 2) 23.dp.toPx() else size.width
        val rect = Rect(Offset((size.width - width) / 2, (size.height - height) / 2), Size(width, height))
        if (index == 5) drawOval(ink, rect.topLeft, rect.size, style = Stroke(1.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(2.dp.toPx(), 2.dp.toPx()))))
        else if (index in 2..4) drawOval(ink, rect.topLeft, rect.size)
        else rotate(if (index == 1) -20f else 0f) { drawRoundRect(ink, rect.topLeft, rect.size, CornerRadius(if (index == 1) 12.dp.toPx() else 8.dp.toPx())) }
    }
}
