package com.dracoarts.shared.presentation.companion

import androidx.compose.animation.core.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.repository.JournalRepository
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.*
import com.dracoarts.shared.presentation.state.*
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.launch

@Composable
internal fun CompanionHostContent(controller: CompanionController, journal: JournalState, journalController: JournalController, care: CareController, platform: AppPlatform, navigation: AppState, repository: JournalRepository, applySafeInsets: Boolean = true, onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val route = state.route ?: return
    val scope = rememberCoroutineScope(); val motion = LocalBarkMotion.current
    val focus = LocalFocusManager.current
    fun back() {
        if (state.profileSaving || state.authBusy || state.purchaseBusy) return
        val index = CompanionController.onboardingIds.indexOf(route.boardId)
        when {
            state.reviewingDraft -> controller.go(CompanionScreen.ContextReview)
            state.draft.addingDog && route == CompanionScreen.Dog -> { scope.launch { controller.pauseAddDog(navigation) }; Unit }
            state.premiumFeature != null && route in setOf(CompanionScreen.Paywall, CompanionScreen.Restore) -> controller.dismissPremium()
            route in setOf(CompanionScreen.CreateAccount, CompanionScreen.PasswordReset) -> controller.go(CompanionScreen.Email, BoardNavigationMove.Back)
            route == CompanionScreen.Email -> controller.go(CompanionScreen.Login, BoardNavigationMove.Back)
            route in setOf(CompanionScreen.Login, CompanionScreen.ManagePlan, CompanionScreen.FutureFeatures) -> controller.navigateTab(navigation, Route.Profile)
            route in setOf(CompanionScreen.StoreManage, CompanionScreen.Restore) -> controller.go(CompanionScreen.ManagePlan, BoardNavigationMove.Back)
            route == CompanionScreen.Paywall -> if (journal.selectedDog == null) controller.go(if (state.draft.name.isBlank()) CompanionScreen.Dog else CompanionScreen.Plan, BoardNavigationMove.Back) else controller.enterJournal(navigation)
            route == CompanionScreen.ContextReview && state.draft.editingDogId != null -> controller.go(CompanionScreen.DogProfile)
            index > 0 -> controller.go(CompanionScreen.fromBoard(CompanionController.onboardingIds[index-1]))
            route in setOf(CompanionScreen.Email,CompanionScreen.CheckEmail,CompanionScreen.EmailExpired,CompanionScreen.AuthOffline) -> controller.go(CompanionScreen.Login)
            route == CompanionScreen.AccountSettings || route == CompanionScreen.AiGate || route == CompanionScreen.Threads -> controller.navigateTab(navigation, Route.Home)
            route == CompanionScreen.DogProfile || route == CompanionScreen.ManagePlan || route == CompanionScreen.DeleteAccount -> controller.go(CompanionScreen.AccountSettings)
            route == CompanionScreen.AiPrivacy || route == CompanionScreen.Chat || route.name.startsWith("Chat") -> { controller.stopReply(); controller.go(null) }
            route != CompanionScreen.Opening -> controller.go(CompanionScreen.AccountSettings)
        }
    }
    DisposableEffect(route) { navigation.backGuard = { back(); true }; onDispose { navigation.backGuard = null } }
    val chatScreens = setOf(CompanionScreen.Chat,CompanionScreen.ChatAnswer,CompanionScreen.ChatEmpty,CompanionScreen.ChatOffline,CompanionScreen.ChatError,CompanionScreen.ThreadReadonly)
    if (route in setOf(CompanionScreen.Home,CompanionScreen.HomeEmpty,CompanionScreen.HomePremium)) {
        LaunchedEffect(route) { if (route == CompanionScreen.HomePremium) controller.saveSession(state.session.copy(premium = true)); controller.go(null) }
        return
    }
    if (route in chatScreens && journal.selectedDog != null) {
        CompanionChat(controller, journal.selectedDog!!, repository, platform, ::back, onEditVet = { controller.go(null); navigation.open(Feature.EmergencyEdit) }); return
    }
    if (route in chatScreens && journal.selectedDog == null) {
        Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(20.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            BoardBackButton(::back)
            CHeading("Start with your dog.", "Add their profile to keep care records and conversations together.")
            CDog("your dog", true)
            BarkButton("Add dog", { controller.go(CompanionScreen.Dog) })
        }
        return
    }
    if (route == CompanionScreen.Plan) {
        SoftPawsPlanReveal(controller, journal, applySafeInsets, onEnterJournal)
        return
    }
    if (route in softPawsAccountScreens) {
        SoftPawsAccountScreen(route, controller, journal, platform, navigation, applySafeInsets, ::back, onEnterJournal)
        return
    }
    if (route in setOf(CompanionScreen.Paywall, CompanionScreen.ManagePlan)) {
        PremiumPlanScreen(route, controller, journal, applySafeInsets, ::back, onEnterJournal)
        return
    }
    // safeDrawing includes the keyboard; use the same inset/focus policy as chat.
    Column(Modifier.fillMaxSize().then(if (applySafeInsets) Modifier.windowInsetsPadding(WindowInsets.safeDrawing) else Modifier).pointerInput(focus) { detectTapGestures(onTap = { focus.clearFocus() }) },horizontalAlignment = Alignment.CenterHorizontally) {
        BoxWithConstraints(Modifier.weight(1f).widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth()) {
            val viewport = maxHeight
            val scroll = rememberScrollState()
            LaunchedEffect(route) { scroll.scrollTo(0) }
            Column(Modifier.fillMaxWidth().verticalScroll(scroll).heightIn(min = viewport).padding(horizontal = 20.dp,vertical = 12.dp),verticalArrangement = Arrangement.spacedBy(22.dp)) {
                if (route != CompanionScreen.Opening) Row(Modifier.fillMaxWidth(),verticalAlignment = Alignment.CenterVertically,horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                    BoardBackButton(::back, !state.profileSaving)
                    val steps = listOf(CompanionScreen.Opening.boardId) + CompanionController.catSetupIds
                    val index = steps.indexOf(route.boardId)
                    if (index >= 0) {
                        val progress by animateFloatAsState(index.toFloat() / (steps.size - 1), if (motion.reduced) snap() else tween(motion.milliseconds(460), easing = CubicBezierEasing(.16f,1f,.3f,1f)),label = "setup progress")
                        LinearProgressIndicator(progress = { progress },modifier = Modifier.weight(1f).height(4.dp),color = boardColor("ink-strong"),trackColor = boardColor("hair"),drawStopIndicator = {})
                    } else { Spacer(Modifier.weight(1f)); BrandHeader(if (controller.atlasOnly && route == CompanionScreen.AiPrivacy) "Text via Soft Paws AI" else "On this device") }
                }
                state.error?.let { ErrorCard(it) }
                when {
                    route.boardId in CompanionController.onboardingIds -> CompanionOnboarding(route,controller,platform,onEnterJournal)
                    route in setOf(CompanionScreen.Login,CompanionScreen.Email,CompanionScreen.CheckEmail,CompanionScreen.EmailExpired,CompanionScreen.AuthOffline,CompanionScreen.AccountSettings,CompanionScreen.DogProfile,CompanionScreen.DeleteAccount) -> CompanionAccount(route,controller,journal,platform,navigation,onEnterJournal)
                    route in setOf(CompanionScreen.AiPrivacy,CompanionScreen.Threads,CompanionScreen.ChatLimit,CompanionScreen.WeeklyRecap,CompanionScreen.VetQuestions,CompanionScreen.MemoryCaption) -> CompanionChatPages(route,controller,journal,platform)
                    else -> CompanionPlan(route,controller,journal,onEnterJournal)
                }
            }
        }
        if (state.draft.addingDog && route.boardId in CompanionController.dogSetupIds) {
            BarkTextAction("Finish later", { scope.launch { controller.pauseAddDog(navigation) } }, enabled = !state.profileSaving)
        }
    }
}

