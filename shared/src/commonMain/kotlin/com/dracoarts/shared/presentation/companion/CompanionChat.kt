package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
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
@Composable private fun CCheck(title: String,value: Boolean,onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().heightIn(min = 48.dp).toggleable(value,role = Role.Checkbox,onValueChange = onChange).padding(vertical = 8.dp),horizontalArrangement = Arrangement.spacedBy(10.dp),verticalAlignment = Alignment.CenterVertically) { Checkbox(value,null);Text(title,Modifier.weight(1f),style = MaterialTheme.typography.bodyMedium) }
}
@Composable internal fun CompanionChat(controller: CompanionController,dog: Dog,repository: JournalRepository,platform: AppPlatform,onBack: () -> Unit) {
    val state by controller.state.collectAsState(); val workspace = state.workspace; val scope = rememberCoroutineScope()
    var input by rememberSaveable(dog.id) { mutableStateOf(state.pendingQuestion.orEmpty()) }; var context by remember { mutableStateOf(false) }; var profileSource by remember { mutableStateOf<ProfileSnapshot?>(null) }; var recordSource by remember { mutableStateOf<List<SourceRecord>?>(null) }
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
    val readOnly = state.conversationsFailed || !state.session.premium || state.route == CompanionScreen.ThreadReadonly
    LaunchedEffect(state.submittedId) {if(input==state.submittedQuestion)input=""}
    val scroll = rememberScrollState()
    val messages = workspace.thread?.messages.orEmpty()
    LaunchedEffect(messages.size,state.streaming?.length) { scroll.scrollTo(scroll.maxValue) }
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).imePadding().padding(horizontal = 20.dp,vertical = 12.dp),verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically,horizontalArrangement = Arrangement.spacedBy(12.dp)) { BoardBackButton(onBack); Column(Modifier.weight(1f)) {Text("Ask about ${dog.name}",style = MaterialTheme.typography.headlineSmall);CaptionText("BarkLog · demo AI")};BarkTextAction("History",{controller.go(CompanionScreen.Threads)},icon = "panel-left") }
        CaptionText("Demo replies · generated locally from selected context; no network AI.")
        if(state.conversationsFailed) BarkButton("Retry saved conversations",{scope.launch {controller.reloadConversations()}})
        if (readError) ErrorCard("Couldn't read journal context. Chat without records, or reopen context to retry.")
        state.error?.let {ErrorCard(it); if(workspace.thread?.messages?.lastOrNull()?.assistant==false && state.streaming==null) BarkButton("Try again",{controller.regenerate(dog,records)})}
        if (state.route in setOf(CompanionScreen.ChatOffline,CompanionScreen.ChatError)) { FeatureNotice("Your message can wait","This is the connection recovery surface. Local demo replies work offline.","wifi-off");BarkButton("Try again",{controller.go(CompanionScreen.Chat)}) }
        Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(scroll),verticalArrangement = Arrangement.spacedBy(24.dp)) {
            if(messages.isEmpty()) {Spacer(Modifier.height(30.dp));CHeading("Let’s talk about their day.",dog.details.companion.topics.joinToString(" · "));listOf("What did today look like?","When was the last walk?","Help me prepare questions for the vet", "What do you know about ${dog.name}?").forEach { question -> BarkButton(question,{controller.send(question,dog,records)},secondary = true,enabled = !readOnly && state.streaming == null) }}
            messages.forEach { message ->
                if(message.assistant) Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    CaptionText("BarkLog AI · demo");Text(message.text,style = MaterialTheme.typography.bodyLarge)
                    if(message.stopped) CaptionText("Response stopped")
                    message.profile?.let { snapshot -> BarkButton("Dog profile used",{profileSource = snapshot},secondary = true,icon = "paw-print") }
                    if(message.records.isNotEmpty()) BarkButton("${message.records.size} source records",{recordSource = message.records},secondary = true,icon = "notebook-pen")
                } else Surface(Modifier.align(Alignment.End).widthIn(max = 330.dp),shape = RoundedCornerShape(20.dp,20.dp,5.dp,20.dp),color = boardColor("inset")) {Text(message.text,Modifier.padding(16.dp))}
            }
            state.streaming?.let { Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {CaptionText("BarkLog AI · writing demo reply");Text(it.ifBlank { "…" })} }
            if(state.streaming == null && messages.lastOrNull()?.assistant == true && !readOnly) BarkTextAction("Try another response",{controller.regenerate(dog,records)})
        }
        if(readOnly) {CaptionText("Past conversations remain readable. Your care journal stays free.");BarkButton("See demo Premium",{controller.go(CompanionScreen.Paywall)})}
        else JournalCard {
            OutlinedTextField(input,{input = it.take(4000)},Modifier.fillMaxWidth().semantics {contentDescription = "Message BarkLog AI"},placeholder = {Text("Ask about ${dog.name}…")},maxLines = 4,shape = RoundedCornerShape(16.dp))
            Row(Modifier.fillMaxWidth(),verticalAlignment = Alignment.CenterVertically,horizontalArrangement = Arrangement.spacedBy(8.dp)) {BarkTextAction(if(workspace.profileConsent) "Profile + ${workspace.selectedRecords.size} records" else if(workspace.recordConsent) "${workspace.selectedRecords.size} records" else "No context",{context = true},Modifier.weight(1f),icon = "notebook-pen"); if(state.streaming != null) BarkTextAction("Stop",controller::stopReply) else BarkTextAction("Send",{val question = input;controller.send(question,dog,records)},enabled = input.isNotBlank(),icon = "arrow-up")}
        }
    }
    if(context) {
        var profile by remember {mutableStateOf(workspace.profileConsent)};var include by remember {mutableStateOf(workspace.recordConsent)};var selected by remember {mutableStateOf(workspace.selectedRecords.toSet())};var week by remember {mutableStateOf(workspace.week)}
        CDialog("Choose journal context",{context = false},actions = {BarkButton(if(include) "Use selected context" else "Chat without records",{scope.launch {if(controller.updateWorkspace {it.copy(profileConsent = profile,recordConsent = include,selectedRecords = if(include) selected.take(50) else emptyList(),week = week)}) context = false}})}) {
            CCheck("Include profile & care notes",profile) {profile = it};CCheck("Include selected care records",include) {include = it};CaptionText("At most 50 explicit records per reply. Changing the date range clears record selection.")
            CSegment(listOf("Today","This week"),if(week) "This week" else "Today") {value -> week = value == "This week";selected = emptySet();browseWeek = week}
            if(include) records.forEach { event -> CCheck("${event.type.label} · ${JournalDates.dateAndTime(event.occurredAtMillis,platform.timeZone())}",event.id in selected) { on -> selected = if(on) (selected + event.id).take(50).toSet() else selected - event.id } }
            if(include && records.isEmpty()) CaptionText("No records in this range. Your first saved record will appear here.")
        }
    }
    profileSource?.let {snapshot -> CDialog("Dog profile used",{profileSource = null},actions = {BarkButton("Close profile",{profileSource = null})}) {CProfile(snapshot)} }
    recordSource?.let {sources -> CDialog("Source records",{recordSource = null},actions = {BarkButton("Close records",{recordSource = null})}) {sources.forEach {record -> Text("${record.type} · ${JournalDates.dateAndTime(record.at,platform.timeZone())}");Text(record.note.ifBlank {"No extra note recorded."})}} }
}
@Composable internal fun ColumnScope.CompanionChatPages(route: CompanionScreen,controller: CompanionController,journal: JournalState,platform: AppPlatform) {
    val state by controller.state.collectAsState();val workspace = state.workspace;val scope = rememberCoroutineScope()
    var messages by remember {mutableStateOf(workspace.messageConsent)};var profile by remember {mutableStateOf(workspace.profileConsent)};var records by remember {mutableStateOf(workspace.recordConsent)}
    var deleteThread by remember { mutableStateOf<CompanionThread?>(null) }
    when(route) {
        CompanionScreen.AiPrivacy -> { CHeading("You choose what AI sees.","Your journal is never added in the background.");JournalCard {Text("Messages and chosen records");CaptionText("No whole-journal access. No diagnosis or medication advice.")};CaptionText("This build uses local demo replies. Future online AI will need separate provider and privacy choices.");CCheck("Use the messages I send for an AI response.",messages) {messages = it};CCheck("Include my dog’s profile and care notes.",profile) {profile = it};CCheck("Include care records I select in chat.",records) {records = it};CFoot("Open AI chat",enabled = messages) {scope.launch {if(controller.updateWorkspace {it.copy(messageConsent = messages,profileConsent = profile,recordConsent = records)}) controller.go(if(state.session.premium) CompanionScreen.Chat else CompanionScreen.AiGate)}};BarkTextAction("Keep using my journal",{controller.go(null)}) }
        CompanionScreen.Threads -> { CHeading("Our conversations.","Questions, records and the words you kept.");if(workspace.threads.isEmpty()) JournalCard {Text("Your first question goes here.");CaptionText("Conversations stay separate from care records.")};workspace.threads.asReversed().forEach {thread -> BarkButton(thread.title,{scope.launch {controller.openThread(thread.id)}},secondary = true);BarkTextAction("Delete conversation",{deleteThread = thread},danger = true)};CFoot("New conversation") {scope.launch {if(controller.newThread()) controller.go(if(state.session.premium) CompanionScreen.Chat else CompanionScreen.AiGate)}} }
        CompanionScreen.ChatLimit -> {CHeading("Your journal keeps going.","This conversation has reached its local message limit.");CaptionText("Start a new conversation. Your existing records and past messages stay available. No usage price or reset schedule has been set.");CFoot("New conversation") {scope.launch {if(controller.newThread()) controller.go(CompanionScreen.Chat)}};BarkTextAction("Read past conversations",{controller.go(CompanionScreen.Threads)})}
        CompanionScreen.WeeklyRecap,CompanionScreen.VetQuestions,CompanionScreen.MemoryCaption -> {
            val title = when(route) {CompanionScreen.WeeklyRecap -> "Weekly recap";CompanionScreen.VetQuestions -> "Appointment questions";else -> "Memory caption"}
            CHeading(title,"Bring the records you choose into a conversation.");CaptionText("Demo AI · select context in chat before asking.");CFoot("Open in chat") {scope.launch {if(!controller.newThread()) return@launch;controller.prompt(when(route){CompanionScreen.WeeklyRecap->"Summarize the selected care records for this week.";CompanionScreen.VetQuestions->"Help me prepare questions for the vet.";else->"Write a caption for a memory with my dog."});if(route == CompanionScreen.WeeklyRecap) controller.updateWorkspace {it.copy(week = true,selectedRecords = emptyList())};controller.go(if(!state.session.premium) CompanionScreen.AiGate else if(!workspace.messageConsent) CompanionScreen.AiPrivacy else CompanionScreen.Chat)}};BarkTextAction("Use the free journal",{controller.go(null)})
        }
        else -> Unit
    }
    deleteThread?.let { thread -> ConfirmChange("Delete this conversation?", "“${thread.title}” and its saved messages will be removed. Your care records stay.", "Delete conversation", false, { deleteThread = null }) { scope.launch { if (controller.deleteThread(thread.id)) deleteThread = null } } }
}
