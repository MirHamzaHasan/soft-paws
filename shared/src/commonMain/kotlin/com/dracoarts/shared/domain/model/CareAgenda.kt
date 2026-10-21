package com.dracoarts.shared.domain.model

import kotlinx.datetime.LocalDate

data class CareOccurrence(val item: CareItem, val date: LocalDate, val atMillis: Long, val completion: CareItem?)

/** Calendar dates follow each saved plan's zone; the UI labels that zone. */
object CareAgenda {
    fun day(catId: String, items: List<CareItem>, date: LocalDate): List<CareOccurrence> {
        val scoped = items.filter { it.dogId == catId }
        return scoped.mapNotNull { item ->
            val task = item.data as? CareItemData.Task ?: return@mapNotNull null
            if (!CareSchedule.occurs(task, date)) return@mapNotNull null
            val completion = scoped.firstOrNull {
                (it.data as? CareItemData.Completion)?.let { data -> data.taskId == item.id && data.dueDate == date.toString() } == true
            }
            CareOccurrence(item, date, CareSchedule.time(task, date), completion)
        }.sortedWith(compareBy<CareOccurrence> { it.completion != null }.thenBy { it.atMillis }.thenBy { it.item.id })
    }
}
