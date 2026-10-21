package com.dracoarts.shared.presentation.companion

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

enum class CompanionAiPurpose { Conversation, ToxicityEducation, SafetyEducation }

/** Explicitly selected by the owner. This provider never authenticates or sends data. */
data class CompanionAiRequest(val question: String, val profile: ProfileSnapshot?, val records: List<SourceRecord>, val allowCloud: Boolean = false, val history: List<CompanionMessage> = emptyList(), val captionPhotoId: String? = null,
    val localProfile: ProfileSnapshot? = profile, val localRecords: List<SourceRecord> = records,
    val requestedAtMillis: Long? = null, val timeZone: String = "UTC", val localRetrieval: LocalRetrieval? = null, val localReadings: CareReadings? = null, val weekly: WeeklyAiContext? = null, val purpose: CompanionAiPurpose = CompanionAiPurpose.Conversation)
data class CompanionReply(val text: String, val source: String)
interface CompanionResponseProvider { fun response(request: CompanionAiRequest): Flow<CompanionReply> }
class DemoResponseProvider : CompanionResponseProvider {
    override fun response(request: CompanionAiRequest): Flow<CompanionReply> = flow {
        val (question, profile, records) = request
        val q = question.lowercase()
        val text = when {
            request.purpose != CompanionAiPurpose.Conversation -> "Preview answer for ${profile?.name ?: "your cat"}: keep the product label and your saved observations ready for a veterinarian. This is a design example, not a live AI response or an assessment of an exposure. For an actual concern, use the emergency contacts above."
            ChatHealth.urgent(q) -> "Contact your veterinarian or an emergency veterinary clinic now. Keep any package and note what happened and when. I can organize observations, but cannot assess an emergency or recommend treatment."
            ChatHealth.treatment(q) || Regex("is .*healthy").containsMatchIn(q) -> "I can’t diagnose a dog or recommend medication or doses. A veterinarian needs to assess that. I can help organize your observations and questions for the appointment."
            ChatHealth.medication(q) -> ChatHealth.medicationEducation
            Regex("breed|age|food|diet|weight|know about|profile|allerg|personality").containsMatchIn(q) -> profile?.let { "These are the details you chose for ${it.name}, as caregiver observations:\n\n" + it.context.facts().joinToString("\n") { (k,v) -> "$k: $v" } } ?: "The dog profile isn’t included in this conversation. Choose Profile & care notes below if you want to use it. I won’t fill in missing details."
            "caption" in q || "memory" in q -> "A draft from your words: “Another little moment together.” Add your own place, activity or detail before saving it."
            "vet" in q -> "Questions to bring to your veterinarian:\n• Which of these recorded observations should we discuss?\n• What details should I record next time?\n• When should I contact the clinic again?\n\nThis organizes notes; it is not medical advice."
            records.isEmpty() -> "No journal records are included. Choose the records you want to discuss, or ask for help organizing a note. Missing records do not tell us how a dog is feeling."
            "walk" in q -> records.filter { it.type == "Walk" }.maxByOrNull { it.at }?.let { "The latest selected walk is in the source record below. ${it.note.ifBlank { "No extra note was recorded." }}\n\nThis describes a recorded observation, not the dog’s health." } ?: "There is no walk in the selected records. I won’t infer one."
            else -> "The selected context contains ${records.size} recorded moments:\n\n" + records.groupingBy { it.type }.eachCount().entries.joinToString("\n") { "${it.key}: ${it.value}" } + "\n\nThese are selected records, not a complete picture of the day or a health assessment."
        }
        val words = text.split(' ')
        var value = ""
        for (word in words) { delay(28); value += (if (value.isEmpty()) "" else " ") + word; emit(CompanionReply(value, "demo")) }
    }
}
