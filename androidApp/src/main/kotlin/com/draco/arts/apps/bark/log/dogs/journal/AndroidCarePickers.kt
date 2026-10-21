package com.draco.arts.apps.bark.log.dogs.journal

import android.app.DatePickerDialog
import android.app.Dialog
import android.app.TimePickerDialog
import android.text.format.DateFormat
import androidx.activity.ComponentActivity
import com.dracoarts.shared.services.DeviceResult
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime

/** Native controls edit calendar values; no epoch/time-zone conversion changes a date. */
internal class AndroidCarePickers(private val activity: ComponentActivity) {
    var dark = false
    private val dialogTheme get() = if (dark) android.R.style.Theme_Material_Dialog_Alert else android.R.style.Theme_Material_Light_Dialog_Alert
    private val lock = Mutex()
    private var pending: CompletableDeferred<DeviceResult<String>>? = null
    private var shown: Dialog? = null

    suspend fun date(value: String, title: String) = choose { result ->
        val date = LocalDate.parse(value)
        DatePickerDialog(activity, dialogTheme, { _, year, month, day ->
            result.complete(DeviceResult.Success(LocalDate(year, month + 1, day).toString()))
        }, date.year, date.month.ordinal, date.day).apply { setTitle(title) }
    }

    suspend fun time(value: String, title: String) = choose { result ->
        val time = LocalTime.parse(value)
        TimePickerDialog(activity, dialogTheme, { _, hour, minute ->
            result.complete(DeviceResult.Success("${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}"))
        }, time.hour, time.minute, DateFormat.is24HourFormat(activity)).apply { setTitle(title) }
    }

    private suspend fun choose(make: (CompletableDeferred<DeviceResult<String>>) -> Dialog): DeviceResult<String> = lock.withLock {
        withContext(Dispatchers.Main) {
            if (activity.isFinishing || activity.isDestroyed) return@withContext DeviceResult.Cancelled
            val result = CompletableDeferred<DeviceResult<String>>()
            try {
                val dialog = make(result)
                pending = result; shown = dialog
                dialog.setOnCancelListener { result.complete(DeviceResult.Cancelled) }
                dialog.setOnDismissListener { result.complete(DeviceResult.Cancelled) }
                dialog.show()
                result.await()
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { DeviceResult.Failed("Couldn't open this picker. Your entered value is unchanged.") }
            finally { shown?.dismiss(); shown = null; pending = null }
        }
    }

    fun close() { pending?.cancel(); shown?.dismiss(); shown = null }
}
