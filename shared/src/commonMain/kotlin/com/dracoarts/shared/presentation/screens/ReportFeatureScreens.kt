package com.dracoarts.shared.presentation.screens

import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.*
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.datetime.*
import com.dracoarts.shared.presentation.theme.LocalBarkMotion

@Composable
fun ReportFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val today = JournalDates.day(context.now, context.zone)
    if (page.feature == Feature.Report) {
        val carried = page.id.split('@')
        val carriedFrom = carried.getOrNull(0)?.takeIf { Regex("\\d{4}-\\d{2}-\\d{2}").matches(it) }
        val carriedThrough = carried.getOrNull(1)?.takeIf { Regex("\\d{4}-\\d{2}-\\d{2}").matches(it) }
        val form = rememberFeatureForm(context, "report", mapOf("dog" to context.dog.id, "include" to ReportContent.encode(ReportContent.defaults), "from" to (carriedFrom ?: today.minus(6, DateTimeUnit.DAY).toString()), "through" to (carriedThrough ?: today.toString())))
        ScreenHeading("Prepare a report", "Choose what to include.")
        ChoiceField("Dog", form["dog"], context.journal.dogs.map { it.id to it.name }) { form["dog"] = it }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { Box(Modifier.weight(1f)) { FeatureInput(form, "from", "From", max = 10, placeholder = "YYYY-MM-DD") }; Box(Modifier.weight(1f)) { FeatureInput(form, "through", "Through", max = 10, placeholder = "YYYY-MM-DD") } }
        val included = ReportContent.decode(form["include"])
        JournalCard {
            SectionTitle("Include")
            ReportContent.entries.forEach { content -> FeatureToggle(content.label, content.description, content in included) { on -> form["include"] = ReportContent.encode(if (on) included + content else included - content) } }
        }
        FeatureNotice("Local and free", "The preview is built from this device’s journal. Nothing is uploaded.", "shield-check", tone = "info")
        FeatureFormError(form)
        BarkButton("Preview report", { scope.launch { form.attempt {
            val first = LocalDate.parse(form["from"]); val last = LocalDate.parse(form["through"])
            require(last >= first) { "Choose an end date on or after the start." }
            require(included.isNotEmpty()) { "Choose at least one content type." }
            require(context.journal.dogs.any { it.id == form["dog"] }) { "Choose an available dog." }
            context.open(Feature.ReportPreview, "$first@$last@${form["dog"]}@${form["include"]}")
        } } }, icon = "file-text")
        CaptionText("CSV and PDF are free. No records are uploaded. Native sharing is your choice.")
        return
    }
    var snapshot by remember(page.id, context.dog.id) { mutableStateOf<ReportSnapshot?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var retry by remember { mutableIntStateOf(0) }
    var result by remember { mutableStateOf<DeviceResult<Unit>?>(null) }
    var preparing by remember { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    var prepared by remember { mutableStateOf<PreparedExport?>(null) }
    var generationError by remember { mutableStateOf<String?>(null) }
    var started by remember { mutableStateOf(false) }
    var handoff by remember { mutableStateOf(false) }
    LaunchedEffect(page.id, context.dog.id, retry) {
        snapshot = null; error = null
        try { snapshot = loadReport(context, page.id.substringBeforeLast('@').takeIf { page.feature == Feature.Export } ?: page.id) }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = "Couldn't prepare this report. Your saved journal hasn't changed. Try again." }
    }
    if (page.feature != Feature.Export) ScreenHeading(if (page.feature == Feature.ReportFormat) "Choose a format" else "Report preview", snapshot?.let { "${it.dog.name} · ${it.from} to ${it.through}" } ?: "Selected local records")
    when {
        error != null -> { ErrorCard(error!!); BarkButton("Try again", { retry++ }, icon = "refresh-cw") }
        snapshot == null -> JournalCard { CaptionText("Reading the selected local records…"); SkeletonLine(200.dp); SkeletonLine(160.dp) }
        else -> {
            val report = snapshot!!
            if (page.feature == Feature.ReportPreview) {
                JournalCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text("BarkLog care report", style = MaterialTheme.typography.titleMedium); PawMark(Modifier.size(26.dp)) }
                    CaptionText("${report.dog.name} · ${report.from} to ${report.through}")
                    val walks = report.events.mapNotNull { it.details as? CareDetails.Walk }
                    val included = page.id.split('@').getOrNull(3)?.let(ReportContent::decode) ?: ReportContent.defaults
                    val facts = (if (ReportContent.Care in included) listOf("Recorded care" to "${report.events.size} events", "Walks" to "${report.events.count { it.type == CareEventType.Walk }} · ${if (walks.any { it.durationMinutes != null }) "${walks.sumOf { it.durationMinutes ?: 0 }} recorded minutes" else "duration not recorded"}") else emptyList()) + (if (ReportContent.Medication in included) listOf("Medication" to "${report.events.count { it.type == CareEventType.Medication }} administrations in care records") else emptyList()) + listOf("Vaccinations" to report.items.count { it.data is CareItemData.Vaccination }, "Expenses" to report.items.count { it.data is CareItemData.Expense }, "Photo references" to report.items.count { it.data is CareItemData.Photo }).filter { it.second > 0 }.map { it.first to "${it.second} records" }
                    facts.forEach { (label, value) -> HorizontalDivider(); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) { Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodySmall); Text(value, Modifier.weight(1.4f), style = MaterialTheme.typography.bodySmall) } }
                    CaptionText("Caregiver observations, not a diagnosis or treatment plan. ${report.zone.id} · chosen content only.")
                }
                BarkButton("Choose file format", { context.open(Feature.ReportFormat, page.id) }, icon = "file-down")
                BarkTextAction("Change scope", context.navigation::back, icon = "pencil")
                var expanded by remember { mutableStateOf(false) }
                BarkTextAction(if (expanded) "Hide included records" else "View included records", { expanded = !expanded }, icon = "list")
                if (expanded) { report.events.take(12).forEach { event -> TimelineRow(event, context.zone, includeDate = true, onClick = { context.navigation.detail(event.dogId, event.id) }) }; CaptionText("The exported file includes all ${report.events.size} selected care records and their full notes.") }
            } else if (page.feature == Feature.ReportFormat) {
                SupportingText("The same scoped data. Both formats are free.")
                BoardMenu {
                    FeatureRow("CSV", "Rows for a spreadsheet or archive", "table-2") { context.open(Feature.Export, "${page.id}@CSV") }
                    FeatureRow("PDF", "Readable report with page headings", "file-text") { context.open(Feature.Export, "${page.id}@PDF") }
                }
                BarkTextAction("Print PDF", { context.open(Feature.Export, "${page.id}@PRINT") }, icon = "file-text")
            } else {
                val format = if (page.id.substringAfterLast('@') == "CSV") ExportFormat.CSV else ExportFormat.PDF
                val printing = page.id.substringAfterLast('@') == "PRINT"
                val rawScope = page.id.substringBeforeLast('@')
                val begin: () -> Unit = {
                    preparing = true; result = null; prepared = null; generationError = null; handoff = false
                    job = scope.launch {
                        try {
                            val document = withContext(Dispatchers.Default) { val dogName = report.dog.name.replace(Regex("[^a-zA-Z0-9_-]"), "_").trim('_').ifBlank { "dog" }; ExportDocument("BarkLog_${dogName}_${report.from}_to_${report.through}.${format.name.lowercase()}", format, "BarkLog care journal", JournalReport.lines(report), if (format == ExportFormat.CSV) JournalReport.csv(report) else "") }
                            when (val file = context.platform.device.prepareExport(document)) { is DeviceResult.Success -> { prepared = file.value; context.platform.haptics.success() }; is DeviceResult.Failed -> generationError = file.message; DeviceResult.Denied -> generationError = "Couldn't write this local file. Your report choices and journal are unchanged."; DeviceResult.Cancelled -> generationError = "File creation cancelled. Your report choices and journal are unchanged." }
                        } catch (cancelled: CancellationException) { throw cancelled }
                        catch (_: Exception) { generationError = "Couldn't create this file. Your report choices and journal are unchanged." }
                        finally { preparing = false }
                    }
                }
                LaunchedEffect(report) { if (!started) { started = true; begin() } }
                val file = prepared
                when {
                    preparing -> { ScreenHeading("Creating ${format.name}…", "Your journal stays available."); if (LocalBarkMotion.current.reduced) SkeletonLine(220.dp, 12.dp) else LinearProgressIndicator(Modifier.fillMaxWidth()); CaptionText("Assembling recorded care on this device…"); BarkButton("Cancel export", { job?.cancel(); context.navigation.returnTo(Feature.ReportPreview, rawScope) }, secondary = true) }
                    generationError != null -> { FeatureNotice("Couldn't create the file", generationError!!, "circle-x"); BarkButton("Try again", begin, icon = "refresh-cw"); BarkButton("Back to preview", { context.navigation.returnTo(Feature.ReportPreview, rawScope) }, secondary = true) }
                    file != null && !handoff -> { FeatureNotice("${format.name} ready", file.filename, "circle-check-big"); BarkButton("Share or print", { handoff = true }, icon = "send"); BarkButton("Done", { context.navigation.show(Route.Insights) }, secondary = true) }
                    file != null -> {
                        ScreenHeading("Share or print", "Continue in the operating system.")
                        var sharing by remember { mutableStateOf(false) }
                        val share: (Boolean) -> Unit = { print -> scope.launch { sharing = true; result = null; try { result = context.platform.device.sharePrepared(file, print) } catch (cancelled: CancellationException) { throw cancelled } catch (_: Exception) { result = DeviceResult.Failed("Couldn't open this file. Your journal stays saved.") } finally { sharing = false } }; Unit }
                        BoardHandoff("smartphone", "Native share sheet", "The selected ${format.name} is handed to iOS or Android. Available apps and print options come from the device.", if (sharing) "Opening platform handoff…" else "Open platform handoff", !sharing) { share(printing) }
                        if (format == ExportFormat.PDF && !printing) BarkTextAction("Open native print", { share(true) }, enabled = !sharing, icon = "file-text")
                        when (val status = result) { is DeviceResult.Success -> CaptionText("The file was handed to the operating system. Your journal stays here."); DeviceResult.Cancelled -> FeatureNotice("Sharing cancelled", "Your journal and selected report stay here. You can try again.", "file-text"); DeviceResult.Denied -> ErrorCard("The destination wasn't available. Choose another sharing destination."); is DeviceResult.Failed -> ErrorCard(status.message); null -> Unit }
                        BarkButton("Back to preview", { context.navigation.returnTo(Feature.ReportPreview, rawScope) }, enabled = !sharing, secondary = true)
                    }
                }
            }
            CaptionText("Owner observations only. This report does not diagnose, predict or recommend treatment.")
        }
    }
}

suspend fun loadReport(context: FeatureContext, scope: String): ReportSnapshot {
    val pieces = scope.split('@')
    val from = LocalDate.parse(pieces[0]); val through = LocalDate.parse(pieces[1])
    require(through >= from)
    val start = JournalDates.dayBounds(from, context.zone).first.coerceAtLeast(0)
    val end = JournalDates.dayBounds(through, context.zone).second
    val dog = pieces.getOrNull(2)?.let { id -> context.journal.dogs.firstOrNull { it.id == id } } ?: context.dog
    val records = context.repository.observeTimeline(TimelineFilter(dog.id, fromMillis = start, untilMillis = end), Int.MAX_VALUE).first().events
    val items = context.care.items(dog.id).filter { item -> (item.data as? CareItemData.Medication)?.archived == false || item.occurredAt in start until end }
    val snapshot = ReportSnapshot(dog, from, through, context.zone, records, items, context.platform.nowMillis())
    return pieces.getOrNull(3)?.let { snapshot.including(ReportContent.decode(it)) } ?: snapshot
}
