package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Real UI/runtime, isolated synthetic journal; no purchase or online AI request. */
@RunWith(AndroidJUnit4::class)
class PremiumPlanJourneyTest {
    @Test fun newCompanionPlansAndFreeExitWorkInBothThemes() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        val storage = AndroidStorageBackend(context)
        val prefix = BoardReviewDataSet.PremiumSafety.preferencePrefix
        val saved = listOf("theme", "reduce_motion").associateWith { storage.read(prefix + it) }
        val out = File(context.getExternalFilesDir(null), "premium-plan-qa").apply { mkdirs() }
        val fontScale = device.executeShellCommand("settings get system font_scale").trim()
        device.wakeUp()
        fun find(label: String) = device.findObject(By.textStartsWith(label)) ?: device.findObject(By.descStartsWith(label))
        fun visible(label: String): UiObject2 {
            repeat(18) {
                val node = find(label)
                val bottom = if (label == "Close profile") device.displayHeight - 50 else (find("Native board screen")?.visibleBounds?.top ?: device.displayHeight) - 150
                if (node != null && node.visibleBounds.height() > 0 && node.visibleBounds.bottom < bottom) return node
                val area = device.findObject(By.scrollable(true))?.visibleBounds
                val x = area?.centerX() ?: (device.displayWidth / 2)
                device.swipe(x, (area?.bottom ?: bottom) - 35, x, (area?.top ?: 136) + 100, 22)
                Thread.sleep(250)
            }
            error("Missing visible control: $label")
        }
        fun control(label: String): UiObject2 { var node = visible(label); repeat(5) { if (!node.isClickable && !node.isCheckable && node.isEnabled) node = node.parent ?: node }; return node }
        fun press(label: String) { control(label).click(); Thread.sleep(650) }
        fun shot(name: String) { device.takeScreenshot(File(out, "$name.png")); device.dumpWindowHierarchy(File(out, "$name.xml")) }
        fun launch(screen: String) {
            context.startActivity(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", BoardReviewDataSet.PremiumSafety.key).putExtra("designReviewScreen", screen))
            val title = when (screen) { "next-plan" -> "A plan for"; "next-paywall" -> "More for"; else -> "Your BarkLog." }
            assertTrue("Screen must finish local loading", device.wait(Until.hasObject(By.textStartsWith(title)), 20000))
            Thread.sleep(1400)
        }
        try {
            for (theme in listOf("Light", "Dark")) {
                storage.write(prefix + "theme", theme); storage.write(prefix + "reduce_motion", "false")
                launch("next-plan"); visible("A plan for"); shot("android-${theme.lowercase()}-plan")
                press("Review Bruno’s full profile"); visible("Close profile"); shot("android-${theme.lowercase()}-profile"); press("Close profile")
                launch("next-paywall"); assertNotNull("The official Rive runtime must become ready", device.wait(Until.findObject(By.desc("Say hello to the notebook puppy")), 10000)); visible("Monthly"); shot("android-${theme.lowercase()}-paywall")
                press("Yearly"); assertTrue(control("Yearly").isChecked || control("Yearly").isSelected)
                // Verify the same selector updates all billing frequencies.
                press("Weekly"); press("Monthly"); shot("android-${theme.lowercase()}-monthly")
                assertFalse(control("Continue with monthly").isEnabled)
                visible("Pet food scanner"); visible("Planned feature · not available yet."); shot("android-${theme.lowercase()}-coming-soon")
                assertTrue(visible("Continue with free journal").isEnabled)
                press("Restore"); visible("Restore a purchase."); assertFalse(control("Restore purchases").isEnabled)
                launch("next-paywall")
                press("Continue with free journal"); assertFalse(device.hasObject(By.text("Continue with monthly")))
                launch("next-manage-plan"); visible("Your BarkLog."); shot("android-${theme.lowercase()}-manage-plan")
                press("Explore Premium"); visible("Monthly")
                storage.write(prefix + "reduce_motion", "true")
                launch("next-paywall"); visible("Monthly"); shot("android-${theme.lowercase()}-reduced")
                assertFalse(device.hasObject(By.desc("Say hello to the notebook puppy")))
                device.executeShellCommand("settings put system font_scale 1.3")
                for (screen in listOf("next-plan", "next-paywall", "next-manage-plan")) {
                    launch(screen);shot("android-${theme.lowercase()}-large-$screen")
                    if (screen == "next-paywall") { visible("Yearly");assertTrue(visible("Continue with free journal").isEnabled) }
                }
                device.executeShellCommand("settings put system font_scale $fontScale")
            }
        } finally { device.executeShellCommand("settings put system font_scale $fontScale"); saved.forEach { (key, value) -> if (value == null) storage.remove(prefix + key) else storage.write(prefix + key, value) } }
    }
}
