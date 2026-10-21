package com.dracoarts.shared.domain.model

import kotlinx.datetime.LocalDate

/** Entered dates determine the month; currencies are never converted or combined. */
data class RecordedExpenses(val items: List<CareItem>, val totals: Map<String, Long?>) {
    companion object {
        fun read(catId: String, month: LocalDate, source: List<CareItem>, category: String = ""): RecordedExpenses {
            val items = source.filter { item ->
                val cost = item.data as? CareItemData.Expense ?: return@filter false
                val date = LocalDate.parse(cost.date)
                item.dogId == catId && date.year == month.year && date.month == month.month && (category.isBlank() || cost.category == category)
            }.sortedWith(compareByDescending<CareItem> { (it.data as CareItemData.Expense).date }.thenByDescending { it.createdAt }.thenBy { it.id })
            val totals = items.map { it.data as CareItemData.Expense }.groupBy { it.currency }.entries.sortedBy { it.key }.associate { (currency, costs) -> currency to
                costs.fold<CareItemData.Expense, Long?>(0L) { total, cost ->
                    if (total == null || cost.minorUnits > Long.MAX_VALUE - total) null else total + cost.minorUnits
                }
            }
            return RecordedExpenses(items, totals)
        }
    }
}

object CatExpenseCategories {
    val suggested = listOf("Food & treats", "Litter", "Vet & care", "Other")
    /** Preserve historical/custom values, including retained drafts. */
    fun choices(source: List<CareItem>, current: String = "") =
        (suggested + listOf("Medication", "Grooming", "Supplies") + source.mapNotNull { (it.data as? CareItemData.Expense)?.category }.sorted() + listOf(current))
            .filter(String::isNotBlank).distinct()
}
