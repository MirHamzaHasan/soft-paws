package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.DeviceResult
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.datetime.*

internal val catExpenseScreens = setOf(Feature.Expenses, Feature.ExpenseForm, Feature.ExpenseDetail)

@Composable
fun ExpenseFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val selected = context.items.firstOrNull { it.id == page.id.substringBefore('@') }
    when (page.feature) {
        Feature.Expenses -> CatExpenses(context)
        Feature.ExpenseForm -> CatExpenseEditor(page, selected, context)
        Feature.ExpenseDetail -> CatExpenseDetails(page, selected, context)
        else -> error("Not an expense destination")
    }
}

@Composable
private fun CatExpenses(context: FeatureContext) {
    var month by rememberSaveable(context.dog.id) { mutableStateOf(JournalDates.inputDate(context.now, context.zone).take(7)) }
    var category by rememberSaveable(context.dog.id) { mutableStateOf("") }
    var filters by rememberSaveable { mutableStateOf(false) }
    val first = LocalDate.parse("$month-01")
    val monthLabel = "${first.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${first.year}"
    val recorded = remember(context.dog.id, first, context.items, category) { RecordedExpenses.read(context.dog.id, first, context.items, category) }
    SoftPawsHeading("The costs of a little life.", "$monthLabel · ${context.dog.name}${if (category.isBlank()) "" else " · $category"}", "a little life.")
    if (recorded.items.isEmpty()) SoftPawsCard("No costs recorded here") { SupportingText("Add an expense, or choose another month or category.") }
    else {
        recorded.totals.forEach { (currency, amount) ->
            if (amount == null) ErrorCard("The $currency total is too large to display. Individual amounts stay saved.")
            else CatExpenseAmount(amount, currency)
        }
        CaptionText("Each currency is totalled separately.")
        SoftPawsList {
            recorded.items.forEachIndexed { index, item ->
                if (index > 0) HorizontalDivider(color = boardColor("hair"))
                val cost = item.data as CareItemData.Expense
                SoftPawsRow(cost.description.ifBlank { cost.category },
                    "${Money.display(cost.minorUnits, cost.currency)} ${cost.currency} · ${JournalDates.dateLabel(LocalDate.parse(cost.date))}", expenseIcon(cost.category)) { context.open(Feature.ExpenseDetail, item.id) }
            }
        }
    }
    BarkTextAction(if (filters) "Hide month & category" else "Change month & category", { filters = !filters }, icon = "sliders-horizontal")
    if (filters) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            BarkTextAction("Previous month", { month = first.minus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "chevron-left")
            BarkTextAction("Next month", { month = first.plus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "chevron-right")
        }
        BoardSelect("Category", category, listOf("" to "All categories") + CatExpenseCategories.choices(context.items, category).map { it to it }) { category = it }
        BarkTextAction("Current month", { month = JournalDates.inputDate(context.now, context.zone).take(7) })
    }
    BarkTextAction("Prepare monthly expense report", {
        val argument = CareReportScope(context.dog.id, first.toString(), first.plus(1, DateTimeUnit.MONTH).minus(1, DateTimeUnit.DAY).toString(), ReportContent.encode(setOf(ReportContent.Expenses))).argument()
        context.resetFeatureView(FeaturePage(Feature.Report, argument)); context.open(Feature.Report, argument)
    }, icon = "file-text")
    if (category.isNotBlank()) CaptionText("The monthly report includes all expense categories.")
    BoardStickyAction { BarkButton("Add an expense", { context.open(Feature.ExpenseForm) }) }
}

