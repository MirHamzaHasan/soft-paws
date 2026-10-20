package com.dracoarts.shared.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Caregiver observations only. These values are not clinical assessments. */
@Serializable
sealed interface CareDetails {
    @Serializable @SerialName("poop") data class Poop(val consistency: StoolConsistency? = null) : CareDetails
    @Serializable @SerialName("pee") data class Pee(val amount: ObservedAmount? = null) : CareDetails
    @Serializable @SerialName("meal") data class Meal(val food: String? = null, val portion: String? = null, val offeredGrams: Double? = null, val eaten: MealEaten? = null) : CareDetails
    @Serializable @SerialName("walk") data class Walk(val durationMinutes: Int? = null) : CareDetails
    @Serializable @SerialName("symptom") data class Symptom(val observation: String) : CareDetails
    @Serializable @SerialName("mood") data class Mood(val observedMood: ObservedMood, val context: String? = null) : CareDetails
    @Serializable @SerialName("behavior") data class Behavior(val observation: String) : CareDetails
    @Serializable @SerialName("grooming") data class Grooming(val activity: GroomingActivity, val durationMinutes: Int? = null) : CareDetails
    @Serializable @SerialName("weight") data class Weight(val amount: Double, val unit: WeightUnit) : CareDetails
    @Serializable @SerialName("medication") data class Medication(val planId: String, val name: String, val amount: String) : CareDetails
    @Serializable @SerialName("training") data class Training(val programId: String, val step: Int, val seconds: Int, val rating: String, val mood: String) : CareDetails
    @Serializable @SerialName("task") data class Task(val taskId: String, val title: String, val dueDate: String) : CareDetails
    @Serializable @SerialName("water") data class Water(val observation: WaterObservation, val measuredMillilitres: Double? = null) : CareDetails
    @Serializable @SerialName("litter") data class Litter(val observation: LitterObservation, val visits: Int? = null, val urineAmount: ObservedAmount? = null, val stoolConsistency: StoolConsistency? = null) : CareDetails
    @Serializable @SerialName("play") data class Play(val interest: PlayInterest, val durationMinutes: Int? = null) : CareDetails
    @Serializable @SerialName("sleep") data class Sleep(val observation: SleepObservation, val durationMinutes: Int? = null) : CareDetails
    @Serializable @SerialName("note") data class Note(val title: String? = null, val category: NoteCategory = NoteCategory.Everyday) : CareDetails
}

@Serializable enum class MealEaten(val label: String) { All("All eaten"), Mostly("Mostly eaten"), Some("Some eaten"), None("Not eaten") }
@Serializable enum class WaterObservation(val label: String) { Drinking("Drinking observed"), Refreshed("Water refreshed"), Measured("Amount measured"), NotSure("Not sure") }
@Serializable enum class LitterObservation(val label: String) { Urine("Urine observed"), Stool("Stool observed"), Both("Both observed"), Nothing("Nothing observed") }
@Serializable enum class PlayInterest(val label: String) { Interested("Interested"), Some("A little interested"), None("Not interested"), Rested("Rested instead") }
@Serializable enum class SleepObservation(val label: String) { Asleep("Asleep"), Resting("Resting"), Restless("Restless"), NotSure("Not sure") }
@Serializable enum class NoteCategory(val label: String) { Everyday("Everyday note"), Vet("Vet note"), Different("Something different") }
@Serializable enum class StoolConsistency(val label: String) { Firm("Firm"), Formed("Formed"), Soft("Soft"), Loose("Loose"), Watery("Watery"), NotSure("Not sure") }
@Serializable enum class ObservedAmount(val label: String) { Small("Small"), Usual("Usual"), Large("Large"), NotSure("Not sure") }
@Serializable enum class ObservedMood(val label: String) { Calm("Calm"), Playful("Playful"), LowEnergy("Low energy"), Restless("Restless"), Unsure("Unsure"), Settled("Settled"), Hiding("Hiding"), Different("Different than usual") }
@Serializable enum class GroomingActivity(val label: String) { Brushing("Brushing"), Bath("Bath"), Nails("Nails"), Other("Other"), Teeth("Teeth"), Ears("Ears"), NailsChecked("Nails checked"), CoatChecked("Coat checked") }
@Serializable enum class WeightUnit(val label: String) { Kilograms("kg"), Pounds("lb") }

data class CareEventInput(val type: CareEventType, val occurredAtMillis: Long, val note: String? = null, val details: CareDetails? = null, val context: ObservationContext = ObservationContext())

object CareEventRules {
    val detailedTypes = listOf(CareEventType.Poop, CareEventType.Pee, CareEventType.Meal, CareEventType.Walk,
        CareEventType.Symptom, CareEventType.Mood, CareEventType.Behavior, CareEventType.Grooming, CareEventType.Weight,
        CareEventType.Water, CareEventType.Litter, CareEventType.Play, CareEventType.Sleep, CareEventType.Note)

