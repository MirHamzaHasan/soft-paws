package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.datetime.*

internal val catMemoryScreens = setOf(Feature.Memory, Feature.MemoryCollection, Feature.MemoryHighlight, Feature.MemoryCaption, Feature.MemoryShare)
internal val catMediaEditors = setOf(Feature.PhotoForm, Feature.PhotoDetail, Feature.MemoryCollection, Feature.MemoryCaption)

@Composable
fun MemoryFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val saved = context.items.firstOrNull { it.id == page.id && it.data is CareItemData.Memory }
    val memory = saved?.data as? CareItemData.Memory
    val monthArgument = page.id.substringBefore('@').takeIf { Regex("\\d{4}-\\d{2}").matches(it) }
    if ((page.feature in setOf(Feature.MemoryHighlight, Feature.MemoryCaption) || page.feature == Feature.MemoryShare && page.id.isNotBlank() && monthArgument == null) && saved == null) {
        FeatureNotice("Collection unavailable", "Your other moments and captions stay saved."); return
    }
    if (page.feature == Feature.MemoryShare && !PremiumExportAccess(context, com.dracoarts.shared.presentation.companion.PremiumFeature.MemoryBookPdf) { context.navigation.back() }) return
    var month by rememberSaveable(context.dog.id, page.feature, page.id) { mutableStateOf(monthArgument ?: saved?.let { memoryMonth(it, context.zone) } ?: JournalDates.inputDate(context.now, context.zone).take(7)) }
    val first = LocalDate.parse("$month-01"); val last = first.plus(1, DateTimeUnit.MONTH).minus(1, DateTimeUnit.DAY)
    val label = "${first.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${first.year}"
    val collections = context.items.filter { it.data is CareItemData.Memory && memoryMonth(it, context.zone) == month }
    val photos = context.items.filter { (it.data as? CareItemData.Photo)?.date?.take(7) == month }.sortedByDescending { (it.data as CareItemData.Photo).date }
    var monthlyEvents by remember(context.dog.id, month) { mutableStateOf<List<CareEvent>?>(null) }
    var linkedEvents by remember(context.dog.id, month, page.id) { mutableStateOf<List<CareEvent>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, month, page.id, context.items, retry) {
        error = null; monthlyEvents = null
        try {
            val start = JournalDates.dayBounds(first, context.zone).first.coerceAtLeast(0)
            val end = JournalDates.dayBounds(last, context.zone).second
            val flow = if (end > start) context.repository.observeTimeline(TimelineFilter(context.dog.id, fromMillis = start, untilMillis = end), Int.MAX_VALUE).map { it.events } else flowOf(emptyList())
            flow.collect { events ->
                val ids = (if (saved != null) listOf(saved) else collections).flatMap { (it.data as CareItemData.Memory).sourceIds }.distinct()
                linkedEvents = ids.mapNotNull { id -> context.repository.observeEvent(context.dog.id, id).first() }
                monthlyEvents = events
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = "Couldn't read these memories. Your saved moments haven't changed." }
    }
    val monthWord = first.month.name.lowercase().replaceFirstChar { it.uppercase() }
    when (page.feature) {
        Feature.Memory -> SoftPawsHeading("$monthWord, in small moments.", "${context.dog.name}’s Memory Book · ${first.year}", "in small moments.")
        Feature.MemoryCollection -> SoftPawsHeading("Your chosen highlights.", "$label · choose saved moments", "chosen highlights.")
        Feature.MemoryCaption -> SoftPawsHeading("Your words, kept.", "Collection caption · $label", "kept.")
        Feature.MemoryHighlight -> SoftPawsHeading(memory!!.caption.ifBlank { "A moment, kept." }, "$label · ${context.dog.name}")
        Feature.MemoryShare -> SoftPawsHeading("Keep a copy of the month.", "$label · ${context.dog.name}", "the month.")
        else -> error("Not a memory destination")
    }
    if (error != null) { ErrorCard(error!!); BarkButton("Try again", { retry++ }); return }
    val events = monthlyEvents
    if (events == null) { SoftPawsCard("Opening saved moments") { repeat(3) { SkeletonLine(180.dp); SkeletonLine(110.dp) } }; return }
    when (page.feature) {
        Feature.Memory -> {
            val shown = collections.filter { val m = it.data as CareItemData.Memory; m.sourceIds.isNotEmpty() || m.caption.isNotBlank() }
            if (shown.isEmpty()) SoftPawsCard("Your chosen highlights") { SupportingText("Only moments you explicitly choose appear here. Add a photo or choose a saved record.") }
            shown.forEach { item ->
                val data = item.data as CareItemData.Memory
                val photo = data.sourceIds.firstNotNullOfOrNull { id -> (context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo) }
                photo?.let { LocalPhoto(it.fileId, it.title, context.platform.device, height = 190.dp) }
                SoftPawsCard(data.caption.ifBlank { photo?.title ?: "Your chosen highlights" }) {
                    photo?.notes?.takeIf(String::isNotBlank)?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
                    CaptionText("${data.sourceIds.size} selected ${if (data.sourceIds.size == 1) "reference" else "references"}")
                    val title = data.caption.ifBlank { photo?.title ?: "selected care records" }.take(100)
                    SoftPawsRow("Open collection", "Read its linked records and caption", "notebook-pen", accessibilityLabel = "Open collection: $title") { context.open(Feature.MemoryHighlight, item.id) }
                }
            }
            CaptionText("Reading on this phone stays free.")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                BarkTextAction("Previous month", { month = first.minus(1, DateTimeUnit.MONTH).toString().take(7) }, enabled = first > LocalDate(0, 1, 1), icon = "chevron-left")
                BarkTextAction("Next month", { month = first.plus(1, DateTimeUnit.MONTH).toString().take(7) }, enabled = first < LocalDate(9999, 12, 1), icon = "chevron-right")
            }
            SoftPawsRow("All their photos", "Your private photo journal", "image") { context.open(Feature.Photos) }
            SoftPawsRow("Make a highlight", "Photo editing and preview stay free", "play") { context.open(Feature.VideoHighlight) }
            BoardStickyAction {
                BarkButton("PDF, print & sharing", { context.open(Feature.MemoryShare, month) }, enabled = shown.isNotEmpty())
                BarkButton("Choose highlights", { context.open(Feature.MemoryCollection, month) }, secondary = true, enabled = events.isNotEmpty() || photos.isNotEmpty())
            }
        }
        Feature.MemoryCollection -> MemorySelectionEditor(page, month, events, photos, context)
        Feature.MemoryCaption -> {
            val scope = rememberCoroutineScope()
            val form = rememberFeatureForm(context, "memory-caption-${saved!!.id}", mapOf("caption" to memory!!.caption))
            BarkField("Collection caption", form["caption"], { if (it.length <= maxOf(500, memory.caption.length)) form["caption"] = it }, Modifier.fillMaxWidth(), !context.saving, multiline = true, softPaws = true)
            CaptionText("Your collection caption is separate from photo captions and source records.")
            BoardStickyAction {
                FeatureFormError(form); if (form.error == null) context.careState.error?.let { ErrorCard(it) }
                BarkButton(if (context.saving) "Keeping on this device…" else "Keep collection caption", { scope.launch { form.attempt {
                    val updated = context.care.save(saved.dogId, saved.id, saved.occurredAt, memory.copy(caption = form["caption"].trim()), form.expectedRevision, form.slot)
                    if (updated != null) { form.completed = true; context.showSavedFeature(Feature.MemoryHighlight, updated.id) }
                } } }, enabled = !context.saving)
            }
        }
        Feature.MemoryHighlight -> {
            val photo = memory!!.sourceIds.firstNotNullOfOrNull { id -> context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo }
            photo?.let { LocalPhoto(it.fileId, it.title, context.platform.device, height = 220.dp) }
            if (memory.sourceIds.isEmpty()) CaptionText("No sources are selected in this collection. Your caption stays saved.")
            MemorySources(memory.sourceIds, linkedEvents, context)
            BoardStickyAction {
                BarkButton("Edit collection caption", { context.open(Feature.MemoryCaption, saved!!.id) }, secondary = true)
                BarkButton("PDF, print & sharing", { context.open(Feature.MemoryShare, saved!!.id) }, enabled = memory.sourceIds.isNotEmpty() || memory.caption.isNotBlank())
            }
        }
        Feature.MemoryShare -> MemoryPdfShare(page, month, context)
        else -> Unit
    }
}

