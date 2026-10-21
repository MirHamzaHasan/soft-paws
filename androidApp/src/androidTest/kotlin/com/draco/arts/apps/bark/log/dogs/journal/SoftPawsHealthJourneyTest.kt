package com.draco.arts.apps.bark.log.dogs.journal

import android.content.ContentValues
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.provider.MediaStore
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** UI writes and native document picker in the owned, separate cat review journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsHealthJourneyTest {
    @Test fun prescribedPlanGivenHistoryAndLocalDocumentSurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-health-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
        }
        fun find(label: String) = device.findObject(By.text(label)) ?: device.findObject(By.desc(label))
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
                val top = device.displayHeight / 3
                val bottom = device.displayHeight * 3 / 4
                device.swipe(device.displayWidth / 2, if (label == "Back") top else bottom,
                    device.displayWidth / 2, if (label == "Back") bottom else top, 28)
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
        val stamp = System.currentTimeMillis()
        val name = "Clinic plan QA $stamp"
        val instructions = "Copy of the clinic instructions for QA."
        val revised = "Revised copy from the clinic for QA."
        val vaccine = "Clinic record QA $stamp"
        val documentName = "SoftPawsCareQA-$stamp.pdf"
        var documentUri: android.net.Uri? = null
        device.wakeUp()
        try {
            launch("medications"); assertTrue(visible("Your vet’s plan, remembered.").isEnabled); capture("android-light-medications")
            press("Add a prescribed plan"); assertTrue(visible("Keep the prescribed details.").isEnabled); capture("android-light-med-form")
            field("Medication name", name); field("Prescribed instructions", instructions)
            field("Start date · YYYY-MM-DD", "2026-10-20")
            var basicChoice = visible("Remind me at a time I choose")
            while (!basicChoice.isCheckable) basicChoice = basicChoice.parent ?: error("No reminder checkbox")
            if (basicChoice.isChecked) press("Remind me at a time I choose")
            press("Back"); press("Keep draft")
            launch("med-form"); assertTrue(visible(name).isEnabled)
            press("Keep plan"); assertTrue(visible("Your saved instructions").isEnabled)
            assertTrue(visible(instructions).isEnabled); capture("android-light-med-detail")
            val planId = scalar("SELECT id FROM care_items WHERE data_json LIKE '%$name%' AND kind='medication'")
            val beforeGiven = scalar("SELECT count(*) FROM care_events").toLong()
            press("Record as given"); assertTrue(visible("Recorded as given.").isEnabled)
            assertEquals(beforeGiven + 1, scalar("SELECT count(*) FROM care_events").toLong())
            assertEquals("1", scalar("SELECT count(*) FROM care_items WHERE kind='administration' AND data_json LIKE '%$planId%'"))
            press("Back to plan"); press("Edit prescribed details"); field("Prescribed instructions", revised); press("Keep plan")
            assertTrue(visible(revised).isEnabled)
            val given = JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='administration' AND data_json LIKE '%$planId%'"))
            assertEquals(instructions, given.getString("instructions")); assertEquals("", given.getString("amount"))
            press("Archive this plan"); press("Keep plan active"); assertTrue(visible("Your saved instructions").isEnabled)
            press("Archive this plan"); press("Archive plan"); assertTrue(visible("Care history, kept.").isEnabled); capture("android-light-med-history")
            assertTrue(JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$planId'")).getBoolean("archived"))
            launch("med-history"); press(name); assertTrue(visible("Archived · reminders off").isEnabled)
            assertFalse(device.hasObject(By.text("Record as given")))

            launch("med-form")
            field("Medication name", "Chosen reminder QA $stamp"); field("Prescribed instructions", instructions)
            field("Start date · YYYY-MM-DD", "2026-11-01")
            var choice = visible("Remind me at a time I choose")
            while (!choice.isCheckable) choice = choice.parent ?: error("No reminder checkbox")
            if (!choice.isChecked) press("Remind me at a time I choose")
            field("Reminder time · HH:mm", "23:59"); press("Keep plan")
            assertTrue(visible("Your saved instructions").isEnabled)
            val reminder = JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='medication' AND data_json LIKE '%Chosen reminder QA $stamp%'"))
            assertEquals("23:59", reminder.getJSONObject("reminder").getString("time"))
            assertFalse("Saving must not ask notification permission", device.hasObject(By.res("com.android.permissioncontroller", "permission_allow_button")))
            if (find("Enable notifications") != null) {
                press("Enable notifications")
                // Android uses a different Deny resource after a prior denial.
                val deny = By.res(java.util.regex.Pattern.compile("com.android.permissioncontroller:id/permission_deny.*_button"))
                device.wait(Until.findObject(deny), 2500)?.let {
                    capture("android-reminder-permission")
                    it.click()
                    assertTrue(device.wait(Until.gone(deny), 5000))
                }
                device.waitForIdle()
            }
            capture("android-reminder-after-commit")
            press("Archive this plan"); press("Archive plan"); assertTrue(visible("Care history, kept.").isEnabled)

            launch("vaccinations"); assertTrue(visible("Dates worth keeping close.").isEnabled); capture("android-light-vaccinations")
            press("Add a record"); assertTrue(visible("A vaccination, recorded.").isEnabled); capture("android-light-vaccine-form")
            field("Name on the record", vaccine); field("Clinic or vet · optional", "Owned QA clinic")
            press(if (device.hasObject(By.text("Change document"))) "Change document" else "Attach document"); Thread.sleep(800); device.pressBack(); device.waitForIdle()
            assertTrue(visible("No document added. Your entries are still here.").isEnabled)
            documentUri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, documentName); put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf"); put(MediaStore.MediaColumns.RELATIVE_PATH, "Download")
            }) ?: error("Could not create owned QA document")
            val document = android.graphics.pdf.PdfDocument()
            try {
                val page = document.startPage(android.graphics.pdf.PdfDocument.PageInfo.Builder(320, 400, 1).create())
                page.canvas.drawText("Owned Soft Paws QA document", 20f, 45f, android.graphics.Paint().apply { textSize = 14f })
                document.finishPage(page)
                context.contentResolver.openOutputStream(documentUri!!)!!.use(document::writeTo)
            } finally { document.close() }
            press(if (device.hasObject(By.text("Change document"))) "Change document" else "Attach document"); Thread.sleep(800)
            if (!device.hasObject(By.text(documentName))) {
                device.findObject(By.desc("Show roots"))?.click(); device.waitForIdle()
                device.findObject(By.text("Downloads"))?.click(); device.waitForIdle()
            }
            val picked = device.wait(Until.findObject(By.text(documentName)), 10000) ?: error("Native picker missing owned PDF")
            picked.click(); device.waitForIdle(); Thread.sleep(700)
            assertTrue(visible("Open or share document").isEnabled)
            press("Back"); press("Keep draft")
            launch("vaccine-form"); assertTrue(visible("Open or share document").isEnabled)
            press("Keep record"); assertTrue(visible("Dates worth keeping close.").isEnabled)
            val saved = JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='vaccination' AND data_json LIKE '%$vaccine%'"))
            val fileId = saved.getString("documentId")
            assertTrue(fileId.endsWith(".pdf")); assertTrue(File(context.filesDir, "barklog_photos/$fileId").exists())
            launch("vaccinations"); press(vaccine); assertTrue(visible("Open or share document").isEnabled)
            capture("android-light-vaccine-document")
            press("Open or share document"); Thread.sleep(700); device.pressBack(); device.waitForIdle()
            assertTrue(visible("Open or share document").isEnabled)
            for (screen in listOf("medications", "med-form", "med-detail", "med-history", "vaccinations", "vaccine-form")) {
                launch(screen, "Dark"); capture("android-dark-$screen")
            }
        } catch (failure: Throwable) { capture("android-failure"); throw failure }
        finally {
            documentUri?.let { context.contentResolver.delete(it, null, null) }
            previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) }
        }
    }
}
