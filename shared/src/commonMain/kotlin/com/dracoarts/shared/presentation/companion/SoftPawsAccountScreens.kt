package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.PremiumPlan
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.ErrorText
import com.dracoarts.shared.presentation.state.JournalState
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

internal val softPawsAccountScreens = setOf(
    CompanionScreen.Login, CompanionScreen.Email, CompanionScreen.CreateAccount,
    CompanionScreen.PasswordReset, CompanionScreen.Paywall, CompanionScreen.ManagePlan,
    CompanionScreen.StoreManage, CompanionScreen.Restore, CompanionScreen.FutureFeatures, CompanionScreen.DeleteAccount,
)

/** Approved cat account/access screens. The existing controllers and native SDK guards own outcomes. */
@Composable
internal fun SoftPawsAccountScreen(
    route: CompanionScreen, controller: CompanionController, journal: JournalState,
    platform: AppPlatform, navigation: AppState, applySafeInsets: Boolean,
    onBack: () -> Unit, onEnterJournal: suspend (String) -> Unit,
) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    val cat = journal.selectedDog
    var email by rememberSaveable { mutableStateOf(state.session.email.takeIf { '@' in it }.orEmpty()) }
    // A password is never saveable UI state, a preference or a journal draft.
    var password by remember(route) { mutableStateOf("") }
    var confirmation by remember(route) { mutableStateOf("") }
    var resetSent by remember(route, email) { mutableStateOf(false) }
    var request by remember { mutableStateOf<Job?>(null) }
    var selected by rememberSaveable { mutableStateOf<PremiumPlan?>(null) }
    var reaction by remember { mutableIntStateOf(0) }
    var policy by remember { mutableStateOf<String?>(null) }
    val busy = state.authBusy || state.purchaseBusy || state.profileSaving
    val density = LocalDensity.current
    val window = LocalWindowInfo.current.containerSize
    val compact = with(density) { window.height.toDp() < 720.dp } || density.fontScale >= 1.2f
    LaunchedEffect(platform, route) {
        platform.device.foreground.collect { if (!it) { password = ""; confirmation = "" } }
    }
    fun push(screen: CompanionScreen) = controller.go(screen, BoardNavigationMove.Push)
    fun backTo(screen: CompanionScreen) = controller.go(screen, BoardNavigationMove.Back)
    fun free() {
        if (busy) return
        if (state.premiumFeature != null && route in setOf(CompanionScreen.Paywall, CompanionScreen.Restore)) controller.dismissPremium()
        else if (state.draft.addingDog) scope.launch { controller.pauseAddDog(navigation) }
        else if (cat != null) scope.launch { onEnterJournal(cat.id) }
        else controller.go(if (state.draft.name.isBlank()) CompanionScreen.Dog else CompanionScreen.Plan, BoardNavigationMove.Back)
    }
    fun authenticate(action: suspend () -> Boolean) {
        if (busy) return
        request = scope.launch {
            if (action()) {
                password = ""; confirmation = ""
                if (cat != null) onEnterJournal(cat.id) else controller.go(CompanionScreen.Plan)
            }
        }
    }
    @Composable fun ColumnScope.Actions(content: @Composable ColumnScope.() -> Unit) {
        BoardStickyAction {
            state.error?.let { ErrorText(it) }
            if (state.authBusy) {
                LinearProgressIndicator(Modifier.fillMaxWidth())
                CaptionText("Finishing your account request…")
                BarkTextAction("Cancel request", { request?.cancel() })
            }
            content()
        }
    }
    @Composable fun Cat(height: Int) {
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            AnimatedCat(Modifier.size((height * 480f / 520f).dp, height.dp),
                greetingLabel = "Say hello to the Soft Paws cat", curiousReaction = reaction)
        }
    }
    @Composable fun PolicyLinks() {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
            BarkTextAction("Terms", { policy = "terms" })
            BarkTextAction("Privacy", { policy = "privacy" })
        }
    }
    Column(Modifier.fillMaxSize().then(if (applySafeInsets) Modifier.windowInsetsPadding(WindowInsets.safeDrawing) else Modifier)) {
        Box(Modifier.weight(1f).widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth().align(Alignment.CenterHorizontally)) {
            val scroll = rememberScrollState()
            LaunchedEffect(route) { scroll.scrollTo(0) }
            Column(Modifier.fillMaxWidth().verticalScroll(scroll).padding(horizontal = AppSpacing.page, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(if (route == CompanionScreen.Paywall) 12.dp else 22.dp)) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    AccountBack(onBack, !busy)
                    Spacer(Modifier.weight(1f))
                    SoftPawsKicker("CAT CARE")
                }
                when (route) {
                    CompanionScreen.Login -> {
                        SoftPawsHeading("For the extras, an account.", "Your journal works without signing in.", "an account.")
                        Cat(if (compact) 200 else 288)
                        CaptionText("An account identifies you for AI and Premium access. It does not sync or back up your journal.")
                        if (!controller.authenticationConfigured) CaptionText("Sign-in setup is pending. You can keep using the local journal.")
                        Actions {
                            BarkButton("Continue with Apple", { authenticate { controller.signIn("Apple") } }, secondary = true, enabled = !busy)
                            BarkButton("Continue with Google", { authenticate { controller.signIn("Google") } }, secondary = true, enabled = !busy)
                            BarkButton("Continue with email", { push(CompanionScreen.Email) }, secondary = true, enabled = !busy)
                            BarkTextAction("Keep using the journal", ::free, Modifier.align(Alignment.CenterHorizontally), enabled = !busy)
                        }
                    }
                    CompanionScreen.Email, CompanionScreen.CreateAccount, CompanionScreen.PasswordReset -> {
                        val creating = route == CompanionScreen.CreateAccount
                        val resetting = route == CompanionScreen.PasswordReset
                        SoftPawsHeading(
                            when { creating -> "An account, when you need one."; resetting -> "A way back in."; else -> "Welcome back to Soft Paws." },
                            when { creating -> "Local care still needs no account."; resetting -> "Use the email for your account."; else -> "Email and password sign-in." },
                            when { creating -> "when you need one."; resetting -> "back in."; else -> "Soft Paws." },
                        )
                        BarkField("Email address", email, { email = it.take(254) }, enabled = !busy, softPaws = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, autoCorrectEnabled = false))
                        if (!resetting) {
                            BarkField("Password", password, { password = it }, enabled = !busy, secure = true, softPaws = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, autoCorrectEnabled = false))
                            if (creating) {
                                BarkField("Confirm password", confirmation, { confirmation = it }, enabled = !busy, secure = true, softPaws = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, autoCorrectEnabled = false))
                                CaptionText("Use at least 6 characters. Your account may require a stronger password.")
                            } else BarkTextAction("Forgot password?", { push(CompanionScreen.PasswordReset) }, enabled = !busy)
                        }
                        CaptionText(if (controller.authenticationConfigured) "Your journal stays on this device. Passwords are never saved in your journal."
                            else "Sign-in setup is pending. Credentials are not sent while this service is unavailable.")
                        if (creating) PolicyLinks()
                        if (resetSent) Text("If this address has an account, check your inbox and spam folder for a reset link.", Modifier.semantics { liveRegion = LiveRegionMode.Polite })
                        Actions {
                            BarkButton(when { creating -> "Create account"; resetting -> "Send reset email"; else -> "Sign in" }, {
                                when {
                                    resetting -> request = scope.launch { resetSent = controller.resetPassword(email) }
                                    creating && password != confirmation -> controller.setError("The passwords don't match. Enter them again.")
                                    else -> authenticate { controller.signInEmail(email, password, creating) }
                                }
                            }, enabled = !busy, secondary = creating && !controller.authenticationConfigured)
                            when {
                                creating -> BarkTextAction("Use the local journal", ::free, Modifier.align(Alignment.CenterHorizontally), enabled = !busy)
                                resetting -> BarkTextAction("Back to sign in", { backTo(CompanionScreen.Email) }, Modifier.align(Alignment.CenterHorizontally), enabled = !busy)
                                else -> BarkButton("Create account", { push(CompanionScreen.CreateAccount) }, secondary = true, enabled = !busy)
                            }
                        }
                    }
                    CompanionScreen.Paywall -> {
                        SoftPawsHeading("A little more care.", "Your first cat’s journal stays free.", "more care.")
                        Cat(if (compact) 58 else 88)
                        SoftPawsKicker(if (state.premiumCustomer.configured) "SOFT PAWS PREMIUM" else "PREMIUM · STORE SETUP PENDING")
                        CaptionText(state.premiumFeature?.let { it.title + " · " + it.description } ?: "Additional cats, AI, nearby vets, PDF & MP4.")
                        Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            PremiumPlan.entries.forEach { plan ->
                                val offer = state.premiumCustomer.offers.firstOrNull { it.plan == plan }
                                CatPlanRow(plan, offer?.price ?: if (state.premiumCustomer.configured) "Unavailable" else plan.referencePrice,
                                    selected == plan, !busy) { selected = plan; reaction++ }
                            }
                        }
                        CaptionText(if (state.premiumCustomer.configured) "Recurring charges. Your store confirms the price and terms before purchase."
                            else "Proposed USD recurring charges · store setup pending. No trial is assumed.")
                        BarkTextAction("Restore purchases", { push(CompanionScreen.Restore) }, enabled = !busy)
                        PolicyLinks()
                        if (state.premiumPreviewAllowed) {
                            CaptionText("Debug only · local preview, without a purchase or renewal.")
                            BarkTextAction("Try Debug Premium preview", { scope.launch { controller.tryDemoPremium() } }, enabled = !busy)
                        }
                        val offer = selected?.let { choice -> state.premiumCustomer.offers.firstOrNull { it.plan == choice } }
                        Actions {
                            BarkButton(if (state.purchaseBusy) "Please wait…" else if (!state.premiumCustomer.configured) "Purchases unavailable" else if (selected == null) "Choose a plan" else "Continue with ${selected!!.title.lowercase()}",
                                { selected?.let { choice -> scope.launch { controller.purchasePremium(choice) } } }, enabled = !busy && offer != null)
                            BarkButton(if (state.premiumFeature != null) "Back to preview" else "Keep using the free journal", ::free, secondary = true, enabled = !busy)
                        }
                    }
                    CompanionScreen.ManagePlan -> {
                        SoftPawsHeading("Your plan, plainly.", if (state.premiumCustomer.entitled) "Your store confirms Premium access." else if (state.premiumAccess) "An explicit local Debug preview." else "Your local journal stays free.", "plainly.")
                        Cat(132)
                        SoftPawsCard(if (state.premiumCustomer.entitled) "Premium" else if (state.premiumAccess) "Debug Premium preview" else "Free journal", "accent-soft") {
                            CaptionText(if (state.premiumCustomer.entitled) "Current store access · billing is managed by your store." else if (state.premiumAccess) "No purchase, subscription or renewal was created." else "No subscription is connected.")
                            AccountFact("One cat’s everyday care", "Logging, timeline, on-phone reports and raw CSV", "check")
                            AccountFact("Existing records and contacts", "Yours to keep using", "heart")
                        }
                        SoftPawsRow("Explore Premium", "Full recurring prices before any purchase", "gem") { push(CompanionScreen.Paywall) }
                        SoftPawsRow("Manage a store subscription", "Only the platform can change store billing", "settings") { push(CompanionScreen.StoreManage) }
                        if (state.premiumCustomer.entitled) BarkTextAction("Cancel subscription in store", { scope.launch { controller.managePremium() } }, enabled = !busy)
                        BarkTextAction("Restore purchases", { push(CompanionScreen.Restore) }, enabled = !busy)
                        if (state.premiumPreviewAllowed && state.session.premium) BarkButton("End Debug preview", {
                            scope.launch { if (controller.saveSession(state.session.copy(premium = false))) controller.go(CompanionScreen.Ended) }
                        }, secondary = true, enabled = !busy)
                        Actions { BarkButton("Back to the journal", ::free, enabled = !busy) }
                    }
                    CompanionScreen.StoreManage -> {
                        SoftPawsHeading("Your store manages billing.", "No active subscription is assumed.", "manages billing.")
                        SoftPawsCard(if (state.premiumCustomer.configured) "Manage through your store" else "When subscriptions are connected") {
                            CaptionText("Open Apple’s subscriptions or Google Play’s subscription centre. Cancellation happens there.")
                        }
                        SoftPawsCard("Your journal stays") {
                            CaptionText("Turning off renewal does not delete cats, records, drafts or saved veterinary contacts.")
                        }
                        CaptionText(if (state.premiumCustomer.configured) "Your store shows any current renewal date, price and cancellation options." else "Store setup is pending. No cancellation, refund or renewal date is assumed.")
                        if (state.premiumCustomer.configured) BarkButton("Open subscriptions", { scope.launch { controller.managePremium() } }, enabled = !busy)
                        Actions { BarkButton("Back to your plan", { backTo(CompanionScreen.ManagePlan) }, enabled = !busy) }
                    }
                    CompanionScreen.Restore -> {
                        SoftPawsHeading("Restore a purchase.", "Use the store account that paid for Premium.", "purchase.")
                        SoftPawsCard(if (state.premiumCustomer.entitled) "Premium is active" else if (state.premiumCustomer.configured) "Your store checks access" else "Store setup is pending") {
                            CaptionText(if (state.premiumCustomer.configured) "Only a verified store entitlement restores Premium access." else "No store request or entitlement is available in this build. Your journal stays free.")
                        }
                        BarkButton(if (state.purchaseBusy) "Checking…" else "Restore purchases", { scope.launch { controller.restorePremium() } }, enabled = state.premiumCustomer.configured && !busy)
                        Actions { BarkButton(if (state.premiumFeature != null) "Back to preview" else "Back to your plan", {
                            if (state.premiumFeature != null) controller.dismissPremium() else backTo(CompanionScreen.ManagePlan)
                        }, enabled = !busy) }
                    }
                    CompanionScreen.DeleteAccount -> {
                        var confirming by remember { mutableStateOf(false) }
                        SoftPawsHeading("Your account and your care.", "Account deletion needs a separate confirmation.", "your care.")
                        SoftPawsCard("Store billing is separate") { SupportingText("Deleting an account does not cancel an App Store or Google Play subscription.") }
                        SoftPawsCard("Local records need their own choice") { SupportingText("Account deletion keeps your local care records and photos. Saved conversations on this phone are removed only after the account deletion succeeds.") }
                        CaptionText(if (state.session.signedIn) "${state.session.provider} account · ${state.session.email}" else "No account is signed in. Your local journal remains available.")
                        Actions {
                            BarkButton("Manage store subscription", { push(CompanionScreen.StoreManage) }, secondary = true, enabled = !busy)
                            BarkButton("Back to local data", { controller.openJournalTool(navigation, Feature.DataSettings) }, enabled = !busy)
                            BarkTextAction("Delete account", { confirming = true }, enabled = state.session.signedIn && controller.authenticationConfigured && !busy, danger = true)
                        }
                        if (confirming) com.dracoarts.shared.presentation.screens.ConfirmChange("Delete your account?", "This removes your identity and saved conversations on this phone after the account request succeeds. Your local cat care and store subscription stay separate.", "Delete account", busy, { confirming = false }, keepLabel = "Keep account") {
                            scope.launch { if (controller.deleteAccount()) confirming = false }
                        }
                    }
                    CompanionScreen.FutureFeatures -> {
                        SoftPawsHeading("A little further ahead.", "These Premium ideas are not available.", "further ahead.")
                        Cat(200)
                        SoftPawsList {
                            AccountFact("Train your cat", "Coming soon · no training programme is available", "graduation-cap")
                            AccountFact("Pet food scanning & recalls", "Coming soon · no monitoring or scanning service", "scan-line")
                        }
                        CaptionText("These are future concepts, not active services or reasons to buy today.")
                        Actions { BarkButton("Back to your journal", ::free, enabled = !busy) }
                    }
                    else -> Unit
                }
            }
        }
    }
    policy?.let { key ->
        CDialog(if (key == "terms") "Terms · setup preview" else "Privacy · setup preview", { policy = null }, actions = { BarkButton("Close", { policy = null }) }) {
            CaptionText("These are setup notes. Soft Paws’ final terms and privacy documents are still required before live service setup.")
            if (key == "terms") {
                Text(if (state.premiumCustomer.configured) "Your store confirms the full recurring charge and terms before a purchase. Manage or cancel renewal in Apple’s subscriptions or Google Play."
                    else "Purchases are unavailable until store setup. The displayed recurring USD charges are proposals. No trial or subscription starts here.")
                CaptionText("The first cat’s local care, existing journals, on-phone reports, raw CSV and direct saved emergency contacts stay available.")
            } else {
                Text("Your cat journal stays on this device. An optional account identifies you for online extras; it does not sync or back up care records.")
                CaptionText("When AI is available, each cat needs explicit consent before sharing its profile and past seven calendar days. There is no automatic whole-journal or photo upload.")
            }
        }
    }
}

