package com.dracoarts.shared.services.ai

import com.dracoarts.shared.domain.model.LocalAttachmentRules
import com.dracoarts.shared.services.DeviceServices
import com.llamatik.library.platform.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import okio.Path.Companion.toPath
import kotlin.time.TimeSource

fun createGgufLocalAi(directory: String, device: DeviceServices, memoryBytes: Long, freeBytes: () -> Long, excludeBackup: () -> Unit = {}): LocalAi =
    GgufLocalAi(ModelStore(directory.toPath(), freeBytes, excludeBackup), device, memoryBytes)

/** Native llama.cpp is loaded only after an explicit question/caption action. */
class GgufLocalAi(private val store: ModelStore, private val device: DeviceServices, private val memoryBytes: Long,
    private val timing: (stage: String, millis: Long) -> Unit = { _, _ -> }) : LocalAi {
    private val status = MutableStateFlow(LocalAiState())
    override val state = status.asStateFlow()
    private val installation = Mutex()
    private val downloadJob = MutableStateFlow<Job?>(null)
    private val activeJob = MutableStateFlow<Job?>(null)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    init { scope.launch { device.foreground.collect { if (!it) activeJob.value?.cancel() } } }
    private fun update(kind: ModelKind, value: LocalModelStatus) { status.update { if (kind == ModelKind.Text) it.copy(text = value) else it.copy(photo = value) } }
    override suspend fun restore() = withContext(Dispatchers.Default) {
        installation.withLock {
            ModelCatalog.all.forEach { spec ->
                if (state.value.status(spec.kind).phase != "downloading") update(spec.kind, LocalModelStatus(
                    if (memoryBytes < minimumMemory(spec.kind)) "unsupported" else if (store.present(spec)) "downloaded" else "missing", downloaded = store.retainedBytes(spec), total = spec.bytes))
            }
        }
    }
    override suspend fun download(kind: ModelKind) = withContext(Dispatchers.Default) {
        if (!installation.tryLock()) throw AiException("Finish or cancel the current model download first.")
        downloadJob.value = currentCoroutineContext()[Job]
        val spec = ModelCatalog.spec(kind)
        try {
            if (memoryBytes < minimumMemory(kind)) throw AiException("This device has too little memory for this local model. BarkLog AI text fallback is available with your permission.")
            update(kind, LocalModelStatus("downloading", total = spec.bytes))
            store.install(spec) { update(kind, LocalModelStatus("downloading", it, spec.bytes)) }
            update(kind, LocalModelStatus("downloaded", spec.bytes, spec.bytes))
        } catch (cancelled: CancellationException) {
            update(kind, LocalModelStatus("missing", downloaded = store.retainedBytes(spec), total = spec.bytes, error = "Download cancelled. Tap Download to retry.")); throw cancelled
        } catch (cause: Exception) {
            update(kind, LocalModelStatus("missing", downloaded = store.retainedBytes(spec), total = spec.bytes, error = (cause as? AiException)?.message ?: "Couldn’t download the model. Check storage and connection, then retry."))
        } finally { downloadJob.value = null; installation.unlock() }
    }
    override fun cancelDownload() { downloadJob.value?.cancel() }
    override suspend fun remove(kind: ModelKind) = withContext(Dispatchers.Default) {
        activeJob.value?.cancelAndJoin()
        cancelDownload(); downloadJob.value?.join()
        runtimeLock.withLock { installation.withLock { store.remove(ModelCatalog.spec(kind)); update(kind, LocalModelStatus(total = ModelCatalog.spec(kind).bytes)) } }
    }
    override suspend fun answer(system: String, context: String, question: String): String {
        if (context.length + question.length > 12_000) throw LocalModelUnavailable()
        return run(ModelKind.Text) {
            LlamaBridge.updateGenerateParams(.2f, 512, .9f, 40, 1.1f, 4096, 2, true, false, 128, 0)
            measured("text.load") { if (!LlamaBridge.initGenerateModel(store.path(ModelCatalog.text.files.single()).toString())) throw LocalModelUnavailable() }
            currentCoroutineContext().ensureActive()
            measured("text.generate") { LlamaBridge.generateWithContext(system, context, question) }
        }
    }
    override suspend fun caption(photoId: String): String {
        require(LocalAttachmentRules.image.matches(photoId))
        val bytes = device.photoBytes(photoId) ?: throw AiException("This photo is no longer available on this phone.")
        if (bytes.size > 5_000_000) throw AiException("Choose a smaller photo for on-device description.")
        return run(ModelKind.Photo) {
            val files = ModelCatalog.photo.files
            if (!MultimodalBridge.initModel(store.path(files[0]).toString(), store.path(files[1]).toString())) throw LocalModelUnavailable()
            currentCoroutineContext().ensureActive()
            var description = ""; var failed = false
            // The bridge supplies the image marker. Finish the user's turn with
            // the pinned SmolVLM tokenizer's own end-of-turn/assistant prompt.
            MultimodalBridge.analyzeImageBytesStream(bytes,
                "Describe visible objects, colors and actions in one short sentence. Use only directly visible facts.<end_of_utterance>\nAssistant:", object : GenStream {
                    override fun onDelta(text: String) { description += text; if (description.length > 1500) { failed = true; MultimodalBridge.cancelAnalysis() } }
                    override fun onComplete() = Unit
                    override fun onError(message: String) { failed = true }
                })
            if (failed || description.isBlank() || Regex("\\b(?:unhealthy|healthy|sick|injur\\w*|wound\\w*|bleed\\w*|pain(?:ful)?|infection\\w*|disease\\w*|pregnant|depressed|anxious|anxiety)\\b", RegexOption.IGNORE_CASE).containsMatchIn(description)) throw AiException("Couldn’t create a scene-only caption. You can add your own words.")
            description
        }
    }
    private suspend fun run(kind: ModelKind, generate: suspend () -> String): String = coroutineScope {
        if (memoryBytes < minimumMemory(kind) || !store.present(ModelCatalog.spec(kind))) throw LocalModelUnavailable()
        if (!device.foreground.value) throw AiException("Open BarkLog to use the on-device model.")
        if (!runtimeLock.tryLock()) throw AiException("The on-device model is finishing another request. Try again.")
        activeJob.value = currentCoroutineContext()[Job]
        try {
            val worker = async(Dispatchers.Default) {
                try {
                    measured("${kind.name.lowercase()}.verify") { installation.withLock {
                        if (!ModelCatalog.spec(kind).files.all { store.verified(it) }) {
                            update(kind, LocalModelStatus("corrupt", downloaded = store.retainedBytes(ModelCatalog.spec(kind)), total = ModelCatalog.spec(kind).bytes, error = "The model changed or is incomplete. Remove it or retry the download.")); throw LocalModelUnavailable()
                        }
                    } }
                    currentCoroutineContext().ensureActive()
                    generate()
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (unavailable: LocalModelUnavailable) { throw unavailable }
                catch (cause: AiException) { throw cause }
                catch (_: Throwable) { throw LocalModelUnavailable() }
                finally { measured("${kind.name.lowercase()}.release") { runCatching { if (kind == ModelKind.Text) LlamaBridge.shutdown() else MultimodalBridge.release() } } }
            }
            try { withTimeout(90_000) { worker.await() } }
            catch (_: TimeoutCancellationException) {
                currentCoroutineContext().ensureActive()
                throw AiException("The local model took too long. Try a shorter question or fewer records.")
            }
            finally {
                if (!worker.isCompleted) {
                    runCatching { if (kind == ModelKind.Text) LlamaBridge.nativeCancelGenerate() else MultimodalBridge.cancelAnalysis() }
                    withContext(NonCancellable) { worker.cancelAndJoin() }
                }
            }
        } finally { activeJob.value = null; runtimeLock.unlock() }
    }
    override suspend fun close() { cancelDownload(); downloadJob.value?.join(); activeJob.value?.cancelAndJoin(); scope.cancel() }
    private inline fun <T> measured(stage: String, block: () -> T): T {
        val start = TimeSource.Monotonic.markNow()
        return try { block() } finally { timing(stage, start.elapsedNow().inWholeMilliseconds) }
    }
    companion object {
        private val runtimeLock = Mutex()
        private fun minimumMemory(kind: ModelKind) = if (kind == ModelKind.Text) 3_000_000_000L else 4_000_000_000L
    }
}
