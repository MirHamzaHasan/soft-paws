package com.dracoarts.shared.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class ObservationContext(val location: String = "", val caregiver: String = "", val photoId: String? = null, val observations: Map<String, String> = emptyMap()) {
    fun validate() {
        require(location.length <= 160 && caregiver.length <= 100 && (location + caregiver).none { it == '\u0000' }) { "Check the location and caregiver fields." }
        require(photoId == null || Regex("[a-zA-Z0-9-]+\\.(jpg|png|jpeg)").matches(photoId)) { "Invalid photo reference." }
        require(observations.size <= 8 && observations.all { (key, value) -> key in fields && value.length <= (if (key == "Trigger") 240 else 200) && value.none { it == '\u0000' } }) { "Check the observation details." }
    }
    companion object { val fields = setOf("Color", "Appearance", "Frequency", "Eaten", "Pace", "Route", "Onset", "Trigger", "Product", "Method", "Energy", "Accident", "Blood or mucus") }
}
