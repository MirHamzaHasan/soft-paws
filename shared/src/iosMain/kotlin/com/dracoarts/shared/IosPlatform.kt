@file:OptIn(kotlin.time.ExperimentalTime::class)

package com.dracoarts.shared

import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.services.AppPlatform
import platform.Foundation.NSUUID
import com.dracoarts.shared.data.local.IosJournalDriverFactory
import com.dracoarts.shared.data.local.JOURNAL_DATABASE_NAME
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import com.dracoarts.shared.presentation.review.BoardReviewPreferences
import com.dracoarts.shared.presentation.review.BoardReviewDataSet

class IosPlatform(private val boardFixture: BoardReviewDataSet? = null) : AppPlatform {
    override val journalDriverFactory = IosJournalDriverFactory(boardFixture?.databaseName ?: JOURNAL_DATABASE_NAME)
    override val storage = StorageManager(IosStorageBackend().let { if (boardFixture != null) BoardReviewPreferences(it, boardFixture.preferencePrefix) else it })
    override val haptics = IosHapticManager()
    override val device = IosDeviceServices()
    override fun newId(): String = NSUUID().UUIDString
    override fun nowMillis(): Long = if (boardFixture != null) BoardReviewFixture.now else kotlin.time.Clock.System.now().toEpochMilliseconds()
    override fun monotonicMillis(): Long = (platform.Foundation.NSProcessInfo.processInfo.systemUptime * 1000).toLong()
    override fun timeZone() = if (boardFixture != null) BoardReviewFixture.zone else kotlinx.datetime.TimeZone.currentSystemDefault()
    override fun close() = device.close()
}
