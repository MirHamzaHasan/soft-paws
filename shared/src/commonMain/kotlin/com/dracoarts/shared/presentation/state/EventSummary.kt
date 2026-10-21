package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.CareDetails
import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType

/** Headings are saved facts or neutral descriptions; never an inferred health state. */
fun journalRecordTitle(event: CareEvent): String = event.context.observations["Title"]?.takeIf(String::isNotBlank) ?: when (val details = event.details) {
    is CareDetails.Note -> details.title ?: "One thing to remember."
    is CareDetails.Meal -> details.eaten?.let { "A meal, ${it.label.lowercase()}." } ?: "A meal, remembered."
    else -> when (event.type) {
        CareEventType.Litter -> "A little litter check."
        CareEventType.Play -> "A moment of play."
        CareEventType.Water -> "A water check."
        CareEventType.Sleep -> "A quiet stretch."
        CareEventType.Weight -> "A measured moment."
        else -> "${event.type.label}, remembered."
    }
}

/** A short factual row preview. The detail screen retains every field and the complete note. */
fun observationSummary(event: CareEvent): String {
    val detail = when (val value = event.details) {
        is CareDetails.Poop -> value.consistency?.label
        is CareDetails.Pee -> value.amount?.label?.let { "$it amount" }
        is CareDetails.Meal -> com.dracoarts.shared.domain.model.JournalReport.details(value)
        is CareDetails.Walk -> value.durationMinutes?.let { "$it minutes" }
        is CareDetails.Symptom -> value.observation
        is CareDetails.Behavior -> value.observation
        is CareDetails.Mood, is CareDetails.Grooming -> com.dracoarts.shared.domain.model.JournalReport.details(value)
        is CareDetails.Weight -> "${value.amount} ${value.unit.label}"
        is CareDetails.Medication -> listOf(value.name, value.amount, "recorded as given").filter(String::isNotBlank).joinToString(" · ")
        is CareDetails.Training -> "${TrainingTitle(value.programId)} · ${value.seconds / 60} min · ${value.rating}"
        is CareDetails.Task -> "${value.title} · completed for ${value.dueDate}"
        is CareDetails.Water, is CareDetails.Litter, is CareDetails.Play, is CareDetails.Sleep, is CareDetails.Note -> com.dracoarts.shared.domain.model.JournalReport.details(value)
        null -> null
    }
    return listOfNotNull(detail?.takeIf(String::isNotBlank), event.note).joinToString(" · ").ifBlank { "No additional details recorded" }
}

private fun TrainingTitle(id: String) = com.dracoarts.shared.domain.model.TrainingCatalog.programs.firstOrNull { it.id == id }?.title ?: "Training"
