package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.clickable
import androidx.compose.ui.semantics.Role
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDate

private val photoCategories = listOf("Everyday", "Coat", "Eyes", "Mobility", "Body shape", "Skin", "Paws", "Ears", "Teeth", "Other")

@Composable
fun PhotoFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val selected = context.items.firstOrNull { it.id == page.id }
    when (page.feature) {
        Feature.Photos, Feature.Baselines -> {
            val baseline = page.feature == Feature.Baselines
            var category by rememberSaveable { mutableStateOf("") }
            ScreenHeading(if (baseline) "Baselines" else "Photo journal", "${context.dog.name} · ${if (baseline) "caregiver categories" else "local moments"}")
            if (!baseline) BarkButton("Add a photo", { context.open(Feature.PhotoForm, "picker") }, icon = "image")
            else {
                FeatureNotice("Photos are reference points", "BarkLog does not compare images or detect changes.", "image")
                BoardMenu { photoCategories.filter { it != "Everyday" }.forEach { value -> val count = context.items.count { (it.data as? CareItemData.Photo)?.category == value }; FeatureRow(value, if (count == 0) "No photos" else "$count dated ${if (count == 1) "photo" else "photos"}", "image", meta = if (count == 0) "Empty" else "View", tone = "photo") { category = value } } }
                BarkButton("Add a baseline", { context.open(Feature.PhotoForm, "baseline") }, secondary = true, icon = "plus")
            }
            val photos = context.items.filter { (it.data as? CareItemData.Photo)?.let { data -> (!baseline || data.category != "Everyday") && (category.isBlank() || data.category == category) } == true }
            if (photos.isEmpty()) FeatureNotice("No photos here yet", "Choose a photo to keep a dated reference. Nothing is uploaded.", "image")
            val shown = if (baseline && category.isBlank()) emptyList() else photos
            shown.firstOrNull()?.let { item -> PhotoGridCard(item, context) }
            shown.drop(1).chunked(2).forEach { pair -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { pair.forEach { item -> Box(Modifier.weight(1f)) { PhotoGridCard(item, context) } }; if (pair.size == 1) Spacer(Modifier.weight(1f)) } }
            if (!baseline) BarkTextAction("View baselines", { context.open(Feature.Baselines) }, icon = "arrow-right")
            CaptionText("References only. BarkLog does not compare photos or assess medical changes.")
        }
        Feature.PhotoForm -> {
            val old = selected?.data as? CareItemData.Photo
            if (page.id.isNotBlank() && page.id !in setOf("baseline", "picker", "draft") && old == null) { FeatureNotice("Photo unavailable", "Your other records stay saved."); return }
            val initial = mapOf("file" to old?.fileId.orEmpty(), "title" to old?.title.orEmpty(), "date" to (old?.date ?: JournalDates.inputDate(context.now, context.zone)), "category" to (old?.category ?: if (page.id == "baseline") "Skin" else "Everyday"), "area" to old?.bodyArea.orEmpty(), "notes" to old?.notes.orEmpty())
            val form = rememberFeatureForm(context, if (page.id in setOf("picker", "draft")) "photo-new" else "photo-${page.id}", initial)
            if (page.id == "picker") {
                var picking by remember { mutableStateOf(false) }
                var result by remember { mutableStateOf<DeviceResult<String>?>(null) }
                val pick = { scope.launch {
                    picking = true
                    try { when (val selectedPhoto = context.platform.device.pickPhoto()) {
                        is DeviceResult.Success -> { form["file"] = selectedPhoto.value; form.attempt { context.care.saveDraft(context.dog.id, form.slot, com.dracoarts.shared.domain.repository.LocalDraft(form.encode(), form.files())); context.navigation.backGuard = null; context.navigation.replace(Feature.PhotoForm, "draft") } }
                        else -> result = selectedPhoto
                    } } finally { picking = false }
                }; Unit }
                when (val status = result) {
                    DeviceResult.Denied -> { FeatureNotice("Photo access not granted", "No photo entry was created. Care records and the rest of the journal still work.", "shield", tone = "warn"); BarkButton("Try the system picker again", pick, enabled = !picking, icon = "image"); BarkButton("Continue without a photo", context.navigation::back, secondary = true) }
                    DeviceResult.Cancelled, is DeviceResult.Failed -> { FeatureNotice("No photo was added", if (status is DeviceResult.Failed) status.message else "The picker was cancelled or did not provide a file.", "image"); BarkButton("Choose a photo", pick, enabled = !picking, icon = "image"); BarkButton("Return to journal", context.navigation::back, secondary = true) }
                    else -> { ScreenHeading("Choose a photo", "Continue in the operating system."); BoardHandoff("image", "Native photo picker", "Select one photo. The picker decides which items BarkLog can access.", if (picking) "Opening platform picker…" else "Open platform picker", !picking) { pick() }; BarkButton("Cancel", context.navigation::back, secondary = true) }
                }
                FeatureFormError(form)
                CaptionText("BarkLog does not request broad photo-library access. Nothing is uploaded.")
                return
            }
            ScreenHeading(if (old == null) "Add photo details" else "Edit photo details", "Describe what you want to remember.")
            PhotoPickerControl(context, form, "file", "Choose photo")
            FeatureInput(form, "date", "Date · YYYY-MM-DD", !context.saving, max = 10)
            FeatureInput(form, "title", "Caption", !context.saving, max = 240)
            BoardSelect("Baseline category · optional", form["category"], photoCategories.map { it to if (it == "Everyday") "No baseline" else it }, !context.saving) { form["category"] = it }
            FeatureInput(form, "area", "Body area · optional", !context.saving, max = 120)
            FeatureInput(form, "notes", "Notes · optional", !context.saving, multiline = true)
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Save photo entry", { scope.launch { form.attempt {
                require(form["file"].isNotBlank()) { "Choose a photo before saving." }
                val time = JournalDates.dayBounds(LocalDate.parse(form["date"]), context.zone).first.coerceAtLeast(0)
                val data = CareItemData.Photo(form["file"], form["title"].trim(), form["date"], form["category"], form["area"].trim(), form["notes"].trim())
                val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, time, data, form.expectedRevision, draftSlot = form.slot).also { if (it != null) form.completed = true }
                if (saved != null) { if (old == null) form.reset(context.platform.newId(), initial); context.navigation.replace(Feature.PhotoDetail, saved.id) }
            } } }, enabled = !context.saving, icon = "check")
            CaptionText("The selected photo is copied into private local storage. Cancelling the picker keeps your draft.")
        }
        Feature.PhotoDetail -> {
            val photo = selected?.data as? CareItemData.Photo
            if (photo == null) { FeatureNotice("Photo unavailable", "It may have been removed. Other records remain saved."); return }
            var confirm by remember { mutableStateOf(false) }
            var missing by remember(photo.fileId) { mutableStateOf(false) }
            if (missing) { FeatureNotice("Photo file not available", "Its caption and date remain in the journal.", "image", tone = "warn"); JournalCard { CaptionText("SAVED METADATA"); SectionTitle(photo.title); CaptionText("${photo.date} · local entry") }; BarkButton("Choose a replacement", { context.open(Feature.PhotoForm, selected.id) }, secondary = true, icon = "image"); return }
            LocalPhoto(photo.fileId, photo.title, context.platform.device, onUnavailable = { missing = true })
            ScreenHeading(photo.title, "${photo.date} · ${JournalDates.inputTime(selected.occurredAt, context.zone)}")
            JournalCard { CaptionText("CATEGORY"); Text(if (photo.category == "Everyday") "Photo journal · no baseline category" else photo.category); if (photo.bodyArea.isNotBlank()) SupportingText("Body area: ${photo.bodyArea}"); if (photo.notes.isNotBlank()) Text(photo.notes) }
            BarkButton("Edit details", { context.open(Feature.PhotoForm, selected.id) }, secondary = true, icon = "pencil")
            BarkTextAction("Add to Memory Book", { context.open(Feature.MemoryCollection, "${photo.date.take(7)}@${selected.id}") }, icon = "heart")
            BarkTextAction("Delete photo reference", { confirm = true }, enabled = !context.saving, danger = true, icon = "trash")
            if (confirm) ConfirmChange("Delete this photo reference?", "Removes this local reference and its private copy. The original in your photo library stays there.", "Delete reference", context.saving, { confirm = false }) {
                scope.launch { if (context.care.delete(selected)) context.navigation.back() }
            }
        }
        else -> error("Not a photo destination")
    }
}

