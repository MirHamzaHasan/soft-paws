package com.dracoarts.shared.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime
import kotlinx.datetime.TimeZone

/** Typed local records share transaction/revision mechanics, never UI preferences. */
@Serializable
sealed interface CareItemData {
    @Serializable @SerialName("medication") data class Medication(
        val name: String, val amount: String, val directions: String = "", val frequency: String = "As directed",
        val startDate: String, val time: String = "20:00", val archived: Boolean = false,
        val reminder: MedicationReminder? = null,
    ) : CareItemData
    @Serializable @SerialName("administration") data class Administration(val planId: String, val name: String, val amount: String,
        val instructions: String = "", val planRevision: Long? = null) : CareItemData
    @Serializable @SerialName("vaccination") data class Vaccination(
        val name: String, val date: String, val provider: String = "", val notes: String = "", val dueDate: String = "",
        val documentId: String? = null,
    ) : CareItemData
    @Serializable @SerialName("task") data class Task(
        val title: String, val date: String, val time: String, val zoneId: String,
        val category: String = "Custom", val repeat: Repeat = Repeat.None, val notes: String = "", val remind: Boolean = false,
    ) : CareItemData
    @Serializable @SerialName("completion") data class Completion(val taskId: String, val title: String, val dueDate: String) : CareItemData
    @Serializable @SerialName("enrollment") data class Enrollment(val programId: String) : CareItemData
    @Serializable @SerialName("session") data class Session(
        val programId: String, val step: Int, val seconds: Int, val rating: String, val mood: String, val notes: String = "", val responses: Int = 0,
    ) : CareItemData
    @Serializable @SerialName("photo") data class Photo(
        val fileId: String, val title: String, val date: String, val category: String = "Everyday", val bodyArea: String = "", val notes: String = "",
    ) : CareItemData
    @Serializable @SerialName("expense") data class Expense(
        val minorUnits: Long, val currency: String, val category: String, val date: String, val notes: String = "", val receiptId: String? = null, val description: String = "",
    ) : CareItemData
    @Serializable @SerialName("memory") data class Memory(val sourceIds: List<String>, val caption: String = "") : CareItemData
}

@Serializable enum class Repeat { None, Daily, Weekly, Monthly }

/** A caregiver-chosen notification schedule, never derived from medication text. */
@Serializable data class MedicationReminder(val time: String, val zoneId: String, val repeat: Repeat = Repeat.Daily)

data class CareItem(val id: String, val dogId: String, val occurredAt: Long, val createdAt: Long, val updatedAt: Long, val revision: Long, val data: CareItemData)

val CareItemData.kind: String get() = when (this) {
    is CareItemData.Medication -> "medication"; is CareItemData.Vaccination -> "vaccination"
    is CareItemData.Administration -> "administration"
    is CareItemData.Task -> "task"; is CareItemData.Completion -> "completion"
    is CareItemData.Enrollment -> "enrollment"; is CareItemData.Session -> "session"
    is CareItemData.Photo -> "photo"; is CareItemData.Expense -> "expense"; is CareItemData.Memory -> "memory"
}

