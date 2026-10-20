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
import kotlin.test.*

class CompanionTest {
    private class TestAuthentication : Authentication {
        val state = MutableStateFlow(AuthSnapshot())
        override val snapshot = state.asStateFlow()
        var failure: String? = null
        var wait: CompletableDeferred<Unit>? = null
        var requests = 0
        var lastAction = ""
        var receivedEmail = ""
        var receivedPassword = ""
        override suspend fun perform(action: String, provider: String, email: String, password: String) {
            lastAction = action; receivedEmail = email; receivedPassword = password
            requests++; wait?.await()
            failure?.let { throw AuthenticationException(it) }
            when (action) {
                "signIn", "completeEmail", "signInEmail", "createEmailAccount" -> state.value = AuthSnapshot(AuthUser("firebase-user", email.ifBlank { "caregiver@example.com" }, provider))
                "signOut", "delete" -> state.value = AuthSnapshot()
            }
        }
    }
    @Test fun passwordSignInIsExplicitKeepsSecretsTransientAndFailuresKeepJournal()=store {repo,_,p->
        val dog=repo.addDog("Milo");val event=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis())
        val c=controller(repo,p);c.load(dog);c.go(CompanionScreen.Email)
        assertFalse(c.signInEmail("invalid", "test-password"))
        assertFalse(c.signInEmail("owner@example.com", ""))
        assertFalse(c.signInEmail("owner@example.com", "short", createAccount=true))
        assertEquals(0,p.authentication.requests)
        p.authentication.failure="Email or password did not match"
        assertFalse(c.signInEmail("owner@example.com", "test-password"))
        assertEquals("signInEmail",p.authentication.lastAction);assertEquals(1,p.authentication.requests)
        assertFalse(c.state.value.session.signedIn);assertEquals(CompanionScreen.Email,c.state.value.route)
        // An invalid login never silently creates a new account.
        p.authentication.failure=null
        assertTrue(c.signInEmail(" owner@example.com ", "  exact-password  ", createAccount=true))
        assertEquals("createEmailAccount",p.authentication.lastAction)
        assertEquals("owner@example.com",p.authentication.receivedEmail);assertEquals("  exact-password  ",p.authentication.receivedPassword)
        assertTrue(c.state.value.session.signedIn)
        assertTrue(c.saveSession(c.state.value.session))
        assertTrue(c.continueTo(CompanionScreen.Ready))
        for (key in listOf("companion-session","companion-setup","companion-chat-${dog.id}")) {
            assertFalse(repo.readDocument(key).orEmpty().contains("exact-password"))
        }
        assertEquals(listOf(event),repo.observeEvents(dog.id).first());c.close()
    }
    @Test fun passwordResetDoesNotAuthenticateAndCanRetryAfterFailure()=store {repo,_,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog);c.go(CompanionScreen.Email)
        assertFalse(c.resetPassword("wrong"));assertEquals(0,p.authentication.requests)
        p.authentication.failure="Connect to reset your password"
        assertFalse(c.resetPassword("owner@example.com"));assertFalse(c.state.value.authBusy)
        p.authentication.failure=null
        assertTrue(c.resetPassword(" owner@example.com "))
        assertEquals("resetPassword",p.authentication.lastAction);assertEquals("",p.authentication.receivedPassword)
        assertFalse(c.state.value.session.signedIn);assertEquals(CompanionScreen.Email,c.state.value.route)
        assertEquals(listOf(dog),repo.observeDogs().first());c.close()
    }
    private class Platform : AppPlatform {
        override val premiumPreviewAllowed = true
        val authentication = TestAuthentication()
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
    private val immediate=object:CompanionResponseProvider {override fun response(request:CompanionAiRequest)=flowOf(CompanionReply("A demo reply from explicitly selected context.","demo"))}
    private fun controller(repo:SqlDelightJournalRepository,p:Platform,provider:CompanionResponseProvider=immediate)=CompanionController(repo,repo,repo,p,provider,Dispatchers.Unconfined,authentication=p.authentication)
    private suspend fun answer(c:CompanionController){withTimeout(4000){c.state.first {it.streaming==null&&it.workspace.thread?.messages?.lastOrNull()?.assistant==true}}}

    @Test fun atlasOnlyRequiresNewWeeklyConsentBeforeReadingOrSending()=store {repo,driver,p->
        val dog=repo.addDog("Milo")
        var calls=0
        val identity=object:com.dracoarts.shared.services.ai.AtlasIdentity {
            override val currentUid="signed-in-user"
            override suspend fun token(forceRefresh:Boolean)=com.dracoarts.shared.services.ai.AtlasToken("test-only",currentUid)
        }
        val transport=object:com.dracoarts.shared.services.ai.AtlasTransport {
            override suspend fun post(body:String,token:String,requestId:String):com.dracoarts.shared.services.ai.AtlasHttpResponse {
                calls++
                return com.dracoarts.shared.services.ai.AtlasHttpResponse(200,"""{"requestId":"ok","output":{"content":"Try a short game of fetch."}}""","true",com.dracoarts.shared.services.ai.AtlasClient.FEATURE)
            }
        }
        val c=controller(repo,p,AtlasResponseProvider(com.dracoarts.shared.services.ai.AtlasClient(identity,transport,true),p::newId))
        c.load(dog);c.saveSession(DemoSession(premium=true));c.updateWorkspace {it.copy(messageConsent=true,cloudConsent=false)}
        c.composerText("Enrichment ideas?\n");c.send(c.state.value.composer.text,dog,emptyList())
        assertEquals(CompanionScreen.AiPrivacy,c.state.value.route);assertEquals(0,calls)
        assertNull(c.state.value.workspace.thread);assertEquals("Enrichment ideas?\n",c.state.value.composer.text)
        c.updateAiContext {it.copy(cloudConsent=true)}
        // Earlier message-only consent must not silently become automatic weekly sharing.
        c.send(c.state.value.composer.text,dog,emptyList())
        assertEquals(0,calls);assertNull(c.state.value.workspace.thread)
        c.updateAiContext {it.copy(profileConsent=true,recordConsent=true,weeklyConsentVersion=1,week=true)}
        c.send(c.state.value.composer.text,dog,emptyList());answer(c)
        assertEquals(1,calls);assertEquals("",c.state.value.composer.text)
        val reply=c.state.value.workspace.thread!!.messages.last()
        assertEquals("atlas",reply.responseSource);assertEquals("Milo",reply.profile?.name)
        assertEquals(0,reply.weekly?.total);assertTrue(reply.records.isEmpty());assertNull(reply.readings)
        c.close()
    }

    @Test fun sendingClearsTheComposerOnlyAfterCommitAndKeepsTheNextDraftDuringInference()=store {repo,driver,p->
        val dog=repo.addDog("Milo")
        val release=CompletableDeferred<Unit>()
        val pending=object:CompanionResponseProvider {override fun response(request:CompanionAiRequest)=flow {
            release.await();emit(CompanionReply("A saved answer.","local"))
        }}
        val c=controller(repo,p,pending);c.load(dog);c.saveSession(DemoSession(premium=true));c.updateWorkspace {it.copy(messageConsent=true)}
        val typed="  General grooming tips?\n"
        c.composerText(typed);assertEquals(typed,c.state.value.composer.text)
        driver.execute(null,"CREATE TRIGGER reject_chat BEFORE INSERT ON local_documents WHEN NEW.id LIKE 'companion-chat-%' BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        c.send(typed,dog,emptyList())
        assertEquals(typed,c.state.value.composer.text);assertNull(c.state.value.workspace.thread);assertNotNull(c.state.value.error)
        driver.execute(null,"DROP TRIGGER reject_chat",0)
        c.send(typed,dog,emptyList())
        assertEquals("",c.state.value.composer.text);assertNull(repo.loadDraft(dog.id,"chat-composer-v1"))
        assertEquals(typed.trim(),c.state.value.workspace.thread!!.messages.single().text)
        assertNotNull(c.state.value.streaming)
        c.composerText("My next question\n");release.complete(Unit);answer(c)
        assertEquals("My next question\n",c.state.value.composer.text);c.close()
        val reopened=controller(repo,p);reopened.load(dog);assertEquals("My next question\n",reopened.state.value.composer.text);reopened.close()
    }

    @Test fun queuedKeystrokeCannotRestoreASentDraftAndSuggestedPromptsKeepTheDraft()=store {repo,_,p->
        val dog=repo.addDog("Milo")
        val tasks=ArrayDeque<Runnable>()
        val dispatcher=object:CoroutineDispatcher() {
            override fun dispatch(context:kotlin.coroutines.CoroutineContext,block:Runnable) {tasks.addLast(block)}
        }
        fun drain() {while(tasks.isNotEmpty())tasks.removeFirst().run()}
        val c=CompanionController(repo,repo,repo,p,immediate,dispatcher)
        c.load(dog);c.saveSession(DemoSession(premium=true));c.updateWorkspace {it.copy(messageConsent=true)};drain()
        c.composerText("  Sent question\n");c.send(c.state.value.composer.text,dog,emptyList())
        // Exercise a delayed disk-save job arriving after the Send transaction.
        tasks.removeLast().run();drain()
        assertEquals("",c.state.value.composer.text);assertNull(repo.loadDraft(dog.id,"chat-composer-v1"))
        c.composerText("Keep this draft");drain()
        c.send("Suggested question",dog,emptyList(),includeComposer=false);drain()
        assertEquals("Keep this draft",c.state.value.composer.text)
        c.regenerate(dog,emptyList());drain();assertEquals("Keep this draft",c.state.value.composer.text)
        val closing=CoroutineScope(Dispatchers.Unconfined).async {c.close()};drain();closing.await()
    }

    @Test fun revokingAtlasConsentCancelsPendingReplyAndRealSourceSurvivesRestart()=store {repo,_,p->
        val dog=repo.addDog("Milo")
        val started=CompletableDeferred<Unit>();val cancelled=CompletableDeferred<Unit>()
        val pending=object:CompanionResponseProvider {
            override fun response(request:CompanionAiRequest)=flow<CompanionReply> {
                assertTrue(request.allowCloud);started.complete(Unit)
                try {awaitCancellation()} finally {cancelled.complete(Unit)}
            }
        }
        val c=controller(repo,p,pending);c.load(dog);c.saveSession(DemoSession(premium=true))
        c.updateAiContext {it.copy(messageConsent=true,cloudConsent=true)}
        c.send("Summarize my chosen notes.",dog,emptyList());started.await()
        assertTrue(c.updateAiContext {it.copy(cloudConsent=false)})
        assertTrue(cancelled.isCompleted);assertNull(c.state.value.streaming)
        assertEquals(1,c.state.value.workspace.thread!!.messages.size);c.close()
        val real=object:CompanionResponseProvider {override fun response(request:CompanionAiRequest)=flowOf(CompanionReply("One walk was recorded.","local"))}
        val reopened=controller(repo,p,real);reopened.load(dog)
        assertFalse(reopened.state.value.workspace.cloudConsent)
        reopened.send("Summarize my chosen notes.",dog,emptyList());answer(reopened)
        assertEquals("local",reopened.state.value.workspace.thread!!.messages.last().responseSource);reopened.close()
        val restored=controller(repo,p);restored.load(dog)
        assertEquals("local",restored.state.value.workspace.thread!!.messages.last().responseSource)
        assertEquals("demo",kotlinx.serialization.json.Json.decodeFromString<CompanionMessage>("""{"id":"old","text":"Old example","assistant":true,"at":1}""").responseSource)
        restored.close()
    }

    @Test fun localRepliesAutomaticallyReadSavedDogContextOutsideTheCloudPickerDateRange()=store {repo,_,p->
        val dog=repo.addDog("Milo",DogDetails(companion=DogContext(breeds=listOf("Poodle"))))
        val other=repo.addDog("Luna")
        val oldTime=p.nowMillis()-30L*24*60*60*1000
        val walk=repo.createEvent(dog.id,p.newId(),CareEventInput(CareEventType.Walk,oldTime,details=CareDetails.Walk(17)))
        repo.logEvent(other.id,CareEventType.Walk,p.nowMillis(),"Other dog private fact")
        val captured=mutableListOf<CompanionAiRequest>()
        val local=object:CompanionResponseProvider { override fun response(request:CompanionAiRequest)=flowOf(CompanionReply("A walk lasting 17 minutes was recorded.","local")).also {captured+=request} }
        val c=controller(repo,p,local);c.load(dog);c.saveSession(DemoSession(premium=true))
        c.updateAiContext {it.copy(messageConsent=true,profileConsent=false,recordConsent=false,cloudConsent=false)}
        c.send("When was the last walk?",dog,emptyList());answer(c)
        val request=captured.single()
        assertNull(request.profile);assertTrue(request.records.isEmpty());assertFalse(request.allowCloud)
        assertEquals("Milo",request.localProfile!!.name)
        assertEquals(listOf(walk.id),request.localRecords.map {it.id});assertContains(request.localRecords.single().note,"17 minutes")
        assertEquals(oldTime,request.localRecords.single().at)
        val saved=c.state.value.workspace.thread!!.messages.last()
        assertEquals(request.localProfile,saved.profile);assertEquals(request.localRecords,saved.records)
        c.close()
        val reopened=controller(repo,p,local);reopened.load(dog)
        assertEquals(saved,reopened.state.value.workspace.thread!!.messages.last());reopened.close()
    }
    @Test fun emptyJournalStillSuppliesTheDogProfileAndAReadFailureIsNotEmptyContext()=store {repo,driver,p->
        val dog=repo.addDog("Milo")
        val captured=mutableListOf<CompanionAiRequest>()
        val local=object:CompanionResponseProvider { override fun response(request:CompanionAiRequest)=flowOf(CompanionReply("General care education.","local")).also {captured+=request} }
        val c=controller(repo,p,local);c.load(dog);c.saveSession(DemoSession(premium=true));c.updateAiContext {it.copy(messageConsent=true)}
        c.send("General grooming tips?",dog,emptyList());answer(c)
        assertEquals("Milo",captured.single().localProfile!!.name);assertTrue(captured.single().localRecords.isEmpty())
        driver.execute(null,"DROP TABLE care_events",0)
        c.send("General grooming tips?",dog,emptyList())
        withTimeout(4000) { c.state.first {it.error!=null&&!it.busy&&it.streaming==null} }
        assertEquals(1,captured.size);assertFalse(c.state.value.workspace.thread!!.messages.last().assistant)
        c.close()
    }
    @Test fun profileCustomMixesAndDraftsPersistWithoutTouchingAnExistingJournal()=store {repo,_,p->
        val dog=repo.addDog("Milo");val care=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis(),"Original walk")
        val c=controller(repo,p);c.load(dog);c.beginEdit(dog)
        val context=DogContext(years="3",months="2",breeds=listOf("Bully Kutta","Poodle","پاکستانی مکس"),goals=listOf("Remember daily care","Keep their memories"),topics=listOf("Daily routines","Walks & activity"),weight="23.4",foods=listOf("Dry food","Home-prepared"),allergies="Caregiver sensitivity note")
        c.editDraft {it.copy(context=context)};assertTrue(c.continueTo(CompanionScreen.ContextReview));val edited=c.commitDog()!!
        delay(350);assertNull(repo.readDocument("companion-setup"))
        assertEquals(context,edited.details.companion);assertEquals(listOf(care),repo.observeEvents(dog.id).first());c.close()
        val fresh=controller(repo,p);fresh.load(edited);assertEquals(context,fresh.state.value.draft.context);assertEquals(1,repo.observeDogs().first().size);fresh.close()
    }
    @Test fun anotherDogGetsFullIndependentSetupWithResumeAndSeparateAiContext()=store {repo,_,p->
        val first=repo.addDog("Milo",DogDetails(sex="Male",photoId="original.jpg",companion=DogContext(years="8",breeds=listOf("Poodle"),allergies="Milo only")))
        val walk=repo.logEvent(first.id,CareEventType.Walk,p.nowMillis(),"Milo’s walk")
        val firstSetup="""{"requestId":"preserved-first-setup","name":"Milo"}"""
        repo.writeDocument("companion-setup",firstSetup)
        val navigation=com.dracoarts.shared.presentation.navigation.AppState()
        val c=controller(repo,p);c.load(first);c.saveSession(DemoSession(premium=true))
        c.updateWorkspace {it.copy(messageConsent=true,profileConsent=true,recordConsent=true,cloudConsent=true,weeklyConsentVersion=1)}
        assertTrue(c.beginAddDog(navigation));val request=c.state.value.draft.requestId
        assertEquals(CompanionScreen.Dog,c.state.value.route)
        assertEquals("",c.state.value.draft.name);assertNull(c.state.value.draft.photoId)
        assertEquals("Not recorded",c.state.value.draft.sex);assertEquals(DogContext.catDefaults(),c.state.value.draft.context)
        assertNull(c.state.value.draft.editingDogId);assertNotEquals(first.id,request)
        val context=DogContext(stage="Puppy",years="1",months="2",breeds=listOf("Beagle","Mixed breed"),neutered="No",size="Small",weight="9.5",weightUnit="kg",experience="Dogs are my life",goals=listOf("Keep their memories"),routines=listOf("Every day is different"),topics=listOf("Training & play"),traits=listOf("Curious","Social"),activities=listOf("Sniff walks"),foods=listOf("Wet food"),allergies="Luna only",conditions="Caregiver condition note",medications="Existing vet instructions",careNotes="Prefers a quiet doorway",reminderDays=listOf(2,4),reminderTime="18:30")
        c.editDraft {it.copy(name="Luna",sex="Female",context=context)}
        for(id in CompanionController.dogSetupIds.drop(1).takeWhile {it!=CompanionScreen.CareNotes.boardId}) {
            val screen=CompanionScreen.fromBoard(id)!!
            assertTrue(c.continueTo(screen));assertEquals(screen,c.state.value.route)
        }
        assertTrue(c.continueTo(CompanionScreen.CareNotes))
        assertEquals(listOf(first),repo.observeDogs().first())
        assertTrue(c.pauseAddDog(navigation));assertNull(c.state.value.route);c.close()
        val resumed=controller(repo,p);resumed.load(first)
        assertNull(resumed.state.value.route);assertTrue(resumed.state.value.session.premium)
        assertTrue(resumed.beginAddDog(navigation));assertEquals(CompanionScreen.CareNotes,resumed.state.value.route)
        assertEquals(request,resumed.state.value.draft.requestId);assertEquals(context,resumed.state.value.draft.context)
        for(screen in listOf(CompanionScreen.Reminder,CompanionScreen.Permissions,CompanionScreen.ContextReview)) assertTrue(resumed.continueTo(screen))
        resumed.reviewDraftAt(CompanionScreen.Age);assertTrue(resumed.state.value.reviewingDraft)
        assertTrue(resumed.continueTo(CompanionScreen.ContextReview));assertFalse(resumed.state.value.reviewingDraft)
        val second=resumed.commitDog()!!
        assertEquals("Luna",second.name);assertEquals(context,second.details.companion);assertEquals("Female",second.details.sex)
        assertEquals("Beagle × Mixed breed",second.details.breed);assertEquals(context.ageLabel(),second.details.age)
        assertEquals(first,repo.observeDogs().first().first {it.id==first.id});assertEquals(listOf(walk),repo.observeEvents(first.id).first())
        assertNull(repo.readDocument("companion-add-dog"));assertEquals(firstSetup,repo.readDocument("companion-setup"))
        resumed.activateDog(second.id);assertFalse(resumed.state.value.workspace.weeklyAllowed);assertTrue(resumed.state.value.workspace.threads.isEmpty())
        val weekly=prepareWeeklyContext(repo,second.id,"How are Luna’s walks?",p.nowMillis(),p.timeZone())
        assertEquals("Luna",weekly.profile.name);assertEquals(0,weekly.weekly.total);assertTrue(weekly.records.isEmpty())
        resumed.enterJournal(navigation);assertNull(resumed.state.value.route);assertTrue(navigation.featureStack.isEmpty())
        assertEquals(0,p.authentication.requests)
        assertTrue(resumed.beginAddDog(navigation));assertEquals("",resumed.state.value.draft.name)
        assertNotEquals(request,resumed.state.value.draft.requestId);resumed.close()
    }
    @Test fun fiveTabSelectionClearsOverlayInOneDeferredTransition()=store {repo,_,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog)
        val queued=mutableListOf<()->Unit>()
        val handler:com.dracoarts.shared.presentation.navigation.BoardNavigationHandler={move,action->
            assertEquals(com.dracoarts.shared.presentation.navigation.BoardNavigationMove.Tab,move)
            queued+=action
        }
        try {
            for(start in com.dracoarts.shared.presentation.navigation.Route.dockRoutes.filter {it!=com.dracoarts.shared.presentation.navigation.Route.Profile}) {
                val navigation=com.dracoarts.shared.presentation.navigation.AppState(start)
                navigation.navigationHandler=handler;c.navigationHandler=handler
                c.navigateTab(navigation,com.dracoarts.shared.presentation.navigation.Route.Profile)
                assertEquals(1,queued.size);assertEquals(start,navigation.route);assertNull(c.state.value.route)
                queued.removeAt(0).invoke()
                assertEquals(com.dracoarts.shared.presentation.navigation.Route.Profile,navigation.route)
                assertNull(c.state.value.route)
                assertEquals(navigation.route,com.dracoarts.shared.presentation.navigation.AppState.restoreValue(navigation.savedValue()).route)
                c.navigateTab(navigation,start);assertEquals(1,queued.size)
                queued.removeAt(0).invoke();assertEquals(start,navigation.route);assertNull(c.state.value.route)
            }
            assertEquals(listOf(dog),repo.observeDogs().first())
        } finally {c.close()}
    }
    @Test fun committedAdditionalDogOpensBeforeTheScreenObserverRefreshes()=store {repo,_,p->
        val first=repo.addDog("Milo")
        val oldWalk=repo.logEvent(first.id,CareEventType.Walk,p.nowMillis())
        val held=CompletableDeferred<Unit>();val release=CompletableDeferred<Unit>()
        var reads=0
        val delayed=object:JournalRepository by repo {
            override fun observeDogs():Flow<List<Dog>> {
                if(reads++>0) return repo.observeDogs()
                return repo.observeDogs().transform { dogs ->
                    if(dogs.size>1) {held.complete(Unit);release.await()}
                    emit(dogs)
                }
            }
        }
        val journal=com.dracoarts.shared.presentation.state.JournalController(delayed,p.storage,p.haptics,p::nowMillis)
        coroutineScope {
            val observer=launch(start=CoroutineStart.UNDISPATCHED) {journal.observe()}
            val c=controller(repo,p)
            try {
                withTimeout(3000) {journal.state.first {!it.loading&&it.selectedDogId==first.id}}
                c.load(first);c.saveSession(DemoSession(premium=true));assertTrue(c.beginAddDog(com.dracoarts.shared.presentation.navigation.AppState()))
                c.editDraft {it.copy(name="Luna")};val added=c.commitDog()!!
                withTimeout(3000) {held.await()}
                assertEquals(listOf(first),journal.state.value.dogs)
                assertTrue(journal.selectDog(added.id))
                assertEquals(added,journal.state.value.selectedDog)
                assertTrue(journal.state.value.events.isEmpty())
                release.complete(Unit)
                withTimeout(3000) {journal.state.first {!it.loading&&it.selectedDogId==added.id}}
                assertEquals(0,journal.state.value.totalCount)
                assertEquals(listOf(oldWalk),repo.observeEvents(first.id).first())
                assertEquals(added.id,p.storage.getString(com.dracoarts.shared.presentation.state.JournalController.SELECTED_DOG_KEY))
            } finally {release.complete(Unit);observer.cancelAndJoin();c.close()}
        }
    }
    @Test fun anotherDogWriteFailureAndCleanupRetryNeverOverwriteOrDuplicateDogs()=store {repo,driver,p->
        val first=repo.addDog("Milo");val c=controller(repo,p);c.load(first)
        c.saveSession(DemoSession(premium=true))
        assertTrue(c.beginAddDog(com.dracoarts.shared.presentation.navigation.AppState()))
        c.editDraft {it.copy(name="Luna")};assertTrue(c.continueTo(CompanionScreen.ContextReview))
        driver.execute(null,"CREATE TRIGGER reject_dog BEFORE INSERT ON dogs BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertNull(c.commitDog());assertFalse(c.state.value.profileSaving);assertNotNull(c.state.value.error)
        assertEquals(listOf(first),repo.observeDogs().first());assertNotNull(repo.readDocument("companion-add-dog"))
        driver.execute(null,"DROP TRIGGER reject_dog",0)
        driver.execute(null,"CREATE TRIGGER reject_cleanup BEFORE DELETE ON local_documents WHEN OLD.id='companion-add-dog' BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertNull(c.commitDog());assertEquals(2,repo.observeDogs().first().size);assertNotNull(c.state.value.error)
        driver.execute(null,"DROP TRIGGER reject_cleanup",0)
        val second=c.commitDog()!!;assertEquals(second,c.commitDog())
        assertEquals(2,repo.observeDogs().first().size);assertEquals(first,repo.observeDogs().first().first {it.id==first.id})
        assertNull(repo.readDocument("companion-add-dog"));c.close()
    }
    @Test fun invalidSetupCannotCreateDogAndDocumentFailureDoesNotPublishSuccess()=store {repo,driver,p->
        val c=controller(repo,p);c.load(null);c.editDraft {it.copy(name="Milo",context=it.context.copy(months="12"))};assertNull(c.commitDog());assertTrue(repo.observeDogs().first().isEmpty())
        driver.execute(null,"CREATE TRIGGER reject_documents BEFORE INSERT ON local_documents BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertFalse(c.tryDemoPremium());assertFalse(c.state.value.session.premium);assertNotNull(c.state.value.error);c.close()
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
        val slow=object:CompanionResponseProvider {override fun response(request:CompanionAiRequest)=flow {emit(CompanionReply("Partial demo response","demo"));delay(100000)}}
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
        val provider=DemoResponseProvider();assertTrue(provider.response(CompanionAiRequest("What breed is my dog?",null,emptyList())).last().text.contains("isn’t included"));assertTrue(provider.response(CompanionAiRequest("My dog ate chocolate",null,emptyList())).last().text.contains("veterinarian"));assertTrue(provider.response(CompanionAiRequest("What dose?",null,emptyList())).last().text.contains("can’t diagnose"))
        assertFailsWith<IllegalArgumentException>{DogContext(weight="-1").validate()};assertFailsWith<IllegalArgumentException>{DogContext(breeds=listOf("Poodle","poodle")).validate()};assertEquals("",DogContext().ageLabel());assertEquals("0 years",DogContext(years="0").ageLabel())
    }
    @Test fun chatPhotosTransferAtomicallyFromDraftAndCleanupAfterConversationDeletion()=store {repo,driver,p->
        val dog=repo.addDog("Milo");val other=repo.addDog("Luna")
        val value="""{"text":"A caregiver observation","photoIds":["chat-one.jpg"]}"""
        repo.saveDraft(dog.id,"chat-composer-v1",LocalDraft(value,listOf("chat-one.jpg")))
        val c=controller(repo,p);c.load(dog);assertEquals(listOf("chat-one.jpg"),c.state.value.composer.photoIds)
        c.saveSession(DemoSession(premium=true));c.updateWorkspace {it.copy(messageConsent=true)}
        c.send("When was the last walk?",dog,emptyList(),includeComposer=false);answer(c)
        assertEquals(listOf("chat-one.jpg"),c.state.value.composer.photoIds);assertNotNull(repo.loadDraft(dog.id,"chat-composer-v1"))
        assertTrue(c.state.value.workspace.thread!!.messages.first().photoIds.isEmpty());assertTrue(c.newThread())
        driver.execute(null,"CREATE TRIGGER reject_chat BEFORE INSERT ON local_documents WHEN NEW.id LIKE 'companion-chat-%' BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        c.send("A caregiver observation",dog,emptyList());assertNotNull(c.state.value.error);assertFalse(c.state.value.busy)
        assertNotNull(repo.loadDraft(dog.id,"chat-composer-v1"));assertNull(c.state.value.workspace.thread);assertTrue(repo.photoReferenced("chat-one.jpg"))
        driver.execute(null,"DROP TRIGGER reject_chat",0)
        c.send("A caregiver observation",dog,emptyList());answer(c)
        assertNull(repo.loadDraft(dog.id,"chat-composer-v1"));assertEquals(listOf("chat-one.jpg"),c.state.value.workspace.thread!!.messages.first().photoIds);assertTrue(repo.photoReferenced("chat-one.jpg"))
        c.close();val fresh=controller(repo,p);fresh.load(dog);assertEquals(listOf("chat-one.jpg"),fresh.state.value.workspace.thread!!.messages.first().photoIds)
        fresh.activateDog(other.id);assertTrue(fresh.state.value.composer.photoIds.isEmpty());assertTrue(fresh.state.value.workspace.threads.isEmpty())
        fresh.activateDog(dog.id);fresh.deleteThread(fresh.state.value.workspace.currentThread!!)
        assertFalse(repo.photoReferenced("chat-one.jpg"));assertTrue(repo.pendingCleanup().any {it.reference=="chat-one.jpg"});fresh.close()
    }
    @Test fun vetReportSeparatesObservationsFromOptInAiAndFiltersOtherDogs()=store {repo,_,p->
        val dog=repo.addDog("Milo");val other=repo.addDog("Luna")
        val own=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis(),"Own record")
        val foreign=repo.logEvent(other.id,CareEventType.Meal,p.nowMillis(),"Private other dog")
        val messages=listOf(CompanionMessage("u","Caregiver observation",false,p.nowMillis(),photoIds=listOf("chat-one.jpg")),CompanionMessage("a","Unverified AI words",true,p.nowMillis()))
        val plain=chatVetReport(dog,false,listOf(own,foreign),messages,false,false,TimeZone.UTC,"vet.pdf")
        assertTrue(plain.lines.any {"Caregiver observation" in it});assertFalse(plain.lines.any {"Unverified AI words" in it || "Private other dog" in it});assertTrue(plain.images.isEmpty())
        val full=chatVetReport(dog,true,listOf(own),messages,true,true,TimeZone.UTC,"vet.pdf")
        assertTrue(full.lines.any {"optional and unverified" in it});assertTrue(full.lines.any {"Unverified AI words" in it});assertEquals(listOf("chat-one.jpg"),full.images.map {it.fileId})
    }
    @Test fun medicationEducationAndPremiumGateNeverPrescribeOrLoseChatRoute()=store {repo,_,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog);c.go(CompanionScreen.ThreadReadonly)
        assertFalse(c.requestPremium(PremiumFeature.ReportPdf));assertEquals(CompanionScreen.Paywall,c.state.value.route)
        c.dismissPremium();assertEquals(CompanionScreen.ThreadReadonly,c.state.value.route)
        val provider=DemoResponseProvider()
        assertTrue(provider.response(CompanionAiRequest("What questions should I ask about medication side effects?",null,emptyList())).last().text.contains("follow your veterinarian’s label"))
        assertTrue(provider.response(CompanionAiRequest("What medication should I use?",null,emptyList())).last().text.contains("can’t diagnose"))
        assertTrue(ChatHealth.urgent("My dog collapsed"));assertTrue(ChatHealth.treatment("Tell me a dose"));c.close()
    }
    @Test fun savedDemoIdentityNeverAuthenticatesAndSdkIdentityNeverPersistsInJournal()=store {repo,_,p->
        val dog=repo.addDog("Milo")
        repo.writeDocument("companion-session", """{"signedIn":true,"provider":"Apple","email":"old-demo@example.com","premium":true}""")
        val c=controller(repo,p);c.load(dog)
        assertFalse(c.state.value.session.signedIn);assertEquals("",c.state.value.session.email);assertTrue(c.state.value.session.premium)
        assertTrue(c.signIn("Google"));assertTrue(c.state.value.session.signedIn);assertEquals("Google",c.state.value.session.provider)
        c.saveSession(c.state.value.session)
        val saved=repo.readDocument("companion-session")!!
        assertFalse("caregiver@example.com" in saved);assertFalse("firebase-user" in saved);assertFalse("Google" in saved)
        c.close();val reopened=controller(repo,p);reopened.load(dog);assertTrue(reopened.state.value.session.signedIn)
        reopened.signOut();assertFalse(reopened.state.value.session.signedIn);assertEquals(listOf(dog),repo.observeDogs().first());reopened.close()
    }
    @Test fun failedAuthenticationAndDeletionKeepJournalAndConversationsAndCanRetry()=store {repo,_,p->
        val dog=repo.addDog("Milo");val event=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis())
        repo.writeDocument("companion-chat-${dog.id}","{}",dog.id)
        val c=controller(repo,p);c.load(dog);c.go(CompanionScreen.Email)
        p.authentication.failure="Provider disabled"
        assertFalse(c.sendEmailLink("caregiver@example.com"));assertEquals(CompanionScreen.Email,c.state.value.route)
        assertFalse(c.signIn("Google"));assertFalse(c.state.value.session.signedIn);assertFalse(c.state.value.authBusy)
        p.authentication.failure=null;assertTrue(c.signIn("Google"));p.authentication.failure="Connect to delete your account"
        assertFalse(c.deleteAccount());assertTrue(c.state.value.session.signedIn);assertNotNull(repo.readDocument("companion-chat-${dog.id}"))
        assertEquals(listOf(event),repo.observeEvents(dog.id).first())
        p.authentication.failure=null;assertTrue(c.deleteAccount());assertFalse(c.state.value.session.signedIn)
        assertNull(repo.readDocument("companion-chat-${dog.id}"));assertEquals(listOf(event),repo.observeEvents(dog.id).first());c.close()
    }
    @Test fun localCleanupFailureAfterCloudDeletionCanRetryWithoutDeletingAnotherAccount()=store {repo,driver,p->
        val dog=repo.addDog("Milo");repo.writeDocument("companion-chat-${dog.id}","{}",dog.id)
        val c=controller(repo,p);c.load(dog);assertTrue(c.signIn("Google"))
        driver.execute(null,"CREATE TRIGGER reject_delete BEFORE DELETE ON local_documents BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertFalse(c.deleteAccount());assertFalse(c.state.value.session.signedIn)
        assertNotNull(repo.readDocument("companion-chat-${dog.id}"));assertTrue(c.state.value.error!!.contains("account was deleted"))
        val calls=p.authentication.requests
        driver.execute(null,"DROP TRIGGER reject_delete",0)
        assertTrue(c.deleteAccount());assertEquals(calls,p.authentication.requests)
        assertNull(repo.readDocument("companion-chat-${dog.id}"));assertEquals(listOf(dog),repo.observeDogs().first());c.close()
    }
    @Test fun incomingEmailLinkRequiresCompletionAndSurvivesControllerReload()=store {repo,_,p->
        val dog=repo.addDog("Milo");p.authentication.state.value=AuthSnapshot(emailLinkPending=true)
        val c=controller(repo,p);c.load(dog)
        assertTrue(c.state.value.emailLinkPending);assertFalse(c.state.value.session.signedIn)
        assertEquals(CompanionScreen.CheckEmail,c.state.value.route)
        c.load(dog);assertTrue(c.state.value.emailLinkPending);assertEquals(CompanionScreen.CheckEmail,c.state.value.route)
        assertFalse(c.sendEmailLink("wrong"));assertEquals(0,p.authentication.requests)
        p.authentication.state.value=AuthSnapshot(AuthUser("verified-uid","owner@example.com","Email"))
        assertTrue(c.state.value.session.signedIn);assertFalse(c.state.value.emailLinkPending);assertNull(c.state.value.route)
        assertEquals(listOf(dog),repo.observeDogs().first());c.close()
    }
    @Test fun repeatedAuthenticationTapsAndCancellationDoNotPublishSuccess()=store {repo,_,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog)
        p.authentication.wait=CompletableDeferred()
        val first=CoroutineScope(Dispatchers.Unconfined).launch { c.signIn("Google") }
        assertTrue(c.state.value.authBusy);assertFalse(c.signIn("Apple"));assertEquals(1,p.authentication.requests)
        first.cancelAndJoin();assertFalse(c.state.value.authBusy);assertFalse(c.state.value.session.signedIn)
        p.authentication.wait=null;assertTrue(c.sendEmailLink("caregiver@example.com"));assertEquals(CompanionScreen.CheckEmail,c.state.value.route)
        assertFalse(c.state.value.session.signedIn);c.close()
    }
    @Test fun allCompanionBoardRoutesExist() {
        assertEquals(55,CompanionScreen.entries.size);assertEquals(55,CompanionScreen.entries.map {it.boardId}.distinct().size)
    }
    @Test fun legacyHomeAndReportReviewKeepCompanionWhileOldFirstRunRemainsReviewable() {
        for (screen in listOf(null, "Home", "home", "report-preview", "export-progress", "memory-share")) {
            assertTrue(companionAvailable(true, screen, true), "Existing journal: $screen")
        }
        assertFalse(companionAvailable(true, "opening-value", false))
        assertTrue(companionAvailable(true, "next-opening", false))
        assertTrue(companionAvailable(false, null, false))
    }
    @Test fun premiumExportRequestReturnsToItsExistingPreviewAndNeverChangesCare()=store {repo,_,p->
        val dog=repo.addDog("Milo");val record=repo.logEvent(dog.id,CareEventType.Walk,p.nowMillis())
        val c=controller(repo,p);c.load(dog)
        for(feature in PremiumFeature.entries) {
            assertFalse(c.requestPremium(feature));assertEquals(feature,c.state.value.premiumFeature)
            assertEquals(CompanionScreen.Paywall,c.state.value.route)
            c.dismissPremium();assertNull(c.state.value.route);assertNull(c.state.value.premiumFeature)
        }
        c.requestPremium(PremiumFeature.ReportPdf);assertTrue(c.tryDemoPremium())
        assertTrue(c.state.value.session.premium);assertNull(c.state.value.route);assertNull(c.state.value.premiumFeature)
        assertTrue(c.requestPremium(PremiumFeature.MemoryBookPdf));assertNull(c.state.value.route)
        c.saveSession(c.state.value.session.copy(premium=false))
        assertFalse(c.requestPremium(PremiumFeature.ReportPdf))
        assertEquals(listOf(record),repo.observeEvents(dog.id).first());c.close()
    }
    @Test fun failedDemoUpgradeCannotAllowAnExportOrDiscardItsReturnDestination()=store {repo,driver,p->
        val dog=repo.addDog("Milo");val c=controller(repo,p);c.load(dog)
        c.requestPremium(PremiumFeature.ReportPdf)
        driver.execute(null,"CREATE TRIGGER reject_upgrade BEFORE INSERT ON local_documents BEGIN SELECT RAISE(ABORT,'disk failure');END",0)
        assertFalse(c.tryDemoPremium());assertFalse(c.state.value.session.premium)
        assertEquals(PremiumFeature.ReportPdf,c.state.value.premiumFeature)
        assertEquals(CompanionScreen.Paywall,c.state.value.route);assertNotNull(c.state.value.error);c.close()
    }
}
