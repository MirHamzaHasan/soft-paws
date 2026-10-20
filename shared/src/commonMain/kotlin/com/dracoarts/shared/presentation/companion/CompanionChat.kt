package com.dracoarts.shared.presentation.companion

import androidx.compose.animation.core.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.screens.FeatureNotice
import com.dracoarts.shared.presentation.screens.ConfirmChange
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.launch
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.minus

@Composable internal fun CDialog(title: String, onDismiss: () -> Unit, actions: @Composable ColumnScope.() -> Unit, content: @Composable ColumnScope.() -> Unit) {
    Dialog(onDismiss,properties = DialogProperties(usePlatformDefaultWidth = false)) {
        BoxWithConstraints(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(16.dp),contentAlignment = Alignment.BottomCenter) {
            Surface(Modifier.widthIn(max = 520.dp).fillMaxWidth().heightIn(max = maxHeight),shape = RoundedCornerShape(28.dp),color = boardColor("panel"),border = BorderStroke(1.dp,boardColor("hair"))) {
                Column(Modifier.padding(20.dp),verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text(title,style = MaterialTheme.typography.headlineSmall,modifier = Modifier.semantics { heading() })
                    Column(Modifier.weight(1f,fill = false).verticalScroll(rememberScrollState()),verticalArrangement = Arrangement.spacedBy(16.dp),content = content)
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp),content = actions)
                }
            }
        }
    }
}
@Composable internal fun CCheck(title: String,value: Boolean,enabled: Boolean = true,onChange: (Boolean) -> Unit) {
    val sounds = LocalInteractionSounds.current
    Row(Modifier.fillMaxWidth().heightIn(min = 48.dp).toggleable(value,enabled = enabled,role = Role.Checkbox,onValueChange = { sounds?.play(com.dracoarts.shared.services.SoundCue.Selection); onChange(it) }).padding(vertical = 8.dp),horizontalArrangement = Arrangement.spacedBy(10.dp),verticalAlignment = Alignment.CenterVertically) { Checkbox(value,null,enabled = enabled);Text(title,Modifier.weight(1f),style = MaterialTheme.typography.bodyMedium) }
}
@Composable internal fun CompanionChat(controller: CompanionController,dog: Dog,repository: JournalRepository,platform: AppPlatform,onBack: () -> Unit,onEditVet: () -> Unit) {
    val state by controller.state.collectAsState(); val workspace = state.workspace; val scope = rememberCoroutineScope()
    val input = state.pendingQuestion ?: state.composer.text
    var context by remember { mutableStateOf(false) }; var profileSource by remember { mutableStateOf<ProfileSnapshot?>(null) }; var recordSource by remember { mutableStateOf<List<SourceRecord>?>(null) }
    var menu by remember { mutableStateOf(false) }; var photoMenu by remember { mutableStateOf(false) }; var vet by remember { mutableStateOf(false) }; var report by remember { mutableStateOf(false) }
    var photoRequest by remember { mutableStateOf<Boolean?>(null) }
    LaunchedEffect(photoRequest) {
        photoRequest?.let { camera ->
            // Finish removing the Compose dialog window before UIKit presents its picker.
            withFrameNanos { }; withFrameNanos { }
            try { controller.attachChatPhoto(camera) } finally { photoRequest = null }
        }
    }
    var browseWeek by remember { mutableStateOf(workspace.week) }
    val queryWeek = if(context) browseWeek else workspace.week
    var records by remember(dog.id) { mutableStateOf<List<CareEvent>>(emptyList()) }; var readError by remember { mutableStateOf(false) }
    val active by platform.device.foreground.collectAsState()
    LaunchedEffect(dog.id,queryWeek,active,context) {
        val today = JournalDates.day(platform.nowMillis(),platform.timeZone()); val start = if (queryWeek) today - DatePeriod(days = 6) else today
        try { repository.observeTimeline(TimelineFilter(dog.id,fromMillis = JournalDates.dayBounds(start,platform.timeZone()).first,untilMillis = JournalDates.dayBounds(today,platform.timeZone()).second),100).collect { records = it.events;readError = false } }
        catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled }
        catch (_: Exception) { readError = true;records = emptyList() }
    }
    DisposableEffect(dog.id) { onDispose { controller.stopReply() } }
    val readOnly = state.conversationsFailed || !state.premiumAccess || state.route == CompanionScreen.ThreadReadonly
    val scroll = rememberScrollState()
    val messages = workspace.thread?.messages.orEmpty()
    var following by remember { mutableStateOf(true) }
    LaunchedEffect(scroll.isScrollInProgress) { if (scroll.isScrollInProgress) following = scroll.maxValue - scroll.value < 100 }
    LaunchedEffect(messages.size,state.streaming?.length) { if (messages.isEmpty() && state.streaming == null) scroll.scrollTo(0) else if (following) scroll.scrollTo(scroll.maxValue) }
    val motion = LocalBarkMotion.current
    val focus = LocalFocusManager.current
    // safeDrawing already includes the keyboard. Keep one owner for that space.
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).pointerInput(focus) { detectTapGestures(onTap = { focus.clearFocus() }) }.padding(horizontal = 16.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 56.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ChatIcon("Back to journal", "arrow-left", onClick = onBack)
            Column(Modifier.weight(1f)) { Text("Ask about ${dog.name}", style = MaterialTheme.typography.titleLarge); Text(if (controller.demoResponses) "BarkLog AI · demo" else if (controller.atlasOnly) "BarkLog AI" else "On-device first · BarkLog AI optional", style = MaterialTheme.typography.bodySmall, color = boardColor("ink-muted")) }
            Box {
                ChatIcon("Chat options", "ellipsis", onClick = { menu = true })
                DropdownMenu(menu, { menu = false }, containerColor = boardColor("panel"), tonalElevation = 0.dp, shadowElevation = 0.dp, border = BorderStroke(1.dp, boardColor("hair"))) {
                    DropdownMenuItem(text = { Text("Past conversations") }, onClick = soundAction({ menu = false; controller.go(CompanionScreen.Threads) }))
                    DropdownMenuItem(text = { Text("Report for my vet") }, onClick = soundAction({ menu = false; report = true }))
                    DropdownMenuItem(text = { Text("Call my vet") }, onClick = soundAction({ menu = false; vet = true }))
                }
            }
        }
        if (state.conversationsFailed) ChatRow("Retry saved conversations", "refresh-cw") { scope.launch { controller.reloadConversations() } }
        if (readError) ErrorCard("Couldn't read journal context. Reopen context to retry; your draft is kept.")
        state.error?.let { ErrorCard(it); if (workspace.thread?.messages?.lastOrNull()?.assistant == false && state.streaming == null) ChatRow("Try again", "refresh-cw") { controller.regenerate(dog, records) } }
        if (state.route in setOf(CompanionScreen.ChatOffline, CompanionScreen.ChatError)) { CaptionText(if (controller.atlasOnly) "BarkLog AI needs a connection and sign-in. Your journal works offline." else "Downloaded models work offline. BarkLog AI needs a connection and sign-in."); ChatRow("Try again", "refresh-cw") { controller.go(CompanionScreen.Chat) } }
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
        val viewport = maxHeight
        Column(Modifier.fillMaxWidth().verticalScroll(scroll).heightIn(min = viewport).padding(horizontal = 4.dp), verticalArrangement = Arrangement.spacedBy(24.dp)) {
            if (messages.isEmpty() && state.streaming == null) {
                Column(Modifier.fillMaxWidth().heightIn(min = (viewport - 240.dp).coerceAtLeast(240.dp)).padding(vertical = 10.dp).then(chatArrival("welcome")), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically)) {
                    Surface(shape = RoundedCornerShape(15.dp), color = boardColor("ball"), contentColor = boardColor("ball-ink")) { Box(Modifier.size(44.dp), contentAlignment = Alignment.Center) { BarkIcon("paw-print", Modifier.size(28.dp), boardColor("ball-ink")) } }
                    Text("Let’s talk about\ntheir day.", style = MaterialTheme.typography.displaySmall.copy(fontSize = 34.sp, lineHeight = 36.sp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    Text(dog.details.companion.topics.joinToString(" · ").ifBlank { "A question, a note, a little context." }, style = MaterialTheme.typography.bodySmall, color = boardColor("ink-muted"), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    val prompts = listOf("What do you know about ${dog.name}?", "When was the last walk?", "Help me prepare questions for the vet")
                    prompts.forEachIndexed { i, question -> Box(Modifier.then(chatArrival("prompt-$i", i * 70))) { ChatRow(question, if (i == 1) "footprints" else "message-circle", enabled = !readOnly && !state.busy) { following = true; controller.send(question, dog, records, includeComposer = false) } } }
                }
            }
            messages.forEach { message -> key(message.id) {
                if (message.assistant) Column(Modifier.then(chatArrival(message.id)), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    ChatMark(message.responseSource)
                    val sections = answerSections(barkLogAiText(message.text, message.profile?.name))
                    Text(sections.first, style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 26.sp))
                    if (!message.stopped) WeeklyLogCard(message) { recordSource = it }
                    sections.second?.let { guidance -> JournalCard { CaptionText("General care ideas"); Text(guidance, style = MaterialTheme.typography.bodyMedium) } }
                    if (message.weekly != null) CaptionText("Care logs may be incomplete. A veterinarian can assess health concerns.")
                    if (message.text == ChatHealth.medicationEducation) BarkTextAction("Medication questions · FDA", { if (!platform.device.openSource(ChatHealth.medicationSource)) controller.setError("Couldn't open the FDA guide. You can still ask your vet these questions.") }, icon = "arrow-up-right")
                    if (message.stopped) CaptionText("Response stopped")
                    message.profile?.let { snapshot -> ChatRow("Dog profile used", "paw-print") { profileSource = snapshot } }
                    if (message.weekly == null && message.records.isNotEmpty()) ChatRow("${message.records.size} source records", "notebook-pen") { recordSource = message.records }
                } else Surface(Modifier.align(Alignment.End).widthIn(max = 330.dp).then(chatArrival(message.id)), shape = RoundedCornerShape(20.dp, 20.dp, 5.dp, 20.dp), color = boardColor("inset")) {
                    Column(Modifier.padding(horizontal = 17.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        message.photoIds.forEach { id ->
                            ChatPhoto(id, platform.device, Modifier.fillMaxWidth().height(150.dp))
                            if (!controller.demoResponses && !controller.atlasOnly && !readOnly) BarkTextAction("Describe on device", { controller.describePhoto(id, dog) }, enabled = !state.busy && state.streaming == null)
                        }
                        Text(message.text, style = MaterialTheme.typography.bodyMedium)
                        if (message.photoIds.isNotEmpty()) CaptionText(if (controller.atlasOnly) "Saved on this phone · not sent to BarkLog AI" else "Saved on this phone · describe only with the on-device photo model")
                    }
                }
            } }
            state.streaming?.let { text -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { ChatMark(if(controller.demoResponses) "demo" else "pending"); if (text.isBlank()) ChatTyping(active && !motion.reduced) else Text(text + if (motion.reduced) "" else " ▍", style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 26.sp)) } }
            if (state.streaming == null && messages.lastOrNull()?.assistant == true && !readOnly) BarkTextAction("Try another response", { following = true; controller.regenerate(dog, records) }, icon = "refresh-cw", leading = true)
            val lastQuestion = messages.lastOrNull { !it.assistant }?.text.orEmpty()
            if (ChatHealth.urgent(lastQuestion) || ChatHealth.treatment(lastQuestion)) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(if (ChatHealth.urgent(lastQuestion)) "Urgent concern? Call a vet now." else "Treatment decisions belong with your vet.", style = MaterialTheme.typography.titleSmall)
                    CaptionText("Don’t wait for an AI response to seek urgent veterinary help.")
                    ChatRow("Call my vet", "phone") { vet = true }
                    ChatRow("Prepare a report for my vet", "download") { report = true }
                }
            } else if (messages.isNotEmpty()) BarkTextAction("Report for my vet", { report = true }, icon = "download", leading = true)
            Spacer(Modifier.height(4.dp))
        }
        }
        if (readOnly) { CaptionText("Past conversations remain readable. Your care journal stays free."); BarkTextAction("See demo Premium", { controller.go(CompanionScreen.Paywall) }, icon = "arrow-up-right") }
        else Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(25.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) {
            Column(Modifier.padding(horizontal = 12.dp, vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (state.composer.photoIds.isNotEmpty()) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        state.composer.photoIds.forEachIndexed { index, id ->
                            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                                ChatPhoto(id, platform.device, Modifier.fillMaxWidth().height(64.dp), "Attachment ${index + 1}")
                                BarkTextAction("Remove ${index + 1}", { controller.removeChatPhoto(id) }, enabled = !state.busy && state.streaming == null)
                            }
                        }
                    }
                    CaptionText("Photos stay on this device and are never sent to BarkLog AI.")
                }
                Box(Modifier.fillMaxWidth().heightIn(min = 45.dp).padding(horizontal = 3.dp, vertical = 6.dp)) {
                    if (input.isEmpty()) Text("Ask about ${dog.name}…", style = MaterialTheme.typography.bodyMedium, color = boardColor("ink-muted"))
                    BasicTextField(input, controller::composerText, Modifier.fillMaxWidth().semantics { contentDescription = "Message BarkLog AI" }, enabled = !state.busy, textStyle = MaterialTheme.typography.bodyMedium.copy(color = boardColor("ink")), cursorBrush = SolidColor(boardColor("ink-strong")), maxLines = 4)
                }
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ChatIcon("Attach a photo", "plus", enabled = !state.busy && state.streaming == null && state.composer.photoIds.size < 3) { photoMenu = true }
                    Surface(onClick = soundAction({ context = true }), modifier = Modifier.weight(1f).heightIn(min = 48.dp).semantics { contentDescription = if (controller.atlasOnly || workspace.weeklyAllowed) "Review automatic profile and seven-day context" else "Choose journal context" }, shape = RoundedCornerShape(15.dp), color = boardColor("inset")) {
                        Row(Modifier.padding(horizontal = 10.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                            BarkIcon(if (workspace.recordConsent) "notebook-pen" else "shield", Modifier.size(16.dp))
                            Text(if (controller.atlasOnly || workspace.weeklyAllowed) "Profile + past 7 days" else if (!controller.demoResponses && !controller.atlasOnly) "${dog.name} · auto context" else if (workspace.profileConsent) (if (workspace.recordConsent) "Profile + ${workspace.selectedRecords.size} records" else "Dog profile") else if (workspace.recordConsent) "${workspace.selectedRecords.size} records" else "No context", Modifier.weight(1f), style = MaterialTheme.typography.bodySmall)
                            BarkIcon("chevron-down", Modifier.size(14.dp))
                        }
                    }
                    ChatIcon(if (state.streaming != null) "Stop response" else "Send message", if (state.streaming != null) "square" else "arrow-up", enabled = !state.busy && (state.streaming != null || input.isNotBlank() || state.composer.photoIds.isNotEmpty()), filled = true) { following = true; if (state.streaming != null) controller.stopReply() else controller.send(input, dog, records) }
                }
                Text(if (controller.demoResponses) "Demo replies · not veterinary advice" else if (controller.atlasOnly) "BarkLog AI · general care, not diagnosis" else "On-device first · general care, not diagnosis", Modifier.fillMaxWidth(), style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp), color = boardColor("ink-muted"), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
    }
    if (photoMenu) CDialog("Add a photo", { photoMenu = false }, actions = { BarkTextAction("Back to chat", { photoMenu = false }) }) {
        CaptionText("Up to three photos per message. Use Describe on this phone for a scene-only draft with the downloaded photo model. AI cannot diagnose or assess an image.")
        ChatRow("Choose from photos", "image") { photoMenu = false; photoRequest = false }
        ChatRow("Take a photo", "camera") { photoMenu = false; photoRequest = true }
    }
    if (vet) ChatVetContacts(dog, platform, { vet = false }, { vet = false; onEditVet() })
    if (report) ChatReportDialog(controller, dog, records, platform, { report = false }, { report = false; context = true })
    if(context && (controller.atlasOnly || workspace.weeklyAllowed)) WeeklyContextDialog(controller, dog.id, platform, repository) { context = false }
    else if(context) {
        var profile by remember {mutableStateOf(workspace.profileConsent)};var include by remember {mutableStateOf(workspace.recordConsent)};var selected by remember {mutableStateOf(workspace.selectedRecords.toSet())};var week by remember {mutableStateOf(workspace.week)}
        CDialog(if (controller.demoResponses) "Choose journal context" else "Choose BarkLog AI context",{context = false},actions = {BarkButton("Save context choices",{scope.launch {if(controller.updateAiContext {it.copy(profileConsent = profile,recordConsent = include,selectedRecords = if(include) selected.take(50) else emptyList(),week = week)}) context = false}})}) {
            if (!controller.demoResponses && !controller.atlasOnly) CaptionText("On-device AI automatically uses this dog’s profile and up to 12 recent or relevant care records. These choices control BarkLog AI sharing only.")
            CCheck("Share profile & care notes with BarkLog AI",profile) {profile = it};CCheck("Share selected care records with BarkLog AI",include) {include = it};CaptionText("At most 50 explicit records per reply. Changing the date range clears record selection.")
            CSegment(listOf("Today","This week"),if(week) "This week" else "Today") {value -> week = value == "This week";selected = emptySet();browseWeek = week}
            if(include) records.forEach { event -> CCheck("${event.type.label} · ${JournalDates.dateAndTime(event.occurredAtMillis,platform.timeZone())}",event.id in selected) { on -> selected = if(on) (selected + event.id).take(50).toSet() else selected - event.id } }
            if(include && records.isEmpty()) CaptionText("No records in this range. Your first saved record will appear here.")
        }
    }
    profileSource?.let {snapshot -> CDialog("Dog profile used",{profileSource = null},actions = {BarkButton("Close profile",{profileSource = null})}) { profileFacts(snapshot).forEach { (label, value) -> CaptionText(label); Text(boundedProfileFact(value)) }; CaptionText("Long profile notes may be shortened for a reply.") } }
    recordSource?.let {sources -> CDialog("Source records",{recordSource = null},actions = {BarkButton("Close records",{recordSource = null})}) {sources.forEach {record -> Text("${record.type} · ${JournalDates.dateAndTime(record.at,platform.timeZone())}");Text(record.note.ifBlank {"No extra note recorded."})}} }
}
@Composable internal fun ColumnScope.CompanionChatPages(route: CompanionScreen,controller: CompanionController,journal: JournalState,platform: AppPlatform) {
    val state by controller.state.collectAsState();val workspace = state.workspace;val scope = rememberCoroutineScope()
    var messages by remember {mutableStateOf(workspace.messageConsent && (!controller.atlasOnly || workspace.cloudConsent))};var profile by remember {mutableStateOf(workspace.profileConsent)};var records by remember {mutableStateOf(workspace.recordConsent)}
    var cloud by remember { mutableStateOf(workspace.cloudConsent) }
    var deleteThread by remember { mutableStateOf<CompanionThread?>(null) }
    when(route) {
        CompanionScreen.AiPrivacy -> WeeklyAiConsent(controller, journal.selectedDog?.name ?: state.draft.name.ifBlank { "Your dog" })
        CompanionScreen.Threads -> { CHeading("Our conversations.","Questions, records and the words you kept.");if(workspace.threads.isEmpty()) JournalCard {Text("Your first question goes here.");CaptionText("Conversations stay separate from care records.")};workspace.threads.asReversed().forEach {thread -> BarkButton(thread.title,{scope.launch {controller.openThread(thread.id)}},secondary = true);BarkTextAction("Delete conversation",{deleteThread = thread},danger = true)};CFoot("New conversation") {scope.launch {if(controller.newThread()) controller.go(if(state.premiumAccess) CompanionScreen.Chat else CompanionScreen.AiGate)}} }
        CompanionScreen.ChatLimit -> {CHeading("Your journal keeps going.","This conversation has reached its local message limit.");CaptionText("Start a new conversation. Your existing records and past messages stay available. No usage price or reset schedule has been set.");CFoot("New conversation") {scope.launch {if(controller.newThread()) controller.go(CompanionScreen.Chat)}};BarkTextAction("Read past conversations",{controller.go(CompanionScreen.Threads)})}
        CompanionScreen.WeeklyRecap,CompanionScreen.VetQuestions,CompanionScreen.MemoryCaption -> {
            val title = when(route) {CompanionScreen.WeeklyRecap -> "Weekly recap";CompanionScreen.VetQuestions -> "Appointment questions";else -> "Memory caption"}
            CHeading(title,"Ask about your dog and their saved care.");CaptionText(if (controller.atlasOnly) "BarkLog AI includes your dog’s profile and the past seven days after you enable it. Photos stay on this phone; write a description for a memory caption." else "Local chat adds recent care automatically. Choose shared context for BarkLog AI. Photo descriptions need the downloaded photo model.");CFoot("Open in chat") {scope.launch {if(!controller.newThread()) return@launch;controller.prompt(when(route){CompanionScreen.WeeklyRecap->"Summarize the supplied care records from this week. Say if the supplied sample is incomplete.";CompanionScreen.VetQuestions->"Help me prepare questions for the vet.";else->"Write a caption for a memory with my dog."});if(route == CompanionScreen.WeeklyRecap) controller.updateWorkspace {it.copy(week = true,selectedRecords = emptyList())};controller.go(if(!state.premiumAccess) CompanionScreen.AiGate else if(controller.requiresAiConsent) CompanionScreen.AiPrivacy else CompanionScreen.Chat)}};BarkTextAction("Use the free journal",{controller.go(null)})
        }
        else -> Unit
    }
    deleteThread?.let { thread -> ConfirmChange("Delete this conversation?", "“${thread.title}” and its saved messages will be removed. Your care records stay.", "Delete conversation", false, { deleteThread = null }) { scope.launch { if (controller.deleteThread(thread.id)) deleteThread = null } } }
}

