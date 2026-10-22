package com.draco.arts.apps.bark.log.dogs.journal

import android.app.Activity
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.view.accessibility.AccessibilityNodeInfo
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.presentation.review.BoardReviewDataSet
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.security.MessageDigest
import java.util.UUID

import org.junit.FixMethodOrder
import org.junit.runners.MethodSorters

/** End-to-end proof in two explicit owned cat QA databases. Never touches the normal journal. */
@RunWith(AndroidJUnit4::class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
class SoftPawsFinishJourneyTest {
    private val instrumentation=InstrumentationRegistry.getInstrumentation()
    private val context=instrumentation.targetContext
    private val device=UiDevice.getInstance(instrumentation)
    private val fixture=BoardReviewDataSet.SoftPawsFinish
    private val storage=AndroidStorageBackend(context)
    private val shots=File(context.getExternalFilesDir(null),"soft-paws-finish-qa").apply {mkdirs()}
    private var activity:Activity?=null
    private val screens=linkedMapOf(
        "ai-entry" to "A question about Miso?", "ai-consent" to "You choose the context.", "chat" to "Ask about Miso.",
        "chat-source" to "Where that detail came from.", "chat-unavailable" to "Your question can wait here.",
        "cat-profile" to "Miso’s familiar details.", "profile-edit" to "Still learning about them.",
        "cat-switcher" to "Every cat, their own story.", "add-cat" to "Another little shadow?", "settings" to "Make yourself at home.",
        "sound-settings" to "A quieter kind of tap.", "data-settings" to "Your records, your choice.",
        "delete-cat" to "local records?", "delete-account" to "Your account and your care.",
        "empty" to "A little begins here.", "loading" to "Opening the journal.", "offline" to "Still here, without a signal.",
        "save-failure" to "Your note is still here.", "permission-denied" to "A photo can wait.",
        "missing-photo" to "The photo is missing.", "revision-conflict" to "A newer version is here.")
    private fun launch(screen:String,theme:String="Light",prepare:Boolean=true) {
        val data=if(screen=="empty") BoardReviewDataSet.SoftPawsFinishEmpty else fixture
        storage.write(data.preferencePrefix+"theme",theme);storage.write(data.preferencePrefix+"reduce_motion","true");storage.write(data.preferencePrefix+"large_text","false")
        activity=instrumentation.startActivitySync(Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview",true).putExtra("designReviewFixture",data.key).putExtra("designReviewScreen",screen))
        instrumentation.waitForIdleSync()
        if(screen=="save-failure" && prepare) {
            assertTrue(device.wait(Until.hasObject(By.text("One thing to remember.")),25000));press("Everyday note");fill("Notes (optional)","Miso watched birds · retained final-screen draft");press("Keep this note");top()
        } else if(screen=="permission-denied" && prepare) {
            assertTrue(device.wait(Until.hasObject(By.text("One moment at a time.")),25000));press("Choose a photo")
        } else if(screen=="revision-conflict" && prepare) {
            assertTrue(device.wait(Until.hasObject(By.text("Keep the context right.")),25000));fill("Your note","My retained edit · never overwrite a newer record");press("Save changes");top()
        }
        if(screen=="finish-prepare-delete-cat") assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")),25000))
        if(prepare)screens[screen]?.let { val found=device.wait(Until.hasObject(By.textContains(it)),25000);if(!found){shot("failure-$screen");device.dumpWindowHierarchy(File(shots,"failure-$screen.xml"))};assertTrue("Missing $screen",found) }
        Thread.sleep(600)
    }
    private fun top() {repeat(5){device.swipe(device.displayWidth*9/10,device.displayHeight/3,device.displayWidth*9/10,device.displayHeight*3/5,25)};device.waitForIdle()}
    private fun shot(name:String){assertTrue(device.takeScreenshot(File(shots,"android-$name.png")))}
    private fun database()=SQLiteDatabase.openDatabase(File(context.noBackupFilesDir,fixture.databaseName).path,null,SQLiteDatabase.OPEN_READONLY)
    private fun previewEnabled()=database().use {db->db.rawQuery("SELECT value_json FROM local_documents WHERE id='companion-session'",null).use {it.moveToFirst() && JSONObject(it.getString(0)).optBoolean("premium",false)}}
    private fun count(table:String)=database().use {db->db.rawQuery("SELECT COUNT(*) FROM $table",null).use {it.moveToFirst();it.getInt(0)}}
    private fun check(block:()->Unit) {
        assertEquals("com.draco.apps.soft.paws",context.packageName)
        val keys=listOf("theme","reduce_motion","large_text","interaction_sounds","sound_volume","sound_texture").map {fixture.preferencePrefix+it};val before=keys.associateWith(storage::read)
        val config=Configurator.getInstance();val idle=config.waitForIdleTimeout;config.setWaitForIdleTimeout(500)
        try {storage.write(fixture.preferencePrefix+"selected_dog_id","50f70012-0001-4000-8000-000000000001");device.wakeUp();block()}finally{before.forEach{(k,v)->if(v==null)storage.remove(k)else storage.write(k,v)};config.setWaitForIdleTimeout(idle)}
    }
    private fun find(label: String) = device.findObject(By.desc(label)) ?: device.findObject(By.text(label))
        ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
    private fun control(label: String): UiObject2? {
        val candidates = device.findObjects(By.desc(label)) + device.findObjects(By.descContains(label)) + device.findObjects(By.text(label)) + device.findObjects(By.textContains(label))
        for (candidate in candidates) {
            var node: UiObject2? = candidate
            while (node != null && !node.isClickable && !node.isCheckable && node.className !in listOf("android.widget.Button","android.widget.EditText","android.widget.RadioButton")) node = node.parent
            if (node != null) return node
        }
        return null
    }
    private fun visible(label: String, actionable: Boolean = true): UiObject2 {
        repeat(40) { attempt ->
            var bounds: android.graphics.Rect? = null
            try {
                val value=if(actionable) control(label) else find(label);bounds=value?.visibleBounds
                val labels=listOf("Keep using the journal","Continue to demo chat","Keep context choice","See how context works","View Premium","Open journal record","Back to chat","Saved contacts · free","Keep changes","Edit profile","Back to Miso","View Premium access","Start separate setup","Keep current journal","Back to settings","Keep everything","Back to local data","Manage store subscription","Delete cat permanently","Delete permanently","Keep a first check-in","Keep a check-in","Saved contacts","Try saving again","Keep this note","Save changes","Continue without photo","Try the system picker","Choose a photo","Keep caption","Keep photo","Purchases unavailable","Keep using the free journal","Back to the journal","Back to your plan")
                val footers=labels.mapNotNull(::control).filter { it.visibleBounds.height()>30 && it.visibleBounds.top>device.displayHeight/2 }
                val bottom=if(label=="Message Soft Paws AI" || labels.contains(label)) device.displayHeight-80 else footers.minOfOrNull { it.visibleBounds.top-12 } ?: (device.displayHeight-80)
                if(value!=null && bounds!=null && bounds.height()>=(if(actionable)44*context.resources.displayMetrics.density else 20f) && bounds.top>80 && bounds.bottom<=bottom) return value
            } catch (_:StaleObjectException) { Thread.sleep(200);return@repeat }
            val up=label=="Back" || (bounds?.takeIf { it.height()>0 }?.let { it.top<device.displayHeight/3 } ?: (attempt>=20))
            val top=device.displayHeight/3;val bottom=device.displayHeight/2
            device.swipe(device.displayWidth-12,if(up)top else bottom,device.displayWidth-12,if(up)bottom else top,25);Thread.sleep(200)
        }
        error("Missing control $label")
    }
    private fun press(label: String) { val value=visible(label);assertTrue("Disabled $label",value.isEnabled);value.click();device.waitForIdle();Thread.sleep(500) }
    private fun editNode(label: String): AccessibilityNodeInfo? {
        fun labelled(node: AccessibilityNodeInfo): Boolean {
            if(node.contentDescription?.toString()?.startsWith(label)==true)return true
            for(i in 0 until node.childCount)node.getChild(i)?.let { if(labelled(it))return true }
            return false
        }
        fun find(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
            if(node==null)return null
            val editable=node.actionList.any { it.id==AccessibilityNodeInfo.ACTION_SET_TEXT }
            // Compose's label semantics are a child of the editable Android node.
            if(editable && labelled(node))return node
            for(i in 0 until node.childCount) find(node.getChild(i))?.let { return it }
            return null
        }
        val roots=listOfNotNull(instrumentation.uiAutomation.rootInActiveWindow)+instrumentation.uiAutomation.windows.mapNotNull { it.root }
        for(root in roots)if(root.packageName?.toString()==context.packageName)find(root)?.let{return it}
        return null
    }
    private fun fill(label: String, value: String) {
        visible(label).click();Thread.sleep(500)
        val node=checkNotNull(editNode(label));if(label.contains("password",ignoreCase=true))assertTrue(node.isPassword)
        // Direct native action avoids UiAutomator's text-setting diagnostic messages.
        assertTrue(node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT,Bundle().apply { putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,value) }))
        device.waitForIdle()
        instrumentation.runOnMainSync {
            val host=checkNotNull(activity)
            (host.getSystemService(android.content.Context.INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager).hideSoftInputFromWindow(host.window.decorView.windowToken,0)
            host.currentFocus?.clearFocus()
        }
        Thread.sleep(600)
    }

    @Test fun aAllRemainingScreensInBothThemes()=check {
        if(storage.read(fixture.preferencePrefix+"selected_dog_id")!="50f70012-0001-4000-8000-000000000001"){launch("cat-switcher");press("Miso")}
        launch("paywall");press("Try Debug Premium preview")
        for(theme in listOf("Light","Dark"))for(screen in screens.keys) {
            launch(screen,theme)
            if(screen in setOf("save-failure","revision-conflict","chat"))top()
            shot("${theme.lowercase()}-$screen")
            if(screen=="ai-consent" && device.hasObject(By.text("Continue to demo chat"))) {
                val button=visible("Continue to demo chat")
                if(!button.isEnabled)press("I agree to online AI processing of my messages, Miso’s profile and the past seven calendar days of care records.")
                press("Continue to demo chat")
            }
        }
    }
    @Test fun bProfilePreferencesSourcesAndUnavailableDraft()=check {
        launch("paywall");press("Try Debug Premium preview")
        launch("profile-edit");fill("Cat’s name","Miso QA");fill("Care notes","Window watch · saved profile QA");press("Keep changes")
        assertTrue(device.wait(Until.hasObject(By.textContains("Miso QA’s familiar details.")),10000))
        database().use {db->db.rawQuery("SELECT name,details_json FROM dogs WHERE id='50f70012-0001-4000-8000-000000000001'",null).use {c->assertTrue(c.moveToFirst());assertEquals("Miso QA",c.getString(0));assertTrue(c.getString(1).contains("Window watch · saved profile QA"));assertTrue(c.getString(1).contains("Spayed"))}}
        launch("profile-edit");fill("Cat’s name","Miso");fill("Care notes","Owned final-screen QA · preserve this care note");press("Keep changes")
        launch("settings");press("Larger text");assertEquals("true",storage.read(fixture.preferencePrefix+"large_text"));press("Larger text")
        press("Reduced motion");assertEquals("false",storage.read(fixture.preferencePrefix+"reduce_motion"));press("Reduced motion")
        press("Theme");press("Dark");assertEquals("Dark",storage.read(fixture.preferencePrefix+"theme"));press("Theme");press("Light")
        launch("sound-settings");press("Interaction sounds");assertEquals("true",storage.read(fixture.preferencePrefix+"interaction_sounds"));shot("sounds-enabled");press("Interaction sounds")
        launch("chat-source");press("Open journal record");assertTrue(device.wait(Until.hasObject(By.text("What you recorded")),10000))
        launch("chat");fill("Message Soft Paws AI","A retained question · no remote request");launch("chat-unavailable");assertTrue(device.wait(Until.hasObject(By.textContains("A retained question")),10000));press("Saved contacts · free")
        assertTrue(device.wait(Until.hasObject(By.text("Your people, close by.")),10000))
        launch("delete-account");assertFalse(checkNotNull(control("Delete account")).isEnabled)
        launch("add-cat");press("Start separate setup");assertTrue(device.wait(Until.hasObject(By.textContains("little shadow")),10000));assertFalse(device.hasObject(By.text("Miso")));shot("independent-add-cat-setup")
    }
    @Test fun cActualFailedSaveRetryConflictAndDenial()=check {
        launch("save-failure");val before=count("care_events");assertTrue(device.hasObject(By.text("Your note is still here.")))
        press("Try saving again");assertTrue(device.wait(Until.hasObject(By.text("A small thing, kept.")),10000));assertEquals(before+1,count("care_events"));shot("save-retry-committed")
        launch("revision-conflict");press("Review saved record");assertTrue(device.wait(Until.hasObject(By.text("What you recorded")),10000));assertTrue(device.hasObject(By.textContains("A newer owned QA observation")));shot("review-newer-record")
        launch("permission-denied");press("Continue without photo");assertTrue(device.wait(Until.hasObject(By.text("What did you notice?")),10000))
        launch("missing-photo");assertTrue(device.hasObject(By.textContains("All afternoon, keeping an eye on the birds.")));press("Choose a replacement");assertTrue(device.wait(Until.hasObject(By.text("A moment, with context.")),10000))
        launch("offline");press("Saved contacts");assertTrue(device.wait(Until.hasObject(By.text("Your people, close by.")),10000))
        launch("empty");press("Keep a first check-in");assertTrue(device.wait(Until.hasObject(By.text("What did you notice?")),10000))
    }
    @Test fun dDeleteOnlyTheOwnedDisposableCat()=check {
        launch("finish-prepare-delete-cat");launch("cat-switcher");press("Juniper QA");launch("delete-cat")
        assertTrue(device.hasObject(By.textContains("Juniper QA’s local records?")))
        val before=count("dogs");press("Delete cat permanently");assertTrue(device.wait(Until.hasObject(By.text("Delete Juniper QA?")),5000));press("Keep everything");assertEquals(before,count("dogs"))
        launch("delete-cat");press("Delete cat permanently");press("Delete permanently");Thread.sleep(1000);assertEquals(before-1,count("dogs"))
        database().use {db->db.rawQuery("SELECT COUNT(*) FROM care_events WHERE dog_id='50f70012-0001-4000-8000-000000000002'",null).use {it.moveToFirst();assertEquals(1,it.getInt(0))}}
        launch("cat-switcher");assertFalse(device.hasObject(By.text("Juniper QA")))
        launch("account-plan");if(previewEnabled())press("End Debug preview")
    }
    @Test fun zEndOwnedPreview()=check {
        launch("account-plan");if(previewEnabled())press("End Debug preview")
        launch("account-plan");visible("Free journal",false);assertFalse(previewEnabled())
    }

}
