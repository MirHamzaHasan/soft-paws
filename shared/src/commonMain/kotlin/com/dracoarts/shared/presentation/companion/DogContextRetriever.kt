package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

data class RetrievedDogContext(val profile: ProfileSnapshot, val records: List<SourceRecord>, val scope: LocalRetrieval, val readings: CareReadings)

/** Local lexical/type/date retrieval. Queries SQLite, never another dog's rows or a network index. */
class DogContextRetriever(private val journal: JournalRepository) {
    suspend fun retrieve(dog: Dog, question: String, now: Long, zone: TimeZone): RetrievedDogContext {
        val today = JournalDates.day(now, zone)
        val q = question.lowercase()
        val explicitDate = Regex("\\b\\d{4}-\\d{2}-\\d{2}\\b").find(q)?.value?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
        val days = Regex("(?:last|past) (\\d{1,3}) days?\\b").find(q)?.groupValues?.get(1)?.toIntOrNull()?.coerceIn(1, 365)
        val startDay = when {
            explicitDate != null -> explicitDate
            Regex("\\byesterday\\b").containsMatchIn(q) -> today.minus(1, DateTimeUnit.DAY)
            Regex("\\btoday\\b").containsMatchIn(q) -> today
            days != null -> today.minus(days - 1, DateTimeUnit.DAY)
            Regex("\\bthis week\\b").containsMatchIn(q) -> today.minus(today.dayOfWeek.ordinal, DateTimeUnit.DAY)
            Regex("\\b(?:last|past) (?:week|seven days)\\b").containsMatchIn(q) -> today.minus(6, DateTimeUnit.DAY)
            Regex("\\bthis month\\b").containsMatchIn(q) -> LocalDate(today.year, today.month, 1)
            else -> null
        }
        val from = startDay?.let { JournalDates.dayBounds(it, zone).first }
        val until = if (explicitDate != null || Regex("\\byesterday\\b").containsMatchIn(q))
            JournalDates.dayBounds(startDay!!, zone).second.coerceAtMost(now + 1) else now + 1
        require(from == null || from < until) { "Choose a date up to today for saved observations." }
        val focused = questionCareTypes(q)
        val type = focused.singleOrNull()
        val filter = TimelineFilter(dog.id, type, from, until)
        val page = journal.observeTimeline(filter, 12).first()
        val terms = Regex("[\\p{L}\\p{N}]{3,40}").findAll(q).map { it.value }.filter { it !in stopWords && it !in dog.name.lowercase().split(' ') }
            .distinct().take(3).toList()
        val matches = if (terms.isEmpty()) emptyList() else journal.observeMatchingEvents(filter, terms, 36).first()
        // Keyword matches bring old named observations forward; latest facts always remain available.
        val ranked = matches.sortedWith(compareByDescending<CareEvent> { event ->
            val text = listOf(event.note.orEmpty(), JournalReport.details(event.details), event.context.observations.toString()).joinToString(" ").lowercase()
            terms.count { it in text }
        }.thenByDescending { it.occurredAtMillis })
        val otherFocused = if (focused.size > 1) focused.flatMap {
            journal.observeTimeline(filter.copy(type = it), 3).first().events
        } else emptyList()
        val retrieved = (page.events.take(2) + ranked + otherFocused + page.events).distinctBy { it.id }.take(12)
        val recentFrom = JournalDates.dayBounds(today.minus(6, DateTimeUnit.DAY), zone).first
        val recent = journal.observeCareWindow(dog.id, recentFrom, now + 1).first()
        val label = if (startDay == null) "all saved dates up to ${today}" else "${startDay} to ${JournalDates.day(until - 1, zone)}"
        return RetrievedDogContext(
            ProfileSnapshot(dog.name, dog.details.sex, dog.details.companion, dog.details.breed, dog.details.age, dog.details.notes),
            retrieved.map(::sourceRecord), LocalRetrieval(type?.label, label, from, until, page.totalCount, page.totalCount > retrieved.size),
            CareReadings(dog.name, recentFrom, now + 1, zone.id,
                CareEventType.entries.map { CareReadingCount(it.label, recent.counts[it] ?: 0) }, recent.recent.map(::sourceRecord)))
    }
    companion object {
        private val stopWords = ("what when where which how many much long was were is are did does do the and for with about this that these those " +
            "my our your his her their dog dogs name tell please answer briefly recorded records record logs log saved supplied observations recent latest last " +
            "today yesterday week month days past from have has had know give can could should would me you him them mine there some any why summarize " +
            "walk walks exercise activity meal meals food feed feeding eating diet poop stool pee urine weight mood training grooming profile owner").split(' ').toSet()
    }
}

internal fun questionCareTypes(q: String): List<CareEventType> = listOf(
    CareEventType.Walk to "walk\\w*|exercise|activity",
    CareEventType.Meal to "meals?|food|fed|feed\\w*|eating|diet",
    CareEventType.Poop to "poop\\w*|stools?|bowel",
    CareEventType.Pee to "pee\\w*|urin\\w*",
    CareEventType.Weight to "weight|weigh\\w*",
    CareEventType.Symptom to "symptoms?|vomit\\w*|diarrh\\w*|itch\\w*",
    CareEventType.Mood to "mood|calm|anxious",
    CareEventType.Training to "training|trained",
    CareEventType.Grooming to "groom\\w*|brush\\w*"
).filter { (_, pattern) -> Regex("\\b(?:$pattern)\\b").containsMatchIn(q) }.map { it.first }
