package com.dracoarts.shared.presentation.review

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** One-shot faults, enabled only by App's Debug + separate-database review gate.
 * Every successful read/write still goes through the real SQLite repositories.
 * Retrying never resets data, rewinds a fixture or invents a successful operation.
 */
class BoardReviewFaults(val screen: String?) {
    private val consumed = mutableSetOf<String>()
    private val lock = Mutex()
    private var armed = false
    fun arm() { armed = true }
    private suspend fun once(key: String, enabled: Boolean = armed): Boolean = lock.withLock { enabled && consumed.add(key) }

    val startupModule: AppModule = object : AppModule {
        override val id = "owned-board-review-startup"
        override val priority = -200
        override val required = true
        override suspend fun initialize() {
            if (screen == "startup-loading" && once("startup-delay", true)) delay(12_000)
            if (screen == "startup-retry" && once("startup-failure", true)) error("Owned QA startup fault")
        }
    }

    fun repository(journal: JournalRepository, care: CareRepository): ReviewRepository = ReviewRepository(journal, care)
    inner class ReviewRepository(private val journal: JournalRepository, private val care: CareRepository) : JournalRepository by journal, CareRepository by care {
        override fun observeDogs(): Flow<List<Dog>> = flow {
            if (screen == "journal-error" && once("dogs-read")) error("Owned QA read fault")
            emitAll(journal.observeDogs())
        }
        override fun observeSummary(dogId: String, fromMillis: Long, untilMillis: Long): Flow<JournalSummary> = flow {
            if (screen == "home-loading" && once("summary-delay")) delay(12_000)
            emitAll(journal.observeSummary(dogId, fromMillis, untilMillis))
        }
        override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent {
            if (screen == "save-error" && once("event-write")) error("Owned QA write fault")
            if (screen == "saving-state" && once("event-delay")) delay(6_000)
            return journal.createEvent(dogId, requestId, input)
        }
        override suspend fun updateEvent(dogId: String, eventId: String, expectedRevision: Long, input: CareEventInput): CareEvent {
            if (screen == "stale-record" && once("event-revision")) {
                val old = journal.observeEvent(dogId, eventId).first() ?: throw RecordNotFoundException()
                journal.updateEvent(dogId, eventId, old.revision, CareEventInput(old.type, old.occurredAtMillis, "A newer owned QA observation", old.details, old.context))
            }
            return journal.updateEvent(dogId, eventId, expectedRevision, input)
        }
        override suspend fun recordActivity(dogId: String, id: String, occurredAt: Long, data: CareItemData): CareItem {
            if (screen == "medication-save-error" && data is CareItemData.Administration && once("administration-write")) error("Owned QA administration fault")
            return care.recordActivity(dogId, id, occurredAt, data)
        }
    }

    suspend fun trainingPrograms(): List<TrainingProgram> {
        if (screen == "training-error" && once("catalog-error")) error("Owned QA catalog fault")
        if (screen == "training-empty" && once("catalog-empty")) return emptyList()
        return TrainingCatalog.programs
    }

    fun platform(base: AppPlatform): AppPlatform = object : AppPlatform by base {
        override val device = object : DeviceServices by base.device {
            override suspend fun prepareExport(document: ExportDocument): DeviceResult<PreparedExport> {
                if (screen in setOf("export-failure", "cat-export-failure") && once("export-write")) return DeviceResult.Failed("Couldn't prepare the file. Your records stay saved. Try again.")
                if (screen == "export-progress" && once("export-delay")) delay(6_000)
                return base.device.prepareExport(document)
            }
            override suspend fun scheduleReminder(request: ReminderRequest, requestPermission: Boolean): DeviceResult<Unit> {
                if (requestPermission && screen in setOf("reminder-denied", "permission-denied") && once("reminder-denial")) return DeviceResult.Denied
                if (screen == "reminder-failure" && once("reminder-failure")) return DeviceResult.Failed("The task is saved. The owned QA scheduler could not schedule its notification.")
                return base.device.scheduleReminder(request, requestPermission)
            }
            override suspend fun pickPhoto(): DeviceResult<String> {
                if (screen == "photo-permission-denied" && once("photo-denial")) return DeviceResult.Denied
                if (screen == "photo-unavailable" && once("photo-cancel")) return DeviceResult.Cancelled
                return base.device.pickPhoto()
            }
        }
    }
}
