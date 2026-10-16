package com.dracoarts.shared.domain.model

/** Stable values for the future SQL schema and exports; labels are presentation defaults. */
enum class CareEventType(val key: String, val label: String) {
    Poop("poop", "Poop"), Pee("pee", "Pee"), Meal("meal", "Meal"), Walk("walk", "Walk"),
    Medication("medication", "Medication"), Symptom("symptom", "Symptom"),
    Mood("mood", "Mood"), Behavior("behavior", "Behavior"),
    Grooming("grooming", "Grooming"), Weight("weight", "Weight"), Training("training", "Training"), Task("task", "Care task");

    companion object {
        val quickActions = listOf(Poop, Pee, Meal, Walk)
        fun fromKey(key: String): CareEventType? = entries.firstOrNull { it.key == key }
    }
}
