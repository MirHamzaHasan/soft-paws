package com.dracoarts.shared.presentation.state

import androidx.compose.runtime.saveable.Saver
import com.dracoarts.shared.domain.model.*
import kotlinx.datetime.TimeZone
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Saveable local form state. It is not a committed care record or a preference. */
@Serializable
data class EventDraft(
    val requestId: String, val dogId: String, val typeKey: String, val originalMillis: Long,
    val timezoneId: String, val date: String, val time: String, val note: String = "",
    val first: String = "", val second: String = "", val choice: String = "",
    val expectedRevision: Long = 1, val createdAtMillis: Long = originalMillis,
    val location: String = "", val caregiver: String = "", val photoId: String? = null, val observations: Map<String, String> = emptyMap(),
) {
    val type get() = requireNotNull(CareEventType.fromKey(typeKey))
    fun input(): CareEventInput {
        val details = when (type) {
            CareEventType.Poop -> CareDetails.Poop(StoolConsistency.entries.firstOrNull { it.name == choice })
            CareEventType.Pee -> CareDetails.Pee(ObservedAmount.entries.firstOrNull { it.name == choice })
            CareEventType.Meal -> CareDetails.Meal(first, second)
            CareEventType.Walk -> CareDetails.Walk(if (first.isBlank()) null else requireNotNull(first.toIntOrNull()) { "Enter duration as whole minutes." })
            CareEventType.Symptom -> CareDetails.Symptom(first)
            CareEventType.Mood -> CareDetails.Mood(requireNotNull(ObservedMood.entries.firstOrNull { it.name == choice }) { "Choose the mood you observed." })
            CareEventType.Behavior -> CareDetails.Behavior(first)
            CareEventType.Grooming -> CareDetails.Grooming(requireNotNull(GroomingActivity.entries.firstOrNull { it.name == choice }) { "Choose a grooming activity." })
            CareEventType.Weight -> CareDetails.Weight(requireNotNull(first.toDoubleOrNull()) { "Enter a numeric weight." }, requireNotNull(WeightUnit.entries.firstOrNull { it.name == choice }) { "Choose kg or lb." })
            else -> error("This form is not available.")
        }
        return CareEventRules.normalize(CareEventInput(type, JournalDates.parseInput(date, time, TimeZone.of(timezoneId), originalMillis), note, details,
            ObservationContext(location.trim(), caregiver.trim(), photoId, observations.mapValues { it.value.trim() }.filterValues { it.isNotBlank() })))
    }
    fun originalRecord() = CareEvent(requestId, dogId, type, originalMillis, createdAtMillis, revision = expectedRevision)

    companion object {
        val Saver = Saver<EventDraft, String>(save = { Json.encodeToString(serializer(), it) }, restore = { runCatching { Json.decodeFromString(serializer(), it) }.getOrNull() })
        fun fresh(id: String, dogId: String, type: CareEventType, now: Long, zone: TimeZone) =
            EventDraft(id, dogId, type.key, now, zone.id, JournalDates.inputDate(now, zone), JournalDates.inputTime(now, zone), choice = if (type == CareEventType.Weight) WeightUnit.Kilograms.name else "")
        fun edit(record: CareEvent, zone: TimeZone): EventDraft {
            var draft = fresh(record.id, record.dogId, record.type, record.occurredAtMillis, zone).copy(note = record.note.orEmpty(), expectedRevision = record.revision, createdAtMillis = record.createdAtMillis,
                location = record.context.location, caregiver = record.context.caregiver, photoId = record.context.photoId, observations = record.context.observations)
            draft = when (val detail = record.details) {
                is CareDetails.Poop -> draft.copy(choice = detail.consistency?.name.orEmpty())
                is CareDetails.Pee -> draft.copy(choice = detail.amount?.name.orEmpty())
                is CareDetails.Meal -> draft.copy(first = detail.food.orEmpty(), second = detail.portion.orEmpty())
                is CareDetails.Walk -> draft.copy(first = detail.durationMinutes?.toString().orEmpty())
                is CareDetails.Symptom -> draft.copy(first = detail.observation)
                is CareDetails.Mood -> draft.copy(choice = detail.observedMood.name)
                is CareDetails.Behavior -> draft.copy(first = detail.observation)
                is CareDetails.Grooming -> draft.copy(choice = detail.activity.name)
                is CareDetails.Weight -> draft.copy(first = detail.amount.toString(), choice = detail.unit.name)
                else -> draft
            }
            return draft
        }
    }
}
