package com.dracoarts.shared.presentation.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInWindow
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.companion.PremiumFeature
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

@Composable
internal fun HighlightFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val controller = context.highlights ?: return
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    val dogId = context.dog.id
    val reduced = LocalBarkMotion.current.reduced
    val foreground by context.platform.device.foreground.collectAsState()
    LaunchedEffect(dogId) { controller.open(dogId) }
    LaunchedEffect(foreground) { if (!foreground) controller.cancelExport() }
    DisposableEffect(controller, dogId) { onDispose { controller.cancelExport() } }
    if (state.loading || state.draft?.dogId != dogId) {
        if (state.error != null) { ErrorCard(state.error!!); BarkButton("Try again", { scope.launch { controller.open(dogId) } }) }
        else CaptionText("Opening your saved film…")
        return
    }
    val draft = state.draft!!
    if (page.feature == Feature.VideoHighlightGate) {
        val premium = context.companion?.state?.collectAsState()?.value?.session?.premium == true
        if (premium) { LaunchedEffect(Unit) { context.navigation.back() }; return }
        ScreenHeading("Keep their moments moving.", "Export a film from the photos you choose.")
        JournalCard {
            SectionTitle("${context.dog.name}’s highlights")
            CaptionText("${draft.clips.size} selected photos · ${draft.clips.size * 2.8} seconds")
            Text("MP4 video · ${if (draft.aspect == HighlightAspect.Portrait) "Portrait · 9:16" else "Square · 1:1"}")
            CaptionText("720p · silent · made on this device")
        }
        BarkButton("See Premium", { context.companion?.requestPremium(PremiumFeature.VideoHighlight) }, icon = "lock-keyhole")
        BarkButton("Back to my preview", context.navigation::back, secondary = true)
        CaptionText("Demo build · prices undecided. No purchase or charge starts here.")
        return
    }
    var selected by rememberSaveable(dogId) { mutableIntStateOf(0) }
    var playing by remember { mutableStateOf(false) }
    var picking by remember { mutableStateOf(false) }
    var choose by remember { mutableStateOf(false) }
    var visible by remember { mutableStateOf(true) }
    val pan = remember { Animatable(0f) }
    val index = selected.coerceIn(0, (draft.clips.size - 1).coerceAtLeast(0))
    val clip = draft.clips.getOrNull(index)
    var caption by remember(clip?.photoId) { mutableStateOf(clip?.caption.orEmpty()) }
    val busy = state.rendering || state.sharing || picking
    LaunchedEffect(foreground, visible, reduced, busy) { if (!foreground || !visible || reduced || busy) playing = false }
    LaunchedEffect(playing, index, clip?.photoId) {
        if (playing && clip != null) {
            if (pan.value >= 1f) pan.snapTo(0f)
            pan.animateTo(1f, tween(((1f - pan.value) * HighlightDraft.CLIP_MS).toInt(), easing = LinearEasing))
            pan.snapTo(0f)
            if (index < draft.clips.lastIndex) selected = index + 1 else { selected = 0; playing = false }
        }
    }
    fun select(i: Int) { playing = false; selected = i; scope.launch { pan.snapTo(0f) } }
    fun move(delta: Int) {
        val next = index + delta
        if (next !in draft.clips.indices) return
        playing = false
        controller.change(dogId) { old -> old.copy(clips = old.clips.toMutableList().apply { add(next, removeAt(index)) }) }
        selected = next
        scope.launch { pan.snapTo(0f) }
    }
    ScreenHeading(if (clip == null) "Start with their photos." else "Make a little film.", "Their photos, in a moment to keep.")
    CaptionText("Preview free · video export with Premium")
    state.error?.let { ErrorCard(it) }
    val windowHeight = LocalWindowInfo.current.containerSize.height
    if (clip == null) JournalCard {
        BarkIcon("image", Modifier.size(44.dp)); SectionTitle("Your photos will appear here.")
        SupportingText("Choose 3–12 moments. Only the photos you choose are used.")
    } else Surface(shape = RoundedCornerShape(26.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            val film = if (draft.aspect == HighlightAspect.Portrait) Modifier.width(174.dp).aspectRatio(9f / 16f) else Modifier.fillMaxWidth().aspectRatio(1f)
            Box(film.clip(RoundedCornerShape(14.dp)).background(boardColor("inset")).onGloballyPositioned { val top = it.positionInWindow().y; visible = top + it.size.height > 0 && top < windowHeight }) {
                HighlightPhoto(clip.photoId, "Photo ${index + 1} of ${draft.clips.size}", context.platform.device, Modifier.fillMaxSize().graphicsLayer { scaleX = 1f + .08f * pan.value; scaleY = scaleX; translationY = -size.height * .012f * pan.value }, 720)
                if (caption.isNotBlank()) Surface(Modifier.fillMaxWidth().align(Alignment.BottomCenter), color = boardColor("panel")) { Text(caption, Modifier.padding(12.dp), style = MaterialTheme.typography.bodySmall) }
            }
            LinearProgressIndicator(progress = { (index + 1f) / draft.clips.size }, modifier = Modifier.fillMaxWidth().height(4.dp), color = boardColor("ink-strong"), trackColor = boardColor("hair"))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                VideoControl(if (playing) "Pause" else "Play preview", { if (reduced) controller.message("Reduced motion is on. Choose each photo below to review it.") else playing = !playing }, enabled = !busy, )
                CaptionText("${index + 1} / ${draft.clips.size} photos")
            }
        }
    }
    if (clip != null) {
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            draft.clips.forEachIndexed { i, photo -> Surface(onClick = { select(i) }, enabled = !busy,
                modifier = Modifier.width(66.dp).heightIn(min = 80.dp).semantics { this.selected = i == index; contentDescription = "Preview photo ${i + 1}" }, shape = RoundedCornerShape(16.dp),
                color = boardColor(if (i == index) "accent-soft" else "panel"), border = BorderStroke(1.dp, boardColor(if (i == index) "accent-line" else "hair-2"))) {
                Column(Modifier.padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    HighlightPhoto(photo.photoId, null, context.platform.device, Modifier.size(52.dp, 48.dp).clip(RoundedCornerShape(10.dp)))
                    Text("${i + 1}${if (i == index) " ✓" else ""}", style = MaterialTheme.typography.labelMedium)
                }
            } }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(Modifier.weight(1f)) { VideoControl("Move earlier", { move(-1) }, enabled = !busy && !state.saving && index > 0, ) }
            Box(Modifier.weight(1f)) { VideoControl("Move later", { move(1) }, enabled = !busy && !state.saving && index < draft.clips.lastIndex, ) }
        }
        OutlinedTextField(caption, { value -> if (value.length <= 100) { caption = value; playing = false; val photoId = clip.photoId; controller.change(dogId) { it.copy(clips = it.clips.map { p -> if (p.photoId == photoId) p.copy(caption = value) else p }) } } },
            label = { Text("Caption for this photo") }, supportingText = { Text("${caption.length} / 100 · optional") }, enabled = !busy, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { HighlightAspect.entries.forEach { aspect -> Box(Modifier.weight(1f)) {
            VideoControl((if (draft.aspect == aspect) "✓ " else "") + if (aspect == HighlightAspect.Portrait) "Portrait · 9:16" else "Square · 1:1", { playing = false; controller.change(dogId) { it.copy(aspect = aspect) } }, enabled = !busy && !state.saving, picked = draft.aspect == aspect)
        } } }
        BarkTextAction("Remove this photo", { playing = false; controller.change(dogId) { it.copy(clips = it.clips.filter { p -> p.photoId != clip.photoId }) }; selected = (index - 1).coerceAtLeast(0) }, enabled = !busy && !state.saving, danger = true)
    }
    BarkButton(if (picking) "Opening photos…" else "Choose photos", { playing = false; choose = true }, enabled = !busy && !state.saving && draft.clips.size < 12, secondary = true, icon = "image")
    CaptionText(if (state.saving) "Saving your edit…" else "${draft.clips.size} / 12 photos · draft saved on this device")
    if (state.rendering) {
        JournalCard {
            Text("Making your film…", Modifier.semantics { liveRegion = LiveRegionMode.Polite })
            val progress = state.progress
            if (progress == null) LinearProgressIndicator(Modifier.fillMaxWidth()) else { LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth()); CaptionText("${(progress * 100).toInt()}%") }
            CaptionText("Keep BarkLog open while it finishes.")
            BarkButton("Cancel export", controller::cancelExport, secondary = true)
        }
    } else BarkButton("Export video · Premium", { playing = false; if (!controller.export(reduced)) context.open(Feature.VideoHighlightGate) }, enabled = !busy && !state.saving && draft.clips.size >= 3 && caption == clip?.caption)
    state.output?.let { output ->
        JournalCard { SectionTitle("Your film is ready."); CaptionText("${output.width} × ${output.height} · MP4 · silent"); BarkButton(if (state.sharing) "Opening sharing…" else "Save or share MP4", { scope.launch { if (!controller.share()) context.open(Feature.VideoHighlightGate) } }, enabled = !busy, icon = "send") }
    }
    state.message?.let { FeatureNotice("Your film", it, "image") }
    BarkTextAction("Keep my journal", { context.navigation.show(Route.Home) }, enabled = !state.sharing)
    if (choose) com.dracoarts.shared.presentation.companion.CDialog("Choose their photos", { choose = false }, actions = {
        BarkButton("From my phone", { choose = false; picking = true; scope.launch { try { withFrameNanos { }; withFrameNanos { }; controller.importPhoto(dogId, context.platform.device) } finally { picking = false } } })
        BarkTextAction("Back to my film", { choose = false })
    }) {
        CaptionText("Use saved journal photos or choose another from this device.")
        val photos = context.items.mapNotNull { (it.data as? CareItemData.Photo)?.let { p -> p.fileId to p.title } }.distinctBy { it.first }
        if (photos.isEmpty()) CaptionText("No photos saved in this dog's journal yet.")
        photos.forEach { (id, title) -> BarkTextAction(if (draft.clips.any { it.photoId == id }) "✓ $title" else title, { controller.change(dogId) { it.copy(clips = it.clips + HighlightClip(id)) }; choose = false }, enabled = draft.clips.none { it.photoId == id }) }
    }
}

