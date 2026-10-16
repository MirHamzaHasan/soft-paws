package com.dracoarts.shared.domain.model

data class TimelineFilter(val dogId: String, val type: CareEventType? = null, val fromMillis: Long? = null, val untilMillis: Long? = null) {
    fun validate() {
        require(dogId.isNotBlank()) { "Select a dog." }
        require(fromMillis == null || fromMillis >= 0) { "Invalid start date." }
        require(untilMillis == null || untilMillis >= 0) { "Invalid end date." }
        require(fromMillis == null || untilMillis == null || fromMillis < untilMillis) { "The end date must not precede the start date." }
    }
}
data class TimelinePage(val events: List<CareEvent>, val totalCount: Long)
data class JournalSummary(val recent: List<CareEvent>, val dailyCounts: Map<CareEventType, Int>, val totalCount: Long, val dayEvents: List<CareEvent> = emptyList())
class RecordConflictException : IllegalStateException("This record changed. Reopen it before editing or deleting.")
class RecordNotFoundException : IllegalStateException("This record is no longer available for this dog.")
