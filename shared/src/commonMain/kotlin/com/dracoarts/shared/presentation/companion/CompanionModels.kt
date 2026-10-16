package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.DogContext
import kotlinx.serialization.Serializable

@Serializable
data class CompanionDraft(val requestId: String, val name: String = "", val sex: String = "Not recorded", val photoId: String? = null, val context: DogContext = DogContext(), val step: String = "next-opening", val editingDogId: String? = null)
@Serializable
data class DemoSession(val signedIn: Boolean = false, val provider: String = "", val email: String = "", val premium: Boolean = false)
@Serializable
data class ProfileSnapshot(val name: String, val sex: String, val context: DogContext)
@Serializable
data class SourceRecord(val id: String, val dogId: String, val type: String, val at: Long, val note: String = "")
@Serializable
data class CompanionMessage(val id: String, val text: String, val assistant: Boolean, val at: Long, val stopped: Boolean = false, val profile: ProfileSnapshot? = null, val records: List<SourceRecord> = emptyList())
@Serializable
data class CompanionThread(val id: String, val title: String, val messages: List<CompanionMessage> = emptyList())
@Serializable
data class CompanionWorkspace(val messageConsent: Boolean = false, val profileConsent: Boolean = false, val recordConsent: Boolean = false, val week: Boolean = false, val selectedRecords: List<String> = emptyList(), val threads: List<CompanionThread> = emptyList(), val currentThread: String? = null) {
    val thread get() = threads.firstOrNull { it.id == currentThread }
}
data class CompanionState(val loading: Boolean = true, val loadFailed: Boolean = false, val conversationsFailed: Boolean = false, val session: DemoSession = DemoSession(), val draft: CompanionDraft = CompanionDraft(""), val workspace: CompanionWorkspace = CompanionWorkspace(), val dogId: String? = null, val route: CompanionScreen? = null, val busy: Boolean = false, val error: String? = null, val streaming: String? = null, val pendingQuestion: String? = null, val submittedId: String? = null, val submittedQuestion: String? = null)
