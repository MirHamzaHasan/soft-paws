package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventInput
import com.dracoarts.shared.domain.model.RecordConflictException
import com.dracoarts.shared.domain.model.RecordNotFoundException
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.managers.HapticManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.sync.Mutex

data class EventState(val record: CareEvent? = null, val reading: Boolean = true, val readError: Boolean = false, val saving: Boolean = false, val error: String? = null, val conflict: Boolean = false)

class EventController(private val repository: JournalRepository, private val haptics: HapticManager, private val onCreated: (CareEvent) -> Unit = {}) {
    private val _state = MutableStateFlow(EventState())
    val state = _state.asStateFlow()
    private val writing = Mutex()

    suspend fun observe(dogId: String, eventId: String) {
        _state.value = EventState()
        try {
            repository.observeEvent(dogId, eventId).collect { event -> _state.update { it.copy(record = event, reading = false, readError = false) } }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.update { it.copy(reading = false, readError = true, error = "Couldn't read this record. Your journal hasn't been reset. Try again.") } }
    }

    fun clearError() { _state.update { it.copy(error = null, conflict = false) } }
    suspend fun create(dogId: String, requestId: String, input: CareEventInput): CareEvent? = write { repository.createEvent(dogId, requestId, input).also(onCreated) }
    suspend fun update(record: CareEvent, input: CareEventInput): CareEvent? = write { repository.updateEvent(record.dogId, record.id, record.revision, input) }
    suspend fun delete(record: CareEvent): Boolean = write("Couldn't delete this record. It hasn't been removed. Please try again.") { repository.deleteEvent(record.dogId, record.id, record.revision); true } ?: false

    private suspend fun <T> write(failureMessage: String = "Couldn't save this change. Your draft is still here. Please try again.", operation: suspend () -> T): T? {
        if (!writing.tryLock()) return null
        _state.update { it.copy(saving = true, error = null, conflict = false) }
        return try {
            val result = operation()
            runCatching { haptics.success() }
            result
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (cause: Exception) {
            val message = when (cause) {
                is RecordConflictException, is RecordNotFoundException -> cause.message
                is IllegalArgumentException -> cause.message
                else -> failureMessage
            }
            _state.update { it.copy(error = message, conflict = cause is RecordConflictException || cause is RecordNotFoundException) }
            null
        } finally { _state.update { it.copy(saving = false) }; writing.unlock() }
    }
}
