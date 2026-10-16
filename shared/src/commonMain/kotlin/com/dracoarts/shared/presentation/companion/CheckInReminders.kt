package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.CareRepository
import com.dracoarts.shared.services.*
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

/** Only tasks created by this setup are reconciled. Existing medication/task opt-ins stay separate. */
internal suspend fun reconcileCheckIns(dog: Dog,repository: CareRepository,platform: AppPlatform): String? {
    val context=dog.details.companion;val existing=repository.observeItems(dog.id).first();val today=JournalDates.day(platform.nowMillis(),platform.timeZone())
    var failure:String?=null
    for(day in 1..7) {
        val id="checkin-${dog.id}-$day";val old=existing.firstOrNull {it.id==id}
        val enabled=context.notifications&&context.dailyReminder&&day in context.reminderDays
        if(!enabled&&old==null)continue
        try {
            if(!enabled) {
                val previous=old!!.data as CareItemData.Task
                repository.saveItem(dog.id,id,old.occurredAt,previous.copy(remind=false),old.revision)
                platform.device.cancelReminder(id)
                continue
            }
            var date=today
            while(date.dayOfWeek.isoDayNumber!=day || JournalDates.parseInput(date.toString(),context.reminderTime,platform.timeZone(),-1)<=platform.nowMillis())date=date.plus(1,DateTimeUnit.DAY)
            val data=CareItemData.Task("Care check-in",date.toString(),context.reminderTime,platform.timeZone().id,"Custom",Repeat.Weekly,"A moment to record care.",enabled)
            val saved=repository.saveItem(dog.id,id,platform.nowMillis(),data,old?.revision)
            if(enabled) {
                val times=CareSchedule.upcoming(data,platform.nowMillis(),emptySet())
                if(times.isNotEmpty()) when(val result=platform.device.scheduleReminder(ReminderRequest(saved.id,dog.id,times.first(),Repeat.Weekly,data.zoneId,times))) {is DeviceResult.Success->Unit;else->failure="Dog saved. A check-in couldn't be scheduled; open notification settings to retry."}
            } else platform.device.cancelReminder(id)
        }catch(cancelled:CancellationException){throw cancelled}
        catch(_:Exception){failure="Dog saved. Some check-ins couldn't be updated. Retry from the reminder setup."}
    }
    return failure
}
