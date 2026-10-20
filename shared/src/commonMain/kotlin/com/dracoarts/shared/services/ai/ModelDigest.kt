package com.dracoarts.shared.services.ai

import okio.BufferedSource

/** Full streaming SHA-256 using the platform crypto provider; never buffers model weights. */
internal expect suspend fun modelSha256(source: BufferedSource): String
