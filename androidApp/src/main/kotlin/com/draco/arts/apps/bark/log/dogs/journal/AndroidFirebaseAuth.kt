package com.draco.arts.apps.bark.log.dogs.journal

import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.credentials.*
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseNetworkException
import com.google.firebase.auth.*
import com.dracoarts.shared.domain.repository.AuthSnapshot
import com.dracoarts.shared.domain.repository.AuthUser
import com.dracoarts.shared.services.NativeAuthEngine
import com.dracoarts.shared.services.NativeAuthResult
import com.dracoarts.shared.services.NativeIdToken
import kotlinx.coroutines.*
import kotlinx.coroutines.tasks.await

/** Only Firebase Auth is installed. Care records and photos never enter this adapter. */
class AndroidFirebaseAuth(private val activity: ComponentActivity) : NativeAuthEngine {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val auth by lazy { FirebaseAuth.getInstance() }
    private var observer: ((AuthSnapshot) -> Unit)? = null
    private var listener: FirebaseAuth.AuthStateListener? = null
    private var pendingLink: String? = null
    private var job: Job? = null
    private var configured = false
    private var generation = 0

    override fun idToken(forceRefresh: Boolean, completion: (NativeIdToken) -> Unit) {
        scope.launch {
            val result = try {
                val user = if (configured) auth.currentUser else null
                checkNotNull(user)
                val token = user.getIdToken(forceRefresh).await().token
                check(auth.currentUser?.uid == user.uid && !token.isNullOrBlank())
                NativeIdToken(token = token, uid = user.uid)
            } catch (cancelled: CancellationException) { return@launch }
            catch (_: Exception) { NativeIdToken(error = "Sign in again or reconnect to use Soft Paws AI.") }
            completion(result)
        }
    }

