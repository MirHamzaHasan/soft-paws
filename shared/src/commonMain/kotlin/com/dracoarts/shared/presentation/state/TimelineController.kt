package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.TimelineFilter
import com.dracoarts.shared.domain.model.TimelinePage
import com.dracoarts.shared.domain.repository.JournalRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TimelineState(val loading: Boolean = true, val page: TimelinePage = TimelinePage(emptyList(), 0), val error: String? = null, val filter: TimelineFilter? = null)

class TimelineController(private val repository: JournalRepository) {
    private val _state = MutableStateFlow(TimelineState())
    val state = _state.asStateFlow()
    suspend fun observe(filter: TimelineFilter, limit: Int) {
        _state.value = TimelineState(filter = filter)
        try {
            repository.observeTimeline(filter, limit).collect { _state.value = TimelineState(loading = false, page = it, filter = filter) }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { _state.value = TimelineState(loading = false, error = "Couldn't load these records. Your journal hasn't been reset. Try again.", filter = filter) }
    }
}
