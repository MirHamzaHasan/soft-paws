package com.dracoarts.shared.domain.model

import kotlinx.datetime.*
import kotlinx.serialization.Serializable

/** The exact month and linked collection revisions shown beside a photo. */
@Serializable
data class PhotoMemorySelection(val month: String, val zoneId: String, val revisions: Map<String, Long>) {
    companion object {
        fun capture(catId: String, photoId: String, month: String, zone: TimeZone, items: List<CareItem>) =
            PhotoMemorySelection(month, zone.id, linked(catId, photoId, month, zone, items).associate { it.id to it.revision })

        fun linked(catId: String, photoId: String, month: String, zone: TimeZone, items: List<CareItem>) = items.filter {
            it.dogId == catId && (it.data as? CareItemData.Memory)?.sourceIds?.contains(photoId) == true && memoryMonth(it, zone) == month
        }
    }
}

/** Explicit new months survive travel; old rows retain their original timestamp behavior. */
fun memoryMonth(item: CareItem, zone: TimeZone): String {
    val data = item.data as CareItemData.Memory
    return data.month.ifBlank { Instant.fromEpochMilliseconds(item.occurredAt).toLocalDateTime(zone).date.toString().take(7) }
}

data class PhotoMemoryResult(val photo: CareItem, val collections: List<CareItem>)
