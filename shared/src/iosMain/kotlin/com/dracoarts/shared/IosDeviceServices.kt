@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class, kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared

import com.dracoarts.shared.services.*
import com.dracoarts.shared.domain.model.Repeat
import kotlinx.cinterop.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import platform.Foundation.*
import platform.UIKit.*
import platform.PhotosUI.*
import platform.AVFoundation.*
import platform.UniformTypeIdentifiers.*
import platform.UserNotifications.*
import platform.CoreGraphics.*
import platform.CoreFoundation.*
import platform.ImageIO.*
import platform.darwin.NSObject
import platform.posix.memcpy

class IosDeviceServices : DeviceServices {
    override suspend fun captureFrame(bounds: DeviceFrameBounds): androidx.compose.ui.graphics.ImageBitmap? = withContext(Dispatchers.Main) {
        if (bounds.width <= 0 || bounds.height <= 0) return@withContext null
        val window = presenter()?.view?.window ?: return@withContext null
        val scale = window.screen.scale
        UIGraphicsBeginImageContextWithOptions(CGSizeMake(bounds.width / scale, bounds.height / scale), false, scale)
        val data = try {
            val context = UIGraphicsGetCurrentContext() ?: return@withContext null
            CGContextTranslateCTM(context, -bounds.left / scale, -bounds.top / scale)
            if (!window.drawViewHierarchyInRect(window.bounds, true)) return@withContext null
            UIGraphicsGetImageFromCurrentImageContext()?.let(::UIImagePNGRepresentation)
        } finally { UIGraphicsEndImageContext() }
        if (data == null) null else withContext(Dispatchers.Default) {
            val bytes = ByteArray(data.length.toInt()).also { output -> output.usePinned { memcpy(it.addressOf(0), data.bytes, data.length) } }
            decodeLocalPhoto(bytes)
        }
    }
    private val active = MutableStateFlow(true)
    override val foreground = active.asStateFlow()
    private val foregroundObserver = NSNotificationCenter.defaultCenter.addObserverForName(UIApplicationDidBecomeActiveNotification, null, NSOperationQueue.mainQueue) { active.value = true }
    private val backgroundObserver = NSNotificationCenter.defaultCenter.addObserverForName(UIApplicationDidEnterBackgroundNotification, null, NSOperationQueue.mainQueue) { active.value = false }
    override fun close() { NSNotificationCenter.defaultCenter.removeObserver(foregroundObserver); NSNotificationCenter.defaultCenter.removeObserver(backgroundObserver); notifications.delegate = null }
    private val targets = MutableStateFlow<ReminderTarget?>(null)
    override val reminderOpens = targets.asStateFlow()
    override fun consumedReminder() { targets.value = null }
    private val sheetLock = Mutex()
    private var activeCameraDelegate: UIImagePickerControllerDelegateProtocol? = null
    private var activePhotoDelegate: PHPickerViewControllerDelegateProtocol? = null
    private var activeDocumentDelegate: UIDocumentPickerDelegateProtocol? = null
    private val notifications = UNUserNotificationCenter.currentNotificationCenter()
    private val notificationDelegate = object : NSObject(), UNUserNotificationCenterDelegateProtocol {
        override fun userNotificationCenter(center: UNUserNotificationCenter, didReceiveNotificationResponse: UNNotificationResponse, withCompletionHandler: () -> Unit) {
            val info = didReceiveNotificationResponse.notification.request.content.userInfo
            val dog = info["dog"] as? String; val task = info["task"] as? String
            if (dog != null && task != null) targets.value = ReminderTarget(dog, task, (didReceiveNotificationResponse.notification.date.timeIntervalSince1970 * 1000).toLong())
            withCompletionHandler()
        }
        override fun userNotificationCenter(center: UNUserNotificationCenter, willPresentNotification: UNNotification, withCompletionHandler: (UNNotificationPresentationOptions) -> Unit) {
            withCompletionHandler(UNNotificationPresentationOptionBanner or UNNotificationPresentationOptionSound)
        }
    }
    init { notifications.delegate = notificationDelegate }
    private fun presenter(): UIViewController? {
        val windows = UIApplication.sharedApplication.connectedScenes.filterIsInstance<UIWindowScene>().flatMap { it.windows.filterIsInstance<UIWindow>() }
        var controller = windows.firstOrNull { it.isKeyWindow() }?.rootViewController ?: return null
        while (controller.presentedViewController != null) controller = controller.presentedViewController!!
        return controller
    }
    private fun photoDirectory(): NSURL {
        val files = NSFileManager.defaultManager
        val support = checkNotNull(files.URLForDirectory(NSApplicationSupportDirectory, NSUserDomainMask, null, true, null))
        val directory = checkNotNull(support.URLByAppendingPathComponent("BarkLogPhotos", true))
        check(files.createDirectoryAtURL(directory, true, null, null))
        check(directory.setResourceValue(NSNumber(bool = true), NSURLIsExcludedFromBackupKey, null))
        return directory
    }
    private fun photoUrl(id: String): NSURL {
        require(com.dracoarts.shared.domain.model.LocalAttachmentRules.receipt.matches(id))
        return checkNotNull(photoDirectory().URLByAppendingPathComponent(id))
    }

