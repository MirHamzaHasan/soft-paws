package com.dracoarts.shared.managers

enum class HapticKind { Success, Warning, Error, Light, Medium, Heavy, Selection }

interface HapticManager {
    fun perform(kind: HapticKind)
    fun success() = perform(HapticKind.Success)
    fun warning() = perform(HapticKind.Warning)
    fun error() = perform(HapticKind.Error)
    fun light() = perform(HapticKind.Light)
    fun medium() = perform(HapticKind.Medium)
    fun heavy() = perform(HapticKind.Heavy)
    fun selectionChange() = perform(HapticKind.Selection)
}
