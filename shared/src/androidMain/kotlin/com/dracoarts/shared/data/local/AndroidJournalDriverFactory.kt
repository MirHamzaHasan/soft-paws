package com.dracoarts.shared.data.local

import android.content.Context
import androidx.sqlite.db.SupportSQLiteDatabase
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver

class AndroidJournalDriverFactory(context: Context, private val databaseName: String = JOURNAL_DATABASE_NAME) : JournalDriverFactory {
    private val applicationContext = context.applicationContext
    override fun open(): SqlDriver = AndroidSqliteDriver(
        schema = JournalSchema,
        context = applicationContext,
        name = databaseName,
        useNoBackupDirectory = true,
        callback = object : AndroidSqliteDriver.Callback(JournalSchema) {
            override fun onConfigure(db: SupportSQLiteDatabase) { db.setForeignKeyConstraintsEnabled(true) }
            override fun onCorruption(db: SupportSQLiteDatabase) {
                // AndroidX's default handler deletes the file. Keep it for explicit recovery/export.
                runCatching { db.close() }
                error("Journal integrity check failed; original file retained.")
            }
        },
    )
}
