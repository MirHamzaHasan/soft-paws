package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.presentation.state.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*
import java.util.UUID
import kotlin.test.*

class CompleteJournalTest {
    private fun id() = UUID.randomUUID().toString()
    private fun store(block: suspend (SqlDelightJournalRepository, SqlDriver) -> Unit) = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0); driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000L }, Dispatchers.Unconfined)
        repo.initialize()
        try { block(repo, driver) } finally { repo.close() }
    }

    @Test fun expenseDescriptionAndPdfReceiptArePreservedAndScopedCleanupProtectsDrafts() = store { repo, _ ->
        val dog = repo.addDog("Bruno"); val pdf = id() + ".pdf"
        val data = CareItemData.Expense(800000, "PKR", "Vet", "2026-10-12", receiptId = pdf, description = "Clinic visit")
        val saved = repo.saveItem(dog.id, id(), 200, data)
        assertEquals(data, repo.observeItems(dog.id).first().single().data)
        repo.saveDraft(dog.id, "expense-new", LocalDraft("{}", listOf(pdf)))
        repo.deleteItem(saved)
        assertTrue(repo.photoReferenced(pdf))
        repo.discardDraft(dog.id, "expense-new")
        assertFalse(repo.photoReferenced(pdf))
        assertTrue(repo.pendingCleanup().any { it.reference == pdf })
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(data.copy(receiptId = "../outside.pdf")) }
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(CareItemData.Photo(pdf, "Image", "2026-10-12")) }
        val legacy = kotlinx.serialization.json.Json.decodeFromString(CareItemData.serializer(), """{"type":"expense","minorUnits":100,"currency":"USD","category":"Other","date":"2026-10-12"}""") as CareItemData.Expense
        assertEquals("", legacy.description)
        assertEquals("8,000.00", Money.display(data.minorUnits, data.currency))
    }

    @Test fun profileCreateRetryEditConflictAndScopedDeletionPreserveTheOtherDog() = store { repo, driver ->
        val request = id(); val first = repo.addDog(" Bruno ", DogDetails(breed = "Mix", age = "4–7 years"), request)
        assertEquals(first, repo.addDog("Bruno", first.details, request)); assertEquals(1, repo.observeDogs().first().size)
        val second = repo.addDog("Luna")
        repo.logEvent(first.id, CareEventType.Walk, 200); val other = repo.logEvent(second.id, CareEventType.Meal, 300)
        val edited = repo.updateDog(first, "Bruno", first.details.copy(vetName = "Clinic", vetPhone = "+92 123 456"))
        assertEquals(2, edited.revision)
        assertFailsWith<RecordConflictException> { repo.updateDog(first, "Old overwrite", first.details) }
        driver.execute(null, "CREATE TRIGGER fail_delete BEFORE DELETE ON dogs BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
        assertFailsWith<Exception> { repo.deleteDog(first.id) }
        assertEquals(1, repo.observeEvents(first.id).first().size)
        driver.execute(null, "DROP TRIGGER fail_delete", 0)
        repo.deleteDog(first.id)
        assertEquals(listOf(second.id), repo.observeDogs().first().map { it.id })
        assertEquals(listOf(other), repo.observeEvents(second.id).first())
    }

    @Test fun administrationFactsStayUnchangedAfterPlanEditAndArchive() = store { repo, _ ->
        val dog = repo.addDog("Bruno")
        val plan = repo.saveItem(dog.id, id(), 100, CareItemData.Medication("Recorded medication", "Caregiver amount", startDate = "2026-10-15"))
        val givenId = id(); val given = CareItemData.Administration(plan.id, "Recorded medication", "Caregiver amount")
        val administration = repo.recordActivity(dog.id, givenId, 200, given)
        assertEquals(administration, repo.recordActivity(dog.id, givenId, 200, given))
        val data = plan.data as CareItemData.Medication
        repo.saveItem(dog.id, plan.id, plan.occurredAt, data.copy(amount = "Updated caregiver amount", archived = true), plan.revision)
        assertEquals(given, repo.observeItems(dog.id).first().first { it.id == givenId }.data)
        assertEquals("Caregiver amount", (repo.observeEvent(dog.id, givenId).first()!!.details as CareDetails.Medication).amount)
        assertFailsWith<RecordConflictException> { repo.recordActivity(dog.id, id(), 300, given) }
    }

    @Test fun trainingSessionAndTimelineRollBackTogetherAndRetryIsIdempotent() = store { repo, driver ->
        val dog = repo.addDog("Bruno")
        repo.saveItem(dog.id, id(), 100, CareItemData.Enrollment("name-response"))
        val request = id(); val session = CareItemData.Session("name-response", 2, 120, "Getting there", "Calm", "Waited for a look.", 3)
        driver.execute(null, "CREATE TRIGGER fail_activity BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
        assertFailsWith<Exception> { repo.recordActivity(dog.id, request, 200, session) }
        assertTrue(repo.observeItems(dog.id).first().none { it.data is CareItemData.Session })
        assertTrue(repo.observeEvents(dog.id).first().isEmpty())
        driver.execute(null, "DROP TRIGGER fail_activity", 0)
        repo.recordActivity(dog.id, request, 200, session); repo.recordActivity(dog.id, request, 200, session)
        assertEquals(1, repo.observeItems(dog.id).first().count { it.data is CareItemData.Session })
        val event = repo.observeEvents(dog.id).first().single()
        repo.deleteEvent(dog.id, event.id, event.revision)
        assertTrue(repo.observeItems(dog.id).first().none { it.data is CareItemData.Session })
        assertTrue(repo.observeEvents(dog.id).first().isEmpty())
    }

    @Test fun recurrenceCompletionRejectsWrongDateAndDuplicateAndKeepsHistoryOnTaskDelete() = store { repo, _ ->
        val dog = repo.addDog("Bruno")
        val data = CareItemData.Task("Brush coat", "2026-10-15", "09:00", "Asia/Karachi", repeat = Repeat.Weekly)
        val task = repo.saveItem(dog.id, id(), 100, data)
        assertFailsWith<IllegalArgumentException> { repo.recordActivity(dog.id, id(), 200, CareItemData.Completion(task.id, data.title, "2026-10-16")) }
        val request = id(); val completion = CareItemData.Completion(task.id, data.title, "2026-10-15")
        repo.recordActivity(dog.id, request, 300, completion)
        assertFailsWith<IllegalArgumentException> { repo.recordActivity(dog.id, id(), 400, completion) }
        repo.deleteItem(task)
        assertEquals(completion, repo.observeItems(dog.id).first().single().data)
        assertEquals(CareEventType.Task, repo.observeEvents(dog.id).first().single().type)
        assertTrue(repo.pendingCleanup().any { it.kind == "reminder" && it.reference == task.id })
    }

    @Test fun overdueOccurrencesRespectRepeatsCompletedDatesAndShortMonths() {
        val monthly = CareItemData.Task("Refill", "2026-01-31", "09:00", "UTC", repeat = Repeat.Monthly)
        assertEquals(LocalDate(2026, 1, 31), CareSchedule.latestUncompletedBefore(monthly, LocalDate(2026, 3, 1)))
        assertEquals(LocalDate(2026, 3, 31), CareSchedule.latestUncompletedBefore(monthly, LocalDate(2026, 5, 1)))
        assertNull(CareSchedule.latestUncompletedBefore(monthly, LocalDate(2026, 3, 1), setOf("2026-01-31")))
        val weekly = monthly.copy(date = "2026-01-05", repeat = Repeat.Weekly)
        assertEquals(LocalDate(2026, 10, 12), CareSchedule.latestUncompletedBefore(weekly, LocalDate(2026, 10, 14)))
        assertEquals(LocalDate(2026, 10, 5), CareSchedule.latestUncompletedBefore(weekly, LocalDate(2026, 10, 14), setOf("2026-10-12")))
        assertNull(CareSchedule.latestUncompletedBefore(monthly.copy(repeat = Repeat.None), LocalDate(2026, 2, 1), setOf("2026-01-31")))
    }

    @Test fun recordedWalkTrendsUseTypedMinutesAndInclusiveLocalDatesOnly() {
        val zone = TimeZone.of("Asia/Karachi")
        fun walk(at: String, minutes: Int?, note: String? = null) = CareEvent(id(), "dog", CareEventType.Walk, java.time.Instant.parse(at).toEpochMilli(), 100, note, minutes?.let { CareDetails.Walk(it) })
        val records = listOf(walk("2026-10-07T19:00:00Z", 20), walk("2026-10-14T18:59:00Z", 24), walk("2026-10-14T19:00:00Z", 40), walk("2026-10-10T12:00:00Z", null, "A 90 minute walk, in a free-text note"))
        val trend = RecordedWalkTrend.from(records, LocalDate(2026, 10, 14), 7, zone)
        assertEquals(LocalDate(2026, 10, 8), trend.from)
        assertEquals(44L, trend.minutes)
        assertEquals(7, trend.buckets.size)
        assertEquals(1, trend.walksWithoutDuration)
        assertEquals(2, trend.buckets.sumOf { it.recordedDurations })
        val month = RecordedWalkTrend.from(records, LocalDate(2026, 10, 14), 30, zone)
        assertEquals(4, month.buckets.size); assertEquals(LocalDate(2026, 9, 15), month.buckets.first().from)
        val quarter = RecordedWalkTrend.from(records, LocalDate(2026, 10, 14), 90, zone)
        assertEquals(LocalDate(2026, 7, 17), quarter.from); assertEquals(4, quarter.buckets.size)
        assertEquals(44L, quarter.minutes)
    }

    @Test fun typedRecordsRejectCrossDogMemoriesAndRetainMissingSourceCaption() = store { repo, _ ->
        val dog = repo.addDog("Bruno"); val other = repo.addDog("Luna")
        val event = repo.logEvent(dog.id, CareEventType.Walk, 200)
        val foreign = repo.logEvent(other.id, CareEventType.Meal, 300)
        assertFailsWith<IllegalArgumentException> { repo.saveItem(dog.id, id(), 400, CareItemData.Memory(listOf(foreign.id))) }
        val memory = repo.saveItem(dog.id, id(), 400, CareItemData.Memory(listOf(event.id), "A quiet afternoon"))
        repo.deleteEvent(dog.id, event.id, event.revision)
        repo.saveItem(dog.id, memory.id, memory.occurredAt, (memory.data as CareItemData.Memory).copy(caption = "My own words"), memory.revision)
        assertEquals("My own words", (repo.observeItems(dog.id).first().single().data as CareItemData.Memory).caption)
    }

    @Test fun draftAndPrivateFileCleanupAreTransactionalAndProtectRetainedReferences() = store { repo, driver ->
        val dog = repo.addDog("Bruno"); val file = id() + ".jpg"; val replacement = id() + ".jpg"
        repo.saveDraft(dog.id, "photo-new", LocalDraft("{\"note\":\"not yet saved\"}", listOf(file)))
        assertTrue(repo.photoReferenced(file))
        val photo = repo.saveItem(dog.id, id(), 200, CareItemData.Photo(file, "A day outside", "2026-10-15"), draftSlot = "photo-new")
        assertNull(repo.loadDraft(dog.id, "photo-new")); assertTrue(repo.photoReferenced(file))
        val oldJob = repo.pendingCleanup().single()
        repo.saveItem(dog.id, photo.id, photo.occurredAt, (photo.data as CareItemData.Photo).copy(fileId = replacement), photo.revision)
        assertFalse(repo.photoReferenced(file)); assertTrue(repo.photoReferenced(replacement))
        repo.acknowledgeCleanup(oldJob)
        assertTrue(repo.pendingCleanup().any { it.reference == file && it.generation > oldJob.generation })
        val draft = LocalDraft("{\"notes\":\"keep on failure\"}")
        repo.saveDraft(dog.id, "expense-new", draft)
        driver.execute(null, "CREATE TRIGGER fail_item BEFORE INSERT ON care_items BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
        assertFailsWith<Exception> { repo.saveItem(dog.id, id(), 300, CareItemData.Expense(1234, "USD", "Food", "2026-10-15"), draftSlot = "expense-new") }
        assertEquals(draft, repo.loadDraft(dog.id, "expense-new"))
    }

    @Test fun richObservationContextSurvivesEditAndDeletionQueuesOnlyOwnedAttachment() = store { repo, _ ->
        val dog = repo.addDog("Bruno"); val file = id() + ".jpg"
        val context = ObservationContext("Riverside", "Caregiver", file, mapOf("Pace" to "Easy stroll", "Route" to "Shaded path"))
        val event = repo.createEvent(dog.id, id(), CareEventInput(CareEventType.Walk, 200, "Full note", CareDetails.Walk(25), context))
        assertEquals(context, repo.observeEvent(dog.id, event.id).first()!!.context)
        val updated = repo.updateEvent(dog.id, event.id, 1, CareEventInput(CareEventType.Walk, 250, "Edited note", event.details, context.copy(location = "Park")))
        assertEquals("Park", updated.context.location); assertTrue(repo.photoReferenced(file))
        repo.deleteEvent(dog.id, updated.id, updated.revision)
        assertFalse(repo.photoReferenced(file)); assertEquals(file, repo.pendingCleanup().single().reference)
    }

    @Test fun monetaryAmountsKeepExactCurrencyPrecisionAndRejectInvalidInput() {
        assertEquals(101L, Money.parse("1.01", "USD")); assertEquals(101L, Money.parse("101", "JPY")); assertEquals(1001L, Money.parse("1.001", "KWD"))
        assertEquals("1.01", Money.format(101, "USD")); assertEquals("1.001", Money.format(1001, "KWD"))
        listOf("-1", "0", "1.001", "1e3", "NaN", "1,000", "9999999999999").forEach { value -> assertFailsWith<IllegalArgumentException> { Money.parse(value, "USD") } }
        assertFailsWith<IllegalArgumentException> { Money.parse("1.1", "JPY") }
    }

    @Test fun monthlyAndDstSchedulesMatchDocumentedCalendarRules() {
        val monthly = CareItemData.Task("Check supplies", "2026-01-31", "09:00", "America/New_York", repeat = Repeat.Monthly)
        assertFalse(CareSchedule.occurs(monthly, LocalDate(2026, 2, 28)))
        assertTrue(CareSchedule.occurs(monthly, LocalDate(2026, 3, 31)))
        val daily = monthly.copy(date = "2026-03-07", repeat = Repeat.Daily)
        val before = CareSchedule.time(daily, LocalDate(2026, 3, 7)); val after = CareSchedule.time(daily, LocalDate(2026, 3, 8))
        assertEquals(23 * 60 * 60 * 1000L, after - before)
        assertEquals(LocalDate(2026, 3, 9), CareSchedule.next(daily, before, setOf("2026-03-08"))!!.first)
    }

    @Test fun csvProtectsFormulaCellsAndPreservesQuotesAndMultilineNotes() {
        assertEquals("\"'=1+1\"", JournalReport.csvCell("=1+1"))
        assertEquals("\"  '@test\"".replace("  '", "'  "), JournalReport.csvCell("  @test"))
        assertEquals("\"a,\"\"b\"\"\nc\"", JournalReport.csvCell("a,\"b\"\nc"))
    }
}
