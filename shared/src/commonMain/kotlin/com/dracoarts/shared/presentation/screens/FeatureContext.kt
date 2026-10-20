package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.datetime.TimeZone
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.CancellationException

data class FeatureContext(
    val journal: JournalState, val journalController: JournalController, val care: CareController,
    val careState: CareState, val settings: SettingsController, val navigation: AppState,
    val platform: AppPlatform, val repository: JournalRepository, val now: Long, val zone: TimeZone, val reviewScreen: String? = null,
    val reviewFaults: com.dracoarts.shared.presentation.review.BoardReviewFaults? = null,
    val highlights: com.dracoarts.shared.presentation.highlights.HighlightController? = null,
    val companion: com.dracoarts.shared.presentation.companion.CompanionController? = null,
) {
    val dog get() = journal.selectedDog!!
    val items get() = if (careState.dogId == dog.id) careState.items else emptyList()
    val saving get() = careState.saving || journal.saving
    fun open(feature: Feature, id: String = "") = navigation.open(feature, id)
    suspend fun activityLogged(item: CareItem) {
        try { repository.observeEvent(item.dogId, item.id).first()?.let(journalController::recordSaved) }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { /* The activity is already committed; only its dog reaction is skipped. */ }
    }
}

@Composable
fun FeatureRow(title: String, subtitle: String = "", icon: String = "chevron-right", meta: String = "", tone: String? = null, bordered: Boolean = true, onClick: () -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val grouped = LocalBoardMenu.current
    val family = tone ?: when (icon) { "pill", "syringe" -> "medication"; "calendar", "alarm-clock" -> "walk"; "graduation-cap", "receipt" -> "training"; "image" -> "photo"; "shield", "trash" -> "symptom"; "heart" -> "mood"; else -> "note" }
    val pressed by interaction.collectIsPressedAsState()
    Surface(soundAction(onClick), Modifier.fillMaxWidth().heightIn(min = 68.dp), interactionSource = interaction,
        shape = RoundedCornerShape(if (grouped || !bordered) 0.dp else 20.dp), color = boardColor(if (pressed) "inset" else "panel"),
        border = if (grouped || !bordered) null else BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant), tonalElevation = 0.dp, shadowElevation = 0.dp) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Surface(Modifier.then(stickerPressMotion(interaction)), shape = CircleShape, color = boardColor("$family-bg"), contentColor = boardColor("$family-ink")) { Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(22.dp)) } }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); if (subtitle.isNotBlank()) CaptionText(subtitle) }
            if (meta.isNotBlank()) CaptionText(meta) else BarkIcon("chevron-right", Modifier.size(18.dp))
        }
    }
}

private val LocalBoardMenu = staticCompositionLocalOf { false }

@Composable
fun BoardFactRow(title: String, subtitle: String, icon: String = "circle-check", family: String = "note") {
    Surface(Modifier.fillMaxWidth().heightIn(min = 68.dp), color = boardColor("panel")) { Row(Modifier.padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) { Surface(shape = CircleShape, color = boardColor("$family-bg"), contentColor = boardColor("$family-ink")) { Box(Modifier.size(42.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(22.dp)) } }; Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); CaptionText(subtitle) } } }
}
@Composable
fun BoardMenu(content: @Composable ColumnScope.() -> Unit) {
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(26.dp), color = boardColor("hair"), border = BorderStroke(1.dp, boardColor("hair"))) {
        CompositionLocalProvider(LocalBoardMenu provides true) { Column(verticalArrangement = Arrangement.spacedBy(1.dp), content = content) }
    }
}

@Composable
fun FeatureBack(context: FeatureContext) { BoardBackButton(context.navigation::back, !context.saving) }

@Composable
fun FeatureNotice(title: String, text: String, icon: String = "info", tone: String? = null) {
    val tone = tone ?: when (icon) { "circle-check", "circle-check-big", "shield-check" -> "good"; "trash", "circle-x" -> "bad"; "triangle-alert", "alarm-clock" -> "warn"; else -> "info" }
    Surface(Modifier.fillMaxWidth().semantics { liveRegion = LiveRegionMode.Polite }, shape = RoundedCornerShape(26.dp), color = boardColor("status-$tone-soft")) {
        Row(Modifier.padding(18.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.Top) {
            Surface(shape = CircleShape, color = boardColor("status-$tone")) { Box(Modifier.size(40.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(22.dp), if (LocalBarkDarkTheme.current) boardColor("ball-ink") else androidx.compose.ui.graphics.Color.White) } }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) { Text(title, style = MaterialTheme.typography.titleLarge.copy(fontSize = 17.sp, lineHeight = 23.8.sp, letterSpacing = (-.34).sp)); Text(text, style = MaterialTheme.typography.bodySmall, color = boardColor("ink")) }
        }
    }
}

@Composable
fun FeatureToggle(title: String, subtitle: String, value: Boolean, onChange: (Boolean) -> Unit) {
    val sounds = LocalInteractionSounds.current
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(1f)) { Text(title, style = MaterialTheme.typography.titleMedium); CaptionText(subtitle) }
        Switch(value, onCheckedChange = { sounds?.play(com.dracoarts.shared.services.SoundCue.Selection); onChange(it) }, modifier = Modifier.sizeIn(minWidth = 52.dp, minHeight = 48.dp).semantics { contentDescription = title }, colors = SwitchDefaults.colors(checkedTrackColor = boardColor("ink-strong"), checkedThumbColor = boardColor("ball"), checkedBorderColor = boardColor("ink-strong"), uncheckedTrackColor = boardColor("inset"), uncheckedThumbColor = boardColor("panel"), uncheckedBorderColor = boardColor("hair-2")))
    }
}

@Composable
fun ConfirmChange(title: String, description: String, action: String, saving: Boolean, onDismiss: () -> Unit, keepLabel: String = "Keep it", danger: Boolean = true, onConfirm: () -> Unit) {
    BoardConfirmDialog(title, description, action, saving, onDismiss, keepLabel = keepLabel, danger = danger, onConfirm = onConfirm)
}
