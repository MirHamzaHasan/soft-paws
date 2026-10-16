@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.dracoarts.shared.presentation.review

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.domain.repository.CareRepository
import com.dracoarts.shared.managers.StorageBackend
import kotlinx.datetime.*

enum class BoardReviewDataSet(val key: String, val databaseName: String) {
    Day("park-day-v1", "barklog_review_park_day_v1.db"),
    Full("park-full-v1", "barklog_review_park_full_v1.db"),
    Empty("park-empty-v1", "barklog_review_park_empty_v1.db"),
    Setup("park-setup-v1", "barklog_review_park_setup_v1.db"),
    NoDog("park-no-dog-v1", "barklog_review_park_no_dog_v1.db"),
    Contexts("park-contexts-v1", "barklog_review_park_contexts_v1.db"),
    Paged("park-paged-v1", "barklog_review_park_paged_v1.db");
    val preferencePrefix get() = if (this == Day) "board_review_v1_" else "board_review_${name.lowercase()}_v1_"
}

/** Opt-in host Debug fixture. A separate SQLite file and preference namespace are mandatory. */
object BoardReviewFixture {
    const val id = "park-day-v1"
    const val databaseName = "barklog_review_park_day_v1.db"
    const val dogId = "b04d0022-0001-4000-8000-000000000001"
    val zone = TimeZone.UTC
    val now = LocalDateTime(2026, 10, 14, 18, 24).toInstant(zone).toEpochMilliseconds()

    /** Idempotent inserts through the real repository; replay never deletes or restores data. */
    fun itemId(number: Int) = "b04d0022-0001-4000-8000-${number.toString().padStart(12, '0')}"
    private fun at(day: String, time: String) = LocalDateTime.parse("${day}T$time").toInstant(zone).toEpochMilliseconds()

    suspend fun seed(repository: JournalRepository, dataSet: BoardReviewDataSet = BoardReviewDataSet.Day) {
        if (dataSet in setOf(BoardReviewDataSet.Setup, BoardReviewDataSet.NoDog)) return
        repository.addDog("Bruno", DogDetails(breed = "Mixed breed", age = "4–7 years"), dogId)
        if (dataSet == BoardReviewDataSet.Empty) return
        val samples = listOf(
            Triple(CareEventType.Walk, "18:20", "Evening loop · 24 minutes"),
            Triple(CareEventType.Meal, "17:45", "Dry food · 120 g"),
            Triple(CareEventType.Mood, "16:10", "Calm after a nap"),
            Triple(CareEventType.Pee, "13:05", "Usual amount"),
            Triple(CareEventType.Meal, "08:15", "Breakfast · 120 g"),
            Triple(CareEventType.Poop, "07:40", "Formed"),
            Triple(CareEventType.Pee, "07:32", "Morning garden break"),
        )
        // Stable request IDs also recover a partial seed without duplicating the earlier writes.
        samples.forEachIndexed { index, (type, time, note) ->
            val at = LocalDateTime.parse("2026-10-14T$time").toInstant(zone).toEpochMilliseconds()
            val details = if (type == CareEventType.Mood) CareDetails.Mood(ObservedMood.Calm) else null
            repository.createEvent(dogId, itemId(index + 100), CareEventInput(type, at, note, details))
        }
        if (dataSet in setOf(BoardReviewDataSet.Full, BoardReviewDataSet.Contexts, BoardReviewDataSet.Paged)) seedSupporting(repository)
        if (dataSet == BoardReviewDataSet.Contexts) {
            val care = repository as CareRepository
            care.saveItem(dogId, itemId(802), at("2026-10-10", "09:00"), CareItemData.Memory(listOf(itemId(601)), "A coat reference to keep"))
            repository.createEvent(dogId, itemId(804), CareEventInput(CareEventType.Walk, at("2026-09-21", "08:00"), "A long morning walk", CareDetails.Walk(38)))
            care.saveItem(dogId, itemId(803), at("2026-09-21", "08:00"), CareItemData.Memory(listOf(itemId(804)), "A long morning walk"))
            repository.createEvent(dogId, itemId(850), CareEventInput(CareEventType.Weight, at("2026-10-08", "08:00"), details = CareDetails.Weight(14.2, WeightUnit.Kilograms)))
            repository.createEvent(dogId, itemId(851), CareEventInput(CareEventType.Weight, at("2026-10-14", "08:00"), details = CareDetails.Weight(14.6, WeightUnit.Kilograms)))
            repository.createEvent(dogId, itemId(852), CareEventInput(CareEventType.Walk, at("2026-10-12", "18:00"), details = CareDetails.Walk(24)))
            repository.createEvent(dogId, itemId(853), CareEventInput(CareEventType.Walk, at("2026-10-13", "18:00"), details = CareDetails.Walk(18)))
        }
        if (dataSet == BoardReviewDataSet.Paged) repeat(75) { index ->
            repository.createEvent(dogId, itemId(1000 + index), CareEventInput(CareEventType.Walk, at("2026-09-30", "18:00") - index * 86_400_000L, "Older owned QA observation ${index + 1}"))
        }
    }

