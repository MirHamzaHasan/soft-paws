package com.dracoarts.shared.domain.model

/** Stable values for the future SQL schema and exports; labels are presentation defaults. */
enum class CareEventType(val key: String, val label: String) {
    Poop("poop", "Poop"), Pee("pee", "Pee"), Meal("meal", "Meal"), Walk("walk", "Walk"),
    Medication("medication", "Medication"), Symptom("symptom", "Symptom"),
    Mood("mood", "Mood"), Behavior("behavior", "Behavior"),
    Grooming("grooming", "Grooming"), Weight("weight", "Weight"), Training("training", "Training"), Task("task", "Care task"),
    Water("water", "Water"), Litter("litter", "Litter"), Play("play", "Play & movement"),
    Sleep("sleep", "Sleep"), Note("note", "A little note");

    companion object {
        /** Legacy detail-free API. Retained for old records and callers, never relabelled. */
        val quickActions = listOf(Poop, Pee, Meal, Walk)
        val catQuickActions = listOf(Meal, Litter, Play, Note)
        val catJournalTypes = listOf(Meal, Water, Litter, Play, Sleep, Mood, Grooming, Weight, Note)
        fun fromKey(key: String): CareEventType? = entries.firstOrNull { it.key == key }
    }
}
