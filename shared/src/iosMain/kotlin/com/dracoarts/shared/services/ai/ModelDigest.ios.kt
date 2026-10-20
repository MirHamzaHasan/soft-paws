@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class, kotlin.ExperimentalUnsignedTypes::class)

package com.dracoarts.shared.services.ai

import kotlinx.cinterop.*
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import okio.BufferedSource
import okio.ByteString.Companion.toByteString
import platform.CoreCrypto.*

internal actual suspend fun modelSha256(source: BufferedSource): String = memScoped {
    val digest = alloc<CC_SHA256_CTX>()
    check(CC_SHA256_Init(digest.ptr) == 1)
    val buffer = ByteArray(65_536)
    buffer.usePinned { pinned ->
        while (true) {
            currentCoroutineContext().ensureActive()
            val count = source.read(buffer)
            if (count == -1) break
            check(CC_SHA256_Update(digest.ptr, pinned.addressOf(0), count.toUInt()) == 1)
        }
    }
    val result = UByteArray(CC_SHA256_DIGEST_LENGTH)
    result.usePinned { check(CC_SHA256_Final(it.addressOf(0), digest.ptr) == 1) }
    result.toByteArray().toByteString().hex()
}
