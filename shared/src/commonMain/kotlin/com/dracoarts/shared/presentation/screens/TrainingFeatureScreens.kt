package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.Alignment
import androidx.compose.foundation.shape.RoundedCornerShape
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun TrainingFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val program = TrainingCatalog.programs.firstOrNull { it.id == page.id.substringBefore('@') }
    val sessions = context.items.filter { it.data is CareItemData.Session }
    when (page.feature) {
        Feature.Training -> {
            var programs by remember { mutableStateOf<List<TrainingProgram>?>(null) }
            var failed by remember { mutableStateOf(false) }
            var retry by remember { mutableIntStateOf(0) }
            LaunchedEffect(retry) {
                programs = null; failed = false
                try { programs = context.reviewFaults?.trainingPrograms() ?: TrainingCatalog.programs }
                catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled }
                catch (_: Exception) { failed = true }
            }
            if (failed) {
                FeatureNotice("Couldn't open training programs", "Recorded sessions were not removed.", "circle-x", tone = "bad")
                BarkButton("Try again", { retry++ }, icon = "refresh-cw")
                return
            }
            ScreenHeading("Training", "${context.dog.name} · short, kind sessions")
            if (programs == null) { JournalCard { repeat(3) { SkeletonLine(180.dp, 28.dp); SkeletonLine(240.dp) } }; return }
            if (programs!!.isEmpty()) {
                JournalCard { SectionTitle("No programs available"); SupportingText("Your saved session history is still on this device."); BarkButton("Try again", { retry++ }, secondary = true, icon = "refresh-cw") }
                return
            }
            Surface(shape = RoundedCornerShape(26.dp), color = boardColor("info-soft")) { Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) { AnimatedDog(Modifier.align(Alignment.CenterHorizontally).size(144.dp, 164.dp)); Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) { BarkIcon("heart", Modifier.size(24.dp), boardColor("photo-ink")); Column(Modifier.weight(1f)) { Text("Reward what you want to see", style = MaterialTheme.typography.titleMedium); Text(TrainingCatalog.stop, style = MaterialTheme.typography.bodySmall) } } } }
            BoardMenu { programs!!.forEach { item ->
                val count = sessions.count { (it.data as CareItemData.Session).programId == item.id }
                FeatureRow(item.title, "${item.steps.size} steps · ${if (item.id == "name-response") "about 4 minutes" else if (item.id == "settle-mat") "about 6 minutes" else "outside"}", when (item.id) { "name-response" -> "target"; "settle-mat" -> "hand"; else -> "footprints" }, meta = if (count == 0) "Not started" else "$count saved", tone = "training") { context.open(Feature.Program, item.id) }
            } }
        }
        Feature.Program, Feature.TrainingProgress -> {
            if (program == null) { FeatureNotice("Program unavailable", "Your saved practice remains in Timeline."); return }
            val enrolled = context.items.any { (it.data as? CareItemData.Enrollment)?.programId == program.id }
            val progress = sessions.filter { (it.data as CareItemData.Session).programId == program.id }
            val progressView = page.feature == Feature.TrainingProgress
            ScreenHeading(program.title, if (progressView) "${context.dog.name} · enrolled program" else if (program.id == "name-response") "Notice → mark → reward" else program.purpose)
            JournalCard {
                AnimatedDog(Modifier.align(Alignment.CenterHorizontally).size(144.dp, 170.dp), cropped = true)
                if (progressView) { CaptionText("SAVED PRACTICE"); BoardTotal("${progress.size} ${if (progress.size == 1) "session" else "sessions"}"); val latest = progress.maxByOrNull { it.occurredAt }?.data as? CareItemData.Session; latest?.let { SupportingText("${it.responses} successful responses in the latest session.") } }
                else { CaptionText(if (program.id == "name-response") "ABOUT 4 MINUTES" else "SHORT, KIND PRACTICE"); SectionTitle(if (program.id == "name-response") "Build a cheerful check-in" else program.purpose); SupportingText(if (program.id == "name-response") "Say the name once. When ${context.dog.name} looks toward you, mark the moment and offer a small reward." else program.steps.first().instruction); HorizontalDivider(); CaptionText("Practice in a quiet, safe place. Pause if ${context.dog.name} disengages or shows stress.") }
            }
            if (!progressView) { SectionTitle(if (program.steps.size == 3) "Three steps" else "Four steps"); BoardMenu { program.steps.forEach { step -> BoardFactRow(step.title, step.instruction, family = "training") } } }
            val form = rememberFeatureForm(context, "enrollment-${program.id}")
            if (!enrolled) BarkButton(if (context.saving) "Saving…" else "Start session", { scope.launch {
                if (context.care.save(context.dog.id, form.requestId, form.createdAt, CareItemData.Enrollment(program.id)) != null) context.open(Feature.Session, "${program.id}@0@${context.platform.newId()}")
            } }, enabled = !context.saving, icon = "play")
            else BarkButton(if (progressView) "Practice again" else "Start session", { context.open(Feature.Session, "${program.id}@0@${context.platform.newId()}") }, icon = "play")
            if (enrolled && !progressView) BarkButton("View program progress", { context.open(Feature.TrainingProgress, program.id) }, secondary = true, icon = "chart-no-axes-column-increasing")
            if (progressView && progress.isNotEmpty()) {
                SectionTitle("Session history")
                progress.forEach { item -> val data = item.data as CareItemData.Session
                    FeatureRow("${data.seconds / 60} min ${data.seconds % 60} sec · ${data.rating}", "${JournalDates.dateLabel(JournalDates.day(item.occurredAt, context.zone))} · ${data.responses} observed responses", "circle-check") { context.navigation.detail(item.dogId, item.id) }
                }
            }
        }
        Feature.Session -> {
            if (program == null) { FeatureNotice("Program unavailable", "Your saved sessions remain in Timeline."); return }
            var step by rememberSaveable(page.id) { mutableIntStateOf(page.id.split('@').getOrNull(1)?.toIntOrNull()?.coerceIn(program.steps.indices) ?: 0) }
            var seconds by rememberSaveable(page.id) { mutableIntStateOf(0) }
            var activeSince by rememberSaveable(page.id) { mutableLongStateOf(context.platform.monotonicMillis()) }
            var paused by rememberSaveable(page.id) { mutableStateOf(false) }
            var reviewing by rememberSaveable(page.id) { mutableStateOf(false) }
            var responses by rememberSaveable(page.id) { mutableIntStateOf(0) }
            var shownSeconds by remember { mutableIntStateOf(seconds) }
            var confirm by remember { mutableStateOf(false) }
            val form = rememberFeatureForm(context, "session-${page.id}", mapOf("rating" to "Getting there", "mood" to "Not recorded"))
            LaunchedEffect(paused, reviewing) {
                if (!paused && !reviewing) while (true) { shownSeconds = (seconds + ((context.platform.monotonicMillis() - activeSince).coerceAtLeast(0) / 1000).coerceAtMost(7200).toInt()).coerceIn(0, 7200); delay(1000) }
                else shownSeconds = seconds
            }
            DisposableEffect(page.id) {
                context.navigation.backGuard = { confirm = true; true }
                onDispose { context.navigation.backGuard = null }
            }
            ScreenHeading(program.title, "Step ${step + 1} of ${program.steps.size} · ${shownSeconds / 60}:${(shownSeconds % 60).toString().padStart(2, '0')} elapsed")
            LinearProgressIndicator(progress = { (step + 1f) / program.steps.size }, modifier = Modifier.fillMaxWidth().height(12.dp), color = boardColor("ink-strong"), trackColor = boardColor("inset"), drawStopIndicator = {})
            if (!reviewing) {
                JournalCard { CaptionText(if (paused) "PAUSED" else "NOW"); BoardTotal(program.steps[step].title); SupportingText(program.steps[step].instruction) }
                BarkButton("Mark a successful response · $responses", { if (responses < 10000) { responses++; context.platform.haptics.selectionChange() } }, enabled = !paused, icon = "check")
                if (step < program.steps.lastIndex) BarkButton("Next step", { step++ }, secondary = true, icon = "arrow-right")
                BarkTextAction(if (paused) "Resume" else "Pause", {
                    if (paused) activeSince = context.platform.monotonicMillis() else seconds = shownSeconds
                    paused = !paused
                }, icon = if (paused) "play" else "pause")
                BarkButton("Finish session", { seconds = shownSeconds.coerceAtLeast(1); reviewing = true }, secondary = true)
            } else {
                SectionTitle("Your observations")
                ChoiceField("How did it feel?", form["rating"], listOf("Easy", "Getting there", "Try again").map { it to it }, !context.saving) { form["rating"] = it }
                ChoiceField("Observed mood", form["mood"], listOf("Not recorded", "Calm", "Playful", "Low energy", "Restless").map { it to it }, !context.saving) { form["mood"] = it }
                FeatureInput(form, "notes", "Practice notes · optional", !context.saving, multiline = true)
                FeatureFormError(form)
                BarkButton(if (context.saving) "Saving…" else "Save session", { scope.launch { form.attempt {
                    val item = context.care.activity(context.dog.id, form.requestId, form.createdAt, CareItemData.Session(program.id, step, seconds.coerceAtLeast(1), form["rating"], form["mood"], form["notes"].trim(), responses))
                    if (item != null) {
                        context.activityLogged(item); context.navigation.backGuard = null
                        context.navigation.replace(Feature.TrainingSummary, item.id)
                    }
                } } }, enabled = !context.saving, icon = "check")
            }
            BarkTextAction("Cancel without saving", { confirm = true }, enabled = !context.saving)
            if (confirm) ConfirmChange("End without saving?", "This session will not advance progress or be added to Timeline.", "End session", context.saving, { confirm = false }) {
                context.navigation.backGuard = null; context.navigation.backUnconditionally()
            }
        }
        Feature.TrainingSummary -> {
            val item = context.items.firstOrNull { it.id == page.id }; val data = item?.data as? CareItemData.Session
            if (data == null) { FeatureNotice("Session unavailable", "Your other practice remains in Timeline."); return }
            FeatureNotice("Session saved", "${TrainingCatalog.programs.first { it.id == data.programId }.title} · ${data.seconds / 60} min ${data.seconds % 60} sec · ${data.responses} successful responses", "circle-check-big")
            JournalCard { CaptionText("TIMELINE RECORD"); Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) { EventMark(CareEventType.Training); Column { SectionTitle(TrainingCatalog.programs.first { it.id == data.programId }.title); CaptionText("${data.seconds / 60} min · ${data.responses} responses · ${JournalDates.inputTime(item.occurredAt, context.zone)}") } } }
            BarkButton("Done", { context.navigation.show(Route.Home) }, icon = "check")
            BarkButton("View program progress", { context.navigation.replace(Feature.TrainingProgress, data.programId) }, secondary = true)
            BarkTextAction("View Timeline record", { context.navigation.detail(item.dogId, item.id) })
        }
        else -> error("Not a training destination")
    }
    CaptionText("Caregiver-observed practice only. No behavioral diagnosis. Content set ${TrainingCatalog.version} follows AVSAB reward-based principles.")
    BarkTextAction("Training source", { context.platform.device.openSource(TrainingCatalog.source) }, icon = "arrow-up-right")
}
