package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Rect
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import kotlin.math.abs

/** Checks rendered cat pixels after the greeting ends, outside clocks/text/other controls. */
@RunWith(AndroidJUnit4::class)
class SoftPawsCatMotionTest {
    @Test fun idleContinuesAfterGreetingAndTapAndReducedMotionStaysStill() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val theme = fixture.preferencePrefix + "theme"
        val reduced = fixture.preferencePrefix + "reduce_motion"
        val previousTheme = storage.read(theme)
        val directory = File(context.getExternalFilesDir(null), "soft-paws-cat-motion").apply { mkdirs() }
        fun launch(still: Boolean, appearance: String = "Light") {
            storage.write(theme, appearance); storage.write(reduced, still.toString())
            instrumentation.startActivitySync(Intent(context, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", "home"))
            assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")), 25000))
        }
        fun pixels(name: String, bounds: Rect): IntArray {
            val file = File(directory, "$name.png")
            assertTrue(device.takeScreenshot(file))
            return checkNotNull(BitmapFactory.decodeFile(file.absolutePath)).let { image ->
                IntArray(bounds.width() * bounds.height()).also {
                    image.getPixels(it, 0, bounds.width(), bounds.left, bounds.top, bounds.width(), bounds.height())
                    image.recycle()
                }
            }
        }
        fun changes(a: IntArray, b: IntArray) = a.indices.count { i ->
            listOf(0, 8, 16).any { shift -> abs(((a[i] shr shift) and 255) - ((b[i] shr shift) and 255)) > 8 }
        }
        try {
            device.wakeUp(); launch(false)
            val cat = device.wait(Until.findObject(By.desc("Say hello to Miso")), 15000) ?: error("Live cat unavailable")
            val bounds = cat.visibleBounds
            assertTrue(bounds.width() > 80 && bounds.height() > 80)
            Thread.sleep(4500)
            val first = pixels("android-idle-4500", bounds)
            Thread.sleep(2100)
            val second = pixels("android-idle-6600", bounds)
            Thread.sleep(3100)
            val third = pixels("android-idle-9700", bounds)
            assertTrue("Cat froze after greeting", changes(first, second) > 30)
            assertTrue("Cat stopped its ongoing idle", changes(second, third) > 30)
            cat.click(); Thread.sleep(900)
            val hello = pixels("android-hello-900", bounds)
            assertTrue("Tap did not animate the character", changes(third, hello) > 30)
            Thread.sleep(3600)
            val resumed = pixels("android-after-tap-4500", bounds)
            Thread.sleep(2200)
            assertTrue("Idle did not resume after tap", changes(resumed, pixels("android-after-tap-6700", bounds)) > 30)
            launch(false, "Dark"); Thread.sleep(4500)
            val dark = pixels("android-dark-idle-4500", bounds)
            Thread.sleep(2100)
            assertTrue("Dark-theme idle froze", changes(dark, pixels("android-dark-idle-6600", bounds)) > 30)
            launch(true); Thread.sleep(1600)
            assertFalse(device.hasObject(By.desc("Say hello to Miso")))
            val still = pixels("android-reduced-1600", bounds)
            Thread.sleep(2200)
            assertEquals("Reduced-motion cat moved", 0, changes(still, pixels("android-reduced-3800", bounds)))
        } finally {
            // Owner requested a live preview. Only this explicitly named QA namespace changes.
            storage.write(reduced, "false")
            launch(false)
            if (previousTheme == null) storage.remove(theme) else storage.write(theme, previousTheme)
        }
    }
}
