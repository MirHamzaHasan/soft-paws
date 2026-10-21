package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Real contact writes, call selections and manual place entry in the owned cat journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsSafetyJourneyTest {
    @Test fun contactsDraftCallChoicesAndManualPlaceSurviveRelaunch() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-safety-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
            val heading = mapOf("safety" to "Something feels different?", "symptoms" to "What are you seeing?",
                "contacts" to "Your people, close by.", "contact-form" to "Keep a number close.", "region" to "Start with your region.",
                "nearby-vets" to "A vet near your place.", "location-denied" to "Type a place instead.",
                "toxicity" to "A possible exposure?", "safety-topics" to "Read with Miso in mind.")[screen]
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
                val topFields = listOf("Country or region", "City, area or postcode", "Plant, product or substance", "Vet or clinic name")
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
        val stamp = System.currentTimeMillis()
        val title = "Cat contact QA $stamp"
        val note = "Side door · caregiver contact note $stamp"
        try {
            device.wakeUp(); launch("contacts")
            val originalDetails = JSONObject(scalar("SELECT details_json FROM dogs WHERE name='Miso'"))
            val originalEvents = scalar("SELECT count(*) FROM care_events")
            press("Save a contact")
            field("Vet or clinic name", title); field("Phone number", "+15550100123"); field("Address or note · optional", note)
            press("Back"); press("Keep draft")
            launch("contact-form"); assertEquals(title, value("Vet or clinic name")); assertEquals(note, value("Address or note · optional"))
            press("Save contact"); assertTrue(device.wait(Until.hasObject(By.text("Your people, close by.")), 10000))
            visible(title); capture("android-contact-saved")
            val saved = JSONObject(scalar("SELECT details_json FROM dogs WHERE name='Miso'"))
            assertEquals(title, saved.getString("vetName")); assertEquals(note, saved.getString("vetNote"))
            assertEquals(originalDetails.optString("notes"), saved.optString("notes"))
            assertEquals(originalDetails.optString("emergencyPhone"), saved.optString("emergencyPhone"))
            assertEquals(originalDetails.optString("emergencyServiceName"), saved.optString("emergencyServiceName"))
            val savedRevision = scalar("SELECT revision FROM dogs WHERE name='Miso'")
            press("Edit regular veterinarian"); press("Clear this saved contact"); capture("android-contact-clear-confirmation"); press("Keep contact")
            assertEquals(savedRevision, scalar("SELECT revision FROM dogs WHERE name='Miso'"))
            press("Clear this saved contact"); press("Clear contact")
            assertTrue(device.wait(Until.hasObject(By.text("Your people, close by.")), 10000))
            val cleared = JSONObject(scalar("SELECT details_json FROM dogs WHERE name='Miso'"))
            assertEquals("", cleared.optString("vetName")); assertEquals("", cleared.optString("vetPhone")); assertEquals("", cleared.optString("vetNote"))
            assertEquals(originalDetails.optString("emergencyPhone"), cleared.optString("emergencyPhone")); assertEquals(originalEvents, scalar("SELECT count(*) FROM care_events"))
            capture("android-one-contact-cleared")
            press("Save a contact"); field("Vet or clinic name", title); field("Phone number", "+15550100123"); field("Address or note · optional", note); press("Save contact")
            visible(title); launch("symptoms")
            press("Litter habits changed"); press("Possible poisoning or exposure"); press("Show saved contacts")
            visible("For your call"); visible("Possible poisoning or exposure"); capture("android-call-selections")
            assertEquals(originalEvents, scalar("SELECT count(*) FROM care_events"))
            launch("region"); field("Country or region", "Pakistan"); press("Use this region")
            visible("No bundled number is verified for Pakistan"); capture("android-unsupported-region")
            field("Country or region", "Canada"); press("Use this region")
            visible("+1 917 722 5958"); capture("android-verified-country-contact")
            launch("nearby-vets"); val place = "São Paulo | west: ~城区@5"
            field("City, area or postcode", place); press("Type a place instead")
            assertEquals(place, value("City, area or postcode")); capture("android-manual-place-preserved")
            press("Saved contacts"); visible(title)
            launch("toxicity"); field("Plant, product or substance", "A lily"); field("What happened, and when?", "Caregiver timing note")
            press("Saved contacts · free"); visible(title); press("Back")
            assertEquals("A lily", value("Plant, product or substance")); assertEquals("Caregiver timing note", value("What happened, and when?"))
            capture("android-exposure-details-retained")
            for (theme in listOf("Light", "Dark")) for (screen in listOf("safety", "symptoms", "contacts", "contact-form", "region", "nearby-vets", "location-denied", "toxicity", "safety-topics")) {
                launch(screen, theme); capture("android-${theme.lowercase()}-$screen")
            }
            assertEquals(originalEvents, scalar("SELECT count(*) FROM care_events"))
        } finally {
            previous.forEach { (key, old) -> if (old == null) storage.remove(key) else storage.write(key, old) }
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
        }
    }
}
