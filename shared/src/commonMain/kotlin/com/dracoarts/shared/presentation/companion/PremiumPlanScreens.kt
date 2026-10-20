package com.dracoarts.shared.presentation.companion

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.domain.model.PremiumPlan
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalState
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.SoundCue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.PI

/** task047's approved board composition. Billing remains owned by the controller. */
@Composable
internal fun PremiumPlanScreen(
    route: CompanionScreen, controller: CompanionController, journal: JournalState,
    applySafeInsets: Boolean, onBack: () -> Unit, onEnterJournal: suspend (String) -> Unit,
) {
    val state by controller.state.collectAsState()
    val scope = rememberCoroutineScope()
    val dog = journal.selectedDog
    // An in-progress setup belongs to its new dog, never the previously selected dog.
    val settingUp = dog == null || (route == CompanionScreen.Plan && (state.draft.addingDog || state.draft.editingDogId != null))
    val name = (if (settingUp) state.draft.name else dog?.name).orEmpty().ifBlank { "your dog" }
    val context = if (settingUp) state.draft.context else dog!!.details.companion
    val sex = if (settingUp) state.draft.sex else dog!!.details.sex
    val legacy = dog?.details.takeUnless { settingUp }
    val breed = context.breeds.joinToString(" × ").ifBlank { legacy?.breed.orEmpty() }
    val profile = ProfileSnapshot(name, sex, context, legacy?.breed.orEmpty(), legacy?.age.orEmpty(), legacy?.notes.orEmpty())
    var billing by rememberSaveable { mutableStateOf(PremiumPlan.Monthly) }
    var showProfile by remember { mutableStateOf(false) }
    var policy by remember { mutableStateOf<String?>(null) }
    var reaction by remember { mutableIntStateOf(0) }
    val paywall = route == CompanionScreen.Paywall
    fun free() {
        if (state.purchaseBusy) return
        if (state.premiumFeature != null) controller.dismissPremium()
        else if (dog != null && !state.draft.addingDog) scope.launch { onEnterJournal(dog.id) }
        else controller.go(CompanionScreen.Ready)
    }
    fun openJournal() { scope.launch {
        val id = dog?.id ?: controller.commitDog()?.id
        if (id != null) onEnterJournal(id)
    } }
    Column(Modifier.fillMaxSize().then(if (applySafeInsets) Modifier.windowInsetsPadding(WindowInsets.safeDrawing) else Modifier), horizontalAlignment = Alignment.CenterHorizontally) {
        BoxWithConstraints(Modifier.weight(1f).widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth()) {
            val compact = maxHeight < 700.dp
            val scroll = rememberScrollState()
            LaunchedEffect(route) { scroll.scrollTo(0) }
            Column(Modifier.fillMaxWidth().verticalScroll(scroll).padding(horizontal = 20.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(if (paywall && compact) 14.dp else 20.dp)) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    PlanIconButton("Back", "arrow-left", !state.purchaseBusy, onBack)
                    Spacer(Modifier.weight(1f))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        PawMark(Modifier.size(18.dp))
                        Text("BarkLog", style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp, lineHeight = 20.3.sp, fontWeight = FontWeight.Medium))
                    }
                    if (paywall) Spacer(Modifier.weight(1f))
                    if (paywall) PlanIconButton("Continue with free journal", "x", !state.purchaseBusy, ::free)
                }
                state.error?.let { ErrorCard(it) }
                when (route) {
                    CompanionScreen.Plan -> {
                        PlanHeading("A plan for $name.", "The little things you want to keep track of.", planEnter(distance = 10f, duration = 520, easing = CubicBezierEasing(.23f, 1f, .32f, 1f)))
                        PlanCard(planEnter(80, 24f)) {
                            PlanDogHeader("YOUR EVERYDAY", name, listOf(context.stage, breed).filter { it.isNotBlank() }.joinToString(" · "))
                            val reminders = if (context.notifications && context.dailyReminder && context.reminderDays.isNotEmpty())
                                context.reminderDays.joinToString(", ") { listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")[it - 1] } + " · " + context.reminderTime
                            else "Off · add one whenever it helps"
                            listOf(
                                Triple("heart", "What matters to you", context.goals.joinToString(" · ").ifBlank { "Daily care" }),
                                Triple("clock", "Your check-ins", context.routines.joinToString(" · ").ifBlank { "At your own pace" }),
                                Triple("bell", "Reminders", reminders),
                                Triple("message-circle", "Questions you’re curious about", context.topics.joinToString(" · ").ifBlank { "Your questions" }),
                            ).forEachIndexed { index, (icon, label, value) ->
                                HorizontalDivider(color = boardColor("hair"))
                                Row(Modifier.padding(horizontal = 22.dp, vertical = 16.dp), horizontalArrangement = Arrangement.spacedBy(13.dp)) {
                                    BarkIcon(icon, Modifier.size(21.dp).padding(top = 2.dp))
                                    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                        PlanCaption(label, 11)
                                        Text(value, planEnter(180 + index * 170, 25f, 900), style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp, lineHeight = 19.6.sp, fontWeight = FontWeight.Medium))
                                    }
                                }
                            }
                            HorizontalDivider(color = boardColor("hair"))
                            Row(Modifier.fillMaxWidth().heightIn(min = 56.dp).clickable(role = Role.Button, onClick = soundAction({ showProfile = true })).padding(horizontal = 20.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("Review $name’s full profile", Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.Medium))
                                BarkIcon("arrow-up-right", Modifier.size(18.dp))
                            }
                        }
                        PlanFreeNote("Your journal, on-phone reports and raw CSV stay free.")
                        Column(planEnter(650, 10f, 520, CubicBezierEasing(0f, 0f, .2f, 1f)), horizontalAlignment = Alignment.CenterHorizontally) {
                            PlanButton("Compare plans", { controller.go(CompanionScreen.Paywall) }, icon = "arrow-right")
                            BarkTextAction("Start with the free journal", ::free)
                        }
                    }
                    CompanionScreen.Paywall -> {
                        Row(planEnter(), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Surface(shape = CircleShape, color = boardColor("ball"), contentColor = boardColor("ball-ink")) { Box(Modifier.size(23.dp), contentAlignment = Alignment.Center) { PawMark(Modifier.size(13.dp)) } }
                                    Text("Soft Paws Premium", style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp, fontWeight = FontWeight.Medium))
                                }
                                PlanTitle("More for\n$name.")
                            }
                            AnimatedCareNotebook(Modifier.size(if (compact) 142.dp else 158.dp, if (compact) 146.dp else 174.dp), reaction)
                        }
                        state.premiumFeature?.let { PlanCaption(it.title + " · " + it.description) }
                        Column(planEnter(70), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            PlanPrices(state, billing, { billing = it; reaction++ })
                            val offer = state.premiumCustomer.offers.firstOrNull { it.plan == billing }
                            val price = offer?.price ?: if (state.premiumCustomer.configured) "Unavailable" else billing.referencePrice
                            Row(Modifier.fillMaxWidth().semantics(mergeDescendants = true) { liveRegion = LiveRegionMode.Polite }, horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.Bottom) {
                                RollingPlanPrice(price)
                                Text(if (offer != null) " / ${billing.period}" else if (state.premiumCustomer.configured) " in your store" else " USD / ${billing.period}", style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp), color = boardColor("ink-muted"))
                            }
                            PlanButton(if (state.purchaseBusy) "Please wait…" else "Continue with ${billing.title.lowercase()}", { scope.launch { controller.purchasePremium(billing) } }, enabled = !state.purchaseBusy && offer != null)
                        }
                        PlanBenefits(planEnter(140))
                        FoodScannerComingSoon()
                        PlanFreeNote("Existing dog journals and emergency contacts stay free.")
                        FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterHorizontally)) {
                            BarkTextAction("Restore", { controller.go(CompanionScreen.Restore) }, enabled = !state.purchaseBusy)
                            BarkTextAction("Terms", { policy = "terms" })
                            BarkTextAction("Privacy", { policy = "privacy" })
                        }
                        PlanCaption("Subscriptions renew until cancelled in your store.")
                        if (state.premiumPreviewAllowed) BarkTextAction("Try Debug Premium preview", { scope.launch { controller.tryDemoPremium() } }, Modifier.align(Alignment.CenterHorizontally), enabled = !state.purchaseBusy)
                    }
                    CompanionScreen.ManagePlan -> {
                        PlanHeading("Your BarkLog.", "A home for $name’s everyday.", planEnter())
                        PlanCard(planEnter(70)) {
                            PlanDogHeader(if (state.premiumCustomer.entitled) "YOUR PLAN" else if (state.premiumAccess) "PREMIUM · PREVIEW" else "YOUR PLAN", if (state.premiumAccess) "Premium" else "Free journal", "For $name" + breed.takeIf { it.isNotBlank() }?.let { " · $it" }.orEmpty(), membership = true)
                            HorizontalDivider(color = boardColor("hair"))
                            Row(Modifier.padding(horizontal = 22.dp, vertical = 18.dp), horizontalArrangement = Arrangement.spacedBy(15.dp)) {
                                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                    Text(if (state.premiumCustomer.entitled) "Premium is active" else if (state.premiumAccess) "Debug Premium preview" else "No subscription", style = MaterialTheme.typography.headlineSmall.copy(fontSize = 18.sp, lineHeight = 21.6.sp))
                                    PlanCaption(if (state.premiumCustomer.entitled) "Your store manages your subscription." else if (state.premiumAccess) "Local preview · no purchase or renewal." else "Keep logging at your own pace.")
                                }
                                Surface(shape = CircleShape, color = boardColor("accent-soft")) { Box(Modifier.size(28.dp), contentAlignment = Alignment.Center) { BarkIcon("check", Modifier.size(16.dp)) } }
                            }
                        }
                        Column(planEnter(140), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                            Text(if (state.premiumAccess) "Alongside your journal" else "Always here for you", style = MaterialTheme.typography.headlineSmall.copy(fontSize = 22.sp, lineHeight = 24.2.sp), modifier = Modifier.semantics { heading() })
                            val included = if (state.premiumAccess) listOf("Soft Paws AI & safety, with your consent", "Additional dog profiles", "PDFs, Memory Books & video exports") else listOf("Care logs, photos and reminders", "Timelines, charts and on-phone reports", "Your records, with raw CSV export")
                            included.forEach { value -> Row(horizontalArrangement = Arrangement.spacedBy(11.dp)) { BarkIcon("check", Modifier.size(18.dp)); Text(value, style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, lineHeight = 19.5.sp)) } }
                        }
                        if (state.premiumAccess) FoodScannerComingSoon()
                        PlanFreeNote("Your existing dog journals stay with you, whatever you choose.")
                        PlanButton(if (state.premiumCustomer.entitled) "Manage in store" else "Explore Premium", { controller.go(if (state.premiumCustomer.entitled) CompanionScreen.StoreManage else CompanionScreen.Paywall) }, enabled = !state.purchaseBusy)
                        if (state.premiumCustomer.entitled) BarkTextAction("Cancel subscription in store", { scope.launch { controller.managePremium() } }, enabled = !state.purchaseBusy)
                        BarkTextAction("Restore purchases", { controller.go(CompanionScreen.Restore) }, Modifier.align(Alignment.CenterHorizontally), enabled = !state.purchaseBusy)
                        if (state.premiumPreviewAllowed && state.session.premium) PlanButton("End Debug preview", { scope.launch { if (controller.saveSession(state.session.copy(premium = false))) controller.go(CompanionScreen.Ended) } }, secondary = true, enabled = !state.purchaseBusy)
                        BarkTextAction("Back to my journal", ::openJournal, Modifier.align(Alignment.CenterHorizontally))
                    }
                    else -> Unit
                }
                Spacer(Modifier.height(4.dp))
            }
        }
        if (paywall) Column(Modifier.widthIn(max = AppSpacing.contentMaxWidth).fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            HorizontalDivider(color = boardColor("hair"))
            Spacer(Modifier.height(4.dp))
            PlanButton(if (state.premiumFeature != null) "Back to preview" else "Continue with free journal", ::free, secondary = true, enabled = !state.purchaseBusy)
            PlanCaption(if (state.premiumCustomer.configured) "Your store confirms any purchase." else "Store setup pending · no payment starts here.", 10)
        }
    }
    if (showProfile) CDialog("$name’s profile", { showProfile = false }, actions = { PlanButton("Close profile", { showProfile = false }) }) { CProfile(profile) }
    policy?.let { key -> CDialog(if (key == "terms") "Terms · setup preview" else "Privacy · setup preview", { policy = null }, actions = { PlanButton("Close", { policy = null }) }) {
        Text(if (key == "terms") "Premium subscriptions renew until cancelled through your Apple or Google account. The store shows the final price and terms before a purchase. Free care logging stays available." else "Your dog journal stays on this device. AI only uses the cloud context you consent to share. No journal sync or photo upload is enabled. Your store and RevenueCat handle purchases when configured.", style = MaterialTheme.typography.bodyMedium)
    } }
}

