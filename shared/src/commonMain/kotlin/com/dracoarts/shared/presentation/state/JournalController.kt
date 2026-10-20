package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.domain.model.Dog
import com.dracoarts.shared.domain.model.DogDetails
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.domain.repository.DraftSource
import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.managers.StorageManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext

data class JournalState(
    val loading: Boolean = true,
    val dogs: List<Dog> = emptyList(),
    val selectedDogId: String? = null,
    val events: List<CareEvent> = emptyList(),
    val saving: Boolean = false,
    val error: String? = null,
    val feedback: String? = null,
    val readFailed: Boolean = false,
    val dailyCounts: Map<CareEventType, Int> = emptyMap(),
    val totalCount: Long = 0,
    val lastSaved: CareEvent? = null,
    val quickUndo: CareEvent? = null,
    val dayEvents: List<CareEvent> = emptyList(),
) {
    val selectedDog: Dog? get() = dogs.firstOrNull { it.id == selectedDogId }
}

/** Coordinates the first caregiver loop. UI drafts are saveable, records live only in SQLite. */
class JournalController(
    private val repository: JournalRepository,
    private val preferences: StorageManager,
    private val haptics: HapticManager,
    private val nowMillis: () -> Long,
    private val timeZone: () -> kotlinx.datetime.TimeZone,
    private val onCommitted: () -> Unit = {},
) {
    constructor(repository: JournalRepository, preferences: StorageManager, haptics: HapticManager, nowMillis: () -> Long) :
        this(repository, preferences, haptics, nowMillis, { kotlinx.datetime.TimeZone.currentSystemDefault() })
    private val _state = MutableStateFlow(JournalState())
    val state = _state.asStateFlow()
    private val saving = Mutex()
    private val selection = MutableStateFlow<String?>(null)

    suspend fun observe(fromMillis: Long = 0, untilMillis: Long = Long.MAX_VALUE) {
        _state.update { it.copy(loading = true, error = null, readFailed = false) }
        try {
            val preferred = withContext(Dispatchers.Default) { runCatching { preferences.getString(SELECTED_DOG_KEY) }.getOrNull() }
            repository.observeDogs().combine(selection) { dogs, requested -> dogs to requested }.collectLatest { (dogs, requested) ->
                val selected = dogs.firstOrNull { it.id == requested }
                    ?: dogs.firstOrNull { it.id == _state.value.selectedDogId }
                    ?: dogs.firstOrNull { it.id == preferred } ?: dogs.firstOrNull()
                _state.update { it.copy(dogs = dogs, selectedDogId = selected?.id, events = emptyList(), dayEvents = emptyList(), dailyCounts = emptyMap(), totalCount = 0, loading = selected != null,
                    lastSaved = it.lastSaved?.takeIf { saved -> saved.dogId == selected?.id }, quickUndo = it.quickUndo?.takeIf { saved -> saved.dogId == selected?.id }) }
                if (selected != null) {
                    repository.observeSummary(selected.id, fromMillis, untilMillis).collect { summary ->
                        _state.update { if (it.selectedDogId == selected.id) it.copy(events = summary.recent, dailyCounts = summary.dailyCounts, totalCount = summary.totalCount, dayEvents = summary.dayEvents, loading = false) else it }
                    }
                }
            }
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            _state.update { it.copy(loading = false, readFailed = true, error = "Couldn't read your journal. Your records haven't been deleted. Try again.") }
        }
    }

    suspend fun addDog(name: String, details: DogDetails = DogDetails(), requestId: String? = null, draftSource: DraftSource? = null) = save("Couldn't save your dog. Your name is still here—please try again.") {
        val dog = repository.addDog(name, details, requestId, draftSource)
        // Selection failure must not misrepresent an already committed dog as an unsuccessful save.
        withContext(Dispatchers.Default) { runCatching { preferences.setString(SELECTED_DOG_KEY, dog.id) } }
        _state.update { it.copy(dogs = it.dogs.filterNot { saved -> saved.id == dog.id } + dog, selectedDogId = dog.id, events = emptyList(), dayEvents = emptyList(), dailyCounts = emptyMap(), totalCount = 0, loading = true, feedback = "${dog.name}'s journal is ready.") }
        selection.value = dog.id
    }

    suspend fun quickLog(type: CareEventType) {
        val dogId = _state.value.selectedDogId ?: return
        require(type in CareEventType.quickActions)
        save("Couldn't save this ${type.label.lowercase()} log. Please try again.") {
            val event = repository.logEvent(dogId, type, nowMillis())
            _state.update { it.copy(feedback = "${type.label} logged at ${JournalDates.inputTime(event.occurredAtMillis, timeZone())}", lastSaved = event, quickUndo = event) }
        }
    }

    suspend fun selectDog(id: String): Boolean {
        // A committed profile can arrive before the long-lived UI observer refreshes.
        val dogs = try { repository.observeDogs().first() }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) {
            _state.update { it.copy(error = "Couldn't open this dog's journal. Your saved records stay here. Try again.") }
            return false
        }
        if (dogs.none { it.id == id }) {
            _state.update { it.copy(error = "This dog is no longer available. Choose another dog.") }
            return false
        }
        _state.update {
            if (it.selectedDogId == id) it.copy(dogs = dogs, error = null)
            else it.copy(dogs = dogs, selectedDogId = id, events = emptyList(), dayEvents = emptyList(), dailyCounts = emptyMap(), totalCount = 0, loading = true, error = null, feedback = null, lastSaved = null, quickUndo = null)
        }
        selection.value = id
        withContext(Dispatchers.Default) { runCatching { preferences.setString(SELECTED_DOG_KEY, id) } }
        return true
    }

    fun recordSaved(event: CareEvent) { _state.update { it.copy(lastSaved = event) } }
    fun setupPreferencesNotSaved() { _state.update { it.copy(error = "Journal saved. Couldn't save Home shortcuts. You can try again in Settings.") } }
    fun consumedReaction(id: String) { _state.update { if (it.lastSaved?.id == id) it.copy(lastSaved = null) else it } }
    suspend fun undoQuickLog() {
        val record = _state.value.quickUndo ?: return
        save("Couldn't remove this record. It stays in your journal. Please try again.") {
            repository.deleteEvent(record.dogId, record.id, record.revision)
            _state.update { it.copy(quickUndo = null, lastSaved = it.lastSaved?.takeUnless { saved -> saved.id == record.id }, feedback = "${record.type.label} removed") }
        }
    }

    fun clearFeedback() { _state.update { it.copy(feedback = null, quickUndo = null) } }

    private suspend fun save(failureMessage: String, block: suspend () -> Unit) {
        if (!saving.tryLock()) return
        _state.update { it.copy(saving = true, error = null, feedback = null) }
        try {
            block()
            runCatching { haptics.success() }
            runCatching { onCommitted() }
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (_: Exception) {
            _state.update { it.copy(error = failureMessage) }
        } finally {
            _state.update { it.copy(saving = false) }
            saving.unlock()
        }
    }

    companion object { const val SELECTED_DOG_KEY = "selected_dog_id" }
}
