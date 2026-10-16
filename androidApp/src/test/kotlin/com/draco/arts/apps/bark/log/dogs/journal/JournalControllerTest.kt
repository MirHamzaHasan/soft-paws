package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.domain.model.Dog
import com.dracoarts.shared.domain.model.CareEventInput
import com.dracoarts.shared.domain.model.TimelineFilter
import com.dracoarts.shared.domain.model.TimelinePage
import com.dracoarts.shared.domain.model.JournalSummary
import kotlinx.coroutines.flow.map
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.managers.HapticKind
import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.managers.StorageBackend
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.presentation.state.JournalController
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.datetime.TimeZone
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class JournalControllerTest {
    private class FakeRepository : JournalRepository {
        val dogs = MutableStateFlow<List<Dog>>(emptyList())
        val events = MutableStateFlow<List<CareEvent>>(emptyList())
        var fail = false
        var gate: CompletableDeferred<Unit>? = null
        var writes = 0
        override fun observeDogs() = dogs
        override fun observeEvents(dogId: String) = events
        override fun observeEvent(dogId: String, eventId: String) = events.map { it.firstOrNull { event -> event.id == eventId && event.dogId == dogId } }
        override fun observeTimeline(filter: TimelineFilter, limit: Int) = events.map { TimelinePage(it.take(limit), it.size.toLong()) }
        override fun observeSummary(dogId: String, fromMillis: Long, untilMillis: Long) = events.map { records ->
            JournalSummary(records.takeLast(3), records.filter { it.occurredAtMillis in fromMillis until untilMillis }.groupingBy { it.type }.eachCount(), records.size.toLong())
        }
        override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput) = logEvent(dogId, input.type, input.occurredAtMillis, input.note)
        override suspend fun updateEvent(dogId: String, eventId: String, expectedRevision: Long, input: CareEventInput): CareEvent = error("Not used by these quick-loop tests.")
        override suspend fun deleteEvent(dogId: String, eventId: String, expectedRevision: Long): Unit = error("Not used by these quick-loop tests.")
        override suspend fun addDog(name: String, details: com.dracoarts.shared.domain.model.DogDetails, requestId: String?, draftSource: com.dracoarts.shared.domain.repository.DraftSource?): Dog {
            if (fail) error("private failure")
            val dog = Dog("dog", name.trim(), 100)
            dogs.value = listOf(dog)
            return dog
        }
        override suspend fun logEvent(dogId: String, type: CareEventType, occurredAtMillis: Long, note: String?): CareEvent {
            writes++
            gate?.await()
            if (fail) error("private failure")
            val event = CareEvent("event-$writes", dogId, type, occurredAtMillis, 100)
            events.value = events.value + event
            return event
        }
    }
    private class Preferences : StorageBackend {
        val data = mutableMapOf<String, String>()
        override fun read(key: String) = data[key]
        override fun write(key: String, value: String) { data[key] = value }
        override fun remove(key: String) { data.remove(key) }
        override fun keys() = data.keys.toSet()
        override fun clear() = data.clear()
    }
    private class Haptics : HapticManager {
        val calls = mutableListOf<HapticKind>()
        override fun perform(kind: HapticKind) { calls += kind }
    }

    @Test fun firstDogAndCommittedLogPublishFeedbackAndPersistOnlySelection() = runBlocking {
        val repo = FakeRepository(); val preferences = Preferences(); val haptics = Haptics()
        val controller = JournalController(repo, StorageManager(preferences), haptics) { 100 }
        val observer = launch { controller.observe() }
        withTimeout(3000) { controller.state.first { !it.loading } }
        assertNull(controller.state.value.selectedDog)
        controller.addDog(" Bruno ")
        withTimeout(3000) { controller.state.first { it.selectedDog?.name == "Bruno" } }
        controller.quickLog(CareEventType.Meal)
        withTimeout(3000) { controller.state.first { it.events.size == 1 } }
        assertTrue(controller.state.value.feedback!!.startsWith("Meal logged at "))
        assertEquals(listOf(HapticKind.Success, HapticKind.Success), haptics.calls)
        assertEquals(mapOf(JournalController.SELECTED_DOG_KEY to "dog"), preferences.data)
        observer.cancelAndJoin()
    }

    @Test fun failedDogOrEventSaveNeverGivesSuccessFeedback() = runBlocking {
        val repo = FakeRepository(); val haptics = Haptics()
        val controller = JournalController(repo, StorageManager(Preferences()), haptics) { 100 }
        repo.fail = true
        controller.addDog("Bruno")
        assertNull(controller.state.value.selectedDogId)
        assertNull(controller.state.value.feedback)
        assertTrue(controller.state.value.error!!.contains("try again"))
        assertTrue(haptics.calls.isEmpty())
        assertFalse(controller.state.value.saving)
        repo.fail = false
        controller.addDog("Bruno")
        haptics.calls.clear()
        repo.fail = true
        controller.quickLog(CareEventType.Poop)
        assertTrue(repo.events.value.isEmpty())
        assertNull(controller.state.value.feedback)
        assertTrue(haptics.calls.isEmpty())
        assertFalse(controller.state.value.saving)
    }

    @Test fun rapidSubmissionsAreIgnoredWhileWriteIsPendingAndCancellationUnlocks() = runBlocking {
        val repo = FakeRepository()
        val controller = JournalController(repo, StorageManager(Preferences()), Haptics()) { 100 }
        controller.addDog("Bruno")
        repo.gate = CompletableDeferred()
        val write = launch(start = CoroutineStart.UNDISPATCHED) { controller.quickLog(CareEventType.Walk) }
        assertTrue(controller.state.value.saving)
        controller.quickLog(CareEventType.Walk)
        assertEquals(1, repo.writes)
        write.cancelAndJoin()
        assertFalse(controller.state.value.saving)
        assertNull(controller.state.value.error)
        repo.gate = null
        controller.quickLog(CareEventType.Walk)
        assertEquals(1, repo.events.value.size)
    }

    @Test fun launchRestoresValidSelectedDogAndFallsBackForStaleSelection() = runBlocking {
        for (preferred in listOf("luna", "deleted")) {
            val repo = FakeRepository()
            repo.dogs.value = listOf(Dog("bruno", "Bruno", 100), Dog("luna", "Luna", 100))
            val preferences = Preferences()
            preferences.data[JournalController.SELECTED_DOG_KEY] = preferred
            val controller = JournalController(repo, StorageManager(preferences), Haptics()) { 100 }
            val observer = launch { controller.observe() }
            withTimeout(3000) { controller.state.first { !it.loading && it.selectedDog != null } }
            assertEquals(if (preferred == "luna") "Luna" else "Bruno", controller.state.value.selectedDog!!.name)
            observer.cancelAndJoin()
        }
    }

    @Test fun dayCountsRespectMidnightTimezoneAndDaylightSavingWithoutChangingTimestamp() {
        val instant = java.time.Instant.parse("2026-03-08T07:30:00Z").toEpochMilli()
        val before = instant - 3_600_000
        val event = CareEvent("event", "dog", CareEventType.Walk, before, before)
        assertEquals(1, JournalDates.dailyCounts(listOf(event), instant, TimeZone.of("America/New_York"))[CareEventType.Walk])
        val midnight = java.time.Instant.parse("2026-10-14T00:30:00Z").toEpochMilli()
        val yesterday = event.copy(occurredAtMillis = midnight - 3_600_000)
        assertTrue(JournalDates.dailyCounts(listOf(yesterday), midnight, TimeZone.UTC).isEmpty())
        assertEquals(1, JournalDates.dailyCounts(listOf(yesterday), midnight, TimeZone.of("America/Los_Angeles"))[CareEventType.Walk])
        assertEquals(midnight - 3_600_000, yesterday.occurredAtMillis)
    }
}
