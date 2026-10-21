@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.FeatureForm
import com.dracoarts.shared.presentation.state.TaskReminders
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*
import kotlin.time.Instant

class CatCarePlanningTest {
    private fun id() = UUID.randomUUID().toString()
    private fun create(driver: SqlDriver) { JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0); driver.execute(null, "PRAGMA foreign_keys=ON", 0) }
    private fun repo(driver: SqlDriver) = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000L }, Dispatchers.Unconfined)
    private fun store(block: suspend (SqlDelightJournalRepository, SqlDriver) -> Unit) = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); create(driver)
        val repository = repo(driver); repository.initialize()
        try { block(repository, driver) } finally { repository.close() }
    }
    private fun task() = CareItemData.Task("Brush coat", "2026-11-01", "09:00", "UTC", "Grooming", Repeat.Daily, "Caregiver's own plan")

    @Test fun legacyMonthlyPlanAndDraftReopenWithoutLosingZoneNotesOrUnfinishedEdits() = runBlocking {
        val legacy = Json.decodeFromString(CareItemData.serializer(), """{"type":"task","title":"Refill","date":"2026-01-31","time":"08:30","zoneId":"Asia/Karachi","category":"Refill","repeat":"Monthly","notes":"Retained note","remind":true}""") as CareItemData.Task
        val completed = Json.decodeFromString(CareItemData.serializer(), """{"type":"completion","taskId":"old-plan","title":"Refill","dueDate":"2026-01-31"}""") as CareItemData.Completion
        assertNull(completed.taskRevision)
        val draft = FeatureForm("stable-id", mapOf("title" to "Refill", "notes" to "Retained note"))
        draft["title"] = "An unfinished edit"
        val restored = FeatureForm("new-id", mapOf("title" to "", "notes" to "", "zone" to "Asia/Karachi", "remind" to "false"))
        restored.restore(draft.encode())
        assertEquals("stable-id", restored.requestId); assertEquals("An unfinished edit", restored["title"])
        assertEquals("Retained note", restored["notes"]); assertEquals("Asia/Karachi", restored["zone"])
        val file = Files.createTempFile("soft-paws-planning-", ".db").toFile()
        val driver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}"); create(driver)
        var repository = repo(driver); repository.initialize()
        try {
            val cat = repository.addDog("Miso")
            val saved = repository.saveItem(cat.id, id(), 200, legacy)
            repository.close(); repository = repo(JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")); repository.initialize()
            val actual = repository.observeItems(cat.id).first().single()
            assertEquals(saved, actual)
            assertTrue(CareAgenda.day(cat.id, listOf(actual), kotlinx.datetime.LocalDate.parse("2026-02-28")).isEmpty())
            assertEquals(saved, CareAgenda.day(cat.id, listOf(actual), kotlinx.datetime.LocalDate.parse("2026-03-31")).single().item)
        } finally { repository.close(); file.delete() }
        val navigation = AppState(); navigation.show(Route.Care); navigation.open(Feature.Calendar)
        navigation.rememberCalendarDay("2026-11-01"); navigation.open(Feature.TaskForm, "new@2026-11-01")
        val reopened = AppState.Saver.restore(navigation.savedValue())!!
        reopened.back()
        assertEquals(FeaturePage(Feature.Calendar, "2026-11-01"), reopened.featurePage)
        reopened.rememberCalendarDay("2026-10-19", "2026-10-20")
        reopened.open(Feature.TaskDetail, "retained-plan@2026-10-19")
        val secondRestore = AppState.Saver.restore(reopened.savedValue())!!
        secondRestore.back()
        assertEquals(FeaturePage(Feature.Calendar, "2026-10-19@2026-10-20"), secondRestore.featurePage)
        secondRestore.openReminder(Feature.TaskDetail, "retained-plan@2026-11-02")
        assertEquals(FeaturePage(Feature.Calendar, "2026-11-02"), secondRestore.featureStack.first())
    }

    @Test fun completionRejectsStalePlanAndRollsBackTheItemWhenJournalInsertFails() = store { repository, driver ->
        val cat = repository.addDog("Miso"); val other = repository.addDog("Juniper")
        val first = repository.saveItem(cat.id, id(), 200, task())
        val input = CareItemData.Completion(first.id, task().title, "2026-11-01", first.revision)
        val changed = repository.saveItem(cat.id, first.id, first.occurredAt, task().copy(time = "10:00"), first.revision)
        assertFailsWith<RecordConflictException> { repository.recordActivity(cat.id, id(), 300, input) }
        assertFailsWith<RecordNotFoundException> { repository.recordActivity(other.id, id(), 300, input) }
        val current = input.copy(taskRevision = changed.revision)
        val request = id()
        driver.execute(null, "CREATE TRIGGER fail_task_event BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'owned disk failure'); END", 0)
        assertFailsWith<Exception> { repository.recordActivity(cat.id, request, 300, current) }
        assertTrue(repository.observeItems(cat.id).first().none { it.id == request })
        assertTrue(repository.observeEvents(cat.id).first().isEmpty())
        driver.execute(null, "DROP TRIGGER fail_task_event", 0)
        val saved = repository.recordActivity(cat.id, request, 300, current)
        assertEquals(saved, repository.recordActivity(cat.id, request, 300, current))
        assertFailsWith<IllegalArgumentException> { repository.recordActivity(cat.id, id(), 301, current) }
        assertEquals(1, repository.observeEvents(cat.id).first().size)
    }

    @Test fun undoUsesCapturedJournalRevisionAndRollsBackBothDeletesBeforeAStableRetry() = store { repository, driver ->
        val cat = repository.addDog("Miso"); val other = repository.addDog("Juniper")
        val plan = repository.saveItem(cat.id, id(), 200, task())
        val given = repository.recordActivity(cat.id, id(), 300, CareItemData.Completion(plan.id, task().title, "2026-11-01", plan.revision))
        val next = repository.recordActivity(cat.id, id(), 301, CareItemData.Completion(plan.id, task().title, "2026-11-02", plan.revision))
        val event = repository.observeEvent(cat.id, given.id).first()!!
        val photo = id()+".jpg"
        val edited = repository.updateEvent(cat.id, event.id, event.revision,
            CareEventInput(event.type, event.occurredAtMillis, "A later caregiver note", event.details, event.context.copy(photoId = photo)))
        assertFailsWith<RecordConflictException> { repository.undoTaskCompletion(given, event.revision) }
        assertEquals(edited, repository.observeEvent(cat.id, given.id).first())
        driver.execute(null, "CREATE TRIGGER fail_task_undo BEFORE DELETE ON care_items WHEN OLD.id='${given.id}' BEGIN SELECT RAISE(ABORT, 'owned disk failure'); END", 0)
        assertFailsWith<Exception> { repository.undoTaskCompletion(given, edited.revision) }
        assertEquals(edited, repository.observeEvent(cat.id, given.id).first())
        assertTrue(repository.observeItems(cat.id).first().any { it.id == given.id })
        assertTrue(repository.pendingCleanup().none { it.reference == photo })
        driver.execute(null, "DROP TRIGGER fail_task_undo", 0)
        repository.undoTaskCompletion(given, edited.revision)
        assertNull(repository.observeEvent(cat.id, given.id).first())
        assertTrue(repository.observeItems(cat.id).first().none { it.id == given.id })
        assertTrue(repository.pendingCleanup().any { it.reference == photo })
        assertNotNull(repository.observeEvent(cat.id, next.id).first())
        assertTrue(repository.observeItems(cat.id).first().any { it.id == plan.id })
        assertTrue(repository.observeEvents(other.id).first().isEmpty())
        assertFailsWith<RecordNotFoundException> { repository.undoTaskCompletion(given, edited.revision) }
    }

    @Test fun agendaIsCatIsolatedAndDeletedPlansKeepTheirRecordedOccurrences() = store { repository, _ ->
        val cat = repository.addDog("Miso"); val other = repository.addDog("Juniper")
        val first = repository.saveItem(cat.id, id(), 200, task())
        val later = repository.saveItem(cat.id, id(), 201, task().copy(title = "Refill", time = "08:00", zoneId = "America/New_York"))
        val independent = repository.saveItem(other.id, id(), 202, task().copy(title = "Other cat"))
        val complete = repository.recordActivity(cat.id, id(), 300, CareItemData.Completion(first.id, task().title, "2026-11-01", first.revision))
        val all = repository.observeItems(cat.id).first() + repository.observeItems(other.id).first()
        val agenda = CareAgenda.day(cat.id, all, kotlinx.datetime.LocalDate.parse("2026-11-01"))
        assertEquals(listOf(later.id, first.id), agenda.map { it.item.id })
        assertEquals(complete.id, agenda.last().completion?.id)
        assertTrue(agenda.none { it.item.id == independent.id })
        assertEquals(Instant.parse("2026-11-01T13:00:00Z").toEpochMilliseconds(), agenda.first().atMillis)
        val nextDay = CareAgenda.day(cat.id, all, kotlinx.datetime.LocalDate.parse("2026-11-02"))
        assertTrue(nextDay.all { it.completion == null })
        repository.deleteItem(first)
        assertNotNull(repository.observeEvent(cat.id, complete.id).first())
        assertTrue(repository.observeItems(cat.id).first().any { it.id == complete.id })
        assertTrue(repository.pendingCleanup().any { it.kind == "reminder" && it.reference == first.id })
    }

    @Test fun completedReminderIsCancelledUndoRestoresItAndDeviceFailureKeepsTheTask() = store { repository, _ ->
        val cat = repository.addDog("Miso")
        val saved = repository.saveItem(cat.id, id(), 200, task().copy(repeat = Repeat.None, remind = true))
        val complete = repository.recordActivity(cat.id, id(), 300, CareItemData.Completion(saved.id, task().title, "2026-11-01", saved.revision))
        val device = ReminderDevice()
        val now = Instant.parse("2026-11-01T08:00:00Z").toEpochMilliseconds()
        val due = Instant.parse("2026-11-01T09:00:00Z").toEpochMilliseconds()
        val planned = saved.data as CareItemData.Task
        assertTrue(CareReminderSchedule.shouldDeliver(planned, due, due))
        assertFalse(CareReminderSchedule.shouldDeliver(planned.copy(time = "10:00"), due, due))
        assertFalse(CareReminderSchedule.shouldDeliver(planned.copy(time = "10:00"), due + 3_600_000, due))
        assertFalse(CareReminderSchedule.shouldDeliver(planned, now, null))
        assertTrue(CareReminderSchedule.shouldDeliver(planned, due, null))
        TaskReminders.refresh(saved, repository.observeItems(cat.id).first(), device, now)
        assertEquals(listOf(saved.id), device.cancelled); assertTrue(device.requests.isEmpty())
        repository.undoTaskCompletion(complete, repository.observeEvent(cat.id, complete.id).first()!!.revision)
        assertTrue(TaskReminders.refresh(saved, repository.observeItems(cat.id).first(), device, now).contains("Notifications are off"))
        assertEquals(false, device.requests.last().second)
        device.result = DeviceResult.Failed("Owned scheduling failure")
        assertTrue(TaskReminders.refresh(saved, repository.observeItems(cat.id).first(), device, now, true).contains("Owned scheduling failure"))
        assertEquals(true, device.requests.last().second)
        assertEquals(saved, repository.observeItems(cat.id).first().single())
        repository.saveItem(cat.id, saved.id, saved.occurredAt, (saved.data as CareItemData.Task).copy(remind = false), saved.revision)
        assertTrue(repository.pendingCleanup().any { it.kind == "reminder" && it.reference == saved.id })
    }

    private class ReminderDevice : DeviceServices {
        var result: DeviceResult<Unit> = DeviceResult.Denied
        val requests = mutableListOf<Pair<ReminderRequest, Boolean>>()
        val cancelled = mutableListOf<String>()
        override val reminderOpens = MutableStateFlow<ReminderTarget?>(null)
        override fun consumedReminder() {}
        override suspend fun pickPhoto(): DeviceResult<String> = DeviceResult.Cancelled
        override suspend fun photoBytes(fileId: String): ByteArray? = null
        override suspend fun removePhoto(fileId: String) {}
        override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> { requests += request to requestPermission; return result }
        override suspend fun cancelReminder(id: String) { cancelled += id }
        override fun dial(number: String) = false
        override fun openSource(url: String) = false
    }
}
