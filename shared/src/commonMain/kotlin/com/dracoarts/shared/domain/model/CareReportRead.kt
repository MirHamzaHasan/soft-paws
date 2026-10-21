@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.domain.model

import com.dracoarts.shared.domain.repository.JournalRepository
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

/** Fresh reads never substitute the currently selected cat for a missing requested cat. */
suspend fun readCareReport(repository: JournalRepository, loadItems: suspend (String) -> List<CareItem>, request: CareReportScope, zone: TimeZone, preparedAt: Long): ReportSnapshot {
    request.validate()
    val cat = repository.observeDogs().first().firstOrNull { it.id == request.catId } ?: error("The selected cat is no longer available. Reopen report choices.")
    val from = LocalDate.parse(request.from); val through = LocalDate.parse(request.through)
    val start = from.atStartOfDayIn(zone).toEpochMilliseconds().coerceAtLeast(0)
    val end = through.plus(1, DateTimeUnit.DAY).atStartOfDayIn(zone).toEpochMilliseconds()
    val records = if (end > start) repository.observeTimeline(TimelineFilter(cat.id, fromMillis = start, untilMillis = end), Int.MAX_VALUE).first().events else emptyList()
    val items = loadItems(cat.id).filter { item ->
        item.dogId == cat.id && when (val data = item.data) {
            is CareItemData.Expense -> LocalDate.parse(data.date) in from..through
            is CareItemData.Medication -> !data.archived || item.occurredAt in start until end
            is CareItemData.Photo -> LocalDate.parse(data.date) in from..through
            is CareItemData.Vaccination -> item.occurredAt in start until end
            else -> false
        }
    }
    return ReportSnapshot(cat, from, through, zone, records, items, preparedAt, request.questions).including(ReportContent.decode(request.content))
}
