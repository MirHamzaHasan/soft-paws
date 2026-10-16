@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.domain.model

import kotlinx.datetime.*
import kotlin.time.Instant

object CareSchedule {
    /** Latest past calendar occurrence without a completion; no health inference. */
    fun latestUncompletedBefore(task: CareItemData.Task, before: LocalDate, completed: Set<String> = emptySet()): LocalDate? {
        val anchor = LocalDate.parse(task.date)
        fun previous(beforeDate: LocalDate): LocalDate? {
            if (beforeDate <= anchor) return null
            return when (task.repeat) {
                Repeat.None -> anchor
                Repeat.Daily -> beforeDate.minus(1, DateTimeUnit.DAY)
                Repeat.Weekly -> anchor.plus(((anchor.daysUntil(beforeDate) - 1) / 7) * 7, DateTimeUnit.DAY)
                Repeat.Monthly -> {
                    var month = LocalDate(beforeDate.year, beforeDate.month, 1)
                    if (beforeDate.day <= anchor.day) month = month.minus(1, DateTimeUnit.MONTH)
                    while (month.daysUntil(month.plus(1, DateTimeUnit.MONTH)) < anchor.day) month = month.minus(1, DateTimeUnit.MONTH)
                    LocalDate(month.year, month.month, anchor.day).takeIf { it >= anchor }
                }
            }
        }
        var date = previous(before)
        while (date != null && date.toString() in completed) date = previous(date)
        return date
    }

    fun upcoming(task: CareItemData.Task, after: Long, completed: Set<String> = emptySet(), limit: Int = 8): List<Long> {
        require(limit in 1..60)
        val result = mutableListOf<Long>(); var cursor = after
        repeat(limit) {
            val next = next(task, cursor, completed) ?: return result
            result += next.second; cursor = next.second
        }
        return result
    }
    fun occurs(task: CareItemData.Task, date: LocalDate): Boolean {
        val anchor = LocalDate.parse(task.date)
        if (date < anchor) return false
        return when (task.repeat) {
            Repeat.None -> date == anchor
            Repeat.Daily -> true
            Repeat.Weekly -> anchor.daysUntil(date) % 7 == 0
            Repeat.Monthly -> date.day == anchor.day
        }
    }
    fun time(task: CareItemData.Task, date: LocalDate): Long = LocalDateTime(date, LocalTime.parse(task.time)).toInstant(TimeZone.of(task.zoneId)).toEpochMilliseconds()
    fun next(task: CareItemData.Task, after: Long, completed: Set<String> = emptySet()): Pair<LocalDate, Long>? {
        val today = Instant.fromEpochMilliseconds(after).toLocalDateTime(TimeZone.of(task.zoneId)).date
        var date = maxOf(today, LocalDate.parse(task.date))
        repeat(370) {
            if (occurs(task, date) && date.toString() !in completed) {
                val time = time(task, date)
                if (time > after) return date to time
            }
            if (task.repeat == Repeat.None && date >= LocalDate.parse(task.date)) return null
            date = date.plus(1, DateTimeUnit.DAY)
        }
        return null
    }
}
