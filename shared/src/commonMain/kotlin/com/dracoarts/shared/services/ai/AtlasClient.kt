package com.dracoarts.shared.services.ai

import com.dracoarts.shared.services.AppModule
import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.readAvailable
import kotlinx.coroutines.*
import kotlinx.serialization.json.*

/** Memory-only credentials; never serialized into journal data or diagnostics. */
class AtlasToken(val value: String, val uid: String)
interface AtlasIdentity {
    val currentUid: String?
    suspend fun token(forceRefresh: Boolean): AtlasToken
}
class AiException(message: String) : Exception(message)
data class AtlasHttpResponse(val status: Int, val body: String, val contextChecked: String?, val feature: String?)
interface AtlasTransport {
    suspend fun post(body: String, token: String, requestId: String): AtlasHttpResponse
    fun close() = Unit
}

class KtorAtlasTransport(private val platform: String) : AtlasTransport {
    private val clientDelegate = lazy {
        HttpClient {
            followRedirects = false
            expectSuccess = false
            install(HttpTimeout) { requestTimeoutMillis = 45_000; connectTimeoutMillis = 10_000; socketTimeoutMillis = 30_000 }
        }
    }
    private val client by clientDelegate
    override suspend fun post(body: String, token: String, requestId: String): AtlasHttpResponse {
        require(platform in setOf("google-play", "ios"))
        return client.preparePost("https://atlas.dracoarts.com/v1/chat") {
            contentType(ContentType.Application.Json)
            accept(ContentType.Application.Json)
            header(HttpHeaders.Authorization, "Bearer $token")
            header("X-Atlas-App-Id", APP_ID)
            header("X-Atlas-Client-Platform", platform)
            header("Idempotency-Key", requestId)
            setBody(body)
        }.execute { response ->
            val bytes = ByteArray(65_537)
            val channel = response.bodyAsChannel()
            var count = 0
            while (count < bytes.size) {
                currentCoroutineContext().ensureActive()
                val read = channel.readAvailable(bytes, count, bytes.size - count)
                if (read < 0) break
                count += read
            }
            if (count > 65_536) throw AiException("Soft Paws AI returned too much text. Try a shorter question.")
            AtlasHttpResponse(response.status.value, bytes.decodeToString(0, count), response.headers["X-Atlas-Context-Checked"], response.headers["X-Atlas-Context-Feature"])
        }
    }
    override fun close() { if (clientDelegate.isInitialized()) client.close() }
    companion object { const val APP_ID = "caaf9c52-60f3-4fe2-b71a-3b59d065089a" }
}

/** Server receipts are mandatory. Public app identifiers cannot enable Release. */
class AtlasClient(private val identity: AtlasIdentity, private val transport: AtlasTransport, private val enabled: Boolean) : AppModule {
    override val id = "atlas-text"
    override val priority = 65
    override val dependencies = setOf("auth")
    override suspend fun initialize() = Unit
    override suspend fun close() = transport.close()
    suspend fun answer(messages: JsonArray, requestId: String): String {
        if (!enabled) throw AiException("Online AI is not enabled in this build. Your journal still works.")
        if (identity.currentUid == null) throw AiException("Sign in to use Soft Paws AI. Your journal stays available offline.")
        require(Regex("[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}").matches(requestId))
        require(messages.size in 1..8)
        val body = buildJsonObject {
            put("capability", "chat"); put("responseFormat", "text"); put("stream", false); put("maxTokens", 650)
            putJsonObject("optimization") { put("mode", "off") }
            put("messages", messages)
            putJsonObject("metadata") { put("contextRequired", true); put("contextFeature", FEATURE); put("feature", FEATURE) }
        }.toString()
        if (body.encodeToByteArray().size > 32_000) throw AiException("Select fewer records or shorten your question, then try again.")
        val expectedUid = identity.currentUid
        for (attempt in 0..1) {
            currentCoroutineContext().ensureActive()
            if (identity.currentUid != expectedUid) throw AiException("Your signed-in account changed. Send the question again.")
            val token = identity.token(attempt == 1)
            if (token.uid != expectedUid || identity.currentUid != expectedUid) throw AiException("Your signed-in account changed. Send the question again.")
            val response = try { transport.post(body, token.value, requestId) }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (cause: AiException) { throw cause }
            catch (_: Exception) { throw AiException("Soft Paws AI couldn’t connect. Your message is saved; try again when online.") }
            currentCoroutineContext().ensureActive()
            if (identity.currentUid != expectedUid) throw AiException("Your signed-in account changed. Send the question again.")
            if (response.status == 401 && attempt == 0) continue
            if (response.status !in 200..299) {
                val policyCode = runCatching { Json.parseToJsonElement(response.body).jsonObject["error"]?.jsonObject?.get("code")?.jsonPrimitive?.content }.getOrNull()
                if (policyCode in setOf("CONTEXT_FEATURE_UNKNOWN", "CONTEXT_POLICY_REQUIRED")) throw AiException("Soft Paws AI’s online setup needs updating. Your message is saved; try again later.")
                throw AiException(when (response.status) {
                401 -> "Sign in again to use Soft Paws AI. Your saved messages stay here."
                403 -> "Soft Paws AI hasn’t allowed this account or Firebase project. Your journal stays available."
                429 -> "Soft Paws AI is busy or a usage limit was reached. Try again later."
                400, 422 -> "Soft Paws AI couldn’t accept this question. Try a shorter question within cat-care observations."
                else -> "Soft Paws AI is unavailable or its Soft Paws policy isn’t ready. Try again later."
                })
            }
            if (response.contextChecked != "true" || response.feature != FEATURE) throw AiException("Soft Paws AI couldn’t verify Soft Paws’ context policy. The answer was withheld.")
            val text = runCatching {
                val parsed = Json.parseToJsonElement(response.body).jsonObject
                val id = parsed["requestId"]!!.jsonPrimitive
                require(id.isString && id.content.length in 1..200)
                val content = parsed["output"]!!.jsonObject["content"]!!.jsonPrimitive
                require(content.isString && content.content.isNotBlank() && content.content.length <= 16_000)
                content.content
            }.getOrNull() ?: throw AiException("Soft Paws AI returned an unreadable answer. Your message is saved; try again.")
            return text
        }
        throw AiException("Sign in again to use Soft Paws AI.")
    }
    companion object { const val FEATURE = "softpaws.ask-soft-paws-ai" }
}
