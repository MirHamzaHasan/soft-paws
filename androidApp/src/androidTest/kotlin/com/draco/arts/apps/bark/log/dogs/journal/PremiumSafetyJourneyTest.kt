package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Intent
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.*
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.presentation.review.*
import kotlinx.coroutines.*
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.util.UUID

/** Synthetic SQLite fixture only; no store, AI, dialer or Maps calls are sent. */
@RunWith(AndroidJUnit4::class)
class PremiumSafetyJourneyTest {
    @Test fun pricingFreeEmergencyAndPremiumSafetyAreReachable()=runBlocking {
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        val device=UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());device.wakeUp();device.pressMenu()
        val fixture=BoardReviewDataSet.PremiumSafety
        val repo=SqlDelightJournalRepository(AndroidJournalDriverFactory(context,fixture.databaseName),{UUID.randomUUID().toString()},{fixture.nowMillis},Dispatchers.IO)
        repo.initialize();BoardReviewFixture.seed(repo,fixture)
        val session=repo.readDocument("companion-session");val key="companion-chat-${BoardReviewFixture.dogId}";val workspace=repo.readDocument(key)
        val storage=AndroidStorageBackend(context);val pref=fixture.preferencePrefix
        val settings=listOf("theme","reduce_motion","emergency-country").associateWith{storage.read(pref+it)}
        val out=File(context.getExternalFilesDir(null),"premium-safety-qa").apply{mkdirs()}
        fun launch(screen:String){context.startActivity(Intent(context,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK).putExtra("designReview",true).putExtra("designReviewFixture",fixture.key).putExtra("designReviewScreen",screen));Thread.sleep(1800)}
        fun find(label:String):UiObject2?=device.findObject(By.textStartsWith(label)) ?: device.findObject(By.descStartsWith(label))
        fun visible(label:String):UiObject2 {
            repeat(16){
                val node=find(label)
                val bottom=(find("Native board screen")?.visibleBounds?.top ?: device.displayHeight)-150
                if(node!=null && node.visibleBounds.height()>0 && node.visibleBounds.bottom<bottom)return node
                val area=device.findObject(By.scrollable(true))?.visibleBounds
                val x=area?.centerX() ?: (device.displayWidth/2)
                device.swipe(x,(area?.bottom ?: bottom)-35,x,(area?.top ?: 136)+100,28);Thread.sleep(350)
            };error("Missing visible control: $label")
        }
        fun press(label:String){var node=visible(label);repeat(5){if(!node.isClickable)node=node.parent ?: node};node.click();Thread.sleep(1000)}
        fun shot(name:String){device.takeScreenshot(File(out,"$name.png"));device.dumpWindowHierarchy(File(out,"$name.xml"))}
        try {
            repo.writeDocument("companion-session","""{"premium":false}""")
            for(theme in listOf("Light","Dark")) {
                storage.write(pref+"theme",theme);storage.write(pref+"emergency-country","US")
                launch("dog-switcher");press("Add another dog");visible("More for");visible("Yearly");shot("android-${theme.lowercase()}-pricing")
                assertTrue(device.hasObject(By.textContains("$2.99"))||device.hasObject(By.descContains("$2.99")))
                launch("triage");press("Possible poisoning");visible("Emergency card");shot("android-${theme.lowercase()}-free-emergency")
                visible("Animal poison services");visible("Call (888) 426-4435");shot("android-${theme.lowercase()}-animal-services")
                launch("next-train-dog");visible("Train your dog");shot("android-${theme.lowercase()}-training-coming-soon")
            }
            repo.writeDocument("companion-session","""{"premium":true}""")
            repo.writeDocument(key,"""{"messageConsent":true,"profileConsent":true,"recordConsent":true,"cloudConsent":true,"weeklyConsentVersion":1}""",BoardReviewFixture.dogId)
            for(theme in listOf("Light","Dark")) {
                storage.write(pref+"theme",theme)
                launch("toxicity-search");visible("Substance or product");device.findObject(By.clazz("android.widget.EditText")).text="chocolate";press("Ask BarkLog AI")
                visible("DESIGN PREVIEW");shot("android-${theme.lowercase()}-toxicity-preview")
                launch("first-aid");visible("Bleeding");press("Ask BarkLog AI");visible("DESIGN PREVIEW");shot("android-${theme.lowercase()}-safety-preview")
                launch("next-nearby-vet");visible("City and country");shot("android-${theme.lowercase()}-nearby-vet")
            }
        } finally {
            if(session==null)repo.removeDocuments("companion-session")else repo.writeDocument("companion-session",session)
            if(workspace==null)repo.removeDocuments(key)else repo.writeDocument(key,workspace,BoardReviewFixture.dogId)
            settings.forEach{(key,value)->if(value==null)storage.remove(pref+key)else storage.write(pref+key,value)}
            repo.close()
        }
    }
}
