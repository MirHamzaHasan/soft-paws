package com.dracoarts.shared.presentation.navigation

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.Saver
import com.dracoarts.shared.domain.model.CareEventType
import com.dracoarts.shared.domain.model.CareEventRules

data class JournalPage(val kind: Kind, val dogId: String, val eventId: String, val typeKey: String = "", val sessionId: String = eventId) {
    enum class Kind { New, Detail, Edit, Saved }
}

enum class Route(val label: String, val symbol: String) {
    Home("Today", "⌂"), Timeline("Journal", "≡"), Insights("Insights", "↗"), Profile("You", "○"),
    Care("Care", "♡"), Memories("Memories", "□");

    /** Insights remains restorable from inherited state; it is reached through Care. */
    val dockRoute get() = if (this == Insights) Care else this
    companion object { val dockRoutes = listOf(Home, Timeline, Care, Memories, Profile) }
}

enum class Feature {
    CareTools, DogSwitcher, DogAdd, DogEdit, Settings, Sounds, DeleteDog, DeleteAll, Chooser, Health,
    Medications, MedicationForm, MedicationDetail, MedicationGiven, MedicationArchive, MedicationHistory, Vaccinations, VaccinationForm,
    Calendar, TaskForm, TaskDetail, ReminderOptIn, Safety, Emergency, EmergencyEdit, Toxicity, FirstAid, Triage, NearestVet, TrainDog,
    Report, ReportPreview, ReportFormat, Export, Training, Program, TrainingProgress, Session, TrainingSummary,
    Photos, PhotoForm, PhotoDetail, Baselines, Expenses, ExpenseForm, ExpenseDetail,
    Memory, MemoryCollection, MemoryHighlight, MemoryCaption, MemoryShare, Monthly, VideoHighlight, VideoHighlightGate, WeightHistory,
}
data class FeaturePage(val feature: Feature, val id: String = "")
/** Uses the same safe argument format as the persisted feature stack. */
fun AppState.openHighlightPreview(photoIndex: Int) {
    require(photoIndex in 0..11)
    open(Feature.VideoHighlight, "preview@$photoIndex")
}

enum class BoardNavigationMove { Cut, Tab, Push, Cover, Carry, Back }
typealias BoardNavigationHandler = (BoardNavigationMove, () -> Unit) -> Unit

