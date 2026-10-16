package com.dracoarts.shared.presentation.screens

import androidx.compose.runtime.*
import com.dracoarts.shared.domain.model.CareEventRules
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.presentation.theme.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.graphicsLayer
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*

@Composable
fun FeatureScreens(page: FeaturePage, context: FeatureContext) {
    CompositionLocalProvider(LocalBoardFolio provides featureFolio(page.feature)) { FeatureScreenContent(page, context) }
}

fun featureFolio(feature: Feature): BoardFolio? = when (feature) {
    Feature.DogSwitcher, Feature.DogAdd, Feature.DogEdit, Feature.Settings, Feature.DeleteDog, Feature.DeleteAll -> BoardFolio("YOUR DOG, ALL TOGETHER", "user-round", "walk")
    Feature.Health, Feature.Medications, Feature.MedicationForm, Feature.MedicationDetail, Feature.MedicationGiven, Feature.MedicationArchive, Feature.Vaccinations, Feature.VaccinationForm -> BoardFolio("THE CARE RECORD", "pill", "medication")
    Feature.Calendar, Feature.TaskForm, Feature.TaskDetail, Feature.ReminderOptIn -> BoardFolio("A LITTLE PLANNING", "calendar", "training")
    Feature.Monthly -> BoardFolio("FROM YOUR RECORDS", "chart-no-axes-column-increasing", "photo")
    Feature.Safety, Feature.Emergency, Feature.EmergencyEdit, Feature.Toxicity, Feature.FirstAid, Feature.Triage -> BoardFolio("READY WHEN IT MATTERS", "shield", "symptom")
    Feature.Report, Feature.ReportPreview, Feature.ReportFormat, Feature.Export -> BoardFolio("BRING THE FACTS", "file-text", "photo")
    Feature.Training, Feature.Program, Feature.TrainingProgress, Feature.Session, Feature.TrainingSummary -> BoardFolio("SMALL PRACTICE, OFTEN", "graduation-cap", "training")
    Feature.Photos, Feature.PhotoForm, Feature.PhotoDetail, Feature.Baselines -> BoardFolio("MOMENTS TO KEEP", "image", "photo")
    Feature.Expenses, Feature.ExpenseForm, Feature.ExpenseDetail -> BoardFolio("THE COST OF CARE", "receipt", "training")
    Feature.Memory, Feature.MemoryCollection, Feature.MemoryHighlight, Feature.MemoryCaption, Feature.MemoryShare -> BoardFolio("THE GOOD LITTLE THINGS", "heart", "mood")
    Feature.Chooser, Feature.CareTools -> null
}