@Composable
private fun MemorySelectionEditor(page: FeaturePage, month: String, events: List<CareEvent>, photos: List<CareItem>, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val ids = events.map { it.id } + photos.map { it.id }
    val form = rememberFeatureForm(context, "memory-new-$month", mapOf("selected" to page.id.substringAfter('@', "").takeIf { it in ids }.orEmpty()))
    val selected = form["selected"].split(',').filter(String::isNotBlank).toSet()
    CaptionText("${selected.size} selected · choose up to 100")
    SoftPawsList {
        events.take(100).forEach { event -> HealthCheck("${event.type.label} · ${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))}", event.id in selected, !context.saving && (event.id in selected || selected.size < 100)) { on -> form["selected"] = (if (on) selected + event.id else selected - event.id).joinToString(",") } }
        photos.take(100).forEach { item -> val photo = item.data as CareItemData.Photo
            HealthCheck("${photo.title} · ${photo.date}", item.id in selected, !context.saving && (item.id in selected || selected.size < 100)) { on -> form["selected"] = (if (on) selected + item.id else selected - item.id).joinToString(",") }
        }
    }
    BarkField("Collection caption · optional", form["caption"], { if (it.length <= 500) form["caption"] = it }, Modifier.fillMaxWidth(), !context.saving, multiline = true, softPaws = true)
    BoardStickyAction {
        FeatureFormError(form); if (form.error == null) context.careState.error?.let { ErrorCard(it) }
        BarkButton(if (context.saving) "Keeping on this device…" else "Keep selected highlights", { scope.launch { form.attempt {
            require(selected.isNotEmpty() && selected.all { it in ids }) { "Choose available saved moments before keeping this collection." }
            val time = (events.filter { it.id in selected }.map { it.occurredAtMillis } + photos.filter { it.id in selected }.map { it.occurredAt }).maxOrNull() ?: 0L
            val item = context.care.save(context.dog.id, form.requestId, time, CareItemData.Memory(selected.toList(), form["caption"].trim(), month), draftSlot = form.slot)
            if (item != null) { form.completed = true; context.showSavedFeature(Feature.MemoryHighlight, item.id) }
        } } }, enabled = !context.saving && selected.isNotEmpty())
    }
}

