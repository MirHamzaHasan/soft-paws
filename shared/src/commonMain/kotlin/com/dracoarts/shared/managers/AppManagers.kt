package com.dracoarts.shared.managers

import com.dracoarts.shared.services.AppPlatform
import com.dracoarts.shared.services.TemplatePlugins

/** Retained base composition boundary. No network client or optional service starts here. */
class AppManagers(private val platform: AppPlatform) {
    val storage = platform.storage
    val haptics = if (TemplatePlugins.isEnabled("haptics")) platform.haptics else DisabledHaptics
    fun close() = platform.close()
}
