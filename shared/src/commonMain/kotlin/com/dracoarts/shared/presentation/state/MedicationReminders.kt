package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.withTimeoutOrNull

/** Called after a local commit; notification failure never changes the saved plan. */
object MedicationReminders {
    suspend fun refresh(item: CareItem, device: DeviceServices, now: Long, ask: Boolean = false): String {
        try {
            val task = CareReminderSchedule.task(item.data)
            if (task == null) { device.cancelReminder(item.id); return "Plan saved. No reminder is enabled for this plan." }
            val times = CareSchedule.upcoming(task, now)
            if (times.isEmpty()) { device.cancelReminder(item.id); return "Plan saved. This chosen schedule has no future reminder." }
            val request = ReminderRequest(item.id, item.dogId, times.first(), task.repeat, task.zoneId, times)
            val result = if (ask) device.scheduleReminder(request, true) else withTimeoutOrNull(5_000) { device.scheduleReminder(request) }
                ?: DeviceResult.Failed("The reminder service took too long; try again from this plan.")
            return when (result) {
                is DeviceResult.Success -> "Plan saved. The chosen reminder was scheduled on this device."
                DeviceResult.Denied -> "Plan saved. Notifications are off; enable them if you want this reminder."
                DeviceResult.Cancelled -> "Plan saved. No notification permission was added."
                is DeviceResult.Failed -> "Plan saved. ${result.message.removePrefix("Task saved. ")}"
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { return "Plan saved. The reminder could not be updated; try again from this plan." }
    }
}
