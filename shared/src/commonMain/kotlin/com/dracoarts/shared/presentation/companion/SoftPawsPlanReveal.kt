package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalState
import com.dracoarts.shared.presentation.theme.AppSpacing
import kotlinx.coroutines.launch

@Composable
internal fun SoftPawsPlanReveal(controller: CompanionController, journal: JournalState, applySafeInsets: Boolean, onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState()
    val draft = state.draft
    val scope = rememberCoroutineScope()
    val name = draft.name.ifBlank { journal.selectedDog?.name ?: "your cat" }
    Column(Modifier.fillMaxSize().then(if (applySafeInsets) Modifier.windowInsetsPadding(WindowInsets.safeDrawing) else Modifier).verticalScroll(rememberScrollState()).padding(AppSpacing.page), verticalArrangement = Arrangement.spacedBy(22.dp)) {
        BoardBackButton({ controller.go(CompanionScreen.Permissions) }, !state.profileSaving)
        SoftPawsHeading("A place for $name’s days.", "Your first cat’s journal stays free.")
        AnimatedCat(Modifier.align(Alignment.CenterHorizontally).size(174.dp, 190.dp), greetingLabel = "Say hello to the Soft Paws cat")
        SoftPawsCard("Keep it close") {
            SoftPawsRow("Meals, litter & little notes", "Saved on this device", "notebook-pen") {}
            SoftPawsRow("Your selected focus", draft.context.goals.joinToString(" · ").ifBlank { "Everyday care" }, "heart") {}
            SoftPawsRow("Care reminders", if (draft.context.notifications) "Chosen by you · ${draft.context.reminderTime}" else "Off for now", "bell") {}
        }
        state.error?.let { ErrorCard(it) }
        BoardStickyAction {
            BarkButton(if (state.profileSaving) "Saving…" else "Open the journal", enabled = !state.profileSaving, onClick = {
                scope.launch {
                    val cat = if (journal.selectedDog == null || draft.addingDog || draft.editingDogId != null) controller.commitDog() else journal.selectedDog
                    cat?.let { onEnterJournal(it.id) }
                }
            })
            BarkTextAction("Explore Premium", { controller.go(CompanionScreen.Paywall) }, Modifier.align(Alignment.CenterHorizontally), enabled = !state.profileSaving)
        }
    }
}
