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

/** A real UI write/edit/delete in the separate synthetic cat journal; normal data is never opened. */
@RunWith(AndroidJUnit4::class)
class SoftPawsJournalJourneyTest {
    @Test fun datedFiltersEditAndDeliberateDeleteSurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-journal-qa").apply { mkdirs() }
        fun launch() {
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
            instrumentation.waitForIdleSync()
            assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")), 25000))
        }
        fun find(label: String) = device.findObject(By.text(label)) ?: device.findObject(By.desc(label))
            ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
        fun press(label: String) {
            var value: UiObject2? = null
            for (attempt in 0..8) {
                value = find(label)
                if (value != null) break
                device.swipe(device.displayWidth / 2, device.displayHeight * 3 / 4, device.displayWidth / 2, device.displayHeight / 3, 22)
                device.waitForIdle()
            }
            var control = value ?: error("Missing $label")
            repeat(6) { if (control.isClickable || control.isFocusable) { control.click(); device.waitForIdle(); return }; control = control.parent ?: error("No action for $label") }
            error("No action for $label")
        }
        fun field(label: String, text: String) {
            var input = device.wait(Until.findObject(By.desc(label)), 10000) ?: error("Missing field $label")
            while (input.className != "android.widget.EditText") input = input.parent ?: error("No editable field for $label")
            input.click(); input.text = text; device.waitForIdle()
            assertEquals(text, input.text)
            device.pressBack(); device.waitForIdle()
        }
        fun capture(name: String) { Thread.sleep(400); device.waitForIdle(); device.takeScreenshot(File(shots, "$name.png")); device.dumpWindowHierarchy(File(shots, "$name.xml")) }
        fun scalar(sql: String): String = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir, fixture.databaseName).absolutePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            db.rawQuery(sql, null).use { assertTrue(it.moveToFirst()); it.getString(0) }
        }
        val title = "Window watching QA ${System.currentTimeMillis()}"
        val revised = "$title edited"
        device.wakeUp()
        try {
            storage.write(keys[0], "Light"); storage.write(keys[1], "true"); launch()
            val initial = scalar("SELECT count(*) FROM care_events").toLong()
            press("Note"); assertTrue(device.wait(Until.hasObject(By.text("One thing to remember.")), 10000))
            field("Title · optional", title); press("Everyday note"); press("Keep this note")
            assertTrue(device.wait(Until.hasObject(By.text("A small thing, kept.")), 10000))
            assertEquals(initial + 1, scalar("SELECT count(*) FROM care_events").toLong())
            press("View record"); assertTrue(device.wait(Until.hasObject(By.text("What you recorded")), 10000)); capture("android-light-record")
            press("Edit record"); assertTrue(device.wait(Until.hasObject(By.text("Keep the context right.")), 10000)); capture("android-light-edit")
            field("Title", revised); press("Save changes")
            assertTrue(device.wait(Until.hasObject(By.text(revised)), 10000))
            assertEquals("2", scalar("SELECT revision FROM care_events WHERE details_json LIKE '%$revised%'"))
            press("Delete record"); assertTrue(device.wait(Until.hasObject(By.text("Delete this record?")), 10000)); capture("android-light-delete")
            press("Keep record"); assertTrue(device.wait(Until.hasObject(By.text("What you recorded")), 10000))
            assertEquals(initial + 1, scalar("SELECT count(*) FROM care_events").toLong())
            launch(); press("Journal"); assertTrue(device.wait(Until.hasObject(By.text("The little things, in order.")), 10000)); capture("android-light-journal")
            press("Notes"); assertTrue(device.wait(Until.hasObject(By.text(revised)), 10000))
            press("19"); assertTrue(device.wait(Until.hasObject(By.text("No matching check-ins yet")), 10000)); capture("android-light-empty-day")
            press("20"); assertTrue(device.wait(Until.hasObject(By.text(revised)), 10000))
            press(revised); press("Delete record"); press("Delete permanently")
            assertTrue(device.wait(Until.hasObject(By.text("The little things, in order.")), 10000))
            assertEquals(initial, scalar("SELECT count(*) FROM care_events").toLong())
            assertEquals("0", scalar("SELECT count(*) FROM care_events WHERE details_json LIKE '%$revised%'"))
            storage.write(keys[0], "Dark"); launch(); press("Journal"); Thread.sleep(500); capture("android-dark-journal")
            press("Meals"); press("A meal, mostly eaten."); capture("android-dark-record")
            press("Edit record"); assertTrue(device.wait(Until.hasObject(By.text("Keep the context right.")), 10000)); capture("android-dark-edit"); press("Close")
            assertTrue(device.wait(Until.hasObject(By.text("What you recorded")), 10000))
            press("Delete record"); assertTrue(device.wait(Until.hasObject(By.text("Delete this record?")), 10000)); capture("android-dark-delete"); press("Keep record")
        } catch (failure: Throwable) {
            capture("android-failure")
            throw failure
        } finally { previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) } }
    }
}
