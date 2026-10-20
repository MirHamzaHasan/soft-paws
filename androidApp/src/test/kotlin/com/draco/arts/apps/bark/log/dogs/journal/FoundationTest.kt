package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.managers.DisabledHaptics
import com.dracoarts.shared.managers.StorageBackend
import com.dracoarts.shared.managers.StorageManager
import com.dracoarts.shared.presentation.state.StartupState
import com.dracoarts.shared.services.AppContainer
import com.dracoarts.shared.services.AppModule
import com.dracoarts.shared.services.AppPlatform
import com.dracoarts.shared.services.TemplatePlugins
import com.dracoarts.shared.data.local.JournalDriverFactory
import com.dracoarts.shared.data.local.JournalSchema
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import java.util.UUID
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.runBlocking
import kotlin.test.assertFalse
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

class FoundationTest {
    private class Platform : AppPlatform {
        override val journalDriverFactory = JournalDriverFactory {
            JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY).also {
                JournalSchema.create(it)
                it.execute(null, "PRAGMA user_version = ${JournalSchema.version}", 0)
            }
        }
        override val haptics = DisabledHaptics
        override val storage = StorageManager(object : StorageBackend {
            private val data = mutableMapOf<String, String>()
            override fun read(key: String) = data[key]
            override fun write(key: String, value: String) { data[key] = value }
            override fun remove(key: String) { data.remove(key) }
            override fun keys() = data.keys.toSet()
            override fun clear() { data.clear() }
        })
        override val localAi: com.dracoarts.shared.services.ai.LocalAi get() = error("Paused local AI must not be constructed or read")
        var closed = false
        override fun newId() = UUID.randomUUID().toString()
        override fun nowMillis() = 100L
        override fun close() { closed = true }
    }

    @Test
    fun realProviderIsUsedNormallyAndLiveReviewRequiresAnExplicitChoice() = runBlocking {
        for ((review, live, expectedDemo) in listOf(Triple(false,false,false),Triple(true,false,true),Triple(true,true,false))) {
            val app = AppContainer(Platform(), reviewFaults = if (review) com.dracoarts.shared.presentation.review.BoardReviewFaults("next-chat") else null, liveAiReview = live)
            app.startup.initialize()
            assertEquals(expectedDemo,app.companion.demoResponses)
            assertEquals(!expectedDemo,app.companion.atlasOnly)
            app.close()
        }
    }

    @Test
    fun startupWorksOfflineWithNoServicesOrSampleData() = runBlocking {
        val platform = Platform()
        val app = AppContainer(platform)
        app.startup.initialize()
        assertEquals(StartupState.Ready, app.startup.state.value)
        assertEquals(setOf("local-data", "local-video", "auth", "purchases", "atlas-text"), app.registry.activeIds.value)
        assertFalse(app.purchases.state.value.configured)
        assertFalse(app.purchases.hasAccess)
        assertTrue(platform.storage.getAllKeys().isEmpty())
        assertEquals(setOf("auth", "purchases", "haptics", "notifications"), TemplatePlugins.enabled)
        app.close()
        assertTrue(platform.closed)
    }

    @Test
    fun startupFailureHasSafeCopyAndCanRetry() = runBlocking {
        var fail = true
        val module = object : AppModule {
            override val id = "test-module"
            override val priority = 0
            override suspend fun initialize() { if (fail) error("private database path") }
        }
        val app = AppContainer(Platform(), listOf(module))
        app.startup.initialize()
        assertEquals("BarkLog couldn't open. Please try again.", assertIs<StartupState.Failed>(app.startup.state.value).message)
        fail = false
        app.startup.initialize()
        assertEquals(StartupState.Ready, app.startup.state.value)
        app.close()
    }

    @Test
    fun lifecycleCancellationIsNotShownAsAUserError() = runBlocking {
        val module = object : AppModule {
            override val id = "cancelled"
            override val priority = 0
            override suspend fun initialize(): Unit = throw CancellationException()
        }
        val app = AppContainer(Platform(), listOf(module))
        assertFailsWith<CancellationException> { app.startup.initialize() }
        assertEquals(StartupState.Loading, app.startup.state.value)
        app.close()
    }

    @Test
    fun eventKeysAreStableAndUnknownTypesAreNotInvented() {
        assertEquals(listOf("poop", "pee", "meal", "walk"), CareEventType.quickActions.map { it.key })
        CareEventType.entries.forEach { assertEquals(it, CareEventType.fromKey(it.key)) }
        assertNull(CareEventType.fromKey("diagnosis"))
    }
}
