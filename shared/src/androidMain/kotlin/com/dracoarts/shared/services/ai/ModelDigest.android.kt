package com.dracoarts.shared.services.ai

import java.security.MessageDigest
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import okio.BufferedSource
import okio.ByteString.Companion.toByteString

internal actual suspend fun modelSha256(source: BufferedSource): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val buffer = ByteArray(65_536)
    while (true) {
        currentCoroutineContext().ensureActive()
        val count = source.read(buffer)
        if (count == -1) break
        digest.update(buffer, 0, count)
    }
    return digest.digest().toByteString().hex()
}
