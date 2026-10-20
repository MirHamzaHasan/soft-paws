package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*

/** Bounded current-dog facts for local inference; never an Atlas sharing choice. */
internal fun localDogRecords(dogId: String, question: String, events: List<CareEvent>): List<SourceRecord> {
    val terms = question.lowercase()
    val relevant = when {
        Regex("walk|exercise|activity").containsMatchIn(terms) -> setOf(CareEventType.Walk)
        Regex("food|meal|eat|diet").containsMatchIn(terms) -> setOf(CareEventType.Meal)
        Regex("poop|stool").containsMatchIn(terms) -> setOf(CareEventType.Poop)
        Regex("pee|urin").containsMatchIn(terms) -> setOf(CareEventType.Pee)
        Regex("weight").containsMatchIn(terms) -> setOf(CareEventType.Weight)
        else -> emptySet()
    }
    return events.filter { it.dogId == dogId }.distinctBy { it.id }
        .sortedWith(compareByDescending<CareEvent> { it.type in relevant }.thenByDescending { it.occurredAtMillis })
        .take(12).map { event ->
            // Factual structured care data matters even when the note is empty.
            val detail = when (val value = event.details) {
                is CareDetails.Medication -> "${value.name} · recorded as given" // No dose instruction in model context.
                else -> JournalReport.details(value)
            }
            val summary = listOf(detail.take(100), event.note.orEmpty().take(120),
                event.context.observations.entries.take(2).joinToString("; ") { "${it.key}: ${it.value}" }.take(80))
                .filter(String::isNotBlank).joinToString(" · ").take(240)
            SourceRecord(event.id, dogId, event.type.label, event.occurredAtMillis, summary)
        }
}

internal fun sourceRecord(event: CareEvent): SourceRecord {
    val detail = when (val value = event.details) {
        is CareDetails.Medication -> "${value.name} · recorded as given"
        else -> JournalReport.details(value)
    }
    return SourceRecord(event.id, event.dogId, event.type.label, event.occurredAtMillis,
        listOf(detail.take(100), event.note.orEmpty().take(120), event.context.observations.entries.take(2)
            .joinToString("; ") { "${it.key}: ${it.value}" }.take(80)).filter(String::isNotBlank).joinToString(" · ").take(240))
}
