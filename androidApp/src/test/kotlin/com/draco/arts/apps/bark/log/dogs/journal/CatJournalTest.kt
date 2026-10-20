package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.QueryResult
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.state.EventDraft
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.TimeZone
import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*

class CatJournalTest {
    private fun id() = UUID.randomUUID().toString()
    private fun repository(driver: SqlDriver) = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 100L }, Dispatchers.Unconfined)
    private fun driver() = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY).also {
        JournalSchema.create(it)
        it.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        it.execute(null, "PRAGMA foreign_keys=ON", 0)
    }
    private val observations = listOf(
        CareEventType.Meal to CareDetails.Meal(offeredGrams = 35.5, eaten = MealEaten.Mostly),
        CareEventType.Water to CareDetails.Water(WaterObservation.Measured, 40.5),
        CareEventType.Litter to CareDetails.Litter(LitterObservation.Both, 2, ObservedAmount.NotSure, StoolConsistency.Formed),
        CareEventType.Play to CareDetails.Play(PlayInterest.Interested, 8),
        CareEventType.Sleep to CareDetails.Sleep(SleepObservation.Resting, 22),
        CareEventType.Note to CareDetails.Note("Curtain watching", NoteCategory.Everyday),
        CareEventType.Mood to CareDetails.Mood(ObservedMood.Hiding, "Under the chair"),
        CareEventType.Grooming to CareDetails.Grooming(GroomingActivity.CoatChecked, 4),
    )

    @Test fun catRecordsSurviveReopenAndDraftEditWithoutLosingStructuredFacts() = runBlocking {
        val file = Files.createTempFile("soft-paws-cat-", ".db").toFile()
        val initial = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
        JournalSchema.create(initial); initial.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        val repo = repository(initial); repo.initialize()
        val cat = repo.addDog("Miso", DogDetails(companion = DogContext(stage = "Kitten", lifestyle = "Indoor")))
        val saved = observations.mapIndexed { i, (type, details) ->
            repo.createEvent(cat.id, id(), CareEventInput(type, 1_760_000_123_456L + i, "Caregiver note", details, ObservationContext(photoId = "cat-photo.jpg")))
        }
        repo.close()
        val reopened = repository(JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")); reopened.initialize()
        try {
            assertEquals(cat, reopened.observeDogs().first().single())
            assertEquals(saved.reversed(), reopened.observeEvents(cat.id).first())
            saved.forEach { event ->
                val draft = EventDraft.edit(event, TimeZone.of("Asia/Karachi"))
                val restored = Json.decodeFromString(EventDraft.serializer(), Json.encodeToString(EventDraft.serializer(), draft))
                assertEquals(event.details, restored.input().details)
                assertEquals(event.context, restored.input().context)
                assertEquals(event.occurredAtMillis, restored.input().occurredAtMillis)
            }
            val other = reopened.addDog("Juniper")
            assertTrue(reopened.observeEvents(other.id).first().isEmpty())
        } finally { reopened.close(); file.delete() }
    }

    @Test fun unknownAmountsStayUnknownAndConflictingOrInvalidFactsCannotWrite() = runBlocking {
        val repo = repository(driver()); repo.initialize()
        try {
            val cat = repo.addDog("Miso")
            val unmeasured = repo.createEvent(cat.id, id(), CareEventInput(CareEventType.Water, 200, details = CareDetails.Water(WaterObservation.Drinking)))
            assertNull((unmeasured.details as CareDetails.Water).measuredMillilitres)
            assertFalse(JournalReport.details(unmeasured.details).contains("ml"))
            val invalid = listOf(
                CareEventType.Water to CareDetails.Water(WaterObservation.Measured),
                CareEventType.Water to CareDetails.Water(WaterObservation.Refreshed, 50.0),
                CareEventType.Water to CareDetails.Water(WaterObservation.Measured, Double.NaN),
                CareEventType.Litter to CareDetails.Litter(LitterObservation.Nothing, urineAmount = ObservedAmount.Usual),
                CareEventType.Litter to CareDetails.Litter(LitterObservation.Urine, stoolConsistency = StoolConsistency.Soft),
                CareEventType.Litter to CareDetails.Litter(LitterObservation.Stool, visits = -1),
                CareEventType.Play to CareDetails.Play(PlayInterest.Interested, 0),
                CareEventType.Sleep to CareDetails.Sleep(SleepObservation.Asleep, 1441),
                CareEventType.Meal to CareDetails.Meal(offeredGrams = Double.POSITIVE_INFINITY),
                CareEventType.Note to CareDetails.Note(),
                CareEventType.Water to CareDetails.Sleep(SleepObservation.Resting),
            )
            invalid.forEach { (type, details) -> assertFailsWith<IllegalArgumentException> { repo.createEvent(cat.id, id(), CareEventInput(type, 200, details = details)) } }
            assertEquals(listOf(unmeasured), repo.observeEvents(cat.id).first())
            val note = repo.createEvent(cat.id, id(), CareEventInput(CareEventType.Note, 300, "  A quiet day  ", CareDetails.Note()))
            assertEquals("A quiet day", note.note)
        } finally { repo.close() }
    }

    @Test fun failedCatSaveKeepsDraftAndRetryCommitsExactlyOnce() = runBlocking {
        val driver = driver(); val repo = repository(driver); repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val requestId = id()
            val draft = LocalDraft("{\"requestId\":\"$requestId\"}", listOf("draft-photo.jpg"))
            repo.saveDraft(cat.id, "event-new-litter", draft)
            val input = CareEventInput(CareEventType.Litter, 200, details = CareDetails.Litter(LitterObservation.Nothing), context = ObservationContext(photoId = "draft-photo.jpg"))
            driver.execute(null, "CREATE TRIGGER fail_cat BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
            assertFailsWith<Exception> { repo.createEvent(cat.id, requestId, input) }
            assertEquals(draft, repo.loadDraft(cat.id, "event-new-litter"))
            assertTrue(repo.observeEvents(cat.id).first().isEmpty())
            driver.execute(null, "DROP TRIGGER fail_cat", 0)
            val saved = repo.createEvent(cat.id, requestId, input)
            assertEquals(saved, repo.createEvent(cat.id, requestId, input))
            assertNull(repo.loadDraft(cat.id, "event-new-litter"))
            assertEquals(listOf(saved), repo.observeEvents(cat.id).first())
        } finally { repo.close() }
    }

    @Test fun everySupportedSchemaPreservesLegacyRecordsAndAvailableDraftsThroughV5() = runBlocking {
        assertEquals(5L, JournalSchema.version)
        for (source in 1L..4L) {
            val file = Files.createTempFile("soft-paws-v$source-", ".db").toFile()
            java.io.File("../shared/src/commonMain/sqldelight/databases/1.db").copyTo(file, overwrite = true)
            val driver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
            if (source > 1) JournalSchema.migrate(driver, 1, source)
            driver.execute(null, "PRAGMA foreign_keys=ON", 0)
            val owner = id(); val cat = id(); val event = id()
            driver.execute(null, "INSERT INTO local_owner VALUES (1, '$owner', 90)", 0)
            driver.execute(null, "INSERT INTO dogs(id, owner_id, name, created_at) VALUES ('$cat', '$owner', 'Legacy companion', 100)", 0)
            driver.execute(null, "INSERT INTO care_events(id, dog_id, type, occurred_at, created_at, note) VALUES ('$event', '$cat', 'walk', 200, 110, 'Original walk')", 0)
            if (source >= 2) driver.execute(null, "UPDATE care_events SET details_json='{\"kind\":\"walk\",\"durationMinutes\":18}', revision=3, updated_at=220", 0)
            if (source >= 3) {
                driver.execute(null, "UPDATE care_events SET context_json='{\"photoId\":\"legacy-photo.jpg\"}'", 0)
                driver.execute(null, "INSERT INTO care_drafts VALUES ('$cat', 'event-new-walk', '{\"first\":\"25\"}', '[\"draft-photo.jpg\"]')", 0)
                driver.execute(null, "INSERT INTO device_cleanup VALUES ('photo', 'pending-photo.jpg', 7)", 0)
            }
            if (source >= 4) driver.execute(null, "INSERT INTO local_documents VALUES ('legacy-draft', '$cat', '{\"name\":\"Unfinished\"}')", 0)
            JournalSchema.migrate(driver, source, JournalSchema.version)
            driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
            val repo = repository(driver); repo.initialize()
            try {
                val legacy = repo.observeEvent(cat, event).first()!!
                assertEquals(CareEventType.Walk, legacy.type); assertEquals(200L, legacy.occurredAtMillis); assertEquals(110L, legacy.createdAtMillis)
                assertEquals("Original walk", legacy.note)
                assertEquals(if (source >= 2) CareDetails.Walk(18) else null, legacy.details)
                assertEquals(if (source >= 2) 3L else 1L, legacy.revision)
                if (source >= 3) {
                    assertEquals("legacy-photo.jpg", legacy.context.photoId)
                    assertEquals(LocalDraft("{\"first\":\"25\"}", listOf("draft-photo.jpg")), repo.loadDraft(cat, "event-new-walk"))
                    assertEquals("7", scalar(driver, "SELECT generation FROM device_cleanup"))
                }
                if (source >= 4) assertEquals("{\"name\":\"Unfinished\"}", scalar(driver, "SELECT value_json FROM local_documents WHERE id='legacy-draft'"))
                assertNull(scalar(driver, "PRAGMA foreign_key_check"))
                val added = repo.createEvent(cat, id(), CareEventInput(CareEventType.Play, 300, details = CareDetails.Play(PlayInterest.Rested)))
                assertEquals(listOf(added.id, event), repo.observeEvents(cat).first().map { it.id })
                assertEquals("2", scalar(driver, "SELECT count(*) FROM sqlite_master WHERE type='index' AND name IN ('events_dog_time','events_dog_type_time')"))
            } finally { repo.close(); file.delete() }
        }
    }

    @Test fun legacyProfileJsonDefaultsDoNotInventCatLifestyleOrChangeStage() {
        val legacy = Json.decodeFromString(DogContext.serializer(), "{\"stage\":\"Puppy\"}")
        legacy.validate(); assertEquals("Puppy", legacy.stage); assertEquals("Not sure", legacy.lifestyle)
        assertFalse(legacy.facts().any { it.first == "Lifestyle" })
        DogContext(stage = "Mature", lifestyle = "Indoor & outdoor").validate()
        assertFailsWith<IllegalArgumentException> { DogContext(lifestyle = "Made up").validate() }
    }

    @Test fun catSafetyUsesFelineSourcesAndRoutesUrgentLitterConcernsToContacts() {
        assertNotNull(SafetyReference.lookup("lily pollen"))
        assertNull(SafetyReference.lookup("xylitol")) // The inherited canine table is not relabelled.
        assertTrue(SafetyReference.topics.first { it.id == "urination" }.source.contains("feline-lower-urinary"))
        for (question in listOf("My cat cannot urinate", "Straining with little urine", "She ate lily pollen", "Dog flea treatment on my cat")) {
            assertTrue(com.dracoarts.shared.presentation.companion.ChatHealth.urgent(question), question)
        }
        assertFalse(com.dracoarts.shared.presentation.companion.ChatHealth.urgent("How can I remember meals?"))
    }

    private fun scalar(driver: SqlDriver, sql: String): String? = driver.executeQuery(null, sql, { cursor -> QueryResult.Value(if (cursor.next().value) cursor.getString(0) else null) }, 0).value
}
