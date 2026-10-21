package com.dracoarts.shared.domain.model

/** Explicit export choices, applied identically to preview, CSV and PDF. */
enum class ReportContent(val key: String, val label: String, val description: String) {
    Care("care", "Care logs", "Observations and notes"),
    Medication("medication", "Medication", "Recorded plans and administrations"),
    Vaccinations("vaccinations", "Vaccinations", "Caregiver-entered history"),
    Expenses("expenses", "Expenses", "Amounts, currency and dates"),
    Photos("photos", "Photos", "Local captions and references");

    companion object {
        val defaults = setOf(Care, Medication)
        fun decode(value: String): Set<ReportContent> = value.split(',').mapNotNull { key -> entries.firstOrNull { it.key == key } }.toSet()
        fun encode(value: Set<ReportContent>) = entries.filter { it in value }.joinToString(",") { it.key }
    }
}

fun ReportSnapshot.including(content: Set<ReportContent>): ReportSnapshot {
    require(content.isNotEmpty()) { "Choose at least one content type." }
    return copy(content = content, events = events.filter { if (it.type == CareEventType.Medication) ReportContent.Medication in content else ReportContent.Care in content },
        items = items.filter { item -> when (item.data) {
            is CareItemData.Medication, is CareItemData.Administration -> ReportContent.Medication in content
            is CareItemData.Vaccination -> ReportContent.Vaccinations in content
            is CareItemData.Expense -> ReportContent.Expenses in content
            is CareItemData.Photo -> ReportContent.Photos in content
            else -> false
        } })
}
