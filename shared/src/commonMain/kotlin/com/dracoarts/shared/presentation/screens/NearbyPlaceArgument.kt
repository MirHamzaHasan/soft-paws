package com.dracoarts.shared.presentation.screens

/** Only typed place text is carried; coordinates never enter saved navigation. */
internal fun nearbyPlaceArgument(reason: String, place: String): String {
    require(reason in setOf("manual", "manual-denied", "manual-cancelled", "manual-failed"))
    require(place.length <= 160)
    return reason + "@" + place.encodeToByteArray().joinToString("") { (it.toInt() and 255).toString(16).padStart(2, '0') }
}

internal fun nearbyPlaceFromArgument(argument: String): String = runCatching {
    val hex = argument.substringAfter('@', "")
    require(hex.length % 2 == 0 && hex.length <= 1280)
    hex.chunked(2).map { it.toInt(16).toByte() }.toByteArray().decodeToString(throwOnInvalidSequence = true).also { require(it.length <= 160) }
}.getOrDefault("")
