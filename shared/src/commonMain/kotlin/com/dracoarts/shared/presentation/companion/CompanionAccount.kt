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
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.screens.*
import com.dracoarts.shared.presentation.state.JournalState
import com.dracoarts.shared.services.AppPlatform
import kotlinx.coroutines.launch

@Composable internal fun ColumnScope.CompanionAccount(route: CompanionScreen,controller: CompanionController,journal: JournalState,platform: AppPlatform,navigation: AppState,onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val scope = rememberCoroutineScope(); val dog = journal.selectedDog
    val name = dog?.name ?: state.draft.name.ifBlank { "your dog" }
    var provider by remember { mutableStateOf<String?>(null) }; var email by rememberSaveable { mutableStateOf(state.session.email.takeIf { '@' in it }.orEmpty()) }
    var confirm by remember { mutableStateOf(false) }
    fun signedIn(method: String) { scope.launch { if (controller.signIn(method,email)) { if (dog != null) onEnterJournal(dog.id) else controller.go(CompanionScreen.Plan) } } }
    when(route) {
        CompanionScreen.Login -> {
            CHeading("Make this your BarkLog.","One account for access, conversations and your Premium plan.")
            JournalCard { CDog(name); Text(name,Modifier.align(Alignment.CenterHorizontally),style = MaterialTheme.typography.headlineMedium) }
            CaptionText("Demo sign-in · no provider or account service is contacted.")
            CFoot("Continue with Apple") { provider = "Apple" }
            BarkButton("Continue with Google",{provider = "Google"},secondary = true)
            BarkTextAction("Continue with email",{controller.go(CompanionScreen.Email)},Modifier.align(Alignment.CenterHorizontally))
            BarkTextAction("Continue without an account", { scope.launch { if (dog != null) onEnterJournal(dog.id) else if (state.draft.name.isBlank()) controller.go(CompanionScreen.Dog) else controller.go(CompanionScreen.Ready) } }, Modifier.align(Alignment.CenterHorizontally))
            CaptionText("Your journal stays on this device. No subscription starts here.")
        }
        CompanionScreen.Email -> {
            CHeading("One link. You’re in.","New here or returning? The same email opens your account.")
            BarkField("Email address",email,{ email = it.take(254) },keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
            CaptionText("Demo mode: no email is sent. The next screen lets you open a local demo link.")
            CFoot("Send sign-in link") { if (Regex("[^\\s@]+@[^\\s@]+\\.[^\\s@]+").matches(email.trim())) controller.go(CompanionScreen.CheckEmail) else controller.setError("Enter a valid email address.") }
        }
        CompanionScreen.CheckEmail -> { CHeading("Check your email.",email); CaptionText("Demo only · no email was sent."); CFoot("Open demo sign-in link") { signedIn("Email") }; BarkButton("Send another link",{controller.go(CompanionScreen.Email)},secondary = true); BarkTextAction("Use another email",{controller.go(CompanionScreen.Email)}) }
        CompanionScreen.EmailExpired -> { CHeading("That link has expired.","Your setup is still here. Send a fresh link to continue."); CDog(name); CFoot("Send a new link") { controller.go(CompanionScreen.Email) } }
        CompanionScreen.AuthOffline -> { CHeading("Connect to sign in.","Real sign-in needs a connection. Your setup stays here."); CaptionText("This build uses local demo sign-in and works offline."); CFoot("Try demo sign-in") { controller.go(CompanionScreen.Login) } }
        CompanionScreen.AccountSettings -> {
            CHeading("Your account.","Care stays with $name. You choose what AI can use.")
            JournalCard { CDog(name); Text(state.session.email,style = MaterialTheme.typography.titleMedium); CaptionText("${state.session.provider} · local demo account") }
            BoardMenu { FeatureRow("Your plan",if (state.session.premium) "Demo Premium" else "Free journal · AI demo available","credit-card") {controller.go(CompanionScreen.ManagePlan)}; FeatureRow("AI & your records","Choose messages, profile and records","shield-check") {controller.go(CompanionScreen.AiPrivacy)}; FeatureRow("Dog profile","The details you chose","paw-print") {controller.go(CompanionScreen.DogProfile)}; FeatureRow("Journal settings","Storage, accessibility & exports","settings-2") { navigation.open(Feature.Settings); controller.go(null) }; FeatureRow("All care tools","Health, calendar, training, photos & more","notebook-pen") { navigation.show(Route.Profile); navigation.open(Feature.CareTools); controller.go(null) } }
            if (state.session.signedIn) CFoot("Sign out",secondary = "Delete demo account",onSecondary = {controller.go(CompanionScreen.DeleteAccount)}) { confirm = true }
            else CFoot("Try demo sign-in") { controller.go(CompanionScreen.Login) }
        }
        CompanionScreen.DogProfile -> {
            CHeading("$name’s profile.","The details you chose. Yours to change.")
            if (dog?.details?.photoId != null) LocalPhoto(dog.details.photoId!!, "$name’s photo", platform.device) else CDog(name)
            if (dog != null) { CProfile(ProfileSnapshot(name,dog.details.sex,dog.details.companion)) { controller.beginEdit(dog); controller.go(it) }; CFoot("Edit setup") { controller.beginEdit(dog) } }
        }
        CompanionScreen.DeleteAccount -> {
            CHeading("Delete your demo account?","This removes the local demo identity and saved conversations.")
            FeatureNotice("Your journal stays","Care records, photos and exports are separate from the demo account.","shield-check")
            BarkButton("Manage plan",{controller.go(CompanionScreen.ManagePlan)},secondary = true)
            CFoot("Keep account",secondary = "Delete demo account",onSecondary = {confirm = true}) {controller.go(CompanionScreen.AccountSettings)}
        }
        else -> Unit
    }
    provider?.let { method -> ConfirmChange("$method sign-in · demo","This approves a local demo identity. No $method account is contacted.","Approve demo sign-in",false,{provider = null},keepLabel = "Cancel",danger = false) {provider = null;signedIn(method)} }
    if(confirm) ConfirmChange(if(route == CompanionScreen.DeleteAccount) "Delete demo account?" else "Sign out on this phone?",if(route == CompanionScreen.DeleteAccount) "Saved conversations will be removed. Your dog journal stays." else "Your device journal and conversations stay here. Demo sign-in is available offline.",if(route == CompanionScreen.DeleteAccount) "Delete demo account" else "Sign out",false,{confirm = false},keepLabel = "Keep account",danger = route == CompanionScreen.DeleteAccount) {confirm = false;scope.launch {if(route == CompanionScreen.DeleteAccount) controller.deleteAccount() else controller.signOut()} }
}

@Composable internal fun ColumnScope.CompanionPlan(route: CompanionScreen,controller: CompanionController,journal: JournalState,onEnterJournal: suspend (String) -> Unit) {
    val state by controller.state.collectAsState(); val scope = rememberCoroutineScope(); val name = journal.selectedDog?.name ?: state.draft.name.ifBlank { "your dog" }
    var billing by rememberSaveable { mutableStateOf("Monthly") }; var showProfile by remember { mutableStateOf(false) }
    fun openJournal() { scope.launch {val id = journal.selectedDog?.id ?: controller.commitDog()?.id;if (id != null) onEnterJournal(id)} }
    fun demoPremium() {scope.launch {if (controller.saveSession(state.session.copy(premium = true))) { if (journal.selectedDog != null) controller.go(CompanionScreen.PremiumReady) else controller.go(CompanionScreen.Ready) }} }
    when(route) {
        CompanionScreen.Plan -> {
            CHeading("Here’s how it fits.","Built from the choices you made.")
            JournalCard { Text("$name’s BarkLog",style = MaterialTheme.typography.headlineMedium); state.draft.context.facts().filter { it.first in listOf("Life stage","Breed or mix","Care priorities","Routines","AI topics") }.forEach { (k,v) -> CaptionText(k); Text(v) } }
            BarkButton("Review dog profile",{showProfile = true},secondary = true)
            CFoot("See my options") {controller.go(CompanionScreen.Paywall)}
        }
        CompanionScreen.Paywall -> {
            CHeading("Make sense of their moments.","AI for $name. A free journal for every day.")
            CompanionBenefits(); CSegment(listOf("Monthly","Yearly"),billing) {billing = it}; JournalCard { Text("$billing · price undecided"); CaptionText("Final prices and AI usage allowance will appear before any purchase.") }
            BarkButton("Start Premium",{},enabled = false); CaptionText("Purchases are unavailable. No charge or subscription starts here.")
            BarkButton("Continue with free journal",{controller.go(CompanionScreen.Ready)},secondary = true)
            BarkTextAction("Try demo AI",::demoPremium); BarkTextAction("Restore purchases",{controller.go(CompanionScreen.Restore)})
        }
        CompanionScreen.Ready,CompanionScreen.PremiumReady -> { CHeading(if(state.session.premium) "Let’s talk about your dog." else "A fresh page for $name.","Your journal is free. ${if(state.session.premium) "Demo AI is ready to explore." else "Premium can wait."}"); CDog(name,true); CompanionBenefits(); CFoot("Open $name’s journal") {openJournal()} }
        CompanionScreen.AiGate -> { CHeading("Ask about $name.","Start with their moments. Follow your curiosity."); CDog(name); JournalCard { Text("What did today look like?"); SupportingText("AI can organize only the records you choose, with source records behind the answer.") }; CFoot("See Premium",secondary = "Keep using free journal",onSecondary = {controller.go(null)}) {controller.go(CompanionScreen.Paywall)}; BarkTextAction("Try demo AI",::demoPremium) }
        CompanionScreen.Trial -> { CHeading("Try the conversations.","Trial proposal · prices not set."); JournalCard { Text("A proposed 7-day trial, if eligible"); CaptionText("No trial can start until the final price, renewal terms and eligibility are set.") }; BarkButton("Start trial",{},enabled = false); CFoot("Continue free") {controller.go(CompanionScreen.Ready)} }
        CompanionScreen.Restore -> { CHeading("Restore a purchase.","Use the same store account that paid for Premium."); CaptionText("This demo has no store connection or purchases to restore."); CFoot("Continue free") {controller.go(CompanionScreen.Ready)} }
        CompanionScreen.ManagePlan -> { CHeading(if(state.session.premium) "Your demo Premium plan." else "Your free journal.","Your journal is yours, with or without Premium."); JournalCard { Text(if(state.session.premium) "Demo Premium" else "Free"); CaptionText("Price & renewal"); Text("Undecided · no billing") }; CompanionBenefits(); CFoot(if(state.session.premium) "Manage plan" else "See Premium") {controller.go(if(state.session.premium) CompanionScreen.StoreManage else CompanionScreen.Paywall)}; if(state.session.premium) BarkButton("Cancel demo plan",{controller.go(CompanionScreen.Cancel)},secondary = true) }
        CompanionScreen.Cancel -> { CHeading("Before you go.","Optional: what would make BarkLog more useful?"); listOf("It doesn’t fit my budget","I’m taking a break","I need something different","I got what I needed").forEach { value -> CChoice(value,selected = false) {controller.go(CompanionScreen.StoreManage)} }; CFoot("Skip · manage in store",secondary = "Keep demo Premium",onSecondary = {controller.go(CompanionScreen.ManagePlan)}) {controller.go(CompanionScreen.StoreManage)} }
        CompanionScreen.StoreManage -> { CHeading("Your store handles billing.","Future subscriptions will be managed through Apple or Google."); CaptionText("No store subscription exists in this demo. Ending the demo plan does not delete your journal or conversations."); CFoot("End demo plan") {scope.launch {if(controller.saveSession(state.session.copy(premium = false))) controller.go(CompanionScreen.Ended)}} }
        CompanionScreen.Ended -> { CHeading("Your journal stays.","Demo Premium access has ended."); CDog(name); FeatureNotice("All your care records","Logs, notes, photos and free exports stay available.","check"); CFoot("Back to journal",secondary = "Read past conversations",onSecondary = {controller.go(CompanionScreen.Threads)}) {controller.go(null)} }
        else -> Unit
    }
    if(showProfile) CDialog("Dog profile",{showProfile = false},actions = {BarkButton("Close profile",{showProfile = false})}) {CProfile(ProfileSnapshot(state.draft.name,state.draft.sex,state.draft.context))}
}
@Composable internal fun CompanionBenefits() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) { listOf("Ask about your dog" to "A conversation grounded in the records you choose.","A week in plain words" to "AI recaps with dates and source records.","Bring better questions" to "Turn your notes into a list to discuss with your vet.","Words for the memories" to "Draft captions from details you provide.").forEach { (title,sub) -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {BarkIcon("message-circle",Modifier.size(22.dp));Column {Text(title,style = MaterialTheme.typography.titleMedium);CaptionText(sub)}} } }
}
