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
    override val atlasPlatform = "google-play"
    override val premiumPreviewAllowed = BuildConfig.DEBUG
    override val purchasesEngine: com.dracoarts.shared.services.NativePurchasesEngine = if(boardFixture == null) AndroidPurchases(context) else com.dracoarts.shared.services.UnavailablePurchasesEngine
    // Soft Paws needs its own admission/policy proof. The redesign authorizes no live retry.
    override val atlasEnabled = false
    override val journalDriverFactory = AndroidJournalDriverFactory(context, boardFixture?.databaseName ?: JOURNAL_DATABASE_NAME)
    override val storage = StorageManager(AndroidStorageBackend(context).let { if (boardFixture != null) BoardReviewPreferences(it, boardFixture.preferencePrefix) else it })
    override val haptics = AndroidHapticManager(context)
    override val soundPlayer = AndroidInteractionSounds(context)
    override val device = AndroidDeviceServices(context).also { it.handleIntent(context.intent) }
    override val localAi by lazy {
        val directory = java.io.File(context.noBackupFilesDir, "ai-models")
        val memory = android.app.ActivityManager.MemoryInfo().also { (context.getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager).getMemoryInfo(it) }
        com.dracoarts.shared.services.ai.createGgufLocalAi(directory.absolutePath, device, memory.totalMem,
            { context.noBackupFilesDir.usableSpace })
    }
    override val highlights = AndroidHighlightRenderer(context)
    override val authEngine: com.dracoarts.shared.services.NativeAuthEngine = if (boardFixture != null || !BuildConfig.FIREBASE_CONFIGURED) com.dracoarts.shared.services.UnavailableAuthEngine else AndroidFirebaseAuth(context)
    override fun newId(): String = UUID.randomUUID().toString()
    override fun nowMillis(): Long = boardFixture?.nowMillis ?: System.currentTimeMillis()
    override fun monotonicMillis(): Long = android.os.SystemClock.elapsedRealtime()
    override fun timeZone() = if (boardFixture != null) BoardReviewFixture.zone else kotlinx.datetime.TimeZone.currentSystemDefault()
    override fun close() = device.close()
}
