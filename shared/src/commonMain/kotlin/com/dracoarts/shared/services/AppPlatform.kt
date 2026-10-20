package com.dracoarts.shared.services

import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.data.local.JournalDriverFactory

/** Device capabilities. Preferences and the SQLite journal have separate ownership. */
interface AppPlatform {
    val journalDriverFactory: JournalDriverFactory
    val storage: StorageManager
    val haptics: HapticManager
    val soundPlayer: InteractionSoundPlayer get() = SilentInteractionSoundPlayer
    val device: DeviceServices get() = error("Native device services are not installed in this host.")
    val highlights: HighlightRenderer get() = UnavailableHighlightRenderer
    val authEngine: NativeAuthEngine get() = UnavailableAuthEngine
    val purchasesEngine: NativePurchasesEngine get() = UnavailablePurchasesEngine
    val premiumPreviewAllowed: Boolean get() = false
    val atlasPlatform: String get() = "unsupported"
    val atlasEnabled: Boolean get() = false
    val localAi: com.dracoarts.shared.services.ai.LocalAi get() = com.dracoarts.shared.services.ai.UnavailableLocalAi
    fun newId(): String
    fun nowMillis(): Long
    fun monotonicMillis(): Long = nowMillis()
    fun timeZone(): kotlinx.datetime.TimeZone = kotlinx.datetime.TimeZone.currentSystemDefault()
    fun close() = Unit
}
