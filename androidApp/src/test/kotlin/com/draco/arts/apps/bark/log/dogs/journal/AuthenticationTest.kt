package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlin.test.*

class AuthenticationTest {
    @Test fun disabledNativeConfigurationRejectsCredentialsBeforeExecution()=runBlocking {
        var executions=0
        val engine=object:NativeAuthEngine {
            override fun isConfigured()=false
            override fun observe(listener:(AuthSnapshot)->Unit) { listener(AuthSnapshot()) }
            override fun execute(action:String,provider:String,email:String,password:String,completion:(NativeAuthResult)->Unit) { executions++;completion(NativeAuthResult()) }
            override fun cancel()=Unit
            override fun close()=Unit
        }
        val auth=NativeAuthentication(engine);auth.initialize();assertFalse(auth.configured)
        assertFailsWith<AuthenticationException> { auth.perform("createEmailAccount","Email","caregiver@example.invalid",java.util.UUID.randomUUID().toString()) }
        assertEquals(0,executions);assertNull(auth.snapshot.value.user);auth.close()
    }
    private class Engine : NativeAuthEngine {
        var listener: ((AuthSnapshot) -> Unit)? = null
        var completion: ((NativeAuthResult) -> Unit)? = null
        var cancelled = false
        var closed = false
        var broken = false
        var cancelledInitialization = false
        var tokenCompletion: ((NativeIdToken) -> Unit)? = null
        val refreshes = mutableListOf<Boolean>()
        var receivedPassword = ""
        override fun idToken(forceRefresh: Boolean, completion: (NativeIdToken) -> Unit) { refreshes += forceRefresh; tokenCompletion = completion }
        override fun observe(listener: (AuthSnapshot) -> Unit) {
            if (cancelledInitialization) throw CancellationException("Host closed during startup")
            if (broken) error("Invalid native configuration")
            this.listener = listener; listener(AuthSnapshot())
        }
        override fun execute(action: String, provider: String, email: String, password: String, completion: (NativeAuthResult) -> Unit) { this.receivedPassword = password; this.completion = completion }
        override fun cancel() { cancelled = true }
        override fun close() { closed = true; listener = null }
    }
    @Test fun passwordRequestPassesUnchangedAndOnlySdkStateCanAuthenticate()=runBlocking {
        val engine=Engine();val auth=NativeAuthentication(engine);auth.initialize()
        val request=async(start=CoroutineStart.UNDISPATCHED) { auth.perform("signInEmail","Email","owner@example.com","  test-password  ") }
        assertEquals("  test-password  ",engine.receivedPassword)
        engine.completion!!(NativeAuthResult());request.await()
        assertNull(auth.snapshot.value.user)
        engine.listener!!(AuthSnapshot(AuthUser("sdk-uid","owner@example.com","Email")))
        assertEquals("sdk-uid",auth.currentUid);auth.close()
    }
    @Test fun sdkStateIsAuthoritativeAndClosingReleasesTheListener() = runBlocking {
        val engine = Engine(); val auth = NativeAuthentication(engine); auth.initialize()
        assertNull(auth.snapshot.value.user)
        val identity = AuthUser("real-sdk-user", "owner@example.com", "Google")
        engine.listener!!(AuthSnapshot(identity)); assertEquals(identity, auth.snapshot.value.user)
        engine.listener!!(AuthSnapshot()); assertNull(auth.snapshot.value.user)
        auth.close(); assertTrue(engine.closed); assertNull(engine.listener)
    }
    @Test fun cancellationIgnoresLateCompletionAndDuplicateRequestsAreRejected() = runBlocking {
        val engine = Engine(); val auth = NativeAuthentication(engine); auth.initialize()
        val request = launch(start = CoroutineStart.UNDISPATCHED) { auth.perform("signIn", "Google") }
        assertFailsWith<AuthenticationException> { auth.perform("signIn", "Apple") }
        request.cancelAndJoin(); assertTrue(engine.cancelled)
        engine.completion!!(NativeAuthResult()) // An old callback cannot resume a cancelled continuation.
        assertNull(auth.snapshot.value.user)
        val second = async(start = CoroutineStart.UNDISPATCHED) { auth.perform("sendEmail", "Email", "owner@example.com") }
        engine.completion!!(NativeAuthResult()); second.await(); auth.close()
    }
    @Test fun providerFailureIsRecoverableAndMissingConfigurationDoesNotBreakStartup() = runBlocking {
        val engine = Engine(); val auth = NativeAuthentication(engine); auth.initialize()
        val request = async(start = CoroutineStart.UNDISPATCHED) { runCatching { auth.perform("signIn", "Google") } }
        engine.completion!!(NativeAuthResult("Provider not enabled"))
        assertIs<AuthenticationException>(request.await().exceptionOrNull()); assertNull(auth.snapshot.value.user)
        auth.close()
        val invalid = NativeAuthentication(Engine().also { it.broken = true })
        invalid.initialize(); assertNull(invalid.snapshot.value.user)
        assertFailsWith<AuthenticationException> { invalid.perform("signIn", "Google") }; invalid.close()
    }
    @Test fun cancelledInitializationRollsBackInsteadOfPublishingReady() = runBlocking {
        val engine = Engine().also { it.cancelledInitialization = true }
        val registry = ModuleRegistry(listOf(NativeAuthentication(engine)))
        assertFailsWith<CancellationException> { registry.initialize() }
        assertTrue(engine.closed)
        assertTrue(registry.activeIds.value.isEmpty())
    }
    @Test fun callerTimeoutCancelsTheProviderAndAllowsRetry() = runBlocking {
        val engine = Engine(); val auth = NativeAuthentication(engine); auth.initialize()
        assertFailsWith<TimeoutCancellationException> {
            withTimeout(50) { auth.perform("signIn", "Google") }
        }
        assertTrue(engine.cancelled)
        val retry = async(start = CoroutineStart.UNDISPATCHED) { auth.perform("signIn", "Google") }
        engine.completion!!(NativeAuthResult()); retry.await(); auth.close()
    }
    @Test fun atlasTokensAreBoundToTheCurrentSdkAccountAndLateCallbacksAreIgnored(): Unit = runBlocking {
        val engine = Engine(); val auth = NativeAuthentication(engine); auth.initialize()
        assertFailsWith<com.dracoarts.shared.services.ai.AiException> { auth.token(false) }
        engine.listener!!(AuthSnapshot(AuthUser("first-user", "owner@example.com", "Google")))
        val valid = async(start = CoroutineStart.UNDISPATCHED) { auth.token(true) }
        engine.tokenCompletion!!(NativeIdToken("ephemeral-token", "first-user"))
        assertEquals("first-user", valid.await().uid); assertEquals(listOf(true), engine.refreshes)
        val switched = async(start = CoroutineStart.UNDISPATCHED) { runCatching { auth.token(false) } }
        engine.listener!!(AuthSnapshot(AuthUser("second-user", "owner@example.com", "Google")))
        engine.tokenCompletion!!(NativeIdToken("old-token", "first-user"))
        assertIs<com.dracoarts.shared.services.ai.AiException>(switched.await().exceptionOrNull())
        val cancelled = launch(start = CoroutineStart.UNDISPATCHED) { auth.token(false) }
        cancelled.cancelAndJoin()
        engine.tokenCompletion!!(NativeIdToken("late-token", "second-user"))
        assertEquals("second-user", auth.currentUid); auth.close()
    }
}
