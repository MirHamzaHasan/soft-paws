@file:OptIn(kotlin.time.ExperimentalTime::class, kotlinx.cinterop.ExperimentalForeignApi::class)

package com.dracoarts.shared

import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.services.AppPlatform
import platform.Foundation.NSUUID
import com.dracoarts.shared.data.local.IosJournalDriverFactory
import com.dracoarts.shared.data.local.JOURNAL_DATABASE_NAME
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import com.dracoarts.shared.presentation.review.BoardReviewPreferences
import com.dracoarts.shared.presentation.review.BoardReviewDataSet

class IosPlatform(private val boardFixture: BoardReviewDataSet? = null, videoEngine: com.dracoarts.shared.highlights.IosVideoEngine? = null, override val authEngine: com.dracoarts.shared.services.NativeAuthEngine = com.dracoarts.shared.services.UnavailableAuthEngine, override val purchasesEngine: com.dracoarts.shared.services.NativePurchasesEngine = com.dracoarts.shared.services.UnavailablePurchasesEngine) : AppPlatform {
    override val atlasPlatform = "ios"
    @OptIn(kotlin.experimental.ExperimentalNativeApi::class)
    override val premiumPreviewAllowed = kotlin.native.Platform.isDebugBinary
    @OptIn(kotlin.experimental.ExperimentalNativeApi::class)
    override val atlasEnabled = kotlin.native.Platform.isDebugBinary && boardFixture == null
    override val journalDriverFactory = IosJournalDriverFactory(boardFixture?.databaseName ?: JOURNAL_DATABASE_NAME)
    override val storage = StorageManager(IosStorageBackend().let { if (boardFixture != null) BoardReviewPreferences(it, boardFixture.preferencePrefix) else it })
    override val haptics = IosHapticManager()
    override val soundPlayer = IosInteractionSounds()
    override val device = IosDeviceServices()
    override val localAi by lazy {
        val files = platform.Foundation.NSFileManager.defaultManager
        val support = (platform.Foundation.NSSearchPathForDirectoriesInDomains(platform.Foundation.NSApplicationSupportDirectory, platform.Foundation.NSUserDomainMask, true).first() as String)
        val directory = "$support/BarkLogModels"
        com.dracoarts.shared.services.ai.createGgufLocalAi(directory, device, platform.Foundation.NSProcessInfo.processInfo.physicalMemory.toLong(),
            { (files.attributesOfFileSystemForPath(support, null)?.get(platform.Foundation.NSFileSystemFreeSize) as? platform.Foundation.NSNumber)?.longLongValue ?: 0L },
            { check(platform.Foundation.NSURL.fileURLWithPath(directory).setResourceValue(platform.Foundation.NSNumber(bool = true), platform.Foundation.NSURLIsExcludedFromBackupKey, null)) })
    }
    override val highlights = videoEngine?.let { com.dracoarts.shared.highlights.IosHighlightRenderer(it) } ?: com.dracoarts.shared.services.UnavailableHighlightRenderer
    override fun newId(): String = NSUUID().UUIDString
    override fun nowMillis(): Long = boardFixture?.nowMillis ?: kotlin.time.Clock.System.now().toEpochMilliseconds()
    override fun monotonicMillis(): Long = (platform.Foundation.NSProcessInfo.processInfo.systemUptime * 1000).toLong()
    override fun timeZone() = if (boardFixture != null) BoardReviewFixture.zone else kotlinx.datetime.TimeZone.currentSystemDefault()
    override fun close() = device.close()
}