@Composable
private fun CatExpenseEditor(page: FeaturePage, selected: CareItem?, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val old = selected?.data as? CareItemData.Expense
    if (page.id.isNotBlank() && old == null) { FeatureNotice("Expense unavailable", "It may have been removed. Your other costs stay saved."); return }
    val initial = mapOf("description" to old?.description.orEmpty(), "amount" to (old?.let { Money.format(it.minorUnits, it.currency) } ?: if (context.reviewScreen == "expense-error") "8000.999" else ""),
        "currency" to (old?.currency ?: "PKR"), "category" to (old?.category ?: "Food & treats"), "date" to (old?.date ?: JournalDates.inputDate(context.now, context.zone)), "notes" to old?.notes.orEmpty(), "receipt" to old?.receiptId.orEmpty())
    // Inherited slot/keys keep existing retained drafts available.
    val form = rememberFeatureForm(context, "expense-${page.id}", initial)
    val amountDigits = runCatching { Money.digits(form["currency"]) }.getOrDefault(2)
    SoftPawsHeading("A cost, with context.", if (old == null) "" else "Editing ${context.dog.name}’s saved expense", "with context.")
    BarkField("What was it for?", form["description"], { if (it.length <= 160) form["description"] = it }, Modifier.fillMaxWidth(), !context.saving, softPaws = true)
    BarkField("Amount (${form["currency"]})", form["amount"], { if (it.length <= 18) form["amount"] = it }, Modifier.fillMaxWidth(), !context.saving,
        placeholder = if (amountDigits == 0) "0" else "0." + "0".repeat(amountDigits), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), softPaws = true)
    SoftPawsList {
        CatExpenseCategories.suggested.forEachIndexed { index, name ->
            if (index > 0) HorizontalDivider(color = boardColor("hair"))
            val chosen = form["category"] == name
            Surface(onClick = soundAction({ form["category"] = name }), enabled = !context.saving, color = androidx.compose.ui.graphics.Color.Transparent,
                modifier = Modifier.fillMaxWidth().heightIn(min = 62.dp).semantics { this.selected = chosen; role = Role.RadioButton }) {
                Row(Modifier.padding(vertical = 13.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SoftPawsIconMark(if (name == "Food & treats") "utensils" else expenseIcon(name))
                    Text(name, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                    if (chosen) BarkIcon("check", Modifier.size(20.dp), boardColor("accent"))
                }
            }
        }
    }
    ReceiptPickerControl(context, form)
    BoardSelect("Currency", form["currency"], Money.currencies.map { it to it }, !context.saving) { form["currency"] = it }
    CaptionText("Use the currency paid. Changing it does not convert the entered amount.")
    BoardSelect("More categories", form["category"], CatExpenseCategories.choices(context.items, form["category"]).map { it to it }, !context.saving) { form["category"] = it }
    CareDateTimeField(form, "date", "Date · YYYY-MM-DD", context)
    BarkField("Your note · optional", form["notes"], { if (it.length <= 2000) form["notes"] = it }, Modifier.fillMaxWidth(), !context.saving, multiline = true, softPaws = true)
    BoardStickyAction {
        FeatureFormError(form)
        if (form.error == null) context.careState.error?.let { ErrorCard(it) }
        BarkButton(if (context.saving) "Saving on this device…" else "Keep expense", { scope.launch { form.attempt {
            val amount = Money.parse(form["amount"], form["currency"])
            val date = runCatching { LocalDate.parse(form["date"].trim()) }.getOrNull()
            require(date != null && form["date"].trim().length == 10) { "Enter the expense date as YYYY-MM-DD." }
            val data = CareItemData.Expense(amount, form["currency"], form["category"], date.toString(), form["notes"].trim(), form["receipt"].takeIf { it.isNotBlank() }, form["description"].trim())
            val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, JournalDates.dayBounds(date, context.zone).first.coerceAtLeast(0), data, form.expectedRevision, draftSlot = form.slot)
            if (saved != null) { form.completed = true; context.showSavedFeature(Feature.ExpenseDetail, saved.id) }
        } } }, enabled = !context.saving)
    }
}

@Composable
private fun CatExpenseDetails(page: FeaturePage, selected: CareItem?, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val expense = selected?.data as? CareItemData.Expense
    if (expense == null) { FeatureNotice("Expense unavailable", "Your other records stay saved."); return }
    // A confirmation owns the exact displayed revision, even if a read updates behind it.
    var removing by remember { mutableStateOf<CareItem?>(null) }
    val title = expense.description.ifBlank { expense.category }
    if (page.id.endsWith("@delete")) {
        SoftPawsHeading("Remove this expense?", "$title · ${Money.display(expense.minorUnits, expense.currency)} ${expense.currency}", "expense?")
        SoftPawsCard("Only this recorded cost") { SupportingText("The receipt link will also be removed. Other expenses and records stay saved.") }
        BoardStickyAction {
            BarkButton("Keep expense", context.navigation::back)
            BarkTextAction("Delete expense", { removing = selected }, enabled = !context.saving, danger = true, icon = "trash")
        }
    } else {
        SoftPawsHeading(title, "For ${context.dog.name}", if (expense.description.isBlank()) title else null)
        CatExpenseAmount(expense.minorUnits, expense.currency)
        SoftPawsCard("Expense details") {
            SoftPawsFact(JournalDates.dateLabel(LocalDate.parse(expense.date)), expense.category, expenseIcon(expense.category))
            if (expense.notes.isNotBlank()) Text(expense.notes, style = MaterialTheme.typography.bodyMedium)
        }
        if (expense.receiptId == null) CaptionText("No receipt attached.") else ReceiptAttachment(expense.receiptId, context)
        BarkTextAction("Delete expense", { removing = selected }, enabled = !context.saving, danger = true, icon = "trash")
        BoardStickyAction {
            BarkButton("Edit expense", { context.resetFeatureView(FeaturePage(Feature.ExpenseForm, selected.id)); context.open(Feature.ExpenseForm, selected.id) })
            BarkTextAction("Back to expenses", { context.navigation.returnTo(Feature.Expenses) })
        }
    }
    removing?.let { captured ->
        ConfirmChange("Delete this expense?", context.careState.error ?: "Removes this recorded cost and its receipt link. Other records stay saved.", "Delete expense", context.saving, { removing = null }, keepLabel = "Keep expense") {
            scope.launch { if (context.care.delete(captured)) { removing = null; context.navigation.replace(Feature.Expenses) } }
        }
    }
}