@Composable private fun PlanTitle(value: String) {
    Text(value, style = MaterialTheme.typography.displayLarge.copy(fontSize = 40.sp, lineHeight = 41.2.sp, letterSpacing = (-1.7).sp), modifier = Modifier.semantics { heading() })
}
@Composable private fun PlanHeading(title: String, subtitle: String, modifier: Modifier) { Column(modifier, verticalArrangement = Arrangement.spacedBy(10.dp)) { PlanTitle(title); PlanCaption(subtitle) } }
@Composable private fun PlanCaption(value: String, size: Int = 12) { Text(value, style = MaterialTheme.typography.bodySmall.copy(fontSize = size.sp, lineHeight = (size * 1.5).sp), color = boardColor("ink-muted")) }
@Composable private fun PlanCard(modifier: Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) { Column(content = content) }
}
@Composable private fun PlanDogHeader(kicker: String, name: String, detail: String, membership: Boolean = false) {
    Row(Modifier.fillMaxWidth().background(boardColor("accent-soft")).heightIn(min = if (membership) 204.dp else 170.dp).padding(start = 22.dp, end = 18.dp, top = 20.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f).padding(bottom = 20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(kicker, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, letterSpacing = 1.3.sp, fontWeight = FontWeight.Medium), color = boardColor("ink-muted"))
            Text(name, style = MaterialTheme.typography.displayLarge.copy(fontSize = if (membership) 40.sp else 36.sp, lineHeight = if (membership) 40.sp else 36.sp, letterSpacing = (-1.1).sp))
            PlanCaption(detail)
        }
        AnimatedCareNotebook(Modifier.size(132.dp, 154.dp).align(Alignment.Bottom))
    }
}
@Composable private fun PlanFreeNote(value: String) { Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) { BarkIcon("shield-check", Modifier.size(18.dp)); PlanCaption(value) } }
@Composable private fun PlanIconButton(label: String, icon: String, enabled: Boolean, onClick: () -> Unit) {
    val source = remember { MutableInteractionSource() }
    Surface(onClick = soundAction(onClick), modifier = Modifier.size(48.dp).then(pressMotion(source, enabled)).semantics { contentDescription = label }, enabled = enabled, interactionSource = source, shape = CircleShape, color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair"))) { Box(contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(20.dp).then(glyphPressMotion(source, if (icon == "arrow-left") -1f else 0f, enabled))) } }
}
@Composable private fun PlanBenefits(modifier: Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(15.dp)) {
        listOf(
            Triple("message-circle", "Answers with their week in view", "Soft Paws AI & safety · shared with your consent."),
            Triple("paw-print", "A journal for every dog", "Each new dog gets their own complete profile."),
            Triple("file-text", "Moments to keep and share", "PDFs, Memory Books and video exports."),
            Triple("map-pin", "Find a vet nearby", "Choose a clinic in Maps, then call."),
        ).forEach { (icon, title, subtitle) -> Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Surface(shape = RoundedCornerShape(10.dp), color = boardColor("inset"), border = BorderStroke(1.dp, boardColor("hair"))) { Box(Modifier.size(30.dp), contentAlignment = Alignment.Center) { BarkIcon(icon, Modifier.size(17.dp)) } }
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) { Text(title, style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, fontWeight = FontWeight.Medium)); PlanCaption(subtitle, 11) }
        } }
    }
}
@Composable private fun FoodScannerComingSoon() {
    Surface(Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp), color = boardColor("inset"), border = BorderStroke(1.dp, boardColor("hair"))) {
        Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            BarkIcon("scan-line", Modifier.size(24.dp))
            Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                PlanCaption("COMING SOON · PREMIUM", 11)
                Text("Pet food scanner", style = MaterialTheme.typography.headlineSmall.copy(fontSize = 18.sp, lineHeight = 21.6.sp))
                PlanCaption("Plain-English cat and dog food labels. Recall alerts for your saved pantry.")
                PlanCaption("Planned feature · not available yet.", 11)
            }
        }
    }
}
@Composable private fun PlanPrices(state: CompanionState, selected: PremiumPlan, onSelect: (PremiumPlan) -> Unit) {
    val motion = LocalBarkMotion.current
    val haptic = LocalHapticFeedback.current
    val position by animateFloatAsState(selected.ordinal.toFloat(), if (motion.reduced) snap() else spring(.86f, (2 * PI / .42).toFloat().let { it * it * motion.speed * motion.speed }), label = "plan selection")
    val fill = boardColor("accent-soft"); val border = boardColor("accent-line")
    Surface(shape = RoundedCornerShape(22.dp), color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) {
        Box(Modifier.padding(6.dp).selectableGroup().drawBehind {
            val width = (size.width - 8.dp.toPx()) / 3
            val origin = Offset((width + 4.dp.toPx()) * position, 0f)
            drawRoundRect(fill, origin, Size(width, size.height), CornerRadius(16.dp.toPx()))
            drawRoundRect(border, origin, Size(width, size.height), CornerRadius(16.dp.toPx()), style = Stroke(1.dp.toPx()))
        }) {
            Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                PremiumPlan.entries.forEach { plan ->
                    val offer = state.premiumCustomer.offers.firstOrNull { it.plan == plan }
                    val price = offer?.price ?: if (state.premiumCustomer.configured) "Unavailable" else plan.referencePrice
                    val chosen = selected == plan
                    val source = remember { MutableInteractionSource() }
                    Column(Modifier.weight(1f).fillMaxHeight().heightIn(min = 114.dp).then(pressMotion(source, !state.purchaseBusy)).selectable(chosen, source, indication = null, enabled = !state.purchaseBusy, role = Role.RadioButton, onClick = soundAction({
                        if (plan != selected) { haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove); onSelect(plan) }
                    }, SoundCue.Selection)).semantics(mergeDescendants = true) { contentDescription = "${plan.title}, $price ${if (offer == null && !state.premiumCustomer.configured) "US dollars " else ""}per ${plan.period}" }.padding(horizontal = 4.dp, vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Surface(Modifier.size(14.dp), shape = CircleShape, color = boardColor(if (chosen) "ink-strong" else "panel"), border = BorderStroke(1.dp, boardColor(if (chosen) "ink-strong" else "hair-2"))) { if (chosen) Box(contentAlignment = Alignment.Center) { BarkIcon("check", Modifier.size(10.dp), boardColor("panel")) } }
                            Text(plan.title, style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Medium))
                        }
                        Text(price, style = MaterialTheme.typography.displaySmall.copy(fontSize = if (state.premiumCustomer.configured) 22.sp else 25.sp, lineHeight = 27.5.sp, letterSpacing = (-1).sp, fontWeight = FontWeight.ExtraBold), textAlign = TextAlign.Center)
                        PlanCaption("/ ${plan.period}", 11)
                    }
                }
            }
        }
    }
}
@Composable private fun RollingPlanPrice(value: String) {
    val motion = LocalBarkMotion.current
    Row(Modifier.clearAndSetSemantics { contentDescription = value }) {
        value.forEachIndexed { index, char -> key(index) {
            AnimatedContent(char, transitionSpec = {
                if (motion.reduced) EnterTransition.None togetherWith ExitTransition.None
                else (slideInVertically(tween(motion.milliseconds(260), easing = CubicBezierEasing(.23f,1f,.32f,1f))) { it } + fadeIn(tween(motion.milliseconds(260)))) togetherWith
                    (slideOutVertically(tween(motion.milliseconds(260), easing = CubicBezierEasing(.23f,1f,.32f,1f))) { -it } + fadeOut(tween(motion.milliseconds(260))))
            }, label = "price character") { Text(it.toString(), style = MaterialTheme.typography.displaySmall.copy(fontSize = 20.sp, lineHeight = 23.sp, fontWeight = FontWeight.Bold, letterSpacing = (-.4).sp)) }
        } }
    }
}
@Composable private fun planEnter(delayMs: Int = 0, distance: Float = 16f, duration: Int = 620, easing: Easing = CubicBezierEasing(.16f,1f,.3f,1f)): Modifier {
    val motion = LocalBarkMotion.current
    val restoring = LocalBoardRestoring.current
    val value = remember { Animatable(if (motion.reduced || restoring) 1f else 0f) }
    LaunchedEffect(motion.replay, motion.reduced, restoring) {
        if (motion.reduced || restoring) value.snapTo(1f)
        else { value.snapTo(0f); delay(motion.milliseconds(delayMs).toLong()); value.animateTo(1f, tween(motion.milliseconds(duration), easing = easing)) }
    }
    return Modifier.graphicsLayer { alpha = value.value; translationY = distance.dp.toPx() * (1f - value.value) }
}

@Composable private fun PlanButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, secondary: Boolean = false, icon: String? = null) {
    BarkButton(label, onClick, modifier.heightIn(min = 56.dp).graphicsLayer { alpha = if (enabled) 1f else .55f }, enabled = enabled, secondary = secondary, icon = icon, outlineWidth = 1.dp)
}
