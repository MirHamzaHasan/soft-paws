@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package com.dracoarts.shared.services.ai

import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.domain.model.DogContext
import com.dracoarts.shared.services.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.last
import kotlinx.coroutines.runBlocking
import okio.FileSystem
import okio.Path.Companion.toPath
import platform.Foundation.NSProcessInfo
import kotlin.test.*

/** Explicitly invoked native acceptance. No journal, network, account or UI automation. */
class LocalAiIosNativeTest {
    @Test fun nativeSha256MatchesKnownVectorAndRejectsChangedBytes(): Unit = runBlocking {
        val root = (NSProcessInfo.processInfo.environment["BARKLOG_LOCAL_AI_QA_DIRECTORY"] as? String
            ?: error("Set the synthetic native QA directory.")).toPath()
        val file = ModelFile("native-digest-fixture.gguf", "unused/fixture", "unused", 3,
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
        val store = ModelStore(root, { 0L })
        try {
            FileSystem.SYSTEM.write(store.path(file)) { writeUtf8("abc") }
            assertTrue(store.verified(file))
            FileSystem.SYSTEM.write(store.path(file)) { writeUtf8("abd") }
            assertFalse(store.verified(file))
        } finally { FileSystem.SYSTEM.delete(store.path(file), mustExist = false) }
    }
    @Test fun pinnedModelsAnswerSyntheticTextAndDescribeASyntheticScene(): Unit = runBlocking {
        val root = NSProcessInfo.processInfo.environment["BARKLOG_LOCAL_AI_QA_DIRECTORY"] as? String
            ?: error("Set BARKLOG_LOCAL_AI_QA_DIRECTORY to the explicitly staged pinned model directory.")
        val bytes = FileSystem.SYSTEM.read(("$root/synthetic-square.png").toPath()) { readByteArray() }
        val device = object : DeviceServices {
            override val reminderOpens = MutableStateFlow<ReminderTarget?>(null)
            override fun consumedReminder() = Unit
            override suspend fun pickPhoto(): DeviceResult<String> = DeviceResult.Cancelled
            override suspend fun photoBytes(fileId: String) = bytes.takeIf { fileId == "synthetic-square.png" }
            override suspend fun removePhoto(fileId: String) = Unit
            override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> = DeviceResult.Cancelled
            override suspend fun cancelReminder(id: String) = Unit
            override fun dial(number: String) = false
            override fun openSource(url: String) = false
        }
        val runtime = GgufLocalAi(ModelStore(root.toPath(), { 0L }), device, NSProcessInfo.processInfo.physicalMemory.toLong()) { stage, millis ->
            println("BARKLOG_AI_TIMING: $stage ${millis}ms")
        }
        try {
            runtime.restore()
            assertEquals("downloaded", runtime.state.value.text.phase)
            assertEquals("downloaded", runtime.state.value.photo.phase)
            var start = NSProcessInfo.processInfo.systemUptime
            val identity = object : AtlasIdentity {
                override val currentUid: String? = null
                override suspend fun token(forceRefresh: Boolean): AtlasToken = error("No cloud in native QA")
            }
            val transport = object : AtlasTransport {
                override suspend fun post(body: String, token: String, requestId: String): AtlasHttpResponse = error("No cloud in native QA")
            }
            val provider = RealResponseProvider(runtime, AtlasClient(identity, transport, false)) { "unused-local-request" }
            val reply = provider.response(CompanionAiRequest("How many minutes was Milo’s recorded walk? Answer briefly.", null, emptyList(),
                localProfile = ProfileSnapshot("Milo", "Male", DogContext(breeds = listOf("Poodle"))),
                localRecords = listOf(SourceRecord("synthetic", "synthetic-dog", "Walk", 1792152000000, "17 minutes")))).last()
            val text = reply.text
            assertEquals("local", reply.source)
            assertContains(text, "17")
            println("BARKLOG_SYNTHETIC_TEXT: $text (${NSProcessInfo.processInfo.systemUptime - start} seconds)")
            start = NSProcessInfo.processInfo.systemUptime
            val countRecords = listOf("Walk", "Walk", "Meal", "Meal", "Meal", "Pee", "Pee", "Poop").mapIndexed { index, type ->
                SourceRecord("synthetic-$index", "synthetic-dog", type, 1792152000000)
            }
            val mistaken = CompanionMessage("old-mistake", "There are 3 Walk records.", true, 1, records = countRecords, responseSource = "local")
            val counted = provider.response(CompanionAiRequest("How many Walk records are in the supplied observations? Answer briefly.", null, emptyList(),
                history = listOf(mistaken), localRecords = countRecords)).last()
            assertEquals("local", counted.source)
            assertTrue(Regex("\\b(?:2|two)\\b", RegexOption.IGNORE_CASE).containsMatchIn(counted.text), counted.text)
            println("BARKLOG_COMPUTED_COUNTS: ${counted.text} (${NSProcessInfo.processInfo.systemUptime - start} seconds)")
            start = NSProcessInfo.processInfo.systemUptime
            val general = provider.response(CompanionAiRequest("Name one simple indoor enrichment game for a dog. Answer with a single phrase.", null, emptyList())).last()
            assertEquals("local", general.source)
            assertTrue(general.text.isNotBlank())
            assertFalse(general.text.contains("attach record", true))
            assertFalse(general.text.contains("no journal records", true))
            println("BARKLOG_GENERAL_CARE: ${general.text} (${NSProcessInfo.processInfo.systemUptime - start} seconds)")
            start = NSProcessInfo.processInfo.systemUptime
            val caption = runtime.caption("synthetic-square.png")
            assertTrue(caption.isNotBlank())
            assertTrue(caption.contains("red", true) || caption.contains("square", true) || caption.contains("rectangle", true))
            println("BARKLOG_SYNTHETIC_CAPTION: $caption (${NSProcessInfo.processInfo.systemUptime - start} seconds)")
        } finally { runtime.close() }
    }
}
