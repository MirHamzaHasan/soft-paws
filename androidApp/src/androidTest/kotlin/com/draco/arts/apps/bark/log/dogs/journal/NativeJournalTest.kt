package com.draco.arts.apps.bark.log.dogs.journal

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.dracoarts.shared.data.local.AndroidJournalDriverFactory
import com.dracoarts.shared.data.local.SqlDelightJournalRepository
import com.dracoarts.shared.domain.model.CareEventType
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.fail
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID
import android.database.sqlite.SQLiteDatabase
import com.dracoarts.shared.domain.model.CareDetails
import com.dracoarts.shared.domain.model.CareEventInput
import com.dracoarts.shared.domain.model.CareEvent

/** Uses Android SQLite, not JDBC. Its unique test journal never opens the caregiver's file. */
@RunWith(AndroidJUnit4::class)
class NativeJournalTest {
    @Test fun nativeV1UpgradePreservesRecordsAndSupportsEditDelete() = runBlocking {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        val filename = "barklog_migration_test_${UUID.randomUUID()}.db"
        val file = context.noBackupFilesDir.resolve(filename)
        instrumentation.context.assets.open("1.db").use { source -> file.outputStream().use { source.copyTo(it) } }
        val ownerId = UUID.randomUUID().toString(); val dogId = UUID.randomUUID().toString(); val eventId = UUID.randomUUID().toString()
        SQLiteDatabase.openDatabase(file.absolutePath, null, SQLiteDatabase.OPEN_READWRITE).use { old ->
            old.execSQL("INSERT INTO local_owner VALUES (1, ?, 100)", arrayOf(ownerId))
            old.execSQL("INSERT INTO dogs VALUES (?, ?, 'Bruno', 100)", arrayOf(dogId, ownerId))
            old.execSQL("INSERT INTO care_events VALUES (?, ?, 'meal', 200, 100, 'Original note')", arrayOf(eventId, dogId))
            old.version = 1
        }
        val factory = AndroidJournalDriverFactory(context, filename)
        fun repository() = SqlDelightJournalRepository(factory, { UUID.randomUUID().toString() }, System::currentTimeMillis)
        val repo = repository()
        try {
            repo.initialize()
            val original = repo.observeEvent(dogId, eventId).first()!!
            assertEquals(CareEvent(eventId, dogId, CareEventType.Meal, 200, 100, "Original note"), original)
            val changed = repo.updateEvent(dogId, eventId, 1, CareEventInput(CareEventType.Meal, 201, "Updated", CareDetails.Meal("Food", "1 cup")))
            assertEquals(eventId, changed.id); assertEquals(100L, changed.createdAtMillis); assertEquals(2L, changed.revision)
            repo.close()
            val reopened = repository()
            try {
                reopened.initialize(); assertEquals(changed, reopened.observeEvent(dogId, eventId).first())
                reopened.deleteEvent(dogId, eventId, 2)
                assertTrue(reopened.observeEvents(dogId).first().isEmpty())
                assertEquals(1, reopened.observeDogs().first().size)
            } finally { reopened.close() }
        } finally {
            repo.close()
            listOf(filename, "$filename-wal", "$filename-shm", "$filename-journal").forEach { context.noBackupFilesDir.resolve(it).delete() }
        }
    }

    @Test fun corruptFileIsRejectedAndRetainedInsteadOfAutomaticallyDeleted() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val filename = "barklog_corruption_test_${UUID.randomUUID()}.db"
        val file = context.noBackupFilesDir.resolve(filename)
        val bytes = "This is a deliberately corrupt, disposable BarkLog test fixture.".repeat(100).toByteArray()
        file.writeBytes(bytes)
        val repository = SqlDelightJournalRepository(AndroidJournalDriverFactory(context, filename), { UUID.randomUUID().toString() }, System::currentTimeMillis)
        try {
            try { repository.initialize(); fail("Corrupt journal must not open.") } catch (_: Exception) { }
            assertTrue(file.exists())
            assertArrayEquals(bytes, file.readBytes())
        } finally {
            repository.close()
            listOf(filename, "$filename-wal", "$filename-shm", "$filename-journal").forEach { context.noBackupFilesDir.resolve(it).delete() }
        }
    }

    @Test fun firstDogAndFourQuickLogsSurviveNativeDriverReopen() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val filename = "barklog_driver_test_${UUID.randomUUID()}.db"
        val factory = AndroidJournalDriverFactory(context, filename)
        fun repository() = SqlDelightJournalRepository(factory, { UUID.randomUUID().toString() }, System::currentTimeMillis)
        val initial = repository()
        initial.initialize()
        val dog = initial.addDog("  Bruno  ")
        CareEventType.quickActions.forEach { initial.logEvent(dog.id, it, System.currentTimeMillis()) }
        initial.close()
        val reopened = repository()
        try {
            reopened.initialize()
            assertEquals(listOf(dog), reopened.observeDogs().first())
            val events = reopened.observeEvents(dog.id).first()
            assertEquals(4, events.size)
            assertEquals(CareEventType.quickActions.toSet(), events.map { it.type }.toSet())
            assertTrue(context.noBackupFilesDir.resolve(filename).exists())
            assertTrue(!context.getDatabasePath(filename).exists())
        } finally {
            reopened.close()
            // Only files named for this test's generated UUID are removed.
            listOf(filename, "$filename-wal", "$filename-shm", "$filename-journal").forEach { context.noBackupFilesDir.resolve(it).delete() }
        }
    }
}