object CareItemRules {
    fun validate(data: CareItemData) {
        fun text(value: String, max: Int = 2000, required: Boolean = false) {
            require(value.length <= max && (!required || value.isNotBlank()) && value.none { it == '\u0000' }) { "Enter a value of ${if (required) "1" else "0"}–$max characters." }
        }
        fun date(value: String) { require(Regex("\\d{4}-\\d{2}-\\d{2}").matches(value)); LocalDate.parse(value) }
        fun file(value: String) { require(Regex("[a-zA-Z0-9-]+\\.(jpg|png|jpeg)").matches(value)) { "Invalid local photo." } }
        when (data) {
            is CareItemData.Medication -> {
                text(data.name, 120, true); text(data.amount, 60); text(data.directions, 500)
                require(data.amount.isNotBlank() || data.directions.isNotBlank()) { "Add the prescribed instructions." }
                text(data.frequency, 100, true); date(data.startDate); if (data.time.isNotBlank()) LocalTime.parse(data.time)
                data.reminder?.let { LocalTime.parse(it.time); TimeZone.of(it.zoneId) }
            }
            is CareItemData.Administration -> {
                text(data.planId, 80, true); text(data.name, 120, true); text(data.amount, 60); text(data.instructions, 500)
                require(data.amount.isNotBlank() || data.instructions.isNotBlank()) { "Recorded instructions are missing." }
                require(data.planRevision == null || data.planRevision > 0)
            }
            is CareItemData.Vaccination -> { text(data.name, 120, true); date(data.date); text(data.provider, 160); text(data.notes); if (data.dueDate.isNotBlank()) date(data.dueDate); data.documentId?.let { require(LocalAttachmentRules.receipt.matches(it)) { "Invalid local vaccination document." } } }
            is CareItemData.Task -> { text(data.title, 160, true); date(data.date); LocalTime.parse(data.time); TimeZone.of(data.zoneId); text(data.category, 60, true); text(data.notes) }
            is CareItemData.Completion -> { text(data.taskId, 80, true); text(data.title, 160, true); date(data.dueDate) }
            is CareItemData.Enrollment -> require(data.programId in TrainingCatalog.programs.map { it.id }) { "Program not found." }
            is CareItemData.Session -> { require(data.programId in TrainingCatalog.programs.map { it.id }); require(data.step >= 0 && data.step < TrainingCatalog.programs.first { it.id == data.programId }.steps.size); require(data.seconds in 1..7200 && data.responses in 0..10000); require(data.rating in listOf("Easy", "Getting there", "Try again")); text(data.mood, 60, true); text(data.notes) }
            is CareItemData.Photo -> { file(data.fileId); text(data.title, 240, true); date(data.date); text(data.category, 60, true); text(data.bodyArea, 120); text(data.notes) }
            is CareItemData.Expense -> { require(data.minorUnits in 1..999_999_999_999L); require(data.currency in Money.currencies); text(data.category, 60, true); date(data.date); text(data.notes); text(data.description, 160); data.receiptId?.let { require(LocalAttachmentRules.receipt.matches(it)) { "Invalid local receipt." } } }
            is CareItemData.Memory -> { require(data.sourceIds.size in 1..100 && data.sourceIds.distinct().size == data.sourceIds.size); data.sourceIds.forEach { text(it, 80, true) }; text(data.caption, 500) }
        }
    }
}

object Money {
    val currencies = listOf("USD", "EUR", "GBP", "PKR", "INR", "AUD", "CAD", "JPY", "CHF", "AED", "SAR", "KWD", "BHD")
    fun digits(currency: String): Int { require(currency in currencies); return when (currency) { "JPY" -> 0; "KWD", "BHD" -> 3; else -> 2 } }
    fun parse(value: String, currency: String): Long {
        val digits = digits(currency)
        require(Regex(if (digits == 0) "\\d{1,12}" else "\\d{1,12}(\\.\\d{1,$digits})?").matches(value.trim())) { "Enter a positive amount with at most $digits decimal places." }
        val parts = value.trim().split('.')
        val amount = (parts[0] + parts.getOrElse(1) { "" }.padEnd(digits, '0')).toLongOrNull()
        require(amount != null && amount in 1..999_999_999_999L) { "Enter an amount above zero within the supported range." }
        return amount
    }
    fun format(minorUnits: Long, currency: String): String {
        val digits = digits(currency); val value = minorUnits.toString().padStart(digits + 1, '0')
        return if (digits == 0) value else value.dropLast(digits) + "." + value.takeLast(digits)
    }
    fun display(minorUnits: Long, currency: String): String {
        val value = format(minorUnits, currency)
        val whole = value.substringBefore('.').reversed().chunked(3).joinToString(",").reversed()
        return if ('.' in value) "$whole.${value.substringAfter('.')}" else whole
    }
}

/** App-generated leaf names only; journal references never contain paths or remote URLs. */
object LocalAttachmentRules {
    val image = Regex("[a-zA-Z0-9-]+\\.(jpg|png|jpeg)")
    val receipt = Regex("[a-zA-Z0-9-]+\\.(jpg|png|jpeg|pdf)")
}
