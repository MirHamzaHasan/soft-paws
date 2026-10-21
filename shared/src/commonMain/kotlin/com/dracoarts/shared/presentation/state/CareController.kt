package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.CareRepository
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.services.DeviceServices
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.sync.Mutex

data class CareState(val dogId: String = "", val loading: Boolean = true, val items: List<CareItem> = emptyList(), val saving: Boolean = false, val error: String? = null, val readFailed: Boolean = false, val feedback: String? = null)

class CareController(private val repository: CareRepository, private val haptics: HapticManager, private val device: DeviceServices? = null, private val onCommitted: () -> Unit = {}) {
    private val _state = MutableStateFlow(CareState())
    val state = _state.asStateFlow()
    private val writing = Mutex()
    private val reload = MutableStateFlow(0)
    private val cleaning = Mutex()

    suspend fun observe(dogId: String) {
        reload.collectLatest { read(dogId) }
    }
    fun retry() { reload.value++ }
    suspend fun items(dogId: String): List<CareItem> = repository.observeItems(dogId).first()
    fun notice(message: String) { _state.update { it.copy(feedback = message) } }
    private suspend fun read(dogId: String) {
        _state.value = CareState(dogId)
        try { repository.observeItems(dogId).collect { records -> _state.update { it.copy(loading = false, items = records, readFailed = false) } } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.update { it.copy(loading = false, readFailed = true, error = "Couldn't read these records. Your saved data hasn't been cleared. Try again.") } }
    }
    fun clearFeedback() { _state.update { it.copy(feedback = null) } }
    fun clearError() { if (!_state.value.readFailed) _state.update { it.copy(error = null) } }
    suspend fun loadDraft(dogId: String, slot: String) = repository.loadDraft(dogId, slot)
    suspend fun saveDraft(dogId: String, slot: String, draft: LocalDraft) = repository.saveDraft(dogId, slot, draft)
    suspend fun discardDraft(dogId: String, slot: String) = repository.discardDraft(dogId, slot)
    suspend fun processCleanup() {
        val native = device ?: return
        cleaning.lock()
        try {
            repository.pendingCleanup().forEach { job ->
                try {
                    when (job.kind) {
                        "photo" -> if (!repository.photoReferenced(job.reference)) native.removePhoto(job.reference)
                        "reminder" -> native.cancelReminder(job.reference)
                    }
                    repository.acknowledgeCleanup(job)
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { /* Retain the durable job for the next foreground/save. */ }
            }
        } finally { cleaning.unlock() }
    }
    suspend fun save(dogId: String, id: String, time: Long, data: CareItemData, revision: Long? = null, draftSlot: String? = null): CareItem? = write { repository.saveItem(dogId, id, time, data, revision, draftSlot) }
    suspend fun savePhotoAndMemory(dogId: String, id: String, time: Long, data: CareItemData.Photo, revision: Long?, selection: PhotoMemorySelection,
        included: Boolean, collectionId: String, draftSlot: String): PhotoMemoryResult? = write {
        repository.savePhotoAndMemory(dogId, id, time, data, revision, selection, included, collectionId, draftSlot).also { result ->
            val changed = listOf(result.photo) + result.collections
            _state.update { if (it.dogId == dogId) it.copy(items = (it.items.filterNot { old -> changed.any { saved -> saved.id == old.id } } + changed).sortedByDescending { item -> item.occurredAt }) else it }
        }
    }
    suspend fun activity(dogId: String, id: String, time: Long, data: CareItemData): CareItem? = write { repository.recordActivity(dogId, id, time, data) }
    suspend fun delete(item: CareItem): Boolean = write { repository.deleteItem(item); _state.update { it.copy(items = it.items.filterNot { record -> record.id == item.id }) }; true } == true
    suspend fun undoTaskCompletion(item: CareItem, expectedEventRevision: Long?): Boolean = write {
        repository.undoTaskCompletion(item, expectedEventRevision)
        _state.update { state -> if (state.dogId == item.dogId) state.copy(items = state.items.filterNot { it.id == item.id }) else state }
        true
    } == true
    suspend fun updateDog(dog: Dog, name: String, details: DogDetails, draftSlot: String? = null): Dog? = write { repository.updateDog(dog, name, details, draftSlot) }
    suspend fun deleteDog(id: String): Boolean = write { repository.deleteDog(id); true } == true
    suspend fun deleteAll(): Boolean = write { repository.deleteAll(); true } == true

    private suspend fun <T> write(block: suspend () -> T): T? {
        if (!writing.tryLock()) return null
        _state.update { it.copy(saving = true, error = null, feedback = null) }
        return try {
            val result = block()
            if (result is CareItem) _state.update { if (it.dogId == result.dogId) it.copy(items = (it.items.filterNot { item -> item.id == result.id } + result).sortedByDescending { item -> item.occurredAt }) else it }
            _state.update { it.copy(feedback = "Saved on this device") }
            runCatching { haptics.success() }
            runCatching { onCommitted() }
            result
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (cause: Exception) {
            _state.update { it.copy(error = when (cause) {
                is IllegalArgumentException -> cause.message ?: "Check the entered details."
                is RecordConflictException, is RecordNotFoundException -> "This record changed or was removed. Open it again before saving."
                else -> "Couldn't save this change. Your draft is still here. Please try again."
            }) }
            null
        } finally { _state.update { it.copy(saving = false) }; writing.unlock() }
    }
}
