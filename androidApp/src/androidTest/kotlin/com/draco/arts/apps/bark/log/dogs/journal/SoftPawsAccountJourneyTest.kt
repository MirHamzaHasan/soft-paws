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

/** Explicitly unconfigured native account/access proof in an independent cat QA journal. */
@RunWith(AndroidJUnit4::class)
class SoftPawsAccountJourneyTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val context = instrumentation.targetContext
    private val device = UiDevice.getInstance(instrumentation)
    private val fixture = BoardReviewDataSet.SoftPawsAccount
    private val storage = AndroidStorageBackend(context)
    private val shots = File(context.getExternalFilesDir(null), "soft-paws-account-qa").apply { mkdirs() }
    private var activity: Activity? = null
    private val headings = linkedMapOf(
        "sign-in" to "For the extras, an account.", "email-sign-in" to "Welcome back to Soft Paws.",
        "create-account" to "An account, when you need one.", "password-reset" to "A way back in.",
        "paywall" to "A little more care.", "account-plan" to "Your plan, plainly.",
        "manage-subscription" to "Your store manages billing.", "future-features" to "A little further ahead.",
    )
    private fun launch(screen: String, theme: String = "Light") {
        storage.write(fixture.preferencePrefix+"theme",theme); storage.write(fixture.preferencePrefix+"reduce_motion","true")
        activity = instrumentation.startActivitySync(Intent(context,MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview",true).putExtra("designReviewFixture",fixture.key).putExtra("designReviewScreen",screen))
        instrumentation.waitForIdleSync()
        headings[screen]?.let { assertTrue("Missing $screen",device.wait(Until.hasObject(By.text(it)),25000)) }
        Thread.sleep(600)
    }
    private fun find(label: String) = device.findObject(By.desc(label)) ?: device.findObject(By.text(label))
        ?: device.findObject(By.textContains(label)) ?: device.findObject(By.descContains(label))
    private fun control(label: String): UiObject2? {
        var node = find(label)
        while (node != null && !node.isClickable && !node.isCheckable && node.isEnabled && node.className !in listOf("android.widget.Button","android.widget.EditText","android.widget.RadioButton")) node = node.parent
        return node
    }
    private fun visible(label: String, actionable: Boolean = true): UiObject2 {
        repeat(40) { attempt ->
            var bounds: android.graphics.Rect? = null
            try {
                val value=if(actionable) control(label) else find(label);bounds=value?.visibleBounds
                val labels=listOf("Keep using the journal","Continue with Apple","Continue with Google","Continue with email","Sign in","Create account","Send reset email","Back to sign in","Use the local journal","Purchases unavailable","Keep using the free journal","Back to preview","Back to the journal","Back to your plan","Back to your journal")
                val footers=labels.mapNotNull(::control).filter { it.visibleBounds.height()>30 && it.visibleBounds.top>device.displayHeight/2 }
                val bottom=if(labels.contains(label)) device.displayHeight-80 else footers.minOfOrNull { it.visibleBounds.top-12 } ?: (device.displayHeight-80)
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
    private fun shot(name:String) { assertTrue(device.takeScreenshot(File(shots,"android-$name.png"))) }
    private fun passwordState(label: String = "Password"): String? {
        val node=editNode(label) ?: return null
        val described=node.stateDescription?.toString()
        if(described in listOf("Empty","Entered"))return described
        // Android may put the explicit state on a merged ancestor. Read only
        // emptiness from the protected editable node; never expose its value.
        return if(node.isPassword) { if(node.text.isNullOrEmpty()) "Empty" else "Entered" } else null
    }
    private fun assertPasswordEmpty(label: String = "Password") {
        visible(label)
        repeat(20) { if(passwordState(label)=="Empty")return;Thread.sleep(100) }
        assertEquals("Protected $label state", "Empty", passwordState(label))
    }
    private fun backgroundAndResume() {
        val host=activity as MainActivity
        device.pressHome()
        var stopped=false
        for(i in 0 until 100) {
            instrumentation.runOnMainSync { stopped=!host.lifecycle.currentState.isAtLeast(androidx.lifecycle.Lifecycle.State.STARTED) }
            if(stopped)break
            Thread.sleep(100)
        }
        assertTrue("Activity did not enter the background",stopped)
        Thread.sleep(300)
        context.startActivity(Intent(host.intent).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT))
        assertTrue(device.wait(Until.hasObject(By.desc("Password")),10000))
        assertFalse("Background check recreated the Activity",host.isDestroyed)
    }
    private fun database()=SQLiteDatabase.openDatabase(File(context.noBackupFilesDir,fixture.databaseName).path,null,SQLiteDatabase.OPEN_READONLY)
    private fun careDigest():String=database().use { db ->
        val values=buildString {
            for(table in listOf("dogs","care_events","care_items","care_drafts")) db.rawQuery("SELECT * FROM $table ORDER BY 1",null).use { c ->
                while(c.moveToNext()) for(i in 0 until c.columnCount)append(c.getString(i)).append('\u0000')
            }
        }
        MessageDigest.getInstance("SHA-256").digest(values.toByteArray()).joinToString(""){"%02x".format(it)}
    }
    private fun previewActive():Boolean=database().use { db ->db.rawQuery("SELECT value_json FROM local_documents WHERE id='companion-session'",null).use { c ->c.moveToFirst() && JSONObject(c.getString(0)).optBoolean("premium") } }
    private fun assertNoStoredSecret(secret:String) { database().use { db ->
        for(table in listOf("local_documents","care_drafts")) db.rawQuery("SELECT * FROM $table",null).use { c ->
            while(c.moveToNext())for(i in 0 until c.columnCount)assertFalse("Generated input reached SQLite",c.getString(i).orEmpty().contains(secret))
        }
    } }
    private fun check(block:()->Unit) {
        assertEquals("com.draco.apps.soft.paws",context.packageName)
        val keys=listOf("theme","reduce_motion").map { fixture.preferencePrefix+it };val previous=keys.associateWith(storage::read)
        val config=Configurator.getInstance();val idle=config.waitForIdleTimeout;config.setWaitForIdleTimeout(1000)
        try { device.wakeUp();block() } finally {
            previous.forEach { (key,value)->if(value==null)storage.remove(key)else storage.write(key,value) };config.setWaitForIdleTimeout(idle)
        }
    }
    @Test fun accountRequestsStayUnavailableAndPasswordsDoNotReturn()=check {
        launch("sign-in");val before=careDigest()
        press("Continue with Apple");assertTrue(device.wait(Until.hasObject(By.textContains("Sign-in is unavailable")),5000));shot("account-apple-unavailable")
        press("Continue with Google");assertTrue(device.wait(Until.hasObject(By.textContains("Sign-in is unavailable")),5000))
        press("Continue with email");press("Sign in");assertTrue(device.wait(Until.hasObject(By.textContains("Enter a valid email")),5000));shot("account-validation")
        val email="cat-${UUID.randomUUID()}@example.invalid";val secret=UUID.randomUUID().toString()
        fill("Email address",email);fill("Password",secret)
        assertEquals("Entered",passwordState())
        backgroundAndResume()
        assertPasswordEmpty()
        fill("Password",secret);press("Sign in");assertTrue(device.wait(Until.hasObject(By.textContains("Sign-in is unavailable")),5000))
        press("Create account");assertPasswordEmpty();assertPasswordEmpty("Confirm password")
        fill("Password",secret);fill("Confirm password",UUID.randomUUID().toString());press("Create account")
        assertTrue(device.wait(Until.hasObject(By.textContains("passwords don't match")),5000))
        press("Back");assertPasswordEmpty();press("Forgot password?")
        press("Send reset email");assertTrue(device.wait(Until.hasObject(By.textContains("Sign-in is unavailable")),5000))
        assertFalse(device.hasObject(By.textContains("check your inbox")));shot("account-reset-unavailable")
        press("Back to sign in");press("Back");press("Keep using the journal")
        assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")),10000));assertEquals(before,careDigest());assertNoStoredSecret(secret)
    }
    @Test fun plansUseTheRealUnavailableBoundaryAndExplicitDebugPreview()=check {
        launch("paywall");val before=careDigest()
        for(label in listOf("Weekly, $2.99, billed every week","Monthly, $6.99, billed every month","Yearly, $39.99, billed every year")) {
            press(label);val row=visible(label);assertTrue(row.isSelected || row.isChecked)
        }
        assertFalse(visible("Purchases unavailable").isEnabled);shot("account-plan-selection")
        press("Terms");assertTrue(device.wait(Until.hasObject(By.text("Terms · setup preview")),5000));press("Close")
        press("Privacy");assertTrue(device.wait(Until.hasObject(By.text("Privacy · setup preview")),5000));press("Close")
        press("Restore purchases");assertTrue(device.wait(Until.hasObject(By.text("Store setup is pending")),5000));assertFalse(visible("Restore purchases").isEnabled)
        assertFalse(previewActive());shot("account-restore-unavailable");press("Back to your plan")
        press("Manage a store subscription");assertFalse(device.hasObject(By.text("Open subscriptions")));shot("account-store-unavailable");press("Back to your plan")
        launch("paywall");press("Try Debug Premium preview");assertTrue(previewActive())
        launch("account-plan");assertTrue(device.wait(Until.hasObject(By.text("Debug Premium preview")),10000));shot("account-debug-preview")
        press("End Debug preview");assertFalse(previewActive());launch("account-plan");assertTrue(device.wait(Until.hasObject(By.text("Free journal")),10000))
        assertEquals(before,careDigest());press("Back to the journal");assertTrue(device.wait(Until.hasObject(By.text("A quick check-in")),10000))
    }
    @Test fun allApprovedAccountScreensInBothThemes()=check {
        for(theme in listOf("Light","Dark"))for(screen in headings.keys) {
            launch(screen,theme);shot("${theme.lowercase()}-$screen")
            if(screen=="paywall") { visible("Yearly, $39.99, billed every year");shot("${theme.lowercase()}-paywall-more") }
        }
    }
}
