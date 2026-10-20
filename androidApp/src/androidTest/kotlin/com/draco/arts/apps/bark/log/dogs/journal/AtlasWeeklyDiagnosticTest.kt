package com.draco.arts.apps.bark.log.dogs.journal

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.services.ai.*
import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.TimeZone
import kotlinx.serialization.json.*
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.util.UUID

/** Explicit opt-in diagnostics on the owned synthetic normal journal; no credentials in output. */
@RunWith(AndroidJUnit4::class)
class AtlasWeeklyDiagnosticTest {
    @Test fun persistedSoundSettingsUseNativePreferences() = runBlocking {
        assumeTrue(InstrumentationRegistry.getArguments().getString("liveAtlas") == "1")
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val storage = com.dracoarts.shared.managers.StorageManager(com.dracoarts.shared.presentation.review.BoardReviewPreferences(AndroidStorageBackend(context), com.dracoarts.shared.presentation.review.BoardReviewDataSet.AiCards.preferencePrefix))
        val settings = com.dracoarts.shared.presentation.state.SettingsController(storage)
        settings.load()
        check(settings.state.value.sounds == (storage.getBoolean("interaction_sounds") ?: false))
        File(context.getExternalFilesDir(null), "sound-settings-diagnostic.json").writeText(buildJsonObject {
            put("sounds", settings.state.value.sounds); put("volume", settings.state.value.soundVolume); put("texture", settings.state.value.soundTexture)
        }.toString())
    }
    @Test fun captureSanitizedWeeklyServerResult() = runBlocking {
        assumeTrue(InstrumentationRegistry.getArguments().getString("liveAtlas") == "1")
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val messagesOnly = InstrumentationRegistry.getArguments().getString("messagesOnly") == "1"
        val auth = FirebaseAuth.getInstance()
        val user = requireNotNull(auth.currentUser)
        val identity = object : AtlasIdentity {
            override val currentUid get() = auth.currentUser?.uid
            override suspend fun token(forceRefresh: Boolean): AtlasToken = withContext(Dispatchers.IO) {
                AtlasToken(requireNotNull(Tasks.await(user.getIdToken(forceRefresh)).token), user.uid)
            }
        }
        val repo = SqlDelightJournalRepository(AndroidJournalDriverFactory(context), { UUID.randomUUID().toString() }, System::currentTimeMillis, Dispatchers.IO)
        repo.initialize()
        val transport = KtorAtlasTransport("google-play")
        val result = mutableMapOf<String, JsonElement>()
        result["scope"] = JsonPrimitive(if (messagesOnly) "messages-only diagnostic" else "explicit profile and seven-day scope")
        result["endpoint"] = JsonPrimitive("https://atlas.dracoarts.com/v1/chat")
        result["appId"] = JsonPrimitive(KtorAtlasTransport.APP_ID)
        val capture = object : AtlasTransport {
            override suspend fun post(body: String, token: String, requestId: String): AtlasHttpResponse {
                result["metadata"] = Json.parseToJsonElement(body).jsonObject.getValue("metadata")
                val response = transport.post(body, token, requestId)
                val parsed = runCatching { Json.parseToJsonElement(response.body).jsonObject }.getOrNull()
                result["httpStatus"] = JsonPrimitive(response.status)
                result["clientRequestId"] = JsonPrimitive(requestId)
                result["serverRequestId"] = parsed?.get("requestId") ?: JsonNull
                result["contextChecked"] = JsonPrimitive(response.contextChecked)
                result["contextFeature"] = JsonPrimitive(response.feature)
                result["bodyBytes"] = JsonPrimitive(body.encodeToByteArray().size)
                if (response.status !in 200..299) {
                    result["responseFields"] = JsonArray(parsed?.keys.orEmpty().map(::JsonPrimitive))
                    val error = parsed?.get("error")
                    if (error is JsonObject) {
                        listOf("code", "message", "details").forEach { key -> error[key]?.let { result["error_$key"] = it } }
                    } else listOf("code", "message", "errorCode", "errorMessage").forEach { key -> parsed?.get(key)?.let { result[key] = it } }
                }
                return response
            }
        }
        try {
            val dog = repo.observeDogs().first().single()
            check(dog.name == "QA Dog Android" && dog.details.notes.isBlank())
            val workspace = repo.readDocument("companion-chat-${dog.id}")?.let { Json { ignoreUnknownKeys = true }.decodeFromString<CompanionWorkspace>(it) }
            check(workspace?.weeklyAllowed == true)
            val now = System.currentTimeMillis()
            val week = prepareWeeklyContext(repo, dog.id, "How can you help me related to my dog?", now, TimeZone.currentSystemDefault())
            check(week.records.size <= 5 && week.records.all { it.note.isBlank() })
            result["weeklyTotal"] = JsonPrimitive(week.weekly.total)
            result["weeklyShared"] = JsonPrimitive(week.weekly.shared)
            runCatching { AtlasResponseProvider(AtlasClient(identity, capture, true), { UUID.randomUUID().toString() }).response(
                CompanionAiRequest("How can you help me related to my dog?", if (messagesOnly) null else week.profile, if (messagesOnly) emptyList() else week.records, true, requestedAtMillis = now, timeZone = week.weekly.timeZone, weekly = if (messagesOnly) null else week.weekly)
            ).first() }.onSuccess { result["source"] = JsonPrimitive(it.source) }
            check(result.containsKey("httpStatus"))
            File(context.getExternalFilesDir(null), if (messagesOnly) "minimal-atlas-diagnostic.json" else "weekly-atlas-diagnostic.json").writeText(JsonObject(result).toString())
        } finally { transport.close(); repo.close() }
    }
}
