@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.dracoarts.shared.presentation.review

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.domain.repository.CareRepository
import com.dracoarts.shared.managers.StorageBackend
import kotlinx.datetime.*
import kotlinx.coroutines.flow.first
import com.dracoarts.shared.presentation.companion.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

enum class BoardReviewDataSet(val key: String, val databaseName: String) {
    SoftPawsDay("soft-paws-day-v1", "soft_paws_review_day_v1.db"),
    SoftPawsVideo("soft-paws-video-v1", "soft_paws_review_video_v1.db"),
    SoftPawsAccount("soft-paws-account-v1", "soft_paws_review_account_v1.db"),
    SoftPawsFinish("soft-paws-finish-v1", "soft_paws_review_finish_v1.db"),
    SoftPawsFinishEmpty("soft-paws-finish-empty-v1", "soft_paws_review_finish_empty_v1.db"),
    SoftPawsSetup("soft-paws-setup-v1", "soft_paws_review_setup_v1.db"),
    PremiumSafety("park-premium-safety-v1", "barklog_review_premium_safety_v1.db"),
    AddDog("park-add-dog-v1", "barklog_review_add_dog_v1.db"),
    AiCards("park-ai-cards-v1", "barklog_review_ai_cards_v1.db"),
    Video("park-video-v1", "barklog_review_park_video_v1.db"),
    Day("park-day-v1", "barklog_review_park_day_v1.db"),
    Full("park-full-v1", "barklog_review_park_full_v1.db"),
    Empty("park-empty-v1", "barklog_review_park_empty_v1.db"),
    Setup("park-setup-v1", "barklog_review_park_setup_v1.db"),
    NoDog("park-no-dog-v1", "barklog_review_park_no_dog_v1.db"),
    Contexts("park-contexts-v1", "barklog_review_park_contexts_v1.db"),
    Paged("park-paged-v1", "barklog_review_park_paged_v1.db");
    val preferencePrefix get() = if (this == Day) "board_review_v1_" else "board_review_${name.lowercase()}_v1_"
    val nowMillis get() = when (this) {
        SoftPawsDay, SoftPawsSetup, SoftPawsVideo, SoftPawsAccount, SoftPawsFinish, SoftPawsFinishEmpty -> LocalDateTime.parse("2026-10-20T09:41").toInstant(BoardReviewFixture.zone).toEpochMilliseconds()
        AiCards -> LocalDateTime.parse("2026-10-19T20:00").toInstant(BoardReviewFixture.zone).toEpochMilliseconds()
        else -> BoardReviewFixture.now
    }
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

    /** Repeatable preparation of one disposable QA profile; never resets a journal. */
    suspend fun prepareFinishDeletion(repository: JournalRepository) {
        val id = "50f70012-0001-4000-8000-000000000003"
        if (repository.observeDogs().first().none { it.id == id }) repository.addDog("Juniper QA", DogDetails(companion = DogContext.catDefaults()), id)
    }

