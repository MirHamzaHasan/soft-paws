@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.domain.model

import kotlinx.datetime.*
import kotlin.time.Instant

data class WalkTrendBucket(val from: LocalDate, val through: LocalDate, val minutes: Long, val recordedDurations: Int)
data class RecordedWalkTrend(val from: LocalDate, val through: LocalDate, val buckets: List<WalkTrendBucket>, val walksWithoutDuration: Int) {
    val minutes get() = buckets.sumOf { it.minutes }
    companion object {
        /** Read measured durations only. Free text and a missing log never become estimated activity. */
        fun from(events: List<CareEvent>, through: LocalDate, days: Int, zone: TimeZone): RecordedWalkTrend {
            require(days in listOf(7, 30, 90))
            val first = through.minus(days - 1, DateTimeUnit.DAY)
            val bounds = mutableListOf<Pair<LocalDate, LocalDate>>()
            var cursor = first
            while (cursor <= through) {
                val last = when (days) { 7 -> cursor; 30 -> if (bounds.size == 3) through else minOf(through, cursor.plus(6, DateTimeUnit.DAY)); else -> minOf(through, LocalDate(cursor.year, cursor.month, 1).plus(1, DateTimeUnit.MONTH).minus(1, DateTimeUnit.DAY)) }
                bounds += cursor to last; cursor = last.plus(1, DateTimeUnit.DAY)
            }
            val walks = events.filter { it.type == CareEventType.Walk }.map { event -> event to Instant.fromEpochMilliseconds(event.occurredAtMillis).toLocalDateTime(zone).date }.filter { (_, date) -> date in first..through }
            val buckets = bounds.map { (from, until) -> val typed = walks.filter { (_, date) -> date in from..until }.mapNotNull { (event, _) -> (event.details as? CareDetails.Walk)?.durationMinutes }; WalkTrendBucket(from, until, typed.sumOf(Int::toLong), typed.size) }
            return RecordedWalkTrend(first, through, buckets, walks.count { (event, _) -> (event.details as? CareDetails.Walk)?.durationMinutes == null })
        }
    }
}
