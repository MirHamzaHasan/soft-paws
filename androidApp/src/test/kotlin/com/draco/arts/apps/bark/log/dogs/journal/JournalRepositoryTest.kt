package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.QueryResult
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.JournalDriverFactory
import com.dracoarts.shared.data.local.JournalSchema
import com.dracoarts.shared.data.local.SqlDelightJournalRepository
import com.dracoarts.shared.domain.model.CareEventType
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.nio.file.Files
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class JournalRepositoryTest {
    private fun repository(driver: SqlDriver, ids: () -> String = { UUID.randomUUID().toString() }) =
        SqlDelightJournalRepository(JournalDriverFactory { driver }, ids, { 100L }, Dispatchers.Unconfined)

    private fun newDriver(): SqlDriver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY).also {
        JournalSchema.create(it)
        it.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        it.execute(null, "PRAGMA foreign_keys = ON", 0)
    }

    @Test fun trimmedDogAndFourEventsSurviveFileReopenWithStableOwner() = runBlocking {
        val directory = Files.createTempDirectory("barklog-repository-test-").toFile()
        val file = directory.resolve("journal.db")
        fun driver() = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
        val initial = driver()
        JournalSchema.create(initial)
        initial.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        val repo = repository(initial)
        repo.initialize()
        val owner = scalar(initial, "SELECT id FROM local_owner")
        val dog = repo.addDog("  Bruno  ")
        assertEquals("Bruno", dog.name)
        CareEventType.quickActions.forEachIndexed { index, type -> repo.logEvent(dog.id, type, 1000L + index) }
        repo.close()
        val reopenedDriver = driver()
        val reopened = repository(reopenedDriver)
        try {
            reopened.initialize()
            assertEquals(listOf(dog), reopened.observeDogs().first())
            assertEquals(listOf("walk", "meal", "pee", "poop"), reopened.observeEvents(dog.id).first().map { it.type.key })
            assertEquals(owner, scalar(reopenedDriver, "SELECT id FROM local_owner"))
        } finally { reopened.close(); file.delete(); directory.delete() }
    }

    @Test fun readsAreDogScopedAndSortByOccurrenceNotInsertion() = runBlocking {
        val repo = repository(newDriver())
        repo.initialize()
        try {
            val first = repo.addDog("Bruno")
            val second = repo.addDog("Luna")
            val late = repo.logEvent(first.id, CareEventType.Walk, 300)
            val early = repo.logEvent(first.id, CareEventType.Meal, 200, " breakfast ")
            repo.logEvent(second.id, CareEventType.Pee, 900)
            assertEquals(listOf(late.id, early.id), repo.observeEvents(first.id).first().map { it.id })
            assertEquals("breakfast", repo.observeEvents(first.id).first().last().note)
            assertEquals(1, repo.observeEvents(second.id).first().size)
        } finally { repo.close() }
    }

    @Test fun invalidNamesUnknownDogsTimestampsAndNotesDoNotWrite() = runBlocking {
        val repo = repository(newDriver())
        repo.initialize()
        try {
            listOf("  ", "A".repeat(81), "Bruno\nLuna").forEach { assertFailsWith<IllegalArgumentException> { repo.addDog(it) } }
            val dog = repo.addDog("Bruno")
            assertFailsWith<IllegalArgumentException> { repo.logEvent(UUID.randomUUID().toString(), CareEventType.Poop, 100) }
            assertFailsWith<IllegalArgumentException> { repo.logEvent(dog.id, CareEventType.Poop, -1) }
            assertFailsWith<IllegalArgumentException> { repo.logEvent(dog.id, CareEventType.Poop, Long.MAX_VALUE) }
            assertFailsWith<IllegalArgumentException> { repo.logEvent(dog.id, CareEventType.Poop, 100, "A".repeat(2001)) }
            assertTrue(repo.observeEvents(dog.id).first().isEmpty())
            assertEquals(1, repo.observeDogs().first().size)
        } finally { repo.close() }
    }

    @Test fun transactionFailureDoesNotPublishAnUnsavedRecordAndRetryWorks() = runBlocking {
        val driver = newDriver()
        val repo = repository(driver)
        repo.initialize()
        try {
            val dog = repo.addDog("Bruno")
            val emissions = mutableListOf<Int>()
            val observer = launch(start = CoroutineStart.UNDISPATCHED) { repo.observeEvents(dog.id).collect { emissions += it.size } }
            driver.execute(null, "CREATE TRIGGER fail_event BEFORE INSERT ON care_events BEGIN SELECT RAISE(ABORT, 'test disk failure'); END", 0)
            assertFailsWith<Exception> { repo.logEvent(dog.id, CareEventType.Poop, 100) }
            assertEquals(listOf(0), emissions)
            assertEquals("0", scalar(driver, "SELECT count(*) FROM care_events"))
            driver.execute(null, "DROP TRIGGER fail_event", 0)
            repo.logEvent(dog.id, CareEventType.Poop, 100)
            assertEquals(1, repo.observeEvents(dog.id).first().size)
            observer.cancelAndJoin()
        } finally { repo.close() }
    }

    @Test fun cancellingBeforeCommitRollsBackAndDoesNotEmitSuccess() = runBlocking {
        val driver = newDriver()
        var cancelWrite: (() -> Unit)? = null
        val repo = repository(driver) { cancelWrite?.invoke(); UUID.randomUUID().toString() }
        repo.initialize()
        try {
            val dog = repo.addDog("Bruno")
            val write = async(start = CoroutineStart.LAZY) { repo.logEvent(dog.id, CareEventType.Walk, 100) }
            cancelWrite = { write.cancel() }
            write.start()
            assertFailsWith<kotlinx.coroutines.CancellationException> { write.await() }
            cancelWrite = null
            assertTrue(repo.observeEvents(dog.id).first().isEmpty())
            repo.logEvent(dog.id, CareEventType.Walk, 100)
            assertEquals(1, repo.observeEvents(dog.id).first().size)
        } finally { repo.close() }
    }

    @Test fun unsupportedVersionOrMetadataIsRejectedWithoutDeletingData() = runBlocking {
        val driver = newDriver()
        val setup = repository(driver)
        setup.initialize()
        val dog = setup.addDog("Bruno")
        setup.logEvent(dog.id, CareEventType.Meal, 100)
        // A non-closing view allows inspecting the same test database after failed initialization.
        val nonClosing = object : SqlDriver by driver { override fun close() = Unit }
        driver.execute(null, "PRAGMA user_version = 99", 0)
        assertFailsWith<IllegalStateException> { repository(nonClosing).initialize() }
        assertEquals("1", scalar(driver, "SELECT count(*) FROM care_events"))
        driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        driver.execute(null, "UPDATE journal_metadata SET format_version = 99", 0)
        assertFailsWith<IllegalStateException> { repository(nonClosing).initialize() }
        assertEquals("Bruno", scalar(driver, "SELECT name FROM dogs"))
        driver.execute(null, "UPDATE journal_metadata SET format_version = 1", 0)
        val retried = repository(nonClosing)
        retried.initialize()
        assertEquals(1, retried.observeEvents(dog.id).first().size)
        setup.close()
    }

    @Test fun schemaRejectsDowngradeAndUnknownEventType() {
        val driver = newDriver()
        try {
            assertFailsWith<IllegalArgumentException> { JournalSchema.migrate(driver, 99, 1) }
            assertFailsWith<Exception> { driver.execute(null, "INSERT INTO care_events(id, dog_id, type, occurred_at, created_at) VALUES ('event', 'dog', 'diagnosis', 100, 100)", 0) }
            assertEquals(JournalSchema.version.toString(), scalar(driver, "PRAGMA user_version"))
        } finally { driver.close() }
    }

    private fun scalar(driver: SqlDriver, sql: String): String? = driver.executeQuery(null, sql, { cursor ->
        QueryResult.Value(if (cursor.next().value) cursor.getString(0) else null)
    }, 0).value
}