@Composable
private fun MemoryPdfShare(page: FeaturePage, month: String, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    var job by remember { mutableStateOf<Job?>(null) }
    var busy by remember { mutableStateOf(false) }
    var prepared by remember(page.id, context.dog.id) { mutableStateOf<PreparedExport?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    fun allowed() = context.companion?.state?.value?.premiumAccess == true
    fun handoff(print: Boolean) { scope.launch {
        if (!allowed()) { message = "Premium access is needed for PDF, print and sharing. Your on-phone book stays available."; return@launch }
        val file = prepared ?: return@launch
        busy = true
        try { message = when (val result = context.platform.device.sharePrepared(file, print)) {
            is DeviceResult.Success -> if (print) "Handed to the native print dialog." else "Handed to the native share sheet."
            DeviceResult.Cancelled -> "Sharing cancelled. Your collections stay saved."
            DeviceResult.Denied -> "The destination wasn't accessible. Your prepared PDF stays here."
            is DeviceResult.Failed -> result.message
        } } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { message = "Couldn't open the native destination. Your collections stay saved." }
        finally { busy = false }
    } }
    SoftPawsCard(if (prepared == null) "A copy of chosen moments" else "Your PDF is ready") { SupportingText("Only this cat's selected references and your saved captions are included. No automatic upload.") }
    message?.let { ErrorText(it) }
    BoardStickyAction {
        if (prepared == null) BarkButton(if (busy) "Preparing PDF…" else "Prepare PDF", {
            job = scope.launch {
                if (!allowed()) { message = "Premium access is needed to prepare a PDF. Your on-phone book stays available."; return@launch }
                busy = true; message = null
                try {
                    val all = context.care.items(context.dog.id)
                    val specific = page.id.takeUnless { Regex("\\d{4}-\\d{2}").matches(it) || it.isBlank() }
                    val collections = if (specific != null) listOf(all.firstOrNull { it.id == specific && it.data is CareItemData.Memory } ?: throw RecordNotFoundException())
                        else all.filter { it.data is CareItemData.Memory && memoryMonth(it, context.zone) == month }
                    require(collections.isNotEmpty()) { "Choose saved highlights before preparing a PDF." }
                    require(collections.any { val data = it.data as CareItemData.Memory; data.sourceIds.isNotEmpty() || data.caption.isNotBlank() }) { "Choose saved highlights or add a caption before preparing a PDF." }
                    val ids = collections.flatMap { (it.data as CareItemData.Memory).sourceIds }.distinct()
                    val images = mutableListOf<ExportImage>()
                    val lines = mutableListOf("${context.dog.name} · $month")
                    collections.map { (it.data as CareItemData.Memory).caption }.filter(String::isNotBlank).forEach(lines::add)
                    ids.forEach { id ->
                        val event = context.repository.observeEvent(context.dog.id, id).first()
                        val photo = all.firstOrNull { it.id == id }?.data as? CareItemData.Photo
                        when {
                            photo != null -> { lines += "${photo.title} · ${photo.date}"; if (photo.notes.isNotBlank()) lines += photo.notes; images += ExportImage(photo.fileId, "${photo.title} · ${photo.date}") }
                            event != null -> { lines += "${event.type.label} · ${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))}"; lines += JournalReport.details(event.details); event.note?.let(lines::add); event.context.photoId?.let { images += ExportImage(it, event.type.label) } }
                            else -> lines += "A selected source is no longer available. The collection caption is retained."
                        }
                    }
                    when (val result = context.platform.device.prepareExport(ExportDocument("Soft-Paws-memory-$month-${context.platform.newId().take(8)}.pdf", ExportFormat.PDF, "Soft Paws Memory Book", lines, images = images))) {
                        is DeviceResult.Success -> prepared = result.value
                        DeviceResult.Cancelled -> message = "Preparation cancelled. Your book stays saved."
                        DeviceResult.Denied -> message = "The local destination wasn't available. Try again."
                        is DeviceResult.Failed -> message = result.message
                    }
                } catch (cancelled: CancellationException) { message = "Preparation cancelled. Your book stays saved."; throw cancelled }
                catch (_: Exception) { message = "Couldn't prepare this PDF. Your chosen moments stay saved; try again." }
                finally { busy = false }
            }
        }, enabled = !busy)
        else {
            BarkButton(if (busy) "Opening destination…" else "Share PDF", { handoff(false) }, enabled = !busy)
            BarkButton("Print PDF", { handoff(true) }, secondary = true, enabled = !busy)
            BarkTextAction("Prepare an updated copy", { prepared = null; message = null }, enabled = !busy)
        }
        if (busy && prepared == null) BarkTextAction("Cancel preparation", { job?.cancel() })
        BarkTextAction("Back to Memory Book", { context.navigation.returnTo(Feature.Memory, month) }, enabled = !busy)
    }
}

@Composable
private fun MemorySources(ids: List<String>, events: List<CareEvent>, context: FeatureContext) {
    SoftPawsList {
        ids.forEach { id ->
            val event = events.firstOrNull { it.id == id }
            val item = context.items.firstOrNull { it.id == id }
            val photo = item?.data as? CareItemData.Photo
            when {
                event != null -> SoftPawsRow(event.type.label, "${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))} · ${JournalReport.details(event.details).ifBlank { event.note.orEmpty() }}", event.type.iconName()) { context.navigation.detail(event.dogId, event.id) }
                photo != null -> SoftPawsRow(photo.title, "${photo.date} · ${photo.notes}", "image") { context.open(Feature.PhotoDetail, item.id) }
                else -> SoftPawsFact("Source no longer available", "Your collection caption stays saved.", "image")
            }
        }
    }
}
