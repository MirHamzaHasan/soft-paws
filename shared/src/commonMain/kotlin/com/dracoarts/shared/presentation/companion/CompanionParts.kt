package com.dracoarts.shared.presentation.companion

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.theme.*
import kotlin.math.PI

@Composable internal fun CHeading(title: String, subtitle: String = "") {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(title, style = MaterialTheme.typography.displayLarge.copy(fontSize = 38.sp, lineHeight = 39.52.sp, letterSpacing = (-1.4).sp), modifier = textEntrance().semantics { heading() })
        if (subtitle.isNotBlank()) SupportingText(subtitle)
    }
}
@Composable internal fun CDog(name: String, large: Boolean = false, reaction: String? = null) {
    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { AnimatedCat(Modifier.size(if (large) 198.dp else 86.dp, if (large) 224.dp else 104.dp), reactionId = reaction, greetingLabel = if (large) "Say hello to $name" else null) }
}
@Composable internal fun CChoice(title: String, subtitle: String = "", icon: String = "paw-print", selected: Boolean, multi: Boolean = false, onClick: () -> Unit) {
    val motion = LocalBarkMotion.current
    val scale by animateFloatAsState(if (selected) 1f else .82f, if (motion.reduced) snap() else spring(.62f, (2 * PI / .36).toFloat().let { it * it }), label = "picked check")
    Surface(soundAction(onClick, com.dracoarts.shared.services.SoundCue.Selection), Modifier.fillMaxWidth().heightIn(min = 82.dp).semantics { this.selected = selected; role = if (multi) Role.Checkbox else Role.RadioButton }, shape = RoundedCornerShape(20.dp), color = boardColor(if (selected) "accent-soft" else "panel"), border = BorderStroke(1.dp, boardColor(if (selected) "accent-line" else "hair"))) {
        Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            BarkIcon(icon, Modifier.size(28.dp)); Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); if (subtitle.isNotBlank()) CaptionText(subtitle) }
            Surface(Modifier.size(24.dp).graphicsLayer { scaleX = scale; scaleY = scale }, shape = CircleShape, color = boardColor(if (selected) "ink-strong" else "panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) { if (selected) Box(contentAlignment = Alignment.Center) { BarkIcon("check", Modifier.size(16.dp), boardColor("ground")) } }
        }
    }
}
@OptIn(ExperimentalLayoutApi::class)
@Composable internal fun CMulti(values: List<String>, choices: List<Triple<String,String,String>>, onChange: (List<String>) -> Unit, unknown: String? = null) {
    CaptionText("${values.size} selected")
    if (values.isNotEmpty()) FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) { values.forEach { v -> BarkTextAction("$v ×", { onChange(values - v) }) } }
    choices.forEach { (value, sub, icon) -> CChoice(value, sub, icon, value in values, true) { onChange(if (value in values) values - value else if (value == unknown) listOf(value) else values.filterNot { it == unknown } + value) } }
}
@Composable internal fun CSegment(values: List<String>, value: String, onChange: (String) -> Unit) {
    val motion = LocalBarkMotion.current
    val position by animateFloatAsState(values.indexOf(value).coerceAtLeast(0).toFloat(), if (motion.reduced) snap() else spring(.78f, (2 * PI / .38).toFloat().let { it * it }), label = "segmented thumb")
    Surface(shape = RoundedCornerShape(16.dp), color = boardColor("inset")) {
        BoxWithConstraints(Modifier.fillMaxWidth().padding(4.dp)) {
            val width = maxWidth / values.size
            Surface(Modifier.width(width).height(48.dp).graphicsLayer { translationX = position * width.toPx() }, color = boardColor("ball"), shape = RoundedCornerShape(12.dp)) {}
            Row { values.forEach { item -> Box(Modifier.width(width)) { BarkTextAction(item, { onChange(item) }, Modifier.fillMaxWidth()) } } }
        }
    }
}
@Composable internal fun CSwitch(title: String, subtitle: String, checked: Boolean, enabled: Boolean = true, onChange: (Boolean) -> Unit) {
    val motion = LocalBarkMotion.current
    val selectionSound = soundAction({}, com.dracoarts.shared.services.SoundCue.Selection)
    val position by animateFloatAsState(if (checked) 20f else 0f, if (motion.reduced) snap() else spring(.70f, (2 * PI / .32).toFloat().let { it * it }), label = "notification switch")
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) { Text(title, style = MaterialTheme.typography.titleMedium); CaptionText(subtitle) }
        Box(Modifier.size(64.dp,48.dp).semantics { contentDescription = title }.toggleable(checked, enabled = enabled, role = Role.Switch, onValueChange = { selectionSound(); onChange(it) }), contentAlignment = Alignment.Center) {
            Surface(Modifier.size(54.dp,34.dp), color = boardColor(if (checked) "ink-strong" else "inset"), shape = CircleShape, border = BorderStroke(1.dp, boardColor("hair-2"))) {
                Box(Modifier.padding(3.dp)) { Surface(Modifier.size(26.dp).graphicsLayer { translationX = position.dp.toPx() }, shape = CircleShape, color = boardColor("panel"), border = BorderStroke(1.dp, boardColor("hair-2"))) { if (checked) Box(contentAlignment = Alignment.Center) { BarkIcon("check", Modifier.size(15.dp), boardColor("ink-strong")) } } }
            }
        }
    }
}
@Composable internal fun ColumnScope.CFoot(label: String, enabled: Boolean = true, secondary: String? = null, onSecondary: (() -> Unit)? = null, onClick: () -> Unit) {
    BoardStickyAction {
        BarkButton(label, onClick, enabled = enabled)
        if (secondary != null && onSecondary != null) BarkTextAction(secondary, onSecondary, Modifier.align(Alignment.CenterHorizontally), enabled = enabled)
    }
}
@Composable internal fun CWeekdays(selected: List<Int>, onChange: (List<Int>) -> Unit) {
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday").forEachIndexed { index, label ->
            val day = index + 1
            FilterChip(day in selected, { onChange(if (day in selected) selected - day else (selected + day).sorted()) }, label = { Text(label.take(3)) }, modifier = Modifier.heightIn(min = 48.dp).semantics { contentDescription = label })
        }
    }
}
internal val profileEdits = mapOf("Sex" to CompanionScreen.Sex, "Life stage" to CompanionScreen.Stage, "Lifestyle" to CompanionScreen.Lifestyle, "Age" to CompanionScreen.Age, "Breed or mix" to CompanionScreen.Breed, "Neutered or spayed" to CompanionScreen.Sex, "Recorded weight" to CompanionScreen.Size, "Care priorities" to CompanionScreen.Goals, "Food" to CompanionScreen.Food, "Allergies or sensitivities" to CompanionScreen.Food, "Known conditions" to CompanionScreen.CareNotes, "Existing care instructions" to CompanionScreen.CareNotes, "Care notes" to CompanionScreen.CareNotes)
@Composable internal fun CProfile(snapshot: ProfileSnapshot, onEdit: ((CompanionScreen) -> Unit)? = null) {
    JournalCard { Text(snapshot.name, style = MaterialTheme.typography.headlineMedium); (listOf("Sex" to snapshot.sex).filter {it.second != "Not recorded"} + snapshot.context.facts() + listOf("Other breed note" to snapshot.breed, "Other age note" to snapshot.age, "Other care notes" to snapshot.notes).filter { it.second.isNotBlank() }).forEachIndexed { index, (key,value) -> Column(Modifier.fillMaxWidth().then(profileValueEntrance(index)), verticalArrangement = Arrangement.spacedBy(5.dp)) { CaptionText(key); Row(verticalAlignment = Alignment.CenterVertically) { Text(value, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge); if (onEdit != null) BarkTextAction("Edit", { onEdit(profileEdits[key] ?: CompanionScreen.ContextReview) }, icon = "pencil") }; HorizontalDivider(color = boardColor("hair")) } } }
    if(onEdit!=null) BoardSelect("Add or change a detail","",profileEdits.entries.map {it.value.boardId to it.key}.distinctBy {it.first}) {id->CompanionScreen.fromBoard(id)?.let(onEdit)}
}