@Composable
internal fun AccountBack(onBack: () -> Unit, enabled: Boolean) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(onClick = soundAction(onBack), enabled = enabled, interactionSource = source,
        modifier = Modifier.size(48.dp).then(pressMotion(source, enabled)).semantics { contentDescription = "Back" },
        shape = CircleShape, color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Box(contentAlignment = Alignment.Center) { BarkIcon("arrow-left", Modifier.size(18.dp).then(glyphPressMotion(source, -1f, enabled))) }
    }
}

@Composable
private fun AccountFact(title: String, subtitle: String, icon: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        SoftPawsIconMark(icon)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
            CaptionText(subtitle)
        }
    }
}

@Composable
private fun CatPlanRow(plan: PremiumPlan, price: String, picked: Boolean, enabled: Boolean, onSelect: () -> Unit) {
    val source = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    Surface(shape = RoundedCornerShape(18.dp), color = boardColor(if (picked) "accent-soft" else "panel"), border = BorderStroke(1.dp, boardColor(if (picked) "accent-line" else "hair"))) {
        Row(Modifier.fillMaxWidth().heightIn(min = 62.dp).then(pressMotion(source, enabled))
            .selectable(picked, source, indication = null, enabled = enabled, role = Role.RadioButton, onClick = soundAction(onSelect))
            .semantics(mergeDescendants = true) { contentDescription = "${plan.title}, $price, billed every ${plan.period}" }
            .padding(horizontal = 14.dp, vertical = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(plan.title, style = MaterialTheme.typography.bodyMedium)
                CaptionText("Billed every ${plan.period}")
            }
            Text(price, style = MaterialTheme.typography.titleLarge.copy(fontSize = 24.sp, fontWeight = FontWeight.Bold))
            Surface(Modifier.size(24.dp), shape = CircleShape, color = boardColor(if (picked) "ball" else "panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) {
                if (picked) Box(contentAlignment = Alignment.Center) { BarkIcon("check", Modifier.size(14.dp), boardColor("ball-ink")) }
            }
        }
    }
}
