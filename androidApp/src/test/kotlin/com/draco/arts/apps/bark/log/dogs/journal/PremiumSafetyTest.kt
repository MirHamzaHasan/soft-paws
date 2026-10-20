package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.managers.*
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.services.*
import com.dracoarts.shared.services.ai.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.datetime.TimeZone
import kotlin.test.*
import java.util.UUID

class PremiumSafetyTest {
    private class Billing : NativePurchasesEngine {
        lateinit var listener: (PremiumCustomer) -> Unit
        var next = PremiumCustomer(configured=true, entitled=true, customerId="A")
        var wait: ((NativePurchaseResult)->Unit)? = null
        override fun observe(listener:(PremiumCustomer)->Unit) { this.listener=listener; listener(next) }
        override fun execute(action:String,plan:String,completion:(NativePurchaseResult)->Unit) { listener(next); completion(NativePurchaseResult(cancelled=action=="purchase")) }
        override fun identify(userId:String?,completion:(NativePurchaseResult)->Unit) { wait=completion }
        override fun close()=Unit
    }
    @Test fun billingNeverTrustsOldAccountDuringIdentityChangeOrCanceledPurchase()=runBlocking {
        var uid:String?="A";val engine=Billing();val billing=NativePurchases(engine){uid};billing.initialize()
        // Initial callbacks are not admitted until the expected identity is set.
        assertFalse(billing.hasAccess)
        val identifying=launch(start=CoroutineStart.UNDISPATCHED){billing.identify("A")}
        engine.wait!!(NativePurchaseResult());identifying.join();assertTrue(billing.hasAccess)
        uid="B";assertFalse(billing.hasAccess)
        val changing=launch(start=CoroutineStart.UNDISPATCHED){billing.identify("B")}
        engine.listener(engine.next);assertFalse(billing.hasAccess)
        engine.next=engine.next.copy(customerId="B");engine.wait!!(NativePurchaseResult());changing.join();assertTrue(billing.hasAccess)
        assertTrue(billing.perform("purchase","monthly").cancelled)
        uid=null;assertFalse(billing.hasAccess)
        val signout=launch(start=CoroutineStart.UNDISPATCHED){billing.identify(null)}
        engine.next=engine.next.copy(customerId="anonymous-store-id",anonymous=true,entitled=false)
        engine.wait!!(NativePurchaseResult());signout.join();assertFalse(billing.hasAccess)
        billing.close()
    }
    @Test fun unconfiguredBillingCannotPurchaseRestoreOrGrantAccess()=runBlocking {
        val billing=NativePurchases(UnavailablePurchasesEngine);billing.initialize();billing.identify(null)
        assertFalse(billing.hasAccess);assertFalse(billing.state.value.configured)
        for(action in listOf("purchase","restore","manage")) assertNotNull(billing.perform(action).error)
        assertEquals(listOf(299,699,3999),PremiumPlan.entries.map{it.usdCents});billing.close()
    }
    private class Platform : AppPlatform {
        override val journalDriverFactory get()=error("test owns connection")
        override val storage=StorageManager(object:StorageBackend {
            val values=mutableMapOf<String,String>();override fun read(key:String)=values[key];override fun write(key:String,value:String){values[key]=value};override fun remove(key:String){values.remove(key)};override fun keys()=values.keys.toSet();override fun clear(){values.clear()}
        })
        override val haptics=DisabledHaptics
        override fun newId()=UUID.randomUUID().toString()
        override fun nowMillis()=1792497600000L
        override fun timeZone()=TimeZone.UTC
    }
    private fun store(block:suspend(SqlDelightJournalRepository,Platform)->Unit)=runBlocking {
        val driver=JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY);JournalSchema.create(driver);driver.execute(null,"PRAGMA user_version=${JournalSchema.version}",0);driver.execute(null,"PRAGMA foreign_keys=ON",0)
        val p=Platform();val repo=SqlDelightJournalRepository(JournalDriverFactory{driver},p::newId,p::nowMillis,Dispatchers.Unconfined);repo.initialize()
        try{block(repo,p)}finally{repo.close()}
    }
    @Test fun secondDogCommitRequiresCurrentAccessAndKeepsExistingDataAfterExpiry()=store{repo,p->
        var paid=false;val gated=PremiumDogJournalRepository(repo){paid};val first=gated.addDog("Milo")
        val event=gated.logEvent(first.id,CareEventType.Walk,p.nowMillis());repo.writeDocument("saved","kept",first.id)
        assertFailsWith<PremiumRequiredException>{gated.addDog("Luna")}
        paid=true;val id=p.newId();val second=gated.addDog("Luna",DogDetails(breed="Spaniel"),requestId=id)
        paid=false;assertEquals(second,gated.addDog("Luna",DogDetails(breed="Spaniel"),requestId=id))
        assertFailsWith<PremiumRequiredException>{gated.addDog("Third")}
        val afterExpiry=gated.logEvent(second.id,CareEventType.Meal,p.nowMillis());assertEquals(listOf(afterExpiry),gated.observeEvents(second.id).first())
        assertEquals(setOf(first,second),gated.observeDogs().first().toSet());assertEquals(listOf(event),gated.observeEvents(first.id).first());assertEquals("kept",repo.readDocument("saved"))
    }
    @Test fun savedPreviewFlagNeverGrantsReleaseLikeAccessOrSendsAI()=store{repo,p->
        val dog=repo.addDog("Milo");repo.writeDocument("companion-session","""{"premium":true}""")
        var requests=0;val provider=object:CompanionResponseProvider{override fun response(request:CompanionAiRequest)=flow{requests++;emit(CompanionReply("unused","atlas"))}}
        val c=CompanionController(repo,repo,repo,p,provider,Dispatchers.Unconfined);c.load(dog)
        assertFalse(c.hasPremium);assertFalse(c.state.value.premiumAccess)
        c.send("How can you help?",dog,emptyList());assertEquals(0,requests)
        assertFalse(c.beginAddDog(com.dracoarts.shared.presentation.navigation.AppState()));assertEquals(listOf(dog),repo.observeDogs().first());c.close()
    }
    @Test fun safetyReadsOnlySelectedDogWeekAndDiscardsResultAfterConsentChanges()=store{repo,p->
        val dog=repo.addDog("Milo",DogDetails(breed="Spaniel"));val other=repo.addDog("Luna")
        val recent=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis(),"Selected recent fact")
        repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis()-8L*86400000,"Old fact")
        repo.logEvent(other.id,CareEventType.Walk,p.nowMillis(),"Another dog fact")
        var state=CompanionState(dogId=dog.id,workspace=CompanionWorkspace(messageConsent=true,profileConsent=true,recordConsent=true,cloudConsent=true,weeklyConsentVersion=1))
        var captured:CompanionAiRequest?=null;var revoke=false
        val provider=object:CompanionResponseProvider{override fun response(request:CompanionAiRequest)=flow{captured=request;if(revoke)state=state.copy(workspace=CompanionWorkspace());emit(CompanionReply("For Milo, keep the exact product label ready and contact a veterinarian about any suspected exposure.","atlas"))}}
        var premium=false
        val ai=SafetyAiController(repo,p,provider,{state},{premium},{"firebase-user"})
        assertFailsWith<AiException>{ai.answer(dog.id,"chocolate",CompanionAiPurpose.ToxicityEducation)};assertNull(captured)
        premium=true;val answer=ai.answer(dog.id,"chocolate",CompanionAiPurpose.ToxicityEducation)
        assertEquals("atlas",answer.source);assertEquals("Milo",captured!!.profile!!.name)
        assertEquals(listOf(recent.id),captured!!.records.map{it.id});assertTrue(captured!!.allowCloud);assertTrue(captured!!.history.isEmpty())
        assertEquals(CompanionAiPurpose.ToxicityEducation,captured!!.purpose)
        revoke=true;assertFailsWith<AiException>{ai.answer(dog.id,"heat",CompanionAiPurpose.SafetyEducation)}
    }
    @Test fun educationalToxicityUsesRealProviderPathAndSameContextFeature()=runBlocking {
        var calls=0
        val identity=object:AtlasIdentity {
            override val currentUid="synthetic-user"
            override suspend fun token(forceRefresh:Boolean)=AtlasToken("test-only",currentUid)
        }
        val transport=object:AtlasTransport {
            override suspend fun post(body:String,token:String,requestId:String):AtlasHttpResponse {
                calls++;return AtlasHttpResponse(200,"""{"requestId":"ok","output":{"content":"For Milo, keep the product label ready. Contact a veterinarian about any suspected exposure."}}""","true",AtlasClient.FEATURE).also { capturedBody=body }
            }
            var capturedBody=""
        }
        val provider=AtlasResponseProvider(AtlasClient(identity,transport,true)){UUID.randomUUID().toString()}
        val profile=ProfileSnapshot("Milo","Male",DogContext())
        val request=CompanionAiRequest("Explain chocolate safety",profile,emptyList(),allowCloud=true,purpose=CompanionAiPurpose.ToxicityEducation)
        assertEquals("atlas",provider.response(request).first().source);assertEquals(1,calls)
        val sent=kotlinx.serialization.json.Json.parseToJsonElement(transport.capturedBody).toString()
        assertTrue(sent.contains(AtlasClient.FEATURE));assertTrue(sent.contains("constrained Safety Center education"))
        assertTrue(sent.contains("Milo"))
        assertEquals("safety",provider.response(request.copy(question="My dog ate chocolate",purpose=CompanionAiPurpose.Conversation)).first().source)
        assertEquals(1,calls)
    }
    @Test fun safetyWithholdsTreatmentAndFalseReassuranceRatherThanShowingSuccess()=store{repo,p->
        val dog=repo.addDog("Milo")
        val state=CompanionState(dogId=dog.id,workspace=CompanionWorkspace(messageConsent=true,profileConsent=true,recordConsent=true,cloudConsent=true,weeklyConsentVersion=1))
        for(answer in listOf("Give your dog 5 mg of a medicine.","It is safe to wait.","Induce vomiting now.")) {
            val provider=object:CompanionResponseProvider{override fun response(request:CompanionAiRequest)=flowOf(CompanionReply(answer,"atlas"))}
            val ai=SafetyAiController(repo,p,provider,{state},{true},{"synthetic-user"})
            assertFailsWith<AiException>{ai.answer(dog.id,"chocolate",CompanionAiPurpose.ToxicityEducation)}
        }
    }
    @Test fun directoryAndMapSearchHaveNoInventedLocalClinicOrHumanEmergencyNumber() {
        assertEquals(setOf("US","CA","GB","AU","NZ","SG"),EmergencyDirectory.countries.map{it.code}.toSet())
        assertTrue(EmergencyDirectory.forCountry("PK").isEmpty())
        EmergencyDirectory.contacts.forEach{assertTrue(it.source.startsWith("https://"));assertTrue(it.scope.contains("fees"));assertFalse(it.dialNumber in setOf("911","999","112"))}
        val url=NearbyVets.searchUrl("Paris, France & query=secret")
        assertTrue(url.startsWith("https://www.google.com/maps/search/?api=1&query="));assertFalse(url.contains("&query=secret"))
        assertFailsWith<IllegalArgumentException>{NearbyVets.searchUrl(" ")}
    }
}
