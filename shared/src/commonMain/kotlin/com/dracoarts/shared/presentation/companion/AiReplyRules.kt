package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.services.ai.AiException

internal fun aiSafetyReply(question: String): String? = when {
    ChatHealth.urgent(question) -> "Contact your veterinarian or an emergency veterinary clinic now. Keep any package and note what happened and when. I can organize observations, but cannot assess an emergency or recommend treatment."
    ChatHealth.treatment(question) || Regex("is .*healthy", RegexOption.IGNORE_CASE).containsMatchIn(question) -> "I can’t diagnose a dog or recommend medication or doses. A veterinarian needs to assess that. I can help organize your observations and questions for the appointment."
    ChatHealth.medication(question) -> ChatHealth.medicationEducation
    else -> null
}

internal fun validateAiAnswer(text: String) {
    if (text.isBlank() || text.length > 16_000 || Regex("\\b(?:oils?|lavender|chamomile|aromatherapy|calming scent|herbal|supplements?)\\b", RegexOption.IGNORE_CASE).containsMatchIn(text) ||
        Regex("\\b\\d+(?:\\.\\d+)?\\s*(?:mg|mcg|ml)(?:/kg)?\\b|\\b(?:your dog has|diagnosed with|you should administer|give your dog|increase the dose)\\b", RegexOption.IGNORE_CASE).containsMatchIn(text))
        throw AiException("The answer didn’t meet BarkLog’s safety limits and was withheld. Ask your veterinarian about health or treatment.")
}

internal fun profileFacts(profile: ProfileSnapshot): List<Pair<String, String>> = listOf(
    "Name" to profile.name, "Breed or mix" to profile.context.breeds.joinToString(" × ").ifBlank { profile.breed },
    "Age" to profile.context.ageLabel().ifBlank { profile.age }, "Sex" to profile.sex
) + profile.context.facts().filter { it.first !in setOf("Breed or mix", "Age", "AI topics", "Your experience", "Care priorities") } +
    listOf("Other caregiver notes" to profile.notes)