@Composable
private fun CatExpenseAmount(amount: Long, currency: String) {
    val value = (if (currency == "USD") "$" else "") + Money.display(amount, currency)
    val currencyStyle = SpanStyle(fontFamily = MaterialTheme.typography.bodyMedium.fontFamily, fontWeight = FontWeight.Medium,
        fontSize = 14.sp, letterSpacing = 0.sp, color = boardColor("ink-muted"))
    Text(buildAnnotatedString { append(value); withStyle(currencyStyle) { append(" $currency") } },
        style = MaterialTheme.typography.displayLarge.copy(fontSize = if (value.length > 13) 34.sp else 54.sp, lineHeight = 60.sp, letterSpacing = (-2).sp))
}

private fun expenseIcon(category: String) = when (category) {
    "Food & treats", "Food" -> "shopping-bag"
    "Litter" -> "archive"
    "Vet & care", "Vet", "Vet care" -> "heart"
    "Medication" -> "pill"
    "Grooming" -> "sparkles"
    else -> "shopping-bag"
}

@Composable
private fun ReceiptPickerControl(context: FeatureContext, form: FeatureForm) {
    val scope = rememberCoroutineScope()
    var picking by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    val chooseReceipt: () -> Unit = { scope.launch {
            picking = true
            try { when (val result = context.platform.device.pickReceipt()) {
                is DeviceResult.Success -> { form["receipt"] = result.value; message = null }
                DeviceResult.Cancelled -> message = "No attachment added. Your draft is still here."
                DeviceResult.Denied -> message = "This file wasn't accessible. Your draft is still here."
                is DeviceResult.Failed -> message = result.message
            } } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { message = "Couldn't open the picker. Your entries stay here; try again." }
            finally { picking = false }
        } }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (form["receipt"].isNotBlank()) SoftPawsList {
            ReceiptAttachment(form["receipt"], context)
            BarkTextAction("Remove receipt attachment", { form["receipt"] = "" }, enabled = !context.saving, icon = "x")
        }
        Surface(onClick = soundAction(chooseReceipt), enabled = !picking && !context.saving,
            modifier = Modifier.fillMaxWidth().heightIn(min = 62.dp), color = androidx.compose.ui.graphics.Color.Transparent) {
            Row(Modifier.padding(vertical = 13.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SoftPawsIconMark("camera")
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(if (picking) "Opening picker…" else if (form["receipt"].isBlank()) "Attach receipt" else "Change receipt", style = MaterialTheme.typography.bodyMedium)
                    CaptionText("Optional · local image or PDF")
                }
                BarkIcon("chevron-right", Modifier.size(18.dp), boardColor("ink-muted"))
            }
        }
        message?.let { CaptionText(it) }
        HorizontalDivider(color = boardColor("hair"))
    }
}

@Composable
private fun ReceiptAttachment(fileId: String, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    var opening by remember(fileId) { mutableStateOf(false) }
    var error by remember(fileId) { mutableStateOf<String?>(null) }
    var exists by remember(fileId) { mutableStateOf<Boolean?>(null) }
    LaunchedEffect(fileId) {
        try { exists = context.platform.device.photoBytes(fileId)?.isNotEmpty() == true }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { exists = false }
    }
    if (!fileId.endsWith(".pdf") && exists == true) LocalPhoto(fileId, "Receipt on this device", context.platform.device)
    when (exists) {
        null -> CaptionText("Checking the local receipt…")
        false -> ErrorText("The receipt file is unavailable. The expense details stay saved. You can replace or remove the attachment when editing.")
        true -> CaptionText(if (fileId.endsWith(".pdf")) "PDF receipt on this device" else "Image receipt on this device")
    }
    BarkTextAction(if (opening) "Opening receipt…" else "Open or share receipt", { scope.launch {
        opening = true
        try { when (val result = context.platform.device.shareAttachment(fileId)) {
            is DeviceResult.Success, DeviceResult.Cancelled -> error = null
            DeviceResult.Denied -> error = "This receipt wasn't accessible. Your expense stays saved."
            is DeviceResult.Failed -> error = result.message
        } } catch (cancelled: CancellationException) { throw cancelled }
        catch (_: Exception) { error = "Couldn't open this receipt. Your expense stays saved; try again." }
        finally { opening = false }
    } }, enabled = !opening && exists == true, icon = "file-text")
    error?.let { ErrorText(it) }
}
