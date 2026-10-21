package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import android.content.ContentValues
import android.provider.MediaStore
import org.json.JSONObject
import android.database.sqlite.SQLiteDatabase
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Real private image import and atomic photo/collection writes in the owned cat journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsPhotoMemoryJourneyTest {
    @Test fun privatePhotoCaptionAndCollectionsSurviveNativePickerAndFailure() {
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val context = instrumentation.targetContext
        check(context.packageName == "com.draco.apps.soft.paws")
        val device = UiDevice.getInstance(instrumentation)
        val fixture = BoardReviewDataSet.SoftPawsDay
        val storage = AndroidStorageBackend(context)
        val keys = listOf("theme", "reduce_motion").map { fixture.preferencePrefix + it }
        val previous = keys.associateWith(storage::read)
        val shots = File(context.getExternalFilesDir(null), "soft-paws-photos-qa").apply { mkdirs() }
        var activity: android.app.Activity? = null
        fun launch(screen: String, theme: String = "Light") {
            storage.write(keys[0], theme); storage.write(keys[1], "true")
            activity = instrumentation.startActivitySync(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                .putExtra("designReview", true).putExtra("designReviewFixture", fixture.key).putExtra("designReviewScreen", screen))
            instrumentation.waitForIdleSync(); Thread.sleep(900)
            val heading = mapOf("photo-picker" to "One moment at a time.", "photo-journal" to "Ordinary, lovely days.", "memory-book" to "October, in small moments.")[screen]
            if (heading != null) assertTrue(device.wait(Until.hasObject(By.text(heading)), 25000))
        }
        fun find(label: String) = device.findObject(By.text(label)) ?: device.findObject(By.desc(label))
            ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
        fun visible(label: String): UiObject2 {
            repeat(128) { attempt ->
                var observed: android.graphics.Rect? = null
                try {
                    val value = find(label)
                    observed = value?.visibleBounds
                    val minimum = if (label == "Back") (44 * context.resources.displayMetrics.density).toInt() else 20
                    if (value != null && value.visibleBounds.height() >= minimum) return value
                } catch (_: StaleObjectException) {
                    Thread.sleep(200)
                    return@repeat
                }
                val upwards = label == "Back" || (observed?.let { it.top <= device.displayHeight / 3 } ?: (attempt >= 64))
                val top = device.displayHeight / 3
                val bottom = device.displayHeight / 2
                device.swipe(device.displayWidth - 12, if (upwards) top else bottom,
                    device.displayWidth - 12, if (upwards) bottom else top, 28)
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
                device.swipe(device.displayWidth - 12, device.displayHeight / 2,
                    device.displayWidth - 12, device.displayHeight / 3, 24)
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

        val title = "Window watch QA " + System.currentTimeMillis()
        val imageName = "SoftPawsMoment-" + System.currentTimeMillis() + ".jpg"
        var imageUri: android.net.Uri? = null
        fun writeSql(sql: String) = SQLiteDatabase.openDatabase(File(context.noBackupFilesDir, fixture.databaseName).absolutePath, null, SQLiteDatabase.OPEN_READWRITE).use { it.execSQL(sql) }
        fun photoJson() = JSONObject(scalar("SELECT data_json FROM care_items WHERE kind='photo' AND data_json LIKE '%$title%'"))
        fun openMoment() {
            launch("photo-journal"); press(title)
            assertTrue(device.wait(Until.hasObject(By.text("Keep caption")), 8000)); visible("Your caption")
        }
        fun openOwnCollection() { press("Open collection: $title") }

        try {
            if (JSONObject(scalar("SELECT COALESCE((SELECT value_json FROM local_documents WHERE id='companion-session'), '{}')")).optBoolean("premium")) { launch("next-manage-plan"); press("End Debug preview") }
            imageUri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, imageName); put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg"); put(MediaStore.MediaColumns.RELATIVE_PATH, "Download")
            }) ?: error("Could not create owned QA photo")
            val image = android.graphics.Bitmap.createBitmap(640, 440, android.graphics.Bitmap.Config.ARGB_8888)
            val canvas = android.graphics.Canvas(image); canvas.drawColor(android.graphics.Color.rgb(248, 214, 177))
            val paint = android.graphics.Paint().apply { color = android.graphics.Color.rgb(49, 53, 67); textSize = 32f }
            canvas.drawText("Owned Soft Paws QA moment", 30f, 100f, paint)
            paint.color = android.graphics.Color.rgb(127, 165, 145); canvas.drawCircle(320f, 260f, 100f, paint)
            context.contentResolver.openOutputStream(imageUri)!!.use { assertTrue(image.compress(android.graphics.Bitmap.CompressFormat.JPEG, 95, it)) }; image.recycle()
            launch("photo-picker")
            if (find("Continue photo draft") != null) { press("Continue photo draft"); press("Back"); press("Discard draft"); launch("photo-picker") }
            capture("android-light-photo-picker")
            press("Choose a photo")
            assertTrue(device.wait(Until.hasObject(By.pkg("com.google.android.documentsui")), 8000) || device.hasObject(By.pkg("com.android.documentsui")))
            capture("android-native-photo-picker"); device.pressBack(); device.waitForIdle()
            visible("Selection cancelled. Your draft is still here."); capture("android-photo-picker-cancelled")
            press("Choose a photo"); Thread.sleep(700)
            if (!device.hasObject(By.descStartsWith(imageName))) {
                press("Show roots"); Thread.sleep(500)
                val root = device.findObjects(By.text("Downloads")).last().visibleBounds
                device.click(root.centerX(), root.centerY()); device.waitForIdle()
            }
            val tile = device.wait(Until.findObject(By.descStartsWith(imageName)), 10000) ?: error("Owned photo tile missing")
            val tileBounds = tile.visibleBounds
            // The upper-right overlay previews the file in another app. Select its actual thumbnail.
            device.click(tileBounds.left + tileBounds.width() / 4, tileBounds.top + tileBounds.height() * 3 / 4)
            device.waitForIdle(); visible("Name this moment")
            field("Name this moment", title); field("Your caption", "Photo words stay separate")
            press("Include in October’s Memory Book")
            field("Date · YYYY-MM-DD", "2026-10-14")
            press("Back"); press("Keep draft"); launch("photo-picker"); press("Continue photo draft")
            assertEquals(title, value("Name this moment")); assertEquals("Photo words stay separate", value("Your caption")); capture("android-photo-draft-reopened")
            writeSql("CREATE TRIGGER fail_owned_book BEFORE INSERT ON care_items WHEN NEW.kind='memory' BEGIN SELECT RAISE(ABORT, 'owned QA disk failure'); END")
            press("Keep photo"); Thread.sleep(600)
            assertEquals("0", scalar("SELECT COUNT(*) FROM care_items WHERE kind='photo' AND data_json LIKE '%$title%'")); capture("android-photo-memory-rollback")
            assertEquals("Photo words stay separate", value("Your caption"))
            writeSql("DROP TRIGGER fail_owned_book")
            press("Keep photo"); visible("Your caption")
            val photoId = scalar("SELECT id FROM care_items WHERE kind='photo' AND data_json LIKE '%$title%'")
            val fileId = photoJson().getString("fileId")
            assertTrue(File(context.filesDir, "barklog_photos/$fileId").isFile)
            val collectionId = scalar("SELECT id FROM care_items WHERE kind='memory' AND data_json LIKE '%$photoId%'")
            assertEquals("2026-10", JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$collectionId'")).getString("month"))
            capture("android-light-photo-detail")
            press("Back to photos"); press("Add a photo")
            assertNull("A committed photo is not an unfinished draft", find("Continue photo draft"))
            press("Choose a photo")
            val secondTile = device.wait(Until.findObject(By.descStartsWith(imageName)), 10000) ?: error("Owned second photo missing")
            val secondBounds = secondTile.visibleBounds; device.click(secondBounds.left + secondBounds.width() / 4, secondBounds.top + secondBounds.height() * 3 / 4)
            device.waitForIdle(); visible("Name this moment"); assertEquals("", value("Name this moment"))
            val secondTitle = "Second " + title
            field("Name this moment", secondTitle); field("Your caption", "Independent second moment"); press("Keep photo"); visible("Your caption")
            assertEquals("2", scalar("SELECT COUNT(*) FROM care_items WHERE kind='photo' AND (data_json LIKE '%$title%')"))
            capture("android-second-photo-same-session")
            press("Delete photo reference"); press("Delete reference"); visible("Ordinary, lovely days.")
            assertEquals("0", scalar("SELECT COUNT(*) FROM care_items WHERE kind='photo' AND data_json LIKE '%$secondTitle%'"))
            assertEquals("1", scalar("SELECT COUNT(*) FROM care_items WHERE id='$photoId'"))
            openMoment(); assertEquals("Photo words stay separate", value("Your caption"))
            field("Your caption", "Photo caption edited on phone"); press("Keep caption")
            assertEquals("Photo caption edited on phone", photoJson().getString("notes"))
            launch("memory-book"); capture("android-light-memory-book"); openOwnCollection()
            press("Edit collection caption"); field("Collection caption", "Collection words remain independent"); press("Keep collection caption")
            visible("Collection words remain independent"); capture("android-collection-caption")
            press("PDF, print & sharing"); visible("Your preview stays free"); capture("android-memory-premium-boundary")
            press("Back to preview")
            openMoment(); assertEquals("Photo caption edited on phone", value("Your caption"))
            press("Include in October’s Memory Book"); press("Keep caption")
            val retained = JSONObject(scalar("SELECT data_json FROM care_items WHERE id='$collectionId'"))
            assertEquals(0, retained.getJSONArray("sourceIds").length()); assertEquals("Collection words remain independent", retained.getString("caption"))
            launch("memory-book"); visible("Collection words remain independent"); capture("android-caption-retained-without-sources")
            openMoment(); press("Include in October’s Memory Book"); press("Keep caption")
            val original = File(context.filesDir, "barklog_photos/$fileId"); val held = File(context.cacheDir, "owned-held-$fileId")
            assertTrue(original.renameTo(held))
            try { openMoment(); visible("Photo unavailable"); assertEquals("Photo caption edited on phone", value("Your caption")); capture("android-photo-missing-metadata") }
            finally { assertTrue(held.renameTo(original)) }
            openMoment(); press("Edit photo details or replace image"); visible("Name this moment"); capture("android-photo-full-editor")
            press("Choose replacement"); device.pressBack(); device.waitForIdle(); visible("Selection cancelled. Your draft is still here.")
            press("Back"); openMoment(); press("Delete photo reference"); press("Keep photo")
            assertEquals("1", scalar("SELECT COUNT(*) FROM care_items WHERE id='$photoId'"))
            assertTrue(context.contentResolver.openInputStream(imageUri)!!.use { it.read() >= 0 })
            for (theme in listOf("Light", "Dark")) {
                launch("photo-picker", theme); capture("android-${theme.lowercase()}-photo-picker")
                launch("photo-journal", theme); press(title); visible("Your caption"); capture("android-${theme.lowercase()}-photo-detail")
                visible("Include in October’s Memory Book"); capture("android-${theme.lowercase()}-photo-detail-more")
                launch("memory-book", theme); capture("android-${theme.lowercase()}-memory-book")
            }
            launch("next-paywall"); press("Try Debug Premium preview"); visible("Let’s talk about your cat.")
            launch("memory-share"); visible("Keep a copy of the month."); press("Prepare PDF")
            visible("Your PDF is ready"); capture("android-memory-pdf-ready")
            val exported = File(context.cacheDir, "barklog_exports").listFiles()!!.filter { it.name.startsWith("Soft-Paws-memory-2026-10-") }.maxBy { it.lastModified() }
            assertTrue(exported.length() > 500)
            android.graphics.pdf.PdfRenderer(android.os.ParcelFileDescriptor.open(exported, android.os.ParcelFileDescriptor.MODE_READ_ONLY)).use { assertTrue(it.pageCount > 0) }
            exported.copyTo(File(shots, "owned-memory-export.pdf"), overwrite = true)
            press("Share PDF"); assertTrue(device.wait(Until.hasObject(By.pkg("com.android.intentresolver")), 8000)); capture("android-native-memory-share"); device.pressBack(); device.waitForIdle()
            press("Print PDF"); assertTrue(device.wait(Until.hasObject(By.pkg("com.android.printspooler")), 8000)); capture("android-native-memory-print"); device.pressBack(); device.waitForIdle()
            launch("next-manage-plan"); press("End Debug preview")
            launch("photo-permission-denied"); press("Choose a photo"); visible("This photo wasn't accessible. Your entries stay here."); capture("android-photo-access-denied")
        } catch (failure: Throwable) { capture("android-photo-memory-failure"); throw failure }
        finally {
            runCatching { writeSql("DROP TRIGGER IF EXISTS fail_owned_book") }
            runCatching { if (JSONObject(scalar("SELECT COALESCE((SELECT value_json FROM local_documents WHERE id='companion-session'), '{}')")).optBoolean("premium")) { launch("next-manage-plan"); press("End Debug preview") } }
            imageUri?.let { context.contentResolver.delete(it, null, null) }
            previous.forEach { (key, value) -> if (value == null) storage.remove(key) else storage.write(key, value) }
        }
    }
}
