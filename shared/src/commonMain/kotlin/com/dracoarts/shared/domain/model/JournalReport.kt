@file:OptIn(kotlin.time.ExperimentalTime::class)
package com.dracoarts.shared.domain.model

import kotlinx.datetime.*
import kotlin.time.Instant

data class ReportSnapshot(val dog: Dog, val from: LocalDate, val through: LocalDate, val zone: TimeZone, val events: List<CareEvent>, val items: List<CareItem>, val preparedAt: Long)

object JournalReport {
    fun details(value: CareDetails?): String = when (value) {
        is CareDetails.Poop -> value.consistency?.label.orEmpty()
        is CareDetails.Pee -> value.amount?.label.orEmpty()
        is CareDetails.Meal -> listOfNotNull(value.food, value.portion).joinToString(" · ")
        is CareDetails.Walk -> value.durationMinutes?.let { "$it minutes" }.orEmpty()
        is CareDetails.Symptom -> value.observation
        is CareDetails.Behavior -> value.observation
        is CareDetails.Mood -> value.observedMood.label
        is CareDetails.Grooming -> value.activity.label
        is CareDetails.Weight -> "${value.amount} ${value.unit.label}"
        is CareDetails.Medication -> "${value.name} · ${value.amount} · recorded as given"
        is CareDetails.Training -> "${TrainingCatalog.programs.firstOrNull { it.id == value.programId }?.title ?: value.programId} · ${value.seconds} seconds · ${value.rating} · ${value.mood}"
        is CareDetails.Task -> "${value.title} · completed for ${value.dueDate}"
        null -> ""
    }
    fun csvCell(value: String): String {
        val unsafe = value.trimStart().firstOrNull() in listOf('=', '+', '-', '@') || value.firstOrNull() in listOf('\t', '\r', '\n')
        val safe = if (unsafe) "'$value" else value
        return "\"${safe.replace("\"", "\"\"")}\""
    }
    fun csv(report: ReportSnapshot): String {
        fun row(values: List<String>) = values.joinToString(",", transform = ::csvCell)
        val rows = mutableListOf(row(listOf("record_id", "dog_id", "dog_name", "record_type", "occurred_at_utc", "local_date_time", "timezone", "details", "notes", "amount", "currency", "location", "recorded_by", "observations", "photo_reference")))
        report.events.forEach { event -> rows += row(listOf(event.id, report.dog.id, report.dog.name, event.type.key,
            Instant.fromEpochMilliseconds(event.occurredAtMillis).toString(), Instant.fromEpochMilliseconds(event.occurredAtMillis).toLocalDateTime(report.zone).toString(), report.zone.id, details(event.details), event.note.orEmpty(), "", "",
            event.context.location, event.context.caregiver, event.context.observations.entries.joinToString(" · ") { "${it.key}: ${it.value}" }, if (event.context.photoId != null) "Local attachment recorded" else "")) }
        report.items.forEach { item ->
            val data = item.data
            val fact = when (data) {
                is CareItemData.Expense -> listOf(data.description, data.category, data.date).filter(String::isNotBlank).joinToString(" · ")
                is CareItemData.Vaccination -> "${data.name} · ${data.date} · ${data.provider}${if (data.dueDate.isNotBlank()) " · due date noted ${data.dueDate}" else ""}"
                is CareItemData.Photo -> "${data.title} · ${data.date} · ${data.category} · ${data.bodyArea} · local photo reference"
                is CareItemData.Medication -> "${data.name} · ${data.amount} · ${data.frequency} · ${data.time} · starts ${data.startDate} · ${data.directions}"
                else -> null
            }
            if (fact != null) rows += row(listOf(item.id, report.dog.id, report.dog.name, if (data is CareItemData.Medication) "current_medication_plan" else data.kind,
                Instant.fromEpochMilliseconds(item.occurredAt).toString(), Instant.fromEpochMilliseconds(item.occurredAt).toLocalDateTime(report.zone).toString(), report.zone.id, fact,
                when (data) { is CareItemData.Expense -> data.notes; is CareItemData.Photo -> data.notes; is CareItemData.Vaccination -> data.notes; else -> "" },
                (data as? CareItemData.Expense)?.let { Money.format(it.minorUnits, it.currency) }.orEmpty(), (data as? CareItemData.Expense)?.currency.orEmpty(), "", "", "", if (data is CareItemData.Photo || (data is CareItemData.Expense && data.receiptId != null)) "Local photo reference recorded" else ""))
        }
        return rows.joinToString("\r\n", postfix = "\r\n")
    }
    fun lines(report: ReportSnapshot): List<String> = buildList {
        add("Dog: ${report.dog.name}")
        add("Care range: ${report.from} through ${report.through} · ${report.zone.id}")
        add("Prepared: ${Instant.fromEpochMilliseconds(report.preparedAt)}")
        add("Caregiver-entered observations, plus current recorded medication plans. This is not a diagnosis or treatment recommendation.")
        add("")
        add("${report.events.size} care records in this range")
        report.events.forEach { event ->
            add("${Instant.fromEpochMilliseconds(event.occurredAtMillis).toLocalDateTime(report.zone)} · ${event.type.label}")
            details(event.details).takeIf { it.isNotBlank() }?.let(::add)
            event.note?.let { add("Note: $it") }
            if (event.context.location.isNotBlank()) add("Location: ${event.context.location}")
            if (event.context.caregiver.isNotBlank()) add("Recorded by: ${event.context.caregiver}")
            event.context.observations.forEach { (label, value) -> add("$label: $value") }
            if (event.context.photoId != null) add("A local photo attachment is recorded.")
            add("Record ${event.id} · revision ${event.revision}")
            add("")
        }
        report.items.forEach { item -> when (val data = item.data) {
            is CareItemData.Medication -> add("Current recorded plan: ${data.name} · ${data.amount} · ${data.frequency} · ${data.time} · starts ${data.startDate}. ${data.directions}")
            is CareItemData.Vaccination -> { add("Vaccination: ${data.name} · ${data.date} · ${data.provider}"); if (data.dueDate.isNotBlank()) add("Caregiver-entered due date: ${data.dueDate}"); if (data.notes.isNotBlank()) add(data.notes) }
            is CareItemData.Expense -> { add("Expense: ${data.description} · ${data.currency} ${Money.format(data.minorUnits, data.currency)} · ${data.date} · ${data.category}"); if (data.notes.isNotBlank()) add(data.notes); if (data.receiptId != null) add("Local receipt attachment recorded.") }
            is CareItemData.Photo -> { add("Photo reference: ${data.title} · ${data.date} · ${data.category}"); if (data.notes.isNotBlank()) add(data.notes) }
            else -> Unit
        } }
    }
}

data class JournalFacts(val total: Int, val recordedDays: Int, val perType: Map<CareEventType, Int>, val perDay: Map<LocalDate, Int>) {
    companion object {
        fun from(events: List<CareEvent>, zone: TimeZone): JournalFacts {
            val days = events.groupingBy { Instant.fromEpochMilliseconds(it.occurredAtMillis).toLocalDateTime(zone).date }.eachCount()
            return JournalFacts(events.size, days.size, events.groupingBy { it.type }.eachCount(), days)
        }
    }
}