    override fun observe(listener: (AuthSnapshot) -> Unit) {
        observer = listener
        configured = runCatching { FirebaseApp.getInstance(); true }.getOrDefault(false)
        if (configured) {
            val stateListener = FirebaseAuth.AuthStateListener { publish() }
            this.listener = stateListener
            auth.addAuthStateListener(stateListener)
        }
        publish()
    }
    private fun publish() {
        val user = if (configured) auth.currentUser else null
        val provider = user?.providerData?.firstOrNull { it.providerId != "firebase" }?.providerId
        observer?.invoke(AuthSnapshot(user?.let { AuthUser(it.uid, it.email.orEmpty(), when (provider) { "google.com" -> "Google"; "apple.com" -> "Apple"; else -> "Email" }) }, pendingLink != null))
    }
    fun handleLink(value: String?) {
        if (value == null) return
        val uri = Uri.parse(value)
        val project = runCatching { FirebaseApp.getInstance().options.projectId }.getOrNull() ?: return
        if (uri.scheme != "https" || uri.host != "$project.firebaseapp.com" || !uri.path.orEmpty().startsWith("/__/auth/")) return
        if (auth.isSignInWithEmailLink(value)) { pendingLink = value; publish() }
    }
    override fun execute(action: String, provider: String, email: String, password: String, completion: (NativeAuthResult) -> Unit) {
        val token = ++generation
        job = scope.launch {
            val result = try {
                check(configured) { "Firebase configuration is missing. Your journal is still available." }
                when (action) {
                    "signIn" -> {
                        when (provider) {
                            "Google" -> {
                                val credential = googleCredential()
                                ensureActive()
                                auth.signInWithCredential(credential).await()
                            }
                            "Apple" -> {
                                val oauth = OAuthProvider.newBuilder("apple.com").setScopes(listOf("email", "name")).build()
                                (auth.pendingAuthResult ?: auth.startActivityForSignInWithProvider(activity, oauth)).await()
                            }
                            else -> error("Choose Apple, Google or email and password.")
                        }
                        pendingLink = null
                    }
                    "signInEmail", "createEmailAccount" -> {
                        ensureActive()
                        if (action == "createEmailAccount") auth.createUserWithEmailAndPassword(email, password).await()
                        else auth.signInWithEmailAndPassword(email, password).await()
                        pendingLink = null
                    }
                    "resetPassword" -> auth.sendPasswordResetEmail(email).await()
                    "sendEmail" -> {
                        val project = FirebaseApp.getInstance().options.projectId ?: error("Firebase project configuration is missing.")
                        val settings = ActionCodeSettings.newBuilder().setUrl("https://$project.firebaseapp.com")
                            .setHandleCodeInApp(true).setIOSBundleId(activity.packageName)
                            .setAndroidPackageName(activity.packageName, false, null).build()
                        auth.sendSignInLinkToEmail(email, settings).await()
                        pendingLink = null; publish()
                    }
                    "completeEmail" -> {
                        val link = pendingLink ?: error("Open the sign-in link from your email first, then confirm your email here.")
                        auth.signInWithEmailLink(email, link).await()
                        pendingLink = null
                    }
                    "signOut" -> {
                        auth.signOut(); pendingLink = null
                        // Firebase sign-out is already complete even if a provider cannot clear its picker state.
                        runCatching { CredentialManager.create(activity).clearCredentialState(ClearCredentialStateRequest()) }
                    }
                    "delete" -> {
                        val user = auth.currentUser ?: error("Sign in before deleting your account.")
                        when {
                            user.providerData.any { it.providerId == "apple.com" } -> {
                                val oauth = OAuthProvider.newBuilder("apple.com").build()
                                val result = user.startActivityForReauthenticateWithProvider(activity, oauth).await()
                                val access = (result.credential as? OAuthCredential)?.accessToken ?: error("Apple did not return authorization to revoke. Try again.")
                                auth.revokeAccessToken(access).await()
                            }
                            user.providerData.any { it.providerId == "google.com" } -> {
                                val credential = googleCredential()
                                ensureActive()
                                user.reauthenticate(credential).await()
                            }
                        }
                        ensureActive()
                        check(auth.currentUser?.uid == user.uid) { "Your signed-in account changed. Review your account, then retry deletion." }
                        user.delete().await(); pendingLink = null
                    }
                    else -> error("This account action is unavailable.")
                }
                publish(); NativeAuthResult()
            } catch (_: GetCredentialCancellationException) { NativeAuthResult(cancelled = true) }
            catch (_: CancellationException) { return@launch }
            catch (cause: Exception) { NativeAuthResult(message(cause)) }
            if (token == generation) completion(result)
        }
    }
    private suspend fun googleCredential(): AuthCredential {
        val resource = activity.resources.getIdentifier("default_web_client_id", "string", activity.packageName)
        check(resource != 0) { "Google sign-in isn’t configured in this build. Choose another method or keep using your journal." }
        val option = GetSignInWithGoogleOption.Builder(activity.getString(resource)).build()
        val result = CredentialManager.create(activity).getCredential(activity, GetCredentialRequest.Builder().addCredentialOption(option).build())
        val credential = result.credential as? CustomCredential ?: error("Google did not return a sign-in credential.")
        check(credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) { "Google returned an unsupported credential." }
        return GoogleAuthProvider.getCredential(GoogleIdTokenCredential.createFrom(credential.data).idToken, null)
    }
    private fun message(cause: Exception): String = when {
        cause is FirebaseNetworkException -> "Connect to the internet to change your account. Your journal works offline."
        cause is FirebaseAuthRecentLoginRequiredException -> "For your security, sign in again, then retry account deletion."
        cause is FirebaseAuthWeakPasswordException -> "That password doesn't meet the account requirements. Try a longer password with a mix of characters."
        cause is FirebaseAuthException && cause.errorCode == "ERROR_EMAIL_ALREADY_IN_USE" -> "An account already uses this email. Sign in or reset your password."
        cause is FirebaseAuthException && cause.errorCode in setOf("ERROR_INVALID_CREDENTIAL", "ERROR_INVALID_LOGIN_CREDENTIALS", "ERROR_WRONG_PASSWORD", "ERROR_USER_NOT_FOUND") -> "The email or password didn't match. Try again or reset your password."
        cause is FirebaseAuthException && cause.errorCode == "ERROR_INVALID_EMAIL" -> "Enter a valid email address."
        cause is FirebaseAuthException && cause.errorCode == "ERROR_USER_DISABLED" -> "This account is disabled. Contact support for help."
        cause is com.google.firebase.FirebaseTooManyRequestsException -> "Too many attempts. Wait a little before trying again."
        cause is FirebaseAuthUserCollisionException -> "This email already uses another sign-in method. Use that method to continue."
        cause is FirebaseAuthException && cause.errorCode == "ERROR_WEB_CONTEXT_CANCELED" -> "Sign-in was cancelled. Your journal stays here."
        cause is FirebaseAuthException && cause.errorCode in setOf("ERROR_OPERATION_NOT_ALLOWED", "ERROR_ADMIN_RESTRICTED_OPERATION") -> "This sign-in provider is not enabled in Firebase yet."
        cause is FirebaseAuthException && cause.errorCode in setOf("ERROR_INVALID_ACTION_CODE", "ERROR_EXPIRED_ACTION_CODE") -> "That email link is invalid or expired. Request a fresh link."
        cause is IllegalStateException -> cause.message ?: "Sign-in is unavailable. Try again."
        else -> "Couldn't complete sign-in. Check your connection and provider setup, then try again."
    }
    override fun cancel() { generation++; job?.cancel() }
    override fun close() {
        cancel(); listener?.let { auth.removeAuthStateListener(it) }; listener = null; observer = null; pendingLink = null; scope.cancel()
    }
}
