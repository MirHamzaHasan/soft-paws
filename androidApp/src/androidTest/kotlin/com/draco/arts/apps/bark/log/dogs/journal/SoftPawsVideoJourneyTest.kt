package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.graphics.*
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

/** Real local draft/preview/encoder journey in its own explicitly named cat QA database. */
@RunWith(AndroidJUnit4::class)
class SoftPawsVideoJourneyTest {
    @Test fun catFilmDraftPreviewAndGuardedNativeExport() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val uiConfig = Configurator.getInstance()
        val previousIdleTimeout = uiConfig.waitForIdleTimeout
        uiConfig.setWaitForIdleTimeout(1000)
        val fixture = BoardReviewDataSet.SoftPawsVideo
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-video-qa").apply { mkdirs() }
        val photoDir = File(context.filesDir, "barklog_photos").apply { mkdirs() }
        listOf("red", "green", "blue").forEachIndexed { i, name ->
            val file = File(photoDir, "video-qa-$name.jpg")
            if (!file.exists()) {
                val bitmap = Bitmap.createBitmap(600, 1000, Bitmap.Config.ARGB_8888)
                Canvas(bitmap).apply { drawColor(listOf(Color.rgb(215,48,48), Color.rgb(45,185,70), Color.rgb(45,80,215))[i]); drawRect(20f,30f,100f,900f,Paint().apply { color=Color.WHITE }) }
                file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.JPEG, 90, it) }; bitmap.recycle()
            }
        }
        var activity: android.app.Activity? = null
        fun launch(screen: String = "video-editor", theme: String = "Light", reduced: Boolean = true) {
            storage.write(keys[0], theme); storage.write(keys[1], reduced.toString())
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(1000)
        }
        fun find(label: String) = device.findObject(By.text(label)) ?: device.findObject(By.desc(label)) ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
        fun actionable(label: String): UiObject2? {
            var node = find(label)
            while (node != null && !node.isClickable && node.className != "android.widget.EditText") node = node.parent
            return node
        }
        fun visible(label: String, control: Boolean = true): UiObject2 {
            repeat(40) { attempt ->
                var bounds: Rect? = null
                try {
                    val node = if (control) actionable(label) else find(label); bounds = node?.visibleBounds
                    val footerLabels = listOf("See Premium", "Back to my preview", "Retry edit", "Export MP4 · Premium", "Back to edit", "Save or share MP4", "Continue with free journal") +
                        if (find("Back to edit") == null) listOf("Play preview") else emptyList()
                    val footers = if (find("Choose your cat’s photos") != null || find("This edit hasn't saved yet.") != null) emptyList() else footerLabels.mapNotNull(::actionable).filter { it.visibleBounds.top > device.displayHeight / 2 }
                    val bottom = if (footerLabels.contains(label)) device.displayHeight - 80 else footers.minOfOrNull { it.visibleBounds.top - 12 } ?: (device.displayHeight - 80)
                    if (node != null && bounds != null && bounds.height() >= (if (control) 44 * context.resources.displayMetrics.density else 20f) && bounds.top > 80 && bounds.bottom <= bottom) return node
                } catch (_: StaleObjectException) { Thread.sleep(200); return@repeat }
                val up = label == "Back" || (bounds?.let { it.top < device.displayHeight / 3 } ?: (attempt >= 20))
                val top = device.displayHeight / 3; val bottom = device.displayHeight / 2
                device.swipe(device.displayWidth-12, if(up) top else bottom, device.displayWidth-12, if(up) bottom else top, 25)
                Thread.sleep(250)
            }
            device.dumpWindowHierarchy(File(shots,"missing-control.xml")); device.takeScreenshot(File(shots,"missing-control.png"))
            error("Missing $label")
        }
        fun press(label: String) {
            var node = visible(label)
            repeat(5) {
                val bounds = node.visibleBounds; Thread.sleep(200); val next = visible(label)
                if (bounds == next.visibleBounds) { next.click(); device.waitForIdle(); Thread.sleep(650); return }
                node = next
            }
            error("Control did not settle: $label")
        }
        fun shot(name: String) { assertTrue(device.takeScreenshot(File(shots,"android-$name.png"))) }
        fun scalar(sql: String): String = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir,fixture.databaseName).path, null, SQLiteDatabase.OPEN_READONLY).use { db -> db.rawQuery(sql, null).use { c -> check(c.moveToFirst()); c.getString(0) } }
        fun draft() = JSONObject(scalar("SELECT value_json FROM care_drafts WHERE slot='video-highlight-v1' LIMIT 1"))
        fun execute(sql: String) = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir,fixture.databaseName).path, null, SQLiteDatabase.OPEN_READWRITE).use { it.execSQL(sql) }
        val title = "Miso’s window film QA " + System.currentTimeMillis() % 100000
        fun field(label: String, value: String) {
            var entered = false
            for (attempt in 0 until 3) {
                val input = visible(label)
                check(input.className == "android.widget.EditText") { "Expected editable $label" }
                input.click(); Thread.sleep(500); input.text = value
                device.waitForIdle()
                entered = device.wait(Until.hasObject(By.clazz("android.widget.EditText").text(value)),5000)
                if (entered) break
            }
            if (!entered) { device.dumpWindowHierarchy(File(shots,"failed-input.xml")); shot("failed-input") }
            assertTrue("Native field did not accept $label", entered)
            instrumentation.runOnMainSync {
                val host = checkNotNull(activity)
                (host.getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager)
                    .hideSoftInputFromWindow(host.window.decorView.windowToken,0)
                host.currentFocus?.clearFocus()
            }
            device.waitForIdle(); Thread.sleep(900)
        }
        try {
            shots.listFiles()?.filter { it.isFile && (it.extension == "png" || it.extension == "xml") }?.forEach { it.delete() }
            device.wakeUp(); launch()
            assertTrue(device.wait(Until.hasObject(By.text("A few moments, together.")),25000))
            if (JSONObject(scalar("SELECT COALESCE((SELECT value_json FROM local_documents WHERE id='companion-session'),'{}')")).optBoolean("premium")) { launch("next-manage-plan"); press("End Debug preview"); launch() }
            val original = draft(); assertEquals(3, original.getJSONArray("clips").length())
            execute("CREATE TRIGGER fail_cat_film BEFORE INSERT ON care_drafts BEGIN SELECT RAISE(ABORT, 'Owned QA disk fault'); END")
            field("Film title", title)
            assertEquals(original.optString("title"), draft().optString("title"))
            assertTrue(device.wait(Until.hasObject(By.textContains("Couldn't save this edit")),10000)); shot("video-edit-failed")
            press("Back"); assertTrue(device.wait(Until.hasObject(By.text("This edit hasn't saved yet.")),10000)); press("Keep editing")
            execute("DROP TRIGGER fail_cat_film"); press("Retry edit")
            field("Caption for this photo", "Watching birds from the window")
            assertEquals(title,draft().getString("title"))
            assertEquals("Watching birds from the window",draft().getJSONArray("clips").getJSONObject(0).getString("caption")); shot("video-editor-more")
            val first = draft().getJSONArray("clips").getJSONObject(0).getString("photoId")
            press("Move later"); assertEquals(first,draft().getJSONArray("clips").getJSONObject(1).getString("photoId"))
            press("Move earlier"); assertEquals(first,draft().getJSONArray("clips").getJSONObject(0).getString("photoId"))
            press("Square · 1:1"); assertEquals("Square", draft().getString("aspect"))
            press("Preview photo 3"); press("Remove from film"); assertEquals(2,draft().getJSONArray("clips").length())
            press("Choose photos"); press("Afternoon nap QA"); assertEquals(3,draft().getJSONArray("clips").length())
            press("Preview photo 1")
            press("Choose photos"); press("From my phone")
            assertTrue(device.wait(Until.hasObject(By.pkg("com.google.android.documentsui")),10000)); shot("native-video-picker"); device.pressBack(); Thread.sleep(800)
            assertEquals(3,draft().getJSONArray("clips").length())
            launch(); shot("light-video-editor")
            press("Play preview"); assertTrue(device.wait(Until.hasObject(By.text(title)),10000)); shot("light-video-preview")
            press("Play preview"); Thread.sleep(3300); assertTrue(device.hasObject(By.desc("Photo 1 of 3")))
            press("Next photo"); assertTrue(device.hasObject(By.desc("Photo 2 of 3")))
            press("Previous photo"); assertTrue(device.hasObject(By.desc("Photo 1 of 3")))
            press("Back to edit")
            launch(theme="Dark"); shot("dark-video-editor"); press("Play preview"); shot("dark-video-preview"); press("Back to edit")
            press("Export MP4 · Premium"); assertTrue(device.wait(Until.hasObject(By.text("Keep their moments moving.")),10000)); shot("video-premium-boundary"); press("Back to my preview")
            launch("next-paywall"); press("Try Debug Premium preview"); launch()
            val missing=File(photoDir,first); val held=File(photoDir,first+".hold"); check(missing.renameTo(held))
            try {
                launch(); press("Export MP4 · Premium")
                assertTrue(device.wait(Until.hasObject(By.textContains("A selected photo is missing")),20000)); shot("video-missing-input")
            } finally { check(held.renameTo(missing)) }
            launch(); press("Export MP4 · Premium")
            assertTrue(device.wait(Until.hasObject(By.text("Save or share MP4")),90000))
            visible("Your film is ready.", control=false)
            visible("720 × 720 · 8.4 seconds · MP4 · silent", control=false); shot("video-ready")
            val output=File(context.cacheDir,"barklog_exports").listFiles()!!.filter { it.name.startsWith("SoftPaws-film-") && it.extension=="mp4" }.maxBy { it.lastModified() }
            val metadata=android.media.MediaMetadataRetriever()
            try { metadata.setDataSource(output.path); assertEquals("720",metadata.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)); assertTrue(kotlin.math.abs(metadata.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION)!!.toLong()-8400)<150) } finally { metadata.release() }
            press("Save or share MP4"); assertTrue(device.wait(Until.hasObject(By.pkg("com.android.intentresolver")),10000)); shot("native-video-share"); device.pressBack(); Thread.sleep(700)
            launch(); assertEquals(title,draft().getString("title")); assertEquals("Square",draft().getString("aspect"))
            launch("cat-video-denied"); press("Choose photos"); press("From my phone"); assertTrue(device.wait(Until.hasObject(By.textContains("Photo access wasn't available")),10000)); shot("video-access-denied"); assertEquals(3,draft().getJSONArray("clips").length())
            uiConfig.setWaitForIdleTimeout(200)
            launch("video-preview", reduced=false)
            visible("Play preview").click()
            assertTrue(device.wait(Until.hasObject(By.text("Pause preview")),5000))
            // Act immediately: a full screenshot/locator pass can outlast this 8.4s film.
            checkNotNull(actionable("Pause preview")).click()
            assertTrue(device.wait(Until.hasObject(By.text("Play preview")),5000)); shot("video-preview-paused")
            checkNotNull(actionable("Play preview")).click()
            assertTrue(device.wait(Until.hasObject(By.text("Pause preview")),5000))
            device.pressHome(); Thread.sleep(700)
            context.startActivity(Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT))
            assertTrue(device.wait(Until.hasObject(By.text("Play preview")),10000)); assertFalse(device.hasObject(By.text("Pause preview")))
            launch("next-manage-plan"); press("End Debug preview")
        } finally {
            runCatching { execute("DROP TRIGGER IF EXISTS fail_cat_film") }
            runCatching { if(JSONObject(scalar("SELECT COALESCE((SELECT value_json FROM local_documents WHERE id='companion-session'),'{}')")).optBoolean("premium")) { launch("next-manage-plan"); press("End Debug preview") } }
            previous.forEach { (key,value) -> if(value==null) storage.remove(key) else storage.write(key,value) }
            uiConfig.setWaitForIdleTimeout(previousIdleTimeout)
        }
    }
}
