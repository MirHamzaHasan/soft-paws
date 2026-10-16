package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.managers.DisabledHaptics
import com.dracoarts.shared.presentation.review.*
import com.dracoarts.shared.presentation.state.EventController
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.util.UUID
import kotlin.test.*

class BoardRecoveryTest {
    private suspend fun withJournal(block: suspend (SqlDelightJournalRepository) -> Unit) {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver)
        driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        val repository = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { BoardReviewFixture.now }, Dispatchers.Unconfined)
        repository.initialize()
        try { BoardReviewFixture.seed(repository, BoardReviewDataSet.Full); block(repository) }
        finally { repository.close() }
    }

    @Test fun failedSaveRetainsDraftAndRetryCommitsExactlyOneRecord() = runBlocking { withJournal { real ->
        val faults = BoardReviewFaults("save-error").apply { arm() }
        val access = faults.repository(real, real)
        val id = UUID.randomUUID().toString()
        val input = CareEventInput(CareEventType.Meal, BoardReviewFixture.now, "Keep this note", CareDetails.Meal("Dry food", "120 g"))
        real.saveDraft(BoardReviewFixture.dogId, "event-new-meal", LocalDraft("{\"note\":\"owned retained draft\"}"))
        val before = real.observeEvents(BoardReviewFixture.dogId).first()
        val controller = EventController(access, DisabledHaptics)
        assertNull(controller.create(BoardReviewFixture.dogId, id, input))
        assertEquals(before, real.observeEvents(BoardReviewFixture.dogId).first())
        assertNotNull(real.loadDraft(BoardReviewFixture.dogId, "event-new-meal"))
        assertNotNull(controller.state.value.error)
        val committed = assertNotNull(controller.create(BoardReviewFixture.dogId, id, input))
        assertEquals(committed, controller.create(BoardReviewFixture.dogId, id, input))
        assertEquals(1, real.observeEvents(BoardReviewFixture.dogId).first().count { it.id == id })
        assertNull(real.loadDraft(BoardReviewFixture.dogId, "event-new-meal"))
    } }

    @Test fun administrationFailureAddsNeitherActivityNorTimelineAndRetryIsAtomic() = runBlocking { withJournal { real ->
        val faults = BoardReviewFaults("medication-save-error").apply { arm() }
        val access = faults.repository(real, real)
        val id = UUID.randomUUID().toString()
        val data = CareItemData.Administration(BoardReviewFixture.itemId(200), "Example medication", "5 mg")
        assertFailsWith<IllegalStateException> { access.recordActivity(BoardReviewFixture.dogId, id, BoardReviewFixture.now, data) }
        assertFalse(real.observeItems(BoardReviewFixture.dogId).first().any { it.id == id })
        assertNull(real.observeEvent(BoardReviewFixture.dogId, id).first())
        val committed = access.recordActivity(BoardReviewFixture.dogId, id, BoardReviewFixture.now, data)
        assertEquals(committed, access.recordActivity(BoardReviewFixture.dogId, id, BoardReviewFixture.now, data))
        assertEquals(1, real.observeItems(BoardReviewFixture.dogId).first().count { it.id == id })
        assertNotNull(real.observeEvent(BoardReviewFixture.dogId, id).first())
    } }

    @Test fun staleEditNeverOverwritesNewerCommittedRevision() = runBlocking { withJournal { real ->
        val faults = BoardReviewFaults("stale-record").apply { arm() }
        val access = faults.repository(real, real)
        val old = real.observeEvent(BoardReviewFixture.dogId, BoardReviewFixture.itemId(100)).first()!!
        val controller = EventController(access, DisabledHaptics)
        val input = CareEventInput(old.type, old.occurredAtMillis, "My retained draft", old.details, old.context)
        assertNull(controller.update(old, input))
        assertTrue(controller.state.value.conflict)
        val newer = real.observeEvent(old.dogId, old.id).first()!!
        assertEquals(old.revision + 1, newer.revision)
        assertEquals("A newer owned QA observation", newer.note)
        assertNull(controller.update(old, input))
        assertEquals(newer, real.observeEvent(old.dogId, old.id).first())
        controller.clearError(); assertFalse(controller.state.value.conflict)
    } }

    @Test fun readRetryReopensSameRecordsAndUnarmedFaultsDoNotAlterOperations() = runBlocking { withJournal { real ->
        val faults = BoardReviewFaults("journal-error")
        val access = faults.repository(real, real)
        val before = access.observeDogs().first()
        faults.arm()
        assertFailsWith<IllegalStateException> { access.observeDogs().first() }
        assertEquals(before, access.observeDogs().first())
        val unarmed = BoardReviewFaults("save-error").repository(real, real)
        val event = unarmed.createEvent(BoardReviewFixture.dogId, UUID.randomUUID().toString(), CareEventInput(CareEventType.Walk, BoardReviewFixture.now))
        assertEquals(event, real.observeEvent(event.dogId, event.id).first())
    } }
}
