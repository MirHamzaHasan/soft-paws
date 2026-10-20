package com.draco.arts.apps.bark.log.dogs.journal

import android.Manifest
import android.app.*
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.*
import android.graphics.pdf.PdfDocument
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.*
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import android.view.PixelCopy
import android.os.Handler
import android.os.Looper
import androidx.compose.ui.graphics.asImageBitmap

class AndroidDeviceServices(private val activity: ComponentActivity) : DeviceServices {
    override fun suggestedCountry() = java.util.Locale.getDefault().country
    @Suppress("DEPRECATION", "MissingPermission")
    override suspend fun currentArea(): DeviceResult<ApproximateArea> = permissionLock.withLock {
        try {
            val allowed = withContext(Dispatchers.Main) {
                if (ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) true
                else {
                    val result = CompletableDeferred<Boolean>(); permission = result
                    try { permissionRequest.launch(Manifest.permission.ACCESS_COARSE_LOCATION); result.await() } finally { permission = null }
                }
            }
            if (!allowed) return@withLock DeviceResult.Denied
            val manager = activity.getSystemService(android.content.Context.LOCATION_SERVICE) as android.location.LocationManager
            if (!manager.isProviderEnabled(android.location.LocationManager.NETWORK_PROVIDER)) return@withLock DeviceResult.Failed("Turn on location services, or enter a city instead.")
            val result = CompletableDeferred<android.location.Location>()
            val listener = object : android.location.LocationListener {
                override fun onLocationChanged(location: android.location.Location) { result.complete(location) }
                override fun onProviderEnabled(provider: String) = Unit
                override fun onProviderDisabled(provider: String) { result.cancel() }
                override fun onStatusChanged(provider: String?, status: Int, extras: android.os.Bundle?) = Unit
            }
            val location = try {
                withContext(Dispatchers.Main) { manager.requestLocationUpdates(android.location.LocationManager.NETWORK_PROVIDER, 0L, 0f, listener, Looper.getMainLooper()) }
                withTimeoutOrNull(25_000) { result.await() }
            } finally { manager.removeUpdates(listener) }
            if (location == null) return@withLock DeviceResult.Failed("Couldn't find your area. Enter a city instead.")
            val country = withContext(Dispatchers.IO) { runCatching { android.location.Geocoder(activity).getFromLocation(location.latitude, location.longitude, 1)?.firstOrNull()?.countryCode.orEmpty() }.getOrDefault("") }
            DeviceResult.Success(ApproximateArea(kotlin.math.round(location.latitude * 100) / 100, kotlin.math.round(location.longitude * 100) / 100, country))
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Couldn't find your area. Enter a city instead.") }
    }
    override fun updateAppearance(dark: Boolean, followSystem: Boolean) {
        androidx.core.view.WindowCompat.getInsetsController(activity.window, activity.window.decorView).apply {
            isAppearanceLightStatusBars = !dark
            isAppearanceLightNavigationBars = !dark
        }
    }
    override suspend fun captureFrame(bounds: DeviceFrameBounds): androidx.compose.ui.graphics.ImageBitmap? {
        if (Build.VERSION.SDK_INT < 26 || bounds.width <= 0 || bounds.height <= 0) return null
        return withContext(Dispatchers.Main) {
            val bitmap = Bitmap.createBitmap(bounds.width, bounds.height, Bitmap.Config.ARGB_8888)
            val ready = CompletableDeferred<Boolean>()
            try {
                PixelCopy.request(activity.window, Rect(bounds.left, bounds.top, bounds.left + bounds.width, bounds.top + bounds.height), bitmap,
                    { result -> ready.complete(result == PixelCopy.SUCCESS) }, Handler(Looper.getMainLooper()))
                if (ready.await()) bitmap.asImageBitmap() else { bitmap.recycle(); null }
            } catch (cancelled: CancellationException) { ready.invokeOnCompletion { bitmap.recycle() }; throw cancelled }
            catch (_: Exception) { bitmap.recycle(); null }
        }
    }
    private val active = MutableStateFlow(activity.lifecycle.currentState.isAtLeast(Lifecycle.State.STARTED))
    override val foreground = active.asStateFlow()
    private val lifecycleObserver = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_START) active.value = true else if (event == Lifecycle.Event.ON_STOP) active.value = false }
    init { activity.lifecycle.addObserver(lifecycleObserver) }
    override fun close() { activity.lifecycle.removeObserver(lifecycleObserver); picked?.cancel(); permission?.cancel(); picker.unregister(); permissionRequest.unregister(); cameraRequest.unregister(); captured?.cancel() }
    private val targets = MutableStateFlow<ReminderTarget?>(null)
    override val reminderOpens = targets.asStateFlow()
    override fun consumedReminder() { targets.value = null }
    fun handleIntent(intent: Intent?) {
        val dog = intent?.getStringExtra("reminder_dog"); val task = intent?.getStringExtra("reminder_task")
        if (dog != null && task != null) targets.value = ReminderTarget(dog, task, intent.getLongExtra("reminder_time", System.currentTimeMillis()))
    }
    private val pickerLock = Mutex(); private val permissionLock = Mutex()
    private var picked: CompletableDeferred<Uri?>? = null
    private var permission: CompletableDeferred<Boolean>? = null
    private var captured: CompletableDeferred<Boolean>? = null
    private val cameraRequest = activity.registerForActivityResult(ActivityResultContracts.TakePicture()) {captured?.complete(it)}
    private val picker = activity.registerForActivityResult(ActivityResultContracts.OpenDocument()) { picked?.complete(it) }
    private val permissionRequest = activity.registerForActivityResult(ActivityResultContracts.RequestPermission()) { permission?.complete(it) }
    private val photos get() = File(activity.filesDir, "barklog_photos").also { it.mkdirs() }

    override suspend fun takePhoto(): DeviceResult<String> = pickerLock.withLock {
        val raw = withContext(Dispatchers.IO) { File(photos, UUID.randomUUID().toString()+".jpg") }
        try {
            val taken = withContext(Dispatchers.Main) {
                val result = CompletableDeferred<Boolean>(); captured = result
                try { cameraRequest.launch(FileProvider.getUriForFile(activity, activity.packageName+".files", raw)); result.await() } finally {captured=null}
            }
            if(!taken) return@withLock DeviceResult.Cancelled
            withContext(Dispatchers.IO) {
                require(raw.length() in 1..30_000_000) {"Choose a photo smaller than 30 MB."}
                val bounds=BitmapFactory.Options().apply {inJustDecodeBounds=true};BitmapFactory.decodeFile(raw.path,bounds)
                var sample=1;while(maxOf(bounds.outWidth,bounds.outHeight)/sample>2048)sample*=2
                val bitmap=checkNotNull(BitmapFactory.decodeFile(raw.path,BitmapFactory.Options().apply {inSampleSize=sample}))
                val orientation=ExifInterface(raw.path).getAttributeInt(ExifInterface.TAG_ORIENTATION,ExifInterface.ORIENTATION_NORMAL)
                val rotation=when(orientation){ExifInterface.ORIENTATION_ROTATE_90->90f;ExifInterface.ORIENTATION_ROTATE_180->180f;ExifInterface.ORIENTATION_ROTATE_270->270f;else->0f}
                val upright=if(rotation==0f)bitmap else Bitmap.createBitmap(bitmap,0,0,bitmap.width,bitmap.height,Matrix().apply {postRotate(rotation)},true)
                val retained=File(photos,UUID.randomUUID().toString()+".jpg")
                try {retained.outputStream().use {check(upright.compress(Bitmap.CompressFormat.JPEG,90,it))};DeviceResult.Success(retained.name)} catch(failure:Exception){retained.delete();throw failure} finally {if(upright!==bitmap)upright.recycle();bitmap.recycle()}
            }
        } catch(cancelled:CancellationException){throw cancelled}
        catch(_:android.content.ActivityNotFoundException){DeviceResult.Failed("No camera app is available. Choose a photo instead.")}
        catch(_:Exception){DeviceResult.Failed("Couldn't retain this photo. Your setup is still here.")}
        finally {withContext(NonCancellable+Dispatchers.IO){raw.delete()}}
    }

    override suspend fun pickPhoto(): DeviceResult<String> = pickLocalAttachment(false)
    override suspend fun pickReceipt(): DeviceResult<String> = pickLocalAttachment(true)
    private suspend fun pickLocalAttachment(receipt: Boolean): DeviceResult<String> = pickerLock.withLock {
        try {
            val uri = withContext(Dispatchers.Main) {
                val result = CompletableDeferred<Uri?>(); picked = result
                try { picker.launch(if (receipt) arrayOf("image/*", "application/pdf") else arrayOf("image/*")); result.await() } finally { picked = null }
            } ?: return@withLock DeviceResult.Cancelled
            withContext(Dispatchers.IO) {
                val resolver = activity.contentResolver
                if (receipt && resolver.getType(uri) == "application/pdf") {
                    val id = UUID.randomUUID().toString() + ".pdf"; val file = File(photos, id)
                    try {
                        resolver.openInputStream(uri).use { input ->
                            requireNotNull(input) { "Couldn't open this receipt." }
                            file.outputStream().use { output -> val buffer = ByteArray(8192); var total = 0
                                while (true) { currentCoroutineContext().ensureActive(); val count = input.read(buffer); if (count < 0) break; total += count; require(total <= 20_000_000) { "Choose a receipt smaller than 20 MB." }; output.write(buffer, 0, count) }
                            }
                        }
                        val header = ByteArray(5)
                        require(file.inputStream().use { it.read(header) } == 5 && header.decodeToString() == "%PDF-") { "This file could not be opened as a PDF." }
                        DeviceResult.Success(id)
                    } catch (failure: Exception) { file.delete(); throw failure }
                } else {
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                resolver.openInputStream(uri).use { BitmapFactory.decodeStream(it, null, bounds) }
                require(bounds.outWidth > 0 && bounds.outHeight > 0) { "This file could not be opened as a photo." }
                var sample = 1; while (maxOf(bounds.outWidth, bounds.outHeight) / sample > 2048) sample *= 2
                val bitmap = resolver.openInputStream(uri).use { BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample }) }
                    ?: return@withContext DeviceResult.Failed("This photo couldn't be opened. Choose another image.")
                val orientation = runCatching { resolver.openInputStream(uri).use { stream -> stream?.let { ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL) } } }.getOrNull()
                val matrix = Matrix().apply { when (orientation) {
                    ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> postScale(-1f, 1f)
                    ExifInterface.ORIENTATION_ROTATE_180 -> postRotate(180f)
                    ExifInterface.ORIENTATION_FLIP_VERTICAL -> postScale(1f, -1f)
                    ExifInterface.ORIENTATION_TRANSPOSE -> { postRotate(90f); postScale(-1f, 1f) }
                    ExifInterface.ORIENTATION_ROTATE_90 -> postRotate(90f)
                    ExifInterface.ORIENTATION_TRANSVERSE -> { postRotate(270f); postScale(-1f, 1f) }
                    ExifInterface.ORIENTATION_ROTATE_270 -> postRotate(270f)
                } }
                val upright = if (matrix.isIdentity) bitmap else Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
                val id = UUID.randomUUID().toString() + ".jpg"; val file = File(photos, id)
                try { file.outputStream().use { check(upright.compress(Bitmap.CompressFormat.JPEG, 90, it)) }; DeviceResult.Success(id) }
                catch (failure: Exception) { file.delete(); throw failure }
                finally { if (upright !== bitmap) upright.recycle(); bitmap.recycle() }
                }
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: SecurityException) { DeviceResult.Denied }
        catch (cause: IllegalArgumentException) { DeviceResult.Failed(cause.message ?: "Choose another attachment.") }
        catch (_: Exception) { DeviceResult.Failed("Couldn't retain this ${if (receipt) "receipt" else "photo"}. Your draft is still here. Try again.") }
    }
    private fun photo(fileId: String): File { require(com.dracoarts.shared.domain.model.LocalAttachmentRules.receipt.matches(fileId)); return File(photos, fileId) }
    override suspend fun photoBytes(fileId: String): ByteArray? = withContext(Dispatchers.IO) { runCatching { photo(fileId).takeIf { it.isFile && it.length() <= 20_000_000 }?.readBytes() }.getOrNull() }
    override suspend fun removePhoto(fileId: String) { withContext(Dispatchers.IO) { photo(fileId).let { if (it.exists()) check(it.delete()) } } }

    override suspend fun shareAttachment(fileId: String): DeviceResult<Unit> = try {
        val file = withContext(Dispatchers.IO) { val source = photo(fileId); require(source.isFile && source.length() in 1..20_000_000); val directory = File(activity.cacheDir, "barklog_exports").also { it.mkdirs() }; source.copyTo(File(directory, "receipt-$fileId"), overwrite = true) }
        withContext(Dispatchers.Main) { val uri = FileProvider.getUriForFile(activity, activity.packageName + ".files", file); val type = if (fileId.endsWith(".pdf")) "application/pdf" else "image/jpeg"; activity.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType(type).putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION), "Open or share receipt")) }
        DeviceResult.Success(Unit)
    } catch (cancelled: CancellationException) { throw cancelled }
    catch (_: Exception) { DeviceResult.Failed("Couldn't open this receipt. Its expense details stay saved.") }

    override fun openSettings(): Boolean = runCatching { activity.startActivity(Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${activity.packageName}"))); true }.getOrDefault(false)

    override suspend fun prepareExport(document: ExportDocument): DeviceResult<PreparedExport> = try {
        withContext(Dispatchers.IO) {
            val directory = File(activity.cacheDir, "barklog_exports").also { it.mkdirs() }
            directory.listFiles()?.filter { System.currentTimeMillis() - it.lastModified() > 86_400_000 }?.forEach { it.delete() }
            val name = document.filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
            val target = File(directory, name)
            if (document.format == ExportFormat.CSV) target.writeText(document.csv, Charsets.UTF_8) else writePdf(target, document)
            check(target.isFile && target.length() > 0)
            DeviceResult.Success(PreparedExport(name, document.format, document.title))
        }
    } catch (cancelled: CancellationException) { throw cancelled }
    catch (_: Exception) { DeviceResult.Failed("Couldn't create this file. Your report choices and journal are unchanged.") }

    override suspend fun sharePrepared(document: PreparedExport, print: Boolean): DeviceResult<Unit> {
        return try {
            val file = withContext(Dispatchers.IO) {
                require(Regex("[a-zA-Z0-9_-][a-zA-Z0-9._-]*\\.(pdf|csv)").matches(document.filename))
                File(File(activity.cacheDir, "barklog_exports"), document.filename).also { require(it.isFile && it.length() > 0) }
            }
            withContext(Dispatchers.Main) {
                if (print && document.format == ExportFormat.PDF) {
                    val manager = activity.getSystemService(PrintManager::class.java)
                    manager.print(document.title, object : PrintDocumentAdapter() {
                        override fun onLayout(old: PrintAttributes?, next: PrintAttributes?, signal: CancellationSignal?, callback: LayoutResultCallback, extras: android.os.Bundle?) {
                            if (signal?.isCanceled == true) callback.onLayoutCancelled()
                            else callback.onLayoutFinished(PrintDocumentInfo.Builder(file.name).setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT).build(), true)
                        }
                        override fun onWrite(pages: Array<out PageRange>?, destination: ParcelFileDescriptor, signal: CancellationSignal?, callback: WriteResultCallback) {
                            if (signal?.isCanceled == true) { callback.onWriteCancelled(); return }
                            try { FileOutputStream(destination.fileDescriptor).use { output -> file.inputStream().use { it.copyTo(output) } }; callback.onWriteFinished(arrayOf(PageRange.ALL_PAGES)) }
                            catch (_: Exception) { callback.onWriteFailed("Couldn't prepare this PDF for printing.") }
                        }
                    }, PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build())
                } else {
                    val uri = FileProvider.getUriForFile(activity, activity.packageName + ".files", file)
                    val intent = Intent(Intent.ACTION_SEND).setType(if (document.format == ExportFormat.CSV) "text/csv" else "application/pdf")
                        .putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    activity.startActivity(Intent.createChooser(intent, "Export journal"))
                }
            }
            DeviceResult.Success(Unit)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Couldn't prepare or share this file. Your journal stays saved. Try again.") }
    }

    private fun writePdf(file: File, report: ExportDocument) {
        val pdf = PdfDocument(); val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.BLACK; textSize = 11f }
        var pageNumber = 0; var page: PdfDocument.Page? = null; var y = 0f
        fun newPage() {
            page?.let(pdf::finishPage); page = pdf.startPage(PdfDocument.PageInfo.Builder(595, 842, ++pageNumber).create()); y = 48f
            paint.textSize = 15f; page!!.canvas.drawText(report.title, 42f, y, paint); y += 28f; paint.textSize = 11f
        }
        try {
            newPage()
            report.lines.forEach { line ->
                line.split('\n').forEach { paragraph ->
                    var remaining = paragraph
                    if (remaining.isEmpty()) y += 8f
                    while (remaining.isNotEmpty()) {
                        if (y > 788f) newPage()
                        val count = paint.breakText(remaining, true, 511f, null).coerceAtLeast(1)
                        val cut = if (count < remaining.length) remaining.lastIndexOf(' ', count).takeIf { it > count / 2 } ?: count else count
                        page!!.canvas.drawText(remaining.take(cut), 42f, y, paint); y += 16f
                        remaining = remaining.drop(cut).trimStart()
                    }
                    y += 4f
                }
            }
            report.images.forEach { image ->
                newPage()
                val bitmap = runCatching { BitmapFactory.decodeFile(photo(image.fileId).absolutePath) }.getOrNull()
                if (bitmap != null) {
                    try {
                        val ratio = minOf(511f / bitmap.width, 500f / bitmap.height)
                        val width = bitmap.width * ratio; val height = bitmap.height * ratio
                        page!!.canvas.drawBitmap(bitmap, null, RectF(42f, y, 42f + width, y + height), null); y += height + 20f
                    } finally { bitmap.recycle() }
                } else { page!!.canvas.drawText("Photo unavailable; saved caption follows.", 42f, y, paint); y += 24f }
                var caption = image.caption
                while (caption.isNotEmpty()) {
                    if (y > 788f) newPage()
                    val count = paint.breakText(caption, true, 511f, null).coerceAtLeast(1)
                    page!!.canvas.drawText(caption.take(count), 42f, y, paint); y += 16f; caption = caption.drop(count)
                }
            }
            page?.let(pdf::finishPage); page = null
            file.outputStream().use(pdf::writeTo)
        } finally { page?.let(pdf::finishPage); pdf.close() }
    }

    override suspend fun notificationAccess(request: Boolean): DeviceResult<Unit> = permissionLock.withLock {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            if (!request) return@withLock DeviceResult.Denied
            val granted = withContext(Dispatchers.Main) {
                val result = CompletableDeferred<Boolean>(); permission = result
                try { permissionRequest.launch(Manifest.permission.POST_NOTIFICATIONS); result.await() } finally { permission = null }
            }
            if (!granted) return@withLock DeviceResult.Denied
        }
        if ((activity.getSystemService(android.content.Context.NOTIFICATION_SERVICE) as NotificationManager).areNotificationsEnabled()) DeviceResult.Success(Unit) else DeviceResult.Denied
    }

    override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> = permissionLock.withLock {
        try {
            val allowed = withContext(Dispatchers.Main) {
                if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    if (!requestPermission) return@withContext false
                    val result = CompletableDeferred<Boolean>(); permission = result
                    try { permissionRequest.launch(Manifest.permission.POST_NOTIFICATIONS); result.await() } finally { permission = null }
                } else true
            }
            if (!allowed || !activity.getSystemService(NotificationManager::class.java).areNotificationsEnabled()) return@withLock DeviceResult.Denied
            AndroidReminders.schedule(activity, request)
            DeviceResult.Success(Unit)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Task saved. The reminder couldn't be scheduled. Try enabling it again.") }
    }
    override suspend fun cancelReminder(id: String) { AndroidReminders.cancel(activity, id) }
    override fun dial(number: String): Boolean = runCatching {
        require(number.isNotBlank() && number.length <= 40 && number.all { it.isDigit() || it in "+()- ." })
        activity.startActivity(Intent(Intent.ACTION_DIAL, Uri.fromParts("tel", number, null))); true
    }.getOrDefault(false)
    override fun openSource(url: String): Boolean = runCatching { require(url.startsWith("https://")); activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))); true }.getOrDefault(false)
}
