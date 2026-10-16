package com.dracoarts.shared.presentation.components

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone

/** Names and exact times replace colliding Home marks. The complete journal stays local. */
@Composable
fun HomeCareStrip(events: List<CareEvent>, zone: TimeZone, loading: Boolean,
    modifier: Modifier = Modifier, hiddenId: String? = null, landedId: String? = null,
    onRecord: (CareEvent) -> Unit, onMarkCenter: (CareEvent, Offset) -> Unit) {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val scope = rememberCoroutineScope()
    val scroll = rememberScrollState()
    val sorted = remember(events) { events.sortedWith(compareBy<CareEvent> { it.occurredAtMillis }.thenBy { it.createdAtMillis }.thenBy { it.id }) }
    val ids = remember(sorted) { sorted.map { it.id } }
    val positions = remember { mutableStateMapOf<String, Offset>() }
    var readyIds by remember { mutableStateOf<List<String>?>(null) }
    var lastTailId by rememberSaveable { mutableStateOf<String?>(null) }
    var viewport by remember { mutableIntStateOf(0) }
    val overlap = with(LocalDensity.current) { 40.dp.roundToPx() }
    val minimumStep = with(LocalDensity.current) { 110.dp.roundToPx() }
    var browseJob by remember { mutableStateOf<Job?>(null) }
    var browseTarget by remember { mutableIntStateOf(0) }
    var positionedOnce by remember { mutableStateOf(false) }
    val arrival = remember { androidx.compose.animation.core.Animatable(if (motion.reduced || restoring) 1f else 0f) }
    val markCenter by rememberUpdatedState(onMarkCenter)
    // Measure the completed row before publishing a flight destination. A newly
    // appended record can begin outside the viewport; that is never a valid target.
    LaunchedEffect(ids, loading) {
        readyIds = null
        if (!loading) {
            browseJob?.cancel()
            withFrameNanos { }; withFrameNanos { }
            // Back/tab restoration keeps the caregiver's place. Only a changed
            // latest record (or the first load) brings the newest moment into view.
            val tail = sorted.lastOrNull()?.id
            if (tail != lastTailId) scroll.scrollTo(scroll.maxValue)
            lastTailId = tail
            withFrameNanos { }
            positions.keys.retainAll(ids.toSet())
            readyIds = ids
        }
    }
    LaunchedEffect(readyIds, hiddenId, positions[hiddenId], scroll.value) {
        val record = sorted.firstOrNull { it.id == hiddenId }
        if (readyIds == ids && record != null) {
            withFrameNanos { }
            positions[record.id]?.let { markCenter(record, it) }
        }
    }
    LaunchedEffect(readyIds, motion.reduced, restoring) {
        if (motion.reduced || restoring) { arrival.snapTo(1f); positionedOnce = true }
        else if (readyIds == ids && !positionedOnce) {
            positionedOnce = true
            arrival.animateTo(1f, tween(motion.milliseconds(420), easing = CubicBezierEasing(0f, 0f, .2f, 1f)))
        }
    }
    // A preference change during a glide lands it immediately, with the same result.
    LaunchedEffect(motion.reduced) {
        if (motion.reduced && browseJob?.isActive == true) { browseJob?.cancel(); scroll.scrollTo(browseTarget.coerceIn(0, scroll.maxValue)) }
    }
    val browse: (Boolean) -> Unit = { latest ->
        browseJob?.cancel()
        val target = if (latest) scroll.maxValue else (scroll.value - (viewport - overlap).coerceAtLeast(minimumStep)).coerceAtLeast(0)
        browseTarget = target
        browseJob = scope.launch {
            if (motion.reduced) scroll.scrollTo(target)
            else scroll.animateScrollTo(target, tween(motion.milliseconds(460), easing = CubicBezierEasing(.16f, 1f, .3f, 1f)))
        }
    }
    Column(modifier.padding(top = 6.dp)) {
        if (loading) Row(Modifier.fillMaxWidth().height(48.dp), horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically) {
            repeat(3) { index ->
                Surface(Modifier.width(if (index == 1) 64.dp else 76.dp).height(if (index == 1) 12.dp else 40.dp),
                    shape = CircleShape, color = boardColor("inset")) {}
            }
        }
        if (!loading && sorted.isNotEmpty()) Row(Modifier.fillMaxWidth().heightIn(min = 48.dp),
            horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            CareBrowseButton("Earlier", "Show earlier care records", "arrow-left", scroll.canScrollBackward && hiddenId == null) { browse(false) }
            Text("Today so far", style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp), color = boardColor("ink-muted"))
            CareBrowseButton("Latest", "Show latest care records", "arrow-right", scroll.canScrollForward && hiddenId == null) { browse(true) }
        }
        when {
            loading -> Row(Modifier.fillMaxWidth().padding(top = 2.dp, bottom = 4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                repeat(3) { Surface(Modifier.weight(1f).height(72.dp), shape = RoundedCornerShape(18.dp), color = boardColor("inset")) {} }
            }
            sorted.isEmpty() -> Text("Your first record will appear here.", Modifier.padding(top = 5.dp, bottom = 10.dp), style = MaterialTheme.typography.bodySmall.copy(fontSize = 13.sp), color = boardColor("ink-muted"))
            else -> Row(Modifier.fillMaxWidth().graphicsLayer { alpha = arrival.value; translationY = 6.dp.toPx() * (1 - arrival.value) }.onGloballyPositioned { viewport = it.size.width }
                .horizontalScroll(scroll, enabled = hiddenId == null).padding(top = 2.dp, bottom = 4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                sorted.forEach { event -> key(event.id) {
                    val latest = event.id == sorted.last().id
                    val source = remember { MutableInteractionSource() }
                    val family = event.type.key.takeIf { "$it-bg" in LocalBoardColors.current } ?: "note"
                    val time = JournalDates.inputTime(event.occurredAtMillis, zone)
                    Surface(onClick = { onRecord(event) }, interactionSource = source,
                        modifier = Modifier.widthIn(min = 92.dp).heightIn(min = 72.dp).then(pressMotion(source))
                            .semantics { contentDescription = "${event.type.label} at $time. View record" },
                        shape = RoundedCornerShape(18.dp), border = BorderStroke(1.dp, boardColor(if (latest) "$family-line" else "hair")),
                        color = boardColor(if (latest) "$family-bg" else "panel"), contentColor = boardColor(if (latest) "$family-ink" else "ink-strong")) {
                        Column(Modifier.padding(horizontal = 12.dp, vertical = 9.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                            Text(time, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp, lineHeight = 14.4.sp, fontWeight = FontWeight.Medium), color = boardColor(if (latest) "$family-ink" else "ink-muted"))
                            Row(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalAlignment = Alignment.CenterVertically) {
                                EventMark(event.type, 26.dp, Modifier.onGloballyPositioned {
                                    val box = it.boundsInWindow(); positions[event.id] = box.center
                                }.graphicsLayer { alpha = if (event.id == hiddenId) 0f else 1f }.then(careMarkLanding(event.id == landedId)).then(stickerPressMotion(source)))
                                Text(event.type.label, style = MaterialTheme.typography.bodySmall.copy(fontSize = 13.sp, lineHeight = 18.2.sp, fontWeight = FontWeight.Medium))
                            }
                        }
                    }
                } }
            }
        }
    }
}

@Composable
private fun CareBrowseButton(label: String, description: String, icon: String, enabled: Boolean, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    Surface(onClick, Modifier.heightIn(min = 48.dp).widthIn(min = 48.dp).then(pressMotion(source, enabled))
        .semantics { contentDescription = description }.graphicsLayer { alpha = if (enabled) 1f else .35f },
        enabled = enabled, interactionSource = source, shape = CircleShape, color = boardColor("panel"),
        border = BorderStroke(1.dp, boardColor("hair")), contentColor = boardColor("ink")) {
        Row(Modifier.padding(horizontal = 9.dp), horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.CenterVertically) {
            if (icon == "arrow-left") BarkIcon(icon, Modifier.size(14.dp).then(glyphPressMotion(source, -1f, enabled)))
            Text(label, style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp, lineHeight = 16.8.sp, fontWeight = FontWeight.Medium))
            if (icon == "arrow-right") BarkIcon(icon, Modifier.size(14.dp).then(glyphPressMotion(source, 1f, enabled)))
        }
    }
}
