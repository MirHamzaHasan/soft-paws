package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.Alignment
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.state.JournalDates
import kotlinx.coroutines.launch
import kotlinx.datetime.*

private val expenseCategories = listOf("Vet", "Food", "Medication", "Grooming", "Training", "Supplies", "Other", "Vet care")

@Composable
fun ExpenseFeatureScreen(page: FeaturePage, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    val selected = context.items.firstOrNull { it.id == page.id.substringBefore('@') }
    when (page.feature) {
        Feature.Expenses -> {
            var month by rememberSaveable { mutableStateOf(JournalDates.inputDate(context.now, context.zone).take(7)) }
            var category by rememberSaveable { mutableStateOf("") }
            val first = LocalDate.parse("$month-01")
            val monthLabel = "${first.month.name.lowercase().replaceFirstChar { it.uppercase() }} ${first.year}"
            ScreenHeading("Expenses", "${context.dog.name} · $monthLabel")
            val expenses = context.items.filter { (it.data as? CareItemData.Expense)?.let { value -> value.date.startsWith(month) && (category.isBlank() || value.category == category) } == true }
            val totals = remember(expenses) { expenses.map { it.data as CareItemData.Expense }.groupBy { it.currency }.mapValues { (_, values) -> runCatching { values.fold(0L) { total, item -> check(total <= Long.MAX_VALUE - item.minorUnits); total + item.minorUnits } }.getOrNull() } }
            JournalCard {
                CaptionText("RECORDED TOTAL · $monthLabel${if (category.isNotBlank()) " · $category" else ""}")
                if (totals.isEmpty()) SectionTitle("No expenses this month")
                totals.forEach { (currency, amount) -> if (amount != null) BoardTotal("$currency ${Money.display(amount, currency)}") else SupportingText("$currency total is too large to display. Individual amounts remain saved.") }
            }
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) { (listOf("" to "All") + expenseCategories.map { it to it }).forEach { (key, title) -> val chosen = category == key; Surface(onClick = { category = key }, modifier = Modifier.heightIn(min = 48.dp).semantics { this.selected = chosen }, shape = RoundedCornerShape(50), color = boardColor(if (chosen) "ball" else "panel"), border = if (chosen) null else BorderStroke(1.dp, boardColor("hair"))) { Text(title, Modifier.padding(horizontal = 16.dp, vertical = 12.dp), style = MaterialTheme.typography.bodyMedium) } } }
            BarkButton("Add expense", { context.open(Feature.ExpenseForm) }, secondary = true, icon = "plus")
            if (expenses.isNotEmpty()) BoardMenu { expenses.forEach { item -> val expense = item.data as CareItemData.Expense
                FeatureRow(expense.description.ifBlank { expense.category }, "${expense.category} · ${expense.date}", "receipt", meta = "${expense.currency} ${Money.display(expense.minorUnits, expense.currency)}") { context.open(Feature.ExpenseDetail, item.id) }
            } }
            else FeatureNotice("No expenses recorded", "Add a cost when you want it included in this month’s total.", "receipt")
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { BarkTextAction("Previous month", { month = first.minus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "arrow-left", leading = true); BarkTextAction("Next month", { month = first.plus(1, DateTimeUnit.MONTH).toString().take(7) }, icon = "arrow-right") }
            CaptionText("Totals use your entered amounts. Currencies are shown separately.")
            BarkTextAction("Export recorded costs", { context.open(Feature.Report) }, icon = "file-down")
        }
        Feature.ExpenseForm -> {
            val old = selected?.data as? CareItemData.Expense
            if (page.id.isNotBlank() && old == null) { FeatureNotice("Expense unavailable", "It may have been removed. Your other costs stay saved."); return }
            val initial = mapOf("description" to old?.description.orEmpty(), "amount" to (old?.let { Money.format(it.minorUnits, it.currency) } ?: if (context.reviewScreen == "expense-error") "8000.999" else ""), "currency" to (old?.currency ?: "PKR"), "category" to (old?.category ?: "Vet"), "date" to (old?.date ?: JournalDates.inputDate(context.now, context.zone)), "notes" to old?.notes.orEmpty(), "receipt" to old?.receiptId.orEmpty())
            val form = rememberFeatureForm(context, "expense-${page.id}", initial)
            ScreenHeading(if (old == null) "Add expense" else "Edit expense", "Date, currency and category are required.")
            FeatureInput(form, "description", "Description", !context.saving, max = 160)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) { Box(Modifier.weight(1f)) { FeatureInput(form, "amount", "Amount", !context.saving, max = 18, placeholder = "0.00") }; Box(Modifier.weight(.55f)) { BoardSelect("Currency", form["currency"], Money.currencies.map { it to it }, !context.saving) { form["currency"] = it } } }
            BoardSelect("Category", form["category"], expenseCategories.map { it to it }, !context.saving) { form["category"] = it }
            FeatureInput(form, "date", "Date · YYYY-MM-DD", !context.saving, max = 10)
            FeatureInput(form, "notes", "Notes · optional", !context.saving, multiline = true)
            ReceiptPickerControl(context, form)
            if (form["receipt"].isNotBlank()) BarkTextAction("Remove receipt attachment", { form["receipt"] = "" }, enabled = !context.saving, icon = "x")
            FeatureFormError(form)
            BarkButton(if (context.saving) "Saving…" else "Save expense", { scope.launch { form.attempt {
                val amount = Money.parse(form["amount"], form["currency"])
                val date = LocalDate.parse(form["date"])
                val data = CareItemData.Expense(amount, form["currency"], form["category"], date.toString(), form["notes"].trim(), form["receipt"].takeIf { it.isNotBlank() }, form["description"].trim())
                val saved = context.care.save(context.dog.id, selected?.id ?: form.requestId, JournalDates.dayBounds(date, context.zone).first.coerceAtLeast(0), data, form.expectedRevision, draftSlot = form.slot).also { if (it != null) form.completed = true }
                if (saved != null) { if (old == null) form.reset(context.platform.newId(), initial); context.navigation.replace(Feature.ExpenseDetail, saved.id) }
            } } }, enabled = !context.saving, icon = "check")
            CaptionText("A receipt is optional. Photo selection failure never prevents a valid expense save.")
        }
        Feature.ExpenseDetail -> {
            val expense = selected?.data as? CareItemData.Expense
            if (expense == null) { FeatureNotice("Expense unavailable", "Your other records stay saved."); return }
            var confirm by remember { mutableStateOf(false) }
            val amount = "${expense.currency} ${Money.display(expense.minorUnits, expense.currency)}"
            val title = expense.description.ifBlank { expense.category }
            if (page.id.endsWith("@delete")) {
                ScreenHeading("Delete this expense?", "$title · $amount")
                FeatureNotice("Expense and receipt link will be removed", "Other expenses and care records stay saved.", "trash")
                BarkButton("Keep expense", context.navigation::back)
                BarkButton("Delete permanently", { confirm = true }, enabled = !context.saving, secondary = true)
            } else {
            ScreenHeading(title, "${expense.date} · ${expense.category}")
            JournalCard { CaptionText("RECORDED AMOUNT"); BoardTotal(amount); HorizontalDivider(); CaptionText(if (expense.receiptId == null) "No receipt attached" else "Receipt attached · local ${if (expense.receiptId.endsWith(".pdf")) "PDF" else "image"}"); if (expense.notes.isNotBlank()) Text(expense.notes) }
            expense.receiptId?.let { ReceiptAttachment(it, context) }
            BarkButton("Edit expense", { context.open(Feature.ExpenseForm, selected.id) }, secondary = true, icon = "pencil")
            BarkTextAction("Delete expense", { context.open(Feature.ExpenseDetail, "${selected.id}@delete") }, enabled = !context.saving, danger = true, icon = "trash")
            }
            if (confirm) ConfirmChange("Delete this expense?", "Removes this recorded cost and its private receipt attachment. Other costs remain saved.", "Delete expense", context.saving, { confirm = false }) {
                scope.launch { if (context.care.delete(selected)) context.navigation.replace(Feature.Expenses) }
            }
        }
        else -> error("Not an expense destination")
    }
}

