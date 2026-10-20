package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.services.ai.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.json.*
import kotlin.test.*

class AtlasAiTest {
    private val requestId = "bb162079-e136-4278-994a-a31514a16d24"
    private class Identity : AtlasIdentity {
        var uid: String? = "verified-user"
        val refreshes = mutableListOf<Boolean>()
        override val currentUid get() = uid
        override suspend fun token(forceRefresh: Boolean): AtlasToken { refreshes += forceRefresh; return AtlasToken("test-token", uid!!) }
    }
    private class Transport : AtlasTransport {
        val calls = mutableListOf<Pair<String, String>>()
        var respond: suspend (Int) -> AtlasHttpResponse = { valid() }
        override suspend fun post(body: String, token: String, requestId: String): AtlasHttpResponse {
            calls += body to requestId
            return respond(calls.size)
        }
    }
    private class Local : LocalAi by UnavailableLocalAi {
        var ready = false
        var answers = 0
        var context = ""
        var system = ""
        var captions = 0
        var content = "The selected notes contain one walk."
        override suspend fun answer(system: String, context: String, question: String): String { this.context = context; this.system = system; answers++; if (!ready) throw LocalModelUnavailable(); return content }
        override suspend fun caption(photoId: String): String { captions++; if (!ready) throw LocalModelUnavailable(); return "A dog stands on grass." }
    }
    private val messages = buildJsonArray { add(buildJsonObject { put("role", "user"); put("content", "Summarize my chosen observations.") }) }
    @Test fun missingServerFeatureExplainsSetupWithoutBlamingTheQuestion(): Unit = runBlocking {
        val transport = Transport().apply { respond = { AtlasHttpResponse(422, """{"error":{"code":"CONTEXT_FEATURE_UNKNOWN"}}""", null, null) } }
        val error = assertFailsWith<AiException> { AtlasClient(Identity(), transport, true).answer(messages, requestId) }
        assertContains(error.message.orEmpty(), "online setup needs updating")
        assertFalse(error.message.orEmpty().contains("Atlas"))
        assertEquals(1, transport.calls.size)
    }
    @Test fun atlasOnlyUsesChosenContextAndNeverPromotesLocalHistoryOrAutomaticFacts(): Unit = runBlocking {
        val transport = Transport()
        val provider = AtlasResponseProvider(AtlasClient(Identity(), transport, true)) { requestId }
        val profile = ProfileSnapshot("Milo", "Male", com.dracoarts.shared.domain.model.DogContext(), "Poodle", "4 years", "Caregiver profile note")
        val selected = listOf(SourceRecord("chosen", "dog", "Walk", 100, "17 minutes"))
        val privateProfile = profile.copy(name = "PRIVATE_LOCAL_DOG")
        val history = listOf(CompanionMessage("u", "PRIVATE_LOCAL_QUESTION", false, 1),
            CompanionMessage("a", "PRIVATE_LOCAL_REPLY", true, 1, profile = privateProfile, responseSource = "local"))
        val reply = provider.response(CompanionAiRequest("Summarize the chosen walk.", profile, selected, true, history,
            localProfile = privateProfile, localRecords = listOf(SourceRecord("private", "dog", "Meal", 1, "PRIVATE_LOCAL_NOTE")))).last()
        assertEquals("atlas", reply.source)
        val body = transport.calls.single().first
        assertFalse("PRIVATE_LOCAL" in body)
        assertContains(body, "Milo"); assertContains(body, "Poodle"); assertContains(body, "4 years")
        assertContains(body, "17 minutes"); assertContains(body, "owns and cares")
    }
    @Test fun atlasOnlyRequiresPermissionRejectsPhotoAnalysisAndDoesNotSendUnsharedExchanges(): Unit = runBlocking {
        val transport = Transport()
        val provider = AtlasResponseProvider(AtlasClient(Identity(), transport, true)) { requestId }
        val request = CompanionAiRequest("General enrichment ideas?", null, emptyList())
        assertFailsWith<AiException> { provider.response(request).last() }
        assertFailsWith<AiException> { provider.response(request.copy(allowCloud = true, captionPhotoId = "private.jpg")).last() }
        assertTrue(transport.calls.isEmpty())
        val profile = ProfileSnapshot("PRIVATE_OLD_PROFILE", "Male", com.dracoarts.shared.domain.model.DogContext())
        val history = listOf(CompanionMessage("u", "PRIVATE_OLD_QUESTION", false, 1),
            CompanionMessage("a", "PRIVATE_OLD_ANSWER", true, 1, profile = profile, responseSource = "atlas"))
        provider.response(request.copy(allowCloud = true, history = history)).last()
        assertFalse("PRIVATE_OLD" in transport.calls.single().first)
        provider.response(request.copy(allowCloud = true, history = history, profile = profile)).last()
        assertContains(transport.calls.last().first, "PRIVATE_OLD_QUESTION")
        assertContains(transport.calls.last().first, "PRIVATE_OLD_ANSWER")
        assertEquals("safety", provider.response(request.copy(question = "My dog ate chocolate")).last().source)
        assertEquals(2, transport.calls.size)
    }
    @Test fun expiredIdentityRefreshesOnceWithExactlyTheSameBodyAndIdempotencyKey(): Unit = runBlocking {
        val identity = Identity(); val transport = Transport()
        transport.respond = { if (it == 1) AtlasHttpResponse(401, "", null, null) else valid() }
        assertEquals("One walk was recorded.", AtlasClient(identity, transport, true).answer(messages, requestId))
        assertEquals(listOf(false, true), identity.refreshes)
        assertEquals(transport.calls[0], transport.calls[1])
        val sent = Json.parseToJsonElement(transport.calls[0].first).jsonObject
        assertEquals("true", sent["metadata"]!!.jsonObject["contextRequired"]!!.jsonPrimitive.content)
        assertEquals("false", sent["stream"]!!.jsonPrimitive.content)
    }
    @Test fun missingOrWrongPolicyReceiptsWithholdOtherwiseSuccessfulAnswers(): Unit = runBlocking {
        for (response in listOf(valid().copy(contextChecked = null), valid().copy(feature = "another.feature"))) {
            val transport = Transport().also { it.respond = { response } }
            assertFailsWith<AiException> { AtlasClient(Identity(), transport, true).answer(messages, requestId) }
            assertEquals(1, transport.calls.size)
        }
    }
    @Test fun denialAccountChangeAndReleaseGateNeverRetryOrDeliverAnAnswer(): Unit = runBlocking {
        val identity = Identity(); val transport = Transport()
        assertFailsWith<AiException> { AtlasClient(identity, transport, false).answer(messages, requestId) }
        assertTrue(transport.calls.isEmpty()); assertTrue(identity.refreshes.isEmpty())
        transport.respond = { AtlasHttpResponse(403, "", null, null) }
        assertFailsWith<AiException> { AtlasClient(identity, transport, true).answer(messages, requestId) }
        assertEquals(1, transport.calls.size)
        transport.respond = { identity.uid = "another-user"; valid() }
        assertFailsWith<AiException> { AtlasClient(identity, transport, true).answer(messages, requestId) }
    }
    @Test fun localAnswersWinAndCloudRequiresExplicitConsent(): Unit = runBlocking {
        val local = Local(); val transport = Transport(); val provider = RealResponseProvider(local, AtlasClient(Identity(), transport, true)) { requestId }
        val question = CompanionAiRequest("Summarize the chosen walks.", null, emptyList())
        assertFailsWith<AiException> { provider.response(question).last() }
        assertTrue(transport.calls.isEmpty())
        local.ready = true
        assertEquals("local", provider.response(question.copy(allowCloud = true)).last().source)
        assertTrue(transport.calls.isEmpty())
        local.ready = false
        assertEquals("atlas", provider.response(question.copy(allowCloud = true)).last().source)
        assertEquals(1, transport.calls.size)
    }
    @Test fun photoDescriptionsNeverFallBackToAtlasAndOldDemoAnswersAreExcluded(): Unit = runBlocking {
        val local = Local(); val transport = Transport(); val provider = RealResponseProvider(local, AtlasClient(Identity(), transport, true)) { requestId }
        val question = CompanionAiRequest("Describe this photo on this device.", null, emptyList(), allowCloud = true, captionPhotoId = "local-photo.jpg")
        assertFailsWith<AiException> { provider.response(question).last() }; assertTrue(transport.calls.isEmpty())
        local.ready = true
        assertEquals("local-caption", provider.response(question).last().source)
        local.ready = false
        val history = listOf(
            CompanionMessage("old", "UNTRUSTED_DEMO_ANSWER", true, 1),
            CompanionMessage("urgent", "UNSAFE_HISTORY: My dog ate chocolate", false, 1),
            CompanionMessage("caption", "LOCAL_CAPTION_REQUEST", false, 1, captionRequest = true),
            CompanionMessage("photo", "Previous question", false, 1, photoIds = listOf("DO_NOT_UPLOAD.jpg")))
        provider.response(question.copy(captionPhotoId = null, history = history)).last()
        val body = transport.calls.single().first
        assertFalse(body.contains("UNTRUSTED_DEMO_ANSWER")); assertFalse(body.contains("DO_NOT_UPLOAD"))
        assertFalse(body.contains("UNSAFE_HISTORY")); assertFalse(body.contains("LOCAL_CAPTION_REQUEST"))
    }
    @Test fun urgentAndTreatmentQuestionsBypassModelsAndClinicalOutputIsWithheld(): Unit = runBlocking {
        val local = Local(); val transport = Transport(); val provider = RealResponseProvider(local, AtlasClient(Identity(), transport, true)) { requestId }
        assertEquals("safety", provider.response(CompanionAiRequest("My dog ate chocolate", null, emptyList(), true)).last().source)
        assertEquals(0, local.answers); assertTrue(transport.calls.isEmpty())
        local.ready = true; local.content = "Use a calming scent like lavender or chamomile to help the dog relax."
        assertFailsWith<AiException> { provider.response(CompanionAiRequest("How can grooming be calm?", null, emptyList())).last() }
        local.content = "Give your dog 5 mg twice daily."
        assertFailsWith<AiException> { provider.response(CompanionAiRequest("Summarize the observations.", null, emptyList())).last() }
    }
    @Test fun removedOrChangedContextIsNotResentThroughEarlierAssistantAnswers(): Unit = runBlocking {
        val transport = Transport()
        val provider = RealResponseProvider(Local(), AtlasClient(Identity(), transport, true)) { requestId }
        val profile = ProfileSnapshot("Milo", "Not recorded", com.dracoarts.shared.domain.model.DogContext())
        val record = SourceRecord("record", "dog", "Walk", 100, "Original observation")
        val old = CompanionMessage("old-real", "PREVIOUS_CHOSEN_FACTS", true, 1, profile = profile, records = listOf(record), responseSource = "atlas")
        val request = CompanionAiRequest("Summarize my current chosen observations.", profile, listOf(record), true, listOf(old))
        for (changed in listOf(request.copy(profile = null), request.copy(records = emptyList()),
            request.copy(records = listOf(record.copy(note = "Updated observation"))),
            request.copy(records = listOf(record.copy(id = "new-record"), record)))) {
            provider.response(changed).last()
            assertFalse(transport.calls.last().first.contains("PREVIOUS_CHOSEN_FACTS"))
        }
        provider.response(request).last()
        assertTrue(transport.calls.last().first.contains("PREVIOUS_CHOSEN_FACTS"))
    }
    @Test fun automaticLocalFactsNeverEnterAtlasPayloadOrItsConversationHistory(): Unit = runBlocking {
        val local = Local().also { it.ready = true }
        val transport = Transport()
        val provider = RealResponseProvider(local, AtlasClient(Identity(), transport, true)) { requestId }
        val profile = ProfileSnapshot("PRIVATE_LOCAL_DOG", "Female", com.dracoarts.shared.domain.model.DogContext(breeds = listOf("Poodle")))
        val records = listOf(SourceRecord("local-id", "dog", "Walk", 100, "PRIVATE_LOCAL_WALK 17 minutes"))
        val old = CompanionMessage("local-answer", "PRIVATE_PRIOR_LOCAL_REPLY", true, 1, profile = profile, records = records, responseSource = "local")
        val request = CompanionAiRequest("How long was the walk?", null, emptyList(), true, listOf(old), localProfile = profile, localRecords = records)
        assertEquals("local", provider.response(request).last().source)
        assertContains(local.context, "PRIVATE_LOCAL_DOG")
        assertContains(local.context, "17 minutes")
        assertFalse(local.context.contains("PRIVATE_PRIOR_LOCAL_REPLY"))
        provider.response(request.copy(question = "Rewrite your reply more briefly.")).last()
        assertContains(local.context, "PRIVATE_PRIOR_LOCAL_REPLY")
        assertTrue(transport.calls.isEmpty())
        local.ready = false
        assertEquals("atlas", provider.response(request).last().source)
        val cloud = transport.calls.single().first
        assertFalse(cloud.contains("PRIVATE_LOCAL")); assertFalse(cloud.contains("PRIVATE_PRIOR_LOCAL_REPLY"))
        val cloudContent = Json.parseToJsonElement(cloud).jsonObject["messages"]!!.jsonArray.last().jsonObject["content"]!!.jsonPrimitive.content
        val chosen = Json.parseToJsonElement(cloudContent.substringAfter(":\n").substringBefore("\n\nQuestion:")).jsonObject
        assertEquals(0,chosen["selectedObservationTotal"]!!.jsonPrimitive.int)
        assertTrue(chosen["selectedObservationCounts"]!!.jsonObject.isEmpty())
    }
    @Test fun localPromptIncludesComputedCountsForOnlyTheBoundedSuppliedSample(): Unit = runBlocking {
        val local = Local().also { it.ready = true }
        val provider = RealResponseProvider(local, AtlasClient(Identity(), Transport(), false)) { requestId }
        val records = listOf(SourceRecord("a", "dog", "Walk", 1), SourceRecord("b", "dog", "Meal", 2), SourceRecord("c", "dog", "Walk", 3))
        val mistaken = CompanionMessage("mistake", "WRONG_OLD_COUNT_3", true, 1, records = records, responseSource = "local")
        provider.response(CompanionAiRequest("How many Walk records are supplied?", null, emptyList(), history = listOf(mistaken), localRecords = records)).last()
        assertFalse(local.context.contains("WRONG_OLD_COUNT_3"))
        assertContains(local.context,"Total supplied records = 3.")
        assertContains(local.context,"Number of Walk records = 2.")
        assertContains(local.context,"Number of Meal records = 1.")
        assertContains(local.context,"not complete-day totals")
    }
    @Test fun generalCareWithNoRecordsStillUsesTheRealModel(): Unit = runBlocking {
        val local = Local().also { it.ready = true; it.content = "Gentle grooming and a consistent routine can help with everyday care." }
        val transport = Transport()
        val provider = RealResponseProvider(local, AtlasClient(Identity(), transport, true)) { requestId }
        val answer = provider.response(CompanionAiRequest("What are some general grooming tips?", null, emptyList())).last()
        assertEquals("local", answer.source); assertContains(answer.text, "grooming")
        assertContains(local.system, "even when no logs are supplied")
        assertContains(local.context, "still answer general dog-care questions")
        assertEquals("local", provider.response(CompanionAiRequest("How can I use treats for training?", null, emptyList())).last().source)
        assertEquals("safety", provider.response(CompanionAiRequest("How should I treat an infection?", null, emptyList())).last().source)
        assertTrue(transport.calls.isEmpty())
    }
    @Test fun cancellationStopsTheRequestWithoutRetryOrDemoOutput(): Unit = runBlocking {
        val transport = Transport(); transport.respond = { awaitCancellation() }
        val job = launch(start = CoroutineStart.UNDISPATCHED) { AtlasClient(Identity(), transport, true).answer(messages, requestId) }
        job.cancelAndJoin(); assertEquals(1, transport.calls.size)
    }
    companion object {
        private fun valid() = AtlasHttpResponse(200, """{"requestId":"server-request","output":{"content":"One walk was recorded."}}""", "true", AtlasClient.FEATURE)
    }
}
