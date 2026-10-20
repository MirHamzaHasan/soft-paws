package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.presentation.highlights.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.util.UUID
import kotlin.test.*

class HighlightTest {
    private fun store(test: suspend (SqlDelightJournalRepository, JdbcSqliteDriver) -> Unit) = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); JournalSchema.create(driver)
        driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        driver.execute(null, "PRAGMA foreign_keys=ON", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { 1_792_152_000_000L }, Dispatchers.Unconfined)
        repo.initialize(); try { test(repo, driver) } finally { repo.close() }
    }
    private class Renderer : HighlightRenderer {
        var renders = 0; var shares = 0; var cancelled = false; var motion = true
        var wait = false; var fail = false
        override suspend fun render(draft: HighlightDraft, motion: Boolean, progress: (Float?) -> Unit): DeviceResult<HighlightOutput> {
            renders++; this.motion = motion
            try { progress(.4f); if (wait) awaitCancellation(); return if (fail) DeviceResult.Failed("Codec failed") else DeviceResult.Success(HighlightOutput("test.mp4", draft.aspect.width, draft.aspect.height, draft.clips.size * 2800L)) }
            finally { cancelled = wait }
        }
        override suspend fun share(output: HighlightOutput): DeviceResult<Unit> { shares++; return DeviceResult.Cancelled }
    }
    private val clips = listOf("photo-one.jpg", "photo-two.jpg", "photo-three.jpg").map(::HighlightClip)
    @Test fun editsReopenInOrderAndPhotoReferencesSurviveSourceDeletion() = store { repo, _ ->
        val dog = repo.addDog("Milo"); val renderer = Renderer()
        val photo = repo.saveItem(dog.id, UUID.randomUUID().toString(), 10, CareItemData.Photo("photo-one.jpg", "A moment", "2026-10-17"))
        val c = HighlightController(repo, renderer, { false }, Dispatchers.Unconfined); c.open(dog.id)
        assertTrue(c.edit(dog.id) { it.copy(clips = clips, aspect = HighlightAspect.Square) })
        assertTrue(c.edit(dog.id) { it.copy(clips = it.clips.reversed().mapIndexed { i, p -> p.copy(caption = "Moment $i") }) })
        repo.deleteItem(photo); assertTrue(repo.photoReferenced("photo-one.jpg")); c.close()
        val reopened = HighlightController(repo, renderer, { false }, Dispatchers.Unconfined); reopened.open(dog.id)
        assertEquals("photo-three.jpg", reopened.state.value.draft!!.clips.first().photoId)
        assertEquals("Moment 0", reopened.state.value.draft!!.clips.first().caption); assertEquals(HighlightAspect.Square, reopened.state.value.draft!!.aspect)
        assertEquals(0, renderer.renders)
        repo.deleteDog(dog.id); assertNull(repo.loadDraft(dog.id, HighlightDraft.SLOT)); assertFalse(repo.photoReferenced("photo-one.jpg")); reopened.close()
    }
    @Test fun failedCommitDoesNotPublishAndDogsStaySeparate() = store { repo, driver ->
        val a = repo.addDog("Milo"); val b = repo.addDog("Luna"); val c = HighlightController(repo, Renderer(), { false }, Dispatchers.Unconfined); c.open(a.id)
        c.edit(a.id) { it.copy(clips = clips) }; val before = c.state.value.draft
        driver.execute(null, "CREATE TRIGGER fail_video BEFORE INSERT ON care_drafts BEGIN SELECT RAISE(ABORT, 'Disk full'); END", 0)
        assertFalse(c.edit(a.id) { it.copy(aspect = HighlightAspect.Square) }); assertEquals(before, c.state.value.draft); assertNotNull(c.state.value.error)
        driver.execute(null, "DROP TRIGGER fail_video", 0)
        c.open(b.id); assertTrue(c.state.value.draft!!.clips.isEmpty()); assertFalse(c.edit(a.id) { it.copy(clips = clips) }); c.close()
    }
    @Test fun premiumCheckedBeforeRenderAndShareAndDowngradeKeepsDraft() = store { repo, _ ->
        val dog = repo.addDog("Milo"); var premium = false; val renderer = Renderer(); val c = HighlightController(repo, renderer, { premium }, Dispatchers.Unconfined)
        c.open(dog.id); c.edit(dog.id) { it.copy(clips = clips) }; assertFalse(c.export(false)); assertEquals(0, renderer.renders)
        premium = true; assertTrue(c.export(true)); c.awaitExport(); assertNotNull(c.state.value.output); assertFalse(renderer.motion)
        premium = false; assertFalse(c.share()); assertEquals(0, renderer.shares); assertEquals(clips, c.state.value.draft!!.clips)
        premium = true; c.share(); assertEquals(1, renderer.shares); assertNotNull(c.state.value.output)
        c.edit(dog.id) { it.copy(aspect = HighlightAspect.Square) }; assertNull(c.state.value.output); c.close()
    }
    @Test fun cancellationFailureAndRepeatedTapNeverProduceFakeSuccess() = store { repo, _ ->
        val dog = repo.addDog("Milo"); val renderer = Renderer().apply { wait = true }; val c = HighlightController(repo, renderer, { true }, Dispatchers.Unconfined)
        c.open(dog.id); c.edit(dog.id) { it.copy(clips = clips) }; c.export(false); c.export(false); assertEquals(1, renderer.renders)
        assertEquals(.4f, c.state.value.progress); c.cancelExport(); c.awaitExport(); assertTrue(renderer.cancelled); assertFalse(c.state.value.rendering); assertNull(c.state.value.output)
        renderer.wait = false; renderer.fail = true; c.export(false); c.awaitExport(); assertEquals("Codec failed", c.state.value.error); assertNull(c.state.value.output)
        c.close(); assertNotNull(repo.loadDraft(dog.id, HighlightDraft.SLOT))
    }
    @Test fun invalidDraftBoundsAndUnreadableDraftAreErrors() = store { repo, _ ->
        val dog = repo.addDog("Milo"); assertFailsWith<IllegalArgumentException> { HighlightDraft(dog.id, clips.take(2)).validate(true) }
        assertFailsWith<IllegalArgumentException> { HighlightDraft(dog.id, listOf(HighlightClip("../photo.jpg"))).validate() }
        assertFailsWith<IllegalArgumentException> { HighlightDraft(dog.id, listOf(HighlightClip("photo.jpg", "x".repeat(101)))).validate() }
        repo.saveDraft(dog.id, HighlightDraft.SLOT, LocalDraft("{\"clips\":\"corrupt\"}"))
        val c = HighlightController(repo, Renderer(), { true }, Dispatchers.Unconfined); c.open(dog.id); assertNull(c.state.value.draft); assertNotNull(c.state.value.error); c.close()
    }
}
