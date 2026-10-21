package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Actual local CSV, retained vet questions and gated PDF in the owned cat journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsReportsJourneyTest {
    @Test fun actualCsvRetainedQuestionsAndPdfBoundarySurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-reports-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
            val heading = mapOf("insights" to "Their week, in view.", "weight-history" to "Measured, not guessed.",
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
                val topFields = listOf("Measured weight")
                val headerBack = device.findObject(By.desc("Back")) ?: device.findObject(By.text("Back"))
                val upwards = label == "Back" || label in topFields && (headerBack?.visibleBounds?.bottom ?: 0) < device.displayHeight / 6
                val top = device.displayHeight / 3
                val bottom = device.displayHeight * 3 / 4
                device.swipe(device.displayWidth / 2, if (upwards) top else bottom,
                    device.displayWidth / 2, if (upwards) bottom else top, 28)
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
        val question = "Discuss appetite | ~ : @ 城区 QA " + System.currentTimeMillis()
        try {
            launch("report")
            val before = scalar("SELECT COUNT(*) FROM care_events")
            field("Questions for your vet", question)
            press("Export options")
            visible("Raw CSV")
            press("Raw CSV")
            visible("Share CSV")
            capture("android-csv-ready")
            val export = File(context.cacheDir, "exports").walkTopDown().filter { it.extension == "csv" }.maxByOrNull { it.lastModified() }
                ?: context.cacheDir.walkTopDown().filter { it.extension == "csv" }.maxByOrNull { it.lastModified() }
                ?: error("Actual CSV was not written")
            val csv = export.readText()
            assertTrue(export.name.startsWith("SoftPaws_Miso_"))
            assertTrue(csv.contains(question)); assertTrue(csv.contains("vet_questions"))
            press("Share CSV")
            assertTrue("Native share sheet unavailable", device.wait(Until.hasObject(By.pkg("com.android.intentresolver")), 10000))
            capture("android-native-csv-share")
            device.pressBack(); device.waitForIdle(); visible("Share CSV")
            press("Back to report")
            visible("Questions for your vet")
            launch("report")
            assertEquals(question, value("Questions for your vet"))
            press("Export options"); press("PDF report")
            visible("Your preview stays free")
            assertFalse(device.hasObject(By.text("Share PDF")))
            capture("android-pdf-gated")
            assertEquals(before, scalar("SELECT COUNT(*) FROM care_events"))
            launch("insights"); press("Change dates & view counts"); press("Previous"); press("Prepare a care report")
            visible("7–13 October 2026 · UTC"); capture("android-selected-report-week")
            assertEquals(question, value("Questions for your vet"))
            launch("cat-export-failure")
            visible("Couldn't prepare the file. Your records stay saved. Try again.")
            capture("android-export-failed")
            press("Try again"); visible("Share CSV"); capture("android-export-retried")
            launch("weight-history")
            press("Add a measurement"); field("Measured weight", "4.2"); press("Keep this check-in")
            visible("A small thing, kept."); press("View record"); capture("android-measurement-source")
            assertEquals((before.toLong()+1).toString(), scalar("SELECT COUNT(*) FROM care_events"))
            launch("weight-history"); visible("4.2 kg"); capture("android-measurement-reopened")
            for (theme in listOf("Light", "Dark")) for (screen in listOf("insights", "weight-history", "report", "export-options", "export-progress")) {
                launch(screen, theme)
                if (screen == "export-progress") visible("Share CSV")
                capture("android-${theme.lowercase()}-$screen")
            }
        } finally {
            previous.forEach { (key, saved) -> if (saved == null) storage.remove(key) else storage.write(key, saved) }
            storage.write(keys[1], "false")
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
        }
    }
}
