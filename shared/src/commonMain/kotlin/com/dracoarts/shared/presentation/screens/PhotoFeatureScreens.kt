package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.services.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDate
import kotlinx.serialization.json.Json

private val photoCategories = listOf("Everyday", "Coat", "Eyes", "Mobility", "Body shape", "Skin", "Paws", "Ears", "Teeth", "Other")
internal val catPhotoScreens = setOf(Feature.Photos, Feature.Baselines, Feature.PhotoForm, Feature.PhotoDetail)

@Composable
fun PhotoFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val selected = context.items.firstOrNull { it.id == page.id && it.data is CareItemData.Photo }
    when (page.feature) {
        Feature.Photos, Feature.Baselines -> PhotoLibrary(page.feature == Feature.Baselines, context)
        Feature.PhotoForm -> if (page.id == "picker") CatPhotoPicker(context) else CatPhotoEditor(page, selected, context, false)
        Feature.PhotoDetail -> CatPhotoEditor(page, selected, context, true)
        else -> error("Not a photo destination")
    }
}

@Composable
private fun PhotoLibrary(baseline: Boolean, context: FeatureContext) {
    var category by rememberSaveable(context.dog.id) { mutableStateOf("") }
    SoftPawsHeading(if (baseline) "Dated reference photos." else "Ordinary, lovely days.", "${context.dog.name}’s private photo journal", if (baseline) "reference photos." else "lovely days.")
    val all = context.items.filter { it.data is CareItemData.Photo }.sortedWith(compareByDescending<CareItem> { (it.data as CareItemData.Photo).date }.thenByDescending { it.createdAt })
    val photos = all.filter { val p = it.data as CareItemData.Photo; (!baseline || p.category != "Everyday") && (category.isBlank() || p.category == category) }
    if (baseline) {
        BoardSelect("Reference category", category, listOf("" to "All reference photos") + (photoCategories.filter { it != "Everyday" } + all.map { (it.data as CareItemData.Photo).category }.filter { it != "Everyday" }).distinct().map { it to it }) { category = it }
        CaptionText("Caregiver reference points. Soft Paws does not compare images or assess medical changes.")
    }
    if (photos.isEmpty()) SoftPawsCard("Their first moment") { SupportingText("A photo you choose will appear here. Its original stays in your library.") }
    photos.forEach { item ->
        val p = item.data as CareItemData.Photo
        SoftPawsList {
            LocalPhoto(p.fileId, p.title, context.platform.device, Modifier.clickable(role = Role.Button, onClickLabel = "Open photo", onClick = soundAction({ context.open(Feature.PhotoDetail, item.id) })))
            SoftPawsRow(p.title, JournalDates.dateLabel(LocalDate.parse(p.date)), "image") { context.open(Feature.PhotoDetail, item.id) }
        }
    }
    if (!baseline) SoftPawsRow("Reference photos", "Your entered categories and body areas", "image") { context.open(Feature.Baselines) }
    BoardStickyAction { BarkButton(if (baseline) "Add a reference photo" else "Add a photo", { context.open(Feature.PhotoForm, if (baseline) "baseline" else "picker") }) }
}

@Composable
private fun CatPhotoPicker(context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val form = rememberFeatureForm(context, "photo-new", emptyMap())
    var picking by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    fun choose() { scope.launch {
        picking = true
        try { when (val result = context.platform.device.pickPhoto()) {
            is DeviceResult.Success -> {
                form["file"] = result.value
                form.attempt {
                    context.care.saveDraft(context.dog.id, form.slot, LocalDraft(form.encode(), form.files()))
                    context.resetFeatureView(FeaturePage(Feature.PhotoForm, "draft"))
                    context.navigation.backGuard = null; context.navigation.replace(Feature.PhotoForm, "draft")
                }
            }
            DeviceResult.Cancelled -> message = "Selection cancelled. Your draft is still here."
            DeviceResult.Denied -> message = "This photo wasn't accessible. Your entries stay here."
            is DeviceResult.Failed -> message = result.message
        } } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { message = "Couldn't open the picker. Your entries stay here; try again." }
        finally { picking = false }
    } }
    SoftPawsHeading("One moment at a time.", "Choose only the photos you want to keep.", "at a time.")
    if (form["file"].isNotBlank()) LocalPhoto(form["file"], "Your retained photo draft", context.platform.device, height = 220.dp)
    else Box(Modifier.fillMaxWidth().height(90.dp), contentAlignment = Alignment.Center) { BarkIcon("image", Modifier.size(52.dp), boardColor("accent")) }
    SoftPawsCard(if (form["file"].isBlank()) "Choose one photo" else "Your photo draft is here") {
        SupportingText("The system picker lets you choose a photo without giving access to your whole library.")
    }
    CaptionText("Selected photos become private local copies. No automatic upload.")
    message?.let { ErrorText(it) }
    BoardStickyAction {
        FeatureFormError(form)
        if (form["file"].isNotBlank()) BarkButton("Continue photo draft", { context.resetFeatureView(FeaturePage(Feature.PhotoForm, "draft")); context.navigation.backGuard = null; context.navigation.replace(Feature.PhotoForm, "draft") }, enabled = !picking)
        BarkButton(if (picking) "Opening picker…" else "Choose a photo", ::choose, enabled = !picking, secondary = form["file"].isNotBlank())
        BarkTextAction("Cancel selection", context.navigation::back, enabled = !picking)
    }
}

