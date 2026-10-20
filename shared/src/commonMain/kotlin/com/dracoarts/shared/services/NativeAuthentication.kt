package com.dracoarts.shared.services

import com.dracoarts.shared.domain.repository.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withTimeout
import kotlin.coroutines.resume

/** Callback-only boundary exported to Swift. Credentials stay in transient memory. */
data class NativeAuthResult(val error: String? = null, val cancelled: Boolean = false)
class NativeIdToken(val token: String? = null, val uid: String? = null, val error: String? = null)
interface NativeAuthEngine {
    fun observe(listener: (AuthSnapshot) -> Unit)
    fun execute(action: String, provider: String, email: String, password: String, completion: (NativeAuthResult) -> Unit)
    fun cancel()
    fun close()
    fun idToken(forceRefresh: Boolean, completion: (NativeIdToken) -> Unit) { completion(NativeIdToken(error = "Sign in to use online AI.")) }
}

class NativeAuthentication(private val engine: NativeAuthEngine) : Authentication, AppModule, com.dracoarts.shared.services.ai.AtlasIdentity {
    override val id = "auth"
    override val priority = 60
    private val state = MutableStateFlow(AuthSnapshot())
    override val snapshot = state.asStateFlow()
    private val mutex = Mutex()
    private var unavailable = false
    override val currentUid get() = state.value.user?.uid
    override suspend fun token(forceRefresh: Boolean): com.dracoarts.shared.services.ai.AtlasToken {
        val expected = currentUid ?: throw com.dracoarts.shared.services.ai.AiException("Sign in to use Atlas. Your journal stays available offline.")
        val result = try { withTimeout(20_000) {
            suspendCancellableCoroutine<NativeIdToken> { continuation ->
                engine.idToken(forceRefresh) { if (continuation.isActive) continuation.resume(it) }
            }
        } } catch (_: TimeoutCancellationException) {
            currentCoroutineContext().ensureActive()
            throw com.dracoarts.shared.services.ai.AiException("Couldn't refresh sign-in for Atlas. Reconnect and try again.")
        }
        if (currentUid != expected || result.uid != expected || result.token.isNullOrBlank()) {
            throw com.dracoarts.shared.services.ai.AiException(result.error ?: "Your account changed or expired. Sign in again to use Atlas.")
        }
        return com.dracoarts.shared.services.ai.AtlasToken(result.token, expected)
    }
    override suspend fun initialize() {
        // Account configuration must never turn a working offline journal into a startup failure.
        unavailable = false
        try { engine.observe { state.value = it } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { unavailable = true; state.value = AuthSnapshot(); runCatching { engine.close() } }
    }
    override suspend fun close() { engine.close() }
    override suspend fun perform(action: String, provider: String, email: String, password: String) {
        if (unavailable) throw AuthenticationException("Sign-in isn't available in this build. Your journal still works.")
        if (!mutex.tryLock()) throw AuthenticationException("Finish the current sign-in step first.")
        try {
            val result = withTimeout(120_000) {
                suspendCancellableCoroutine { continuation ->
                    continuation.invokeOnCancellation { engine.cancel() }
                    engine.execute(action, provider, email, password) { if (continuation.isActive) continuation.resume(it) }
                }
            }
            if (result.cancelled) throw CancellationException("Sign-in cancelled")
            result.error?.let { throw AuthenticationException(it) }
        } catch (_: TimeoutCancellationException) {
            // A timeout owned by the caller must still cancel its whole operation.
            currentCoroutineContext().ensureActive()
            throw AuthenticationException("Sign-in took too long. Check your connection and try again.")
        } finally { mutex.unlock() }
    }
}

object UnavailableAuthEngine : NativeAuthEngine {
    override fun observe(listener: (AuthSnapshot) -> Unit) { listener(AuthSnapshot()) }
    override fun execute(action: String, provider: String, email: String, password: String, completion: (NativeAuthResult) -> Unit) {
        completion(NativeAuthResult("Sign-in is unavailable in this host. Your journal still works without an account."))
    }
    override fun cancel() = Unit
    override fun close() = Unit
}
