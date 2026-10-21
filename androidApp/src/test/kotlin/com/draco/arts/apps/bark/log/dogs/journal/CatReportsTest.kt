@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.FeatureForm
import com.dracoarts.shared.presentation.screens.careReportDocument
import com.dracoarts.shared.presentation.screens.applyReportScope
import com.dracoarts.shared.services.ExportFormat
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*
import kotlin.time.Instant

class CatReportsTest {
    private fun id() = UUID.randomUUID().toString()
    private fun at(value: String) = Instant.parse(value).toEpochMilliseconds()
    @Test fun exactLocalDaysKeepMissingDaysAndLegacyTypesSeparate() = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); JournalSchema.create(driver)
        driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000 }, Dispatchers.Unconfined); repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val other = repo.addDog("Juniper")
            suspend fun put(who: String, type: CareEventType, time: String) = repo.createEvent(who, id(), CareEventInput(type, at(time)))
            put(cat.id, CareEventType.Meal, "2026-10-13T19:00:00Z") // Midnight in Karachi: included.
            put(cat.id, CareEventType.Meal, "2026-10-20T19:00:00Z") // Midnight next day: excluded.
            put(other.id, CareEventType.Meal, "2026-10-14T03:00:00Z")
            put(cat.id, CareEventType.Walk, "2026-10-14T03:00:00Z")
            put(cat.id, CareEventType.Pee, "2026-10-14T04:00:00Z")
            val events = repo.observeEvents(cat.id).first() + repo.observeEvents(other.id).first()
            val summary = CatCareInsights.from(cat.id, LocalDate.parse("2026-10-14"), LocalDate.parse("2026-10-20"), events, TimeZone.of("Asia/Karachi"))
            assertEquals(listOf(1, 0, 0, 0, 0, 0, 0), summary.meals)
            assertEquals(1, summary.counts[CareEventType.Walk]); assertNull(summary.counts[CareEventType.Play]); assertNull(summary.counts[CareEventType.Litter])
        } finally { repo.close() }
    }

    @Test fun reportScopeAndVetQuestionsSurviveNavigationAndDiskReopenWithoutJournalWrites() = runBlocking {
        val file = Files.createTempFile("soft-paws-report-", ".db").toFile()
        val first = JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}"); JournalSchema.create(first)
        first.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        fun repository(driver: JdbcSqliteDriver) = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000 }, Dispatchers.Unconfined)
        var repo = repository(first); repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val other = repo.addDog("Juniper")
            val question = "Discuss appetite | ~ : @ — 城区\n=not a formula"
            val request = CareReportScope(cat.id, "2026-10-14", "2026-10-20", "care,medication", question)
            assertEquals(request, CareReportScope.parse(request.argument(), other.id))
            assertEquals(ReportContent.entries.toSet(), ReportContent.decode(CareReportScope.parse("2026-10-14@2026-10-20", cat.id).content))
            val navigation = AppState(); navigation.open(Feature.ReportFormat, request.argument()); navigation.open(Feature.Export, request.argument()+"@CSV")
            val restored = AppState.restoreValue(navigation.savedValue())
            assertEquals(request, CareReportScope.parse(restored.featurePage!!.id.substringBeforeLast('@'), other.id))
            val form = FeatureForm(id(), mapOf("dog" to cat.id, "questions" to "")); form["questions"] = question
            repo.saveDraft(cat.id, "vet-report", LocalDraft(form.encode()))
            repo.close(); repo = repository(JdbcSqliteDriver("jdbc:sqlite:${file.absolutePath}")); repo.initialize()
            val reopened = FeatureForm(id(), mapOf("questions" to "")); reopened.restore(repo.loadDraft(cat.id, "vet-report")!!.value)
            assertEquals(question, reopened["questions"]); assertNull(repo.loadDraft(other.id, "vet-report"))
            reopened.applyReportScope(request.copy(from = "2026-10-07", through = "2026-10-13", questions = ""))
            assertEquals("2026-10-07", reopened["from"]); assertEquals("2026-10-13", reopened["through"])
            assertEquals(question, reopened["questions"])
            assertTrue(repo.observeEvents(cat.id).first().isEmpty()); assertTrue(repo.observeEvents(other.id).first().isEmpty())
            assertFailsWith<IllegalArgumentException> { request.copy(through = "2026-10-13").validate() }
            assertFailsWith<IllegalArgumentException> { request.copy(questions = "x".repeat(2001)).validate() }
            assertFailsWith<IllegalArgumentException> { CareReportScope.parse("cat-report-zz", cat.id) }
            Unit
        } finally { repo.close(); file.delete() }
    }

    @Test fun reportReadsTheRequestedCatAndExactContentAndExportsFullSafeNotes() = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY); JournalSchema.create(driver)
        driver.execute(null, "PRAGMA user_version=${JournalSchema.version}", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000 }, Dispatchers.Unconfined); repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val other = repo.addDog("Juniper")
            val time = at("2026-10-15T10:00:00Z")
            val note = "=SUM(1,2)\nCaregiver's full \"quoted\" note"
            val meal = repo.createEvent(cat.id, id(), CareEventInput(CareEventType.Meal, time, note))
            repo.createEvent(other.id, id(), CareEventInput(CareEventType.Meal, time, "Other cat private note"))
            val oldPlan = repo.saveItem(cat.id, id(), at("2026-10-01T00:00:00Z"), CareItemData.Medication("Recorded plan", "As prescribed", "Caregiver-entered", "As recorded", "2026-10-01"))
            val weight = repo.createEvent(cat.id, id(), CareEventInput(CareEventType.Weight, time+1, details = CareDetails.Weight(9.2, WeightUnit.Pounds)))
            val request = CareReportScope(cat.id, "2026-10-14", "2026-10-20", "care,medication", "Ask about appetite")
            suspend fun read(r: CareReportScope) = readCareReport(repo, { repo.observeItems(it).first() }, r, TimeZone.UTC, time+2)
            val report = read(request)
            assertEquals(setOf(meal.id, weight.id), report.events.map { it.id }.toSet()); assertEquals(listOf(oldPlan.id), report.items.map { it.id })
            assertEquals(WeightUnit.Pounds, (report.events.first { it.id == weight.id }.details as CareDetails.Weight).unit)
            val document = careReportDocument(report, ExportFormat.CSV)
            assertTrue(document.filename.startsWith("SoftPaws_Miso_")); assertFalse(document.csv.contains("Other cat private note"))
            assertTrue(document.csv.contains("'=SUM(1,2)\nCaregiver's full \"\"quoted\"\" note")); assertTrue(document.csv.contains("vet_questions")); assertTrue(document.csv.contains("Ask about appetite"))
            val onlyMedication = read(request.copy(content = "medication"))
            assertTrue(onlyMedication.events.isEmpty()); assertEquals(listOf(oldPlan), onlyMedication.items)
            assertEquals(setOf(ReportContent.Medication), onlyMedication.content)
            assertFailsWith<IllegalStateException> { read(request.copy(catId = id())) }
            assertEquals(2, repo.observeEvents(cat.id).first().size)
        } finally { repo.close() }
    }
}
