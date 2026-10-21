package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.LocalDate
import java.nio.file.Files
import java.util.UUID
import kotlin.test.*

class CatExpensesTest {
    private fun id() = UUID.randomUUID().toString()

    @Test fun enteredMonthCurrencyPrecisionLegacyCategoryAndReceiptSurviveReopen() = runBlocking {
        val directory = Files.createTempDirectory("soft-paws-expenses-").toFile()
        val database = directory.resolve("journal.db")
        fun open(create: Boolean = false): SqlDelightJournalRepository {
            val driver = JdbcSqliteDriver("jdbc:sqlite:${database.absolutePath}")
            if (create) { JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0) }
            return SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000L }, Dispatchers.Unconfined)
        }
        val initial = open(true); initial.initialize()
        val cat = initial.addDog("Miso"); val other = initial.addDog("Cleo")
        val receipt = id() + ".pdf"
        val costs = listOf(
            CareItemData.Expense(Money.parse("28.40", "USD"), "USD", "Food & treats", "2026-10-03", "Food note", receipt, "Food & treats"),
            CareItemData.Expense(Money.parse("15.35", "USD"), "USD", "Litter", "2026-10-14"),
            CareItemData.Expense(Money.parse("101", "JPY"), "JPY", "Training", "2026-10-31", description = "Legacy entered category"),
            CareItemData.Expense(Money.parse("1.001", "KWD"), "KWD", "Custom category", "2026-10-01"),
            CareItemData.Expense(999, "USD", "Other", "2026-09-30"))
        // Occurrence timestamps deliberately disagree: grouping must use each entered date.
        costs.forEachIndexed { i, cost -> initial.saveItem(cat.id, id(), 100L + i, cost) }
        initial.saveItem(other.id, id(), 900, CareItemData.Expense(800000, "USD", "Other", "2026-10-20"))
        initial.close()
        val reopened = open(); reopened.initialize()
        try {
            val items = reopened.observeItems(cat.id).first()
            assertEquals(costs.toSet(), items.map { it.data }.toSet())
            val all = items + reopened.observeItems(other.id).first()
            val month = RecordedExpenses.read(cat.id, LocalDate(2026, 10, 20), all)
            assertEquals(mapOf("JPY" to 101L, "KWD" to 1001L, "USD" to 4375L), month.totals)
            assertEquals(listOf("2026-10-31", "2026-10-14", "2026-10-03", "2026-10-01"), month.items.map { (it.data as CareItemData.Expense).date })
            assertEquals(mapOf("USD" to 1535L), RecordedExpenses.read(cat.id, LocalDate(2026, 10, 1), all, "Litter").totals)
            val report = readCareReport(reopened, { all }, CareReportScope(cat.id, "2026-10-01", "2026-10-31", ReportContent.encode(setOf(ReportContent.Expenses))), kotlinx.datetime.TimeZone.of("Pacific/Honolulu"), 1000L)
            assertEquals(month.items.map { it.id }.toSet(), report.items.map { it.id }.toSet())
            assertEquals(month.totals, RecordedExpenses.read(cat.id, LocalDate(2026, 10, 1), report.items).totals)
            assertTrue(RecordedExpenses.read(cat.id, LocalDate(2026, 8, 1), all).items.isEmpty())
            assertTrue(CatExpenseCategories.choices(items).containsAll(listOf("Training", "Custom category")))
            assertFalse("Training" in CatExpenseCategories.choices(emptyList()))
            assertTrue(reopened.photoReferenced(receipt))
        } finally { reopened.close(); directory.deleteRecursively() }
    }

    @Test fun failedSaveAndStaleDeleteKeepDraftReceiptAndNewerExpense() = runBlocking {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        JournalSchema.create(driver); driver.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
        val repo = SqlDelightJournalRepository(JournalDriverFactory { driver }, ::id, { 1000L }, Dispatchers.Unconfined)
        repo.initialize()
        try {
            val cat = repo.addDog("Miso"); val shared = id() + ".pdf"
            val first = repo.saveItem(cat.id, id(), 100, CareItemData.Expense(101, "KWD", "Vet", "2026-10-20", receiptId = shared))
            val draft = LocalDraft("{\"description\":\"retained entered details\"}", listOf(shared))
            repo.saveDraft(cat.id, "expense-", draft)
            driver.execute(null, "CREATE TRIGGER fail_cost BEFORE INSERT ON care_items BEGIN SELECT RAISE(ABORT, 'disk failure'); END", 0)
            assertFailsWith<Exception> { repo.saveItem(cat.id, id(), 200, CareItemData.Expense(1234, "USD", "Litter", "2026-10-21"), draftSlot = "expense-") }
            assertEquals(draft, repo.loadDraft(cat.id, "expense-"))
            assertEquals(listOf(first), repo.observeItems(cat.id).first())
            driver.execute(null, "DROP TRIGGER fail_cost", 0)
            val newer = repo.saveItem(cat.id, first.id, 100, (first.data as CareItemData.Expense).copy(notes = "Newer note"), first.revision)
            assertFailsWith<RecordConflictException> { repo.deleteItem(first) }
            assertEquals(listOf(newer), repo.observeItems(cat.id).first())
            repo.deleteItem(newer)
            assertTrue(repo.photoReferenced(shared))
            repo.discardDraft(cat.id, "expense-")
            assertFalse(repo.photoReferenced(shared))
            assertTrue(repo.pendingCleanup().any { it.reference == shared })
        } finally { repo.close() }
    }
}
