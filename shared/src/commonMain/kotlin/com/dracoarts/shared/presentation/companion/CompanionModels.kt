package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.DogContext
import kotlinx.serialization.Serializable

@Serializable
data class CompanionDraft(val requestId: String, val name: String = "", val sex: String = "Not recorded", val photoId: String? = null, val context: DogContext = DogContext.catDefaults(), val step: String = "next-opening", val editingDogId: String? = null, val addingDog: Boolean = false)
@Serializable
data class DemoSession(val signedIn: Boolean = false, val provider: String = "", val email: String = "", val premium: Boolean = false)
@Serializable
data class ProfileSnapshot(val name: String, val sex: String, val context: DogContext, val breed: String = "", val age: String = "", val notes: String = "")
@Serializable
data class SourceRecord(val id: String, val dogId: String, val type: String, val at: Long, val note: String = "")
@Serializable
data class CareReadingCount(val type: String, val count: Int)
@Serializable
data class CareWeekDay(val date: String, val counts: List<CareReadingCount>)
@Serializable
data class WeeklyAiContext(val fromMillis: Long, val untilMillis: Long, val timeZone: String, val total: Int, val shared: Int,
    val counts: List<CareReadingCount>, val days: List<CareWeekDay>, val focus: String? = null, val showCard: Boolean = true, val profileLimited: Boolean = false)
@Serializable
data class CareReadings(val dogName: String, val fromMillis: Long, val untilMillis: Long, val timeZone: String,
    val counts: List<CareReadingCount>, val latest: List<SourceRecord>)
@Serializable
data class LocalRetrieval(val focusType: String?, val rangeLabel: String, val fromMillis: Long?, val untilMillis: Long,
    val totalMatches: Long, val limited: Boolean)
@Serializable
data class CompanionMessage(val id: String, val text: String, val assistant: Boolean, val at: Long, val stopped: Boolean = false, val profile: ProfileSnapshot? = null, val records: List<SourceRecord> = emptyList(), val photoIds: List<String> = emptyList(), val responseSource: String = "demo", val captionRequest: Boolean = false, val readings: CareReadings? = null, val weekly: WeeklyAiContext? = null)
@Serializable
data class CompanionThread(val id: String, val title: String, val messages: List<CompanionMessage> = emptyList())
@Serializable
data class CompanionWorkspace(val messageConsent: Boolean = false, val profileConsent: Boolean = false, val recordConsent: Boolean = false, val week: Boolean = false, val selectedRecords: List<String> = emptyList(), val threads: List<CompanionThread> = emptyList(), val currentThread: String? = null, val cloudConsent: Boolean = false, val weeklyConsentVersion: Int = 0) {
    val thread get() = threads.firstOrNull { it.id == currentThread }
    val weeklyAllowed get() = weeklyConsentVersion == 1 && messageConsent && profileConsent && recordConsent && cloudConsent
}
@Serializable
data class ChatComposerDraft(val text: String = "", val photoIds: List<String> = emptyList())

data class CompanionState(val premiumCustomer: com.dracoarts.shared.domain.model.PremiumCustomer = com.dracoarts.shared.domain.model.PremiumCustomer(), val premiumPreviewAllowed: Boolean = false, val purchaseBusy: Boolean = false, val profileSaving: Boolean = false, val reviewingDraft: Boolean = false, val authBusy: Boolean = false, val emailLinkPending: Boolean = false, val loading: Boolean = true, val loadFailed: Boolean = false, val conversationsFailed: Boolean = false, val session: DemoSession = DemoSession(), val draft: CompanionDraft = CompanionDraft(""), val workspace: CompanionWorkspace = CompanionWorkspace(), val dogId: String? = null, val route: CompanionScreen? = null, val busy: Boolean = false, val error: String? = null, val streaming: String? = null, val pendingQuestion: String? = null, val premiumFeature: PremiumFeature? = null, val premiumReturn: CompanionScreen? = null, val composer: ChatComposerDraft = ChatComposerDraft()) {
    val premiumAccess get() = premiumCustomer.entitled || (premiumPreviewAllowed && session.premium)
}
