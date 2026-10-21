@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.managers.StorageBackend
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.managers.DisabledHaptics
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.presentation.screens.FeatureForm
import com.dracoarts.shared.services.*
import com.dracoarts.shared.services.ai.AiException
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.datetime.TimeZone
import kotlinx.serialization.json.Json
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*

class CatSafetyTest {
    private class Platform : AppPlatform {
        override val journalDriverFactory get() = error("Owned test connection")
        override val storage = StorageManager(object : StorageBackend {
            private val values = mutableMapOf<String, String>()
            override fun read(key: String) = values[key]
            override fun write(key: String, value: String) { values[key] = value }
            override fun remove(key: String) { values.remove(key) }
            override fun keys() = values.keys.toSet()
            override fun clear() { values.clear() }
        })
        override val haptics = DisabledHaptics
        override fun newId() = UUID.randomUUID().toString()
        override fun nowMillis() = 1792497600000L
        override fun timeZone() = TimeZone.UTC
    }
    private fun create(driver: JdbcSqliteDriver) {
        JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        driver.execute(null, "PRAGMA foreign_keys=ON", 0)
    }
    private fun repository(driver: JdbcSqliteDriver, p: Platform) = SqlDelightJournalRepository(JournalDriverFactory { driver }, p::newId, p::nowMillis, Dispatchers.Unconfined)

