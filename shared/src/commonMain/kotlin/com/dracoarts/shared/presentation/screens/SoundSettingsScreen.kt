package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.services.SoundCue
import com.dracoarts.shared.services.SoundReadiness
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun SoundSettingsScreen(context: FeatureContext) {
    val settings by context.settings.state.collectAsState()
    val sounds = LocalInteractionSounds.current
    val ready by (sounds?.readiness ?: com.dracoarts.shared.services.SilentInteractionSoundPlayer.readiness).collectAsState()
    val scope = rememberCoroutineScope()
    var volume by remember(settings.soundVolume) { mutableFloatStateOf(settings.soundVolume) }
    CaptionText("Make it feel like BarkLog")
    ScreenHeading("A softer little tap.", "Quiet sounds for the things you touch.")
    JournalCard {
        FeatureToggle("Interaction sounds", "Optional. Start quiet and adjust to suit you.", settings.sounds) { on ->
            if (!on) sounds?.configure(false, volume, settings.soundTexture, true)
            scope.launch { context.settings.save(settings.copy(sounds = on)) }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("Volume"); Text("${(volume * 100).roundToInt()}%") }
        Slider(volume, onValueChange = { volume = it }, valueRange = 0f..1f, steps = 19,
            onValueChangeFinished = { scope.launch { context.settings.save(settings.copy(soundVolume = volume)); sounds?.play(SoundCue.Selection) } },
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).semantics { contentDescription = "Interaction sound volume" },
            colors = SliderDefaults.colors(thumbColor = boardColor("ink-strong"), activeTrackColor = boardColor("ink-strong"),
                inactiveTrackColor = boardColor("inset"), activeTickColor = boardColor("panel"), inactiveTickColor = boardColor("ink-muted")))
        ChoiceField("Sound texture", settings.soundTexture, listOf("wood" to "Soft wood", "pop" to "Soft pop")) { texture -> scope.launch { context.settings.save(settings.copy(soundTexture = texture)) } }
        CaptionText(when {
            !settings.sounds -> "Sounds are off."
            volume == 0f -> "Muted. Raise the volume to hear a sample."
            ready == SoundReadiness.Loading -> "Getting sounds ready…"
            ready == SoundReadiness.Unavailable -> "Sounds are unavailable here. Your journal still works."
            else -> "Sounds are on · ${(volume * 100).roundToInt()}%"
        })
        if (settings.sounds && ready == SoundReadiness.Unavailable) BarkButton("Retry sounds", { sounds?.retry() }, secondary = true)
    }
    settings.error?.let { ErrorCard(it) }
    JournalCard {
        SectionTitle("Try the sounds")
        CompositionLocalProvider(LocalInteractionSounds provides null) {
            listOf(Triple("Button tap", "A small, rounded touch", SoundCue.Tap), Triple("Selection tick", "A lighter sound for a choice", SoundCue.Selection), Triple("Saved", "A warm note after a completed save", SoundCue.Saved)).forEach { (label, subtitle, cue) ->
                Surface(onClick = { sounds?.play(cue) }, enabled = settings.sounds && volume > 0 && ready == SoundReadiness.Ready,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 64.dp).semantics { contentDescription = "Preview ${label.lowercase()} sound" },
                    shape = RoundedCornerShape(16.dp), color = boardColor("ground"), border = BorderStroke(1.dp, boardColor("hair"))) {
                    Row(Modifier.padding(12.dp).clearAndSetSemantics {}, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        BarkIcon(if (cue == SoundCue.Tap) "paw-print" else if (cue == SoundCue.Selection) "check" else "notebook-pen", Modifier.size(22.dp))
                        Column(Modifier.weight(1f)) { Text(label, style = MaterialTheme.typography.titleSmall); CaptionText(subtitle) }
                        BarkIcon("play", Modifier.size(18.dp))
                    }
                }
            }
        }
    }
    CaptionText("Typing, scrolling and loading stay silent. Sound never replaces a visible confirmation.")
    BarkButton("Try in AI chat", {
        val chat = context.companion
        chat?.go(if (!chat.state.value.session.premium) com.dracoarts.shared.presentation.companion.CompanionScreen.AiGate else if (chat.requiresAiConsent) com.dracoarts.shared.presentation.companion.CompanionScreen.AiPrivacy else com.dracoarts.shared.presentation.companion.CompanionScreen.Chat)
    })
    BarkTextAction("Back to journal", { context.navigation.show(com.dracoarts.shared.presentation.navigation.Route.Home) })
}
