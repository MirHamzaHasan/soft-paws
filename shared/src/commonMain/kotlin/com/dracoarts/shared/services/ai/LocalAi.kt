package com.dracoarts.shared.services.ai

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

enum class ModelKind { Text, Photo }
data class LocalModelStatus(val phase: String = "missing", val downloaded: Long = 0, val total: Long = 0, val error: String? = null)
data class LocalAiState(val text: LocalModelStatus = LocalModelStatus(), val photo: LocalModelStatus = LocalModelStatus()) {
    fun status(kind: ModelKind) = if (kind == ModelKind.Text) text else photo
}
class LocalModelUnavailable : Exception()
interface LocalAi {
    val state: StateFlow<LocalAiState>
    suspend fun restore()
    suspend fun download(kind: ModelKind)
    fun cancelDownload()
    suspend fun remove(kind: ModelKind)
    suspend fun answer(system: String, context: String, question: String): String
    suspend fun caption(photoId: String): String
    suspend fun close()
}
/** Review/test hosts have no model binaries. This never produces a pretend answer. */
object UnavailableLocalAi : LocalAi {
    override val state = MutableStateFlow(LocalAiState(LocalModelStatus("unsupported"), LocalModelStatus("unsupported")))
    override suspend fun restore() = Unit
    override suspend fun download(kind: ModelKind) { throw AiException("On-device models aren’t supported in this host.") }
    override fun cancelDownload() = Unit
    override suspend fun remove(kind: ModelKind) = Unit
    override suspend fun answer(system: String, context: String, question: String): String = throw LocalModelUnavailable()
    override suspend fun caption(photoId: String): String = throw LocalModelUnavailable()
    override suspend fun close() = Unit
}
