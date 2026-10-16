package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.QueryResult
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.managers.DisabledHaptics
import com.dracoarts.shared.presentation.navigation.AppState
import com.dracoarts.shared.presentation.navigation.JournalPage
import com.dracoarts.shared.presentation.navigation.Route
import com.dracoarts.shared.presentation.state.EventController
import com.dracoarts.shared.presentation.state.EventDraft
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.launch
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.managers.HapticKind
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.time.Instant
import java.util.UUID
import kotlin.test.*

class DetailJournalTest {
    private fun uuid() = UUID.randomUUID().toString()
    private fun driver() = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY).also {
        JournalSchema.create(it); it.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0); it.execute(null, "PRAGMA foreign_keys = ON", 0)
    }
    private fun repository(driver: SqlDriver) = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::uuid, { 100L }, Dispatchers.Unconfined)
    private val detailCases = listOf(
        CareEventType.Poop to CareDetails.Poop(StoolConsistency.Formed), CareEventType.Pee to CareDetails.Pee(ObservedAmount.Usual),
        CareEventType.Meal to CareDetails.Meal("Kibble", "100 g"), CareEventType.Walk to CareDetails.Walk(20),
        CareEventType.Symptom to CareDetails.Symptom("Owner-observed sneezing"), CareEventType.Mood to CareDetails.Mood(ObservedMood.Playful),
        CareEventType.Behavior to CareDetails.Behavior("Barked at the door"), CareEventType.Grooming to CareDetails.Grooming(GroomingActivity.Brushing),
        CareEventType.Weight to CareDetails.Weight(12.5, WeightUnit.Kilograms),
    )

    @Test fun allNineDetailTypesRoundTripWithUnitsAndNotes() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno")
            for ((type, details) in detailCases) {
                val event = repo.createEvent(dog.id, uuid(), CareEventInput(type, 200, " note ", details))
                assertEquals(event, repo.observeEvent(dog.id, event.id).first())
                assertEquals(details, event.details); assertEquals("note", event.note)
            }
            assertEquals(9, repo.observeEvents(dog.id).first().size)
        } finally { repo.close() }
    }

    @Test fun sameRequestIdIsIdempotentButDifferentPayloadOrDogIsRejected() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val second = repo.addDog("Luna"); val id = uuid()
            val input = CareEventInput(CareEventType.Meal, 200, "Breakfast", CareDetails.Meal("Kibble", "100 g"))
            val first = repo.createEvent(dog.id, id, input)
            assertEquals(first, repo.createEvent(dog.id, id, input))
            assertEquals(1, repo.observeEvents(dog.id).first().size)
            assertFailsWith<RecordConflictException> { repo.createEvent(dog.id, id, input.copy(note = "Different")) }
            assertFailsWith<RecordConflictException> { repo.createEvent(second.id, id, input) }
            assertTrue(repo.observeEvents(second.id).first().isEmpty())
        } finally { repo.close() }
    }

    @Test fun boardObservationFieldsSurviveCommitAndReopen() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno")
            val cases = listOf(
                Triple(CareEventType.Pee, CareDetails.Pee(ObservedAmount.Usual), mapOf("Appearance" to "Pale yellow")),
                Triple(CareEventType.Symptom, CareDetails.Symptom("Coughed twice after water"), mapOf("Frequency" to "Once")),
                Triple(CareEventType.Behavior, CareDetails.Behavior("Barked when the bell rang"), mapOf("Trigger" to "a".repeat(240))),
                Triple(CareEventType.Grooming, CareDetails.Grooming(GroomingActivity.Ears), mapOf("Product" to "Caregiver-entered product")),
                Triple(CareEventType.Weight, CareDetails.Weight(14.6, WeightUnit.Kilograms), mapOf("Method" to "Home scale")),
            )
            for ((type, details, observations) in cases) {
                val saved = repo.createEvent(dog.id, uuid(), CareEventInput(type, 200, details = details, context = ObservationContext(observations = observations)))
                assertEquals(observations, repo.observeEvent(dog.id, saved.id).first()!!.context.observations)
            }
            assertFailsWith<IllegalArgumentException> { ObservationContext(observations = mapOf("Trigger" to "a".repeat(241))).validate() }
            assertFailsWith<IllegalArgumentException> { ObservationContext(observations = mapOf("Unexpected" to "text")).validate() }
            Unit
        } finally { repo.close() }
    }

    @Test fun editingPreservesIdentityCreationDogAndTypeAndChecksRevision() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val second = repo.addDog("Luna")
            val original = repo.logEvent(dog.id, CareEventType.Walk, 200)
            val input = CareEventInput(CareEventType.Walk, 300, "Park", CareDetails.Walk(25))
            val updated = repo.updateEvent(dog.id, original.id, 1, input)
            assertEquals(original.id, updated.id); assertEquals(original.createdAtMillis, updated.createdAtMillis)
            assertEquals(dog.id, updated.dogId); assertEquals(2, updated.revision)
            assertEquals(updated, repo.observeEvent(dog.id, original.id).first())
            assertFailsWith<RecordConflictException> { repo.updateEvent(dog.id, original.id, 1, input) }
            assertFailsWith<RecordNotFoundException> { repo.updateEvent(second.id, original.id, 2, input) }
            assertFailsWith<IllegalArgumentException> { repo.updateEvent(dog.id, original.id, 2, input.copy(type = CareEventType.Meal, details = CareDetails.Meal())) }
            assertEquals(updated, repo.observeEvent(dog.id, original.id).first())
        } finally { repo.close() }
    }

    @Test fun deleteIsDogScopedRevisionCheckedAndOnlyRemovesTheIntendedRecord() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val second = repo.addDog("Luna")
            val event = repo.logEvent(dog.id, CareEventType.Poop, 200)
            val kept = repo.logEvent(dog.id, CareEventType.Pee, 201)
            assertFailsWith<RecordNotFoundException> { repo.deleteEvent(second.id, event.id, 1) }
            assertFailsWith<RecordConflictException> { repo.deleteEvent(dog.id, event.id, 99) }
            repo.deleteEvent(dog.id, event.id, 1)
            assertNull(repo.observeEvent(dog.id, event.id).first())
            assertEquals(listOf(kept), repo.observeEvents(dog.id).first())
            assertEquals(2, repo.observeDogs().first().size)
        } finally { repo.close() }
    }

    @Test fun failedEditAndDeleteRollbackAndKeepTheOriginal() = runBlocking {
        val driver = driver(); val repo = repository(driver); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val original = repo.logEvent(dog.id, CareEventType.Meal, 200)
            driver.execute(null, "CREATE TRIGGER fail_update BEFORE UPDATE ON care_events BEGIN SELECT RAISE(ABORT, 'test failure'); END", 0)
            assertFailsWith<Exception> { repo.updateEvent(dog.id, original.id, 1, CareEventInput(CareEventType.Meal, 300, "Changed")) }
            assertEquals(original, repo.observeEvent(dog.id, original.id).first())
            driver.execute(null, "CREATE TRIGGER fail_delete BEFORE DELETE ON care_events BEGIN SELECT RAISE(ABORT, 'test failure'); END", 0)
            assertFailsWith<Exception> { repo.deleteEvent(dog.id, original.id, 1) }
            assertEquals(original, repo.observeEvent(dog.id, original.id).first())
        } finally { repo.close() }
    }

    @Test fun invalidTypedFieldsNeverWrite() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno")
            val invalid = listOf(
                CareEventInput(CareEventType.Weight, 200, details = CareDetails.Weight(Double.NaN, WeightUnit.Pounds)),
                CareEventInput(CareEventType.Weight, 200, details = CareDetails.Weight(0.0, WeightUnit.Kilograms)),
                CareEventInput(CareEventType.Walk, 200, details = CareDetails.Walk(-1)),
                CareEventInput(CareEventType.Walk, 200, details = CareDetails.Walk(1441)),
                CareEventInput(CareEventType.Symptom, 200, details = CareDetails.Symptom(" ")),
                CareEventInput(CareEventType.Behavior, 200, details = CareDetails.Behavior("A".repeat(2001))),
                CareEventInput(CareEventType.Meal, 200, details = CareDetails.Meal("A".repeat(201))),
                CareEventInput(CareEventType.Pee, 200, details = CareDetails.Walk(10)),
                CareEventInput(CareEventType.Weight, 200),
            )
            invalid.forEach { assertFailsWith<IllegalArgumentException> { repo.createEvent(dog.id, uuid(), it) } }
            assertTrue(repo.observeEvents(dog.id).first().isEmpty())
        } finally { repo.close() }
    }

    @Test fun timelineFiltersAndSqlBoundedPagesWorkForThousandsOfRows() = runBlocking {
        val driver = driver(); val repo = repository(driver); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val second = repo.addDog("Luna")
            val db = BarkLogDatabase(driver)
            db.transaction { repeat(5000) { index -> db.journalQueries.insertEvent(uuid(), dog.id, if (index % 2 == 0) "poop" else "pee", index.toLong(), 100, null, null, 100, "{}") } }
            repo.logEvent(second.id, CareEventType.Walk, 10000)
            val first = repo.observeTimeline(TimelineFilter(dog.id), 50).first()
            val next = repo.observeTimeline(TimelineFilter(dog.id), 100).first()
            assertEquals(5000, first.totalCount); assertEquals(50, first.events.size); assertEquals(100, next.events.size)
            assertEquals(first.events, next.events.take(50)); assertEquals(4999, first.events.first().occurredAtMillis)
            val filtered = repo.observeTimeline(TimelineFilter(dog.id, CareEventType.Poop, 100, 200), 50).first()
            assertEquals(50, filtered.totalCount); assertTrue(filtered.events.all { it.dogId == dog.id && it.type == CareEventType.Poop && it.occurredAtMillis in 100..199 })
            assertEquals(0, repo.observeTimeline(TimelineFilter(dog.id, CareEventType.Walk), 50).first().totalCount)
            val summary = repo.observeSummary(dog.id, 100, 200).first()
            assertEquals(3, summary.recent.size); assertEquals(5000, summary.totalCount); assertEquals(100, summary.dailyCounts.values.sum())
        } finally { repo.close() }
    }

    @Test fun v1MigrationPreservesRealRecordsAndAddsNoInventedDetails() = runBlocking {
        val directory = Files.createTempDirectory("barklog-v1-migration-").toFile()
        val file = directory.resolve("journal.db")
        val baseline = java.io.File("../shared/src/commonMain/sqldelight/databases/1.db")
        assertTrue(baseline.exists())
        baseline.copyTo(file)
        val driver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
        val dogId = uuid(); val eventId = uuid(); val ownerId = uuid()
        driver.execute(null, "INSERT INTO local_owner VALUES (1, '$ownerId', 100)", 0)
        driver.execute(null, "INSERT INTO dogs VALUES ('$dogId', '$ownerId', 'Bruno', 100)", 0)
        driver.execute(null, "INSERT INTO care_events VALUES ('$eventId', '$dogId', 'meal', 200, 100, 'Original note')", 0)
        driver.execute(null, "PRAGMA user_version = 1", 0)
        JournalSchema.migrate(driver, 1, JournalSchema.version)
        driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        val repo = repository(driver)
        try {
            repo.initialize()
            val event = repo.observeEvent(dogId, eventId).first()!!
            assertEquals(CareEvent(eventId, dogId, CareEventType.Meal, 200, 100, "Original note"), event)
            assertNull(event.details); assertEquals(1, event.revision); assertEquals(100, event.updatedAtMillis)
            val edited = repo.updateEvent(dogId, eventId, 1, CareEventInput(CareEventType.Meal, 200, "Updated", CareDetails.Meal("Food", "1 cup")))
            assertEquals(eventId, edited.id); assertEquals(100, edited.createdAtMillis)
            repo.close()
            val reopenedDriver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
            val reopened = repository(reopenedDriver)
            reopened.initialize(); assertEquals(edited, reopened.observeEvent(dogId, eventId).first()); reopened.close()
        } finally { repo.close(); file.delete(); directory.delete() }
    }

    @Test fun draftRoundTripRetainsInputsRevisionSecondsAndWeightUnit() {
        val original = CareEvent(uuid(), uuid(), CareEventType.Weight, 1_760_000_123_456, 100, "Owner note", CareDetails.Weight(22.5, WeightUnit.Pounds), 3, 200)
        val draft = EventDraft.edit(original, TimeZone.of("Asia/Karachi"))
        val saved = Json.decodeFromString(EventDraft.serializer(), Json.encodeToString(EventDraft.serializer(), draft))
        assertEquals(draft, saved); assertEquals(original.occurredAtMillis, saved.input().occurredAtMillis)
        assertEquals(original.details, saved.input().details); assertEquals(3, saved.expectedRevision)
    }

    @Test fun timeControlsRejectDstGapsPreserveOverlapAndUseCalendarDayBoundaries() {
        val zone = TimeZone.of("America/New_York")
        val secondOccurrence = Instant.parse("2026-11-01T06:30:12Z").toEpochMilli()
        assertEquals(secondOccurrence, JournalDates.parseInput("2026-11-01", "01:30", zone, secondOccurrence))
        assertFailsWith<IllegalArgumentException> { JournalDates.parseInput("2026-03-08", "02:30", zone, secondOccurrence) }
        val bounds = JournalDates.dayBounds(LocalDate(2026, 3, 8), zone)
        assertEquals(23 * 3_600_000L, bounds.second - bounds.first)
        assertFailsWith<IllegalArgumentException> { JournalDates.parseInput("2026-02-30", "12:00", zone, secondOccurrence) }
    }

    @Test fun navigationRestoreAndBackKeepTheCorrectJournalContext() {
        val state = AppState(Route.Timeline)
        state.newLog("dog", CareEventType.Meal, "request")
        val restored = AppState.restoreValue(state.savedValue())
        assertEquals(state.page, restored.page); assertEquals(Route.Timeline, restored.route)
        restored.back(); assertNull(restored.page); assertEquals(Route.Timeline, restored.route)
        restored.detail("dog", "event"); restored.edit("dog", "event", "edit-session")
        restored.back(); assertEquals(JournalPage.Kind.Detail, restored.page!!.kind)
        restored.back(); assertNull(restored.page); restored.back(); assertEquals(Route.Home, restored.route)
        assertEquals(Route.Profile, AppState.restoreValue("Profile").route)
        restored.open(com.dracoarts.shared.presentation.navigation.Feature.Chooser)
        restored.detail("dog", "saved-from-chooser")
        restored.closePage()
        assertNull(restored.page)
        assertTrue(restored.featureStack.isEmpty())
        assertEquals(Route.Home, restored.route)
    }

    @Test fun controllerKeepsErrorsSafeAndNeverReportsAFailedMutationAsSuccess() = runBlocking {
        val driver = driver(); val repo = repository(driver); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val controller = EventController(repo, DisabledHaptics)
            driver.execute(null, "CREATE TRIGGER fail_create BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'private test path'); END", 0)
            assertNull(controller.create(dog.id, uuid(), CareEventInput(CareEventType.Poop, 200)))
            assertTrue(controller.state.value.error!!.contains("draft")); assertFalse(controller.state.value.error!!.contains("private")); assertFalse(controller.state.value.saving)
            driver.execute(null, "DROP TRIGGER fail_create", 0)
            assertNotNull(controller.create(dog.id, uuid(), CareEventInput(CareEventType.Poop, 200)))
            assertNull(controller.state.value.error)
        } finally { repo.close() }
    }

    @Test fun detailedControllerIgnoresOverlappingSavesAndCancellationHasNoSuccessHaptic() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val dog = repo.addDog("Bruno"); val gate = CompletableDeferred<Unit>(); var calls = 0; var haptics = 0
            val delayed = object : JournalRepository by repo {
                override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent { calls++; gate.await(); return repo.createEvent(dogId, requestId, input) }
            }
            val controller = EventController(delayed, object : HapticManager { override fun perform(kind: HapticKind) { haptics++ } })
            val id = uuid(); val input = CareEventInput(CareEventType.Meal, 200)
            val pending = launch(start = CoroutineStart.UNDISPATCHED) { controller.create(dog.id, id, input) }
            assertTrue(controller.state.value.saving)
            assertNull(controller.create(dog.id, id, input)); assertEquals(1, calls)
            pending.cancelAndJoin(); assertFalse(controller.state.value.saving); assertNull(controller.state.value.error); assertEquals(0, haptics)
            gate.complete(Unit)
            assertNotNull(controller.create(dog.id, id, input)); assertEquals(1, haptics); assertEquals(1, repo.observeEvents(dog.id).first().size)
        } finally { repo.close() }
    }
}