@Composable internal fun CompanionHomeEntry(controller: CompanionController,name: String,modifier: Modifier=Modifier) {
    val state by controller.state.collectAsState()
    Surface(onClick=soundAction({controller.go(if(!state.premiumAccess)CompanionScreen.AiGate else if(controller.requiresAiConsent)CompanionScreen.AiPrivacy else CompanionScreen.Chat)}),modifier=modifier.fillMaxWidth().heightIn(min=70.dp),shape=RoundedCornerShape(19.dp),color=boardColor("panel"),border=BorderStroke(1.dp,boardColor("hair-2"))) {
        Row(Modifier.padding(horizontal=16.dp,vertical=12.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(12.dp)) {
            Surface(shape=RoundedCornerShape(15.dp),color=boardColor("ball"),contentColor=boardColor("ball-ink")) {Box(Modifier.size(44.dp),contentAlignment=Alignment.Center) {PawMark(Modifier.size(24.dp))}}
            Column(Modifier.weight(1f)) {Text("Ask about $name",style=MaterialTheme.typography.titleMedium);CaptionText(if (!state.premiumAccess) "AI chat · Premium" else if (controller.demoResponses) "Demo AI · profile + past 7 days" else if (controller.atlasOnly) "Soft Paws AI · profile + past 7 days" else "On-device AI · automatic context")};BarkIcon(if(state.premiumAccess)"arrow-up-right" else "lock-keyhole",Modifier.size(20.dp))
        }
    }
}

@Composable private fun profileValueEntrance(index: Int): Modifier {
    val motion=LocalBarkMotion.current;val restoring=LocalBoardRestoring.current
    if(index>=5)return Modifier
    val progress=remember {Animatable(1f)}
    LaunchedEffect(motion.replay,motion.reduced,restoring) {if(motion.reduced||restoring)progress.snapTo(1f) else {progress.snapTo(0f);kotlinx.coroutines.delay(motion.milliseconds(index*90).toLong());progress.animateTo(1f,tween(motion.milliseconds(680),easing=CubicBezierEasing(.16f,1f,.3f,1f)))}}
    return Modifier.graphicsLayer {alpha=progress.value;translationY=6.dp.toPx()*(1-progress.value)}
}
