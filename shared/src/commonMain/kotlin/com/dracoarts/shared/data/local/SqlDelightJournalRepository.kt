package com.dracoarts.shared.data.local

import app.cash.sqldelight.db.QueryResult
import app.cash.sqldelight.db.SqlDriver
import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.domain.model.Dog
import com.dracoarts.shared.domain.model.CareDetails
import com.dracoarts.shared.domain.model.CareEventInput
import com.dracoarts.shared.domain.model.CareEventRules
import com.dracoarts.shared.domain.model.TimelineFilter
import com.dracoarts.shared.domain.model.TimelinePage
import com.dracoarts.shared.domain.model.JournalSummary
import com.dracoarts.shared.domain.model.RecordConflictException
import com.dracoarts.shared.domain.model.RecordNotFoundException
import com.dracoarts.shared.domain.model.CareItem
import com.dracoarts.shared.domain.model.CareItemData
import com.dracoarts.shared.domain.model.LocalAttachmentRules
import com.dracoarts.shared.domain.model.CareItemRules
import com.dracoarts.shared.domain.model.DogDetails
import com.dracoarts.shared.domain.model.ObservationContext
import com.dracoarts.shared.domain.model.kind
import com.dracoarts.shared.domain.repository.CareRepository
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.domain.repository.DeviceCleanup
import com.dracoarts.shared.domain.repository.DraftSource
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import com.dracoarts.shared.domain.repository.JournalRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/** SQLite is the source of truth. Only committed snapshots invalidate observable reads. */
class SqlDelightJournalRepository(
    private val factory: JournalDriverFactory,
    private val newId: () -> String,
    private val nowMillis: () -> Long,
    private val diskDispatcher: CoroutineDispatcher = Dispatchers.Default,
) : JournalRepository, CareRepository, com.dracoarts.shared.domain.repository.LocalDocumentRepository {
    private val mutex = Mutex()
    private var driver: SqlDriver? = null
    private var database: BarkLogDatabase? = null
    private val dogs = MutableStateFlow<List<Dog>>(emptyList())
    private val revision = MutableStateFlow(0L)
    private val detailsJson = Json { classDiscriminator = "kind" }
    private val strings = ListSerializer(String.serializer())

    suspend fun initialize() = withContext(diskDispatcher) {
        mutex.withLock {
            if (database != null) return@withLock
            val opened = factory.open()
            try {
                check(pragma(opened, "user_version") == JournalSchema.version.toString()) { "Unsupported journal version." }
                check(pragma(opened, "quick_check") == "ok") { "Journal integrity check failed." }
                check(pragma(opened, "foreign_key_check") == null) { "Journal contains an invalid reference." }
                val db = BarkLogDatabase(opened)
                val metadata = db.journalQueries.metadata().executeAsOne()
                check(metadata.format == "barklog-kmp" && metadata.format_version == 1L) { "Unsupported journal format." }
                val context = currentCoroutineContext()
                db.transaction {
                    if (db.journalQueries.owner().executeAsOneOrNull() == null) {
                        db.journalQueries.insertOwner(validId(newId()), validTimestamp(nowMillis()))
                    }
                    context.ensureActive()
                }
                val savedDogs = db.journalQueries.allDogs().executeAsList().map(::toDog)
                database = db
                driver = opened
                dogs.value = savedDogs
            } catch (cause: Throwable) {
                try { opened.close() } catch (cleanup: Throwable) { if (cleanup !== cause) cause.addSuppressed(cleanup) }
                throw cause
            }
        }
    }

    suspend fun close(): Unit = withContext(diskDispatcher) {
        mutex.withLock {
            database = null
            try { driver?.close() } finally { driver = null }
            Unit
        }
    }

    override fun observeDogs(): Flow<List<Dog>> = dogs.asStateFlow()

    override fun observeEvents(dogId: String): Flow<List<CareEvent>> = revision.map {
        withContext(diskDispatcher) {
            mutex.withLock {
                val db = requireDatabase()
                require(db.journalQueries.dogById(dogId).executeAsOneOrNull() != null) { "Dog not found." }
                db.journalQueries.eventsForDog(dogId).executeAsList().map(::toEvent)
            }
        }
    }

    override fun observeEvent(dogId: String, eventId: String): Flow<CareEvent?> = observeRead { queries ->
        queries.eventById(dogId, eventId).executeAsOneOrNull()?.let(::toEvent)
    }

    override fun observeTimeline(filter: TimelineFilter, limit: Int): Flow<TimelinePage> {
        filter.validate()
        require(limit > 0) { "Invalid page size." }
        return observeRead { q ->
            requireDog(q, filter.dogId)
            TimelinePage(q.timeline(filter.dogId, filter.type?.key, filter.fromMillis, filter.untilMillis, limit.toLong()).executeAsList().map(::toEvent),
                q.timelineCount(filter.dogId, filter.type?.key, filter.fromMillis, filter.untilMillis).executeAsOne())
        }
    }

    override fun observeSummary(dogId: String, fromMillis: Long, untilMillis: Long): Flow<JournalSummary> {
        require(fromMillis >= 0 && untilMillis > fromMillis)
        return observeRead { q ->
            requireDog(q, dogId)
            JournalSummary(q.recentEvents(dogId).executeAsList().map(::toEvent),
                q.dailyCounts(dogId, fromMillis, untilMillis).executeAsList().associate { checkNotNull(CareEventType.fromKey(it.type)) to it.event_count.toInt() },
                q.dogEventCount(dogId).executeAsOne(), q.dayEvents(dogId, fromMillis, untilMillis).executeAsList().map(::toEvent))
        }
    }

    private fun <T> observeRead(read: (JournalQueries) -> T): Flow<T> = revision.map {
        withContext(diskDispatcher) { mutex.withLock { val db = requireDatabase(); db.transactionWithResult { read(db.journalQueries) } } }
    }

    override suspend fun addDog(name: String, details: DogDetails, requestId: String?, draftSource: DraftSource?): Dog = withContext(diskDispatcher) {
        val cleanName = validName(name)
        details.validate()
        mutex.withLock {
            currentCoroutineContext().ensureActive()
            val db = requireDatabase()
            val id = validId(requestId ?: newId())
            val old = db.journalQueries.dogById(id).executeAsOneOrNull()?.let(::toDog)
            if (old != null && (old.name != cleanName || old.details != details)) throw RecordConflictException()
            val dog = old ?: Dog(id, cleanName, validTimestamp(nowMillis()), details)
            val context = currentCoroutineContext()
            val savedDogs = db.transactionWithResult {
                val owner = db.journalQueries.owner().executeAsOne()
                if (old == null) db.journalQueries.insertDog(dog.id, owner.id, dog.name, dog.createdAtMillis, detailsJson.encodeToString(DogDetails.serializer(), details))
                draftSource?.let { consumeDraft(db.journalQueries, it.dogId, it.slot) }
                val result = db.journalQueries.allDogs().executeAsList().map(::toDog)
                context.ensureActive()
                result
            }
            dogs.value = savedDogs
            dog
        }
    }

    override suspend fun logEvent(dogId: String, type: CareEventType, occurredAtMillis: Long, note: String?): CareEvent {
        require(type in CareEventType.quickActions) { "Use the detailed form for this observation." }
        return createEvent(dogId, newId(), CareEventInput(type, occurredAtMillis, note))
    }

    override suspend fun createEvent(dogId: String, requestId: String, input: CareEventInput): CareEvent {
        val clean = CareEventRules.normalize(input)
        validId(requestId)
        return mutate { q ->
            requireDog(q, dogId)
            val existing = q.eventByRequestId(requestId).executeAsOneOrNull()?.let(::toEvent)
            if (existing != null) {
                if (existing.dogId != dogId || existing.type != clean.type || existing.occurredAtMillis != clean.occurredAtMillis || existing.note != clean.note || existing.details != clean.details || existing.context != clean.context) throw RecordConflictException()
                consumeDraft(q, dogId, "event-new-${existing.type.key}")
                existing
            } else {
                if (q.itemById(dogId, requestId).executeAsOneOrNull() != null) throw RecordConflictException()
                val event = CareEvent(requestId, dogId, clean.type, clean.occurredAtMillis, validTimestamp(nowMillis()), clean.note, clean.details, context = clean.context)
                q.insertEvent(event.id, dogId, event.type.key, event.occurredAtMillis, event.createdAtMillis, event.note, encodeDetails(event.details), event.updatedAtMillis, encodeContext(event.context))
                consumeDraft(q, dogId, "event-new-${event.type.key}")
                event
            }
        }
    }

    override suspend fun updateEvent(dogId: String, eventId: String, expectedRevision: Long, input: CareEventInput): CareEvent {
        val clean = CareEventRules.normalize(input)
        return mutate { q ->
            val existing = q.eventById(dogId, eventId).executeAsOneOrNull()?.let(::toEvent) ?: throw RecordNotFoundException()
            if (existing.revision != expectedRevision) throw RecordConflictException()
            require(existing.type == clean.type) { "An edit cannot change the event type." }
            val updated = existing.copy(occurredAtMillis = clean.occurredAtMillis, note = clean.note, details = clean.details,
                revision = existing.revision + 1, updatedAtMillis = validTimestamp(nowMillis()), context = clean.context)
            q.updateEvent(updated.occurredAtMillis, updated.note, encodeDetails(updated.details), updated.updatedAtMillis, encodeContext(updated.context), dogId, eventId, expectedRevision)
            if (q.changedRows().executeAsOne() != 1L) throw RecordConflictException()
            existing.context.photoId?.takeUnless { it == updated.context.photoId }?.let { q.queueCleanup("photo", it) }
            consumeDraft(q, dogId, "event-edit-$eventId")
            updated
        }
    }

    override suspend fun deleteEvent(dogId: String, eventId: String, expectedRevision: Long) {
        mutate { q ->
            val existing = q.eventById(dogId, eventId).executeAsOneOrNull()?.let(::toEvent) ?: throw RecordNotFoundException()
            if (existing.revision != expectedRevision) throw RecordConflictException()
            q.deleteEvent(dogId, eventId, expectedRevision)
            if (q.changedRows().executeAsOne() != 1L) throw RecordConflictException()
            existing.context.photoId?.let { q.queueCleanup("photo", it) }
            q.itemById(dogId, eventId).executeAsOneOrNull()?.let(::toItem)?.takeIf { it.data is CareItemData.Administration || it.data is CareItemData.Session || it.data is CareItemData.Completion }?.let { activity -> q.deleteItem(dogId, eventId, activity.revision) }
        }
    }

    override fun observeItems(dogId: String): Flow<List<CareItem>> = observeRead { q ->
        requireDog(q, dogId)
        q.itemsForDog(dogId).executeAsList().map(::toItem)
    }

    override suspend fun saveItem(dogId: String, id: String, occurredAt: Long, data: CareItemData, expectedRevision: Long?, draftSlot: String?): CareItem {
        CareItemRules.validate(data); validId(id); validTimestamp(occurredAt)
        require(data !is CareItemData.Session && data !is CareItemData.Completion && data !is CareItemData.Administration) { "Use the atomic activity save." }
        return mutate { q -> saveItem(q, dogId, id, occurredAt, data, expectedRevision).also { draftSlot?.let { consumeDraft(q, dogId, it) } } }
    }

    private fun saveItem(q: JournalQueries, dogId: String, id: String, occurredAt: Long, data: CareItemData, expectedRevision: Long?): CareItem {
        requireDog(q, dogId)
        val old = q.itemById(dogId, id).executeAsOneOrNull()?.let(::toItem)
        if (old == null && data !is CareItemData.Administration && data !is CareItemData.Session && data !is CareItemData.Completion && q.eventById(dogId, id).executeAsOneOrNull() != null) throw RecordConflictException()
        if (old != null && expectedRevision == null) {
            if (old.occurredAt != occurredAt || old.data != data) throw RecordConflictException()
            return old
        }
        if (expectedRevision != null && (old == null || old.revision != expectedRevision || old.data.kind != data.kind)) throw RecordConflictException()
        val now = validTimestamp(nowMillis())
        val json = detailsJson.encodeToString(CareItemData.serializer(), data).also { require(it.length <= 32768) }
        if (old == null) q.insertItem(id, dogId, data.kind, occurredAt, now, now, json)
        else {
            q.updateItem(occurredAt, now, json, dogId, id, expectedRevision!!)
            if (q.changedRows().executeAsOne() != 1L) throw RecordConflictException()
        }
        if (old != null) photoFiles(old.data).filter { it !in photoFiles(data) }.forEach { q.queueCleanup("photo", it) }
        if (data is CareItemData.Memory) {
            val unchanged = (old?.data as? CareItemData.Memory)?.sourceIds == data.sourceIds
            require(unchanged || data.sourceIds.all { source -> q.eventById(dogId, source).executeAsOneOrNull() != null || (q.itemById(dogId, source).executeAsOneOrNull()?.let(::toItem)?.data is CareItemData.Photo) }) { "A selected source record changed. Choose the highlights again." }
        }
        return CareItem(id, dogId, occurredAt, old?.createdAt ?: now, now, (old?.revision ?: 0) + 1, data)
    }

    override suspend fun recordActivity(dogId: String, id: String, occurredAt: Long, data: CareItemData): CareItem {
        CareItemRules.validate(data); validId(id); validTimestamp(occurredAt)
        return mutate { q ->
            requireDog(q, dogId)
            val existing = q.itemById(dogId, id).executeAsOneOrNull()?.let(::toItem)
            if (existing != null) {
                if (existing.occurredAt != occurredAt || existing.data != data) throw RecordConflictException()
                return@mutate existing
            }
            val details: CareDetails = when (data) {
                is CareItemData.Administration -> {
                    val plan = q.itemById(dogId, data.planId).executeAsOneOrNull()?.let(::toItem)?.data as? CareItemData.Medication ?: throw RecordNotFoundException()
                    if (plan.archived || plan.name != data.name || plan.amount != data.amount) throw RecordConflictException()
                    CareDetails.Medication(data.planId, data.name, data.amount)
                }
                is CareItemData.Session -> {
                    require(q.itemsForDog(dogId).executeAsList().map(::toItem).any { (it.data as? CareItemData.Enrollment)?.programId == data.programId }) { "Enroll before starting a session." }
                    CareDetails.Training(data.programId, data.step, data.seconds, data.rating, data.mood)
                }
                is CareItemData.Completion -> {
                    val task = q.itemById(dogId, data.taskId).executeAsOneOrNull()?.let(::toItem)?.data as? CareItemData.Task ?: throw RecordNotFoundException()
                    require(task.title == data.title) { "This task changed. Open it again before completing." }
                    require(com.dracoarts.shared.domain.model.CareSchedule.occurs(task, kotlinx.datetime.LocalDate.parse(data.dueDate))) { "This date isn't an occurrence of this task." }
                    require(q.itemsForDog(dogId).executeAsList().map(::toItem).none { (it.data as? CareItemData.Completion)?.let { c -> c.taskId == data.taskId && c.dueDate == data.dueDate } == true }) { "This occurrence is already completed." }
                    CareDetails.Task(data.taskId, data.title, data.dueDate)
                }
                else -> error("Not an activity.")
            }
            val type = when (details) { is CareDetails.Medication -> CareEventType.Medication; is CareDetails.Training -> CareEventType.Training; else -> CareEventType.Task }
            val note = (data as? CareItemData.Session)?.notes?.trim()?.takeIf { it.isNotBlank() }
            val item = saveItem(q, dogId, id, occurredAt, data, null)
            q.insertEvent(id, dogId, type.key, occurredAt, item.createdAt, note, encodeDetails(details), item.updatedAt, encodeContext(ObservationContext()))
            item
        }
    }

    override suspend fun deleteItem(item: CareItem) {
        mutate { q ->
            val old = q.itemById(item.dogId, item.id).executeAsOneOrNull()?.let(::toItem) ?: throw RecordNotFoundException()
            if (old.revision != item.revision) throw RecordConflictException()
            q.deleteItem(item.dogId, item.id, item.revision)
            if (q.changedRows().executeAsOne() != 1L) throw RecordConflictException()
            queueItemCleanup(q, old)
        }
    }

    override suspend fun updateDog(dog: Dog, name: String, details: DogDetails, draftSlot: String?): Dog {
        val clean = validName(name); details.validate()
        return mutate { q ->
            val previous = q.dogById(dog.id).executeAsOneOrNull()?.let(::toDog) ?: throw RecordNotFoundException()
            q.updateDog(clean, detailsJson.encodeToString(DogDetails.serializer(), details), dog.id, dog.revision)
            if (q.changedRows().executeAsOne() != 1L) throw RecordConflictException()
            previous.details.photoId?.takeUnless { it == details.photoId }?.let { q.queueCleanup("photo", it) }
            draftSlot?.let { consumeDraft(q, dog.id, it) }
            dog.copy(name = clean, details = details, revision = dog.revision + 1)
        }
    }

    override suspend fun deleteDog(dogId: String) {
        mutate { q -> deleteDog(q, dogId) }
    }

    override suspend fun deleteAll() {
        mutate { q -> q.allDogs().executeAsList().forEach { dog -> deleteDog(q, dog.id) } }
    }

    private fun deleteDog(q: JournalQueries, dogId: String) {
        val dog = q.dogById(dogId).executeAsOneOrNull()?.let(::toDog) ?: throw RecordNotFoundException()
        dog.details.photoId?.let { q.queueCleanup("photo", it) }
        q.dogPhotoContexts(dogId).executeAsList().map { detailsJson.decodeFromString(ObservationContext.serializer(), it) }.mapNotNull { it.photoId }.forEach { q.queueCleanup("photo", it) }
        q.itemsForDog(dogId).executeAsList().map(::toItem).forEach { queueItemCleanup(q, it) }
        q.dogDrafts(dogId).executeAsList().flatMap { detailsJson.decodeFromString(strings, it.photo_ids_json) }.forEach { q.queueCleanup("photo", it) }
        q.deleteDogDocuments(dogId); q.deleteDogDrafts(dogId); q.deleteDogEvents(dogId); q.deleteDogItems(dogId); q.deleteDog(dogId)
    }
    private fun photoFiles(data: CareItemData): List<String> = when (data) { is CareItemData.Photo -> listOf(data.fileId); is CareItemData.Expense -> listOfNotNull(data.receiptId); else -> emptyList() }
    private fun queueItemCleanup(q: JournalQueries, item: CareItem) {
        photoFiles(item.data).forEach { q.queueCleanup("photo", it) }
        if (item.data is CareItemData.Task) q.queueCleanup("reminder", item.id)
    }

    override suspend fun readDocument(id: String): String? = read { it.document(id).executeAsOneOrNull() }
    override suspend fun writeDocument(id: String, value: String, dogId: String?) {
        require(id.length in 1..160 && value.length <= 4194304)
        detailsJson.parseToJsonElement(value)
        mutate(false) { q -> dogId?.let { requireDog(q, it) }; q.saveDocument(id, dogId, value) }
    }
    override suspend fun removeDocuments(prefix: String) {
        require(prefix.length in 1..160)
        mutate(false) { it.deleteDocuments(prefix.length.toString(), prefix) }
    }

    override suspend fun loadDraft(dogId: String, slot: String): LocalDraft? = read { q -> q.draft(dogId, slot).executeAsOneOrNull()?.let { LocalDraft(it.value_json, detailsJson.decodeFromString(strings, it.photo_ids_json)) } }
    override suspend fun saveDraft(dogId: String, slot: String, draft: LocalDraft) {
        require(slot.length in 1..160 && Regex("[a-zA-Z0-9@_-]+").matches(slot))
        require(draft.value.length <= 32768 && draft.photoIds.size <= 20)
        detailsJson.parseToJsonElement(draft.value)
        require(draft.photoIds.all { LocalAttachmentRules.receipt.matches(it) })
        mutate(false) { q ->
            requireDog(q, dogId)
            val old = q.draft(dogId, slot).executeAsOneOrNull()?.let { detailsJson.decodeFromString(strings, it.photo_ids_json) }.orEmpty()
            q.saveDraft(dogId, slot, draft.value, detailsJson.encodeToString(strings, draft.photoIds))
            old.filter { it !in draft.photoIds }.forEach { q.queueCleanup("photo", it) }
        }
    }
    override suspend fun discardDraft(dogId: String, slot: String) {
        mutate(false) { q -> consumeDraft(q, dogId, slot) }
    }
    private fun consumeDraft(q: JournalQueries, dogId: String, slot: String) {
        q.draft(dogId, slot).executeAsOneOrNull()?.let { detailsJson.decodeFromString(strings, it.photo_ids_json) }?.forEach { q.queueCleanup("photo", it) }
        q.discardDraft(dogId, slot)
    }
    override suspend fun pendingCleanup(): List<DeviceCleanup> = read { q -> q.pendingCleanup().executeAsList().map { DeviceCleanup(it.kind, it.reference, it.generation) } }
    override suspend fun acknowledgeCleanup(job: DeviceCleanup) { mutate(false) { it.acknowledgeCleanup(job.kind, job.reference, job.generation) } }
    override suspend fun photoReferenced(fileId: String): Boolean = read { q ->
        q.documentsReferencingPhoto(fileId).executeAsOne() > 0L || q.allDogs().executeAsList().any { toDog(it).details.photoId == fileId } ||
            q.allItems().executeAsList().any { fileId in photoFiles(toItem(it).data) } ||
            q.photoEventContexts(fileId).executeAsList().any { detailsJson.decodeFromString(ObservationContext.serializer(), it).photoId == fileId } ||
            q.allDrafts().executeAsList().any { fileId in detailsJson.decodeFromString(strings, it.photo_ids_json) }
    }
    private suspend fun <T> read(block: (JournalQueries) -> T): T = withContext(diskDispatcher) { mutex.withLock { block(requireDatabase().journalQueries) } }

    private suspend fun <T> mutate(notify: Boolean = true, write: (JournalQueries) -> T): T = withContext(diskDispatcher) {
        mutex.withLock {
            val context = currentCoroutineContext()
            context.ensureActive()
            val db = requireDatabase()
            val result = db.transactionWithResult { val saved = write(db.journalQueries); context.ensureActive(); saved }
            if (notify) { dogs.value = db.journalQueries.allDogs().executeAsList().map(::toDog); revision.value += 1 }
            result
        }
    }

    private fun requireDog(q: JournalQueries, dogId: String) { require(q.dogById(dogId).executeAsOneOrNull() != null) { "Dog not found." } }
    private fun encodeDetails(details: CareDetails?): String? = details?.let { detailsJson.encodeToString(CareDetails.serializer(), it).also { json -> require(json.length <= 8192) } }
    private fun encodeContext(context: ObservationContext): String = detailsJson.encodeToString(ObservationContext.serializer(), context)

    private fun requireDatabase() = checkNotNull(database) { "Journal is not open." }
    private fun toDog(row: Dogs): Dog {
        val details = detailsJson.decodeFromString(DogDetails.serializer(), row.details_json)
        details.validate()
        return Dog(validId(row.id), validName(row.name), validTimestamp(row.created_at), details, row.revision)
    }
    private fun toItem(row: Care_items): CareItem {
        val data = detailsJson.decodeFromString(CareItemData.serializer(), row.data_json)
        check(data.kind == row.kind && row.revision > 0); CareItemRules.validate(data)
        return CareItem(validId(row.id), validId(row.dog_id), validTimestamp(row.occurred_at), validTimestamp(row.created_at), validTimestamp(row.updated_at), row.revision, data)
    }
    private fun toEvent(row: Care_events): CareEvent {
        val type = checkNotNull(CareEventType.fromKey(row.type)) { "Unknown event type." }
        val details = row.details_json?.let { check(it.length <= 8192); detailsJson.decodeFromString(CareDetails.serializer(), it) }
        CareEventRules.validateDetails(type, details)
        check(row.revision >= 1)
        return CareEvent(validId(row.id), validId(row.dog_id), type, validTimestamp(row.occurred_at), validTimestamp(row.created_at),
            row.note, details, row.revision, validTimestamp(row.updated_at), detailsJson.decodeFromString(ObservationContext.serializer(), row.context_json).also { it.validate() })
    }
    private fun validId(id: String): String {
        require(UUID_PATTERN.matches(id)) { "Invalid journal ID." }
        return id
    }
    private fun validTimestamp(value: Long): Long {
        require(value in 0..253402300799999L) { "Invalid timestamp." }
        return value
    }
    private fun validName(name: String): String {
        val clean = name.trim()
        require(clean.length in 1..80 && clean.none { it.isISOControl() }) { "Enter a dog name from 1 to 80 characters." }
        return clean
    }
    private fun pragma(driver: SqlDriver, name: String): String? = driver.executeQuery(null, "PRAGMA $name", { cursor ->
        QueryResult.Value(if (cursor.next().value) cursor.getString(0) else null)
    }, 0).value

    private companion object {
        val UUID_PATTERN = Regex("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    }
}