private val highlightDecodeLock = Mutex()

@Composable
private fun HighlightPhoto(id: String, description: String?, device: DeviceServices, modifier: Modifier, maxDimension: Int = 128) {
    var bitmap by remember(id) { mutableStateOf<ImageBitmap?>(null) }
    var loaded by remember(id) { mutableStateOf(false) }
    LaunchedEffect(id) { bitmap = highlightDecodeLock.withLock { withContext(Dispatchers.Default) { device.photoBytes(id)?.let { decodeHighlightPhoto(it, maxDimension) } } }; loaded = true }
    Box(modifier.background(boardColor("inset")), contentAlignment = Alignment.Center) {
        if (bitmap != null) Image(bitmap!!, description, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        else if (loaded) Text("Photo unavailable", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(8.dp))
        else CircularProgressIndicator(Modifier.size(24.dp))
    }
}

@Composable
private fun VideoControl(label: String, onClick: () -> Unit, enabled: Boolean = true, picked: Boolean = false) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(onClick, Modifier.heightIn(min = 48.dp).then(pressMotion(source, enabled)).semantics { if (picked) selected = true }, enabled = enabled, interactionSource = source,
        shape = RoundedCornerShape(16.dp), color = boardColor(if (picked) "ball" else "panel"), contentColor = boardColor(if (picked) "ball-ink" else "ink"), border = BorderStroke(1.dp, boardColor(if (picked) "accent-line" else "hair-2"))) {
        Box(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), contentAlignment = Alignment.Center) { Text(label, style = MaterialTheme.typography.bodySmall) }
    }
}
