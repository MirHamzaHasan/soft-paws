package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.graphics.*
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import androidx.activity.ComponentActivity
import androidx.core.content.FileProvider
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.*
import androidx.media3.transformer.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.io.File
import java.util.UUID

@androidx.annotation.OptIn(UnstableApi::class)
class AndroidHighlightRenderer(private val activity: ComponentActivity) : HighlightRenderer {
    private val lock = Mutex()
    private val directory get() = File(activity.cacheDir, "barklog_exports").also { check(it.isDirectory || it.mkdirs()) }
    override suspend fun render(draft: HighlightDraft, motion: Boolean, progress: (Float?) -> Unit): DeviceResult<HighlightOutput> = lock.withLock {
        var file: File? = null
        var complete = false
        try {
            draft.validate(forExport = true)
            val inputs = withContext(Dispatchers.IO) {
                val dir = directory
                dir.listFiles()?.filter { (it.name.startsWith("BarkLog-film-") || it.name.startsWith("SoftPaws-film-")) && System.currentTimeMillis() - it.lastModified() > 86_400_000 }?.forEach { it.delete() }
                require(dir.usableSpace > 64_000_000) { "Free some space on this device, then try again." }
                draft.clips.map { clip ->
                    File(File(activity.filesDir, "barklog_photos"), clip.photoId).also { source ->
                        require(source.isFile && source.length() in 1..20_000_000) { "A selected photo is missing. Remove it and choose another." }
                        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                        BitmapFactory.decodeFile(source.path, bounds)
                        require(bounds.outWidth in 1..4096 && bounds.outHeight in 1..4096) { "A selected photo couldn't be opened. Choose it again." }
                    }
                }
            }
            val target = withContext(Dispatchers.IO) { File(directory, "SoftPaws-film-${UUID.randomUUID()}.mp4") }; file = target
            withContext(Dispatchers.Main) {
                val items = inputs.mapIndexed { index, source ->
                    val effects = mutableListOf<androidx.media3.common.Effect>(Presentation.createForWidthAndHeight(draft.aspect.width, draft.aspect.height, Presentation.LAYOUT_SCALE_TO_FIT_WITH_CROP))
                    if (motion) effects += MatrixTransformation { timeUs ->
                        val t = (timeUs / (HighlightDraft.CLIP_MS * 1000f)).coerceIn(0f, 1f)
                        Matrix().apply { setScale(1 + .08f * t, 1 + .08f * t); postTranslate(0f, .024f * t) }
                    }
                    if (draft.clips[index].caption.isNotBlank()) effects += OverlayEffect(listOf(CaptionOverlay(draft.clips[index].caption)))
                    EditedMediaItem.Builder(MediaItem.Builder().setUri(Uri.fromFile(source)).setImageDurationMs(HighlightDraft.CLIP_MS).build())
                        .setFrameRate(HighlightDraft.FPS).setRemoveAudio(true).setEffects(Effects(emptyList(), effects)).build()
                }
                val done = CompletableDeferred<Unit>()
                val transformer = Transformer.Builder(activity).setVideoMimeType(MimeTypes.VIDEO_H264)
                    .addListener(object : Transformer.Listener {
                        override fun onCompleted(composition: Composition, result: ExportResult) { done.complete(Unit) }
                        override fun onError(composition: Composition, result: ExportResult, exception: ExportException) { done.completeExceptionally(exception) }
                    }).build()
                try {
                    transformer.start(Composition.Builder(EditedMediaItemSequence.withVideoFrom(items)).build(), target.path)
                    withTimeout(180_000) {
                        val holder = ProgressHolder()
                        while (!done.isCompleted) {
                            progress(if (transformer.getProgress(holder) == Transformer.PROGRESS_STATE_AVAILABLE) holder.progress / 100f else null)
                            delay(150)
                        }
                        done.await()
                    }
                } finally { if (!done.isCompleted || done.isCancelled) transformer.cancel() }
            }
            val output = withContext(Dispatchers.IO) {
                check(target.length() > 0)
                val metadata = MediaMetadataRetriever()
                try {
                    metadata.setDataSource(target.path)
                    val encodedWidth = metadata.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toInt() ?: 0
                    val encodedHeight = metadata.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toInt() ?: 0
                    val rotated = (metadata.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toInt() ?: 0) % 180 != 0
                    val width = if (rotated) encodedHeight else encodedWidth
                    val height = if (rotated) encodedWidth else encodedHeight
                    val duration = metadata.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong() ?: 0
                    check(width == draft.aspect.width && height == draft.aspect.height && kotlin.math.abs(duration - draft.clips.size * HighlightDraft.CLIP_MS) < 150) { "Unexpected video geometry/duration: ${width}x$height, ${duration}ms" }
                    checkNotNull(metadata.getFrameAtTime(0)) { "Video couldn't be opened." }.recycle()
                    HighlightOutput(target.name, width, height, duration)
                } finally { metadata.release() }
            }
            complete = true
            DeviceResult.Success(output)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (e: IllegalArgumentException) { DeviceResult.Failed(e.message ?: "Choose your photos again.") }
        catch (failure: Exception) { if (BuildConfig.DEBUG) android.util.Log.e("BarkLogVideo", "Local encoder failed", failure); DeviceResult.Failed("Couldn't encode this film on this device. Your draft stays saved. Try again.") }
        finally { if (!complete) withContext(NonCancellable + Dispatchers.IO) { file?.delete() } }
    }
    override suspend fun share(output: HighlightOutput): DeviceResult<Unit> = try {
        val file = withContext(Dispatchers.IO) {
            require(Regex("(?:BarkLog|SoftPaws)-film-[a-zA-Z0-9-]+\\.mp4").matches(output.filename))
            File(directory, output.filename).also { require(it.isFile && it.length() > 0) }
        }
        withContext(Dispatchers.Main) {
            val uri = FileProvider.getUriForFile(activity, activity.packageName + ".files", file)
            activity.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("video/mp4").putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION), "Keep or share your film"))
        }
        DeviceResult.Success(Unit)
    } catch (cancelled: CancellationException) { throw cancelled }
    catch (_: Exception) { DeviceResult.Failed("Couldn't share this MP4. Export it again or choose another destination.") }

    private class CaptionOverlay(private val caption: String) : CanvasOverlay(true) {
        private val text = TextPaint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.rgb(29, 38, 32); textSize = 28f; typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL) }
        private var layout: StaticLayout? = null
        override fun onDraw(canvas: Canvas, presentationTimeUs: Long) {
            canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
            val words = layout ?: StaticLayout.Builder.obtain(caption, 0, caption.length, text, canvas.width - 72).setAlignment(Layout.Alignment.ALIGN_NORMAL).setIncludePad(false).build().also { layout = it }
            val y = canvas.height - words.height - 56f
            canvas.drawRect(0f, y, canvas.width.toFloat(), canvas.height.toFloat(), Paint().apply { color = Color.WHITE })
            canvas.save(); canvas.translate(36f, y + 28f); words.draw(canvas); canvas.restore()
        }
    }
}
