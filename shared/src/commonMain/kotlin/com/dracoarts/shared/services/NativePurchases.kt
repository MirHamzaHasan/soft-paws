package com.dracoarts.shared.services

import com.dracoarts.shared.domain.model.PremiumCustomer
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

data class NativePurchaseResult(val error: String? = null, val cancelled: Boolean = false)

/** SDKs retain receipts. This boundary has no dog, care, location or AI-message fields. */
interface NativePurchasesEngine {
    fun observe(listener: (PremiumCustomer) -> Unit)
    fun execute(action: String, plan: String, completion: (NativePurchaseResult) -> Unit)
    fun identify(userId: String?, completion: (NativePurchaseResult) -> Unit)
    fun close()
}

object UnavailablePurchasesEngine : NativePurchasesEngine {
    override fun observe(listener: (PremiumCustomer) -> Unit) = listener(PremiumCustomer())
    override fun execute(action: String, plan: String, completion: (NativePurchaseResult) -> Unit) =
        completion(NativePurchaseResult("Purchases will be available after store setup."))
    override fun identify(userId: String?, completion: (NativePurchaseResult) -> Unit) = completion(NativePurchaseResult())
    override fun close() = Unit
}

/** Optional billing failure never prevents journal startup or logging. */
class NativePurchases(private val engine: NativePurchasesEngine, private val currentUid: () -> String? = { null }) : AppModule {
    override val id = "purchases"
    override val priority = 65
    private val mutable = MutableStateFlow(PremiumCustomer())
    val state = mutable.asStateFlow()
    private val operation = Mutex()
    private var identityRevision = 0L
    private var changingIdentity = false
    private var expectedUser: String? = null
    val hasAccess: Boolean get() {
        val customer = state.value
        val uid = currentUid()
        return customer.configured && customer.entitled && !changingIdentity &&
            (if (uid == null) customer.anonymous else customer.customerId == uid)
    }

    override suspend fun initialize() {
        try { engine.observe { customer ->
            mutable.value = customer.copy(entitled = customer.entitled && !changingIdentity &&
                (if (expectedUser == null) customer.anonymous else customer.customerId == expectedUser))
        } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { mutable.value = PremiumCustomer(error = "Premium status is unavailable. Your journal still works.") }
    }

    suspend fun identify(userId: String?) {
        val revision = ++identityRevision
        changingIdentity = true; expectedUser = userId
        mutable.value = mutable.value.copy(entitled = false)
        try {
            val result = awaitResult { engine.identify(userId, it) }
            if (revision != identityRevision) return
            changingIdentity = false
            if (result.error != null) mutable.value = mutable.value.copy(entitled = false, error = result.error)
            else perform("refresh")
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { if (revision == identityRevision) mutable.value = mutable.value.copy(entitled = false, error = "Couldn't refresh Premium for this account.") }
        finally { if (revision == identityRevision) changingIdentity = false }
    }

    suspend fun perform(action: String, plan: String = ""): NativePurchaseResult {
        if (!operation.tryLock()) return NativePurchaseResult("Finish the current store request first.")
        return try { awaitResult { engine.execute(action, plan, it) } }
        finally { operation.unlock() }
    }

    private suspend fun awaitResult(start: ((NativePurchaseResult) -> Unit) -> Unit): NativePurchaseResult = try {
        withTimeout(120_000) { suspendCancellableCoroutine { continuation -> start { if (continuation.isActive) continuation.resume(it) } } }
    } catch (_: TimeoutCancellationException) {
        currentCoroutineContext().ensureActive()
        NativePurchaseResult("The store took too long. Check your connection and try again.")
    }

    override suspend fun close() { engine.close() }
}
