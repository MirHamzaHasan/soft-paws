package com.dracoarts.shared.presentation.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.Alignment
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.*
import kotlinx.datetime.TimeZone
import kotlinx.coroutines.flow.first
import com.dracoarts.shared.services.ReminderRequest
import com.dracoarts.shared.presentation.review.boardReviewFeatures
import com.dracoarts.shared.presentation.review.boardReviewTabs
import com.dracoarts.shared.presentation.review.boardReviewArgument
import com.dracoarts.shared.presentation.review.BoardReviewFixture
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.pow

@Composable
fun BarkLogShell(state: AppState, controller: JournalController, platform: AppPlatform,
    timeline: TimelineController, events: EventController, care: CareController, settings: SettingsController,
    repository: JournalRepository, companion: com.dracoarts.shared.presentation.companion.CompanionController, reviewEnabled: Boolean = false, reviewStart: String? = null,
    reviewFaults: com.dracoarts.shared.presentation.review.BoardReviewFaults? = null,
    highlights: com.dracoarts.shared.presentation.highlights.HighlightController? = null) {
    val journal by controller.state.collectAsState()
    val focus = LocalFocusManager.current
    val careState by care.state.collectAsState()
    val scope = rememberCoroutineScope()
    var retry by remember { mutableIntStateOf(0) }
    var now by remember { mutableLongStateOf(platform.nowMillis()) }
    var zone by remember { mutableStateOf(platform.timeZone()) }
    val today = JournalDates.day(now, zone)
    LaunchedEffect(controller, retry, today, zone.id) {
        val (from, until) = JournalDates.dayBounds(today, zone)
        controller.observe(maxOf(0, from), until)
    }
    LaunchedEffect(journal.selectedDogId) { journal.selectedDogId?.let { care.observe(it) } }
    LaunchedEffect(journal.feedback) { if (journal.feedback != null) { delay(6000); controller.clearFeedback() } }
    LaunchedEffect(careState.feedback, careState.dogId) { if (careState.feedback != null) { care.processCleanup(); delay(6000); care.clearFeedback() } }
    LaunchedEffect(care) { care.processCleanup() }
    val active by platform.device.foreground.collectAsState()
    LaunchedEffect(platform, active) { if (active) while (true) { now = platform.nowMillis(); zone = platform.timeZone(); delay(30_000) } }
    LaunchedEffect(active, journal.dogs, careState.items) {
        if (active) {
            care.processCleanup()
            journal.dogs.forEach { dog ->
                try {
                    val items = care.items(dog.id)
                    items.filter { it.data is CareItemData.Task || it.data is CareItemData.Medication }.forEach { item ->
                        val task = CareReminderSchedule.task(item.data)
                        val completed = CareReminderSchedule.completed(item, items)
                        val next = task?.let { CareSchedule.next(it, platform.nowMillis(), completed) }
                        if (task != null && next != null) platform.device.scheduleReminder(ReminderRequest(item.id, dog.id, next.second, task.repeat, task.zoneId, CareSchedule.upcoming(task, platform.nowMillis(), completed)))
                        else platform.device.cancelReminder(item.id)
                    }
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { /* Reconcile on the next foreground; local logging remains available. */ }
            }
        }
    }
    val openedReminder by platform.device.reminderOpens.collectAsState()
    LaunchedEffect(openedReminder) {
        val target = openedReminder
        if (target != null) {
            controller.state.first { !it.loading }
            snapshotFlow { state.backGuard }.first { it == null }
            try {
                if (controller.state.value.dogs.any { it.id == target.dogId }) {
                    controller.selectDog(target.dogId)
                    val data = care.items(target.dogId).firstOrNull { it.id == target.taskId }?.data
                    if (data is CareItemData.Medication) {
                        state.openReminder(Feature.MedicationDetail, target.taskId)
                    } else {
                        if (data is CareItemData.Task) state.openReminder(Feature.TaskDetail, target.taskId + "@" + JournalDates.day(target.occurredAtMillis ?: platform.nowMillis(), TimeZone.of(data.zoneId)))
                        else state.openReminder(Feature.Calendar)
                    }
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) {
                // A removed task or transient read failure must not interrupt the journal.
            }
            platform.device.consumedReminder()
        }
    }
    if (journal.loading && journal.selectedDog == null) { StartupMessage("Reading your journal…"); return }
    if (journal.readFailed) { StartupMessage(journal.error ?: "Couldn't read your journal.", onRetry = { retry++ }); return }
    var onboardingInProgress by rememberSaveable { mutableStateOf(journal.selectedDog == null) }
    var hadDog by rememberSaveable { mutableStateOf(journal.dogs.isNotEmpty()) }
    var noDogAccepted by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(journal.dogs) { if (journal.dogs.isNotEmpty()) { hadDog = true; noDogAccepted = false } }
    val savedScreens = rememberSaveableStateHolder()
    val parentMotion = LocalBarkMotion.current
    var replay by remember { mutableIntStateOf(0) }
    var speed by rememberSaveable { mutableStateOf(1f) }
    var reviewStarted by rememberSaveable { mutableStateOf(false) }
    var reviewOnboarding by rememberSaveable { mutableStateOf(reviewEnabled && reviewStart in onboardingBoardIds) }
    LaunchedEffect(reviewEnabled, journal.selectedDogId) {
        if (reviewEnabled && !reviewStarted && journal.selectedDogId != null) {
            reviewStarted = true
            val route = when (reviewStart) { "health" -> Route.Care; "photos" -> Route.Memories; "profile" -> Route.Profile; else -> null }
                ?: boardReviewTabs[reviewStart] ?: Route.entries.firstOrNull { it.name.equals(reviewStart, true) }
            val feature = boardReviewFeatures[reviewStart] ?: Feature.entries.firstOrNull { it.name.equals(reviewStart, true) }
            val type = if (reviewStart == "log-groom") CareEventType.Grooming else CareEventRules.detailedTypes.firstOrNull { it.name.equals(reviewStart?.removePrefix("form-")?.removePrefix("log-"), true) }
            when {
                route != null -> state.show(route)
                feature != null -> {
                    val argument = if (reviewStart == "task-detail") {
                        care.items(journal.selectedDogId!!).firstOrNull { it.data is CareItemData.Task }?.let { item ->
                            "${item.id}@${(item.data as CareItemData.Task).date}"
                        }.orEmpty()
                    } else if (reviewStart == "med-detail") {
                        // Cat review routes resolve an actual record in the selected journal.
                        // Historical BarkLog fixture IDs never stand in for a cat's plan.
                        care.items(journal.selectedDogId!!).firstOrNull { it.data is CareItemData.Medication }?.id.orEmpty()
                    } else if (reviewStart in setOf("report", "export-options", "export-progress", "cat-export-failure") && reviewStart in boardReviewFeatures) {
                        val reportScope = CareReportScope(journal.selectedDogId!!, "2026-10-14", "2026-10-20").argument()
                        reportScope + if (feature == Feature.Export) "@CSV" else ""
                    } else if (reviewStart in boardReviewFeatures) boardReviewArgument(reviewStart, feature, platform::newId) else ""
                    state.open(feature, argument)
                }
                type != null -> state.newLog(journal.selectedDogId!!, type, platform.newId())
                reviewStart in setOf("record", "record-edit", "delete-record") -> {
                    repository.observeTimeline(TimelineFilter(journal.selectedDogId!!), 1).first().events.firstOrNull()?.let { event ->
                        if (reviewStart == "record-edit") state.edit(event.dogId, event.id, platform.newId()) else state.detail(event.dogId, event.id)
                    }
                }
                reviewStart in setOf("record-detail", "delete-confirmation") -> state.detail(journal.selectedDogId!!, BoardReviewFixture.itemId(100))
                reviewStart in setOf("record-edit", "stale-record") -> state.edit(journal.selectedDogId!!, BoardReviewFixture.itemId(100), platform.newId())
                reviewStart == "form-notes-example" -> state.newLog(journal.selectedDogId!!, CareEventType.Walk, platform.newId())
                reviewStart in setOf("save-error", "retained-draft") -> state.newLog(journal.selectedDogId!!, CareEventType.Meal, platform.newId())
                reviewStart == "saving-state" -> state.newLog(journal.selectedDogId!!, CareEventType.Walk, platform.newId())
            }
        }
    }
    val context = journal.selectedDog?.let { dog ->
        val scopedCare = careState.takeIf { it.dogId == dog.id } ?: CareState(dogId = dog.id)
        FeatureContext(journal, controller, care, scopedCare, settings, state, platform, repository, now, zone, if (reviewEnabled) reviewStart else null, reviewFaults, highlights, companion,
            resetFeatureView = { destination -> savedScreens.removeState(featureViewKey(dog.id, destination)) })
    }
    val useCompanion = com.dracoarts.shared.presentation.companion.companionAvailable(reviewEnabled, reviewStart, journal.selectedDog != null)
    val companionState by companion.state.collectAsState()
    LaunchedEffect(useCompanion) { if (useCompanion) companion.load(journal.selectedDog, com.dracoarts.shared.presentation.companion.CompanionScreen.fromBoard(reviewStart)) }
    LaunchedEffect(useCompanion, journal.selectedDogId, companionState.loading) { if (useCompanion && !companionState.loading) journal.selectedDogId?.let { companion.activateDog(it) } }
    if (useCompanion && companionState.loading) { StartupMessage("Opening your saved setup…"); return }
    if (useCompanion && companionState.loadFailed) { StartupMessage(companionState.error ?: "Couldn't read saved setup.",onRetry={scope.launch {companion.load(journal.selectedDog)}});return }
    val onEnterJournal: suspend (String) -> Unit = { id ->
        if (controller.selectDog(id)) {
            val opened = controller.state.first { it.readFailed || (it.selectedDogId == id && !it.loading) }
            if (!opened.readFailed) {
                onboardingInProgress = false; reviewOnboarding = false; companion.enterJournal(state)
            } else companion.setError("Your dog is saved. Couldn't read their journal yet. Try again.")
        } else companion.setError(controller.state.value.error ?: "Your dog is saved. Try opening their journal again.")
    }
    // Profile is a journal tab. Keep its scene and dock in this composition so the
    // selected pill retains its live position when entering/leaving the account menu.
    val accountTab = useCompanion && companionState.route == com.dracoarts.shared.presentation.companion.CompanionScreen.AccountSettings
    if (useCompanion && companionState.route != null && !accountTab) {
        com.dracoarts.shared.presentation.companion.CompanionHost(companion, journal, controller, care, platform, state, repository, reviewEnabled = reviewEnabled && reviewStart == null,
            onEnterJournal = onEnterJournal)
        return
    }
    var footer by remember { mutableStateOf<BoardFooterContent?>(null) }
    val publishFooter = remember { { value: BoardFooterContent? -> footer = value } }
    var coach by remember { mutableStateOf<BoardCoachSpec?>(null) }
    val publishCoach = remember { { value: BoardCoachSpec? -> coach = value } }
    val showTabs = accountTab || (context != null && !reviewOnboarding && !onboardingInProgress && state.page == null && state.featurePage == null && state.route != Route.Insights)
    var bottomDockHeight by remember { mutableStateOf(170.dp) }
    val aiDensity = androidx.compose.ui.platform.LocalDensity.current
    val homeCompanion = false // The approved Home AI/contact card is in the scroll content.
    val floatingTabs = showTabs && !(reviewEnabled && reviewStart == null)
    CompositionLocalProvider(LocalBarkMotion provides BarkMotion(parentMotion.reduced, if (reviewEnabled) speed else 1f, replay), LocalBoardFooter provides publishFooter, LocalBoardCoach provides publishCoach) {
        Box(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).imePadding().pointerInput(focus) {
            detectTapGestures(onTap = { focus.clearFocus() })
        }, contentAlignment = Alignment.TopCenter) {
            BoardScene(state, platform.device, Modifier.fillMaxSize().then(if (coach != null) Modifier.semantics { hideFromAccessibility() } else Modifier)) {
            val handler = LocalBoardNavigation.current
            DisposableEffect(companion, useCompanion, handler) {
                if (useCompanion) companion.navigationHandler = handler
                onDispose { if (companion.navigationHandler === handler) companion.navigationHandler = null }
            }
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.TopCenter) {
            Column(Modifier.widthIn(max = AppSpacing.contentMaxWidth).fillMaxSize().padding(bottom = if (floatingTabs) bottomDockHeight else 0.dp)) {
                if (openedReminder != null && state.backGuard != null) CaptionText("A care reminder is waiting. Finish or close this form to open it.", Modifier.padding(horizontal = 20.dp))
                val page = state.page; val feature = state.featurePage
                if (accountTab) {
                    Box(Modifier.weight(1f)) {
                        com.dracoarts.shared.presentation.companion.CompanionHostContent(companion, journal, controller, care, platform, state, repository,
                            applySafeInsets = false, onEnterJournal = onEnterJournal)
                    }
                } else if (context != null && !reviewOnboarding && !onboardingInProgress && state.route == Route.Timeline && page == null && feature == null) {
                    savedScreens.SaveableStateProvider("timeline-${context.dog.id}") {
                        TimelineScreen(journal, timeline, now, zone, Modifier.weight(1f), photos = context.items, reviewScreen = context.reviewScreen, onPhoto = { context.open(Feature.PhotoDetail, it.id) }, onSwitchDog = { context.open(Feature.DogSwitcher) }, onSelectDog = { scope.launch { controller.selectDog(it) } }, onSettings = { context.open(Feature.Settings) }, onAdd = { context.open(Feature.Chooser) }, onDetail = { state.detail(it.dogId, it.id) })
                    }
                } else {
                    val screenKey = if (context == null || onboardingInProgress || reviewOnboarding) "setup" else if (page != null) "event-${page.kind}-${page.sessionId}" else if (feature != null) featureViewKey(context.dog.id, feature) else "tab-${context.dog.id}-${state.route}"
                    savedScreens.SaveableStateProvider(screenKey) {
                        val scroll = rememberScrollState()
                        Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(scroll).padding(horizontal = AppSpacing.page, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                            when {
                                context == null && !noDogAccepted && (hadDog || reviewFaults?.screen == "no-dog") -> {
                                    BrandHeader(); ScreenHeading("Start with your dog", "A name is enough to open a local journal."); PawAvatar()
                                    BarkButton("Add a dog", { noDogAccepted = true; onboardingInProgress = true }, icon = "plus")
                                    CaptionText("No account, permission or subscription required.")
                                }
                                context == null || reviewOnboarding || onboardingInProgress -> OnboardingScreen(controller, journal, platform, state, if (noDogAccepted) "dog-setup" else if (reviewOnboarding) reviewStart else null, scrollState = scroll, onFinished = { reviewOnboarding = false; onboardingInProgress = false })
                                page != null -> EventPageScreen(page, journal.dogs.firstOrNull { it.id == page.dogId }?.name ?: "Your dog", events, state, platform::newId, now, zone, context)
                                feature != null -> FeatureScreens(feature, context)
                                else -> {
                                    if (journal.error != null) ErrorCard(journal.error!!)
                                    when (state.route) {
                                        Route.Home -> HomeScreen(context)
                                        Route.Insights -> InsightsScreen(context)
                                        Route.Profile -> SoftPawsYouScreen(context)
                                        Route.Care -> SoftPawsCareScreen(context)
                                        Route.Memories -> SoftPawsMemoriesScreen(context)
                                        Route.Timeline -> Unit
                                    }
                                }
                            }
                            Spacer(Modifier.height(12.dp))
                        }
                    }
                }
                footer?.let { action ->
                    val healthFooter = state.featurePage?.feature?.let { it in healthRecordScreens || it in carePlanningScreens || it in catSafetyScreens || it in catReportScreens } == true
                    Surface(Modifier.fillMaxWidth(), color = boardColor("ground"), border = if (healthFooter) null else androidx.compose.foundation.BorderStroke(1.dp, boardColor("hair"))) {
                        Column {
                            if (healthFooter) HorizontalDivider(color = boardColor("hair"), thickness = 1.dp)
                            Column(Modifier.padding(horizontal = if (healthFooter) 24.dp else 20.dp, vertical = if (healthFooter) 12.dp else 10.dp),
                                verticalArrangement = Arrangement.spacedBy(if (healthFooter) 4.dp else 8.dp)) { action() }
                        }
                    }
                }
                if (showTabs && !floatingTabs) {
                    if (homeCompanion) com.dracoarts.shared.presentation.companion.CompanionHomeEntry(companion, journal.selectedDog?.name ?: "your dog", Modifier.padding(horizontal = 20.dp, vertical = 8.dp))
                    JournalTabBar(state, platform, if (useCompanion) ({ route -> companion.navigateTab(state, route) }) else null)
                }
                if (reviewEnabled && reviewStart == null) DesignReviewBar(state, journal.selectedDogId, platform::newId, speed, { speed = it }, { replay++ })
            }
            }
            }
            // The selected pill moves; the tab bar itself stays put during page transitions.
            if (floatingTabs) Column(Modifier.align(Alignment.BottomCenter).widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth().onSizeChanged { size -> bottomDockHeight = with(aiDensity) { size.height.toDp() } }, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if(homeCompanion) com.dracoarts.shared.presentation.companion.CompanionHomeEntry(companion,journal.selectedDog?.name ?: "your dog",Modifier.padding(horizontal=20.dp))
                JournalTabBar(state, platform, if (useCompanion) ({ route -> companion.navigateTab(state, route) }) else null)
            }
            coach?.let { BoardCoachOverlay(it, Modifier.fillMaxSize()) }
        }
    }
}

