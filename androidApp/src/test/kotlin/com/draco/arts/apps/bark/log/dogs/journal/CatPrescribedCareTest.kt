@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.screens.FeatureForm
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.MedicationReminders
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.json.Json
import kotlin.time.Instant
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*

class CatPrescribedCareTest {
    private fun id() = UUID.randomUUID().toString()
    private fun repo(driver: SqlDriver) = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000L }, Dispatchers.Unconfined)
    private fun create(driver: SqlDriver) { JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0); driver.execute(null, "PRAGMA foreign_keys=ON", 0) }
    private fun store(block: suspend (SqlDelightJournalRepository, SqlDriver) -> Unit) = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); create(driver)
        val repository = repo(driver); repository.initialize()
        try { block(repository, driver) } finally { repository.close() }
    }
    private fun plan() = CareItemData.Medication("Caregiver plan", "", "Exact directions copied from the clinic", startDate = "2026-11-01", time = "")

    @Test fun legacyJsonAndDraftsKeepTheirFactsAndReceiveOnlyOptionalDefaults() {
        val medication = Json.decodeFromString(CareItemData.serializer(), """{"type":"medication","name":"Legacy plan","amount":"Entered amount","startDate":"2026-10-20"}""") as CareItemData.Medication
        assertNull(medication.reminder); assertEquals("20:00", medication.time); assertEquals("", medication.directions)
        CareItemRules.validate(medication)
        val vaccination = Json.decodeFromString(CareItemData.serializer(), """{"type":"vaccination","name":"Clinic record","date":"2026-10-20"}""") as CareItemData.Vaccination
        assertNull(vaccination.documentId)
        val administration = Json.decodeFromString(CareItemData.serializer(), """{"type":"administration","planId":"legacy-id","name":"Legacy plan","amount":"Entered amount"}""") as CareItemData.Administration
        assertEquals("", administration.instructions); assertNull(administration.planRevision)
        val previous = FeatureForm("stable-request", mapOf("name" to "Legacy draft", "amount" to "Entered amount"))
        previous["name"] = "An unfinished edit"
        val reopened = FeatureForm("new-request", mapOf("name" to "", "amount" to "", "remind" to "false", "reminderZone" to "Asia/Karachi", "document" to ""))
        reopened.restore(previous.encode())
        assertEquals("stable-request", reopened.requestId); assertEquals("An unfinished edit", reopened["name"])
        assertEquals("Entered amount", reopened["amount"]); assertEquals("false", reopened["remind"])
        assertEquals("Asia/Karachi", reopened["reminderZone"]); assertTrue(reopened.dirty)
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(plan().copy(directions = "")) }
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(vaccination.copy(documentId = "../private.pdf")) }
    }

    @Test fun instructionSnapshotsReopenAndRejectAChangedPlanWithoutRewritingHistory() = runBlocking {
        val file = Files.createTempFile("soft-paws-prescribed-", ".db").toFile()
        val driver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}"); create(driver)
        var repository = repo(driver); repository.initialize()
        try {
            val cat = repository.addDog("Miso"); val other = repository.addDog("Juniper")
            val original = repository.saveItem(cat.id, id(), 200, plan())
            val data = original.data as CareItemData.Medication
            val request = id()
            val input = CareItemData.Administration(original.id, data.name, data.amount, data.directions, original.revision)
            val given = repository.recordActivity(cat.id, request, 300, input)
            assertEquals(given, repository.recordActivity(cat.id, request, 300, input))
            val changed = repository.saveItem(cat.id, original.id, original.occurredAt, data.copy(directions = "Updated directions entered by caregiver"), original.revision)
            assertFailsWith<RecordConflictException> { repository.recordActivity(cat.id, id(), 350, input) }
            assertFailsWith<RecordNotFoundException> { repository.recordActivity(other.id, id(), 350, input) }
            val archived = repository.saveItem(cat.id, changed.id, changed.occurredAt, (changed.data as CareItemData.Medication).copy(archived = true), changed.revision)
            assertFailsWith<RecordConflictException> { repository.recordActivity(cat.id, id(), 400, input.copy(instructions = (archived.data as CareItemData.Medication).directions, planRevision = archived.revision)) }
            repository.close(); repository = repo(JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")); repository.initialize()
            assertEquals(input, repository.observeItems(cat.id).first().first { it.id == request }.data)
            val event = repository.observeEvent(cat.id, request).first()!!
            val details = event.details as CareDetails.Medication
            assertEquals(data.directions, details.instructions)
            assertEquals("", details.amount)
            assertEquals(1, repository.observeEvents(cat.id).first().size)
            repository.deleteItem(archived)
            assertEquals(event, repository.observeEvent(cat.id, request).first())
            assertTrue(repository.pendingCleanup().any { it.kind == "reminder" && it.reference == original.id })
            assertTrue(repository.observeEvents(other.id).first().isEmpty())
        } finally { repository.close(); file.delete() }
    }

    @Test fun failedAdministrationRollsBackBothRowsAndKeepsTheStableRetryId() = store { repository, driver ->
        val cat = repository.addDog("Miso")
        val saved = repository.saveItem(cat.id, id(), 200, plan())
        val data = saved.data as CareItemData.Medication
        val request = id(); val input = CareItemData.Administration(saved.id, data.name, data.amount, data.directions, saved.revision)
        driver.execute(null, "CREATE TRIGGER fail_given BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'owned disk failure'); END", 0)
        assertFailsWith<Exception> { repository.recordActivity(cat.id, request, 300, input) }
        assertTrue(repository.observeItems(cat.id).first().none { it.id == request })
        assertTrue(repository.observeEvents(cat.id).first().isEmpty())
        driver.execute(null, "DROP TRIGGER fail_given", 0)
        repository.recordActivity(cat.id, request, 300, input); repository.recordActivity(cat.id, request, 300, input)
        assertEquals(1, repository.observeEvents(cat.id).first().size)
    }

    @Test fun vaccinationDocumentsStayReferencedThroughEditDraftReplacementAndScopedDeletion() = store { repository, _ ->
        val cat = repository.addDog("Miso"); val other = repository.addDog("Juniper")
        val pdf = id() + ".pdf"; val image = id() + ".jpg"
        val data = CareItemData.Vaccination("Clinic record", "2026-10-20", "Clinic", "Caregiver note", "2027-10-20", pdf)
        val first = repository.saveItem(cat.id, id(), 200, data)
        val independent = repository.saveItem(other.id, id(), 201, data)
        repository.saveDraft(cat.id, "vaccination-new", LocalDraft("{}", listOf(pdf)))
        val replacement = repository.saveItem(cat.id, first.id, first.occurredAt, data.copy(documentId = image), first.revision)
        assertTrue(repository.photoReferenced(pdf)); assertTrue(repository.photoReferenced(image))
        assertFailsWith<RecordConflictException> { repository.saveItem(cat.id, first.id, first.occurredAt, data.copy(documentId = null), first.revision) }
        repository.deleteItem(independent)
        assertTrue(repository.photoReferenced(pdf))
        repository.discardDraft(cat.id, "vaccination-new")
        assertFalse(repository.photoReferenced(pdf))
        assertTrue(repository.pendingCleanup().any { it.reference == pdf })
        val retained = repository.saveItem(cat.id, replacement.id, replacement.occurredAt, data.copy(documentId = null), replacement.revision)
        assertEquals(data.copy(documentId = null), retained.data)
        assertFalse(repository.photoReferenced(image))
        assertTrue(repository.pendingCleanup().any { it.reference == image })
    }

    @Test fun reminderScheduleUsesOnlyTheExplicitChoiceAndDoesNotTreatGivenAsACompletedTask() {
        val data = plan().copy(frequency = "Every other day as written", reminder = MedicationReminder("01:30", "America/New_York", Repeat.Daily))
        val task = CareReminderSchedule.task(data)!!
        val before = Instant.parse("2026-11-01T04:00:00Z").toEpochMilliseconds()
        val times = CareSchedule.upcoming(task, before, limit = 3)
        assertEquals(Instant.parse("2026-11-01T05:30:00Z").toEpochMilliseconds(), times[0])
        assertEquals(25 * 60 * 60 * 1000L, times[1] - times[0])
        assertEquals(Repeat.Daily, task.repeat)
        assertNull(CareReminderSchedule.task(data.copy(archived = true)))
        assertNull(CareReminderSchedule.task(data.copy(reminder = null)))
        val item = CareItem(id(), id(), 200, 200, 200, 1, data)
        val administration = item.copy(id = id(), data = CareItemData.Administration(item.id, data.name, data.amount, data.directions))
        assertTrue(CareReminderSchedule.completed(item, listOf(item, administration)).isEmpty())
        val navigation = AppState(); var action: (() -> Unit)? = null
        navigation.navigationHandler = { _, block -> action = block }
        navigation.openReminder(Feature.MedicationDetail, item.id)
        assertTrue(navigation.featureStack.isEmpty())
        action!!()
        assertEquals(Route.Care, navigation.route)
        assertEquals(listOf(FeaturePage(Feature.Medications), FeaturePage(Feature.MedicationDetail, item.id)), navigation.featureStack)
        assertEquals(navigation.savedValue(), AppState.Saver.restore(navigation.savedValue())!!.savedValue())
    }

    @Test fun deniedOrFailedNotificationNeverRemovesACommittedPlanAndArchiveCancelsItsId() = store { repository, _ ->
        val cat = repository.addDog("Miso")
        val data = plan().copy(reminder = MedicationReminder("09:00", "UTC", Repeat.Daily))
        val saved = repository.saveItem(cat.id, id(), 200, data)
        val device = ReminderDevice()
        val now = Instant.parse("2026-10-21T08:00:00Z").toEpochMilliseconds()
        assertTrue(MedicationReminders.refresh(saved, device, now).contains("Notifications are off"))
        assertEquals(saved, repository.observeItems(cat.id).first().single())
        assertEquals(false, device.requests.single().second)
        device.result = DeviceResult.Failed("Owned scheduling failure")
        assertTrue(MedicationReminders.refresh(saved, device, now, ask = true).contains("Owned scheduling failure"))
        assertEquals(true, device.requests.last().second)
        assertEquals(saved, repository.observeItems(cat.id).first().single())
        MedicationReminders.refresh(saved.copy(data = data.copy(archived = true)), device, now)
        assertEquals(listOf(saved.id), device.cancelled)
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