    override suspend fun takePhoto(): DeviceResult<String> = sheetLock.withLock {
        try {
            if(!UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera)) return@withLock DeviceResult.Failed("A camera isn't available. Choose a photo instead.")
            val status=AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
            if(status==AVAuthorizationStatusDenied||status==AVAuthorizationStatusRestricted)return@withLock DeviceResult.Denied
            if(status==AVAuthorizationStatusNotDetermined){val permission=CompletableDeferred<Boolean>();AVCaptureDevice.requestAccessForMediaType(AVMediaTypeVideo){permission.complete(it)};if(!permission.await())return@withLock DeviceResult.Denied}
            val image=withContext(Dispatchers.Main){
                val host=checkNotNull(presenter());val result=CompletableDeferred<UIImage?>();val picker=UIImagePickerController().apply {sourceType=UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera}
                val delegate=object:NSObject(),UIImagePickerControllerDelegateProtocol,UINavigationControllerDelegateProtocol {
                    override fun imagePickerController(picker:UIImagePickerController,didFinishPickingMediaWithInfo:Map<Any?,*>) {picker.dismissViewControllerAnimated(true,null);result.complete(didFinishPickingMediaWithInfo[UIImagePickerControllerOriginalImage] as? UIImage)}
                    override fun imagePickerControllerDidCancel(picker:UIImagePickerController) {picker.dismissViewControllerAnimated(true,null);result.complete(null)}
                }
                activeCameraDelegate=delegate;picker.delegate=delegate;host.presentViewController(picker,true,null)
                try {result.await()} finally {picker.dismissViewControllerAnimated(false,null);picker.delegate=null;activeCameraDelegate=null}
            } ?: return@withLock DeviceResult.Cancelled
            withContext(Dispatchers.Default){val raw=checkNotNull(UIImageJPEGRepresentation(image,.9));require(raw.length<=30_000_000uL);val encoded=checkNotNull(UIImageJPEGRepresentation(thumbnail(raw),.9));val id=NSUUID().UUIDString+".jpg";check(encoded.writeToURL(photoUrl(id),true));DeviceResult.Success(id)}
        }catch(cancelled:CancellationException){throw cancelled}
        catch(_:Exception){DeviceResult.Failed("Couldn't retain this photo. Your setup is still here.")}
    }

    override suspend fun pickPhoto(): DeviceResult<String> = sheetLock.withLock {
        try {
            val data = withContext(Dispatchers.Main) {
                val host = checkNotNull(presenter()) { "Photo selection isn't available yet. Try again." }
                val result = CompletableDeferred<NSData?>()
                val config = PHPickerConfiguration().apply { selectionLimit = 1; filter = PHPickerFilter.imagesFilter }
                val picker = PHPickerViewController(config)
                val delegate = object : NSObject(), PHPickerViewControllerDelegateProtocol {
                    override fun picker(picker: PHPickerViewController, didFinishPicking: List<*>) {
                        picker.dismissViewControllerAnimated(true, null)
                        val selected = didFinishPicking.firstOrNull() as? PHPickerResult
                        if (selected == null) { result.complete(null); return }
                        selected.itemProvider.loadDataRepresentationForTypeIdentifier("public.image") { data, error ->
                            if (error != null || data == null) result.completeExceptionally(IllegalArgumentException("Couldn't read this photo. Choose another image."))
                            else result.complete(data)
                        }
                    }
                }
                picker.delegate = delegate
                activePhotoDelegate = delegate
                host.presentViewController(picker, true, null)
                try { result.await() } finally { picker.dismissViewControllerAnimated(false, null); picker.delegate = null; activePhotoDelegate = null }
            } ?: return@withLock DeviceResult.Cancelled
            withContext(Dispatchers.Default) {
                require(data.length <= 20_000_000uL) { "Choose an image smaller than 20 MB." }
                val encoded = checkNotNull(UIImageJPEGRepresentation(thumbnail(data), .9))
                val id = NSUUID().UUIDString + ".jpg"
                check(encoded.writeToURL(photoUrl(id), true))
                DeviceResult.Success(id)
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (cause: IllegalArgumentException) { DeviceResult.Failed(cause.message ?: "Choose another photo.") }
        catch (_: Exception) { DeviceResult.Failed("Couldn't retain this photo. Your draft is still here. Try again.") }
    }

    override suspend fun pickReceipt(): DeviceResult<String> = sheetLock.withLock {
        try {
            val url = withContext(Dispatchers.Main) {
                val host = checkNotNull(presenter())
                val result = CompletableDeferred<NSURL?>()
                val picker = UIDocumentPickerViewController(forOpeningContentTypes = listOf(UTTypeImage, UTTypePDF), asCopy = true)
                picker.allowsMultipleSelection = false
                val delegate = object : NSObject(), UIDocumentPickerDelegateProtocol {
                    override fun documentPicker(controller: UIDocumentPickerViewController, didPickDocumentsAtURLs: List<*>) { result.complete(didPickDocumentsAtURLs.firstOrNull() as? NSURL) }
                    override fun documentPickerWasCancelled(controller: UIDocumentPickerViewController) { result.complete(null) }
                }
                picker.delegate = delegate; activeDocumentDelegate = delegate
                host.presentViewController(picker, true, null)
                try { result.await() } finally { picker.dismissViewControllerAnimated(false, null); picker.delegate = null; activeDocumentDelegate = null }
            } ?: return@withLock DeviceResult.Cancelled
            withContext(Dispatchers.Default) {
                val scoped = url.startAccessingSecurityScopedResource()
                try {
                    val length = url.path?.let { NSFileManager.defaultManager.attributesOfItemAtPath(it, null)?.get(NSFileSize) as? NSNumber }?.longLongValue
                    require(length != null && length in 1..20_000_000) { "Choose a receipt smaller than 20 MB." }
                    val data = checkNotNull(NSData.dataWithContentsOfURL(url))
                    require(data.length in 1uL..20_000_000uL)
                    val pdf = data.length >= 5uL && data.bytes?.reinterpret<ByteVar>()?.readBytes(5)?.decodeToString() == "%PDF-"
                    val encoded = if (pdf) data else checkNotNull(UIImageJPEGRepresentation(thumbnail(data), .9))
                    val id = NSUUID().UUIDString + if (pdf) ".pdf" else ".jpg"
                    check(encoded.writeToURL(photoUrl(id), true)); DeviceResult.Success(id)
                } finally { if (scoped) url.stopAccessingSecurityScopedResource() }
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (cause: IllegalArgumentException) { DeviceResult.Failed(cause.message ?: "Choose another receipt.") }
        catch (_: Exception) { DeviceResult.Failed("Couldn't retain this receipt. Your draft is still here.") }
    }

    override suspend fun shareAttachment(fileId: String): DeviceResult<Unit> = sheetLock.withLock {
        try {
            val url = photoUrl(fileId)
            require(NSFileManager.defaultManager.fileExistsAtPath(checkNotNull(url.path)))
            withContext(Dispatchers.Main) {
                val host = checkNotNull(presenter()); val result = CompletableDeferred<DeviceResult<Unit>>()
                val sheet = UIActivityViewController(listOf(url), null)
                sheet.popoverPresentationController?.apply { sourceView = host.view; sourceRect = CGRectMake(0.0, 0.0, 1.0, 1.0); permittedArrowDirections = 0u }
                sheet.completionWithItemsHandler = { _, done, _, error -> result.complete(if (error != null) DeviceResult.Failed("Couldn't open this receipt.") else if (done) DeviceResult.Success(Unit) else DeviceResult.Cancelled) }
                host.presentViewController(sheet, true, null)
                try { result.await() } finally { sheet.dismissViewControllerAnimated(false, null) }
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Couldn't open this receipt. Its expense details stay saved.") }
    }

    override fun openSettings(): Boolean = runCatching { val url = checkNotNull(NSURL.URLWithString(UIApplicationOpenSettingsURLString)); if (!UIApplication.sharedApplication.canOpenURL(url)) false else { UIApplication.sharedApplication.openURL(url, emptyMap<Any?, Any>(), null); true } }.getOrDefault(false)
    private fun thumbnail(data: NSData): UIImage = memScoped {
        require(data.length > 0uL)
        val bytes = checkNotNull(data.bytes).reinterpret<UByteVar>()
        val buffer = checkNotNull(CFDataCreateWithBytesNoCopy(null, bytes, data.length.toLong(), kCFAllocatorNull))
        try {
            val source = checkNotNull(CGImageSourceCreateWithData(buffer, null))
            try {
                val options = checkNotNull(CFDictionaryCreateMutable(null, 0, null, null))
                val size = alloc<IntVar>().apply { value = 2048 }
                val number = checkNotNull(CFNumberCreate(null, kCFNumberSInt32Type, size.ptr))
                try {
                    CFDictionarySetValue(options, kCGImageSourceCreateThumbnailFromImageAlways, kCFBooleanTrue)
                    CFDictionarySetValue(options, kCGImageSourceCreateThumbnailWithTransform, kCFBooleanTrue)
                    CFDictionarySetValue(options, kCGImageSourceThumbnailMaxPixelSize, number)
                    val image = checkNotNull(CGImageSourceCreateThumbnailAtIndex(source, 0u, options))
                    try { UIImage.imageWithCGImage(image) } finally { CFRelease(image) }
                } finally { CFRelease(number); CFRelease(options) }
            } finally { CFRelease(source) }
        } finally { CFRelease(buffer) }
    }
    override suspend fun photoBytes(fileId: String): ByteArray? = withContext(Dispatchers.Default) {
        runCatching {
            val data = NSData.dataWithContentsOfURL(photoUrl(fileId)) ?: return@runCatching null
            if (data.length > 20_000_000uL) return@runCatching null
            ByteArray(data.length.toInt()).also { bytes -> bytes.usePinned { memcpy(it.addressOf(0), data.bytes, data.length) } }
        }.getOrNull()
    }
    override suspend fun removePhoto(fileId: String) { withContext(Dispatchers.Default) {
        val url = photoUrl(fileId)
        if (NSFileManager.defaultManager.fileExistsAtPath(checkNotNull(url.path))) check(NSFileManager.defaultManager.removeItemAtURL(url, null))
    } }

    override suspend fun prepareExport(document: ExportDocument): DeviceResult<PreparedExport> {
        try {
            return withContext(Dispatchers.Default) {
                val directory = checkNotNull(NSURL.fileURLWithPath(NSTemporaryDirectory(), true).URLByAppendingPathComponent("BarkLogExports", true))
                val files = NSFileManager.defaultManager
                check(files.createDirectoryAtURL(directory, true, null, null))
                files.contentsOfDirectoryAtURL(directory, null, 0u, null)?.filterIsInstance<NSURL>()?.forEach { file ->
                    val modified = file.path?.let { files.attributesOfItemAtPath(it, null)?.get(NSFileModificationDate) as? NSDate }
                    if (modified != null && modified.timeIntervalSinceNow < -86400) files.removeItemAtURL(file, null)
                }
                val name = document.filename.replace(Regex("[^a-zA-Z0-9._-]"), "_")
                val target = checkNotNull(directory.URLByAppendingPathComponent(name))
                if (document.format == ExportFormat.CSV) check(document.csv.encodeToByteArray().data().writeToURL(target, true))
                else check(makePdf(document).writeToURL(target, true))
                DeviceResult.Success(PreparedExport(name, document.format, document.title))
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { return DeviceResult.Failed("Couldn't create this file. Your report choices and journal are unchanged.") }
    }

    override suspend fun sharePrepared(document: PreparedExport, print: Boolean): DeviceResult<Unit> = sheetLock.withLock {
        try {
            require(Regex("[a-zA-Z0-9_-][a-zA-Z0-9._-]*\\.(pdf|csv)").matches(document.filename))
            val directory = checkNotNull(NSURL.fileURLWithPath(NSTemporaryDirectory(), true).URLByAppendingPathComponent("BarkLogExports", true))
            val url = checkNotNull(directory.URLByAppendingPathComponent(document.filename))
            require(NSFileManager.defaultManager.fileExistsAtPath(checkNotNull(url.path)))
            withContext(Dispatchers.Main) {
                val host = presenter() ?: return@withContext DeviceResult.Failed("Couldn't open the native share sheet. Try again.")
                val result = CompletableDeferred<DeviceResult<Unit>>()
                if (print && document.format == ExportFormat.PDF) {
                    val printer = UIPrintInteractionController.sharedPrintController()
                    printer.printInfo = UIPrintInfo.printInfo().apply { jobName = document.title }
                    printer.printingItem = url
                    val completed: (UIPrintInteractionController?, Boolean, NSError?) -> Unit = { _, done, error -> result.complete(if (error != null) DeviceResult.Failed("Couldn't print this PDF. Try again.") else if (done) DeviceResult.Success(Unit) else DeviceResult.Cancelled) }
                    if (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) printer.presentFromRect(CGRectMake(0.0, 0.0, 1.0, 1.0), host.view, true, completed)
                    else printer.presentAnimated(true, completed)
                    try { result.await() } finally { printer.dismissAnimated(false) }
                } else {
                    val sheet = UIActivityViewController(listOf(url), null)
                    sheet.popoverPresentationController?.apply { sourceView = host.view; sourceRect = CGRectMake(0.0, 0.0, 1.0, 1.0); permittedArrowDirections = 0u }
                    sheet.completionWithItemsHandler = { _, done, _, error -> result.complete(if (error != null) DeviceResult.Failed("Couldn't share this file. Try again.") else if (done) DeviceResult.Success(Unit) else DeviceResult.Cancelled) }
                    host.presentViewController(sheet, true, null)
                    try { result.await() } finally { sheet.dismissViewControllerAnimated(false, null) }
                }
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { DeviceResult.Failed("Couldn't prepare this file. Your journal stays saved. Try again.") }
    }
    private suspend fun makePdf(document: ExportDocument): NSData {
        val data = NSMutableData()
        UIGraphicsBeginPDFContextToData(data, CGRectMake(0.0, 0.0, 595.0, 842.0), null)
        var y = 48.0
        val attributes = mapOf<Any?, Any>(NSFontAttributeName to UIFont.systemFontOfSize(11.0), NSForegroundColorAttributeName to UIColor.blackColor)
        fun newPage() {
            UIGraphicsBeginPDFPage(); y = 48.0
            (document.title as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 30.0), mapOf<Any?, Any>(NSFontAttributeName to UIFont.boldSystemFontOfSize(15.0)))
            y += 34.0
        }
        try {
            newPage()
            document.lines.forEach { line ->
                currentCoroutineContext().ensureActive()
                line.split('\n').forEach { paragraph ->
                    // Small attributed runs let long notes flow across pages without clipping.
                    val words = paragraph.split(' '); var row = ""
                    words.forEach { word ->
                        val proposed = if (row.isEmpty()) word else "$row $word"
                        val measuredWidth = (proposed as NSString).sizeWithAttributes(attributes).useContents { this.width }
                        if (measuredWidth > 511.0 && row.isNotEmpty()) {
                            if (y > 788) newPage()
                            (row as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 18.0), attributes); y += 16.0; row = word
                        } else row = proposed
                        while (row.isNotEmpty() && (row as NSString).sizeWithAttributes(attributes).useContents { this.width } > 511.0) {
                            currentCoroutineContext().ensureActive()
                            var cut = minOf(70, row.length)
                            while (cut > 1 && (row.take(cut) as NSString).sizeWithAttributes(attributes).useContents { this.width } > 511.0) cut--
                            if (y > 788) newPage()
                            (row.take(cut) as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 18.0), attributes); y += 16.0; row = row.drop(cut)
                        }
                    }
                    if (y > 788) newPage()
                    (row as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 18.0), attributes); y += 20.0
                }
            }
            document.images.forEach { reference ->
                currentCoroutineContext().ensureActive()
                newPage()
                val image = NSData.dataWithContentsOfURL(photoUrl(reference.fileId))?.let { UIImage(data = it) }
                if (image != null) {
                    val dimensions = image.size.useContents { width to height }
                    val ratio = minOf(511.0 / dimensions.first, 500.0 / dimensions.second)
                    val height = dimensions.second * ratio
                    image.drawInRect(CGRectMake(42.0, y, dimensions.first * ratio, height)); y += height + 16.0
                } else { ("Photo unavailable; saved caption follows." as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 20.0), attributes); y += 24.0 }
                (reference.caption as NSString).drawInRect(CGRectMake(42.0, y, 511.0, 100.0), attributes)
            }
        } finally { UIGraphicsEndPDFContext() }
        return data
    }

    override suspend fun notificationAccess(request: Boolean): DeviceResult<Unit> {
        val allowed = CompletableDeferred<Boolean>()
        if (request) notifications.requestAuthorizationWithOptions(UNAuthorizationOptionAlert or UNAuthorizationOptionSound) { granted, _ -> allowed.complete(granted) }
        else notifications.getNotificationSettingsWithCompletionHandler { allowed.complete(it?.authorizationStatus == UNAuthorizationStatusAuthorized || it?.authorizationStatus == UNAuthorizationStatusProvisional) }
        return if (allowed.await()) DeviceResult.Success(Unit) else DeviceResult.Denied
    }

    override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> {
        try {
            val allowed = CompletableDeferred<Boolean>()
            if (requestPermission) notifications.requestAuthorizationWithOptions(UNAuthorizationOptionAlert or UNAuthorizationOptionSound) { granted, _ -> allowed.complete(granted) }
            else notifications.getNotificationSettingsWithCompletionHandler { allowed.complete(it?.authorizationStatus == UNAuthorizationStatusAuthorized || it?.authorizationStatus == UNAuthorizationStatusProvisional) }
            if (!allowed.await()) return DeviceResult.Denied
            require(request.atMillis > kotlin.time.Clock.System.now().toEpochMilliseconds())
            val calendar = NSCalendar.currentCalendar.apply { timeZone = NSTimeZone.timeZoneWithName(request.zoneId) ?: NSTimeZone.defaultTimeZone }
            val units = NSCalendarUnitYear or NSCalendarUnitMonth or NSCalendarUnitDay or NSCalendarUnitHour or NSCalendarUnitMinute
            val prefix = "barklog-${request.id}-"
            val pending = CompletableDeferred<List<UNNotificationRequest>>()
            notifications.getPendingNotificationRequestsWithCompletionHandler { pending.complete(it.orEmpty().filterIsInstance<UNNotificationRequest>()) }
            val existing = pending.await()
            val own = existing.filter { it.identifier.startsWith(prefix) || it.identifier == "barklog-${request.id}" }
            val capacity = (60 - (existing.size - own.size)).coerceAtLeast(0)
            if (capacity == 0) return DeviceResult.Failed("Task saved. This device has reached its pending reminder limit. Turn off another reminder, then try again.")
            val dates = request.occurrences.distinct().filter { it > kotlin.time.Clock.System.now().toEpochMilliseconds() }.take(minOf(8, capacity))
            if (dates.isEmpty()) return DeviceResult.Failed("Task saved. Choose a future reminder time.")
            notifications.removePendingNotificationRequestsWithIdentifiers(own.map { it.identifier })
            for (time in dates) {
                val date = calendar.components(units, NSDate.dateWithTimeIntervalSince1970(time / 1000.0))
                date.timeZone = calendar.timeZone
                val content = UNMutableNotificationContent().apply {
                    setTitle("Care reminder"); setBody("A task is due. Open BarkLog to view it."); setSound(UNNotificationSound.defaultSound)
                    setUserInfo(mapOf<Any?, Any>("dog" to request.dogId, "task" to request.id))
                }
                val result = CompletableDeferred<NSError?>()
                notifications.addNotificationRequest(UNNotificationRequest.requestWithIdentifier(prefix + time, content, UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(date, false))) { error -> result.complete(error) }
                if (result.await() != null) return DeviceResult.Failed("Task saved. Some upcoming reminders couldn't be scheduled. Try refreshing the reminder.")
            }
            return DeviceResult.Success(Unit)
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { return DeviceResult.Failed("Task saved. The reminder couldn't be scheduled. Try again.") }
    }
    override suspend fun cancelReminder(id: String) {
        val pending = CompletableDeferred<List<UNNotificationRequest>>()
        notifications.getPendingNotificationRequestsWithCompletionHandler { pending.complete(it.orEmpty().filterIsInstance<UNNotificationRequest>()) }
        val ids = pending.await().filter { it.identifier == "barklog-$id" || it.identifier.startsWith("barklog-$id-") }.map { it.identifier }
        notifications.removePendingNotificationRequestsWithIdentifiers(ids)
        val delivered = CompletableDeferred<List<UNNotification>>()
        notifications.getDeliveredNotificationsWithCompletionHandler { delivered.complete(it.orEmpty().filterIsInstance<UNNotification>()) }
        notifications.removeDeliveredNotificationsWithIdentifiers(delivered.await().filter { it.request.identifier == "barklog-$id" || it.request.identifier.startsWith("barklog-$id-") }.map { it.request.identifier })
    }
    override fun dial(number: String): Boolean {
        if (number.isBlank() || number.length > 40 || number.any { !it.isDigit() && it !in "+()- ." }) return false
        val url = NSURL.URLWithString("tel:" + number.filter { it.isDigit() || it == '+' }) ?: return false
        UIApplication.sharedApplication.openURL(url, emptyMap<Any?, Any>(), null); return true
    }
    override fun openSource(url: String): Boolean {
        if (!url.startsWith("https://")) return false
        val target = NSURL.URLWithString(url) ?: return false
        UIApplication.sharedApplication.openURL(target, emptyMap<Any?, Any>(), null); return true
    }
    private fun ByteArray.data(): NSData = if (isEmpty()) NSData() else usePinned { NSData.dataWithBytes(it.addressOf(0), size.toULong()) }
}
