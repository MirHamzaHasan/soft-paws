package com.draco.arts.apps.bark.log.dogs.journal

import android.Manifest
import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.content.ContextCompat
import com.dracoarts.shared.data.local.AndroidJournalDriverFactory
import com.dracoarts.shared.data.local.SqlDelightJournalRepository
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.services.ReminderRequest
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import java.util.UUID

object AndroidReminders {
    private const val CHANNEL = "barklog_care"
    private fun pending(context: Context, id: String, dogId: String = ""): PendingIntent = PendingIntent.getBroadcast(context, 0,
        Intent(context, CareReminderReceiver::class.java).setData(Uri.parse("barklog-reminder:$id")).putExtra("task", id).putExtra("dog", dogId), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    fun schedule(context: Context, request: ReminderRequest) {
        require(request.atMillis > System.currentTimeMillis()) { "Choose a future reminder time." }
        if (Build.VERSION.SDK_INT >= 26) context.getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel(CHANNEL, "Care reminders", NotificationManager.IMPORTANCE_DEFAULT).apply { description = "Reminders you explicitly enabled for local care tasks" })
        // Approximate timing avoids special exact-alarm access. Task saving never depends on this.
        context.getSystemService(AlarmManager::class.java).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, request.atMillis, pending(context, request.id, request.dogId))
    }
    fun cancel(context: Context, id: String) {
        val intent = pending(context, id); context.getSystemService(AlarmManager::class.java).cancel(intent); intent.cancel()
        context.getSystemService(NotificationManager::class.java).cancel(id, 1)
    }
    fun notify(context: Context, taskId: String, dogId: String) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        val tap = PendingIntent.getActivity(context, 0, Intent(context, MainActivity::class.java).setData(Uri.parse("barklog-task:$taskId"))
            .putExtra("reminder_dog", dogId).putExtra("reminder_task", taskId).putExtra("reminder_time", System.currentTimeMillis()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(context, CHANNEL) else Notification.Builder(context)
        context.getSystemService(NotificationManager::class.java).notify(taskId, 1, builder.setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Care reminder").setContentText("A task is due. Open BarkLog to view it.").setContentIntent(tap).setAutoCancel(true).setVisibility(Notification.VISIBILITY_PRIVATE).build())
    }
}

class CareReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val token = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            val repository = SqlDelightJournalRepository(AndroidJournalDriverFactory(context), { UUID.randomUUID().toString() }, System::currentTimeMillis)
            try {
                withTimeout(20_000) {
                    repository.initialize()
                    val now = System.currentTimeMillis()
                    val requested = intent.getStringExtra("task")
                    repository.observeDogs().first().forEach { dog ->
                        val items = repository.observeItems(dog.id).first()
                        items.filter { it.data is CareItemData.Task }.forEach { item ->
                            val task = item.data as CareItemData.Task
                            val completed = items.mapNotNull { (it.data as? CareItemData.Completion)?.takeIf { it.taskId == item.id }?.dueDate }.toSet()
                            if (requested == item.id && task.remind) {
                                val zone = kotlinx.datetime.TimeZone.of(task.zoneId)
                                val date = com.dracoarts.shared.presentation.state.JournalDates.day(now, zone)
                                if (CareSchedule.occurs(task, date) && date.toString() !in completed) AndroidReminders.notify(context, item.id, dog.id)
                            }
                            if (task.remind && (requested == null || requested == item.id)) CareSchedule.next(task, now, completed)?.let { (_, time) -> AndroidReminders.schedule(context, ReminderRequest(item.id, dog.id, time, task.repeat, task.zoneId)) }
                        }
                    }
                }
            } catch (_: Exception) { /* No journal reset or background permission request. Reconcile on next foreground. */ }
            finally { withContext(NonCancellable) { runCatching { repository.close() }; token.finish() } }
        }
    }
}