private fun photoValues(data: CareItemData.Photo, selection: PhotoMemorySelection, bookId: String) = mapOf(
    "file" to data.fileId, "title" to data.title, "date" to data.date, "category" to data.category, "area" to data.bodyArea,
    "notes" to data.notes, "include" to selection.revisions.isNotEmpty().toString(),
    "_selection" to Json.encodeToString(PhotoMemorySelection.serializer(), selection), "_bookId" to bookId)

@Composable
private fun CatPhotoEditor(page: FeaturePage, selected: CareItem?, context: FeatureContext, detail: Boolean) {
    val scope = rememberCoroutineScope()
    val old = selected?.data as? CareItemData.Photo
    if ((detail || page.id.isNotBlank() && page.id !in setOf("baseline", "draft")) && old == null) { FeatureNotice("Photo unavailable", "Your other moments stay saved."); return }
    val defaults = old ?: CareItemData.Photo("", "", JournalDates.inputDate(context.now, context.zone), if (page.id == "baseline") "Skin" else "Everyday")
    val initialSelection = PhotoMemorySelection.capture(context.dog.id, selected?.id.orEmpty(), defaults.date.take(7), context.zone, context.items)
    val initial = photoValues(defaults, initialSelection, context.platform.newId())
    val slot = if (detail) "photo-caption-${selected!!.id}" else if (page.id == "draft") "photo-new" else "photo-${page.id}"
    val form = rememberFeatureForm(context, slot, initial)
    val photoId = selected?.id ?: form.requestId
    val selection = runCatching { Json.decodeFromString(PhotoMemorySelection.serializer(), form["_selection"]) }.getOrNull()
    val enteredDate = runCatching { LocalDate.parse(form["date"]) }.getOrNull()
    val month = enteredDate?.toString()?.take(7) ?: defaults.date.take(7)
    val monthName = LocalDate.parse("$month-01").month.name.lowercase().replaceFirstChar { it.uppercase() }
    val currentSelection = PhotoMemorySelection.capture(context.dog.id, photoId, month, context.zone, context.items)
    fun refreshSelection() {
        form["_selection"] = Json.encodeToString(PhotoMemorySelection.serializer(), currentSelection)
        form["include"] = currentSelection.revisions.isNotEmpty().toString()
    }
    // Restored drafts keep captured revisions; an entered-month change updates the choice.
    LaunchedEffect(month, enteredDate, selection?.month) { if (enteredDate != null && selection != null && selection.month != month) refreshSelection() }
    var removing by remember { mutableStateOf<CareItem?>(null) }
    if (form["file"].isNotBlank()) LocalPhoto(form["file"], form["title"].ifBlank { "Selected photo" }, context.platform.device, height = if (detail) 260.dp else 220.dp)
    if (detail) {
        SoftPawsSection(old!!.title)
        CaptionText("${JournalDates.dateLabel(LocalDate.parse(old.date))} · ${context.dog.name}")
    } else {
        SoftPawsHeading(if (old == null) "One moment, kept." else "A moment, with context.", "For ${context.dog.name}", if (old == null) "kept." else "with context.")
        PhotoPickerControl(context, form, "file", "Choose a photo", showPreview = false)
        BarkField("Name this moment", form["title"], { if (it.length <= 240) form["title"] = it }, Modifier.fillMaxWidth(), !context.saving, softPaws = true)
    }
    BarkField("Your caption", form["notes"], { if (it.length <= 2000) form["notes"] = it }, Modifier.fillMaxWidth(), !context.saving, multiline = true, softPaws = true)
    HealthCheck("Include in $monthName’s Memory Book", form["include"] == "true", !context.saving) { form["include"] = it.toString() }
    CaptionText("Your words and selections stay on this device.")
    if (!detail) {
        CareDateTimeField(form, "date", "Date · YYYY-MM-DD", context)
        BoardSelect("Reference category · optional", form["category"], (photoCategories + form["category"]).distinct().map { it to if (it == "Everyday") "No reference category" else it }, !context.saving) { form["category"] = it }
        BarkField("Body area · optional", form["area"], { if (it.length <= 120) form["area"] = it }, Modifier.fillMaxWidth(), !context.saving, softPaws = true)
    } else {
        if (old!!.category != "Everyday" || old.bodyArea.isNotBlank()) SoftPawsFact(old.category, old.bodyArea, "image")
        BarkTextAction("Edit photo details or replace image", { context.open(Feature.PhotoForm, selected!!.id) }, icon = "pencil")
        BarkTextAction("Delete photo reference", { removing = selected }, enabled = !context.saving, danger = true, icon = "trash")
    }
    val changedSelection = selection != currentSelection
    if (changedSelection) { ErrorText("Memory Book selections changed. Your caption draft is kept."); BarkTextAction("Refresh Memory Book selection", ::refreshSelection, enabled = !context.saving) }
    BoardStickyAction {
        FeatureFormError(form)
        if (form.error == null) context.careState.error?.let { ErrorCard(it) }
        BarkButton(if (context.saving) "Keeping on this device…" else if (detail) "Keep caption" else "Keep photo", { scope.launch { form.attempt {
            require(form["file"].isNotBlank()) { "Choose a photo before saving." }
            require(form["title"].isNotBlank()) { "Add a name for this moment." }
            val date = runCatching { LocalDate.parse(form["date"].trim()) }.getOrNull()
            require(date != null && form["date"].trim().length == 10) { "Enter the photo date as YYYY-MM-DD." }
            require(selection != null && selection == currentSelection) { "Refresh the Memory Book selection before saving. Your entries stay here." }
            val data = CareItemData.Photo(form["file"], form["title"].trim(), date.toString(), form["category"], form["area"].trim(), form["notes"].trim())
            val result = context.care.savePhotoAndMemory(context.dog.id, photoId, if (detail) selected!!.occurredAt else JournalDates.dayBounds(date, context.zone).first.coerceAtLeast(0),
                data, form.expectedRevision, selection, form["include"] == "true", form["_bookId"], form.slot)
            if (result != null) {
                if (detail) {
                    val all = context.items.filterNot { item -> result.collections.any { it.id == item.id } || item.id == result.photo.id } + result.collections + result.photo
                    val fresh = PhotoMemorySelection.capture(context.dog.id, photoId, month, context.zone, all)
                    form.reset(context.platform.newId(), photoValues(data, fresh, context.platform.newId()) + mapOf("_revision" to result.photo.revision.toString(), "_createdAt" to result.photo.occurredAt.toString())); form.completed = false
                } else { form.completed = true; context.showSavedFeature(Feature.PhotoDetail, result.photo.id) }
            }
        } } }, enabled = !context.saving)
        BarkTextAction("Back to photos", { context.navigation.returnTo(Feature.Photos) }, enabled = !context.saving)
    }
    removing?.let { captured -> ConfirmChange("Delete this photo reference?", context.careState.error ?: "Removes this private copy and journal reference. The original in your photo library stays there. Linked collection captions stay saved.", "Delete reference", context.saving, { removing = null }, keepLabel = "Keep photo") {
        scope.launch { if (context.care.delete(captured)) { removing = null; context.navigation.returnTo(Feature.Photos) } }
    } }
}

