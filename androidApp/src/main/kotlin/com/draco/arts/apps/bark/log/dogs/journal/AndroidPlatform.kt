package com.draco.arts.apps.bark.log.dogs.journal

import androidx.activity.ComponentActivity
import com.dracoarts.shared.services.AppPlatform
import com.dracoarts.shared.managers.StorageManager
import java.util.UUID
import com.dracoarts.shared.data.local.AndroidJournalDriverFactory
import com.dracoarts.shared.data.local.JOURNAL_DATABASE_NAME
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import com.dracoarts.shared.presentation.review.BoardReviewPreferences
import com.dracoarts.shared.presentation.review.BoardReviewDataSet

class AndroidPlatform(context: ComponentActivity, private val boardFixture: BoardReviewDataSet? = null) : AppPlatform {
    override val journalDriverFactory = AndroidJournalDriverFactory(context, boardFixture?.databaseName ?: JOURNAL_DATABASE_NAME)
    override val storage = StorageManager(AndroidStorageBackend(context).let { if (boardFixture != null) BoardReviewPreferences(it, boardFixture.preferencePrefix) else it })
    override val haptics = AndroidHapticManager(context)
    override val device = AndroidDeviceServices(context).also { it.handleIntent(context.intent) }
    override fun newId(): String = UUID.randomUUID().toString()
    override fun nowMillis(): Long = if (boardFixture != null) BoardReviewFixture.now else System.currentTimeMillis()
    override fun monotonicMillis(): Long = android.os.SystemClock.elapsedRealtime()
    override fun timeZone() = if (boardFixture != null) BoardReviewFixture.zone else kotlinx.datetime.TimeZone.currentSystemDefault()
    override fun close() = device.close()
}
