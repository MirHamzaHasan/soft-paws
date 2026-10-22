package com.dracoarts.shared.presentation.companion

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.domain.model.PremiumPlan
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.*
import com.dracoarts.shared.presentation.state.JournalState
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.launch

@Composable internal fun ColumnScope.CompanionAccount(route: CompanionScreen,controller: CompanionController,journal: JournalState,platform: AppPlatform,navigation: AppState,onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val scope = rememberCoroutineScope(); val dog = journal.selectedDog
    val name = dog?.name ?: state.draft.name.ifBlank { "your cat" }
    var email by rememberSaveable { mutableStateOf(state.session.email.takeIf { '@' in it }.orEmpty()) }
    // Passwords are transient: never use rememberSaveable, controller state or journal drafts.
    var password by remember(route) { mutableStateOf("") }
    var passwordAgain by remember(route) { mutableStateOf("") }
    var createAccount by remember(route) { mutableStateOf(false) }
    var resetSent by remember(route, email) { mutableStateOf(false) }
    var confirm by remember { mutableStateOf(false) }
    LaunchedEffect(platform, route) { platform.device.foreground.collect { foreground -> if (!foreground) { password = ""; passwordAgain = "" } } }
    fun signedIn(method: String) { scope.launch { if (controller.signIn(method,email)) { if (dog != null) onEnterJournal(dog.id) else controller.go(CompanionScreen.Plan) } } }
    if (state.authBusy) { LinearProgressIndicator(Modifier.fillMaxWidth()); CaptionText("Finishing your account request…") }
    when(route) {
        CompanionScreen.Login -> {
            CHeading("Make this your BarkLog.","Sign in for your account. Your journal stays on this device.")
            JournalCard { CDog(name); Text(name,Modifier.align(Alignment.CenterHorizontally),style = MaterialTheme.typography.headlineMedium) }
            CaptionText("Sign-in uses Firebase Authentication. AI replies use Soft Paws AI with your permission and need a connection. Premium purchases become available after store setup.")
            CFoot("Continue with Apple", enabled = !state.authBusy) { signedIn("Apple") }
            BarkButton("Continue with Google",{signedIn("Google")},secondary = true, enabled = !state.authBusy)
            BarkTextAction("Continue with email",{controller.go(CompanionScreen.Email)},Modifier.align(Alignment.CenterHorizontally))
            BarkTextAction("Continue without an account", { scope.launch { if (dog != null) onEnterJournal(dog.id) else if (state.draft.name.isBlank()) controller.go(CompanionScreen.Dog) else controller.go(CompanionScreen.Ready) } }, Modifier.align(Alignment.CenterHorizontally))
            CaptionText("Your journal stays on this device. No subscription starts here.")
        }
        CompanionScreen.Email -> {
            CHeading(if (createAccount) "Make yourself at home." else "Welcome back.", if (createAccount) "Create your BarkLog account with email and password." else "Sign in with your email and password.")
            BarkField("Email address",email,{ email = it.take(254) },enabled = !state.authBusy,keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
            BarkField("Password",password,{ password = it },enabled = !state.authBusy,keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, autoCorrectEnabled = false),secure = true)
            if (createAccount) {
                CaptionText("Use at least 6 characters. Your account may require a stronger password.")
                BarkField("Confirm password",passwordAgain,{ passwordAgain = it },enabled = !state.authBusy,keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, autoCorrectEnabled = false),secure = true)
            }
            if (resetSent) CaptionText("If this email has an account, a password-reset link is on its way. Check your inbox and spam folder.")
            CFoot(if (createAccount) "Create account" else "Sign in", enabled = !state.authBusy) {
                if (createAccount && password != passwordAgain) controller.setError("The passwords don't match. Enter them again.")
                else scope.launch {
                    if (controller.signInEmail(email, password, createAccount)) {
                        password = ""; passwordAgain = ""
                        if (dog != null) onEnterJournal(dog.id) else controller.go(CompanionScreen.Plan)
                    }
                }
            }
            BarkButton(if (createAccount) "I already have an account" else "Create an account", {
                createAccount = !createAccount; password = ""; passwordAgain = ""; resetSent = false; controller.setError(null)
            },secondary = true,enabled = !state.authBusy)
            if (!createAccount) BarkTextAction("Forgot password?", {
                if (!state.authBusy) scope.launch { resetSent = controller.resetPassword(email) }
            },Modifier.align(Alignment.CenterHorizontally))
            CaptionText("Your journal stays on this device.")
        }
        CompanionScreen.CheckEmail -> {
            CHeading(if (state.emailLinkPending) "Confirm your email." else "Check your email.", if (state.emailLinkPending) "Enter the address that received this link." else "Open the sign-in link on this phone, then return here.")
            BarkField("Email address", email, { email = it.take(254) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
            CaptionText("Use the same address even if you requested the link on another device.")
            CFoot("Finish sign-in", enabled = state.emailLinkPending && !state.authBusy) { signedIn("Email") }
            BarkButton("Send another link", { scope.launch { controller.sendEmailLink(email) } }, secondary = true, enabled = !state.authBusy)
            BarkTextAction("Use another email", { controller.go(CompanionScreen.Email) })
        }
        CompanionScreen.EmailExpired -> { CHeading("That link has expired.","Your setup is still here. Sign in with your email and password."); CDog(name); CFoot("Sign in") { controller.go(CompanionScreen.Email) } }
        CompanionScreen.AuthOffline -> { CHeading("Connect to sign in.","Real sign-in needs a connection. Your setup stays here."); CaptionText("You can keep using your journal offline."); CFoot("Try sign-in again") { controller.go(CompanionScreen.Login) } }
        CompanionScreen.AccountSettings -> {
            CHeading("Your account.","Care stays with $name. You choose what AI can use.")
            JournalCard { CDog(name); Text(state.session.email,style = MaterialTheme.typography.titleMedium); CaptionText(if (state.session.signedIn) "${state.session.provider} · Firebase account" else "No account signed in") }
            BoardMenu { FeatureRow("Your plan",if (state.premiumCustomer.entitled) "Premium" else if (state.premiumAccess) "Debug Premium preview" else "Free journal · optional AI","credit-card") {controller.go(CompanionScreen.ManagePlan)}; FeatureRow("AI & your records","Automatic profile and past seven days","shield-check") {controller.go(CompanionScreen.AiPrivacy)}; FeatureRow("Cat profile","The details you chose","paw-print") {controller.go(CompanionScreen.DogProfile)}; FeatureRow("Switch or add cat","A separate journal for each cat","paw-print") { controller.openJournalTool(navigation, Feature.DogSwitcher) }; FeatureRow("Interaction sounds","Soft taps and saved notes","music") { controller.openJournalTool(navigation, Feature.Sounds) }; FeatureRow("Journal settings","Storage, accessibility & exports","settings-2") { navigation.open(Feature.Settings); controller.go(null) }; FeatureRow("All care tools","Health, calendar, training, photos & more","notebook-pen") { navigation.show(Route.Profile); navigation.open(Feature.CareTools); controller.go(null) } }
            if (state.session.signedIn) CFoot("Sign out", enabled = !state.authBusy, secondary = "Delete account",onSecondary = {controller.go(CompanionScreen.DeleteAccount)}) { confirm = true }
            else CFoot("Sign in", enabled = !state.authBusy) { controller.go(CompanionScreen.Login) }
        }
        CompanionScreen.DogProfile -> {
            CHeading("$name’s profile.","The details you chose. Yours to change.")
            if (dog?.details?.photoId != null) LocalPhoto(dog.details.photoId!!, "$name’s photo", platform.device) else CDog(name)
            if (dog != null) { CProfile(ProfileSnapshot(name,dog.details.sex,dog.details.companion)) { controller.beginEdit(dog); controller.go(it) }; CFoot("Edit setup") { controller.beginEdit(dog) }; BarkTextAction("Switch or add cat", { controller.openJournalTool(navigation, Feature.DogSwitcher) }, icon = "plus") }
        }
        CompanionScreen.DeleteAccount -> {
            CHeading("Delete your account?","This deletes your Firebase identity and saved conversations on this phone. You may be asked to sign in again.")
            FeatureNotice("Your journal stays","Care records, journal photos and exports stay on this device. Other devices keep their local data.","shield-check")
            BarkButton("Manage plan",{controller.go(CompanionScreen.ManagePlan)},secondary = true)
            CFoot("Keep account",secondary = "Delete account",onSecondary = {confirm = true}) {controller.go(CompanionScreen.AccountSettings)}
        }
        else -> Unit
    }
    if(confirm) ConfirmChange(if(route == CompanionScreen.DeleteAccount) "Delete your account?" else "Sign out on this phone?",if(route == CompanionScreen.DeleteAccount) "Saved conversations will be removed. Your cat’s local journal stays." else "Your device journal and conversations stay here. Signing in again needs a connection.",if(route == CompanionScreen.DeleteAccount) "Delete account" else "Sign out",false,{confirm = false},keepLabel = "Keep account",danger = route == CompanionScreen.DeleteAccount) {confirm = false;scope.launch {if(route == CompanionScreen.DeleteAccount) controller.deleteAccount() else controller.signOut()} }
}

@Composable internal fun ColumnScope.CompanionPlan(route: CompanionScreen,controller: CompanionController,journal: JournalState,onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val scope = rememberCoroutineScope(); val name = journal.selectedDog?.name ?: state.draft.name.ifBlank { "your cat" }
    fun openJournal() { scope.launch {val id = journal.selectedDog?.id ?: controller.commitDog()?.id;if (id != null) onEnterJournal(id)} }
    fun demoPremium() {scope.launch {controller.tryDemoPremium()} }
    when(route) {
        CompanionScreen.Ready,CompanionScreen.PremiumReady -> { CHeading(if(state.premiumAccess) "Let’s talk about your cat." else "A fresh page for $name.","Your journal is free. ${if(state.premiumAccess) if (controller.demoResponses) "Demo AI is ready to explore." else "Soft Paws AI answers need sign-in and a connection." else "Premium can wait."}"); CDog(name,true); CompanionBenefits(); CFoot("Open $name’s journal") {openJournal()} }
        CompanionScreen.AiGate -> { CHeading("Ask about $name.","Start with their moments. Follow your curiosity."); CDog(name); JournalCard { Text("What did today look like?"); SupportingText("Soft Paws AI answers using the profile and care records you choose. Sign-in and a connection are required.") }; CFoot("See Premium",secondary = "Keep using free journal",onSecondary = {controller.go(null)}) {controller.go(CompanionScreen.Paywall)}; if (state.premiumPreviewAllowed) BarkTextAction("Try Debug Premium preview",::demoPremium) }
        CompanionScreen.Trial -> { CHeading("Choose your plan.", "Weekly, monthly or yearly. No trial is configured."); PremiumPlan.entries.forEach { Text("${it.title} · ${it.referenceCharge}") }; CFoot("See plans") { controller.go(CompanionScreen.Paywall) } }
        CompanionScreen.Restore -> {
            CHeading("Restore a purchase.","Use the same store account that paid for Premium.")
            CaptionText(if(state.premiumCustomer.configured) "Your store checks for an active Premium subscription." else "Purchases will be available after store setup.")
            if(state.premiumCustomer.entitled) FeatureNotice("Premium is active", "Your current store access is available.", "check")
            BarkButton(if(state.purchaseBusy) "Checking…" else "Restore purchases", { scope.launch { controller.restorePremium() } }, enabled = state.premiumCustomer.configured && !state.purchaseBusy)
            CFoot(if(state.premiumFeature != null) "Back to preview" else "Continue free") { if(state.premiumFeature != null) controller.dismissPremium() else controller.go(CompanionScreen.Ready) }
        }
        CompanionScreen.Cancel -> { CHeading("Before you go.","Optional: what would make Soft Paws more useful?"); listOf("It doesn’t fit my budget","I’m taking a break","I need something different","I got what I needed").forEach { value -> CChoice(value,selected = false) {controller.go(CompanionScreen.StoreManage)} }; CFoot("Skip · manage in store",secondary = "Back to my plan",onSecondary = {controller.go(CompanionScreen.ManagePlan)}) {controller.go(CompanionScreen.StoreManage)} }
        CompanionScreen.StoreManage -> {
            CHeading("Your store handles billing.","Manage or cancel through Apple or Google.")
            CaptionText(if(state.premiumCustomer.configured) "Your store shows the current renewal date, price and cancellation options. Your cat journals stay available." else "No store connection is configured. A Debug preview does not create a subscription.")
            BarkButton("Open subscriptions", { scope.launch { controller.managePremium() } }, enabled=state.premiumCustomer.configured && !state.purchaseBusy)
            CFoot("Back to my plan") { controller.go(CompanionScreen.ManagePlan) }
        }
        CompanionScreen.Ended -> { CHeading("Your journal stays.","Premium access has ended."); CDog(name); FeatureNotice("All your care records","Logs, notes, photos, on-screen reports and CSV exports stay available.","check"); CFoot("Back to journal",secondary = "Read past conversations",onSecondary = {controller.go(CompanionScreen.Threads)}) {controller.go(null)} }
        else -> Unit
    }
}
@Composable internal fun CompanionBenefits() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) { listOf(Triple("paw-print","A journal for each cat","Add another cat with a complete, separate profile."),Triple("message-circle","Soft Paws AI & safety","Answers with your cat’s profile and past seven days, with your consent."),Triple("map-pin","Find a vet nearby","Choose a veterinary clinic in Maps, then call."),Triple("file-text","Reports to take with you","Export, print and share a PDF of chosen care records."),Triple("image","Memory Books to keep","Export selected memories and photos as a PDF."),Triple("notebook-pen","A week in plain words","Generated recaps and questions from saved care observations.")).forEach { (icon,title,sub) -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {BarkIcon(icon,Modifier.size(22.dp));Column {Text(title,style = MaterialTheme.typography.titleMedium);CaptionText(sub)}} } }
}
