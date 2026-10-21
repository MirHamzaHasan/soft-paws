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

internal val catVideoScreens = setOf(Feature.VideoHighlight, Feature.VideoHighlightGate)

@Composable
internal fun HighlightFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val controller = context.highlights ?: return
    val state by controller.state.collectAsState()
    val companion = context.companion?.state?.collectAsState()?.value
    val scope = rememberCoroutineScope()
    val catId = context.dog.id
    val reduced = LocalBarkMotion.current.reduced
    val foreground by context.platform.device.foreground.collectAsState()
    LaunchedEffect(catId) { controller.open(catId) }
    LaunchedEffect(foreground) { if (!foreground) controller.cancelExport() }
    DisposableEffect(controller, catId) { onDispose { controller.cancelExport() } }
    if (state.loading || state.draft?.dogId != catId) {
        if (state.error != null) {
            ErrorCard(state.error!!)
            BarkButton("Try again", { scope.launch { controller.open(catId) } })
        } else SoftPawsCard("Opening your film") { repeat(3) { SkeletonLine(180.dp); SkeletonLine(120.dp) } }
        return
    }
    val draft = state.draft!!
    if (page.feature == Feature.VideoHighlightGate) {
        if (companion?.premiumAccess == true) { LaunchedEffect(Unit) { context.navigation.back() }; return }
        SoftPawsHeading("Keep their moments moving.", "Export a film from the photos you choose.", "moments moving.")
        SoftPawsCard("${context.dog.name}’s highlights") {
            Text("${draft.clips.size} selected photos · ${filmSeconds(draft.durationMs)} seconds")
            CaptionText("MP4 · ${if (draft.aspect == HighlightAspect.Portrait) "Portrait · 9:16" else "Square · 1:1"} · silent")
        }
        CaptionText("Editing and on-phone preview stay free. Purchases are unavailable in this build.")
        BoardStickyAction {
            BarkButton("See Premium", { context.companion?.requestPremium(PremiumFeature.VideoHighlight) })
            BarkTextAction("Back to my preview", context.navigation::back)
        }
        return
    }
    val preview = page.id.startsWith("preview")
    var selected by rememberSaveable(catId, page.id) { mutableIntStateOf(page.id.substringAfter('@', "0").toIntOrNull() ?: 0) }
    var playing by remember { mutableStateOf(false) }
    var picking by remember { mutableStateOf(false) }
    var choose by remember { mutableStateOf(false) }
    var leaveEdit by remember { mutableStateOf(false) }
    var visible by remember { mutableStateOf(true) }
    val pan = remember { Animatable(0f) }
    val index = selected.coerceIn(0, (draft.clips.size - 1).coerceAtLeast(0))
    val clip = draft.clips.getOrNull(index)
    var title by rememberSaveable(catId) { mutableStateOf(draft.title) }
    var caption by rememberSaveable(catId, clip?.photoId) { mutableStateOf(clip?.caption.orEmpty()) }
    val busy = state.rendering || state.sharing || picking
    val committed = title == draft.title && (clip == null || caption == clip.caption)
    val titleText = draft.title.ifBlank { "${context.dog.name}’s moments" }
    val editPending by rememberUpdatedState(!committed || state.saving)
    DisposableEffect(context.navigation) {
        val guard: () -> Boolean = { if (editPending) { leaveEdit = true; true } else false }
        context.navigation.backGuard = guard
        onDispose { if (context.navigation.backGuard === guard) context.navigation.backGuard = null }
    }

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
    fun saveWords() {
        val photoId = clip?.photoId
        controller.change(catId) { old -> old.copy(title = title, clips = old.clips.map { if (it.photoId == photoId) it.copy(caption = caption) else it }) }
    }
    fun move(delta: Int) {
        val next = index + delta
        if (next !in draft.clips.indices) return
        playing = false
        controller.change(catId) { old -> old.copy(clips = old.clips.toMutableList().apply { add(next, removeAt(index)) }) }
        selected = next
        scope.launch { pan.snapTo(0f) }
    }
    SoftPawsHeading(if (preview) titleText else "A few moments, together.",
        if (preview) "${draft.clips.size} selected photos · silent on-phone preview" else "Editing and on-phone preview stay free.",
        if (preview) null else "together.")
    val windowHeight = LocalWindowInfo.current.containerSize.height
    if (clip == null) SoftPawsCard("Their photos belong here.") {
        BarkIcon("image", Modifier.size(44.dp), boardColor("accent"))
        SupportingText("Choose your cat’s photos. Export uses 3–12 moments.")
    } else {
        val frame = if (!preview) Modifier.fillMaxWidth().height(220.dp)
            else if (draft.aspect == HighlightAspect.Portrait) Modifier.width(174.dp).aspectRatio(9f / 16f)
            else Modifier.fillMaxWidth().aspectRatio(1f)
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Box(frame.clip(RoundedCornerShape(24.dp)).background(boardColor("inset")).onGloballyPositioned {
                val top = it.positionInWindow().y; visible = top + it.size.height > 0 && top < windowHeight
            }) {
                HighlightPhoto(clip.photoId, "Photo ${index + 1} of ${draft.clips.size}", context.platform.device,
                    Modifier.fillMaxSize().graphicsLayer { scaleX = 1f + .08f * pan.value; scaleY = scaleX; translationY = -size.height * .012f * pan.value }, 720)
                if (preview && clip.caption.isNotBlank()) Surface(Modifier.fillMaxWidth().align(Alignment.BottomCenter), color = boardColor("panel")) {
                    Text(clip.caption, Modifier.padding(12.dp), style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        if (preview) {
            val elapsed = index * HighlightDraft.CLIP_MS + (pan.value * HighlightDraft.CLIP_MS).toLong()
            CaptionText("${filmClock(elapsed)} / ${filmClock(draft.durationMs)} · silent preview")
            BarkButton(if (playing) "Pause preview" else "Play preview", {
                if (reduced) controller.message("Reduced motion is on. Use Previous photo and Next photo to review each moment.") else playing = !playing
            }, enabled = !busy)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) { VideoControl("Previous photo", { select(index - 1) }, !busy && index > 0) }
                Box(Modifier.weight(1f)) { VideoControl("Next photo", { select(index + 1) }, !busy && index < draft.clips.lastIndex) }
            }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            draft.clips.forEachIndexed { i, photo -> Surface(onClick = soundAction({ select(i) }), enabled = !busy && committed,
                modifier = Modifier.width(66.dp).heightIn(min = 80.dp).semantics { this.selected = i == index; contentDescription = "Preview photo ${i + 1}" },
                shape = RoundedCornerShape(16.dp), color = boardColor(if (i == index) "accent-soft" else "panel"),
                border = BorderStroke(1.dp, boardColor(if (i == index) "accent-line" else "hair-2"))) {
                Column(Modifier.padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    HighlightPhoto(photo.photoId, null, context.platform.device, Modifier.size(52.dp, 48.dp).clip(RoundedCornerShape(10.dp)))
                    Text("${i + 1}${if (i == index) " ✓" else ""}", style = MaterialTheme.typography.labelMedium)
                }
            } }
        }
    }
    if (!preview) {
        SoftPawsSection("Your highlight")
        OutlinedTextField(title, { if (it.length <= 100) { title = it; saveWords() } }, label = { Text("Film title") },
            placeholder = { Text("${context.dog.name}’s moments") }, enabled = !busy, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(18.dp))
        if (clip != null) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) { VideoControl("Move earlier", { move(-1) }, !busy && !state.saving && committed && index > 0) }
                Box(Modifier.weight(1f)) { VideoControl("Move later", { move(1) }, !busy && !state.saving && committed && index < draft.clips.lastIndex) }
            }
            OutlinedTextField(caption, { if (it.length <= 100) { caption = it; playing = false; saveWords() } }, label = { Text("Caption for this photo") },
                supportingText = { Text("${caption.length} / 100 · optional") }, enabled = !busy, modifier = Modifier.fillMaxWidth().heightIn(min = 110.dp), shape = RoundedCornerShape(18.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { HighlightAspect.entries.forEach { aspect -> Box(Modifier.weight(1f)) {
                VideoControl((if (draft.aspect == aspect) "✓ " else "") + if (aspect == HighlightAspect.Portrait) "Portrait · 9:16" else "Square · 1:1",
                    { controller.change(catId) { it.copy(aspect = aspect) } }, !busy && !state.saving && committed, draft.aspect == aspect)
            } } }
            BarkTextAction("Remove from film", { controller.change(catId) { it.copy(clips = it.clips.filter { p -> p.photoId != clip.photoId }) }; selected = (index - 1).coerceAtLeast(0) },
                enabled = !busy && !state.saving && committed, danger = true)
        }
        SoftPawsCard("Clip length") {
            CaptionText("2.8 seconds per photo · ${filmSeconds(draft.durationMs)} seconds total")
            CaptionText("Sound off · this film is silent")
        }
        BarkButton(if (picking) "Opening photos…" else "Choose photos", { choose = true }, enabled = !busy && !state.saving && committed && draft.clips.size < 12, secondary = true)
        CaptionText(if (state.saving) "Saving your edit…" else if (committed && draft.revision > 0) "${draft.clips.size} / 12 photos · draft saved on this device" else if (committed) "Choose a photo to start your film draft." else "This edit hasn't saved yet. Retry below.")
        CaptionText("Only selected photos are used. No automatic upload.")
    }
    if (state.rendering) SoftPawsCard("Making your film…") {
        Text("Keep Soft Paws open while it finishes.", Modifier.semantics { liveRegion = LiveRegionMode.Polite })
        state.progress?.let { progress ->
            LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth())
            CaptionText("${(progress * 100).toInt()}%")
        } ?: LinearProgressIndicator(Modifier.fillMaxWidth())
    }
    state.output?.let { output -> SoftPawsCard("Your film is ready.") {
        CaptionText("${output.width} × ${output.height} · ${filmSeconds(output.durationMs)} seconds · MP4 · silent")
        BarkTextAction("Export MP4 again", { if (!controller.export(reduced)) context.open(Feature.VideoHighlightGate) }, enabled = !busy && committed)
    } }
    state.message?.let { CaptionText(it) }
    BoardStickyAction {
        state.error?.let { ErrorText(it) }
        if (!committed && !state.saving) BarkButton("Retry edit", ::saveWords, enabled = !busy)
        if (state.rendering) BarkButton("Cancel export", controller::cancelExport, secondary = true)
        else {
            if (state.output != null) BarkButton(if (state.sharing) "Opening sharing…" else "Save or share MP4", {
                scope.launch { if (!controller.share()) context.open(Feature.VideoHighlightGate) }
            }, enabled = !busy && committed)
            BarkButton(if (preview) "Back to edit" else "Play preview", {
                if (preview) context.navigation.back() else context.navigation.openHighlightPreview(index)
            }, enabled = !busy && !state.saving && committed && (preview || clip != null), secondary = state.output != null)
            if (state.output == null) BarkButton("Export MP4 · Premium", {
                playing = false; if (!controller.export(reduced)) context.open(Feature.VideoHighlightGate)
            }, enabled = !busy && !state.saving && committed && draft.clips.size >= 3, secondary = true)
        }
    }
    if (leaveEdit) com.dracoarts.shared.presentation.companion.CDialog("This edit hasn't saved yet.", { leaveEdit = false }, actions = {
        BarkButton("Retry edit", { saveWords(); leaveEdit = false }, enabled = !state.saving)
        BarkTextAction("Keep editing", { leaveEdit = false })
        BarkTextAction("Leave without this edit", { leaveEdit = false; context.navigation.backGuard = null; context.navigation.backUnconditionally() }, enabled = !state.saving, danger = true)
    }) { CaptionText("Your last saved film stays on this device. Leaving discards only the unsaved words.") }
    if (choose) com.dracoarts.shared.presentation.companion.CDialog("Choose your cat’s photos", { choose = false }, actions = {
        BarkButton("From my phone", { choose = false; picking = true; scope.launch {
            try { withFrameNanos { }; withFrameNanos { }; controller.importPhoto(catId, context.platform.device) }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { controller.error("Couldn't open this photo. Your film draft stays saved. Try again.") }
            finally { picking = false }
        } })
        BarkTextAction("Back to my film", { choose = false })
    }) {
        CaptionText("Use this cat’s saved photos or choose another from this device.")
        val photos = context.items.mapNotNull { (it.data as? CareItemData.Photo)?.let { p -> p.fileId to p.title } }.distinctBy { it.first }
        if (photos.isEmpty()) CaptionText("No photos saved in this cat’s journal yet.")
        photos.forEach { (id, name) -> BarkTextAction(if (draft.clips.any { it.photoId == id }) "✓ $name" else name, {
            controller.change(catId) { it.copy(clips = it.clips + HighlightClip(id)) }; choose = false
        }, enabled = draft.clips.none { it.photoId == id }) }
    }
}

