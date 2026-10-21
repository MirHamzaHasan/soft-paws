package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.graphics.*
import android.media.MediaMetadataRetriever
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import org.junit.Test
import org.junit.Assert.*
import org.junit.runner.RunWith
import java.io.File

/** Real Media3/codec test in the owned, separate video review journal. */
@RunWith(AndroidJUnit4::class)
class HighlightEncoderTest {
    @Test fun encodesPlayableFilmsAndCleansCancelledAndFailedExports() = runBlocking {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        val photos = File(context.filesDir, "barklog_photos").also { it.mkdirs() }
        val colors = listOf(Color.rgb(215, 48, 48), Color.rgb(45, 185, 70), Color.rgb(45, 80, 215))
        val names = listOf("red", "green", "blue")
        names.forEachIndexed { index, name ->
            val bitmap = Bitmap.createBitmap(600, 1000, Bitmap.Config.ARGB_8888)
            Canvas(bitmap).apply { drawColor(colors[index]); drawRect(20f, 30f, 100f, 900f, Paint().apply { color = Color.WHITE }); drawCircle(480f, 170f, 75f, Paint().apply { color = Color.BLACK }) }
            File(photos, "video-qa-$name.jpg").outputStream().use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }; bitmap.recycle()
        }
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)!!.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK).putExtra("designReview", true).putExtra("designReviewScreen", "VideoHighlight").putExtra("designReviewFixture", "soft-paws-video-v1")
        val activity = instrumentation.startActivitySync(intent) as MainActivity
        val renderer = AndroidHighlightRenderer(activity)
        val draft = HighlightDraft("encoder-qa", names.mapIndexed { i, name -> HighlightClip("video-qa-$name.jpg", "QA moment ${i + 1}") })
        val results = mutableListOf<String>()
        for ((aspect, motion) in listOf(HighlightAspect.Portrait to true, HighlightAspect.Square to true, HighlightAspect.Square to false)) {
            val progress = mutableListOf<Float>()
            val result = renderer.render(draft.copy(aspect = aspect), motion) { it?.let(progress::add) }
            assertTrue(result.toString(), result is DeviceResult.Success)
            val output = (result as DeviceResult.Success).value
            assertTrue(output.filename.startsWith("SoftPaws-film-"))
            val file = File(context.cacheDir, "barklog_exports/${output.filename}")
            val metadata = MediaMetadataRetriever()
            try {
                metadata.setDataSource(file.path)
                assertEquals(aspect.width, output.width); assertEquals(aspect.height, output.height)
                assertTrue(kotlin.math.abs(output.durationMs - 8400) < 150)
                names.indices.forEach { index ->
                    val frame = metadata.getFrameAtTime(index * 2_800_000L + 1_000_000, MediaMetadataRetriever.OPTION_CLOSEST)!!
                    val pixel = frame.getPixel(frame.width / 2, frame.height / 2)
                    val channels = listOf(Color.red(pixel), Color.green(pixel), Color.blue(pixel))
                    assertEquals("Photo order/color $index", index, channels.indexOf(channels.max()))
                    val bottom = frame.getPixel(10, frame.height - 10)
                    assertTrue("Caption background missing", Color.red(bottom) > 235 && Color.green(bottom) > 235 && Color.blue(bottom) > 235)
                    frame.recycle()
                }
                val first = metadata.getFrameAtTime(200_000, MediaMetadataRetriever.OPTION_CLOSEST)!!
                val later = metadata.getFrameAtTime(2_300_000, MediaMetadataRetriever.OPTION_CLOSEST)!!
                // H.264 can change a few decoded colour values in a still frame.
                // Track the actual black QA shape instead of requiring byte equality.
                fun anchor(bitmap: Bitmap): IntArray {
                    var left = bitmap.width; var top = bitmap.height; var right = -1; var bottom = -1
                    for (y in 0 until bitmap.height * 2 / 3) for (x in 0 until bitmap.width) {
                        val pixel = bitmap.getPixel(x, y)
                        if (Color.red(pixel) < 45 && Color.green(pixel) < 45 && Color.blue(pixel) < 45) {
                            left = minOf(left, x); top = minOf(top, y); right = maxOf(right, x); bottom = maxOf(bottom, y)
                        }
                    }
                    assertTrue("QA shape must be visible", right - left > 10 && bottom - top > 10)
                    return intArrayOf(left, top, right, bottom)
                }
                val drift = anchor(first).zip(anchor(later)).maxOf { (a, b) -> kotlin.math.abs(a - b) }
                if (motion) assertTrue("Pan/zoom must move the QA shape: $drift", drift > 2)
                else assertTrue("Reduced-motion shape must remain still: $drift", drift <= 2)
                first.recycle(); later.recycle()
                results += "${aspect.name} motion=$motion ${output.width}x${output.height} ${output.durationMs}ms ${file.length()}bytes progress=${progress.size} shapeDrift=${drift}px"
            } finally { metadata.release() }
        }
        val before = File(context.cacheDir, "barklog_exports").listFiles()!!.map { it.name }.toSet()
        val cancelled = launch { renderer.render(draft, true) { if ((it ?: 0f) >= .1f) this.cancel() } }
        withTimeout(60_000) { cancelled.join() }
        assertTrue(cancelled.isCancelled)
        assertEquals(before, File(context.cacheDir, "barklog_exports").listFiles()!!.map { it.name }.toSet())
        val failed = renderer.render(draft.copy(clips = draft.clips.mapIndexed { i, clip -> if (i == 0) clip.copy(photoId = "missing-photo.jpg") else clip }), true) {}
        assertTrue(failed is DeviceResult.Failed)
        assertEquals(before, File(context.cacheDir, "barklog_exports").listFiles()!!.map { it.name }.toSet())
        File(context.cacheDir, "highlight-qa.txt").writeText((results + "Cancelled partial removed; missing input rejected; no network used.").joinToString("\n"))
    }
}
