package com.dracoarts.shared.domain.model

data class CareEvent(
    val id: String,
    val dogId: String,
    val type: CareEventType,
    val occurredAtMillis: Long,
    val createdAtMillis: Long,
    val note: String? = null,
    val details: CareDetails? = null,
    val revision: Long = 1,
    val updatedAtMillis: Long = createdAtMillis,
    val context: ObservationContext = ObservationContext(),
)
