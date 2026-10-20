package com.dracoarts.shared.managers

import com.dracoarts.shared.services.AppPlatform
import com.dracoarts.shared.services.TemplatePlugins

/** Retained base composition boundary. No network client or optional service starts here. */
class AppManagers(private val platform: AppPlatform) {
    val storage = platform.storage
    val sounds = com.dracoarts.shared.services.InteractionSounds(platform.soundPlayer, platform::monotonicMillis)
    val haptics = if (TemplatePlugins.isEnabled("haptics")) platform.haptics else DisabledHaptics
    fun close() { sounds.close(); platform.close() }
}