@Composable
private fun ReceiptPickerControl(context: FeatureContext, form: FeatureForm) {
    val scope = rememberCoroutineScope()
    var picking by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    JournalCard {
        BarkIcon("receipt", Modifier.size(28.dp))
        SectionTitle("Receipt · optional")
        SupportingText("Choose one local image or PDF using the platform picker.")
        if (form["receipt"].isNotBlank()) ReceiptAttachment(form["receipt"], context)
        BarkButton(if (picking) "Opening platform picker…" else if (form["receipt"].isBlank()) "Attach receipt" else "Change receipt", { scope.launch {
            picking = true
            try { when (val result = context.platform.device.pickReceipt()) {
                is com.dracoarts.shared.services.DeviceResult.Success -> { form["receipt"] = result.value; message = null }
                com.dracoarts.shared.services.DeviceResult.Cancelled -> message = "No attachment added. Your draft is still here."
                com.dracoarts.shared.services.DeviceResult.Denied -> message = "This file wasn't accessible. Your draft is still here."
                is com.dracoarts.shared.services.DeviceResult.Failed -> message = result.message
            } } finally { picking = false }
        } }, secondary = true, enabled = !picking && !context.saving, icon = "file-text")
        message?.let { CaptionText(it) }
    }
}

@Composable
private fun ReceiptAttachment(fileId: String, context: FeatureContext) {
    val scope = rememberCoroutineScope()
    var opening by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    if (!fileId.endsWith(".pdf")) LocalPhoto(fileId, "Local receipt attachment", context.platform.device)
    BarkTextAction(if (opening) "Opening receipt…" else "Open or share ${if (fileId.endsWith(".pdf")) "PDF receipt" else "receipt"}", { scope.launch {
        opening = true
        try { when (val result = context.platform.device.shareAttachment(fileId)) { is com.dracoarts.shared.services.DeviceResult.Failed -> error = result.message; com.dracoarts.shared.services.DeviceResult.Denied -> error = "This receipt wasn't accessible. Your expense stays saved."; else -> error = null } } finally { opening = false }
    } }, enabled = !opening, icon = "file-text")
    error?.let { ErrorCard(it) }
}
