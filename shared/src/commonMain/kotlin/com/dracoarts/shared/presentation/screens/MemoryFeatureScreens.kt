package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

@Composable
fun MemoryFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val saved = context.items.firstOrNull { it.id == page.id && it.data is CareItemData.Memory }
    val memory = saved?.data as? CareItemData.Memory
    var month by rememberSaveable(page.feature, page.id) {
        mutableStateOf(if (page.feature in setOf(Feature.Memory, Feature.MemoryCollection, Feature.MemoryShare) && Regex("\\d{4}-\\d{2}").matches(page.id.substringBefore('@'))) page.id.substringBefore('@')
            else JournalDates.inputDate(saved?.occurredAt ?: context.now, context.zone).take(7))
    }
    val first = LocalDate.parse("$month-01")
    val last = first.plus(1, DateTimeUnit.MONTH).minus(1, DateTimeUnit.DAY)
    val monthLabel = "${first.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${first.year}"
    val linkedPhoto = memory?.sourceIds?.firstNotNullOfOrNull { id -> context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo }
    if (page.feature == Feature.MemoryHighlight) linkedPhoto?.let { LocalPhoto(it.fileId, it.title, context.platform.device) }
    var report by remember(context.dog.id, month) { mutableStateOf<ReportSnapshot?>(null) }
    var sourceEvents by remember(page.id) { mutableStateOf<List<CareEvent>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, month, page.id, saved?.revision, retry) {
        report = null; error = null
        try {
            val snapshot = loadReport(context, "$first@$last")
            sourceEvents = memory?.sourceIds?.mapNotNull { context.repository.observeEvent(context.dog.id, it).first() } ?: snapshot.events
            report = snapshot
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = "Couldn't read these memories. Your saved records haven't changed." }
    }
    ScreenHeading(when (page.feature) {
        Feature.MemoryCollection -> "Keep these moments"
        Feature.MemoryCaption -> "Your words, kept"
        Feature.MemoryShare -> "Share ${first.month.name.lowercase().replaceFirstChar { it.uppercase() }}"
        Feature.MemoryHighlight -> memory?.caption?.ifBlank { "A collection to keep" } ?: "Memory highlight"
        else -> "Memory Book"
    }, when (page.feature) { Feature.MemoryCaption -> "A caption, not a generated story."; Feature.MemoryHighlight -> saved?.let { "${JournalDates.dateLabel(JournalDates.day(it.occurredAt, context.zone))} · caregiver caption" } ?: "Your saved sources"; Feature.MemoryCollection -> "Choose the local records for $monthLabel."; Feature.MemoryShare -> "${context.items.count { it.data is CareItemData.Memory && JournalDates.inputDate(it.occurredAt, context.zone).startsWith(month) }} selected highlights"; else -> "${context.dog.name} · $monthLabel" })
    if (page.feature == Feature.Memory) {
        BoardSelect("Month", month, (0..11).map { offset -> first.minus(offset, DateTimeUnit.MONTH).let { it.toString().take(7) to "${it.month.name.lowercase().replaceFirstChar { c -> c.uppercase() }} ${it.year}" } }) { month = it }
    }
    error?.let { ErrorCard(it); BarkButton("Try again", { retry++ }, icon = "refresh-cw"); return }
    val records = report
    if (records == null) { JournalCard { SkeletonLine(180.dp); CaptionText("Opening saved moments…") }; return }
    val photos = context.items.filter { (it.data as? CareItemData.Photo)?.date?.startsWith(month) == true }
    val availableIds = records.events.map { it.id } + photos.map { it.id }
    when (page.feature) {
        Feature.Memory -> {
            val collections = context.items.filter { it.data is CareItemData.Memory && JournalDates.inputDate(it.occurredAt, context.zone).startsWith(month) }
            if (collections.isEmpty()) FeatureNotice("No highlights chosen", "Choose a local care record or photo when you want to keep it here.", "heart")
            else if (collections.size == 1) FeatureNotice("One saved highlight", "This month stays short because only one item was chosen.", "heart", tone = "info")
            if (availableIds.isNotEmpty()) BarkButton("Choose highlights", { context.open(Feature.MemoryCollection, month) }, secondary = true, icon = "heart")
            collections.forEach { item ->
                val collection = item.data as CareItemData.Memory
                JournalCard {
                    collection.sourceIds.firstNotNullOfOrNull { id -> context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo }
                        ?.let { photo -> Column(Modifier.padding(3.dp).graphicsLayer { rotationZ = -2f }) { LocalPhoto(photo.fileId, photo.title, context.platform.device); CaptionText(photo.title, Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) } }
                    CaptionText("${JournalDates.dateLabel(JournalDates.day(item.occurredAt, context.zone))} · ${collection.sourceIds.size} linked records")
                    SectionTitle(collection.caption.ifBlank { "A collection to keep" })
                    val descriptions = collection.sourceIds.mapNotNull { id -> records.events.firstOrNull { it.id == id }?.let { event -> JournalReport.details(event.details).ifBlank { event.note.orEmpty() } } }.filter(String::isNotBlank)
                    if (descriptions.isNotEmpty()) SupportingText(descriptions.joinToString(" · "))
                    BarkButton("Open highlight", { context.open(Feature.MemoryHighlight, item.id) }, secondary = true)
                }
            }
            if (collections.isNotEmpty()) BarkButton("Export this month", { context.open(Feature.MemoryShare, month) }, icon = "send")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { BarkTextAction("Previous month", { month = first.minus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "arrow-left", leading = true); BarkTextAction("Next month", { month = first.plus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "arrow-right") }
        }
        Feature.MemoryCollection -> {
            val form = rememberFeatureForm(context, "memory-new-$month", mapOf("selected" to page.id.substringAfter('@', "").takeIf { it in availableIds }.orEmpty()))
            val selection = form["selected"].split(',').filter(String::isNotBlank).toSet()
            fun toggle(id: String, on: Boolean) {
                if (!on || selection.size < 100) form["selected"] = (if (on) selection + id else selection - id).joinToString(",")
            }
            JournalCard {
                CaptionText("${selection.size} selected · choose up to 100")
                records.events.take(100).forEach { event ->
                    FeatureToggle("${event.type.label} · ${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))}", JournalReport.details(event.details).ifBlank { event.note ?: "Recorded care moment" }, event.id in selection) { toggle(event.id, it) }
                }
                photos.take(100).forEach { item -> val photo = item.data as CareItemData.Photo
                    FeatureToggle(photo.title, "${photo.date} · photo", item.id in selection) { toggle(item.id, it) }
                }
            }
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Keep selected highlights", { scope.launch { form.attempt {
                require(selection.isNotEmpty()) { "Choose at least one saved moment." }
                require(selection.all { it in availableIds }) { "A source record changed. Choose the highlights again." }
                val latestSource = (records.events.filter { it.id in selection }.map { it.occurredAtMillis } + photos.filter { it.id in selection }.map { it.occurredAt }).maxOrNull() ?: JournalDates.dayBounds(first, context.zone).first.coerceAtLeast(0)
                val item = context.care.save(context.dog.id, form.requestId, latestSource, CareItemData.Memory(selection.toList(), form["caption"].trim()), draftSlot = form.slot)
                if (item != null) { form.completed = true; form.reset(context.platform.newId(), emptyMap()); context.navigation.replace(Feature.MemoryHighlight, item.id) }
            } } }, enabled = !context.saving && selection.isNotEmpty(), icon = "check")
        }
        Feature.MemoryHighlight, Feature.MemoryCaption -> {
            if (memory == null) { FeatureNotice("Collection unavailable", "The source journal records stay saved."); return }
            if (page.feature == Feature.MemoryCaption) {
                val form = rememberFeatureForm(context, "memory-caption-${saved.id}", mapOf("caption" to memory.caption))
                memory.sourceIds.firstNotNullOfOrNull { id -> context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo }
                    ?.let { LocalPhoto(it.fileId, it.title, context.platform.device) }
                val maximum = maxOf(240, memory.caption.length) // Never truncate a valid older caption.
                FeatureInput(form, "caption", "Highlight caption", !context.saving, multiline = true, max = maximum)
                CaptionText("${form["caption"].length} / $maximum · your words, separate from linked care facts")
                FeatureFormError(form)
                BarkButton(if (context.saving) "Saving…" else "Save caption", { scope.launch { form.attempt {
                    val updated = context.care.save(saved.dogId, saved.id, saved.occurredAt, memory.copy(caption = form["caption"].trim()), form.expectedRevision, draftSlot = form.slot)
                    if (updated != null) { form.completed = true; context.navigation.backGuard = null; context.navigation.backUnconditionally() }
                } } }, enabled = !context.saving, icon = "check")
            } else {
                JournalCard { CaptionText("LINKED RECORDS"); MemorySources(memory.sourceIds, sourceEvents, context, showPhotoImages = false) }
                BarkButton("Edit caption", { context.open(Feature.MemoryCaption, saved.id) }, secondary = true, icon = "pencil")
                BarkButton("Share this collection", { context.open(Feature.MemoryShare, saved.id) }, icon = "send")
            }
        }
        Feature.MemoryShare -> {
            val collections = if (saved != null) listOf(saved) else context.items.filter { it.data is CareItemData.Memory && JournalDates.inputDate(it.occurredAt, context.zone).startsWith(month) }
            val sources = collections.flatMap { (it.data as CareItemData.Memory).sourceIds }.distinct()
            var sharing by remember { mutableStateOf(false) }
            var shared by remember { mutableStateOf<String?>(null) }
            FeatureNotice("Native share sheet", "A local PDF of ${collections.size} selected highlights is handed to iOS or Android. Nothing is uploaded by BarkLog.", "smartphone")
            BarkButton(if (sharing) "Preparing PDF…" else "Open native share sheet", { scope.launch {
                sharing = true; shared = null
                try {
                    val events = sources.mapNotNull { id -> context.repository.observeEvent(context.dog.id, id).first() }
                    val lines = buildList {
                        add("${context.dog.name} · $month")
                        collections.forEach { item -> (item.data as CareItemData.Memory).caption.takeIf(String::isNotBlank)?.let(::add) }
                        sources.forEach { id ->
                            val event = events.firstOrNull { it.id == id }
                            val photo = context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo
                            when {
                                event != null -> { add("${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))} · ${event.type.label}"); add(JournalReport.details(event.details)); event.note?.let(::add) }
                                photo != null -> { add("${photo.title} · ${photo.date} · local photo reference"); if (photo.notes.isNotBlank()) add(photo.notes) }
                                else -> add("A selected source is no longer available. The caregiver caption is retained.")
                            }
                        }
                    }
                    val images = sources.mapNotNull { id ->
                        val event = events.firstOrNull { it.id == id }
                        val photo = context.items.firstOrNull { it.id == id }?.data as? CareItemData.Photo
                        photo?.let { ExportImage(it.fileId, "${it.title} · ${it.date}") } ?: event?.context?.photoId?.let { ExportImage(it, "${event.type.label} · ${JournalDates.dateLabel(JournalDates.day(event.occurredAtMillis, context.zone))}") }
                    }
                    shared = when (val result = context.platform.device.share(ExportDocument("BarkLog-memory-$month.pdf", ExportFormat.PDF, "BarkLog Memory Book", lines, images = images))) {
                        is DeviceResult.Success -> "PDF prepared. Keep a copy in your chosen destination."
                        DeviceResult.Cancelled -> "Sharing cancelled. Your collection stays saved."
                        DeviceResult.Denied -> "The destination wasn't available. Choose another destination."
                        is DeviceResult.Failed -> result.message
                    }
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { shared = "Couldn't prepare this PDF. Your highlights stay saved. Try again." }
                finally { sharing = false }
            } }, enabled = sources.isNotEmpty() && !sharing && !context.saving, icon = "send")
            shared?.let { FeatureNotice("Share status", it, "file-text") }
        }
        else -> error("Not a memory destination")
    }
    CaptionText("Every highlight comes from a saved record or photo. No medical story is inferred.")
}

@Composable
private fun MemorySources(ids: List<String>, events: List<CareEvent>, context: FeatureContext, showPhotoImages: Boolean = true) {
    ids.forEach { id ->
        val event = events.firstOrNull { it.id == id }
        val item = context.items.firstOrNull { it.id == id }
        val photo = item?.data as? CareItemData.Photo
        when {
            event != null -> TimelineRow(event, context.zone, includeDate = false, onClick = { context.navigation.detail(event.dogId, event.id) }, bordered = false)
            photo != null -> { if (showPhotoImages) LocalPhoto(photo.fileId, photo.title, context.platform.device); FeatureRow(photo.title, photo.date, "image", bordered = false) { context.open(Feature.PhotoDetail, item.id) } }
            else -> CaptionText("A selected source is no longer available. The caption stays saved.")
        }
    }
}
