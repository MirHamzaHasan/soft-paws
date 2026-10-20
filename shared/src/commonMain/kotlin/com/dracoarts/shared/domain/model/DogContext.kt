package com.dracoarts.shared.domain.model

import kotlinx.serialization.Serializable
import kotlinx.datetime.LocalDate

/** Caregiver-provided facts. Empty/unknown is never inferred to mean healthy. */
@Serializable
data class DogContext(
    val stage: String = "Adult", val years: String = "", val months: String = "", val birthday: String = "",
    val breeds: List<String> = emptyList(), val neutered: String = "Not sure", val size: String = "Not sure",
    val weight: String = "", val weightUnit: String = "kg", val experience: String = "Some experience",
    val goals: List<String> = listOf("Remember daily care"), val routines: List<String> = listOf("Morning & evening"),
    val topics: List<String> = listOf("Daily routines"), val traits: List<String> = emptyList(),
    val activities: List<String> = emptyList(), val foods: List<String> = emptyList(),
    val allergies: String = "", val conditions: String = "", val medications: String = "", val careNotes: String = "",
    val reminderDays: List<Int> = (1..7).toList(), val reminderTime: String = "19:00",
    val notifications: Boolean = false, val dailyReminder: Boolean = true, val taskReminders: Boolean = false, val medicationReminders: Boolean = false,
    val lifestyle: String = "Not sure",
) {
    companion object {
        /** New cat setup starts with unknown facts; serialized legacy defaults stay compatible. */
        fun catDefaults() = DogContext(stage = "Not sure", experience = "Not sure", goals = emptyList(), routines = emptyList(), topics = emptyList())
    }
    fun validate() {
        // Puppy is a legacy fact; accept it without reclassifying saved profiles.
        require(stage in listOf("Puppy", "Kitten", "Adult", "Mature", "Senior", "Not sure")) { "Choose a life stage." }
        require(lifestyle in listOf("Not sure", "Indoor", "Indoor & outdoor", "Outdoor")) { "Choose an indoor/outdoor routine." }
        require(years.isBlank() || years.toIntOrNull()?.let { it in 0..40 } == true) { "Enter years from 0 to 40." }
        require(months.isBlank() || months.toIntOrNull()?.let { it in 0..11 } == true) { "Enter months from 0 to 11." }
        require(birthday.isBlank() || runCatching { LocalDate.parse(birthday) }.isSuccess) { "Enter a birthday as YYYY-MM-DD." }
        require(weight.isBlank() || weight.toDoubleOrNull()?.let { it.isFinite() && it > 0 && it <= if (weightUnit == "kg") 250.0 else 551.2 } == true) { "Enter a measured weight above zero." }
        require(weightUnit in listOf("kg", "lb"))
        listOf(breeds, goals, routines, topics, traits, activities, foods).forEach { values ->
            require(values.size <= 40 && values.all { it.isNotBlank() && it.length <= 80 && it.none(Char::isISOControl) }) { "Check your selections." }
            require(values.map(String::lowercase).distinct().size == values.size) { "Remove duplicate selections." }
        }
        listOf(allergies, conditions, medications, careNotes).forEach { require(it.length <= 2000 && '\u0000' !in it) { "Keep each note within 2,000 characters." } }
        require(reminderDays.distinct().size == reminderDays.size && reminderDays.all { it in 1..7 })
        require(Regex("(?:[01][0-9]|2[0-3]):[0-5][0-9]").matches(reminderTime)) { "Enter a time as HH:MM." }
    }
    fun ageLabel(): String = if (birthday.isNotBlank()) "Born $birthday" else listOfNotNull(years.takeIf { it.isNotBlank() }?.let { "$it years" }, months.takeIf { it.isNotBlank() }?.let { "$it months" }).joinToString(", ")
    fun facts(): List<Pair<String, String>> = listOf(
        "Life stage" to stage, "Lifestyle" to lifestyle, "Age" to ageLabel(), "Breed or mix" to breeds.joinToString(" × "), "Neutered or spayed" to neutered,
        "Size" to size, "Recorded weight" to weight.takeIf(String::isNotBlank)?.let { "$it $weightUnit" }.orEmpty(),
        "Your experience" to experience, "Care priorities" to goals.joinToString(", "), "Routines" to routines.joinToString(", "),
        "AI topics" to topics.joinToString(", "), "Personality" to traits.joinToString(", "), "Activities" to activities.joinToString(", "),
        "Food" to foods.joinToString(", "), "Allergies or sensitivities" to allergies, "Known conditions" to conditions,
        "Existing care instructions" to medications, "Care notes" to careNotes,
    ).filter { it.second.isNotBlank() && it.second != "Not sure" }
}