@Composable
private fun FeatureScreenContent(page: FeaturePage, context: FeatureContext) {
    LaunchedEffect(page) { context.care.clearError() }
    if (page.feature == Feature.Chooser) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { FeatureBack(context); BoardDogChip(context.dog.name, { context.open(Feature.DogSwitcher) }) }
    else FeatureBack(context)
    if (context.careState.loading && page.feature !in setOf(Feature.Settings, Feature.DogAdd, Feature.DogEdit, Feature.Safety, Feature.Emergency, Feature.Toxicity, Feature.FirstAid, Feature.Triage)) {
        FeatureNotice("Reading saved records", "Your journal is on this device.", "refresh-cw"); return
    }
    if (context.careState.readFailed) {
        ErrorCard(context.careState.error ?: "Couldn't read these local records.")
        BarkButton("Try again", context.care::retry, icon = "refresh-cw")
        if (page.feature !in setOf(Feature.Settings, Feature.DogEdit, Feature.Safety, Feature.Emergency, Feature.Toxicity, Feature.FirstAid, Feature.Triage)) return
    }
    if (!context.careState.readFailed) context.careState.error?.let { ErrorCard(it) }
    context.careState.feedback?.let { FeatureNotice("On this device", it, "circle-check") }
    when (page.feature) {
        Feature.CareTools -> ProfileHub(context)
        Feature.DogSwitcher, Feature.DogAdd, Feature.DogEdit, Feature.Settings, Feature.DeleteDog, Feature.DeleteAll, Feature.EmergencyEdit -> ProfileFeatureScreen(page, context)
        Feature.Health, Feature.Medications, Feature.MedicationForm, Feature.MedicationDetail, Feature.MedicationGiven, Feature.MedicationArchive, Feature.Vaccinations, Feature.VaccinationForm -> HealthFeatureScreen(page, context)
        Feature.Calendar, Feature.TaskForm, Feature.TaskDetail, Feature.ReminderOptIn -> CalendarFeatureScreen(page, context)
        Feature.Training, Feature.Program, Feature.TrainingProgress, Feature.Session, Feature.TrainingSummary -> TrainingFeatureScreen(page, context)
        Feature.Photos, Feature.PhotoForm, Feature.PhotoDetail, Feature.Baselines -> PhotoFeatureScreen(page, context)
        Feature.Expenses, Feature.ExpenseForm, Feature.ExpenseDetail -> ExpenseFeatureScreen(page, context)
        Feature.Safety, Feature.Emergency, Feature.Toxicity, Feature.FirstAid, Feature.Triage -> SafetyFeatureScreen(page, context)
        Feature.Report, Feature.ReportPreview, Feature.ReportFormat, Feature.Export -> ReportFeatureScreen(page, context)
        Feature.Memory, Feature.MemoryCollection, Feature.MemoryHighlight, Feature.MemoryCaption, Feature.MemoryShare -> MemoryFeatureScreen(page, context)
        Feature.Monthly -> InsightsScreen(context, monthly = true)
        Feature.Chooser -> {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) { CaptionText("KEEP THE LITTLE DETAILS"); MarkerHeading("Create a log.", "log."); SupportingText("A quick observation, a proper note, or both.") }
            listOf("The everyday things" to CareEventRules.detailedTypes.take(4), "What you noticed" to CareEventRules.detailedTypes.drop(4).take(3), "A little extra care" to CareEventRules.detailedTypes.takeLast(2)).forEach { (title, types) ->
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionTitle(title)
            types.chunked(2).forEach { pair ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
                    pair.forEach { type ->
                        LogLibraryTile(type, pair.size == 1, Modifier.weight(1f)) { context.navigation.newLog(context.dog.id, type, context.platform.newId()) }
                    }
                }
            }
            }
            }
            CaptionText("Caregiver observations only. Everything saves on this device.")
        }
    }
}

@Composable
private fun LogLibraryTile(type: CareEventType, wide: Boolean, modifier: Modifier, onClick: () -> Unit) {
    Surface(onClick = onClick, modifier = modifier.heightIn(min = if (wide) 112.dp else 154.dp), shape = RoundedCornerShape(26.dp), color = boardColor("${type.key}-bg"), contentColor = boardColor("${type.key}-ink")) {
        Box(Modifier.padding(16.dp)) {
            val mark = boardSharedElement("care-${type.key}", boardColor("${type.key}-bg")).graphicsLayer { rotationZ = -7f }
            @Composable fun Words() { Text(type.label, style = MaterialTheme.typography.titleLarge.copy(fontSize = 20.sp, lineHeight = 23.sp)); Text(logSubtitle(type), style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, lineHeight = 15.95.sp)) }
            if (wide) Row(Modifier.padding(end = 15.dp).align(Alignment.CenterStart), horizontalArrangement = Arrangement.spacedBy(21.dp), verticalAlignment = Alignment.CenterVertically) { BoardLogMark(type, 46.dp, mark, tile = true); Column(verticalArrangement = Arrangement.spacedBy(7.dp)) { Words() } }
            else Column(Modifier.padding(end = 2.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) { BoardLogMark(type, 46.dp, mark, tile = true); Words() }
            BarkIcon("arrow-up-right", Modifier.size(19.dp).align(Alignment.TopEnd))
        }
    }
}
