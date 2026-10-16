package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.services.AppModule
import com.dracoarts.shared.services.ModuleRegistry
import kotlinx.coroutines.*
import kotlin.test.*

class PluginLifecycleTest {
    private class Plugin(
        override val id: String,
        private val events: MutableList<String>,
        override val priority: Int = 0,
        override val dependencies: Set<String> = emptySet(),
        override val required: Boolean = false,
        val start: suspend () -> Unit = {},
        val stop: suspend () -> Unit = {},
    ) : AppModule {
        override suspend fun initialize() { events += "start:$id"; start() }
        override suspend fun close() { events += "close:$id"; stop() }
    }

    @Test
    fun disabledPluginsDoNotStartAndLiveEnableIncludesDependencies() = runBlocking {
        val events = mutableListOf<String>()
        val data = Plugin("data", events, required = true)
        val api = Plugin("api", events, priority = 100, dependencies = setOf("data"))
        val feature = Plugin("feature", events, priority = -100, dependencies = setOf("api"))
        val registry = ModuleRegistry(listOf(feature, api, data), enabledIds = emptySet())
        registry.initialize()
        assertEquals(listOf("start:data"), events)
        registry.enable("feature")
        registry.enable("feature")
        assertEquals(listOf("start:data", "start:api", "start:feature"), events)
        assertFailsWith<IllegalArgumentException> { registry.disable("api") }
        assertFailsWith<IllegalArgumentException> { registry.disable("data") }
        registry.disable("feature")
        registry.disable("api")
        assertEquals(setOf("data"), registry.activeIds.value)
        registry.close()
        assertEquals(listOf("close:feature", "close:api", "close:data"), events.takeLast(3))
    }

    @Test
    fun failedEnableRollsBackPartialResourcesAndLeavesExistingPluginsActive() = runBlocking {
        val events = mutableListOf<String>()
        var fail = true
        val data = Plugin("data", events)
        val feature = Plugin("feature", events, dependencies = setOf("data"), start = { if (fail) error("offline") })
        val registry = ModuleRegistry(listOf(data, feature), setOf("data"))
        registry.initialize()
        assertFailsWith<IllegalStateException> { registry.enable("feature") }
        assertEquals(setOf("data"), registry.activeIds.value)
        assertEquals(listOf("start:data", "start:feature", "close:feature"), events)
        fail = false
        registry.enable("feature")
        assertEquals(setOf("data", "feature"), registry.activeIds.value)
        registry.close()
    }

    @Test
    fun cancellationCleansUpFailingAndPreviouslyStartedPlugins() = runBlocking {
        val events = mutableListOf<String>()
        val entered = CompletableDeferred<Unit>()
        val data = Plugin("data", events, stop = { delay(1) })
        val waiting = Plugin("waiting", events, priority = 1,
            start = { entered.complete(Unit); awaitCancellation() }, stop = { delay(1) })
        val registry = ModuleRegistry(listOf(data, waiting))
        val startup = launch { registry.initialize() }
        entered.await()
        startup.cancelAndJoin()
        assertTrue(startup.isCancelled)
        assertEquals(listOf("start:data", "start:waiting", "close:waiting", "close:data"), events)
        assertTrue(registry.activeIds.value.isEmpty())
    }

    @Test
    fun concurrentEnablesInitializeOnceAndShutdownAttemptsEveryCleanup() = runBlocking {
        val events = mutableListOf<String>()
        val first = Plugin("first", events, stop = { error("first cleanup") })
        val second = Plugin("second", events, priority = 1, start = { delay(1) }, stop = { error("second cleanup") })
        val registry = ModuleRegistry(listOf(first, second), setOf("first"))
        registry.initialize()
        coroutineScope { repeat(10) { launch { registry.enable("second") } } }
        assertEquals(1, events.count { it == "start:second" })
        val failure = assertFailsWith<IllegalStateException> { registry.close() }
        assertEquals("second cleanup", failure.message)
        assertEquals(1, failure.suppressedExceptions.size)
        assertEquals(listOf("close:second", "close:first"), events.takeLast(2))
        assertTrue(registry.activeIds.value.isEmpty())
    }

    @Test
    fun failedDisableRetainsTheActiveModuleForCleanupRetry() = runBlocking {
        val events = mutableListOf<String>()
        var fail = true
        val feature = Plugin("feature", events, stop = { if (fail) error("cleanup unavailable") })
        val registry = ModuleRegistry(listOf(feature))
        registry.initialize()
        assertFailsWith<IllegalStateException> { registry.disable("feature") }
        assertEquals(setOf("feature"), registry.activeIds.value)
        fail = false
        registry.disable("feature")
        assertTrue(registry.activeIds.value.isEmpty())
        assertEquals(2, events.count { it == "close:feature" })
        registry.close()
    }

    @Test
    fun invalidGraphsAreRejectedBeforeAnyPluginRuns() {
        val events = mutableListOf<String>()
        assertFailsWith<IllegalArgumentException> { ModuleRegistry(listOf(Plugin("same", events), Plugin("same", events))) }
        assertFailsWith<IllegalArgumentException> { ModuleRegistry(listOf(Plugin("a", events, dependencies = setOf("missing")))) }
        assertFailsWith<IllegalArgumentException> { ModuleRegistry(listOf(Plugin("a", events, dependencies = setOf("b")), Plugin("b", events, dependencies = setOf("a")))) }
        assertFailsWith<IllegalArgumentException> { ModuleRegistry(listOf(Plugin("a", events), Plugin("b", events, dependencies = setOf("a"))), setOf("b")) }
        assertTrue(events.isEmpty())
    }
}
