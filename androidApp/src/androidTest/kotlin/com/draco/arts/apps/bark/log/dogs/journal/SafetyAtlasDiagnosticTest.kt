package com.draco.arts.apps.bark.log.dogs.journal

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.dracoarts.shared.domain.model.DogContext
import com.dracoarts.shared.presentation.companion.*
import com.dracoarts.shared.services.ai.*
import com.google.firebase.auth.FirebaseAuth
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import kotlinx.serialization.json.*
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.util.UUID

/** Explicitly enabled, synthetic context only; never reads a journal or prints identity/token. */
@RunWith(AndroidJUnit4::class)
class SafetyAtlasDiagnosticTest {
    @Test fun captureSyntheticSafetyAdmission()=runBlocking {
        assumeTrue(InstrumentationRegistry.getArguments().getString("liveAtlas")=="1")
        val auth=FirebaseAuth.getInstance();assumeTrue(auth.currentUser!=null)
        val identity=object:AtlasIdentity {
            override val currentUid get()=auth.currentUser?.uid
            override suspend fun token(forceRefresh:Boolean)=withContext(Dispatchers.IO){
                val user=requireNotNull(auth.currentUser);AtlasToken(requireNotNull(Tasks.await(user.getIdToken(forceRefresh)).token),user.uid)
            }
        }
        val network=KtorAtlasTransport("google-play")
        val outcomes=mutableListOf<JsonObject>()
        try { for(purpose in listOf(CompanionAiPurpose.ToxicityEducation,CompanionAiPurpose.SafetyEducation)) {
            val result=linkedMapOf<String,JsonElement>("purpose" to JsonPrimitive(purpose.name),"syntheticOnly" to JsonPrimitive(true))
            val capture=object:AtlasTransport {
                override suspend fun post(body:String,token:String,requestId:String):AtlasHttpResponse {
                    val response=network.post(body,token,requestId)
                    result["httpStatus"]=JsonPrimitive(response.status);result["clientRequestId"]=JsonPrimitive(requestId)
                    result["contextChecked"]=JsonPrimitive(response.contextChecked);result["contextFeature"]=JsonPrimitive(response.feature)
                    val parsed=runCatching{Json.parseToJsonElement(response.body).jsonObject}.getOrNull()
                    result["serverRequestId"]=parsed?.get("requestId")?:JsonNull
                    val error=parsed?.get("error") as? JsonObject
                    result["errorCode"]=error?.get("code")?:parsed?.get("errorCode")?:parsed?.get("code")?:JsonNull
                    return response
                }
            }
            val provider=AtlasResponseProvider(AtlasClient(identity,capture,true)){UUID.randomUUID().toString()}
            val question=if(purpose==CompanionAiPurpose.ToxicityEducation) "Explain general dog safety about chocolate. This is education only, no actual exposure." else "Explain preparing questions about heat safety for a veterinarian. No current symptoms or emergency."
            try {
                val reply=provider.response(CompanionAiRequest(question,ProfileSnapshot("Safety QA Dog","Not recorded",DogContext(years="3")),emptyList(),allowCloud=true,purpose=purpose)).first()
                result["source"]=JsonPrimitive(reply.source);result["answerCharacters"]=JsonPrimitive(reply.text.length);result["answerAccepted"]=JsonPrimitive(true)
            } catch(cancelled:CancellationException){throw cancelled}
            catch(_:Exception){result["answerAccepted"]=JsonPrimitive(false)}
            outcomes+=JsonObject(result)
        } } finally {network.close()}
        val context=InstrumentationRegistry.getInstrumentation().targetContext
        File(context.getExternalFilesDir(null),"task046-safety-atlas-diagnostic.json").writeText(JsonArray(outcomes).toString())
        check(outcomes.all{it.containsKey("httpStatus")}){"The request did not reach the server. No token or context is included in diagnostics."}
    }
}
