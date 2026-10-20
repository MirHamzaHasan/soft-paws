package com.dracoarts.shared.services

import androidx.compose.ui.graphics.ImageBitmap
import com.dracoarts.shared.domain.model.Repeat
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface DeviceResult<out T> {
    data class Success<T>(val value: T) : DeviceResult<T>
    data object Cancelled : DeviceResult<Nothing>
    data object Denied : DeviceResult<Nothing>
    data class Failed(val message: String) : DeviceResult<Nothing>
}

/** One-shot area, rounded before leaving the native adapter; never persisted. */
data class ApproximateArea(val latitude: Double, val longitude: Double, val countryCode: String = "") {
    val searchPlace get() = "$latitude,$longitude"
}

enum class ExportFormat { CSV, PDF }
data class ExportImage(val fileId: String, val caption: String)
data class ExportDocument(val filename: String, val format: ExportFormat, val title: String, val lines: List<String>, val csv: String = "", val images: List<ExportImage> = emptyList())
data class PreparedExport(val filename: String, val format: ExportFormat, val title: String)
data class ReminderRequest(val id: String, val dogId: String, val atMillis: Long, val repeat: Repeat = Repeat.None, val zoneId: String = "UTC", val occurrences: List<Long> = listOf(atMillis))
data class ReminderTarget(val dogId: String, val taskId: String, val occurredAtMillis: Long? = null)
data class DeviceFrameBounds(val left: Int, val top: Int, val width: Int, val height: Int)
private val foregroundDefault = MutableStateFlow(true).asStateFlow()

interface DeviceServices {
    /** Ephemeral app-window pixels for navigation. Never stored, uploaded or used as journal data. */
    suspend fun captureFrame(bounds: DeviceFrameBounds): ImageBitmap? = null
    val foreground: StateFlow<Boolean> get() = foregroundDefault
    fun close() = Unit
    fun updateAppearance(dark: Boolean, followSystem: Boolean) = Unit
    val reminderOpens: StateFlow<ReminderTarget?>
    fun consumedReminder()
    suspend fun notificationAccess(request: Boolean = false): DeviceResult<Unit> = DeviceResult.Failed("Notification access isn't available in this host.")
    suspend fun takePhoto(): DeviceResult<String> = DeviceResult.Failed("Camera capture isn't available in this host. Choose a photo instead.")
    suspend fun pickPhoto(): DeviceResult<String>
    suspend fun pickReceipt(): DeviceResult<String> = pickPhoto()
    suspend fun shareAttachment(fileId: String): DeviceResult<Unit> = DeviceResult.Failed("Couldn't open this local attachment.")
    fun suggestedCountry(): String = ""
    suspend fun currentArea(): DeviceResult<ApproximateArea> = DeviceResult.Failed("Location isn't available. Enter a city instead.")
    fun openSettings(): Boolean = false
    suspend fun photoBytes(fileId: String): ByteArray?
    suspend fun removePhoto(fileId: String)
    suspend fun prepareExport(document: ExportDocument): DeviceResult<PreparedExport> = DeviceResult.Failed("Couldn't prepare this local file.")
    suspend fun sharePrepared(document: PreparedExport, print: Boolean = false): DeviceResult<Unit> = DeviceResult.Failed("Couldn't open the native share sheet.")
    suspend fun share(document: ExportDocument, print: Boolean = false): DeviceResult<Unit> = when (val prepared = prepareExport(document)) {
        is DeviceResult.Success -> sharePrepared(prepared.value, print)
        DeviceResult.Cancelled -> DeviceResult.Cancelled
        DeviceResult.Denied -> DeviceResult.Denied
        is DeviceResult.Failed -> prepared
    }
    suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean = false): DeviceResult<Unit>
    suspend fun cancelReminder(id: String)
    fun dial(number: String): Boolean
    fun openSource(url: String): Boolean
}

expect fun decodeLocalPhoto(bytes: ByteArray): ImageBitmap?

expect fun decodeHighlightPhoto(bytes: ByteArray, maxDimension: Int): ImageBitmap?
