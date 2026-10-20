package com.dracoarts.shared.domain.repository

/** SQLite documents for first-run drafts and local demo conversations, separate from preferences. */
interface LocalDocumentRepository {
    suspend fun readDocument(id: String): String?
    suspend fun writeDocument(id: String, value: String, dogId: String? = null, consumedDraftSlot: String? = null)
    suspend fun removeDocuments(prefix: String)
}
