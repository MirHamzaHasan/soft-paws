package com.dracoarts.shared

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.dracoarts.shared.presentation.components.StartupMessage
import com.dracoarts.shared.presentation.screens.BarkLogShell
import com.dracoarts.shared.presentation.state.StartupState
import com.dracoarts.shared.presentation.state.JournalController
import com.dracoarts.shared.presentation.theme.AppTheme
import com.dracoarts.shared.presentation.theme.BarkMotion
import com.dracoarts.shared.presentation.theme.LocalBarkMotion
import com.dracoarts.shared.presentation.theme.rememberSystemReducedMotion
import com.dracoarts.shared.services.AppContainer
import com.dracoarts.shared.services.AppModule
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import androidx.compose.runtime.mutableStateOf
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import com.dracoarts.shared.presentation.review.BoardReviewFaults
import com.dracoarts.shared.presentation.review.boardReviewEntry

@Composable
fun App(platform: AppPlatform, state: AppState, modules: List<AppModule> = emptyList(), reviewEnabled: Boolean = false, reviewStart: String? = null, boardFixture: BoardReviewDataSet? = null, liveAiReview: Boolean = false) {
    val initialScreen = if (reviewEnabled) { if (reviewStart == "next-sounds") "Sounds" else if (reviewStart?.startsWith("next-") == true) reviewStart else boardReviewEntry(reviewStart) } else null
    val faults = remember(platform, reviewEnabled, boardFixture, initialScreen) { if (reviewEnabled && boardFixture != null) BoardReviewFaults(initialScreen) else null }
    val runtimePlatform = remember(platform, faults) { faults?.platform(platform) ?: platform }
    val container = remember(runtimePlatform, modules, liveAiReview) { AppContainer(runtimePlatform, modules, faults, liveAiReview = reviewEnabled && boardFixture != null && liveAiReview) }
    val cleanupScope = remember(container) { CoroutineScope(SupervisorJob() + Dispatchers.Main) }
    DisposableEffect(container) {
        onDispose {
            cleanupScope.launch {
                try { container.close() } finally { cleanupScope.cancel() }
            }
        }
    }
    val startup by container.startup.state.collectAsState()
    var retry by remember { mutableIntStateOf(0) }
    var fixtureReady by remember { mutableStateOf(boardFixture == null) }
    var fixtureError by remember { mutableStateOf(false) }
    LaunchedEffect(container, retry) { container.startup.initialize() }
    LaunchedEffect(container) { container.settings.load() }
    LaunchedEffect(startup, retry) {
        if (boardFixture != null && reviewEnabled && startup == StartupState.Ready && !fixtureReady) {
            try {
                if (platform.storage.getBoolean("fixture_seeded") != true) {
                    BoardReviewFixture.seed(container.journal, boardFixture)
                    platform.storage.setBoolean("fixture_seeded", true)
                }
                if (boardFixture != BoardReviewDataSet.Setup) platform.storage.setBoolean("coach_shown", true)
                faults?.arm()
                fixtureReady = true; fixtureError = false
            } catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled }
            catch (_: Exception) { fixtureError = true }
        }
    }
    val settings by container.settings.state.collectAsState()
    val soundForeground by runtimePlatform.device.foreground.collectAsState()
    androidx.compose.runtime.SideEffect { container.managers.sounds.configure(settings.sounds, settings.soundVolume, settings.soundTexture, soundForeground) }
    val dark = when (settings.theme) { "Dark" -> true; "Light" -> false; else -> isSystemInDarkTheme() }

    androidx.compose.runtime.SideEffect { runtimePlatform.device.updateAppearance(dark, settings.theme == "System") }
    AppTheme(darkTheme = dark, contrast = settings.contrast) {
    CompositionLocalProvider(com.dracoarts.shared.presentation.components.LocalInteractionSounds provides container.managers.sounds, com.dracoarts.shared.presentation.components.LocalMascotForeground provides soundForeground, LocalBarkMotion provides BarkMotion(reduced = rememberSystemReducedMotion() || settings.reduceMotion || (faults != null && initialScreen == "reduced-motion-state"))) {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            when (val status = startup) {
                StartupState.Loading -> StartupMessage("Opening Soft Paws…")
                is StartupState.Failed -> StartupMessage(status.message, onRetry = { retry++ })
                StartupState.Ready -> {
                    if (!fixtureReady) {
                        StartupMessage(if (fixtureError) "Couldn't prepare the separate review journal." else "Preparing the separate review journal…", if (fixtureError) ({ retry++ }) else null)
                        return@Surface
                    }
                    val journal = remember(container) { JournalController(container.journalAccess, container.managers.storage, container.managers.haptics, platform::nowMillis, platform::timeZone) { container.managers.sounds.play(com.dracoarts.shared.services.SoundCue.Saved) } }
                    val events = remember(container) { container.createEventController(journal::recordSaved) }
                    val timeline = remember(container) { container.createTimelineController() }
                    val care = remember(container) { container.createCareController() }
                    BarkLogShell(state, journal, runtimePlatform, timeline, events, care, container.settings, container.journalAccess, container.companion, reviewEnabled, initialScreen, faults, container.highlights)
                }
            }
        }
        }
    }
}
