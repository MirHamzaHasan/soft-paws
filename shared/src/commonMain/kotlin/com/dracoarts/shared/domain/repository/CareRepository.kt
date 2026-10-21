package com.dracoarts.shared.domain.repository

import com.dracoarts.shared.domain.model.*
import kotlinx.coroutines.flow.Flow

interface CareRepository {
    suspend fun loadDraft(dogId: String, slot: String): LocalDraft?
    suspend fun saveDraft(dogId: String, slot: String, draft: LocalDraft)
    suspend fun discardDraft(dogId: String, slot: String)
    suspend fun pendingCleanup(): List<DeviceCleanup>
    suspend fun photoReferenced(fileId: String): Boolean
    suspend fun acknowledgeCleanup(job: DeviceCleanup)
    fun observeItems(dogId: String): Flow<List<CareItem>>
    suspend fun saveItem(dogId: String, id: String, occurredAt: Long, data: CareItemData, expectedRevision: Long? = null, draftSlot: String? = null): CareItem
    /** Photo/caption and its explicitly chosen monthly membership commit together. */
    suspend fun savePhotoAndMemory(dogId: String, id: String, occurredAt: Long, data: CareItemData.Photo,
        expectedRevision: Long?, selection: PhotoMemorySelection, included: Boolean, collectionId: String, draftSlot: String?): PhotoMemoryResult
    suspend fun deleteItem(item: CareItem)
    /** Session/completion/administration and the factual Timeline record commit together. */
    suspend fun recordActivity(dogId: String, id: String, occurredAt: Long, data: CareItemData): CareItem
    /** Remove only this occurrence and its captured Journal revision in one transaction. */
    suspend fun undoTaskCompletion(item: CareItem, expectedEventRevision: Long?)
    suspend fun updateDog(dog: Dog, name: String, details: DogDetails, draftSlot: String? = null): Dog
    suspend fun deleteDog(dogId: String)
    suspend fun deleteAll()
}

data class LocalDraft(val value: String, val photoIds: List<String> = emptyList())
data class DraftSource(val dogId: String, val slot: String)
data class DeviceCleanup(val kind: String, val reference: String, val generation: Long)