    suspend fun seed(repository: JournalRepository, dataSet: BoardReviewDataSet = BoardReviewDataSet.Day) {
        if (dataSet == BoardReviewDataSet.SoftPawsSetup) return
        if (dataSet in setOf(BoardReviewDataSet.SoftPawsFinish, BoardReviewDataSet.SoftPawsFinishEmpty)) {
            val cat = repository.addDog("Miso", DogDetails(breed = "Domestic shorthair", age = "3 years", sex = "Female", companion = DogContext.catDefaults().copy(stage = "Adult", years = "3", lifestyle = "Indoor", breeds = listOf("Domestic shorthair"), neutered = "Spayed", weight = "4.2", careNotes = "Owned final-screen QA · preserve this care note")), "50f70012-0001-4000-8000-000000000001")
            if (dataSet == BoardReviewDataSet.SoftPawsFinishEmpty) return
            val care = repository as CareRepository
            val beans = repository.addDog("Beans", DogDetails(companion = DogContext.catDefaults()), "50f70012-0001-4000-8000-000000000002")
            repository.addDog("Juniper QA", DogDetails(companion = DogContext.catDefaults()), "50f70012-0001-4000-8000-000000000003")
            repository.createEvent(cat.id, itemId(100), CareEventInput(CareEventType.Note, at("2026-10-20", "08:00"), "Watched the birds after breakfast.", CareDetails.Note()))
            repository.createEvent(cat.id, itemId(101), CareEventInput(CareEventType.Meal, at("2026-10-20", "08:10"), "65 g wet food offered. Some food remained.", CareDetails.Meal(offeredGrams = 65.0, eaten = MealEaten.Some)))
            repository.createEvent(beans.id, itemId(102), CareEventInput(CareEventType.Note, at("2026-10-20", "08:20"), "Beans-only observation; never share with Miso.", CareDetails.Note()))
            if (itemId(601) !in care.observeItems(cat.id).first().map { it.id }) care.saveItem(cat.id, itemId(601), dataSet.nowMillis, CareItemData.Photo("finish-qa-missing.jpg", "The window supervisor", "2026-10-20", notes = "All afternoon, keeping an eye on the birds."))
            care.saveDraft(beans.id, "final-screen-sentinel", com.dracoarts.shared.domain.repository.LocalDraft("{\"note\":\"Beans draft stays separate\"}"))
            val question = "What should I note about Miso’s breakfast?"
            val prepared = prepareWeeklyContext(repository, cat.id, question, dataSet.nowMillis, zone)
            val workspace = CompanionWorkspace(currentThread = itemId(910), threads = listOf(CompanionThread(itemId(910), "A breakfast observation", listOf(
                CompanionMessage(itemId(911), question, false, dataSet.nowMillis - 2000),
                CompanionMessage(itemId(912), "Keep the observation specific.\n\nRecord what you offered, roughly how much was left and when. Add anything else you noticed in your own words.\n\nThese are caregiver observations; they do not establish a cause.", true, dataSet.nowMillis - 1000, profile = prepared.profile, records = prepared.records, responseSource = "demo", weekly = prepared.weekly)))))
            (repository as com.dracoarts.shared.domain.repository.LocalDocumentRepository).writeDocument("companion-chat-${cat.id}", Json.encodeToString(workspace), cat.id)
            return
        }
        if (dataSet == BoardReviewDataSet.SoftPawsAccount) {
            val cat = repository.addDog("Miso", DogDetails(companion = DogContext.catDefaults().copy(stage = "Adult", lifestyle = "Indoor")), "50f70011-0001-4000-8000-000000000001")
            repository.createEvent(cat.id, "50f70011-0001-4000-8000-000000000100", CareEventInput(CareEventType.Note, dataSet.nowMillis, "Owned account QA · keep this journal note", CareDetails.Note()))
            val care = repository as CareRepository
            if (care.loadDraft(cat.id, "cat-account-proof-v1") == null) care.saveDraft(cat.id, "cat-account-proof-v1", com.dracoarts.shared.domain.repository.LocalDraft("{\"note\":\"Owned account QA retained draft\"}"))
            return
        }
        if (dataSet == BoardReviewDataSet.SoftPawsVideo) {
            val cat = repository.addDog("Miso", DogDetails(companion = DogContext.catDefaults().copy(stage = "Adult", lifestyle = "Indoor")), "50f70010-0001-4000-8000-000000000001")
            val care = repository as CareRepository
            val savedIds = care.observeItems(cat.id).first().map { it.id }.toSet()
            listOf("red" to "Window watch QA", "green" to "A little play QA", "blue" to "Afternoon nap QA").forEachIndexed { i, (file, title) ->
                val id = "50f70010-0001-4000-8000-${(i + 600).toString().padStart(12, '0')}"
                if (id !in savedIds) care.saveItem(cat.id, id, dataSet.nowMillis, CareItemData.Photo("video-qa-$file.jpg", title, "2026-10-20"))
            }
            if (care.loadDraft(cat.id, HighlightDraft.SLOT) == null) {
                val draft = HighlightDraft(cat.id, listOf("red", "green", "blue").mapIndexed { i, name -> HighlightClip("video-qa-$name.jpg", "QA moment ${i + 1}") }, title = "Miso’s October")
                care.saveDraft(cat.id, HighlightDraft.SLOT, com.dracoarts.shared.domain.repository.LocalDraft(kotlinx.serialization.json.Json.encodeToString(HighlightDraft.serializer(), draft), draft.clips.map { it.photoId }))
            }
            return
        }
        if (dataSet == BoardReviewDataSet.SoftPawsDay) {
            val cat = repository.addDog("Miso", DogDetails(companion = DogContext.catDefaults().copy(stage = "Adult", lifestyle = "Indoor")), "50f70002-0001-4000-8000-000000000001")
            listOf(
                CareEventInput(CareEventType.Meal, at("2026-10-20", "08:10"), "Breakfast", CareDetails.Meal(offeredGrams = 35.0, eaten = MealEaten.Mostly)),
                CareEventInput(CareEventType.Litter, at("2026-10-20", "08:34"), details = CareDetails.Litter(LitterObservation.Urine, 1)),
                CareEventInput(CareEventType.Play, at("2026-10-20", "08:50"), "Feather toy", CareDetails.Play(PlayInterest.Interested, 7)),
            ).forEachIndexed { i, input -> repository.createEvent(cat.id, "50f70002-0001-4000-8000-${(i + 100).toString().padStart(12, '0')}", input) }
            return
        }
        if (dataSet in setOf(BoardReviewDataSet.Setup, BoardReviewDataSet.NoDog)) return
        repository.addDog("Bruno", if (dataSet == BoardReviewDataSet.AiCards) DogDetails(breed = "Cocker Spaniel", age = "3 years", companion = DogContext(years = "3", breeds = listOf("Cocker Spaniel"))) else DogDetails(breed = "Mixed breed", age = "4–7 years"), dogId)
        if (dataSet == BoardReviewDataSet.AiCards) {
            val rows = listOf(
                Triple("13T08:10", CareEventType.Walk, "Morning loop · 18 minutes"), Triple("13T18:20", CareEventType.Walk, "Evening loop · 22 minutes"),
                Triple("14T08:15", CareEventType.Meal, "Breakfast · usual food"), Triple("14T19:10", CareEventType.Grooming, "A few brush strokes, then walked away"),
                Triple("15T18:05", CareEventType.Walk, "Quiet route · stopped to sniff"), Triple("15T18:40", CareEventType.Meal, "Evening meal"),
                Triple("16T08:20", CareEventType.Walk, "Morning loop · 20 minutes"), Triple("16T19:00", CareEventType.Grooming, "Short brush session · paused when he moved away"),
                Triple("17T08:10", CareEventType.Meal, "Breakfast · usual food"), Triple("18T08:05", CareEventType.Walk, "Morning loop · 15 minutes"),
                Triple("18T18:30", CareEventType.Walk, "Park loop · sniffing breaks"), Triple("19T18:20", CareEventType.Walk, "Evening loop · 24 minutes"))
            rows.forEachIndexed { i, (stamp, type, note) ->
                val details = if (type == CareEventType.Grooming) CareDetails.Grooming(GroomingActivity.Brushing) else null
                repository.createEvent(dogId, itemId(9000 + i), CareEventInput(type, LocalDateTime.parse("2026-10-$stamp").toInstant(zone).toEpochMilliseconds(), note, details))
            }
            (repository as com.dracoarts.shared.domain.repository.LocalDocumentRepository).writeDocument("companion-session", """{"premium":true}""")
            return
        }
        if (dataSet in setOf(BoardReviewDataSet.Empty, BoardReviewDataSet.AddDog)) return
        if (dataSet == BoardReviewDataSet.Video) {
            val draft = HighlightDraft(dogId, listOf("red", "green", "blue").mapIndexed { i, name -> HighlightClip("video-qa-$name.jpg", "QA moment ${i + 1}") })
            (repository as CareRepository).saveDraft(dogId, HighlightDraft.SLOT, com.dracoarts.shared.domain.repository.LocalDraft(kotlinx.serialization.json.Json.encodeToString(HighlightDraft.serializer(), draft), draft.clips.map { it.photoId }))
            return
        }
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
