package com.dracoarts.shared.presentation.components

import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.presentation.navigation.Route

@Composable
fun BarkIcon(name: String, modifier: Modifier = Modifier, tint: Color = LocalContentColor.current) {
    if (name == "paw-print") { androidx.compose.runtime.CompositionLocalProvider(LocalContentColor provides tint) { PawMark(modifier) }; return }
    Icon((vectors[name] ?: vectors.getValue("info")).value, contentDescription = null, modifier = modifier, tint = tint)
}

private val vectors = (GeneratedBoardIcons.paths + SoftPawsIcons.paths).mapValues { (name, paths) -> lazy {
        ImageVector.Builder(name, 24.dp, 24.dp, 24f, 24f,
            autoMirror = name in setOf("arrow-left", "arrow-right", "chevron-right")).apply {
            paths.forEach { data ->
                addPath(PathParser().parsePathString(data).toNodes(), stroke = SolidColor(Color.Black),
                    strokeLineWidth = 1.75f, strokeLineCap = StrokeCap.Round, strokeLineJoin = StrokeJoin.Round)
            }
        }.build()
} }

fun CareEventType.iconName(): String = when (this) {
    CareEventType.Poop -> "circle-dashed"
    CareEventType.Pee -> "droplet"
    CareEventType.Meal -> "utensils"
    CareEventType.Walk -> "footprints"
    CareEventType.Mood -> "heart"
    CareEventType.Symptom -> "activity"
    CareEventType.Behavior -> "brain"
    CareEventType.Grooming -> "sparkles"
    CareEventType.Weight -> "gauge"
    CareEventType.Medication -> "pill"
    CareEventType.Training -> "graduation-cap"
    CareEventType.Task -> "calendar"
    CareEventType.Water -> "droplet"
    CareEventType.Litter -> "archive"
    CareEventType.Play -> "sparkles"
    CareEventType.Sleep -> "moon"
    CareEventType.Note -> "notebook-pen"
    else -> "file-text"
}

fun Route.iconName(): String = when (this) {
    Route.Home -> "house"
    Route.Timeline -> "notebook-pen"
    Route.Insights -> "chart-no-axes-column-increasing"
    Route.Profile -> "user-round"
    Route.Care -> "heart"
    Route.Memories -> "image"
}
