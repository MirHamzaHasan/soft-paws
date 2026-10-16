package com.draco.arts.apps.bark.log.dogs.journal

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dracoarts.shared.data.local.*
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.domain.repository.*
import com.dracoarts.shared.managers.*
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.datetime.TimeZone
import java.util.UUID
import kotlin.random.Random
import kotlin.test.*

class CompanionTest {
    private class Platform : AppPlatform {
        override val journalDriverFactory get() = error("The test owns the separate SQLite connection")
        override val haptics = DisabledHaptics
        override val storage = StorageManager(object: StorageBackend {
            private val data=mutableMapOf<String,String>()
            override fun read(key:String)=data[key]
            override fun write(key:String,value:String){data[key]=value}
            override fun remove(key:String){data.remove(key)}
            override fun keys()=data.keys.toSet()
            override fun clear(){data.clear()}
        })
        override fun newId()=UUID.randomUUID().toString()
        override fun nowMillis()=1792152000000L
        override fun timeZone()=TimeZone.UTC
    }
    private fun store(block:suspend (SqlDelightJournalRepository,SqlDriver,Platform)->Unit)=runBlocking {
        val driver=JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY);JournalSchema.create(driver);driver.execute(null,"PRAGMA user_version=${JournalSchema.version}",0);driver.execute(null,"PRAGMA foreign_keys=ON",0)
        val platform=Platform();val repo=SqlDelightJournalRepository(JournalDriverFactory {driver},platform::newId,platform::nowMillis,Dispatchers.Unconfined);repo.initialize()
        try {block(repo,driver,platform)} finally {repo.close()}
    }
    private val immediate=object:CompanionResponseProvider {override fun response(question:String,profile:ProfileSnapshot?,records:List<SourceRecord>)=flowOf("A demo reply from explicitly selected context.")}
    private fun controller(repo:SqlDelightJournalRepository,p:Platform,provider:CompanionResponseProvider=immediate)=CompanionController(repo,repo,repo,p,provider,Dispatchers.Unconfined)
    private suspend fun answer(c:CompanionController){withTimeout(4000){c.state.first {it.streaming==null&&it.workspace.thread?.messages?.lastOrNull()?.assistant==true}}}

    @Test fun profileCustomMixesAndDraftsPersistWithoutTouchingAnExistingJournal()=store {repo,_,p->
        val dog=repo.addDog("Milo");val care=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis(),"Original walk")
        val c=controller(repo,p);c.load(dog);c.beginEdit(dog)
        val context=DogContext(years="3",months="2",breeds=listOf("Bully Kutta","Poodle","پاکستانی مکس"),goals=listOf("Remember daily care","Keep their memories"),topics=listOf("Daily routines","Walks & activity"),weight="23.4",foods=listOf("Dry food","Home-prepared"),allergies="Caregiver sensitivity note")
        c.editDraft {it.copy(context=context)};assertTrue(c.continueTo(CompanionScreen.ContextReview));val edited=c.commitDog()!!
        delay(350);assertNull(repo.readDocument("companion-setup"))
        assertEquals(context,edited.details.companion);assertEquals(listOf(care),repo.observeEvents(dog.id).first());c.close()
        val fresh=controller(repo,p);fresh.load(edited);assertEquals(context,fresh.state.value.draft.context);assertEquals(1,repo.observeDogs().first().size);fresh.close()
    }
    @Test fun invalidSetupCannotCreateDogAndDocumentFailureDoesNotPublishSuccess()=store {repo,driver,p->
        val c=controller(repo,p);c.load(null);c.editDraft {it.copy(name="Milo",context=it.context.copy(months="12"))};assertNull(c.commitDog());assertTrue(repo.observeDogs().first().isEmpty())
        driver.execute(null,"CREATE TRIGGER reject_documents BEFORE INSERT ON local_documents BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertFalse(c.signIn("Apple"));assertFalse(c.state.value.session.signedIn);assertNotNull(c.state.value.error);c.close()
    }
    @Test fun interruptedProfileEditPreservesExistingCareContactsAndGuestJournalAccess()=store {repo,_,p->
        val dog=repo.addDog("Milo",DogDetails(vetName="Family vet",vetPhone="+92 300 1234567",notes="Original caregiver notes",emergencyServiceName="Local emergency clinic"))
        val c=controller(repo,p);c.load(dog);assertNull(c.state.value.route);c.beginEdit(dog);c.editDraft {it.copy(context=it.context.copy(breeds=listOf("Poodle")))};assertTrue(c.continueTo(CompanionScreen.ContextReview));c.close()
        val reopened=controller(repo,p);reopened.load(dog);assertEquals(dog.id,reopened.state.value.draft.editingDogId)
        val saved=reopened.commitDog()!!;assertEquals(dog.details.vetName,saved.details.vetName);assertEquals(dog.details.vetPhone,saved.details.vetPhone);assertEquals(dog.details.notes,saved.details.notes);assertEquals(dog.details.emergencyServiceName,saved.details.emergencyServiceName);assertEquals(listOf("Poodle"),saved.details.companion.breeds);reopened.close()
    }
    @Test fun explicitSourcesAreDogScopedAndSnapshotSurvivesProfileEditsAndRestart()=store {repo,_,p->
        val dog=repo.addDog("Milo",DogDetails(companion=DogContext(breeds=listOf("Poodle"),allergies="Original note")));val other=repo.addDog("Luna")
        val walk=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis(),"Original walk");val meal=repo.logEvent(other.id,CareEventType.Meal,p.nowMillis(),"Other dog")
        val c=controller(repo,p);c.load(dog);c.saveSession(DemoSession(true,"Apple",premium=true));c.updateWorkspace {it.copy(messageConsent=true,profileConsent=true,recordConsent=true,selectedRecords=listOf(walk.id,meal.id))};c.send("What happened today?",dog,listOf(walk,meal));answer(c)
        val message=c.state.value.workspace.thread!!.messages.last();assertEquals(listOf(walk.id),message.records.map {it.id});assertEquals("Original note",message.profile!!.context.allergies)
        repo.updateDog(dog,dog.name,dog.details.copy(companion=dog.details.companion.copy(allergies="Changed note")));c.close()
        val fresh=controller(repo,p);fresh.load(repo.observeDogs().first().first {it.id==dog.id});assertEquals("Original note",fresh.state.value.workspace.thread!!.messages.last().profile!!.context.allergies)
        fresh.updateWorkspace {it.copy(profileConsent=false,recordConsent=false)};fresh.send("What happened today?",dog,listOf(walk));answer(fresh);assertNull(fresh.state.value.workspace.thread!!.messages.last().profile);assertTrue(fresh.state.value.workspace.thread!!.messages.last().records.isEmpty());fresh.close()
    }
    @Test fun stopAndRegenerateSaveOnceAndSignOutRetainsTheCareJournal()=store {repo,_,p->
        val dog=repo.addDog("Milo");repo.logEvent(dog.id,CareEventType.Pee,p.nowMillis())
        val slow=object:CompanionResponseProvider {override fun response(question:String,profile:ProfileSnapshot?,records:List<SourceRecord>)=flow {emit("Partial demo response");delay(100000)}}
        val c=controller(repo,p,slow);c.load(dog);c.saveSession(DemoSession(true,"Email","caregiver@example.com",true));c.updateWorkspace {it.copy(messageConsent=true,profileConsent=true)};c.send("Hello",dog,emptyList());withTimeout(3000){c.state.first {it.streaming!=null}};c.stopReply();answer(c)
        val message=c.state.value.workspace.thread!!.messages.last();assertTrue(message.stopped);assertNull(message.profile);c.signOut();assertEquals(1,repo.observeEvents(dog.id).first().size);assertEquals(2,c.state.value.workspace.thread!!.messages.size);c.close()
        val fresh=controller(repo,p);fresh.load(dog);fresh.saveSession(DemoSession(true,"Apple",premium=true));fresh.regenerate(dog,emptyList());answer(fresh);assertEquals(2,fresh.state.value.workspace.thread!!.messages.size);fresh.close()
    }
    @Test fun accountDeletionClearsDemoConversationsAcrossDogsAndPreservesCare()=store {repo,_,p->
        val a=repo.addDog("Milo");val b=repo.addDog("Luna");repo.logEvent(a.id,CareEventType.Meal,p.nowMillis());repo.writeDocument("companion-chat-${a.id}","{}",a.id);repo.writeDocument("companion-chat-${b.id}","{}",b.id)
        val c=controller(repo,p);c.load(a);c.signIn("Google");assertTrue(c.deleteAccount());assertNull(repo.readDocument("companion-chat-${a.id}"));assertNull(repo.readDocument("companion-chat-${b.id}"));assertEquals(2,repo.observeDogs().first().size);assertEquals(1,repo.observeEvents(a.id).first().size);c.close()
    }
    @Test fun startingAnotherConversationNeverSilentlyDropsOlderHistory()=store {repo,_,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog);c.saveSession(DemoSession(true,"Apple",premium=true))
        val history=List(51){CompanionThread("thread-$it","Question $it")}
        c.updateWorkspace {it.copy(messageConsent=true,threads=history,currentThread=null)};c.send("A new question",dog,emptyList());answer(c)
        assertEquals(52,c.state.value.workspace.threads.size);assertTrue(c.state.value.workspace.threads.containsAll(history));c.close()
        val reopened=controller(repo,p);reopened.load(dog);assertEquals(52,reopened.state.value.workspace.threads.size);reopened.close()
    }
    @Test fun dogDeletionRemovesOnlyItsDocumentsAndBadReadIsNotTreatedAsEmptyData()=store {repo,_,p->
        val a=repo.addDog("Milo");val b=repo.addDog("Luna");repo.writeDocument("companion-chat-${a.id}","{}",a.id);repo.writeDocument("companion-chat-${b.id}","{}",b.id);repo.deleteDog(a.id);assertNull(repo.readDocument("companion-chat-${a.id}"));assertNotNull(repo.readDocument("companion-chat-${b.id}"))
        repo.writeDocument("companion-session","{\"signedIn\":\"broken\"}");val c=controller(repo,p);c.load(b);assertTrue(c.state.value.loadFailed);assertNotNull(c.state.value.error);c.close()
    }
    @Test fun sourceConsentAndClinicalBoundariesRemainExplicit()=runBlocking {
        val provider=DemoResponseProvider();assertTrue(provider.response("What breed is my dog?",null,emptyList()).last().contains("isn’t included"));assertTrue(provider.response("My dog ate chocolate",null,emptyList()).last().contains("veterinarian"));assertTrue(provider.response("What dose?",null,emptyList()).last().contains("can’t diagnose"))
        assertFailsWith<IllegalArgumentException>{DogContext(weight="-1").validate()};assertFailsWith<IllegalArgumentException>{DogContext(breeds=listOf("Poodle","poodle")).validate()};assertEquals("",DogContext().ageLabel());assertEquals("0 years",DogContext(years="0").ageLabel())
    }
    @Test fun allBoardRoutesExistAndMascotBagAndRestPosesAreDeterministic() {
        assertEquals(54,CompanionScreen.entries.size);assertEquals(54,CompanionScreen.entries.map {it.boardId}.distinct().size)
        val bag=MascotShuffle(Random(42));val values=List(60){bag.next()};values.chunked(6).forEach {assertEquals(6,it.distinct().size)};values.zipWithNext().forEach {(a,b)->assertNotEquals(a,b)}
        val from=MascotPose(head=8f,tail=-6f,paw=-20f,eye=.7f)
        MascotAction.entries.forEach {action ->assertEquals(from,mascotPose(action,0f,from));assertEquals(MascotPose(),mascotPose(action,(action.duration+150).toFloat(),from))}
    }
}