    @Test fun legacyProfileAndContactDraftSurviveNotesSaveAndDiskReopen() = runBlocking {
        val details = Json.decodeFromString(DogDetails.serializer(), """{"breed":"Domestic shorthair","vetName":"Existing vet","vetPhone":"+441234567890","emergencyPhone":"+441234567899","emergencyServiceName":"Existing emergency clinic","notes":"General care note"}""")
        assertEquals("", details.vetNote); assertEquals("", details.emergencyNote)
        val p = Platform(); val file = Files.createTempFile("soft-paws-cat-contacts-", ".db").toFile()
        val driver = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}"); create(driver)
        var repo = repository(driver, p); repo.initialize()
        try {
            val cat = repo.addDog("Miso", details); val other = repo.addDog("Juniper")
            val event = repo.createEvent(cat.id, p.newId(), CareEventInput(CareEventType.Note, p.nowMillis(), "Retained journal note", CareDetails.Note()))
            val old = FeatureForm("retained-request", mapOf("name" to cat.name, "vet" to details.vetName, "phone" to details.vetPhone, "_revision" to cat.revision.toString()))
            old["vet"] = "Unfinished vet edit"
            val form = FeatureForm("new-request", mapOf("vetNote" to "", "emergencyNote" to "", "contactKind" to "Vet"))
            form.restore(old.encode()); assertEquals("retained-request", form.requestId); assertEquals(cat.revision, form.expectedRevision)
            assertEquals("Unfinished vet edit", form["vet"]); assertEquals("", form["vetNote"])
            val slot = "profile-EmergencyEdit-${cat.id}"
            repo.saveDraft(cat.id, slot, LocalDraft(form.encode(), emptyList()))
            val contact = VeterinaryContact(form["vet"], form["phone"], "Side entrance · call first").validated()
            val saved = repo.updateDog(cat, cat.name, cat.details.withVeterinaryContact(VeterinaryContactKind.Vet, contact), slot)
            assertNull(repo.loadDraft(cat.id, slot))
            repo.close(); repo = repository(JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}"), p); repo.initialize()
            val reopened = repo.observeDogs().first().first { it.id == cat.id }
            assertEquals(saved, reopened)
            assertEquals(contact, reopened.details.veterinaryContact(VeterinaryContactKind.Vet))
            assertEquals(details.veterinaryContact(VeterinaryContactKind.Emergency), reopened.details.veterinaryContact(VeterinaryContactKind.Emergency))
            assertEquals(details.notes, reopened.details.notes); assertEquals(details.breed, reopened.details.breed)
            assertEquals(listOf(event), repo.observeEvents(cat.id).first()); assertEquals(other, repo.observeDogs().first().first { it.id == other.id })
            val cleared = reopened.details.withVeterinaryContact(VeterinaryContactKind.Vet, VeterinaryContact("", "").validated(allowEmpty = true))
            assertTrue(cleared.veterinaryContact(VeterinaryContactKind.Vet).empty)
            assertEquals(reopened.details.veterinaryContact(VeterinaryContactKind.Emergency), cleared.veterinaryContact(VeterinaryContactKind.Emergency))
            val afterClear = repo.updateDog(reopened, reopened.name, cleared)
            assertTrue(afterClear.details.veterinaryContact(VeterinaryContactKind.Vet).empty)
            assertEquals(details.notes, afterClear.details.notes); assertEquals(listOf(event), repo.observeEvents(cat.id).first())
        } finally { repo.close(); file.delete() }
    }

    @Test fun failedOrStaleContactSaveKeepsExistingProfileAndRetainedDraft() = runBlocking {
        val p = Platform(); val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); create(driver)
        val repo = repository(driver, p); repo.initialize()
        try {
            val cat = repo.addDog("Miso", DogDetails(vetName = "Kept vet", vetPhone = "+441234567890", notes = "Keep this"))
            val slot = "profile-EmergencyEdit-${cat.id}"; val draft = LocalDraft(FeatureForm(p.newId(), mapOf("vet" to "Unfinished contact")).encode(), emptyList())
            repo.saveDraft(cat.id, slot, draft)
            val edited = cat.details.withVeterinaryContact(VeterinaryContactKind.Emergency, VeterinaryContact("Emergency QA", "+441234567899", "Address note").validated())
            driver.execute(null, "CREATE TRIGGER fail_profile BEFORE UPDATE ON dogs BEGIN SELECT RAISE(ABORT, 'owned disk failure'); END", 0)
            assertFailsWith<Exception> { repo.updateDog(cat, cat.name, edited, slot) }
            assertEquals(cat, repo.observeDogs().first().single()); assertEquals(draft, repo.loadDraft(cat.id, slot))
            driver.execute(null, "DROP TRIGGER fail_profile", 0)
            val current = repo.updateDog(cat, cat.name, cat.details.copy(notes = "A later caregiver note"))
            assertFailsWith<RecordConflictException> { repo.updateDog(cat, cat.name, edited, slot) }
            assertEquals(current, repo.observeDogs().first().single()); assertEquals(draft, repo.loadDraft(cat.id, slot))
            val saved = repo.updateDog(current, current.name, current.details.withVeterinaryContact(VeterinaryContactKind.Emergency, edited.veterinaryContact(VeterinaryContactKind.Emergency)), slot)
            assertEquals("A later caregiver note", saved.details.notes); assertNull(repo.loadDraft(cat.id, slot))
        } finally { repo.close() }
    }

    @Test fun newContactsRequireCheckedNamesAndNumbersAndRegionsNeverGuessUnsupportedNumbers() {
        for (bad in listOf(VeterinaryContact("", "+441234567890"), VeterinaryContact("Clinic", "++"), VeterinaryContact("Clinic", "use a website"), VeterinaryContact("Clinic", "+441234567890", "x".repeat(2001)))) {
            assertFailsWith<IllegalArgumentException> { bad.validated() }
        }
        assertEquals("+44 (0)1234 567890", VeterinaryContact(" Clinic ", " +44 (0)1234 567890 ").validated().phone)
        assertEquals("GB", EmergencyDirectory.resolveCountry(" UK ")); assertEquals("US", EmergencyDirectory.resolveCountry("USA"))
        for (unknown in listOf("Pakistan", "United", "US territory", "Atlantis")) assertNull(EmergencyDirectory.resolveCountry(unknown))
        assertTrue(EmergencyDirectory.forCountry("PK").isEmpty())
        val url = NearbyVets.searchUrl("São Paulo | west: ~城区@5 & extra=secret")
        assertTrue(url.startsWith("https://www.google.com/maps/search/?api=1&query="))
        assertFalse(url.contains("& extra=secret")); assertFalse(url.contains("profile")); assertFalse(url.contains("journal"))
    }

    @Test fun safetyRequestsUseCatWordingAndExplicitBoundedExposureNotesWithCurrentConsent() = runBlocking {
        val p = Platform(); val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); create(driver)
        val repo = repository(driver, p); repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val other = repo.addDog("Juniper")
            val event = repo.createEvent(cat.id, p.newId(), CareEventInput(CareEventType.Litter, p.nowMillis(), "Caregiver litter observation", CareDetails.Litter(LitterObservation.Nothing)))
            repo.createEvent(other.id, p.newId(), CareEventInput(CareEventType.Note, p.nowMillis(), "Other cat private note", CareDetails.Note()))
            var premium = false; var revoked = false; var calls = 0; var captured: CompanionAiRequest? = null
            var state = CompanionState(dogId = cat.id, workspace = CompanionWorkspace(messageConsent = true, profileConsent = true, recordConsent = true, cloudConsent = true, weeklyConsentVersion = 1))
            val provider = object : CompanionResponseProvider {
                override fun response(request: CompanionAiRequest) = flow {
                    calls++; captured = request
                    if (revoked) state = state.copy(workspace = CompanionWorkspace())
                    emit(CompanionReply("Keep the plant name and what you observed ready for your veterinarian. Contact a veterinarian immediately about a suspected exposure.", "atlas"))
                }
            }
            val ai = SafetyAiController(repo, p, provider, { state }, { premium }, { "owned-unit-test-identity" })
            assertFailsWith<AiException> { ai.answer(cat.id, "lily", CompanionAiPurpose.ToxicityEducation, "Caregiver's timing note") }; assertEquals(0, calls)
            premium = true
            ai.answer(cat.id, "lily", CompanionAiPurpose.ToxicityEducation, "Caregiver's timing note")
            assertTrue(captured!!.question.contains("cat-safety")); assertFalse(captured!!.question.contains("dog-safety"))
            assertTrue(captured!!.question.contains("Caregiver's timing note")); assertTrue(captured!!.question.contains("not clinical findings"))
            assertEquals(listOf(event.id), captured!!.records.map { it.id }); assertEquals(cat.name, captured!!.profile!!.name)
            assertFailsWith<IllegalArgumentException> { ai.answer(cat.id, "lily", CompanionAiPurpose.ToxicityEducation, "x".repeat(1001)) }; assertEquals(1, calls)
            revoked = true; assertFailsWith<AiException> { ai.answer(cat.id, "storage", CompanionAiPurpose.SafetyEducation) }
            assertEquals(listOf(event), repo.observeEvents(cat.id).first())
        } finally { repo.close() }
    }
}
