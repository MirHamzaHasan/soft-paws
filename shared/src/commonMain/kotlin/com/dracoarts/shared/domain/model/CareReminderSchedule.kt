package com.dracoarts.shared.domain.model

/** Reuses calendar arithmetic for actual saved reminder choices; never parses clinical text. */
object CareReminderSchedule {
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