@Composable
private fun ChatRow(label: String, icon: String, enabled: Boolean = true, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    Surface(soundAction(onClick), Modifier.fillMaxWidth().heightIn(min = 48.dp).then(pressMotion(source, enabled)), enabled = enabled, interactionSource = source, shape = RoundedCornerShape(16.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon(icon, Modifier.size(18.dp)); Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodySmall); BarkIcon("arrow-up-right", Modifier.size(15.dp)) }
    }
}
@Composable
private fun ChatIcon(label: String, icon: String, enabled: Boolean = true, filled: Boolean = false, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    Surface(soundAction(onClick), Modifier.size(48.dp).semantics { contentDescription = label }.then(pressMotion(source, enabled)), enabled = enabled, interactionSource = source, shape = CircleShape, color = if (filled) boardColor("ink-strong") else boardColor("panel"), contentColor = if (filled) boardColor("ground") else boardColor("ink"), border = if (filled) null else BorderStroke(1.dp, boardColor("hair"))) { Box(contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(21.dp)) } }
}
@Composable private fun ChatMark(source: String) {
    val label = when(source) { "local" -> "On-device AI"; "journal" -> "Saved journal facts"; "local-caption" -> "On-device photo draft"; "atlas" -> "BarkLog AI"; "safety" -> "BarkLog safety guidance"; "pending" -> "Preparing your answer"; else -> "Demo answer" }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) { BarkIcon("paw-print", Modifier.size(18.dp), boardColor("accent-text")); Text(label, style = MaterialTheme.typography.labelMedium) }
}
@Composable private fun chatArrival(key: Any, stagger: Int = 0): Modifier {
    val reduced = LocalBarkMotion.current.reduced
    val pose = remember(key) { Animatable(if (reduced) 1f else 0f) }
    LaunchedEffect(key, reduced) { if (reduced) pose.snapTo(1f) else { delay(stagger.toLong()); pose.animateTo(1f, tween(420, easing = CubicBezierEasing(0f, 0f, .2f, 1f))) } }
    return Modifier.graphicsLayer { alpha = pose.value; translationY = 8.dp.toPx() * (1 - pose.value) }
}
@Composable private fun ChatTyping(animated: Boolean) {
    if (!animated) { CaptionText("Preparing reply…"); return }
    val transition = rememberInfiniteTransition(label = "reply activity")
    Row(Modifier.semantics { contentDescription = "Preparing reply" }, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        repeat(3) { index -> val alpha by transition.animateFloat(.35f, 1f, infiniteRepeatable(tween(480, delayMillis = index * 90), RepeatMode.Reverse), label = "reply dot $index"); Surface(Modifier.size(5.dp).graphicsLayer { this.alpha = alpha }, shape = CircleShape, color = boardColor("ink-strong")) {} }
    }
}
