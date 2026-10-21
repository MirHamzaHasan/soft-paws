package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.*
import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*

class PhotoMemoryTest {
    private fun id() = UUID.randomUUID().toString()
    private fun store(block: suspend (SqlDelightJournalRepository, SqlDriver) -> Unit) = runBlocking {
        val d = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(d); d.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        val r = SqlDelightJournalRepository(JournalDriverFactory { d }, ::id, { 1000L }, Dispatchers.Unconfined)
        r.initialize(); try { block(r, d) } finally { r.close() }
    }
    private val at = LocalDateTime(2026, 10, 31, 23, 30).toInstant(TimeZone.UTC).toEpochMilliseconds()
    private fun photo(file: String = id() + ".jpg") = CareItemData.Photo(file, "Window watch", "2026-10-14", notes = "Original photo words")

    @Test fun captionAndSelectionCommitTogetherAndFailedMembershipKeepsDraftAndFiles() = store { repo, driver ->
        val cat = repo.addDog("Miso"); val original = photo(); val p = repo.saveItem(cat.id, id(), at, original)
        val event = repo.createEvent(cat.id, id(), CareEventInput(CareEventType.Meal, at, "Original care note"))
        val a = repo.saveItem(cat.id, id(), at, CareItemData.Memory(listOf(p.id, event.id), "First independent book caption"))
        val b = repo.saveItem(cat.id, id(), at, CareItemData.Memory(listOf(p.id), "Second independent book caption"))
        val snapshot = PhotoMemorySelection.capture(cat.id, p.id, "2026-10", TimeZone.UTC, repo.observeItems(cat.id).first())
        val replacement = id() + ".jpg"; val draft = LocalDraft("{\"notes\":\"Keep my exact draft\"}", listOf(replacement))
        repo.saveDraft(cat.id, "photo-caption-${p.id}", draft)
        driver.execute(null, "CREATE TRIGGER fail_book BEFORE UPDATE ON care_items WHEN OLD.kind='memory' BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
        assertFailsWith<Exception> { repo.savePhotoAndMemory(cat.id, p.id, at, original.copy(fileId = replacement, notes = "New photo caption"), p.revision, snapshot, false, id(), "photo-caption-${p.id}") }
        assertEquals(p, repo.observeItems(cat.id).first().first { it.id == p.id })
        assertEquals(draft, repo.loadDraft(cat.id, "photo-caption-${p.id}")); assertTrue(repo.photoReferenced(original.fileId)); assertTrue(repo.photoReferenced(replacement))
        driver.execute(null, "DROP TRIGGER fail_book", 0)
        // Removing a source must also preserve other legacy links whose record was removed.
        repo.deleteEvent(cat.id, event.id, event.revision)
        val result = repo.savePhotoAndMemory(cat.id, p.id, at, original.copy(notes = "New photo caption"), p.revision, snapshot, false, id(), "photo-caption-${p.id}")
        assertEquals("New photo caption", (result.photo.data as CareItemData.Photo).notes)
        val memories = result.collections.associateBy { it.id }
        assertEquals(CareItemData.Memory(listOf(event.id), "First independent book caption", "2026-10"), memories.getValue(a.id).data)
        assertEquals(CareItemData.Memory(emptyList(), "Second independent book caption", "2026-10"), memories.getValue(b.id).data)
        assertNull(repo.loadDraft(cat.id, "photo-caption-${p.id}")); assertTrue(repo.observeEvents(cat.id).first().isEmpty())
        assertTrue(repo.photoReferenced(original.fileId))
    }

    @Test fun concurrentMembershipAndPhotoRevisionsRejectWithoutPartialWritesOrForeignCatChanges() = store { repo, _ ->
        val cat = repo.addDog("Miso"); val other = repo.addDog("Cleo")
        val p = repo.saveItem(cat.id, id(), at, photo()); val foreign = repo.saveItem(other.id, id(), at, photo())
        val book = repo.saveItem(cat.id, id(), at, CareItemData.Memory(listOf(p.id), "Saved book words", "2026-10"))
        val snapshot = PhotoMemorySelection.capture(cat.id, p.id, "2026-10", TimeZone.UTC, repo.observeItems(cat.id).first())
        val newer = repo.saveItem(cat.id, book.id, at, (book.data as CareItemData.Memory).copy(caption = "Newer book words"), book.revision)
        assertFailsWith<RecordConflictException> { repo.savePhotoAndMemory(cat.id, p.id, at, (p.data as CareItemData.Photo).copy(notes = "Stale photo change"), p.revision, snapshot, false, id(), null) }
        assertEquals(p, repo.observeItems(cat.id).first().first { it.id == p.id }); assertEquals(newer, repo.observeItems(cat.id).first().first { it.id == book.id })
        val fresh = PhotoMemorySelection.capture(cat.id, p.id, "2026-10", TimeZone.UTC, repo.observeItems(cat.id).first())
        val changed = repo.saveItem(cat.id, p.id, at, (p.data as CareItemData.Photo).copy(title = "New photo title"), p.revision)
        assertFailsWith<RecordConflictException> { repo.savePhotoAndMemory(cat.id, p.id, at, p.data as CareItemData.Photo, p.revision, fresh, false, id(), null) }
        assertEquals(changed, repo.observeItems(cat.id).first().first { it.id == p.id })
        assertEquals(listOf(foreign), repo.observeItems(other.id).first())
        assertFailsWith<IllegalArgumentException> { repo.saveItem(cat.id, id(), at, CareItemData.Memory(listOf(foreign.id), month = "2026-10")) }
    }

    @Test fun firstPhotoAndExplicitMonthSurviveFileReopenAndTravelWithoutInventedSources() = runBlocking {
        val directory = Files.createTempDirectory("soft-paws-photo-book-").toFile(); val file = directory.resolve("journal.db")
        fun open(create: Boolean): SqlDelightJournalRepository {
            val d = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")
            if (create) { JournalSchema.create(d); d.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0) }
            return SqlDelightJournalRepository(JournalDriverFactory { d }, ::id, { 1000L }, Dispatchers.Unconfined)
        }
        val r = open(true); r.initialize(); val cat = r.addDog("Miso"); val pid = id(); val data = photo()
        val result = r.savePhotoAndMemory(cat.id, pid, at, data, null, PhotoMemorySelection("2026-10", "UTC", emptyMap()), true, id(), null)
        assertEquals(listOf(pid), (result.collections.single().data as CareItemData.Memory).sourceIds)
        r.close(); val reopened = open(false); reopened.initialize()
        try {
            val all = reopened.observeItems(cat.id).first(); assertEquals(2, all.size)
            val book = all.single { it.data is CareItemData.Memory }
            assertEquals("2026-10", memoryMonth(book, TimeZone.of("Asia/Tokyo")))
            assertEquals(data, all.single { it.id == pid }.data)
            val report = readCareReport(reopened, { all }, CareReportScope(cat.id, "2026-10-01", "2026-10-31", ReportContent.encode(setOf(ReportContent.Photos))), TimeZone.of("Asia/Tokyo"), at)
            assertEquals(listOf(pid), report.items.map { it.id }); assertTrue(reopened.observeEvents(cat.id).first().isEmpty())
            val archivalId = id()
            reopened.savePhotoAndMemory(cat.id, archivalId, 0, data.copy(date = "1969-12-31"), null,
                PhotoMemorySelection("1969-12", "UTC", emptyMap()), true, id(), null)
            val archival = readCareReport(reopened, { reopened.observeItems(it).first() },
                CareReportScope(cat.id, "1969-12-01", "1969-12-31", ReportContent.encode(setOf(ReportContent.Photos))), TimeZone.UTC, at)
            assertEquals(listOf(archivalId), archival.items.map { it.id }); assertTrue(archival.events.isEmpty())
        } finally { reopened.close(); directory.deleteRecursively() }
    }

    @Test fun legacyCollectionsDecodeAndEmptyNamedMonthsPreserveCaptions() {
        val decoded = Json.decodeFromString(CareItemData.serializer(), """{"type":"memory","sourceIds":["saved-source"],"caption":"Legacy words"}""") as CareItemData.Memory
        assertEquals("", decoded.month); assertEquals("Legacy words", decoded.caption)
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(CareItemData.Memory(emptyList())) }
        CareItemRules.validate(CareItemData.Memory(emptyList(), "A retained empty book caption", "2026-10"))
        assertFailsWith<IllegalArgumentException> { CareItemRules.validate(CareItemData.Memory(emptyList(), month = "2026-13")) }
    }
}
