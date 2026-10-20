package com.dracoarts.shared.presentation.companion

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.datetime.TimeZone

/** Factual caregiver handoff. AI text is opt-in and clearly separated. */
fun chatVetReport(dog: Dog, includeProfile: Boolean, events: List<CareEvent>, messages: List<CompanionMessage>, includeConversation: Boolean, includePhotos: Boolean, zone: TimeZone, filename: String): ExportDocument {
    val selected = events.filter { it.dogId == dog.id }.distinctBy { it.id }.sortedBy { it.occurredAtMillis }.take(50)
    val images = if (includePhotos) messages.filterNot { it.assistant }.flatMap { message -> message.photoIds.map { ExportImage(it, "Caregiver photo · ${JournalDates.dateAndTime(message.at, zone)}") } }.distinctBy { it.fileId }.takeLast(12) else emptyList()
    val lines = buildList {
        add("${dog.name} · caregiver report for a veterinarian")
        add("Caregiver observations and selected records. This is not an examination, diagnosis or treatment plan.")
        if (includeProfile) {
            add("PROFILE · provided by caregiver")
            listOf("Breed or mix" to dog.details.breed, "Age" to dog.details.age, "Sex" to dog.details.sex).filter { it.second.isNotBlank() && it.second != "Not recorded" }.forEach { (label, value) -> add("$label: $value") }
            dog.details.companion.facts().forEach { (label, value) -> add("$label: $value") }
        }
        add("CAREGIVER MESSAGES · not verified clinical findings")
        messages.filterNot { it.assistant }.takeLast(40).forEach { add("${JournalDates.dateAndTime(it.at, zone)} · ${barkLogAiText(it.text, it.profile?.name)}") }
        add("SELECTED JOURNAL RECORDS · ${selected.size}")
        if (selected.isEmpty()) add("No journal records selected. Missing logs do not establish whether an observation occurred.")
        selected.forEach { event ->
            add("${JournalDates.dateAndTime(event.occurredAtMillis, zone)} · ${event.type.label}")
            JournalReport.details(event.details).takeIf(String::isNotBlank)?.let(::add)
            event.note?.takeIf(String::isNotBlank)?.let(::add)
        }
        if (includeConversation) {
            add("AI REPLIES · optional and unverified")
            add("Scene captions describe visible content only. AI replies must not be treated as veterinary findings or instructions.")
            messages.filter { it.assistant }.takeLast(40).forEach { add("${when (it.responseSource) { "local" -> "On-device AI"; "journal" -> "Saved journal facts"; "local-caption" -> "On-device photo draft"; "atlas" -> "BarkLog AI"; "safety" -> "BarkLog safety guidance"; else -> "Demo AI" }} · unverified · ${JournalDates.dateAndTime(it.at, zone)}\n${barkLogAiText(it.text, it.profile?.name)}") }
        }
        add("ATTACHED CAREGIVER PHOTOS · ${images.size}")
        if (images.isNotEmpty()) add("Images are provided for the veterinarian to review. BarkLog makes no image assessment.")
    }
    return ExportDocument(filename, ExportFormat.PDF, "BarkLog · vet report", lines, images = images)
}