@Composable
internal fun JournalTabBar(state: AppState, platform: AppPlatform, onNavigate: ((Route) -> Unit)? = null) {
    val motion = LocalBarkMotion.current
    val sounds = LocalInteractionSounds.current
    Surface(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), shape = RoundedCornerShape(24.dp), color = boardColor("tab-bg"), border = androidx.compose.foundation.BorderStroke(1.dp, boardColor("hair"))) {
        BoxWithConstraints(Modifier.fillMaxWidth().padding(6.dp)) {
            val routes = Route.dockRoutes
            val selectedIndex = routes.indexOf(state.route.dockRoute)
            val width = maxWidth / routes.size
            val position = remember { Animatable(selectedIndex.toFloat()) }
            LaunchedEffect(state.route, motion.reduced, motion.speed) {
                if (motion.reduced) position.snapTo(selectedIndex.toFloat())
                else position.animateTo(selectedIndex.toFloat(), spring(.78f, ((2 * PI / .42).pow(2) * motion.speed.pow(2)).toFloat()))
            }
            Surface(Modifier.width(width).height(56.dp).graphicsLayer {
                translationX = width.toPx() * position.value
                val stretch = if (motion.reduced) 0f else (abs(position.velocity) * .014f).coerceAtMost(.18f)
                scaleX = 1 + stretch; scaleY = 1 - stretch * .4f
            }, shape = RoundedCornerShape(18.dp), color = boardColor("accent-soft")) {}
            Row(Modifier.fillMaxWidth()) {
                routes.forEachIndexed { index, route ->
                    val selected = state.route.dockRoute == route; val source = remember { MutableInteractionSource() }
                    val proximity = ((1 - abs(position.value - index) - .45f) / .30f).coerceIn(0f, 1f)
                    val color = lerp(boardColor("tab-ink"), boardColor("accent-text"), proximity)
                    val iconLanding = selectionLanding(selected, 36)
                    Column(Modifier.weight(1f).heightIn(min = 56.dp).then(pressMotion(source)).semantics { this.selected = selected }
                        .clickable(interactionSource = source, indication = null, role = Role.Tab) { if (!selected) { sounds?.play(com.dracoarts.shared.services.SoundCue.Selection); platform.haptics.selectionChange(); onNavigate?.invoke(route) ?: state.show(route) } },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                        BarkIcon(route.iconName(), Modifier.size(21.dp).then(iconLanding), color)
                        Text(route.label, style = MaterialTheme.typography.labelSmall, color = color)
                    }
                }
            }
        }
    }
}

private fun featureViewKey(catId: String, page: FeaturePage) = "feature-$catId-${page.feature}-${page.id}"
