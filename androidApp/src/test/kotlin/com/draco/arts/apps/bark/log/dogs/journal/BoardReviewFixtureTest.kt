package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import com.dracoarts.shared.presentation.review.BoardReviewPreferences
import com.dracoarts.shared.managers.StorageBackend
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.util.UUID
import kotlin.test.*

class BoardReviewFixtureTest {
    @Test fun fullFixtureUsesAtomicActivityRecordsAndStableNativeDestinations() = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0); driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        val repository = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { BoardReviewFixture.now }, Dispatchers.Unconfined)
        repository.initialize()
        try {
            BoardReviewFixture.seed(repository, BoardReviewDataSet.Full)
            val items = repository.observeItems(BoardReviewFixture.dogId).first()
            val events = repository.observeEvents(BoardReviewFixture.dogId).first()
            assertEquals(16, items.size); assertEquals(11, events.size)
            items.filter { it.data is CareItemData.Session || it.data is CareItemData.Completion || it.data is CareItemData.Administration }.forEach { item -> assertNotNull(events.firstOrNull { it.id == item.id }) }
            BoardReviewFixture.seed(repository, BoardReviewDataSet.Full)
            assertEquals(items, repository.observeItems(BoardReviewFixture.dogId).first())
            assertEquals(events, repository.observeEvents(BoardReviewFixture.dogId).first())
            assertEquals(2, repository.observeDogs().first().size)
            assertEquals(BoardReviewDataSet.entries.size, BoardReviewDataSet.entries.map { it.databaseName }.distinct().size)
            assertTrue(BoardReviewDataSet.entries.none { it.databaseName == JOURNAL_DATABASE_NAME })
        } finally { repository.close() }
    }

    @Test fun contextualAndPagingFixturesContainRealSourcesAndResumeWithoutDuplicates() = runBlocking {
        for (dataset in listOf(BoardReviewDataSet.Contexts, BoardReviewDataSet.Paged)) {
            val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
            JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0); driver.execute(null, "PRAGMA foreign_keys = ON", 0)
            val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { BoardReviewFixture.now }, Dispatchers.Unconfined)
            repo.initialize()
            try {
                BoardReviewFixture.seed(repo, dataset)
                val before = repo.observeEvents(BoardReviewFixture.dogId).first()
                BoardReviewFixture.seed(repo, dataset)
                assertEquals(before, repo.observeEvents(BoardReviewFixture.dogId).first())
                if (dataset == BoardReviewDataSet.Paged) {
                    val filter = TimelineFilter(BoardReviewFixture.dogId)
                    val first = repo.observeTimeline(filter, 50).first()
                    val second = repo.observeTimeline(filter, 100).first()
                    assertEquals(86, first.totalCount)
                    assertEquals(50, first.events.size)
                    assertEquals(86, second.events.size)
                    assertEquals(86, second.events.map { it.id }.distinct().size)
                    assertEquals(first.events, second.events.take(50))
                } else {
                    val items = repo.observeItems(BoardReviewFixture.dogId).first()
                    assertTrue(items.any { it.id == BoardReviewFixture.itemId(802) && (it.data as CareItemData.Memory).sourceIds == listOf(BoardReviewFixture.itemId(601)) })
                    val september = before.filter { com.dracoarts.shared.presentation.state.JournalDates.inputDate(it.occurredAtMillis, BoardReviewFixture.zone).startsWith("2026-09") }
                    assertEquals(listOf(BoardReviewFixture.itemId(804)), september.map { it.id })
                    assertEquals(2, before.count { it.details is CareDetails.Weight })
                }
            } finally { repo.close() }
        }
    }

    @Test fun reviewPreferenceClearingCannotAlterNormalJournalSettings() {
        val values = mutableMapOf("theme" to "Dark", "selected_dog_id" to "caregiver-dog")
        val backend = object : StorageBackend {
            override fun read(key: String) = values[key]
            override fun write(key: String, value: String) { values[key] = value }
            override fun remove(key: String) { values.remove(key) }
            override fun keys() = values.keys.toSet()
            override fun clear() = values.clear()
        }
        val qa = BoardReviewPreferences(backend)
        qa.write("theme", "Light"); qa.write("selected_dog_id", "qa-dog")
        assertEquals("Light", qa.read("theme"))
        qa.clear()
        assertEquals(mapOf("theme" to "Dark", "selected_dog_id" to "caregiver-dog"), values)
    }
    @Test fun realFixtureCanResumeAndDoesNotDuplicateRecordsOrModifyAnotherDog() = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver)
        driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        val repository = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { BoardReviewFixture.now }, Dispatchers.Unconfined)
        repository.initialize()
        try {
            val other = repository.addDog("Keep my journal")
            val kept = repository.logEvent(other.id, CareEventType.Walk, BoardReviewFixture.now, "Retained observation")
            BoardReviewFixture.seed(repository)
            val first = repository.observeEvents(BoardReviewFixture.dogId).first()
            assertEquals(7, first.size)
            assertEquals(listOf("18:20", "17:45", "16:10", "13:05", "08:15", "07:40", "07:32"), first.map { com.dracoarts.shared.presentation.state.JournalDates.inputTime(it.occurredAtMillis, BoardReviewFixture.zone) })
            BoardReviewFixture.seed(repository)
            assertEquals(first, repository.observeEvents(BoardReviewFixture.dogId).first())
            assertEquals(listOf(kept), repository.observeEvents(other.id).first())
        } finally { repository.close() }
    }
}
