package com.dracoarts.shared.services

import com.dracoarts.shared.domain.model.HighlightDraft

data class HighlightOutput(val filename: String, val width: Int, val height: Int, val durationMs: Long)

/** On-device encoding; no encoder or model starts during journal startup. */
interface HighlightRenderer {
    suspend fun render(draft: HighlightDraft, motion: Boolean, progress: (Float?) -> Unit): DeviceResult<HighlightOutput>
    suspend fun share(output: HighlightOutput): DeviceResult<Unit>
}
object UnavailableHighlightRenderer : HighlightRenderer {
    override suspend fun render(draft: HighlightDraft, motion: Boolean, progress: (Float?) -> Unit) = DeviceResult.Failed("Video export isn't available in this host.")
    override suspend fun share(output: HighlightOutput) = DeviceResult.Failed("Video sharing isn't available in this host.")
}