@Composable
fun CompanionHost(controller: CompanionController,journal: JournalState,journalController: JournalController,care: CareController,platform: AppPlatform,navigation: AppState,repository: JournalRepository,reviewEnabled: Boolean=false,onEnterJournal: suspend (String)->Unit) {
    val parent=LocalBarkMotion.current;var speed by rememberSaveable {mutableFloatStateOf(1f)};var replay by remember {mutableIntStateOf(0)}
    val current by controller.state.collectAsState()
    var footer by remember { mutableStateOf<BoardFooterContent?>(null) }
    val publishFooter = remember { { value: BoardFooterContent? -> footer = value } }
    CompositionLocalProvider(LocalBoardFooter provides publishFooter, LocalBarkMotion provides BarkMotion(parent.reduced,if(reviewEnabled)speed else parent.speed,replay)) {
      BoardScene(navigation,platform.device,Modifier.fillMaxSize()) {
        val handler=LocalBoardNavigation.current
        DisposableEffect(handler) {controller.navigationHandler=handler;onDispose {if(controller.navigationHandler===handler)controller.navigationHandler=null}}
        Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).imePadding()) {
            Box(Modifier.weight(1f)) {CompanionHostContent(controller,journal,journalController,care,platform,navigation,repository,applySafeInsets=false,onEnterJournal=onEnterJournal)}
            footer?.let { action -> Surface(color = boardColor("ground"), border = androidx.compose.foundation.BorderStroke(1.dp, boardColor("hair"))) {
                Column(Modifier.fillMaxWidth().padding(horizontal = AppSpacing.page, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) { action() }
            } }
            if(reviewEnabled && WindowInsets.ime.getBottom(LocalDensity.current) == 0) Surface(color=boardColor("inset")) {Column(Modifier.fillMaxWidth().padding(8.dp)) {
                BoardSelect("Native board screen",current.route?.boardId.orEmpty(),CompanionScreen.entries.map {it.boardId to "${it.ordinal+1}/${CompanionScreen.entries.size} · ${it.boardId}"}) {id->controller.go(CompanionScreen.fromBoard(id))}
                Row {BarkTextAction("Replay",{replay++});BarkTextAction("1×",{speed=1f});BarkTextAction("½×",{speed=.5f});BarkTextAction("¼×",{speed=.25f})}
            }}
        }
      }
    }
}
