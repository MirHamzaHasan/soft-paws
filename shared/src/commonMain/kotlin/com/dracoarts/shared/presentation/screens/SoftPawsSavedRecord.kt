package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.Route
import com.dracoarts.shared.presentation.state.*

/** This surface is reachable only after the repository returns a committed record. */
@Composable
internal fun SoftPawsSavedRecord(record: CareEvent, context: FeatureContext) {
    BoardBackButton({ context.navigation.show(Route.Home) })
    SoftPawsHeading("A small thing, kept.", "One more detail in ${context.dog.name}’s day.")
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        AnimatedCat(Modifier.size(224.dp, 244.dp), record.id, context.journalController::consumedReaction)
    }
    SoftPawsCard((record.details as? CareDetails.Note)?.title ?: record.type.label) {
        CaptionText(observationSummary(record))
        CaptionText(JournalDates.dateAndTime(record.occurredAtMillis, context.zone))
    }
    CaptionText("Saved on this device.", Modifier.semantics { liveRegion = LiveRegionMode.Polite })
    BoardStickyAction {
        BarkButton("Back to today", { context.navigation.show(Route.Home) })
        BarkTextAction("View record", { context.navigation.detail(record.dogId, record.id) }, Modifier.fillMaxWidth())
    }
}
