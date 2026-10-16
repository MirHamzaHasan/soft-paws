package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.CareDetails
import com.dracoarts.shared.domain.model.CareEvent

/** A short factual row preview. The detail screen retains every field and the complete note. */
fun observationSummary(event: CareEvent): String {
    val detail = when (val value = event.details) {
        is CareDetails.Poop -> value.consistency?.label
        is CareDetails.Pee -> value.amount?.label?.let { "$it amount" }
        is CareDetails.Meal -> listOfNotNull(value.food, value.portion).joinToString(" · ")
        is CareDetails.Walk -> value.durationMinutes?.let { "$it minutes" }
        is CareDetails.Symptom -> value.observation
        is CareDetails.Behavior -> value.observation
        is CareDetails.Mood -> value.observedMood.label
        is CareDetails.Grooming -> value.activity.label
        is CareDetails.Weight -> "${value.amount} ${value.unit.label}"
        is CareDetails.Medication -> "${value.name} · ${value.amount} · recorded as given"
        is CareDetails.Training -> "${TrainingTitle(value.programId)} · ${value.seconds / 60} min · ${value.rating}"
        is CareDetails.Task -> "${value.title} · completed for ${value.dueDate}"
        null -> null
    }
    return listOfNotNull(detail?.takeIf(String::isNotBlank), event.note).joinToString(" · ").ifBlank { "No additional details recorded" }
}

private fun TrainingTitle(id: String) = com.dracoarts.shared.domain.model.TrainingCatalog.programs.firstOrNull { it.id == id }?.title ?: "Training"
