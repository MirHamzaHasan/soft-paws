package com.dracoarts.shared.data.local

import app.cash.sqldelight.db.AfterVersion
import app.cash.sqldelight.db.QueryResult
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.db.SqlSchema

fun interface JournalDriverFactory {
    /** Called on the repository's disk dispatcher, never during UI composition. */
    fun open(): SqlDriver
}

const val JOURNAL_DATABASE_NAME = "barklog_kmp_v1.db"

/** Never permit a driver to silently downgrade an unfamiliar journal. */
object JournalSchema : SqlSchema<QueryResult.Value<Unit>> {
    override val version get() = BarkLogDatabase.Schema.version
    override fun create(driver: SqlDriver) = BarkLogDatabase.Schema.create(driver)
    override fun migrate(driver: SqlDriver, oldVersion: Long, newVersion: Long, vararg callbacks: AfterVersion): QueryResult.Value<Unit> {
        require(oldVersion in 1..version && newVersion in oldVersion..version) { "Unsupported journal version." }
        return BarkLogDatabase.Schema.migrate(driver, oldVersion, newVersion, *callbacks)
    }
}
