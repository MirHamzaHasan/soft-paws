@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.plus
import kotlinx.datetime.toInstant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Instant

/** Calendar grouping uses a timezone, not a fixed 24-hour window (including DST). */
object JournalDates {
    fun dayBounds(date: LocalDate, zone: TimeZone): Pair<Long, Long> =
        date.atStartOfDayIn(zone).toEpochMilliseconds() to date.plus(1, DateTimeUnit.DAY).atStartOfDayIn(zone).toEpochMilliseconds()
    fun dateAndTime(millis: Long, zone: TimeZone): String = "${dateLabel(day(millis, zone))} · ${inputTime(millis, zone)}"
    fun inputDate(millis: Long, zone: TimeZone) = day(millis, zone).toString()
    fun inputTime(millis: Long, zone: TimeZone): String {
        val time = Instant.fromEpochMilliseconds(millis).toLocalDateTime(zone).time
        return "${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}"
    }
    fun parseInput(date: String, time: String, zone: TimeZone, originalMillis: Long): Long {
        if (date == inputDate(originalMillis, zone) && time == inputTime(originalMillis, zone)) return originalMillis
        require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(date) && Regex("\\d{2}:\\d{2}").matches(time)) { "Use YYYY-MM-DD for date and HH:mm (24-hour) for time." }
        val local = try { LocalDateTime.parse("${date}T$time") } catch (_: IllegalArgumentException) { throw IllegalArgumentException("Enter a valid date and time.") }
        val instant = local.toInstant(zone)
        require(instant.toLocalDateTime(zone) == local) { "That time does not exist in this timezone. Choose another time." }
        return instant.toEpochMilliseconds()
    }
    fun day(millis: Long, zone: TimeZone): LocalDate = Instant.fromEpochMilliseconds(millis).toLocalDateTime(zone).date
    fun dailyCounts(events: List<CareEvent>, nowMillis: Long, zone: TimeZone): Map<CareEventType, Int> {
        val today = day(nowMillis, zone)
        return events.filter { day(it.occurredAtMillis, zone) == today }.groupingBy { it.type }.eachCount()
    }
    fun groups(events: List<CareEvent>, zone: TimeZone): Map<LocalDate, List<CareEvent>> =
        events.groupBy { day(it.occurredAtMillis, zone) }

    fun dateLabel(date: LocalDate): String = "${date.day} ${date.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${date.year}"
    fun headingDate(date: LocalDate): String = "${date.dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() }}, ${date.day} ${date.month.name.lowercase().replaceFirstChar { it.uppercase() }}"
    fun timeLabel(millis: Long, zone: TimeZone): String {
        val time = Instant.fromEpochMilliseconds(millis).toLocalDateTime(zone).time
        val hour = when (time.hour % 12) { 0 -> 12; else -> time.hour % 12 }
        return "$hour:${time.minute.toString().padStart(2, '0')} ${if (time.hour < 12) "AM" else "PM"}"
    }
}
