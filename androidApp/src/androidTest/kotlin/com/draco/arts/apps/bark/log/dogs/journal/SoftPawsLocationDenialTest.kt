package com.draco.arts.apps.bark.log.dogs.journal

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.util.regex.Pattern

/** Real OS denial; no injected location provider or fabricated DeviceResult. */
@RunWith(AndroidJUnit4::class)
class SoftPawsLocationDenialTest {
    @Test fun nativeDenialRetainsTypedPlaceAndFreeContactAccess() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        assertNotEquals(PackageManager.PERMISSION_GRANTED, context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION))
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-location-qa").apply { mkdirs() }
        fun capture(name: String) { assertTrue(device.takeScreenshot(File(shots, "$name.png"))); device.dumpWindowHierarchy(File(shots, "$name.xml")) }
        fun placeInput(): UiObject2 {
            var node = device.wait(Until.findObject(By.desc("City, area or postcode")), 10000) ?: error("Missing typed place label")
            while (node.className != "android.widget.EditText") node = node.parent ?: error("Missing typed place input")
            return node
        }
        fun click(label: String) {
            var node = device.wait(Until.findObject(By.text(label)), 10000) ?: error("Missing $label")
            while (!node.isClickable) node = node.parent ?: error("No action for $label")
            node.click(); device.waitForIdle(); Thread.sleep(400)
        }
        try {
            storage.write(keys[0], "Light"); storage.write(keys[1], "true")
            val activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "nearby-vets"))
            assertTrue(device.wait(Until.hasObject(By.text("A vet near your place.")), 25000))
            val input = placeInput()
            input.click(); input.text = "Typed place QA"; device.waitForIdle()
            instrumentation.runOnMainSync {
                (activity.getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager)
                    .hideSoftInputFromWindow(activity.window.decorView.windowToken, 0)
                activity.currentFocus?.clearFocus()
            }
            device.waitForIdle(); click("Use my location")
            val deny = device.wait(Until.findObject(By.res(Pattern.compile("com.android.permissioncontroller:id/permission_deny.*_button"))), 5000)
            if (deny != null) { capture("android-native-location-permission"); deny.click(); device.waitForIdle() }
            assertTrue(device.wait(Until.hasObject(By.text("Type a place instead.")), 15000))
            assertTrue(device.hasObject(By.text("Location access was not granted.")))
            assertEquals("Typed place QA", placeInput().text)
            capture("android-native-location-denied-with-place")
            click("Saved contacts"); assertTrue(device.wait(Until.hasObject(By.text("Your people, close by.")), 15000))
            capture("android-free-contacts-after-location-denial")
            File(shots, "android-location-result.json").writeText(JSONObject().put("nativeDenied", true).put("typedPlacePreserved", true)
                .put("freeContactsAvailable", true).put("systemPromptShown", deny != null).toString(2))
        } finally {
            previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) }
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
        }
    }
}
