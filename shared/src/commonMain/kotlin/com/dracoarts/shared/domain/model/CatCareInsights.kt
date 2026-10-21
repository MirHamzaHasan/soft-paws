@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.domain.model

import kotlinx.datetime.*
import kotlin.time.Instant

/** Recorded observations only; legacy activity is never recategorized as cat play/litter. */
data class CatCareInsights(val days: List<LocalDate>, val meals: List<Int>, val counts: Map<CareEventType, Int>) {
    companion object {
        fun from(catId: String, from: LocalDate, through: LocalDate, events: List<CareEvent>, zone: TimeZone): CatCareInsights {
            require(through >= from && from.daysUntil(through) <= 366) { "Choose a range of up to one year." }
            val days = (0..from.daysUntil(through)).map { from.plus(it, DateTimeUnit.DAY) }
            val records = events.filter { it.dogId == catId && Instant.fromEpochMilliseconds(it.occurredAtMillis).toLocalDateTime(zone).date in from..through }
            val meals = records.filter { it.type == CareEventType.Meal }.groupingBy { Instant.fromEpochMilliseconds(it.occurredAtMillis).toLocalDateTime(zone).date }.eachCount()
            return CatCareInsights(days, days.map { meals[it] ?: 0 }, records.groupingBy { it.type }.eachCount())
        }
    }
}
