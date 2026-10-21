package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.content.ContentValues
import android.provider.MediaStore
import org.json.JSONObject
import android.database.sqlite.SQLiteDatabase
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Real local costs, currency precision, native receipts and retained drafts in the owned cat journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsExpensesJourneyTest {
    @Test fun localCostsDraftReceiptFailureAndDeletionSurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-expenses-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
            val heading = mapOf("expenses" to "The costs of a little life.", "expense-form" to "A cost, with context.", "insights" to "Their week, in view.", "weight-history" to "Measured, not guessed.",
                "report" to "Before the visit, the facts.", "export-options" to "Take the facts with you.", "export-progress" to "Ready when you are.")[screen]
            if (heading != null) assertTrue(device.wait(Until.hasObject(By.text(heading)), 25000))
        }
        fun find(label: String) = device.findObject(By.desc(label)) ?: device.findObject(By.text(label))
            ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
        fun visible(label: String): UiObject2 {
            repeat(12) {
                try {
                    val value = find(label)
                    val minimum = if (label == "Back") (44 * context.resources.displayMetrics.density).toInt() else 20
                    if (value != null && value.visibleBounds.height() >= minimum) return value
                } catch (_: StaleObjectException) {
                    Thread.sleep(200)
                    return@repeat
                }
                val topFields = listOf("What was it for?", "Amount (PKR)", "Amount (USD)")
                val headerBack = device.findObject(By.desc("Back")) ?: device.findObject(By.text("Back"))
                val upwards = label == "Back" || label in topFields && (headerBack?.visibleBounds?.bottom ?: 0) < device.displayHeight / 6
                val top = device.displayHeight / 3
                val bottom = device.displayHeight * 3 / 4
                device.swipe(device.displayWidth - 12, if (upwards) top else bottom,
                    device.displayWidth - 12, if (upwards) bottom else top, 28)
                device.waitForIdle(); Thread.sleep(250)
            }
            error("Missing $label")
        }
        fun press(label: String) {
            var previousBounds: android.graphics.Rect? = null
            var stable = 0
            repeat(16) {
                try {
                    var control = visible(label)
                    while (!control.isClickable) control = control.parent ?: error("No action for $label")
                    val bounds = control.visibleBounds
                    stable = if (bounds == previousBounds) stable + 1 else 0
                    previousBounds = bounds
                    if (stable >= 2) { control.click(); device.waitForIdle(); Thread.sleep(400); return }
                } catch (_: StaleObjectException) { stable = 0 }
                Thread.sleep(250)
            }
            error("Control did not settle: $label")
        }
        fun field(label: String, text: String) {
            visible(label)
            var found: UiObject2? = null
            for (attempt in 0..<8) {
                var candidate = device.findObject(By.desc(label))
                while (candidate != null && candidate.className != "android.widget.EditText") candidate = candidate.parent
                if (candidate != null && candidate.visibleBounds.height() >= 44 * context.resources.displayMetrics.density) { found = candidate; break }
                device.swipe(device.displayWidth / 2, device.displayHeight * 3 / 4,
                    device.displayWidth / 2, device.displayHeight * 3 / 5, 24)
                device.waitForIdle(); Thread.sleep(300)
            }
            val input = found ?: error("Missing editable label $label")
            input.click(); Thread.sleep(400); input.text = text; device.waitForIdle()
            assertTrue("Entered text did not reach Compose", device.wait(Until.hasObject(By.clazz("android.widget.EditText").text(text)), 5000))
            // Dismiss the IME through its platform API; Back is a form action.
            instrumentation.runOnMainSync {
                val host = checkNotNull(activity)
                (host.getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager)
                    .hideSoftInputFromWindow(host.window.decorView.windowToken, 0)
                host.currentFocus?.clearFocus()
            }
            device.waitForIdle()
        }
        fun capture(name: String) { Thread.sleep(400); device.waitForIdle(); assertTrue(device.takeScreenshot(File(shots, "$name.png"))); device.dumpWindowHierarchy(File(shots, "$name.xml")) }
        fun scalar(sql: String): String = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir, fixture.databaseName).absolutePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            db.rawQuery(sql, null).use { assertTrue(it.moveToFirst()); it.getString(0) }
        }
        fun value(label: String): String {
            visible(label)
            var input = device.findObject(By.desc(label))
            while (input != null && input.className != "android.widget.EditText") input = input.parent
            return checkNotNull(input) { "Missing editable value $label" }.text.orEmpty()
        }
        val title = "Litter QA " + System.currentTimeMillis()
        val second = "Meal QA " + System.currentTimeMillis()
        val documentName = "SoftPawsReceipt-" + System.currentTimeMillis() + ".pdf"
        var documentUri: android.net.Uri? = null
        fun writeSql(sql: String) = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir, fixture.databaseName).absolutePath, null, SQLiteDatabase.OPEN_READWRITE).use { it.execSQL(sql) }
        try {
            launch("expenses"); capture("android-light-expenses-before")
            press("Add an expense")
            if (value("What was it for?").isNotEmpty()) { press("Back"); press("Discard draft"); launch("expense-form") }
            field("What was it for?", title); field("Amount (PKR)", "15.3500"); press("Keep expense")
            visible("Enter a positive amount with at most 2 decimal places."); capture("android-expense-validation-error")
            assertEquals(title, value("What was it for?")); field("Amount (PKR)", "15.35"); press("Litter")
            press("Attach receipt")
            assertTrue(device.wait(Until.hasObject(By.pkg("com.google.android.documentsui")), 8000) || device.hasObject(By.pkg("com.android.documentsui")))
            capture("android-native-receipt-picker"); device.pressBack(); device.waitForIdle()
            visible("No attachment added. Your draft is still here.")
            documentUri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, documentName); put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf"); put(MediaStore.MediaColumns.RELATIVE_PATH, "Download")
            }) ?: error("Could not create owned QA receipt")
            val pdf = android.graphics.pdf.PdfDocument()
            try {
                val page = pdf.startPage(android.graphics.pdf.PdfDocument.PageInfo.Builder(320, 400, 1).create())
                page.canvas.drawText("Owned Soft Paws QA receipt", 20f, 45f, android.graphics.Paint().apply { textSize = 14f })
                pdf.finishPage(page); context.contentResolver.openOutputStream(documentUri)!!.use(pdf::writeTo)
            } finally { pdf.close() }
            press("Attach receipt"); Thread.sleep(700)
            if (!device.hasObject(By.text(documentName))) { device.findObject(By.desc("Show roots"))?.click(); device.waitForIdle(); device.findObject(By.text("Downloads"))?.click(); device.waitForIdle() }
            (device.wait(Until.findObject(By.text(documentName)), 10000) ?: error("Owned receipt missing from picker")).click()
            device.waitForIdle(); Thread.sleep(600); visible("PDF receipt on this device")
            press("Currency, PKR"); press("USD")
            field("Date · YYYY-MM-DD", "2026-10-14"); field("Your note · optional", "Original local receipt note")
            press("Back"); press("Keep draft"); launch("expense-form")
            assertEquals(title, value("What was it for?")); capture("android-retained-expense-draft")
            writeSql("CREATE TRIGGER fail_owned_cost BEFORE INSERT ON care_items WHEN NEW.kind='expense' BEGIN SELECT RAISE(ABORT, 'owned QA disk failure'); END")
            press("Keep expense"); Thread.sleep(600)
            assertEquals("0", scalar("SELECT COUNT(*) FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'"))
            capture("android-expense-save-failed")
            writeSql("DROP TRIGGER fail_owned_cost")
            press("Keep expense"); visible("Expense details")
            val saved = JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'"))
            assertEquals(1535, saved.getInt("minorUnits")); assertEquals("USD", saved.getString("currency")); assertEquals("Litter", saved.getString("category")); assertEquals("2026-10-14", saved.getString("date"))
            val fileId = saved.getString("receiptId"); assertTrue(File(context.filesDir, "barklog_photos/$fileId").isFile)
            capture("android-light-expense-detail")
            press("Open or share receipt"); Thread.sleep(700); capture("android-native-receipt-share"); device.pressBack(); device.waitForIdle()
            press("Edit expense"); field("Your note · optional", "Edited receipt note"); press("Keep expense"); visible("Edited receipt note")
            assertEquals("2", scalar("SELECT revision FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'"))
            launch("expenses"); press(title); visible("PDF receipt on this device")
            val receiptFile = File(context.filesDir, "barklog_photos/$fileId")
            val heldReceipt = File(context.cacheDir, "owned-receipt-$fileId")
            assertTrue(receiptFile.renameTo(heldReceipt))
            try {
                launch("expenses"); press(title); visible("The receipt file is unavailable.")
                visible("Edited receipt note"); capture("android-missing-receipt-details")
                assertEquals(fileId, JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'" )).getString("receiptId"))
            } finally { assertTrue(heldReceipt.renameTo(receiptFile)) }
            launch("expenses"); press(title); visible("PDF receipt on this device")
            press("Delete expense"); press("Keep expense"); assertEquals("1", scalar("SELECT COUNT(*) FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'"))
            press("Back to expenses"); press("Add an expense")
            field("What was it for?", second); field("Amount (PKR)", "28.40"); press("Keep expense"); visible("Expense details")
            launch("expenses"); visible("PKR"); visible("USD"); capture("android-separate-currencies")
            press("Prepare monthly expense report"); visible("Before the visit, the facts."); capture("android-expense-report-scope")
            for (theme in listOf("Light", "Dark")) for (screen in listOf("expenses", "expense-form", "expense-detail")) {
                launch(screen, theme); capture("android-${theme.lowercase()}-$screen")
                if (screen == "expense-form") { visible("Your note · optional"); capture("android-${theme.lowercase()}-expense-form-more") }
            }
            launch("expenses"); press(second); press("Delete expense"); press("Delete expense")
            visible("The costs of a little life.")
            assertEquals("0", scalar("SELECT COUNT(*) FROM care_items WHERE kind='expense' AND data_json LIKE '%$second%'"))
            assertEquals("1", scalar("SELECT COUNT(*) FROM care_items WHERE kind='expense' AND data_json LIKE '%$title%'"))
            launch("cat-receipt-denied"); field("What was it for?", "Denied receipt QA"); field("Amount (PKR)", "1.00")
            press("Attach receipt"); visible("This file wasn't accessible. Your draft is still here."); capture("android-receipt-access-denied")
            press("Back"); press("Keep draft"); launch("expense-form"); assertEquals("Denied receipt QA", value("What was it for?"))
            press("Back"); press("Discard draft")
        } catch (failure: Throwable) { capture("android-expenses-failure"); throw failure }
        finally {
            runCatching { writeSql("DROP TRIGGER IF EXISTS fail_owned_cost") }
            documentUri?.let { context.contentResolver.delete(it, null, null) }
            previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) }
        }
    }
}
