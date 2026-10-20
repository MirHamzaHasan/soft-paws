package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityNodeInfo
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** A named, separate synthetic journal. No credentials or cloud request. */
@RunWith(AndroidJUnit4::class)
class SoundAndWeeklyJourneyTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val device = UiDevice.getInstance(instrumentation)
    private fun find(label: String): UiObject2? {
        val raw = device.findObject(By.desc(label)) ?: device.findObject(By.text(label)) ?: return null
        var item = raw
        repeat(4) { if (item.isClickable || item.isCheckable) return item; item = item.parent ?: return raw }
        return raw
    }
    private fun tap(label: String) {
        repeat(16) {
            try { find(label)?.let { if (!it.visibleBounds.isEmpty) { it.click(); Thread.sleep(550); return } } } catch (_: StaleObjectException) { }
            val start = if (device.findObject(By.desc("Send message")) != null) .55 else .7
            device.swipe(device.displayWidth / 2, (device.displayHeight * start).toInt(), device.displayWidth / 2, (device.displayHeight * .23).toInt(), 25)
            Thread.sleep(300)
        }
        shot("missing-control"); error("Missing control: $label")
    }
    private fun await(label: String) { repeat(80) { if (find(label) != null) return; Thread.sleep(150) }; shot("missing-state"); error("Missing state: $label") }
    private fun slider(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null || node.rangeInfo != null) return node
        repeat(node.childCount) { slider(node.getChild(it))?.let { match -> return match } }
        return null
    }
    private fun shot(name: String) {
        val dir = File(instrumentation.targetContext.getExternalFilesDir(null), "sound-week-qa").apply { mkdirs() }
        device.takeScreenshot(File(dir, "$name.png")); device.dumpWindowHierarchy(File(dir, "$name.xml"))
    }
    private fun launch() {
        val context = instrumentation.targetContext
        context.startActivity(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview", true).putExtra("designReviewFixture", "park-ai-cards-v1").putExtra("designReviewScreen", "next-sounds"))
        await("Interaction sounds")
    }
    @Test fun soundPlaybackSettingsAndWeeklySourcesPersist() {
        launch()
        if (device.findObject(By.text("Sounds are off.")) != null) tap("Interaction sounds")
        await("Preview button tap sound")
        repeat(40) { if (find("Preview button tap sound")?.isEnabled == true) return@repeat; Thread.sleep(100) }
        assertTrue(find("Preview button tap sound")?.isEnabled == true)
        val level = slider(instrumentation.uiAutomation.rootInActiveWindow) ?: error("Sound volume must be accessible")
        if (kotlin.math.abs(level.rangeInfo.current - .35f) > .001f)
            assertTrue(level.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SET_PROGRESS.id, Bundle().apply { putFloat(AccessibilityNodeInfo.ACTION_ARGUMENT_PROGRESS_VALUE, .35f) }))
        await("35%")
        if (device.findObject(By.text("Soft pop")) != null) { tap("Soft pop"); tap("Soft wood") }
        shot("android-sound-settings")
        tap("Preview button tap sound"); tap("Preview selection tick sound"); tap("Preview saved sound"); shot("android-sound-samples")
        tap("Try in AI chat")
        if (find("Send message") == null) {
            await("A little context. A clearer answer.")
            shot("android-weekly-consent")
            tap("I agree to online AI processing of my messages, Bruno’s profile and the past seven days of care records.")
            tap("Enable BarkLog AI")
        }
        await("Send message"); tap("Chat options"); tap("Past conversations"); tap("New conversation")
        await("Message BarkLog AI")
        val field = device.findObject(By.clazz("android.widget.EditText")) ?: error("Missing chat input")
        field.text = "How is Bruno doing with his walks?"; tap("Send message")
        await("Try another response")
        repeat(3) { device.swipe(device.displayWidth / 2, (device.displayHeight * .3).toInt(), device.displayWidth / 2, (device.displayHeight * .8).toInt(), 25) }
        shot("android-weekly-answer"); tap("View 7 walk logs"); shot("android-weekly-sources"); tap("Close records"); shot("android-weekly-card-lower")
        tap("Review automatic profile and seven-day context"); await("Included with every question"); shot("android-weekly-context"); tap("Back to chat")
        launch()
        repeat(40) { if (find("Preview button tap sound")?.isEnabled != true) Thread.sleep(100) }
        assertNull(device.findObject(By.text("Sounds are off.")))
        assertTrue(find("Preview button tap sound")?.isEnabled == true)
        await("35%")
        shot("android-sound-preference-restored")
    }
}
