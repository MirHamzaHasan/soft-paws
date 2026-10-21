package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.LocalDraft
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.companion.PremiumFeature
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.presentation.theme.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*

internal val catReportScreens = setOf(Feature.Report, Feature.ReportPreview, Feature.ReportFormat, Feature.Export, Feature.WeightHistory)

@Composable
fun ReportFeatureScreen(page: FeaturePage, context: FeatureContext) {
    if (page.feature == Feature.Report) { CatReportComposer(page, context); return }
    val rawScope = if (page.feature == Feature.Export) page.id.substringBeforeLast('@') else page.id
    if (page.feature == Feature.Export && page.id.substringAfterLast('@') != "CSV" &&
        !PremiumExportAccess(context, PremiumFeature.ReportPdf) { context.navigation.returnTo(Feature.ReportPreview, rawScope) }) return
    var report by remember(context.dog.id, rawScope) { mutableStateOf<ReportSnapshot?>(null) }
    var error by remember(context.dog.id, rawScope) { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    LaunchedEffect(context.dog.id, rawScope, retry) {
        error = false; report = null
        try { report = loadReport(context, rawScope) }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = true }
    }
    when {
        error -> { SoftPawsHeading("Your report stays here."); ErrorCard("Couldn't read this report. Reopen its choices or try again."); BarkButton("Try again", { retry++ }); BarkButton("Report choices", { context.navigation.returnTo(Feature.Report) }, secondary = true) }
        report == null -> SoftPawsCard("Reading selected records") { SkeletonLine(200.dp); SkeletonLine(140.dp) }
        page.feature == Feature.ReportPreview -> {
            SoftPawsHeading("Before the visit, the facts.", "Read the report on this phone for free.", "the facts.")
            CatReportCard(report!!)
            if (report!!.questions.isNotBlank()) SoftPawsCard("Questions for your vet") { SupportingText(report!!.questions) }
            IncludedReportRecords(report!!, context)
            BoardStickyAction { BarkButton("Export options", { context.open(Feature.ReportFormat, rawScope) }) }
        }
        page.feature == Feature.ReportFormat -> ReportOptions(report!!, rawScope, context)
        else -> CatReportExport(report!!, rawScope, page.id.substringAfterLast('@'), context)
    }
}

