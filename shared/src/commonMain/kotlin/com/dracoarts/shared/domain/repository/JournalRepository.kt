package com.dracoarts.shared.domain.repository

import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.domain.model.Dog
import com.dracoarts.shared.domain.model.DogDetails
import com.dracoarts.shared.domain.model.CareEventInput
import com.dracoarts.shared.domain.model.TimelineFilter
import com.dracoarts.shared.domain.model.TimelinePage
import com.dracoarts.shared.domain.model.JournalSummary
import com.dracoarts.shared.domain.model.CareWindowSummary
import kotlinx.coroutines.flow.Flow

/**
 * Contract for task002/task003. No fake or preference-backed care store is wired.
 * Implementations must commit writes before returning or emitting changed records.
 */
interface JournalRepository {
    fun observeDogs(): Flow<List<Dog>>
    fun observeEvents(dogId: String): Flow<List<CareEvent>>
    fun observeEvent(dogId: String, eventId: String): Flow<CareEvent?>
    fun observeTimeline(filter: TimelineFilter, limit: Int = 50): Flow<TimelinePage>
    fun observeMatchingEvents(filter: TimelineFilter, terms: List<String>, limit: Int = 24): Flow<List<CareEvent>>
    /** Exact aggregates and bounded recent rows, in one local read transaction. */
    fun observeCareWindow(dogId: String, fromMillis: Long, untilMillis: Long): Flow<CareWindowSummary>
    /** A fresh, dog-isolated snapshot: exact counts plus bounded note excerpts. */
    suspend fun readCareWeek(dogId: String, dayStarts: List<Long>, untilMillis: Long, focus: CareEventType?): com.dracoarts.shared.domain.model.CareWeekSnapshot = error("Weekly context isn't available in this host.")
    fun observeSummary(dogId: String, fromMillis: Long, untilMillis: Long): Flow<JournalSummary>
    suspend fun addDog(name: String, details: DogDetails = DogDetails(), requestId: String? = null, draftSource: DraftSource? = null): Dog
    suspend fun logEvent(dogId: String, type: CareEventType, occurredAtMillis: Long, note: String? = null): CareEvent
    /** A saveable request ID makes a retry of the same committed draft idempotent. */
    suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent
    suspend fun updateEvent(dogId: String, eventId: String, expectedRevision: Long, input: CareEventInput): CareEvent
    suspend fun deleteEvent(dogId: String, eventId: String, expectedRevision: Long)
}
