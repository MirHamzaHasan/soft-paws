package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.state.observationSummary
import com.dracoarts.shared.presentation.theme.BarkMotion
import com.dracoarts.shared.presentation.navigation.AppState
import com.dracoarts.shared.presentation.navigation.Feature
import com.dracoarts.shared.presentation.navigation.designReviewSections
import com.dracoarts.shared.presentation.navigation.HomeShortcut
import kotlinx.datetime.LocalDate
import kotlin.test.*

class DesignPresentationTest {
    private fun event(details: CareDetails? = null, note: String? = null) =
        CareEvent("record", "dog", CareEventType.Meal, 200, 100, note, details)

    @Test fun homeShortcutsRetainLegacyChoicesAndBoundNewSelections() {
        assertEquals(emptySet(), HomeShortcut.decode(null))
        assertEquals(setOf(HomeShortcut.CareTasks, HomeShortcut.Photos), HomeShortcut.decode("Calendar,Photos,Photos,Unknown"))
        assertEquals("Medication,Training", HomeShortcut.encode(setOf(HomeShortcut.Training, HomeShortcut.Medication)))
        assertFailsWith<IllegalArgumentException> { HomeShortcut.selecting(setOf(HomeShortcut.Photos, HomeShortcut.Training), HomeShortcut.Medication, true) }
        val legacy = HomeShortcut.entries.toSet()
        assertEquals(legacy - HomeShortcut.Photos, HomeShortcut.selecting(legacy, HomeShortcut.Photos, false))
        HomeShortcut.entries.forEach { assertEquals(setOf(it), HomeShortcut.decode(HomeShortcut.encode(setOf(it)))) }
    }

    @Test fun emptyQuickRecordsDoNotInventObservations() {
        assertEquals("No additional details recorded", observationSummary(event()))
        assertEquals("No additional details recorded", observationSummary(event(CareDetails.Meal())))
    }

    @Test fun summariesRetainFactualDetailsUnitsAndNotes() {
        val cases = listOf(
            CareDetails.Poop(StoolConsistency.Formed) to "Formed",
            CareDetails.Pee(ObservedAmount.Usual) to "Usual amount",
            CareDetails.Meal("Kibble", "100 g") to "Kibble · 100 g",
            CareDetails.Walk(20) to "20 minutes",
            CareDetails.Symptom("Sneezed") to "Sneezed",
            CareDetails.Mood(ObservedMood.Playful) to "Playful",
            CareDetails.Behavior("Barked at the door") to "Barked at the door",
            CareDetails.Grooming(GroomingActivity.Brushing) to "Brushing",
            CareDetails.Weight(12.5, WeightUnit.Kilograms) to "12.5 kg",
        )
        cases.forEach { (details, expected) -> assertEquals("$expected · Owner note", observationSummary(event(details, "Owner note"))) }
    }

    @Test fun summaryNeverMutatesOrTruncatesStoredText() {
        val note = "A".repeat(2000)
        val record = event(note = note)
        assertEquals(note, observationSummary(record))
        assertEquals(note, record.note)
        assertEquals(1, record.revision)
    }

    @Test fun headingsUseCalendarDayAndDebugSpeedChangesOnlyDuration() {
        assertEquals("Wednesday, 14 October", JournalDates.headingDate(LocalDate(2026, 10, 14)))
        assertEquals(420, BarkMotion().milliseconds(420))
        assertEquals(840, BarkMotion(speed = .5f).milliseconds(420))
        assertEquals(1680, BarkMotion(speed = .25f).milliseconds(420))
    }

    @Test fun debugReviewCoversAllProductFamiliesWithoutFabricatedRecordsOrDestructiveActions() {
        val required = setOf(Feature.DogSwitcher, Feature.Settings, Feature.Health, Feature.Medications,
            Feature.Vaccinations, Feature.Calendar, Feature.Monthly, Feature.Safety, Feature.Emergency,
            Feature.Toxicity, Feature.FirstAid, Feature.Triage, Feature.Report, Feature.Training,
            Feature.Photos, Feature.Baselines, Feature.Expenses, Feature.Memory)
        assertTrue(designReviewSections.map { it.feature }.containsAll(required))
        assertEquals(designReviewSections.size, designReviewSections.map { it.label }.toSet().size)
        assertEquals(designReviewSections.size, designReviewSections.map { it.feature }.toSet().size)
        assertFalse(designReviewSections.any { it.feature in setOf(Feature.DeleteDog, Feature.DeleteAll, Feature.MedicationGiven, Feature.Session) })
        designReviewSections.forEach { section ->
            val navigation = AppState()
            navigation.open(section.feature)
            val restored = AppState.restoreValue(navigation.savedValue())
            assertEquals(section.feature, restored.featurePage?.feature)
            assertEquals("", restored.featurePage?.id)
            assertNull(restored.page)
        }
    }
}
