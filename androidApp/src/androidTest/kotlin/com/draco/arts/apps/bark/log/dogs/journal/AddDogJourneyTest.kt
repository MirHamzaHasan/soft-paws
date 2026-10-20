package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

/** Exercises the real SQLite-backed flow in its own journal, preserving normal app data. */
@RunWith(AndroidJUnit4::class)
class AddDogJourneyTest {
    private val instrumentation = InstrumentationRegistry.getInstrumentation()
    private val device = UiDevice.getInstance(instrumentation)
    private fun find(label: String): UiObject2? {
        return try {
        val raw = device.findObject(By.desc(label)) ?: device.findObject(By.text(label)) ?: return null
        var node = raw
        repeat(5) { if (node.isClickable) return node; node = node.parent ?: return raw }
        raw
        } catch (_: StaleObjectException) { null }
    }
    private fun scroll(up: Boolean = false) {
        device.swipe((device.displayWidth * .95).toInt(), (device.displayHeight * if(up) .25 else .70).toInt(),
            (device.displayWidth * .95).toInt(), (device.displayHeight * if(up) .70 else .25).toInt(), 24)
        Thread.sleep(250)
    }
    private fun tap(label: String, choose: Boolean = false) {
        repeat(20) {
            try { find(label)?.let {
                val rect = it.visibleBounds
                val bottom = if (label == "Finish later") device.displayHeight else
                    find("Finish later")?.visibleBounds?.top ?: find("Native board screen")?.visibleBounds?.top ?: device.displayHeight
                if (!rect.isEmpty && rect.bottom < bottom && rect.top > 40) { if (!choose || !(it.isSelected || it.isChecked)) it.click(); Thread.sleep(450); return }
            } } catch (_: StaleObjectException) { }
            scroll(up = label == "Back")
        }
        shot("missing-control"); error("Missing control: $label")
    }
    private fun await(label: String) {
        repeat(80) { if (find(label) != null) return; if (it > 0 && it % 12 == 0) scroll(up = true); Thread.sleep(150) }
        shot("missing-state"); error("Missing state: $label")
    }
    private fun field(label: String, value: String) {
        repeat(20) {
            var input = device.findObject(By.desc(label))
            repeat(5) { if (input != null && input!!.className != "android.widget.EditText") input = input!!.parent }
            if (input?.className == "android.widget.EditText") {
                input!!.click(); Thread.sleep(250); input!!.text = value
                device.pressBack(); Thread.sleep(250); return
            }
            scroll()
        }
        error("Missing field: $label")
    }
    private fun shot(name: String) {
        val dir = File(instrumentation.targetContext.getExternalFilesDir(null), "add-dog-qa").apply { mkdirs() }
        device.takeScreenshot(File(dir,"android-$name.png")); device.dumpWindowHierarchy(File(dir,"android-$name.xml"))
    }
    private fun launch() {
        val context = instrumentation.targetContext
        context.startActivity(Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview",true).putExtra("designReviewFixture","park-add-dog-v1").putExtra("designReviewScreen","dog-switcher"))
        await("Choose a dog")
    }
    private fun startAdditionalDog() {
        launch();tap("Add another dog")
        if (find("A journal for each dog.") != null) {
            tap("Try Debug Premium preview");await("Choose a dog");tap("Add another dog")
        }
    }
    @Test fun fullNewDogSetupResumesAndSavesItsOwnProfile() {
        val name="Luna ${System.currentTimeMillis().toString().takeLast(5)}"
        startAdditionalDog()
        // The draft may still be loading after the gateway opens; Back must not cancel it.
        await("Native board screen")
        Thread.sleep(450)
        for (attempt in 0 until 18) {
            if (device.hasObject(By.descContains("2/54 · next-dog")) || device.hasObject(By.text("2/54 · next-dog"))) break
            device.pressBack(); Thread.sleep(650)
        }
        await("Who’s your dog?")
        assertNotEquals("Bruno",device.findObject(By.clazz("android.widget.EditText")).text)
        shot("fresh-profile"); field("Your dog’s name",name); tap("Continue")
        await("What chapter are they in?"); tap("Puppy")
        await("How old is $name?"); field("Years","1"); field("Months","2"); tap("Continue")
        await("Their breed. Or their mix."); tap("Beagle", choose = true); tap("Continue")
        await("A little more about them."); tap("Female"); tap("Continue")
        await("Their size, in your words."); tap("Small"); field("Recorded weight","9.5"); tap("Continue")
        await("How new is dog care?"); tap("Some experience")
        await("What would help most?"); tap("Keep their memories", choose = true); tap("Continue")
        await("How does your day go?"); tap("Every day is different", choose = true); tap("Continue")
        await("What are you curious about?"); tap("Training & play", choose = true); tap("Continue")
        await("What’s your dog like?"); tap("Curious", choose = true); tap("Continue")
        await("What do they enjoy?"); tap("Sniffing walks", choose = true); tap("Continue")
        await("What’s on their menu?"); tap("Wet food", choose = true); field("Known allergies or sensitivities","New dog sensitivity note"); tap("Continue")
        await("The things only you know."); field("Known conditions","Caregiver observation"); field("Medications or care instructions","Existing vet instructions"); field("Anything else to know?","Prefers a quiet doorway")
        tap("Finish later"); await("Choose a dog"); assertNull(find(name)); shot("paused-without-new-dog")
        // Activity/process recreation reopens the saved setup through the same public entry.
        startAdditionalDog(); await("The things only you know.")
        assertEquals("Caregiver observation",device.findObjects(By.clazz("android.widget.EditText"))[0].text)
        shot("resumed-notes"); tap("Continue")
        await("A little nudge?"); tap("Choose access")
        await("A nudge when it helps."); await("Off · logging still works."); shot("optional-access")
        tap("Review dog details"); await("Does this sound like $name?"); shot("profile-review")
        repeat(15) {
            if (device.findObject(By.text("Daily routines, Training & play")) == null) scroll()
        }
        assertNotNull("The selected AI topic must be in this dog’s saved profile", device.findObject(By.text("Daily routines, Training & play")))
        tap("Edit name"); await("Who’s your dog?"); tap("Continue"); await("Does this sound like $name?")
        tap("Add $name"); await("Ask about $name"); shot("new-dog-home")
        tap("Profile"); tap("Dog profile"); await("$name’s profile."); shot("saved-profile")
        tap("Switch or add dog"); await("Choose a dog"); await("Bruno"); await(name); shot("both-dogs")
    }
}
