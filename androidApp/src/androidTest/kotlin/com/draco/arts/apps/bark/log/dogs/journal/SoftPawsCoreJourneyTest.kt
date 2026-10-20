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

/** Only the separate Soft Paws Debug fixture is touched. No journal clearing or live service. */
@RunWith(AndroidJUnit4::class)
class SoftPawsCoreJourneyTest {
    @Test fun litterSaveSurvivesRelaunchAndAllFiveTabsKeepTheirSelection() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val theme = fixture.preferencePrefix + "theme"
        val reduced = fixture.preferencePrefix + "reduce_motion"
        val previous = listOf(theme, reduced).associateWith(storage::read)
        val captures = File(context.getExternalFilesDir(null), "soft-paws-core-qa").apply { mkdirs() }
        fun launch() {
            // Wait for the new Activity, rather than accepting the previous semantic tree.
            val instrumentation = InstrumentationRegistry.getInstrumentation()
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
            instrumentation.waitForIdleSync()
            assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")), 25000))
            device.waitForIdle()
        }
        fun node(label: String): UiObject2 {
            var value = device.wait(Until.findObject(By.text(label)), 10000)
                ?: device.wait(Until.findObject(By.desc(label)), 3000) ?: error("Missing $label")
            repeat(6) { if (value.isClickable || value.isFocusable) return value; value = value.parent ?: error("No control for $label") }
            error("No clickable control for $label")
        }
        fun capture(name: String) {
            device.takeScreenshot(File(captures, "$name.png"))
            device.dumpWindowHierarchy(File(captures, "$name.xml"))
        }
        fun litterCount(): Long = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir, fixture.databaseName).absolutePath, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            db.rawQuery("SELECT count(*) FROM care_events WHERE type='litter'", null).use { it.moveToFirst(); it.getLong(0) }
        }
        device.wakeUp()
        try {
            storage.write(theme, "Light"); storage.write(reduced, "true")
            launch(); Thread.sleep(800); capture("android-light-home")
            assertTrue(node("Today").isSelected)
            val before = litterCount()
            node("Litter").click()
            assertTrue(device.wait(Until.hasObject(By.text("A little litter check.")), 10000))
            capture("android-light-log-litter")
            node("Urine observed").click()
            node("Keep this check-in").click()
            assertTrue(device.wait(Until.hasObject(By.text("A small thing, kept.")), 10000))
            assertEquals(before + 1, litterCount()); capture("android-light-saved")
            node("Back to today").click()
            launch(); assertEquals(before + 1, litterCount())
            capture("android-light-reopened")
            for ((tab, heading) in listOf("Journal" to "Timeline", "Care" to "Care, in one place.", "Memories" to "Ordinary, lovely days.", "You" to "A place for both of you.")) {
                node(tab).click(); assertTrue(device.wait(Until.hasObject(By.text(heading)), 10000))
                assertTrue(node(tab).isSelected); capture("android-light-${tab.lowercase()}")
            }
            node("Today").click(); assertTrue(node("Today").isSelected)
            storage.write(theme, "Dark"); launch(); Thread.sleep(800); capture("android-dark-home")
            storage.write(theme, "Light"); storage.write(reduced, "false"); launch()
            val cat = device.wait(Until.findObject(By.desc("Say hello to Miso")), 10000) ?: error("Cat reaction control is missing")
            cat.click()
            Thread.sleep(200); capture("android-cat-motion-200")
            Thread.sleep(700); capture("android-cat-motion-900")
            Thread.sleep(900); capture("android-cat-motion-1800")
            Thread.sleep(2200); capture("android-cat-rest")
        } finally { previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) } }
    }
}