private fun filmSeconds(milliseconds: Long) = "${milliseconds / 1000}.${milliseconds % 1000 / 100}"
private fun filmClock(milliseconds: Long) = "${milliseconds / 60000}:${(milliseconds / 1000 % 60).toString().padStart(2, '0')}.${milliseconds % 1000 / 100}"
private val highlightDecodeLock = Mutex()

@Composable
private fun HighlightPhoto(id: String, description: String?, device: DeviceServices, modifier: Modifier, maxDimension: Int = 128) {
    var bitmap by remember(id, maxDimension) { mutableStateOf<ImageBitmap?>(null) }
    var loaded by remember(id, maxDimension) { mutableStateOf(false) }
    LaunchedEffect(id, maxDimension) {
        bitmap = try { highlightDecodeLock.withLock { withContext(Dispatchers.Default) { device.photoBytes(id)?.let { decodeHighlightPhoto(it, maxDimension) } } } }
            catch (cancelled: CancellationException) { throw cancelled } catch (_: Exception) { null }
        loaded = true
    }
    Box(modifier.background(boardColor("inset")), contentAlignment = Alignment.Center) {
        if (bitmap != null) Image(bitmap!!, description, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        else if (loaded) Text("Photo unavailable", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(8.dp))
        else SkeletonLine(80.dp)
    }
}

@Composable
private fun VideoControl(label: String, onClick: () -> Unit, enabled: Boolean = true, picked: Boolean = false) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(soundAction(onClick), Modifier.heightIn(min = 48.dp).then(pressMotion(source, enabled)).semantics { if (picked) selected = true }, enabled = enabled, interactionSource = source,
        shape = RoundedCornerShape(16.dp), color = boardColor(if (picked) "ball" else "panel"), contentColor = boardColor(if (picked) "ball-ink" else "ink"), border = BorderStroke(1.dp, boardColor(if (picked) "accent-line" else "hair-2"))) {
        Box(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), contentAlignment = Alignment.Center) { Text(label, style = MaterialTheme.typography.bodySmall) }
    }
}
