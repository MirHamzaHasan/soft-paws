package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.services.ai.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.*
import io.ktor.http.HttpStatusCode
import io.ktor.utils.io.ByteReadChannel
import kotlinx.coroutines.*
import okio.*
import okio.ByteString.Companion.toByteString
import okio.Path.Companion.toPath
import java.nio.file.Files
import kotlin.test.*

class ModelStoreTest {
    private val bytes = "GGUF fixture weights".encodeToByteArray()
    private val file = ModelFile("fixture.gguf", "fixture/model", "immutable-revision", bytes.size.toLong(), bytes.toByteString().sha256().hex())
    private val spec = ModelSpec(ModelKind.Text, "Fixture", listOf(file))
    private fun fixture(block: suspend (okio.Path) -> Unit) = runBlocking {
        val dir = Files.createTempDirectory("barklog-model-test").toFile()
        try { block(dir.absolutePath.toPath()) } finally { dir.deleteRecursively() }
    }
    private fun store(root: okio.Path, body: ByteArray = bytes, free: Long = Long.MAX_VALUE) = ModelStore(root, { free }, clientFactory = {
        HttpClient(MockEngine { respond(ByteReadChannel(body), HttpStatusCode.OK) })
    })
    @Test fun verifiedDownloadsPublishAtomicallyAndCanBeRemovedWithoutTouchingOtherFiles() = fixture { root ->
        val store = store(root); val journal = root / "journal.db"
        FileSystem.SYSTEM.write(journal) { writeUtf8("preserve me") }
        assertFalse(store.present(spec)); store.install(spec) { }
        assertTrue(store.present(spec)); assertTrue(store.verified(file))
        store.remove(spec)
        assertFalse(store.present(spec)); assertTrue(FileSystem.SYSTEM.exists(journal))
    }
    @Test fun wrongChecksumAndTruncatedDownloadsNeverBecomeInstalledModels() = fixture { root ->
        for (bad in listOf(ByteArray(bytes.size), bytes.copyOf(bytes.size - 1))) {
            val store = store(root, bad)
            assertFailsWith<AiException> { store.install(spec) { } }
            assertFalse(store.present(spec)); assertFalse(FileSystem.SYSTEM.exists(root / "fixture.gguf.part"))
        }
    }
    @Test fun storageDenialAndCancellationPreserveExistingFiles() = fixture { root ->
        assertFailsWith<AiException> { store(root, free = 0).install(spec) { } }
        val store = store(root)
        assertFailsWith<CancellationException> { store.install(spec) { throw CancellationException("cancel download") } }
        assertFalse(store.present(spec)); assertFalse(FileSystem.SYSTEM.exists(root / "fixture.gguf.part"))
        store.install(spec) { }
        FileSystem.SYSTEM.write(root / file.name) { write(ByteArray(bytes.size)) }
        assertFalse(store.verified(file))
    }
    @Test fun catalogPinsEveryArtifactToASizeHashAndImmutableRevision() {
        for (model in ModelCatalog.all) for (artifact in model.files) {
            assertTrue(artifact.bytes > 0)
            assertTrue(Regex("[a-f0-9]{40}").matches(artifact.revision))
            assertTrue(Regex("[a-f0-9]{64}").matches(artifact.sha256))
        }
    }
    @Test fun platformHashVerifiesMultipleChunksAndRejectsSameSizedChanges() = fixture { root ->
        val data = ByteArray(150_003) { (it % 251).toByte() }
        val artifact = file.copy(bytes = data.size.toLong(), sha256 = data.toByteString().sha256().hex())
        val store = store(root)
        FileSystem.SYSTEM.write(root / artifact.name) { write(data) }
        assertTrue(store.verified(artifact))
        data[70_000] = (data[70_000] + 1).toByte()
        FileSystem.SYSTEM.write(root / artifact.name) { write(data) }
        assertFalse(store.verified(artifact))
        assertFailsWith<CancellationException> {
            withContext(Job().apply { cancel() }) { store.verified(artifact) }
        }
    }
}
