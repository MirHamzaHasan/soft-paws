package com.draco.arts.apps.bark.log.dogs.journal

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.os.Bundle
import android.os.SystemClock
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.dracoarts.shared.presentation.companion.RealResponseProvider
import com.dracoarts.shared.services.*
import com.dracoarts.shared.services.ai.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.ByteArrayOutputStream
import java.util.UUID

/** Opt-in, real native inference with synthetic inputs. Never opens the journal. */
@RunWith(AndroidJUnit4::class)
class LocalAiNativeTest {
    @Test fun pinnedTextAndPhotoModelsRunLocallyAndRemovalPreservesOtherFiles(): Unit = runBlocking {
        assumeTrue("Stage the pinned catalog files and pass -e localAiModels true", InstrumentationRegistry.getArguments().getString("localAiModels") == "true")
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        val staged = context.noBackupFilesDir.resolve("ai-native-qa-staged")
        val root = context.noBackupFilesDir.resolve("ai-native-qa-${UUID.randomUUID()}").apply { mkdirs() }
        val sentinel = root.resolve("unrelated-test-file.txt").apply { writeText("preserve") }
        val image = Bitmap.createBitmap(384, 384, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(image); canvas.drawColor(Color.WHITE)
        canvas.drawRect(72f, 72f, 312f, 312f, Paint().apply { color = Color.RED })
        val bytes = ByteArrayOutputStream().use { out -> image.compress(Bitmap.CompressFormat.PNG, 100, out); out.toByteArray() }
        image.recycle()
        val device = object : DeviceServices {
            override val reminderOpens = MutableStateFlow<ReminderTarget?>(null)
            override fun consumedReminder() = Unit
            override suspend fun pickPhoto(): DeviceResult<String> = DeviceResult.Cancelled
            override suspend fun photoBytes(fileId: String): ByteArray? = if (fileId == "synthetic-square.png") bytes else null
            override suspend fun removePhoto(fileId: String) = Unit
            override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> = DeviceResult.Cancelled
            override suspend fun cancelReminder(id: String) = Unit
            override fun dial(number: String) = false
            override fun openSource(url: String) = false
        }
        val runtime = createGgufLocalAi(root.absolutePath, device, 8_000_000_000L, { root.usableSpace })
        try {
            ModelCatalog.all.flatMap { it.files }.forEach { staged.resolve(it.name).copyTo(root.resolve(it.name)) }
            runtime.restore()
            assertEquals("downloaded", runtime.state.value.text.phase)
            assertEquals("downloaded", runtime.state.value.photo.phase)
            var start = SystemClock.elapsedRealtime()
            val text = runtime.answer(RealResponseProvider.SYSTEM,
                "Caregiver recorded one walk lasting 17 minutes.", "How many minutes was the recorded walk? Answer briefly.")
            assertTrue("Native text model must use the supplied observation", text.contains("17"))
            instrumentation.sendStatus(0, Bundle().apply { putString("stream", "\nLocal text: $text (${SystemClock.elapsedRealtime() - start} ms)\n") })
            start = SystemClock.elapsedRealtime()
            val caption = runtime.caption("synthetic-square.png")
            assertTrue(caption.isNotBlank())
            assertTrue("Native vision must identify the synthetic scene", caption.contains("red", true) || caption.contains("square", true) || caption.contains("rectangle", true))
            instrumentation.sendStatus(0, Bundle().apply { putString("stream", "\nLocal caption: $caption (${SystemClock.elapsedRealtime() - start} ms)\n") })
            runtime.remove(ModelKind.Text); runtime.remove(ModelKind.Photo)
            assertEquals("missing", runtime.state.value.text.phase)
            assertEquals("missing", runtime.state.value.photo.phase)
            assertEquals("preserve", sentinel.readText())
        } finally { runtime.close(); root.deleteRecursively() }
    }
}
