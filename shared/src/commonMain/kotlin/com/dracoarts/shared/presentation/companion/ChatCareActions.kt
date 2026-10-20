package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.services.*
import com.dracoarts.shared.presentation.theme.boardColor
import kotlinx.coroutines.*

@Composable internal fun ChatPhoto(id: String, device: DeviceServices, modifier: Modifier = Modifier, description: String = "Attached caregiver photo") {
    var image by remember(id) { mutableStateOf<ImageBitmap?>(null) }
    var loaded by remember(id) { mutableStateOf(false) }
    LaunchedEffect(id) {
        image = try { withContext(Dispatchers.Default) { device.photoBytes(id)?.let { decodeHighlightPhoto(it, 720) } } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { null }
        loaded = true
    }
    Surface(modifier.clip(RoundedCornerShape(14.dp)), color = boardColor("inset")) {
        Box(contentAlignment = Alignment.Center) {
            image?.let { Image(it, description, Modifier.fillMaxSize(), contentScale = ContentScale.Fit) }
                ?: if (loaded) Text("Photo unavailable", Modifier.padding(8.dp), style = MaterialTheme.typography.bodySmall) else CircularProgressIndicator(Modifier.size(20.dp))
        }
    }
}

@Composable internal fun ChatVetContacts(dog: Dog, platform: AppPlatform, onDismiss: () -> Unit, onEdit: () -> Unit) {
    var error by remember { mutableStateOf<String?>(null) }
    CDialog("Call your vet", onDismiss, actions = {
        if (dog.details.vetPhone.isNotBlank()) BarkButton("Call ${dog.details.vetName.ifBlank { "my vet" }}", { if (!platform.device.dial(dog.details.vetPhone)) error = "Calling isn't available here. Use the saved number from your phone." }, icon = "phone")
        if (dog.details.emergencyPhone.isNotBlank()) BarkButton("Call emergency clinic", { if (!platform.device.dial(dog.details.emergencyPhone)) error = "Calling isn't available here. Use the saved number from your phone." }, icon = "phone", secondary = true)
        BarkTextAction("Add or edit vet contacts", onEdit)
        BarkTextAction("Back to chat", onDismiss)
    }) {
        Text("For urgent concerns, contact a veterinarian or emergency veterinary clinic. Don’t wait for an AI reply.")
        if (dog.details.vetPhone.isNotBlank()) Text("${dog.details.vetName.ifBlank { "Your vet" }} · ${dog.details.vetPhone}")
        if (dog.details.emergencyPhone.isNotBlank()) Text("${dog.details.emergencyServiceName.ifBlank { "Emergency clinic" }} · ${dog.details.emergencyPhone}")
        if (dog.details.vetPhone.isBlank() && dog.details.emergencyPhone.isBlank()) CaptionText("No vet number is saved. Contact a local emergency veterinary clinic directly if help is urgent; you can save its number here later.")
        error?.let { ErrorCard(it) }
    }
}

@Composable internal fun ChatReportDialog(controller: CompanionController, dog: Dog, records: List<CareEvent>, platform: AppPlatform, onDismiss: () -> Unit, chooseContext: () -> Unit) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf(state.workspace.profileConsent) }
    var conversation by remember { mutableStateOf(false) }
    var photos by remember { mutableStateOf(false) }
    var preparing by remember { mutableStateOf(false) }
    var output by remember { mutableStateOf<PreparedExport?>(null) }
    var status by remember { mutableStateOf<String?>(null) }
    val events = if (state.workspace.recordConsent) records.filter { it.id in state.workspace.selectedRecords }.take(50) else emptyList()
    val messages = state.workspace.thread?.messages.orEmpty()
    val document = remember(dog, profile, conversation, photos, events, messages) { chatVetReport(dog, profile, events, messages, conversation, photos, platform.timeZone(), "BarkLog-vet-${platform.newId()}.pdf") }
    LaunchedEffect(document) { output = null; status = null }
    CDialog("A report for your vet", { if (!preparing) onDismiss() }, actions = {
        BarkButton(if (preparing) "Preparing PDF…" else if (output == null) "Download PDF · Premium" else "Save or share PDF", {
            if (!controller.requestPremium(PremiumFeature.ReportPdf)) return@BarkButton
            scope.launch {
                preparing = true; status = null
                try {
                    val ready = output
                    val result = if (ready == null) platform.device.prepareExport(document) else platform.device.sharePrepared(ready)
                    when (result) {
                        is DeviceResult.Success -> { if (ready == null) output = result.value as PreparedExport; status = if (ready == null) "PDF ready. Choose where to save or share it." else "PDF handed to your chosen destination." }
                        DeviceResult.Cancelled -> status = "Sharing cancelled. Your report preview stays here."
                        DeviceResult.Denied -> status = "That destination wasn't available. Choose another."
                        is DeviceResult.Failed -> status = result.message
                    }
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { status = "Couldn't prepare this report. Your records and chat stay saved." }
                finally { preparing = false }
            }
        }, enabled = !preparing, icon = if (output == null) "download" else "send")
        BarkTextAction("Back to chat", onDismiss, enabled = !preparing)
    }) {
        CaptionText("Mobile preview free · PDF export with Premium")
        CaptionText("Your messages are included as caregiver observations. AI replies and photos are optional.")
        CCheck("Include dog profile", profile, enabled = !preparing) { profile = it }
        CCheck("Include AI replies · unverified", conversation, enabled = !preparing) { conversation = it }
        if (messages.any { it.photoIds.isNotEmpty() }) CCheck("Include recent caregiver photos · up to 12", photos, enabled = !preparing) { photos = it }
        BarkTextAction("Choose journal records (${events.size})", chooseContext, enabled = !preparing, icon = "notebook-pen", leading = true)
        document.lines.forEach { Text(it, style = MaterialTheme.typography.bodySmall) }
        document.images.forEach { ChatPhoto(it.fileId, platform.device, Modifier.fillMaxWidth().height(150.dp), it.caption) }
        status?.let { Text(it) }
    }
}
