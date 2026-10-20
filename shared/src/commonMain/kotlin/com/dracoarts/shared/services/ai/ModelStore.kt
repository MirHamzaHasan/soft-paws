package com.dracoarts.shared.services.ai

import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.prepareGet
import io.ktor.client.statement.bodyAsChannel
import io.ktor.utils.io.readAvailable
import kotlinx.coroutines.*
import okio.*
import okio.Path.Companion.toPath

/** All filenames/URLs come from the fixed catalog, never user or model input. */
class ModelStore(val root: Path, private val freeBytes: () -> Long, private val prepareRoot: () -> Unit = {}, private val fs: FileSystem = FileSystem.SYSTEM,
    private val clientFactory: () -> HttpClient = { HttpClient { install(HttpTimeout) { connectTimeoutMillis = 15_000; socketTimeoutMillis = 30_000 } } }) {
    fun path(file: ModelFile) = root / file.name
    fun present(spec: ModelSpec) = spec.files.all { fs.metadataOrNull(path(it))?.size == it.bytes }
    fun retainedBytes(spec: ModelSpec) = spec.files.sumOf { (fs.metadataOrNull(path(it))?.size ?: 0) + (fs.metadataOrNull((path(it).toString() + ".part").toPath())?.size ?: 0) }
    suspend fun verified(file: ModelFile): Boolean {
        val path = path(file)
        if (fs.metadataOrNull(path)?.size != file.bytes) return false
        return fs.source(path).buffer().use { modelSha256(it) } == file.sha256
    }
    suspend fun install(spec: ModelSpec, progress: (Long) -> Unit) {
        fs.createDirectories(root); prepareRoot()
        val needed = spec.files.filterNot { verified(it) }.sumOf { it.bytes }
        if (freeBytes() < needed + 128_000_000) throw AiException("Free at least ${spec.sizeLabel} plus 128 MB before downloading this model.")
        var complete = 0L
        val client = clientFactory()
        try {
            for (file in spec.files) {
                if (verified(file)) { complete += file.bytes; progress(complete); continue }
                val partial = (path(file).toString() + ".part").toPath()
                try {
                    client.prepareGet(file.url).execute { response ->
                        if (response.status.value != 200 || response.call.request.url.protocol.name != "https") throw AiException("The model download is unavailable. Try again later.")
                        val channel = response.bodyAsChannel()
                        val bytes = ByteArray(65_536)
                        var written = 0L
                        fs.sink(partial).buffer().use { sink ->
                            while (true) {
                                currentCoroutineContext().ensureActive()
                                val count = channel.readAvailable(bytes)
                                if (count < 0) break
                                written += count
                                if (written > file.bytes) throw AiException("The model download has the wrong size. Retry the download.")
                                sink.write(bytes, 0, count); progress(complete + written)
                            }
                        }
                        if (written != file.bytes) throw AiException("The model download was incomplete. Retry the download.")
                    }
                    if (!verifyPath(file, partial)) throw AiException("The model checksum didn’t match. Retry the download.")
                    currentCoroutineContext().ensureActive()
                    fs.atomicMove(partial, path(file))
                } finally { fs.delete(partial, mustExist = false) }
                complete += file.bytes; progress(complete)
            }
        } finally { client.close() }
    }
    private suspend fun verifyPath(file: ModelFile, candidate: Path): Boolean {
        if (fs.metadataOrNull(candidate)?.size != file.bytes) return false
        return fs.source(candidate).buffer().use { modelSha256(it) } == file.sha256
    }
    fun remove(spec: ModelSpec) {
        spec.files.forEach { fs.delete(path(it), mustExist = false); fs.delete((path(it).toString() + ".part").toPath(), mustExist = false) }
    }
}
