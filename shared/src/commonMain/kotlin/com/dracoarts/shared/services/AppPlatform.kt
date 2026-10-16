package com.dracoarts.shared.services

import com.dracoarts.shared.managers.HapticManager
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.data.local.JournalDriverFactory

/** Device capabilities. Preferences and the SQLite journal have separate ownership. */
interface AppPlatform {
    val journalDriverFactory: JournalDriverFactory
    val storage: StorageManager
    val haptics: HapticManager
    val device: DeviceServices get() = error("Native device services are not installed in this host.")
    fun newId(): String
    fun nowMillis(): Long
    fun monotonicMillis(): Long = nowMillis()
    fun timeZone(): kotlinx.datetime.TimeZone = kotlinx.datetime.TimeZone.currentSystemDefault()
    fun close() = Unit
}