@Composable
private fun CatReportComposer(page: FeaturePage, context: FeatureContext) {
    val today = JournalDates.day(context.now, context.zone)
    val carried = remember(page.id, context.dog.id) { runCatching { CareReportScope.parse(page.id, context.dog.id) }.getOrNull() }
    val form = rememberFeatureForm(context, "vet-report", mapOf("dog" to (carried?.catId ?: context.dog.id), "from" to (carried?.from ?: today.minus(6, DateTimeUnit.DAY).toString()), "through" to (carried?.through ?: today.toString()), "include" to (carried?.content ?: ReportContent.encode(ReportContent.defaults)), "questions" to (carried?.questions ?: "")), onDraftLoaded = { loaded ->
        // An explicit range from Insights wins over a previously retained report.
        // Saver-restored in-screen edits do not reload or reset these choices.
        carried?.let { loaded.applyReportScope(it) }
    })
    var choices by rememberSaveable { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    val request = runCatching { CareReportScope(form["dog"], form["from"], form["through"], form["include"]).apply { validate() } }.getOrNull()
    var report by remember(request, context.zone.id) { mutableStateOf<ReportSnapshot?>(null) }
    var readError by remember(request) { mutableStateOf(false) }
    LaunchedEffect(request, retry, context.zone.id) {
        report = null; readError = false
        if (request != null) try { report = loadReport(context, request.argument()) }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { readError = true }
    }
    SoftPawsHeading("Before the visit, the facts.", "Read the report on this phone for free.", "the facts.")
    when {
        request == null -> ErrorCard("Choose valid dates, a cat and at least one content type below.")
        readError -> { ErrorCard("Couldn't read these local records. Your choices stay here."); BarkButton("Try again", { retry++ }) }
        report == null -> SoftPawsCard("Care report") { SkeletonLine(180.dp); SkeletonLine(130.dp); SkeletonLine(150.dp) }
        else -> CatReportCard(report!!)
    }
    BarkField("Questions for your vet", form["questions"], { if (it.length <= 2000) form["questions"] = it }, Modifier.fillMaxWidth(), multiline = true, placeholder = "What would you like to discuss?", softPaws = true)
    CaptionText("Caregiver observations only. The report does not diagnose.")
    BarkTextAction(if (choices) "Hide report choices" else "Change cat, dates & content", { choices = !choices }, icon = "sliders-horizontal")
    if (choices || request == null) {
        ChoiceField("Cat", form["dog"], context.journal.dogs.map { it.id to it.name }) { form["dog"] = it }
        CareDateTimeField(form, "from", "From · YYYY-MM-DD", context)
        CareDateTimeField(form, "through", "Through · YYYY-MM-DD", context)
        SoftPawsCard("Include") {
            val included = ReportContent.decode(form["include"])
            ReportContent.entries.forEach { content -> FeatureToggle(content.label, content.description, content in included) { on -> form["include"] = ReportContent.encode(if (on) included + content else included - content) } }
        }
        CaptionText("${context.zone.id} · Medication includes current recorded plans, even when created before these dates. Photo choices include captions/references, never image files.")
    }
    report?.let { IncludedReportRecords(it, context) }
    FeatureFormError(form)
    BoardStickyAction { BarkButton("Export options", {
        scope.launch { form.attempt {
            val exact = CareReportScope(form["dog"], form["from"], form["through"], form["include"], form["questions"])
            exact.validate()
            context.care.saveDraft(context.dog.id, form.slot, LocalDraft(form.encode()))
            context.open(Feature.ReportFormat, exact.argument())
        } }
    }, enabled = report != null && request != null && !context.saving) }
}

@Composable
private fun CatReportCard(report: ReportSnapshot) {
    SoftPawsCard("Care report") {
        Text(report.dog.name, style = MaterialTheme.typography.titleLarge)
        CaptionText("${catCareDateRange(report.from, report.through)} · ${report.zone.id}")
        val profile = report.dog.details
        SoftPawsFact("Profile", listOf(profile.breed.ifBlank { profile.companion.breeds.joinToString().ifBlank { "Breed not recorded" } }, profile.companion.lifestyle.ifBlank { "Lifestyle not recorded" }).joinToString(" · "), "heart")
        if (ReportContent.Care in report.content) {
        val meals = report.events.count { it.type == CareEventType.Meal }
        HorizontalDivider(color = boardColor("hair"))
        SoftPawsFact("Recorded meals", "$meals ${if (meals == 1) "observation" else "observations"}", "utensils")
        HorizontalDivider(color = boardColor("hair"))
        val litter = report.events.filter { it.type == CareEventType.Litter }
        SoftPawsFact("Litter observations", "${litter.size} observations · urine / stool kept separately", "archive")
        HorizontalDivider(color = boardColor("hair"))
        val weight = report.events.filter { it.type == CareEventType.Weight }.maxByOrNull { it.occurredAtMillis }
        SoftPawsFact("Measured weight", (weight?.details as? CareDetails.Weight)?.let { "${it.amount} ${it.unit.label} · ${JournalDates.dateLabel(JournalDates.day(weight.occurredAtMillis, report.zone))}" } ?: "No measurement in this range", "activity")
        }
        if (ReportContent.Medication in report.content) { HorizontalDivider(color = boardColor("hair")); SoftPawsFact("Recorded medication", "${report.events.count { it.type == CareEventType.Medication }} given records · ${report.items.count { it.data is CareItemData.Medication }} recorded plans", "pill") }
        CaptionText("${report.events.size} selected care records · ${report.items.size} selected plan/history/reference records")
    }
}

@Composable
private fun IncludedReportRecords(report: ReportSnapshot, context: FeatureContext) {
    var expanded by rememberSaveable { mutableStateOf(false) }
    var limit by rememberSaveable { mutableIntStateOf(12) }
    BarkTextAction(if (expanded) "Hide included records" else "View included records", { expanded = !expanded }, icon = "notebook-pen")
    if (expanded) {
        report.events.take(limit).forEach { event -> TimelineRow(event, report.zone, includeDate = true, onClick = { context.navigation.detail(event.dogId, event.id) }) }
        report.items.forEach { item ->
            when (val data = item.data) {
                is CareItemData.Medication -> SoftPawsFact("Recorded plan: ${data.name}", listOf(data.amount, data.frequency, data.time, data.directions, if (data.archived) "Archived" else "Current recorded plan").filter(String::isNotBlank).joinToString(" · "), "pill")
                is CareItemData.Vaccination -> SoftPawsFact(data.name, "${data.date} · ${data.provider} · ${data.notes}", "syringe")
                is CareItemData.Expense -> SoftPawsFact(data.description, "${data.date} · ${data.currency} ${Money.format(data.minorUnits, data.currency)} · ${data.notes}", "receipt")
                is CareItemData.Photo -> SoftPawsFact(data.title, "${data.date} · ${data.notes} · local photo reference", "image")
                else -> Unit
            }
        }
        if (report.events.size > limit) BarkButton("Show more records", { limit += 50 }, secondary = true)
        CaptionText("The file includes every selected record and its full note. No image files are exported.")
    }
}

@Composable
private fun ReportOptions(report: ReportSnapshot, rawScope: String, context: FeatureContext) {
    SoftPawsHeading("Take the facts with you.", "Choose exactly what leaves your device.", "with you.")
    SoftPawsList {
        SoftPawsRow("Raw CSV", "Free · saved records as a table", "table") { context.open(Feature.Export, "$rawScope@CSV") }
        HorizontalDivider(color = boardColor("hair"))
        SoftPawsRow("PDF report", "Premium · readable on this phone for free", "notebook-pen") { context.open(Feature.Export, "$rawScope@PDF") }
        HorizontalDivider(color = boardColor("hair"))
        SoftPawsRow("Share or print PDF", "Premium · native share sheet", "send") { context.open(Feature.Export, "$rawScope@PRINT") }
    }
    CaptionText("${report.dog.name} · ${catCareDateRange(report.from, report.through)} · ${report.events.size} care records")
    CaptionText(if (report.questions.isBlank()) "No vet questions included." else "Your vet questions are included in the selected file.")
    CaptionText("No automatic upload or vet share links.")
}

@Composable
private fun CatReportExport(report: ReportSnapshot, rawScope: String, target: String, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val format = if (target == "CSV") ExportFormat.CSV else ExportFormat.PDF
    val premium by (context.companion?.state ?: remember { kotlinx.coroutines.flow.MutableStateFlow(com.dracoarts.shared.presentation.companion.CompanionState()) }).collectAsState()
    var prepared by remember { mutableStateOf<PreparedExport?>(null) }
    var preparing by remember { mutableStateOf(true) }
    var generationError by remember { mutableStateOf<String?>(null) }
    var result by remember { mutableStateOf<DeviceResult<Unit>?>(null) }
    var sharing by remember { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    fun allowed() = format == ExportFormat.CSV || context.companion?.state?.value?.premiumAccess == true
    fun begin() {
        if (!allowed()) { context.companion?.requestPremium(PremiumFeature.ReportPdf); return }
        preparing = true; generationError = null; prepared = null; result = null
        job = scope.launch {
            try {
                require(target in setOf("CSV", "PDF", "PRINT"))
                val document = withContext(Dispatchers.Default) { careReportDocument(report, format) }
                when (val response = context.platform.device.prepareExport(document)) {
                    is DeviceResult.Success -> { if (allowed()) prepared = response.value else generationError = "Premium access changed. Your report stays readable here." }
                    is DeviceResult.Failed -> generationError = response.message
                    DeviceResult.Cancelled -> generationError = "File creation cancelled. Your report choices stay here."
                    DeviceResult.Denied -> generationError = "Couldn't write this local file. Your report choices stay here."
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { generationError = "Couldn't create this file. Your choices and journal stay saved." }
            finally { preparing = false }
        }
    }
    LaunchedEffect(report, target) { begin() }
    SoftPawsHeading(if (preparing) "Preparing your records." else "Ready when you are.", if (preparing) "Building a local file." else "${report.dog.name} · ${catCareDateRange(report.from, report.through)}", if (preparing) null else "you are.")
    SoftPawsCard("Care records.${format.name.lowercase()}") {
        SoftPawsFact("Selected scope", "${report.events.size} care records · ${report.items.size} plan/history/reference records", "check")
        CaptionText("The selected cat, dates, content and vet questions only.")
        prepared?.let { CaptionText(it.filename) }
        if (preparing) { if (LocalBarkMotion.current.reduced) SkeletonLine(180.dp) else LinearProgressIndicator(Modifier.fillMaxWidth(), color = boardColor("accent")) }
    }
    CaptionText("The file is built locally. Choose a destination in the device’s share sheet.")
    generationError?.let { ErrorCard(it); BarkButton("Try again", ::begin) }
    when (val status = result) {
        is DeviceResult.Success -> CaptionText("The file was handed to the operating system.")
        DeviceResult.Cancelled -> CaptionText("Sharing cancelled. Your file and report choices stay here.")
        DeviceResult.Denied -> ErrorCard("That destination wasn't available. Choose another destination.")
        is DeviceResult.Failed -> ErrorCard(status.message)
        null -> Unit
    }
    // Reading current state here also recomposes the destination when entitlements change.
    val canShare = prepared != null && !sharing && (format == ExportFormat.CSV || premium.premiumAccess)
    BoardStickyAction {
        if (prepared != null) BarkButton(if (sharing) "Opening…" else if (target == "PRINT") "Print PDF" else "Share ${format.name}", {
            val file = prepared ?: return@BarkButton
            if (allowed()) scope.launch {
                sharing = true; result = null
                try { result = context.platform.device.sharePrepared(file, target == "PRINT") }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { result = DeviceResult.Failed("Couldn't open sharing. Your local file and journal stay here.") }
                finally { sharing = false }
            } else context.companion?.requestPremium(PremiumFeature.ReportPdf)
        }, enabled = canShare)
        BarkButton(if (preparing) "Cancel export" else "Back to report", { job?.cancel(); context.navigation.returnTo(Feature.ReportPreview, rawScope) }, enabled = !sharing, secondary = true)
    }
}

fun careReportDocument(report: ReportSnapshot, format: ExportFormat): ExportDocument {
    val cat = report.dog.name.replace(Regex("[^a-zA-Z0-9_-]"), "_").trim('_').ifBlank { "cat" }
    return ExportDocument("SoftPaws_${cat}_${report.from}_to_${report.through}.${format.name.lowercase()}", format, "Soft Paws care report", JournalReport.lines(report), if (format == ExportFormat.CSV) JournalReport.csv(report) else "")
}

fun FeatureForm.applyReportScope(scope: CareReportScope) {
    scope.validate()
    this["dog"] = scope.catId; this["from"] = scope.from; this["through"] = scope.through; this["include"] = scope.content
    if (scope.questions.isNotBlank()) this["questions"] = scope.questions
}

suspend fun loadReport(context: FeatureContext, scope: String): ReportSnapshot {
    val request = CareReportScope.parse(scope, context.dog.id)
    return readCareReport(context.repository, context.care::items, request, context.zone, context.platform.nowMillis())
}
