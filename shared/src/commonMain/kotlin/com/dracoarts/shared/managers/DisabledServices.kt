package com.dracoarts.shared.managers

object DisabledHaptics : HapticManager {
    override fun perform(kind: HapticKind) = Unit
}