class AppState(initialRoute: Route = Route.Home) {
    /** The shell snapshots the outgoing pixels before changing the single active writer. */
    var navigationHandler: BoardNavigationHandler? = null
    private fun change(move: BoardNavigationMove, action: () -> Unit) { navigationHandler?.invoke(move, action) ?: action() }
    var backGuard by mutableStateOf<(() -> Boolean)?>(null)
    var route by mutableStateOf(initialRoute)
        private set
    var page by mutableStateOf<JournalPage?>(null)
        private set
    var featureStack by mutableStateOf<List<FeaturePage>>(emptyList())
        private set
    val featurePage get() = featureStack.lastOrNull()
    val canGoBack get() = backGuard != null || page != null || featureStack.isNotEmpty() || route != Route.Home
    fun show(route: Route) {
        if (this.route == route && page == null && featureStack.isEmpty()) return
        change(BoardNavigationMove.Tab) { page = null; featureStack = emptyList(); this.route = route }
    }
    fun open(feature: Feature, id: String = "") {
        require(!id.contains('|') && !id.contains('~') && !id.contains(':'))
        change(if (feature == Feature.Chooser) BoardNavigationMove.Cover else BoardNavigationMove.Push) { page = null; featureStack = featureStack + FeaturePage(feature, id) }
    }
    /** Called inside the companion's existing snapshot transition; never enqueue a second one. */
    internal fun openJournalTool(feature: Feature) {
        page = null; featureStack = listOf(FeaturePage(feature)); route = Route.Home
    }
    internal fun enterJournal(route: Route = Route.Home) {
        page = null; featureStack = emptyList(); this.route = route
    }
    fun replace(feature: Feature, id: String = "") {
        require(!id.contains('|') && !id.contains('~') && !id.contains(':'))
        change(BoardNavigationMove.Carry) { page = null; featureStack = featureStack.dropLast(1) + FeaturePage(feature, id) }
    }
    fun openReminder(feature: Feature, id: String = "") {
        require(feature in setOf(Feature.Calendar, Feature.TaskDetail, Feature.MedicationDetail))
        require(!id.contains('|') && !id.contains('~') && !id.contains(':'))
        change(BoardNavigationMove.Push) {
            page = null; route = Route.Care
            val root = if (feature == Feature.MedicationDetail) Feature.Medications else Feature.Calendar
            val rootId = if (feature == Feature.TaskDetail) id.substringAfter('@', "").substringBefore('@') else ""
            featureStack = listOf(FeaturePage(root, rootId)) + if (feature == root) emptyList() else listOf(FeaturePage(feature, id))
        }
    }
    fun newLog(dogId: String, type: CareEventType, requestId: String) { require(type in CareEventRules.detailedTypes); change(BoardNavigationMove.Carry) { page = JournalPage(JournalPage.Kind.New, dogId, requestId, type.key) } }
    fun detail(dogId: String, eventId: String) = change(if (page?.kind == JournalPage.Kind.New) BoardNavigationMove.Carry else BoardNavigationMove.Push) {
        if (page?.kind == JournalPage.Kind.New && featurePage?.feature == Feature.Chooser) featureStack = featureStack.dropLast(1)
        page = JournalPage(JournalPage.Kind.Detail, dogId, eventId)
    }
    fun edit(dogId: String, eventId: String, sessionId: String) = change(BoardNavigationMove.Carry) { page = JournalPage(JournalPage.Kind.Edit, dogId, eventId, sessionId = sessionId) }
    fun saved(dogId: String, eventId: String) = change(BoardNavigationMove.Carry) {
        if (featurePage?.feature == Feature.Chooser) featureStack = featureStack.dropLast(1)
        page = JournalPage(JournalPage.Kind.Saved, dogId, eventId)
    }
    fun closePage() = change(BoardNavigationMove.Back) { page = null; featureStack = emptyList() }
    fun returnTo(feature: Feature, id: String = "") = change(BoardNavigationMove.Back) {
        require(!id.contains('|') && !id.contains('~') && !id.contains(':'))
        page = null
        val index = featureStack.indexOfLast { it.feature == feature && it.id == id }
        featureStack = if (index >= 0) featureStack.take(index + 1) else featureStack.dropLast(1) + FeaturePage(feature, id)
    }
    /** Keep the agenda's selected day beneath editors/details and in saved navigation. */
    fun rememberCalendarDay(date: String, weekEnd: String = date) {
        kotlinx.datetime.LocalDate.parse(date)
        kotlinx.datetime.LocalDate.parse(weekEnd)
        val argument = if (date == weekEnd) date else "$date@$weekEnd"
        val index = featureStack.indexOfLast { it.feature == Feature.Calendar }
        if (index >= 0) featureStack = featureStack.mapIndexed { i, item -> if (i == index) item.copy(id = argument) else item }
    }
    fun back() {
        if (backGuard?.invoke() == true) return
        backUnconditionally()
    }
    fun backUnconditionally() = change(BoardNavigationMove.Back) {
        val current = page
        if (current?.kind == JournalPage.Kind.Edit) page = JournalPage(JournalPage.Kind.Detail, current.dogId, current.eventId)
        else if (current != null) page = null
        else if (featureStack.isNotEmpty()) featureStack = featureStack.dropLast(1)
        else route = if (route == Route.Insights) Route.Care else Route.Home
    }

    fun savedValue(): String = listOf(route.name, page?.kind?.name.orEmpty(), page?.dogId.orEmpty(), page?.eventId.orEmpty(), page?.typeKey.orEmpty(), page?.sessionId.orEmpty(), featureStack.joinToString("~") { "${it.feature.name}:${it.id}" }).joinToString("|")

    companion object {
        val Saver = Saver<AppState, String>(
            save = { it.savedValue() },
            restore = { saved -> restoreValue(saved) },
        )
        fun restoreValue(saved: String): AppState {
            val parts = saved.split("|")
            val result = AppState(Route.entries.firstOrNull { it.name == parts.firstOrNull() } ?: Route.Home)
            if (parts.size >= 6 && parts[2].isNotBlank() && parts[3].isNotBlank()) {
                val kind = JournalPage.Kind.entries.firstOrNull { it.name == parts[1] }
                if (kind != null && (kind != JournalPage.Kind.New || CareEventType.fromKey(parts[4]) in CareEventRules.detailedTypes)) result.page = JournalPage(kind, parts[2], parts[3], parts[4], parts[5])
            }
            result.featureStack = parts.getOrNull(6)?.split('~')?.take(30)?.mapNotNull { value ->
                val pair = value.split(':', limit = 2)
                Feature.entries.firstOrNull { it.name == pair[0] }?.let { FeaturePage(it, pair.getOrElse(1) { "" }) }
            }.orEmpty()
            return result
        }
    }
}