    fun normalize(input: CareEventInput): CareEventInput {
        input.context.validate()
        require(input.occurredAtMillis in 0..253402300799999L) { "Choose a valid date and time." }
        val note = text(input.note, 2000, "Notes")
        val details = when (val value = input.details) {
            is CareDetails.Meal -> value.copy(food = text(value.food, 200, "Food"), portion = text(value.portion, 200, "Portion"))
            is CareDetails.Symptom -> value.copy(observation = requiredText(value.observation, "Observation"))
            is CareDetails.Behavior -> value.copy(observation = requiredText(value.observation, "Observation"))
            is CareDetails.Note -> value.copy(title = text(value.title, 200, "Title"))
            is CareDetails.Mood -> value.copy(context = text(value.context, 200, "Context"))
            else -> value
        }
        validateDetails(input.type, details)
        require(details != null || input.type in CareEventType.quickActions) { "Add the observation details before saving." }
        require(details !is CareDetails.Note || details.title != null || note != null) { "Add a title or a note." }
        return input.copy(note = note, details = details)
    }

    fun validateDetails(type: CareEventType, details: CareDetails?) {
        if (details == null) return // v1 quick records have no details; never invent them during migration.
        val expected = when (details) {
            is CareDetails.Poop -> CareEventType.Poop
            is CareDetails.Pee -> CareEventType.Pee
            is CareDetails.Meal -> { text(details.food, 200, "Food"); text(details.portion, 200, "Portion"); positiveMeasurement(details.offeredGrams, 100000.0, "Amount offered"); CareEventType.Meal }
            is CareDetails.Walk -> { require(details.durationMinutes == null || details.durationMinutes in 1..1440) { "Duration must be 1–1440 minutes." }; CareEventType.Walk }
            is CareDetails.Symptom -> { requiredText(details.observation, "Observation"); CareEventType.Symptom }
            is CareDetails.Mood -> { text(details.context, 200, "Context"); CareEventType.Mood }
            is CareDetails.Behavior -> { requiredText(details.observation, "Observation"); CareEventType.Behavior }
            is CareDetails.Grooming -> { observedMinutes(details.durationMinutes); CareEventType.Grooming }
            is CareDetails.Weight -> { require(details.amount.isFinite() && details.amount > 0 && details.amount <= 1000) { "Enter a weight greater than 0 and at most 1000, with its unit." }; CareEventType.Weight }
            is CareDetails.Medication -> { requiredText(details.planId, "Plan"); requiredText(details.name, "Medication"); requiredText(details.amount, "Amount"); CareEventType.Medication }
            is CareDetails.Training -> { require(details.seconds in 1..7200 && details.step >= 0); requiredText(details.programId, "Program"); CareEventType.Training }
            is CareDetails.Task -> { requiredText(details.taskId, "Task"); requiredText(details.title, "Title"); kotlinx.datetime.LocalDate.parse(details.dueDate); CareEventType.Task }
            is CareDetails.Water -> {
                positiveMeasurement(details.measuredMillilitres, 100000.0, "Measured water")
                require(details.observation != WaterObservation.Measured || details.measuredMillilitres != null) { "Add the measured amount, or choose what you observed." }
                require(details.measuredMillilitres == null || details.observation == WaterObservation.Measured) { "Choose Amount measured when recording a measurement." }
                CareEventType.Water
            }
            is CareDetails.Litter -> {
                require(details.visits == null || details.visits in 1..1440) { "Enter observed visits from 1 to 1440, or leave blank." }
                require(details.urineAmount == null || details.observation in listOf(LitterObservation.Urine, LitterObservation.Both)) { "Urine details need an observed urine entry." }
                require(details.stoolConsistency == null || details.observation in listOf(LitterObservation.Stool, LitterObservation.Both)) { "Stool details need an observed stool entry." }
                CareEventType.Litter
            }
            is CareDetails.Play -> { observedMinutes(details.durationMinutes); CareEventType.Play }
            is CareDetails.Sleep -> { observedMinutes(details.durationMinutes); CareEventType.Sleep }
            is CareDetails.Note -> { text(details.title, 200, "Title"); CareEventType.Note }
        }
        require(expected == type) { "Details do not match the event type." }
    }

    private fun observedMinutes(value: Int?) = require(value == null || value in 1..1440) { "Enter observed minutes from 1 to 1440, or leave blank." }
    private fun positiveMeasurement(value: Double?, maximum: Double, label: String) = require(value == null || value.isFinite() && value > 0 && value <= maximum) { "$label must be a measurement above zero and at most $maximum, or left blank." }
    private fun requiredText(value: String, label: String) = requireNotNull(text(value, 2000, label)) { "Add an observation before saving." }
    private fun text(value: String?, maximum: Int, label: String): String? {
        val clean = value?.trim()?.takeIf { it.isNotEmpty() }
        require(clean == null || clean.length <= maximum) { "$label must be at most $maximum characters." }
        return clean
    }
}
