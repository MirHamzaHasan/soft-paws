package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.datetime.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*

fun questionCareType(question: String): CareEventType? = when {
    Regex("walk|exercise|activit", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Walk
    Regex("brush|groom|coat", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Grooming
    Regex("food|meal|eating|appetite|diet", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Meal
    Regex("poop|stool", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Poop
    Regex("pee|urina", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Pee
    Regex("weight", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Weight
    Regex("behav|bark|training", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Behavior
    Regex("mood|calm|happy", RegexOption.IGNORE_CASE).containsMatchIn(question) -> CareEventType.Mood
    else -> null
}

/** Byte limits keep Unicode notes bounded without leaving a partial surrogate. */
fun boundedProfileFact(value: String, bytes: Int = 400): String {
    if (value.encodeToByteArray().size <= bytes) return value
    var end = minOf(value.length, bytes)
    while (end > 0 && value.take(end).encodeToByteArray().size > bytes) end--
    if (end > 0 && value[end - 1].isHighSurrogate()) end--
    return value.take(end)
}

data class PreparedWeeklyContext(val profile: ProfileSnapshot, val records: List<SourceRecord>, val weekly: WeeklyAiContext)

suspend fun prepareWeeklyContext(repository: JournalRepository, dogId: String, question: String, now: Long, zone: TimeZone): PreparedWeeklyContext {
    val today = JournalDates.day(now, zone)
    val dates = (6 downTo 0).map { today.minus(it, DateTimeUnit.DAY) }
    val starts = dates.map { JournalDates.dayBounds(it, zone).first }
    val until = now + 1 // SQL uses an exclusive upper bound; include records at question time.
    val focus = questionCareType(question)
    val snapshot = repository.readCareWeek(dogId, starts, until, focus)
    val dog = snapshot.dog
    val profile = ProfileSnapshot(dog.name, dog.details.sex, dog.details.companion, dog.details.breed, dog.details.age, dog.details.notes)
    fun counts(values: Map<CareEventType, Int>) = values.entries.map { CareReadingCount(it.key.label, it.value) }
    var records = snapshot.records.map(::sourceRecord)
    var weekly = WeeklyAiContext(starts.first(), until, zone.id, snapshot.counts.values.sum(), records.size, counts(snapshot.counts),
        dates.mapIndexed { i, date -> CareWeekDay(date.toString(), counts(snapshot.dailyCounts[i])) }, focus?.label,
        showCard = focus != null || question.contains(dog.name, true) || Regex("dog|care|health|week|routine|day", RegexOption.IGNORE_CASE).containsMatchIn(question),
        profileLimited = profileFacts(profile).any { boundedProfileFact(it.second) != it.second })
    while (cloudContextJson(profile, records, weekly, now, zone.id).encodeToByteArray().size > 23_000 && records.isNotEmpty()) {
        records = records.dropLast(1); weekly = weekly.copy(shared = records.size)
    }
    check(cloudContextJson(profile, records, weekly, now, zone.id).encodeToByteArray().size <= 23_000) { "This dog’s profile is too large for an online reply. Review its care notes." }
    return PreparedWeeklyContext(profile, records, weekly)
}

internal fun cloudContextJson(profile: ProfileSnapshot?, records: List<SourceRecord>, weekly: WeeklyAiContext?, at: Long?, zone: String): String = buildJsonObject {
    profile?.let { put("caregiverProfile", buildJsonObject {
        put("relationship", "The person asking owns and cares for this dog.")
        profileFacts(it).filter { (_, value) -> value.isNotBlank() && value !in setOf("Not sure", "Not recorded") }.forEach { (key, value) -> put(key, boundedProfileFact(value)) }
    }) }
    at?.let { put("questionTimeUtcMillis", it); put("timeZone", zone) }
    weekly?.let { put("weeklyContext", Json.encodeToJsonElement(it)) }
    put("selectedObservationTotal", records.size)
    put("selectedObservationCounts", buildJsonObject { records.groupingBy { it.type }.eachCount().forEach { (type, count) -> put(type, count) } })
    put("selectedObservations", buildJsonArray { records.forEachIndexed { i, r -> add(buildJsonObject { put("source", i + 1); put("type", r.type); put("occurredAtUtcMillis", r.at); put("caregiverNote", r.note) }) } })
}.toString()

fun barkLogAiText(text: String, dogName: String? = null): String = if (dogName.equals("Atlas", true)) text else Regex("\\bAtlas(?: AI)?\\b", RegexOption.IGNORE_CASE).replace(text, "BarkLog AI")
