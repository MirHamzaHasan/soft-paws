@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package com.dracoarts.shared.data.local

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver
import platform.Foundation.NSApplicationSupportDirectory
import platform.Foundation.NSFileManager
import platform.Foundation.NSNumber
import platform.Foundation.NSURLIsExcludedFromBackupKey
import platform.Foundation.NSUserDomainMask

class IosJournalDriverFactory(private val databaseName: String = JOURNAL_DATABASE_NAME) : JournalDriverFactory {
    override fun open(): SqlDriver {
        val files = NSFileManager.defaultManager
        val support = checkNotNull(files.URLForDirectory(NSApplicationSupportDirectory, NSUserDomainMask, null, true, null))
        val journalDirectory = checkNotNull(support.URLByAppendingPathComponent("BarkLogJournal", true))
        check(files.createDirectoryAtURL(journalDirectory, true, null, null)) { "Could not create journal directory." }
        check(journalDirectory.setResourceValue(NSNumber(bool = true), NSURLIsExcludedFromBackupKey, null)) { "Could not set journal backup policy." }
        require(Regex("[a-zA-Z0-9_]+\\.db").matches(databaseName))
        return NativeSqliteDriver(JournalSchema, databaseName, onConfiguration = { config ->
            config.copy(extendedConfig = config.extendedConfig.copy(
                basePath = checkNotNull(journalDirectory.path), foreignKeyConstraints = true,
            ))
        })
    }
}
