package com.dracoarts.shared.presentation.highlights

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/** Draft photo references commit atomically in SQLite's existing draft table. */
data class HighlightState(
    val draft: HighlightDraft? = null, val loading: Boolean = true, val saving: Boolean = false,
    val rendering: Boolean = false, val sharing: Boolean = false, val progress: Float? = null,
    val output: HighlightOutput? = null, val error: String? = null, val message: String? = null,
)
class HighlightController(
    private val repository: CareRepository, private val renderer: HighlightRenderer,
    private val premium: () -> Boolean, dispatcher: CoroutineDispatcher = Dispatchers.Main,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val scope = CoroutineScope(SupervisorJob() + dispatcher)
    private val lock = Mutex()
    private var renderJob: Job? = null
    private val _state = MutableStateFlow(HighlightState())
    val state = _state.asStateFlow()

    suspend fun open(dogId: String) = lock.withLock {
        if (_state.value.draft?.dogId == dogId && !_state.value.loading) return@withLock
        renderJob?.cancelAndJoin(); renderJob = null
        _state.value = HighlightState()
        try {
            val saved = repository.loadDraft(dogId, HighlightDraft.SLOT)
            val draft = saved?.let { json.decodeFromString<HighlightDraft>(it.value) } ?: HighlightDraft(dogId)
            require(draft.dogId == dogId); draft.validate()
            _state.value = HighlightState(draft, loading = false)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.value = HighlightState(loading = false, error = "Couldn't read your saved film. Try opening it again.") }
    }
    suspend fun edit(dogId: String, change: (HighlightDraft) -> HighlightDraft): Boolean = lock.withLock {
        val current = _state.value
        val draft = current.draft ?: return@withLock false
        if (draft.dogId != dogId || current.rendering || current.sharing) return@withLock false
        _state.value = current.copy(saving = true, error = null, message = null)
        try {
            val next = change(draft).copy(dogId = dogId, revision = draft.revision + 1)
            next.validate()
            repository.saveDraft(dogId, HighlightDraft.SLOT, LocalDraft(json.encodeToString(next), next.clips.map { it.photoId }))
            _state.value = _state.value.copy(draft = next, saving = false, output = null)
            true
        } catch (cancelled: CancellationException) { _state.update { it.copy(saving = false) }; throw cancelled }
        catch (cause: Exception) { _state.update { it.copy(saving = false, error = if (cause is IllegalArgumentException) cause.message else "Couldn't save this edit. Your last saved film is still here.") }; false }
    }
    fun change(dogId: String, change: (HighlightDraft) -> HighlightDraft) { scope.launch { edit(dogId, change) } }
    suspend fun importPhoto(dogId: String, device: DeviceServices) {
        var imported: String? = null
        try {
            when (val result = device.pickPhoto()) {
                is DeviceResult.Success -> { imported = result.value; edit(dogId) { it.copy(clips = it.clips + HighlightClip(result.value)) } }
                DeviceResult.Cancelled -> Unit
                DeviceResult.Denied -> error("Photo access wasn't available. Choose a photo again when you're ready.")
                is DeviceResult.Failed -> error(result.message)
            }
        } finally {
            imported?.let { id -> withContext(NonCancellable) { if (!repository.photoReferenced(id)) device.removePhoto(id) } }
        }
    }
    fun message(text: String?) { _state.update { it.copy(message = text) } }
    fun error(text: String) { _state.update { it.copy(error = text) } }
    /** Returns false at the Premium boundary, before any encoder/file work. */
    fun export(reducedMotion: Boolean): Boolean {
        if (!premium()) return false
        val current = _state.value
        if (current.loading || current.saving || current.rendering || current.sharing) return true
        val draft = current.draft ?: return true
        try { draft.validate(forExport = true) } catch (e: IllegalArgumentException) { error(e.message!!); return true }
        _state.update { it.copy(rendering = true, progress = null, output = null, error = null, message = null) }
        renderJob = scope.launch {
            try {
                when (val result = renderer.render(draft, !reducedMotion) { value -> _state.update { it.copy(progress = value?.coerceIn(0f, .99f)) } }) {
                    is DeviceResult.Success -> _state.update { it.copy(output = result.value, message = "Your MP4 is ready. Choose where to keep or share it.") }
                    is DeviceResult.Failed -> error(result.message)
                    DeviceResult.Cancelled -> message("Export cancelled. Your film draft stays saved.")
                    DeviceResult.Denied -> error("These photos couldn't be opened. Choose them again.")
                }
            } catch (cancelled: CancellationException) { message("Export stopped. Your film draft stays saved."); throw cancelled }
            catch (_: Exception) { error("Couldn't create this video. Your film draft stays saved. Try again.") }
            finally { _state.update { it.copy(rendering = false, progress = null) } }
        }
        return true
    }
    fun cancelExport() { renderJob?.cancel() }
    suspend fun awaitExport() { renderJob?.join() }
    suspend fun share(): Boolean {
        if (!premium()) return false
        val current = _state.value
        val output = current.output ?: return true
        if (current.rendering || current.sharing) return true
        _state.update { it.copy(sharing = true, error = null, message = null) }
        try {
            when (val result = renderer.share(output)) {
                is DeviceResult.Success -> message("Sharing opened. Your MP4 is still ready on this device.")
                DeviceResult.Cancelled -> message("Sharing cancelled. Your video is still ready.")
                DeviceResult.Denied -> error("That destination wasn't available. Choose another.")
                is DeviceResult.Failed -> error(result.message)
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error("Couldn't open sharing. Your video is still ready.") }
        finally { _state.update { it.copy(sharing = false) } }
        return true
    }
    suspend fun close() { scope.coroutineContext[Job]?.cancelAndJoin() }
}