    private suspend fun seedSupporting(repository: JournalRepository) {
        val care = repository as CareRepository
        repository.addDog("Luna", DogDetails(breed = "Terrier mix", age = "1–3 years"), itemId(2))
        suspend fun item(id: Int, day: String, time: String, data: CareItemData) = care.saveItem(dogId, itemId(id), at(day, time), data)
        item(200, "2026-10-01", "20:00", CareItemData.Medication("Example medication", "5 mg", "Entered by caregiver", "Once daily", "2026-10-01", "20:00"))
        item(201, "2026-09-10", "10:00", CareItemData.Vaccination("Example vaccination", "2026-09-10", "Example clinic", "Caregiver-entered QA reference", "2027-09-10"))
        item(300, "2026-10-14", "20:00", CareItemData.Task("Example medication", "2026-10-14", "20:00", "UTC", "Preventive", Repeat.Daily))
        item(301, "2026-10-14", "09:00", CareItemData.Task("Brush coat", "2026-10-14", "09:00", "UTC", "Grooming"))
        item(302, "2026-10-13", "09:00", CareItemData.Task("Refill food container", "2026-10-13", "09:00", "UTC", "Refill"))
        care.recordActivity(dogId, itemId(400), at("2026-10-14", "09:12"), CareItemData.Completion(itemId(301), "Brush coat", "2026-10-14"))
        care.recordActivity(dogId, itemId(450), at("2026-10-13", "20:00"), CareItemData.Administration(itemId(200), "Example medication", "5 mg"))
        item(500, "2026-10-08", "16:00", CareItemData.Enrollment("name-response"))
        care.recordActivity(dogId, itemId(501), at("2026-10-08", "17:00"), CareItemData.Session("name-response", 0, 240, "Getting there", "Calm", "Name response practice", 3))
        care.recordActivity(dogId, itemId(502), at("2026-10-12", "17:00"), CareItemData.Session("name-response", 1, 180, "Easy", "Playful", "A quiet practice session", 4))
        item(600, "2026-10-14", "18:20", CareItemData.Photo("qa-park-day-v1.jpg", "Park walk", "2026-10-14", "Everyday", notes = "A local QA image, never a caregiver photo."))
        item(601, "2026-10-10", "09:00", CareItemData.Photo("qa-missing-v1.jpg", "Coat reference", "2026-10-10", "Coat", "Shoulder", "Metadata stays readable when the owned QA file is missing."))
        item(700, "2026-10-14", "12:00", CareItemData.Expense(725000, "PKR", "Food", "2026-10-14", "Food · synthetic QA expense"))
        item(701, "2026-10-08", "12:00", CareItemData.Expense(520000, "PKR", "Vet", "2026-10-08", "Visit · synthetic QA expense"))
        item(800, "2026-10-14", "18:20", CareItemData.Memory(listOf(itemId(600), itemId(100)), "The evening park loop"))
        item(801, "2026-10-08", "17:00", CareItemData.Memory(listOf(itemId(501)), "Name response practice"))
    }
}

/** Same native preference backend, scoped so QA cannot alter normal journal settings. */
class BoardReviewPreferences(private val delegate: StorageBackend, private val prefix: String = "board_review_v1_") : StorageBackend {
    override fun read(key: String) = delegate.read(prefix + key)
    override fun write(key: String, value: String) = delegate.write(prefix + key, value)
    override fun remove(key: String) = delegate.remove(prefix + key)
    override fun keys() = delegate.keys().filter { it.startsWith(prefix) }.map { it.removePrefix(prefix) }.toSet()
    override fun clear() = keys().forEach(::remove)
}