@Composable
fun PhotoPickerControl(context: FeatureContext, form: FeatureForm, key: String, label: String) {
    AttachmentPicker(context, form[key].takeIf { it.isNotBlank() }, { form[key] = it }, label, form["title"].ifBlank { "Selected local attachment" })
}

@Composable
fun AttachmentPicker(context: FeatureContext, fileId: String?, onPhoto: (String) -> Unit, label: String, description: String = "Selected local attachment") {
    val scope = rememberCoroutineScope()
    var picking by remember { mutableStateOf(false) }
    var message by rememberSaveable { mutableStateOf<String?>(null) }
    if (fileId != null) LocalPhoto(fileId, description, context.platform.device)
    BarkButton(if (picking) "Opening photo picker…" else if (fileId == null) label else "Choose replacement", { scope.launch {
        picking = true
        try {
            when (val result = context.platform.device.pickPhoto()) {
                is DeviceResult.Success -> { onPhoto(result.value); message = null }
                DeviceResult.Cancelled -> message = "Selection cancelled. Your draft is still here."
                DeviceResult.Denied -> message = "This photo wasn't accessible. Choose another image; your draft stays here."
                is DeviceResult.Failed -> message = result.message
            }
        } finally { picking = false }
    } }, enabled = !picking && !context.saving, secondary = true, icon = "image")
    message?.let { CaptionText(it) }
}

@Composable
private fun PhotoGridCard(item: CareItem, context: FeatureContext) {
    val photo = item.data as CareItemData.Photo
    Surface(Modifier.fillMaxWidth().clickable(role = Role.Button, onClickLabel = "Open ${photo.title}") { context.open(Feature.PhotoDetail, item.id) }, shape = androidx.compose.foundation.shape.RoundedCornerShape(24.dp), color = MaterialTheme.colorScheme.surface) {
        Column {
            LocalPhoto(photo.fileId, photo.title, context.platform.device)
            CaptionText(photo.title, Modifier.padding(horizontal = 12.dp, vertical = 10.dp))
        }
    }
}
