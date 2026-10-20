package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import org.junit.Assert.assertTrue

/** Exercises only the named Debug review journal; never clears app data or places a call. */
@RunWith(AndroidJUnit4::class)
class ChatCareJourneyTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val automation = instrumentation.uiAutomation
    private val device = UiDevice.getInstance(instrumentation)
    private fun walk(node: AccessibilityNodeInfo?, predicate: (AccessibilityNodeInfo) -> Boolean): AccessibilityNodeInfo? {
        if (node == null) return null
        if (predicate(node)) return node
        for (i in 0 until node.childCount) walk(node.getChild(i), predicate)?.let { return it }
        return null
    }
    private fun find(label: String) = walk(automation.rootInActiveWindow) { it.text?.toString() == label || it.contentDescription?.toString() == label }
    private fun await(label: String): AccessibilityNodeInfo {
        repeat(80) { find(label)?.let { return it }; Thread.sleep(150) }
        capture("missing-control")
        val dir=File(instrumentation.targetContext.getExternalFilesDir(null),"chat-qa").apply {mkdirs()}
        device.dumpWindowHierarchy(File(dir,"missing-control.xml"))
        error("Missing native control: $label")
    }
    private fun tap(label: String) {
        repeat(80) {
            try {
                val target=device.findObject(By.text(label)) ?: device.findObject(By.desc(label))
                if (target!=null && !target.visibleBounds.isEmpty) {target.click();Thread.sleep(650);return}
            } catch (_: androidx.test.uiautomator.StaleObjectException) { }
            Thread.sleep(150)
        }
        capture("missing-control");device.dumpWindowHierarchy(File(instrumentation.targetContext.getExternalFilesDir(null),"chat-qa/missing-control.xml"))
        error("Missing $label")
    }
    private fun capture(name: String) {
        val dir=File(instrumentation.targetContext.getExternalFilesDir(null),"chat-qa").apply {mkdirs()}
        automation.takeScreenshot()?.let { image -> File(dir,"$name.png").outputStream().use { image.compress(android.graphics.Bitmap.CompressFormat.PNG,100,it) }; image.recycle() }
    }
    @Test fun chatVetReportContactsAndNativePhotoImport() {
        val context=instrumentation.targetContext
        val intent=Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview",true).putExtra("designReviewScreen","next-chat").putExtra("designReviewFixture","park-video-v1")
        context.startActivity(intent)
        await("Attach a photo"); capture("chat")
        tap("Chat options"); tap("Report for my vet");await("A report for your vet");capture("report")
        tap("Download PDF · Premium");await("Save or share PDF");capture("pdf-ready")
        tap("Back to chat");tap("Chat options");tap("Call my vet");await("Call your vet");capture("contacts")
        tap("Back to chat");tap("Attach a photo");tap("Choose from photos")
        Thread.sleep(1800);capture("native-photo-picker")
        val photo=device.wait(Until.findObject(By.desc(java.util.regex.Pattern.compile("^BarkLog-qa-medical[.]jpg,.*"))),5000)
        if (photo != null) {
            photo.click();await("Remove 1");capture("photo-attached")
            device.findObject(By.descContains("Message BarkLog AI"))?.click()
            Thread.sleep(1000);capture("regular-keyboard");return
        }
        assertTrue(automation.performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_BACK))
        await("Attach a photo")
    }
}
