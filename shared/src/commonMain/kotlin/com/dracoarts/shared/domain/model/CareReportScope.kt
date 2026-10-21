package com.dracoarts.shared.domain.model

import kotlinx.datetime.LocalDate
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** The exact cat, dates, content and caregiver questions travel together through export. */
@Serializable
data class CareReportScope(val catId: String, val from: String, val through: String,
    val content: String = ReportContent.encode(ReportContent.defaults), val questions: String = "") {
    fun validate() {
        require(catId.isNotBlank() && catId.length <= 160) { "Choose an available cat." }
        val first = LocalDate.parse(from); val last = LocalDate.parse(through)
        require(last >= first) { "Choose an end date on or after the start." }
        require(ReportContent.decode(content).isNotEmpty()) { "Choose at least one content type." }
        require(questions.length <= 2000) { "Keep vet questions within 2,000 characters." }
    }
    // UTF-8 hex keeps punctuation and non-English questions out of navigation delimiters.
    fun argument(): String { validate(); return "cat-report-" + Json.encodeToString(serializer(), this).encodeToByteArray().joinToString("") { it.toUByte().toString(16).padStart(2, '0') } }
    companion object {
        fun parse(value: String, fallbackCatId: String): CareReportScope {
            val scope = if (value.startsWith("cat-report-")) {
                val hex = value.removePrefix("cat-report-")
                require(hex.length <= 40_000 && hex.length % 2 == 0) { "Reopen the report and choose its scope." }
                Json.decodeFromString(serializer(), hex.chunked(2).map { it.toInt(16).toByte() }.toByteArray().decodeToString(throwOnInvalidSequence = true))
            } else {
                val parts = value.split('@')
                require(parts.size in 2..4) { "Reopen the report and choose its scope." }
                // Older two-date callers (including Memory Book) requested all content.
                CareReportScope(parts.getOrNull(2)?.takeIf { it.isNotBlank() } ?: fallbackCatId, parts[0], parts[1], parts.getOrNull(3) ?: ReportContent.encode(ReportContent.entries.toSet()))
            }
            scope.validate(); return scope
        }
    }
}
