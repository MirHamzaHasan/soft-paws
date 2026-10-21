package com.dracoarts.shared.domain.model

import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Instant

/** Reuses calendar arithmetic for actual saved reminder choices; never parses clinical text. */
object CareReminderSchedule {
    /** Suppress an alarm left over from an edited time, including legacy alarms. */
    @OptIn(kotlin.time.ExperimentalTime::class)
    fun shouldDeliver(task: CareItemData.Task, now: Long, scheduledAt: Long?): Boolean {
        if (!task.remind) return false
        val date = Instant.fromEpochMilliseconds(now).toLocalDateTime(TimeZone.of(task.zoneId)).date
        if (!CareSchedule.occurs(task, date)) return false
        val due = CareSchedule.time(task, date)
        return now >= due && (scheduledAt == null || scheduledAt == due)
    }

    fun task(data: CareItemData): CareItemData.Task? = when (data) {
        is CareItemData.Task -> data.takeIf { it.remind }
        is CareItemData.Medication -> data.reminder?.takeUnless { data.archived }?.let {
            CareItemData.Task(data.name, data.startDate, it.time, it.zoneId,
                category = "Medication", repeat = it.repeat, remind = true)
        }
        else -> null
    }

    fun completed(item: CareItem, items: List<CareItem>): Set<String> =
        if (item.data is CareItemData.Task) items.mapNotNull {
            (it.data as? CareItemData.Completion)?.takeIf { completion -> completion.taskId == item.id }?.dueDate
        }.toSet() else emptySet()
    // An administration is a factual record, not proof that a chosen reminder was fulfilled.
}