@Composable
fun PhotoPickerControl(context: FeatureContext, form: FeatureForm, key: String, label: String, showPreview: Boolean = true) {
    AttachmentPicker(context, form[key].takeIf { it.isNotBlank() }, { form[key] = it }, label, form["title"].ifBlank { "Selected local attachment" }, showPreview)
}

@Composable
fun AttachmentPicker(context: FeatureContext, fileId: String?, onPhoto: (String) -> Unit, label: String, description: String = "Selected local attachment", showPreview: Boolean = true) {
    val scope = rememberCoroutineScope()
    var picking by remember { mutableStateOf(false) }
    var message by rememberSaveable { mutableStateOf<String?>(null) }
    if (showPreview && fileId != null) LocalPhoto(fileId, description, context.platform.device)
    BarkButton(if (picking) "Opening photo picker…" else if (fileId == null) label else "Choose replacement", { scope.launch {
        picking = true
        try { when (val result = context.platform.device.pickPhoto()) {
            is DeviceResult.Success -> { onPhoto(result.value); message = null }
            DeviceResult.Cancelled -> message = "Selection cancelled. Your draft is still here."
            DeviceResult.Denied -> message = "This photo wasn't accessible. Choose another image; your draft stays here."
            is DeviceResult.Failed -> message = result.message
        } } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { message = "Couldn't open the photo picker. Your entries stay here; try again." }
        finally { picking = false }
    } }, enabled = !picking && !context.saving, secondary = true, icon = "image")
    message?.let { ErrorText(it) }
}
