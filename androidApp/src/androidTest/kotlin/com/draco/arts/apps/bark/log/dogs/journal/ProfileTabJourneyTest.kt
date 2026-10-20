package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

@RunWith(AndroidJUnit4::class)
class ProfileTabJourneyTest {
    @Test fun profileMenuAndSelectedTabStayTogether() {
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        val device=UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
        val storage=AndroidStorageBackend(context)
        val prefix=com.dracoarts.shared.presentation.review.BoardReviewDataSet.AddDog.preferencePrefix
        val keys=listOf(prefix+"theme",prefix+"reduce_motion")
        val saved=keys.associateWith(storage::read)
        device.wakeUp()
        try { for(theme in listOf("Light","Dark")) { for(reduced in listOf(false,true)) {
        storage.write(keys[0],theme);storage.write(keys[1],reduced.toString())
        context.startActivity(Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            .putExtra("designReview",true).putExtra("designReviewFixture","park-add-dog-v1").putExtra("designReviewScreen","next-home"))
        Thread.sleep(1200)
        fun tab(label:String): androidx.test.uiautomator.UiObject2 {
            var node=device.wait(Until.findObject(By.text(label)),20000) ?: device.wait(Until.findObject(By.desc(label)),3000) ?: error("Missing tab: $label")
            repeat(5) {if(node.isClickable || node.isFocusable)return node;node=node.parent ?: error("Missing tab control: $label")}
            error("Missing clickable tab: $label")
        }
        for(origin in if(reduced) listOf("Home") else listOf("Home","Timeline","Insights")) {
            if(origin!="Home") {tab(origin).click();Thread.sleep(900)}
            val dockBounds = tab("Profile").visibleBounds
            tab("Profile").click();Thread.sleep(2500)
            val dir=File(context.getExternalFilesDir(null),"profile-tab-qa").apply {mkdirs()}
            val name="android-${theme.lowercase()}-${if(reduced) "reduced" else "motion"}-profile-from-${origin.lowercase()}"
            device.takeScreenshot(File(dir,"$name.png"))
            device.dumpWindowHierarchy(File(dir,"$name.xml"))
            assertTrue("Profile must expose its selected state",tab("Profile").isSelected)
            assertEquals("Profile must keep the same dock while its menu opens",dockBounds,tab("Profile").visibleBounds)
            assertFalse("Home must no longer be selected",tab("Home").isSelected)
            assertTrue(device.hasObject(By.text("Your account.")) || device.hasObject(By.desc("Your account.")))
            tab("Home").click();Thread.sleep(1000)
            assertTrue(tab("Home").isSelected);assertFalse(tab("Profile").isSelected)
        }
        } } } finally {saved.forEach {(key,value)->if(value==null)storage.remove(key) else storage.write(key,value)}}
    }
}
