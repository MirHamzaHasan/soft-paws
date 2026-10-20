package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.managers.DisabledHaptics
import com.dracoarts.shared.managers.StorageBackend
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.presentation.state.EventController
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.state.SettingsController
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.datetime.*
import kotlinx.serialization.json.*
import java.util.UUID
import kotlin.test.*

@OptIn(kotlin.time.ExperimentalTime::class)
class WeeklyContextAndSoundTest {
    private fun store(block: suspend (SqlDelightJournalRepository, Long) -> Unit) = runBlocking {
        val now = kotlin.time.Instant.parse("2026-11-01T18:00:00Z").toEpochMilliseconds()
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, { UUID.randomUUID().toString() }, { now }, Dispatchers.Unconfined)
        repo.initialize(); try { block(repo, now) } finally { repo.close() }
    }
    @Test fun approvedReviewRowsUseRealValidWritesAndReplayWithoutDuplicates() = store { repo, _ ->
        val fixture = com.dracoarts.shared.presentation.review.BoardReviewDataSet.AiCards
        repeat(2) { com.dracoarts.shared.presentation.review.BoardReviewFixture.seed(repo, fixture) }
        val week = prepareWeeklyContext(repo, com.dracoarts.shared.presentation.review.BoardReviewFixture.dogId, "How are Bruno's walks?", fixture.nowMillis, TimeZone.UTC)
        assertEquals("Bruno", week.profile.name)
        assertEquals(12, week.weekly.total)
        assertEquals(7, week.weekly.counts.single { it.type == "Walk" }.count)
        assertEquals(2, week.weekly.counts.single { it.type == "Grooming" }.count)
        assertEquals(3, week.weekly.counts.single { it.type == "Meal" }.count)
    }
    @Test fun sevenCalendarDaysUseFreshProfileExactCountsAndBoundedUnicodeNotes() = store { repo, now ->
        val zone = TimeZone.of("America/New_York")
        val dog = repo.addDog("Milo", DogDetails(notes = "🌿".repeat(1000)))
        val other = repo.addDog("PRIVATE_OTHER_DOG")
        val today = JournalDates.day(now, zone)
        val starts = (6 downTo 0).map { JournalDates.dayBounds(today.minus(it, DateTimeUnit.DAY), zone).first }
        repo.logEvent(dog.id, CareEventType.Walk, starts.first() - 1, "PRIVATE_OLDER")
        repo.logEvent(dog.id, CareEventType.Walk, now + 1, "PRIVATE_FUTURE")
        repo.logEvent(other.id, CareEventType.Walk, now, "PRIVATE_OTHER_RECORD")
        repeat(70) { repo.logEvent(dog.id, CareEventType.Walk, starts[it % 7] + (it + 1) * 60_000L, "🌿".repeat(250)) }
        repeat(7) { repo.logEvent(dog.id, CareEventType.Meal, starts[it] + 100_000, "Breakfast") }
        val fresh = repo.updateDog(dog, "Luna", dog.details)
        val context = prepareWeeklyContext(repo, dog.id, "How are walks going?", now, zone)
        assertEquals(fresh.name, context.profile.name)
        assertEquals(starts.first(), context.weekly.fromMillis)
        assertEquals(now + 1, context.weekly.untilMillis)
        assertEquals(77, context.weekly.total)
        assertEquals(70, context.weekly.counts.single { it.type == "Walk" }.count)
        assertEquals(77, context.weekly.days.sumOf { it.counts.sumOf { count -> count.count } })
        assertTrue(context.weekly.profileLimited)
        assertTrue(context.records.size <= 50)
        assertEquals(context.records.size, context.weekly.shared)
        assertTrue(context.records.all { it.dogId == dog.id && it.at >= starts.first() && it.at <= now })
        var sent = ""
        val identity = object : com.dracoarts.shared.services.ai.AtlasIdentity {
            override val currentUid = "unit-test-user"
            override suspend fun token(forceRefresh: Boolean) = com.dracoarts.shared.services.ai.AtlasToken("unit-token", currentUid)
        }
        val transport = object : com.dracoarts.shared.services.ai.AtlasTransport {
            override suspend fun post(body: String, token: String, requestId: String): com.dracoarts.shared.services.ai.AtlasHttpResponse {
                sent = body
                return com.dracoarts.shared.services.ai.AtlasHttpResponse(200, """{"requestId":"unit-response","output":{"content":"Try a short calm game."}}""", "true", com.dracoarts.shared.services.ai.AtlasClient.FEATURE)
            }
        }
        AtlasResponseProvider(com.dracoarts.shared.services.ai.AtlasClient(identity, transport, true)) { UUID.randomUUID().toString() }
            .response(CompanionAiRequest("Walk ideas?", context.profile, context.records, true, requestedAtMillis = now, timeZone = zone.id, weekly = context.weekly)).last()
        val content = Json.parseToJsonElement(sent).jsonObject["messages"]!!.jsonArray.last().jsonObject["content"]!!.jsonPrimitive.content
        val body = content.substringAfter(":\n").substringBefore("\n\nQuestion:")
        assertTrue(body.encodeToByteArray().size <= 23_000)
        assertFalse("PRIVATE_" in body)
        assertEquals(2000, repo.observeDogs().first().single { it.id == dog.id }.details.notes.length)
        assertTrue(boundedProfileFact("🌿".repeat(500)).encodeToByteArray().size <= 400)
        assertFalse(boundedProfileFact("🌿".repeat(500)).last().isHighSurrogate())
    }
    @Test fun emptyWeekIncludesProfileAndLegacyConsentCannotExpand() = store { repo, now ->
        val dog = repo.addDog("Nala")
        val context = prepareWeeklyContext(repo, dog.id, "Brushing ideas?", now, TimeZone.UTC)
        assertEquals("Nala", context.profile.name); assertEquals(0, context.weekly.total)
        assertEquals(7, context.weekly.days.size); assertTrue(context.records.isEmpty())
        val old = Json.decodeFromString<CompanionWorkspace>("""{"messageConsent":true,"profileConsent":true,"recordConsent":true,"cloudConsent":true}""")
        assertFalse(old.weeklyAllowed)
        assertTrue(old.copy(weeklyConsentVersion = 1).weeklyAllowed)
        assertFalse(old.copy(weeklyConsentVersion = 1, cloudConsent = false).weeklyAllowed)
    }
    private class Player : InteractionSoundPlayer {
        override val readiness = MutableStateFlow(SoundReadiness.Ready)
        val played = mutableListOf<SoundCue>(); var prepares = 0; var stopped = 0; var closed = false
        override fun prepare() { prepares++ }
        override fun play(cue: SoundCue, texture: String, volume: Float) { assertTrue(volume in 0f..1f); played += cue }
        override fun stop() { stopped++ }
        override fun close() { closed = true }
    }
    @Test fun soundIsOptionalRateLimitedAndStopsForMuteBackgroundAndClose() {
        val player = Player(); var clock = 100L; val sounds = InteractionSounds(player) { clock }
        sounds.play(SoundCue.Tap); assertTrue(player.played.isEmpty()); assertEquals(0, player.prepares)
        sounds.configure(true, .35f, "wood", true); sounds.play(SoundCue.Tap); sounds.play(SoundCue.Selection)
        assertEquals(listOf(SoundCue.Tap), player.played)
        sounds.play(SoundCue.Saved); assertEquals(SoundCue.Saved, player.played.last())
        clock += 70; sounds.play(SoundCue.Selection); assertEquals(SoundCue.Selection, player.played.last())
        val count = player.played.size
        sounds.configure(true, 0f, "wood", true); sounds.play(SoundCue.Tap)
        sounds.configure(true, .35f, "wood", false); sounds.play(SoundCue.Saved)
        sounds.configure(false, .35f, "wood", true); sounds.play(SoundCue.Tap)
        assertEquals(count, player.played.size); assertTrue(player.stopped >= 3)
        sounds.close(); sounds.configure(true, .35f, "wood", true); clock += 100; sounds.play(SoundCue.Tap)
        assertTrue(player.closed); assertEquals(count, player.played.size)
    }
    @Test fun completedCueCannotTurnFailedOrCancelledWritesIntoSuccess() = store { repo, now ->
        val dog = repo.addDog("Milo"); var cues = 0
        val good = EventController(repo, DisabledHaptics, onCommitted = { cues++; error("Audio unavailable") })
        assertNotNull(good.create(dog.id, UUID.randomUUID().toString(), CareEventInput(CareEventType.Walk, now)))
        assertEquals(1, cues); assertEquals(1, repo.observeEvents(dog.id).first().size)
        val failed = object : JournalRepository by repo {
            override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent = error("Disk full")
        }
        assertNull(EventController(failed, DisabledHaptics, onCommitted = { cues++ }).create(dog.id, "failed", CareEventInput(CareEventType.Walk, now)))
        assertEquals(1, cues)
        val cancelled = object : JournalRepository by repo {
            override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent = throw CancellationException()
        }
        assertFailsWith<CancellationException> { EventController(cancelled, DisabledHaptics, onCommitted = { cues++ }).create(dog.id, "cancelled", CareEventInput(CareEventType.Walk, now)) }
        assertEquals(1, cues)
    }
    @Test fun soundPreferencesDefaultQuietAndRecoverFromInvalidStoredVolume() = runBlocking {
        val values = mutableMapOf<String, String>()
        val storage = StorageManager(object : StorageBackend {
            override fun read(key: String) = values[key]
            override fun write(key: String, value: String) { values[key] = value }
            override fun remove(key: String) { values.remove(key) }
            override fun keys() = values.keys.toSet()
            override fun clear() = values.clear()
        })
        val settings = SettingsController(storage); settings.load(); assertFalse(settings.state.value.sounds)
        settings.save(settings.state.value.copy(sounds = true, soundVolume = .35f, soundTexture = "wood"))
        val restored = SettingsController(storage); restored.load(); assertTrue(restored.state.value.sounds)
        assertEquals(.35f, restored.state.value.soundVolume)
        values["sound_volume"] = "NaN"; restored.load(); assertEquals(.35f, restored.state.value.soundVolume)
    }
}
