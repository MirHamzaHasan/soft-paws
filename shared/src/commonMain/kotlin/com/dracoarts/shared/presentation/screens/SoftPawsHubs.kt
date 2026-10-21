package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.companion.CompanionScreen
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates

@Composable
fun SoftPawsCareScreen(context: FeatureContext) {
    SoftPawsTop { context.open(Feature.Settings) }
    SoftPawsHeading("Care, in one place.", "${context.dog.name}’s records and routines")
    val today = JournalDates.day(context.now, context.zone)
    val completed = context.items.mapNotNull { (it.data as? CareItemData.Completion)?.takeIf { it.dueDate == today.toString() }?.taskId }.toSet()
    val task = context.items.filter { it.id !in completed && (it.data as? CareItemData.Task)?.let { data -> CareSchedule.occurs(data, today) } == true }.minByOrNull { (it.data as CareItemData.Task).time }
    SoftPawsCard(if (task != null) "Next on your list" else "A little planning.", tone = "butter") {
        when {
            context.careState.loading -> SkeletonLine(180.dp)
            task != null -> {
                val data = task.data as CareItemData.Task
                SoftPawsKicker("TODAY · YOUR CHOSEN TIME")
                Text(data.title, style = MaterialTheme.typography.titleLarge)
                CaptionText("${data.time} · reminder ${if (data.remind) "requested" else "off"}")
            }
            else -> SupportingText("Your chosen tasks and reminders, when you need them.")
        }
        SoftPawsRow("View care calendar", "Your planned tasks", "calendar") { context.open(Feature.Calendar) }
    }
    SoftPawsRow("Medication plans", "Only your vet’s instructions", "pill") { context.open(Feature.Medications) }
    SoftPawsRow("Vaccination records", "Dates and documents", "shield-check") { context.open(Feature.Vaccinations) }
    SoftPawsRow("Weight & observations", "Your recorded measurements", "activity") { context.navigation.show(Route.Insights) }
    SoftPawsRow("Prepare for a vet visit", "A report you can read for free", "notebook-pen") { context.open(Feature.Report) }
    SoftPawsRow("Safety & contacts", "Direct contact access stays free", "phone") { context.open(Feature.Safety) }
}

@Composable
fun SoftPawsMemoriesScreen(context: FeatureContext) {
    SoftPawsTop { context.open(Feature.Settings) }
    SoftPawsHeading("Ordinary, lovely days.", "A private photo journal for ${context.dog.name}")
    val photo = context.items.firstOrNull { it.data is CareItemData.Photo }
    if (photo != null) {
        val data = photo.data as CareItemData.Photo
        LocalPhoto(data.fileId, data.title, context.platform.device)
        SoftPawsRow(data.title, data.date, "image") { context.open(Feature.PhotoDetail, photo.id) }
    } else SoftPawsCard("Their first little memory.", tone = "peach") { SupportingText("Choose a photo to keep a dated moment here.") }
    SoftPawsRow("Add a photo", "Native picker · stays on your device", "camera") { context.open(Feature.PhotoForm, "picker") }
    SoftPawsRow("All their photos", "Your private photo journal", "image") { context.open(Feature.Photos) }
    SoftPawsRow("Their Memory Book", "Read on this phone for free", "notebook-pen") { context.open(Feature.Memory) }
    SoftPawsRow("Make a highlight", "Photo editing and preview stay free", "play") { context.open(Feature.VideoHighlight) }
    SoftPawsRow("Everyday expenses", "Keep costs and receipts together", "receipt") { context.open(Feature.Expenses) }
}

@Composable
fun SoftPawsYouScreen(context: FeatureContext) {
    SoftPawsTop { context.open(Feature.Settings) }
    SoftPawsHeading("A place for both of you.", "Your cat, preferences and local data.")
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(104.dp, 116.dp)) }
    SoftPawsRow(context.dog.name, "Profile, care notes and routines", "heart") {
        context.companion?.go(CompanionScreen.DogProfile) ?: context.open(Feature.DogEdit, context.dog.id)
    }
    SoftPawsRow("Your cats", "Switch profiles or add another", "user-round") { context.open(Feature.DogSwitcher) }
    context.companion?.let { companion ->
        val state by companion.state.collectAsState()
        SoftPawsRow("Your account", if (state.session.signedIn) state.session.email.ifBlank { state.session.provider } else "Optional for the local journal", "user-round") { companion.go(if (state.session.signedIn) CompanionScreen.AccountSettings else CompanionScreen.Login) }
        SoftPawsRow("Soft Paws Premium", "Your plan and access", "gem") { companion.go(CompanionScreen.ManagePlan) }
        SoftPawsRow("A little further ahead", "Future ideas · not available", "sparkles") { companion.go(CompanionScreen.FutureFeatures) }
    }
    SoftPawsRow("Settings & accessibility", "Make the app comfortable", "sliders-horizontal") { context.open(Feature.Settings) }
    SoftPawsRow("Your local data", "Export and manage records", "archive") { context.open(Feature.Export) }
}
