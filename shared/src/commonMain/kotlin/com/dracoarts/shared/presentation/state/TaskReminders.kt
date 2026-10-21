package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.withTimeoutOrNull

object TaskReminders {
    suspend fun refresh(item: CareItem, items: List<CareItem>, device: DeviceServices, now: Long, ask: Boolean = false): String {
        try {
            val task = CareReminderSchedule.task(item.data)
            if (task == null) { device.cancelReminder(item.id); return "Task saved. No reminder is enabled." }
            val times = CareSchedule.upcoming(task, now, CareReminderSchedule.completed(item, items))
            if (times.isEmpty()) { device.cancelReminder(item.id); return "Task saved. No future occurrence needs a reminder." }
            val request = ReminderRequest(item.id, item.dogId, times.first(), task.repeat, task.zoneId, times)
            val result = if (ask) device.scheduleReminder(request, true) else withTimeoutOrNull(5_000) { device.scheduleReminder(request) }
                ?: DeviceResult.Failed("The reminder service took too long. Try again from this task.")
            return when (result) {
                is DeviceResult.Success -> "The chosen reminder was scheduled on this device."
                DeviceResult.Denied -> "Notifications are off. Your task stays saved."
                DeviceResult.Cancelled -> "No notification permission was added. Your task stays saved."
                is DeviceResult.Failed -> "Task saved. ${result.message.removePrefix("Task saved. ")}"
            }
        } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { return "Task saved. The reminder could not be updated; try again from this task." }
    }
}
