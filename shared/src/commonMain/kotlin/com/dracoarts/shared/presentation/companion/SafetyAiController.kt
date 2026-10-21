package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.services.AppPlatform
import com.dracoarts.shared.services.ai.AiException
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.last

/** Ephemeral education only. Uses the same consent, identity and server policy as chat. */
class SafetyAiController(
    private val journal: JournalRepository,
    private val platform: AppPlatform,
    private val provider: CompanionResponseProvider,
    private val state: () -> CompanionState,
    private val premium: () -> Boolean,
    private val identity: () -> String?,
) {
    suspend fun answer(dogId: String, topic: String, purpose: CompanionAiPurpose, exposureNotes: String = ""): CompanionReply {
        require(purpose != CompanionAiPurpose.Conversation)
        val query = topic.trim()
        require(query.isNotEmpty() && query.length <= 160)
        require(exposureNotes.length <= 1000)
        val initial = state()
        val uid = identity()
        fun checkAccess() {
            if (!premium()) throw AiException("Soft Paws Premium is needed for AI safety topics. Emergency calls stay free.")
            if (state().dogId != dogId || !state().workspace.weeklyAllowed || identity() != uid)
                throw AiException("The cat, account or AI consent changed. Review it before asking again.")
            if (provider !is DemoResponseProvider && uid == null) throw AiException("Sign in to use Soft Paws AI. Emergency calls stay available.")
        }
        if (!initial.workspace.weeklyAllowed) throw AiException("Review AI & your records before sending this topic.")
        checkAccess()
        val question = if (purpose == CompanionAiPurpose.ToxicityEducation)
            "Explain general cat-safety information about this substance/product, without assessing an exposure: $query" +
                exposureNotes.trim().takeIf(String::isNotEmpty)?.let { "\nCaregiver's description, not clinical findings: $it" }.orEmpty()
        else "Explain this cat-safety topic and how to prepare questions for a veterinarian: $query"
        val now = platform.nowMillis()
        val context = prepareWeeklyContext(journal, dogId, question, now, platform.timeZone())
        currentCoroutineContext().ensureActive(); checkAccess()
        val reply = provider.response(CompanionAiRequest(question, context.profile, context.records, allowCloud = true,
            requestedAtMillis = now, timeZone = platform.timeZone().id, weekly = context.weekly, purpose = purpose)).last()
        currentCoroutineContext().ensureActive(); checkAccess()
        if (reply.source !in setOf("atlas", "demo")) throw AiException("A live AI answer wasn't available. Use the emergency contacts for an urgent concern.")
        validateSafetyEducation(reply.text)
        return reply
    }
}

/** Reject common treatment/reassurance failures in addition to the shared answer checks. */
internal fun validateSafetyEducation(text: String) {
    validateAiAnswer(text)
    if (Regex("\\b(?:safe (?:dose|amount|to wait)|not toxic|non[- ]toxic|no need to (?:call|see)|wait and see|monitor (?:at home|for \\d)|lethal dose)\\b", RegexOption.IGNORE_CASE).containsMatchIn(text))
        throw AiException("The answer was withheld because it could suggest unsafe treatment or reassurance. Contact your veterinarian about an exposure.")
    if (Regex("(?:^|[.!?]\\s+)(?:induce vomiting|give (?:hydrogen peroxide|activated charcoal)|administer |use hydrogen peroxide)", RegexOption.IGNORE_CASE).containsMatchIn(text))
        throw AiException("The answer was withheld because it could recommend treatment. Contact your veterinarian about an exposure.")
}
