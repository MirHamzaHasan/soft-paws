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
class SoftPawsPlanningJourneyTest {
    @Test fun plannedCarePickersCompleteUndoAndEditSurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-planning-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
            val heading = when (screen) {
                "calendar" -> "The care you planned."
                "task-form" -> "Make room for a little care."
                "task-detail" -> "Your plan"
                "med-form" -> "Keep the prescribed details."
                "vaccine-form" -> "A vaccination, recorded."
                else -> null
            }
            if (heading != null) assertTrue(device.wait(Until.hasObject(By.text(heading)), 25000))
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
        fun value(label: String): String {
            visible(label)
            var input = device.findObject(By.desc(label))
            while (input != null && input.className != "android.widget.EditText") input = input.parent
            return checkNotNull(input) { "Missing editable value $label" }.text.orEmpty()
        }
        fun nativeButton(id: String) {
            val button = device.wait(Until.findObject(By.res("android", id)), 5000) ?: error("Missing native $id")
            button.click(); device.waitForIdle(); Thread.sleep(400)
        }
        fun date21(keep: Boolean) {
            press("Choose date for Date · YYYY-MM-DD")
            val date = device.wait(Until.findObject(By.desc("21 October 2026")), 5000) ?: error("Native calendar missing October 21")
            capture("android-native-date-picker")
            date.click(); nativeButton(if (keep) "button1" else "button2")
        }
        fun minute15(keep: Boolean) {
            press("Choose time for Time · HH:mm")
            if (!device.hasObject(By.res("android", "input_minute"))) nativeButton("toggle_mode")
            val minute = device.wait(Until.findObject(By.res("android", "input_minute")), 5000) ?: error("Native minute entry missing")
            minute.text = "15"; device.waitForIdle()
            capture("android-native-time-picker")
            nativeButton(if (keep) "button1" else "button2")
        }
        fun check(label: String, checked: Boolean) {
            var choice = visible(label)
            while (!choice.isCheckable) choice = choice.parent ?: error("No checkbox for $label")
            if (choice.isChecked != checked) press(label)
        }
        fun radio(label: String) {
            var choice = visible(label)
            while (!choice.isCheckable) choice = choice.parent ?: error("No radio choice for $label")
            if (!choice.isChecked) press(label)
        }
        fun agendaDate(date: String) {
            if (find("Enter a date") == null && find("Agenda date · YYYY-MM-DD") == null) press("Dates")
            if (find("Agenda date · YYYY-MM-DD") == null) press("Enter a date")
            field("Agenda date · YYYY-MM-DD", date); press("Show this date")
            if (find("Hide date entry") != null) press("Dates")
        }
        val stamp = System.currentTimeMillis()
        val title = "Planned care QA $stamp"
        val revised = "Revised care QA $stamp"
        val retained = "Retained task QA $stamp"
        device.wakeUp()
        try {
            launch("calendar"); assertTrue(visible("The care you planned.").isEnabled); capture("android-light-calendar")
            press("Plan a task"); capture("android-light-task-form")
            field("Task", title); field("Date · YYYY-MM-DD", "2026-10-20"); field("Time · HH:mm", "18:00")
            date21(false); assertEquals("2026-10-20", value("Date · YYYY-MM-DD"))
            date21(true); assertEquals("2026-10-21", value("Date · YYYY-MM-DD"))
            minute15(false); assertEquals("18:00", value("Time · HH:mm"))
            minute15(true); assertEquals("18:15", value("Time · HH:mm"))
            radio("Every day"); check("Remind me for this task", false)
            press("Back"); press("Keep draft")
            launch("calendar"); press("Plan a task")
            assertEquals(title, value("Task")); assertEquals("2026-10-21", value("Date · YYYY-MM-DD")); assertEquals("18:15", value("Time · HH:mm"))
            press("Keep task"); assertTrue(visible("Your plan").isEnabled); capture("android-light-task-detail")
            val taskId = scalar("SELECT id FROM care_items WHERE kind='task' AND data_json LIKE '%$title%'")
            val saved = JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$taskId'"))
            assertEquals("Daily", saved.getString("repeat")); assertFalse(saved.optBoolean("remind", false))
            assertFalse(device.hasObject(By.res("com.android.permissioncontroller", "permission_allow_button")))
            val before = scalar("SELECT count(*) FROM care_events").toLong()
            press("Mark complete"); assertTrue(visible("The care you planned.").isEnabled)
            assertEquals(before + 1, scalar("SELECT count(*) FROM care_events").toLong())
            press("View task for $title"); press("Mark incomplete"); press("Keep completion")
            assertTrue(visible("Recorded as complete").isEnabled)
            press("Mark incomplete"); press("Undo completion"); assertTrue(visible("The care you planned.").isEnabled)
            assertEquals(before, scalar("SELECT count(*) FROM care_events").toLong())
            assertEquals("0", scalar("SELECT count(*) FROM care_items WHERE kind='completion' AND data_json LIKE '%$taskId%'"))
            press("View task for $title"); press("Mark complete")
            agendaDate("2026-10-22"); press("View task for $title"); press("Mark complete")
            assertEquals(before + 2, scalar("SELECT count(*) FROM care_events").toLong())
            assertEquals("2", scalar("SELECT count(*) FROM care_items WHERE kind='completion' AND data_json LIKE '%$taskId%'"))
            press("View task for $title"); press("Reschedule or edit")
            field("Task", revised); field("Time · HH:mm", "19:00")
            if (find("Your note · optional") == null) press("Category and notes · optional")
            field("Your note · optional", "A caregiver planning note")
            check("Remind me for this task", true)
            press("Keep task"); assertTrue(visible("Your plan").isEnabled)
            assertTrue(visible("22 October 2026").isEnabled)
            val edited = JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$taskId'"))
            assertEquals("19:00", edited.getString("time")); assertEquals("A caregiver planning note", edited.getString("notes")); assertTrue(edited.getBoolean("remind"))
            assertEquals("2", scalar("SELECT count(*) FROM care_events WHERE details_json LIKE '%$title%'"))
            assertFalse(device.hasObject(By.res("com.android.permissioncontroller", "permission_allow_button")))
            val granted = android.os.Build.VERSION.SDK_INT < 33 || context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED
            run {
                press(if (granted) "Refresh chosen reminder" else "Enable notifications")
                val deny = By.res(java.util.regex.Pattern.compile("com.android.permissioncontroller:id/permission_deny.*_button"))
                device.wait(Until.findObject(deny), 2500)?.let { it.click(); assertTrue(device.wait(Until.gone(deny), 5000)) }
            }
            capture("android-task-reminder-after-commit")
            press("Turn reminder off")
            assertTrue(visible("Off").isEnabled)
            assertFalse(JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$taskId'")).optBoolean("remind", false))
            press("Remove task"); press("Keep task")
            assertEquals("1", scalar("SELECT count(*) FROM care_items WHERE id='$taskId'"))
            press("Remove task"); press("Remove planned task"); assertTrue(visible("The care you planned.").isEnabled)
            assertEquals("0", scalar("SELECT count(*) FROM care_items WHERE id='$taskId'"))
            assertEquals("2", scalar("SELECT count(*) FROM care_events WHERE details_json LIKE '%$taskId%'"))

            // Leave an independently created real task for the direct review destination.
            press("Plan a task"); field("Task", retained); field("Date · YYYY-MM-DD", "2026-10-20"); field("Time · HH:mm", "18:00")
            radio("Does not repeat"); check("Remind me for this task", false); press("Keep task")
            assertTrue(visible("Your plan").isEnabled)
            launch("med-form")
            val oldStart = value("Start date · YYYY-MM-DD")
            press("Choose date for Start date · YYYY-MM-DD"); nativeButton("button2")
            assertEquals(oldStart, value("Start date · YYYY-MM-DD"))
            launch("vaccine-form")
            val optional = "Next date, if your vet provided one · optional"
            val oldNext = value(optional)
            press("Choose date for $optional"); nativeButton("button2")
            assertEquals(oldNext, value(optional))
            for (theme in listOf("Light", "Dark")) for (screen in listOf("calendar", "task-form", "task-detail")) {
                launch(screen, theme); capture("android-${theme.lowercase()}-$screen")
            }
            launch("task-form", "Dark"); press("Choose date for Date · YYYY-MM-DD"); capture("android-dark-native-date-picker"); nativeButton("button2")
            press("Choose time for Time · HH:mm"); capture("android-dark-native-time-picker"); nativeButton("button2")
        } catch (failure: Throwable) { capture("android-failure"); throw failure }
        finally { previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) } }
    }
}
