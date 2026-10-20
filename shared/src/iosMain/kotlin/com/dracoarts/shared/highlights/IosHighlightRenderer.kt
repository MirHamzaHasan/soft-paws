package com.dracoarts.shared.highlights

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlin.coroutines.resume

/** Swift owns AVFoundation frame/codec resources; callbacks return on the main queue. */
interface IosVideoEngine {
    fun start(draft: HighlightDraft, motion: Boolean, progress: (Float) -> Unit, finished: (String?, String?) -> Unit)
    fun cancel()
    fun cancelShare()
    fun share(filename: String, finished: (Boolean, String?) -> Unit)
}
class IosHighlightRenderer(private val engine: IosVideoEngine) : HighlightRenderer {
    override suspend fun render(draft: HighlightDraft, motion: Boolean, progress: (Float?) -> Unit): DeviceResult<HighlightOutput> = withContext(Dispatchers.Main) {
        draft.validate(forExport = true)
        val done = CompletableDeferred<Pair<String?, String?>>()
        val job = currentCoroutineContext()[Job]
        engine.start(draft, motion, { if (job?.isActive == true) progress(it) }) { filename, error -> done.complete(filename to error) }
        val (filename, error) = try { done.await() } catch (cancelled: CancellationException) {
            engine.cancel()
            withContext(NonCancellable) { withTimeoutOrNull(25_000) { done.await() } }
            throw cancelled
        }
        if (filename != null) DeviceResult.Success(HighlightOutput(filename, draft.aspect.width, draft.aspect.height, draft.clips.size * HighlightDraft.CLIP_MS))
        else DeviceResult.Failed(error ?: "Couldn't encode this film. Your draft stays saved.")
    }

    override suspend fun share(output: HighlightOutput): DeviceResult<Unit> = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { continuation ->
            engine.share(output.filename) { completed, error -> if (continuation.isActive) continuation.resume(when { error != null -> DeviceResult.Failed(error); completed -> DeviceResult.Success(Unit); else -> DeviceResult.Cancelled }) }
            continuation.invokeOnCancellation { engine.cancelShare() }
        }
    }
}
