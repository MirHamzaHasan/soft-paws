package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.services.ai.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

@Composable internal fun LocalModelControls(controller: CompanionController) {
    val models by controller.localAi.state.collectAsState()
    val scope = rememberCoroutineScope()
    var removing by remember { mutableStateOf<ModelKind?>(null) }
    LaunchedEffect(controller) { controller.prepareModels() }
    Text("On this phone", style = MaterialTheme.typography.titleLarge)
    if (controller.demoResponses) CaptionText("This design-review fixture uses demo replies. Open the normal app to use downloaded models.")
    CaptionText("Optional downloads from Hugging Face. No dog records or photos are sent to download a model. Choose Wi-Fi if you prefer.")
    ModelCatalog.all.forEach { spec ->
        val status = models.status(spec.kind)
        val downloading = status.phase == "downloading"
        val anotherDownload = models.text.phase == "downloading" || models.photo.phase == "downloading"
        JournalCard {
            Text(if (spec.kind == ModelKind.Text) "Text answers" else "Photo descriptions", style = MaterialTheme.typography.titleMedium)
            CaptionText("${spec.title} · ${spec.sizeLabel} · Apache 2.0")
            when (status.phase) {
                "downloaded" -> CaptionText("Downloaded · checked again before use. AI drafts can be wrong; review before keeping them.")
                "unsupported" -> CaptionText("This host has too little memory or no native model runtime. BarkLog AI can answer text with your permission.")
                "downloading" -> {
                    val progress = if (status.total > 0) (status.downloaded.toFloat() / status.total).coerceIn(0f, 1f) else 0f
                    LinearProgressIndicator(progress = { progress }, modifier = Modifier.fillMaxWidth())
                    CaptionText(if (status.downloaded == status.total) "Verifying download…" else "Downloading · ${(progress * 100).toInt()}%")
                }
                else -> CaptionText(if (spec.kind == ModelKind.Text) "Answer using a model on this phone, including offline." else "Describe visible scenes locally. No health assessment or photo upload.")
            }
            status.error?.let { ErrorCard(it) }
            when {
                downloading -> BarkButton("Cancel download", { controller.localAi.cancelDownload() }, secondary = true)
                status.phase == "downloaded" -> BarkTextAction("Remove ${if (spec.kind == ModelKind.Text) "text" else "photo"} model", { removing = spec.kind }, danger = true)
                else -> {
                    BarkButton("Download · ${spec.sizeLabel}", { scope.launch {
                        try { controller.localAi.download(spec.kind) }
                        catch (cancelled: CancellationException) { throw cancelled }
                        catch (cause: AiException) { controller.setError(cause.message ?: "Couldn't start the model download.") }
                        catch (_: Exception) { controller.setError("Couldn't start the model download. Try again.") }
                    } }, enabled = !anotherDownload && status.phase != "unsupported", secondary = true)
                    if (status.downloaded > 0) BarkTextAction("Remove download files", { removing = spec.kind }, danger = true)
                }
            }
        }
    }
    removing?.let { kind ->
        CDialog("Remove this model?", { removing = null }, actions = {
            BarkButton("Keep model", { removing = null })
            BarkTextAction("Remove model", { removing = null; scope.launch {
                try { controller.localAi.remove(kind) }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { controller.setError("Couldn't remove the model. Try again.") }
            } }, danger = true)
        }) { CaptionText("Your care records, photos and conversations stay. You can download the model again.") }
    }
}
