@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
package com.dracoarts.shared.services

import kotlinx.cinterop.*
import platform.Foundation.*
import platform.UIKit.*
import platform.CoreGraphics.*
import platform.posix.memcpy
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import org.jetbrains.skia.Image

actual fun decodeLocalPhoto(bytes: ByteArray): ImageBitmap? = runCatching { Image.makeFromEncoded(bytes).toComposeImageBitmap() }.getOrNull()

actual fun decodeHighlightPhoto(bytes: ByteArray, maxDimension: Int): ImageBitmap? = runCatching {
    if (bytes.isEmpty()) return@runCatching null
    val data = bytes.usePinned { NSData.dataWithBytes(it.addressOf(0), bytes.size.toULong()) }
    val image = UIImage.imageWithData(data) ?: return@runCatching null
    val width = image.size.useContents { this.width }; val height = image.size.useContents { this.height }
    val ratio = minOf(1.0, maxDimension / maxOf(width, height))
    val size = CGSizeMake(maxOf(1.0, width * ratio), maxOf(1.0, height * ratio))
    UIGraphicsBeginImageContextWithOptions(size, true, 1.0)
    val encoded = try {
        image.drawInRect(CGRectMake(0.0, 0.0, maxOf(1.0, width * ratio), maxOf(1.0, height * ratio)))
        UIGraphicsGetImageFromCurrentImageContext()?.let(::UIImagePNGRepresentation)
    } finally { UIGraphicsEndImageContext() } ?: return@runCatching null
    val scaled = ByteArray(encoded.length.toInt()).also { output -> output.usePinned { memcpy(it.addressOf(0), encoded.bytes, encoded.length) } }
    decodeLocalPhoto(scaled)
}.getOrNull()
