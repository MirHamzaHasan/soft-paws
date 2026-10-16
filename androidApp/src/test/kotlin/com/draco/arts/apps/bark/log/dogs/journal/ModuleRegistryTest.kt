package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.services.AppModule
import com.dracoarts.shared.services.ModuleRegistry
import kotlinx.coroutines.runBlocking
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class ModuleRegistryTest {
    @Test
    fun initializesInPriorityOrderOnlyOnceAndClosesInReverse() = runBlocking {
        val events = mutableListOf<String>()
        fun module(id: String, priority: Int) = object : AppModule {
            override val id = id
            override val priority = priority
            override suspend fun initialize() { events += "start:$id" }
            override suspend fun close() { events += "close:$id" }
        }
        val registry = ModuleRegistry(listOf(module("analytics", 20), module("data", 0)))
        registry.initialize()
        registry.initialize()
        registry.close()
        assertEquals(listOf("start:data", "start:analytics", "close:analytics", "close:data"), events)
    }

    @Test
    fun startupFailureClosesEarlierModulesAndAllowsRetry() = runBlocking {
        val events = mutableListOf<String>()
        var shouldFail = true
        val data = object : AppModule {
            override val id = "data"
            override val priority = 0
            override suspend fun initialize() { events += "start:data" }
            override suspend fun close() { events += "close:data" }
        }
        val remote = object : AppModule {
            override val id = "remote"
            override val priority = 1
            override suspend fun initialize() {
                events += "start:remote"
                if (shouldFail) error("unavailable")
            }
        }
        val registry = ModuleRegistry(listOf(remote, data))
        assertFailsWith<IllegalStateException> { registry.initialize() }
        shouldFail = false
        registry.initialize()
        assertEquals(listOf("start:data", "start:remote", "close:data", "start:data", "start:remote"), events)
    }
}
