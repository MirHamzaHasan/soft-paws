import Shared
import FirebaseCore
import FirebaseAuth
import GoogleSignIn
import AuthenticationServices
import CryptoKit
import Security
import UIKit

/// Native SDKs own credentials in their supported secure stores. No journal upload.
final class BarkFirebaseAuth: NSObject, NativeAuthEngine, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    static let shared = BarkFirebaseAuth()
    private var observer: ((AuthSnapshot) -> Void)?
    private var listener: AuthStateDidChangeListenerHandle?
    private var pendingLink: String?
    private var task: Task<Void, Never>?
    private var generation = 0
    private var appleController: ASAuthorizationController?
    private var appleContinuation: CheckedContinuation<ASAuthorizationAppleIDCredential, Error>?

    func isConfigured() -> Bool { FirebaseApp.app() != nil }

    func idToken(forceRefresh: Bool, completion: @escaping (NativeIdToken) -> Void) {
        Task { @MainActor in
            guard FirebaseApp.app() != nil, let user = Auth.auth().currentUser else {
                completion(NativeIdToken(token: nil, uid: nil, error: "Sign in to use Soft Paws AI.")); return
            }
            do {
                let token = try await user.getIDToken(forcingRefresh: forceRefresh)
                guard Auth.auth().currentUser?.uid == user.uid else {
                    completion(NativeIdToken(token: nil, uid: nil, error: "Your account changed. Sign in again.")); return
                }
                completion(NativeIdToken(token: token, uid: user.uid, error: nil))
            } catch { completion(NativeIdToken(token: nil, uid: nil, error: "Sign in again or reconnect to use Soft Paws AI.")) }
        }
    }

    static func configure() {
        guard FirebaseApp.app() == nil,
              let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let options = FirebaseOptions(contentsOfFile: path), options.bundleID == Bundle.main.bundleIdentifier else { return }
        FirebaseApp.configure(options: options)
    }
    func observe(listener: @escaping (AuthSnapshot) -> Void) {
        observer = listener
        if FirebaseApp.app() != nil { self.listener = Auth.auth().addStateDidChangeListener { [weak self] _, _ in self?.publish() } }
        publish()
    }
    private func publish() {
        let user = FirebaseApp.app() == nil ? nil : Auth.auth().currentUser
        let provider = user?.providerData.first?.providerID
        let identity = user.map { AuthUser(uid: $0.uid, email: $0.email ?? "", provider: provider == "google.com" ? "Google" : provider == "apple.com" ? "Apple" : "Email") }
        observer?(AuthSnapshot(user: identity, emailLinkPending: pendingLink != nil))
    }
    func handle(_ url: URL) {
        if GIDSignIn.sharedInstance.handle(url) { return }
        guard let project = FirebaseApp.app()?.options.projectID,
              url.scheme == "https", url.host == "\(project).firebaseapp.com", url.path.hasPrefix("/__/auth/"),
              Auth.auth().isSignIn(withEmailLink: url.absoluteString) else { return }
        pendingLink = url.absoluteString
        publish()
    }
    func execute(action: String, provider: String, email: String, password: String, completion: @escaping (NativeAuthResult) -> Void) {
        generation += 1
        let token = generation
        task = Task { @MainActor [weak self] in
            guard let self else { return }
            let result: NativeAuthResult
            do {
                guard FirebaseApp.app() != nil else { throw self.failure("Firebase configuration is missing. Your journal is still available.") }
                switch action {
                case "signIn":
                    let credential: AuthCredential
                    if provider == "Google" { credential = try await self.googleCredential() }
                    else if provider == "Apple" { credential = try await self.appleCredential().credential }
                    else { throw self.failure("Choose Apple, Google or email and password.") }
                    try Task.checkCancellation()
                    _ = try await Auth.auth().signIn(with: credential)
                    self.pendingLink = nil
                case "signInEmail", "createEmailAccount":
                    try Task.checkCancellation()
                    if action == "createEmailAccount" { _ = try await Auth.auth().createUser(withEmail: email, password: password) }
                    else { _ = try await Auth.auth().signIn(withEmail: email, password: password) }
                    self.pendingLink = nil
                case "resetPassword":
                    try await Auth.auth().sendPasswordReset(withEmail: email)
                case "sendEmail":
                    guard let project = FirebaseApp.app()?.options.projectID, let bundle = Bundle.main.bundleIdentifier else { throw self.failure("Firebase project configuration is missing.") }
                    let settings = ActionCodeSettings()
                    settings.url = URL(string: "https://\(project).firebaseapp.com")
                    settings.handleCodeInApp = true
                    settings.setIOSBundleID(bundle)
                    settings.setAndroidPackageName(bundle, installIfNotAvailable: false, minimumVersion: nil)
                    try await Auth.auth().sendSignInLink(toEmail: email, actionCodeSettings: settings)
                    self.pendingLink = nil
                case "completeEmail":
                    guard let link = self.pendingLink else { throw self.failure("Open the sign-in link from your email first, then confirm your email here.") }
                    _ = try await Auth.auth().signIn(withEmail: email, link: link)
                    self.pendingLink = nil
                case "signOut":
                    try Auth.auth().signOut()
                    GIDSignIn.sharedInstance.signOut()
                    self.pendingLink = nil
                case "delete":
                    guard let user = Auth.auth().currentUser else { throw self.failure("Sign in before deleting your account.") }
                    if user.providerData.contains(where: { $0.providerID == "apple.com" }) {
                        let apple = try await self.appleCredential()
                        try Task.checkCancellation()
                        _ = try await user.reauthenticate(with: apple.credential)
                        try Task.checkCancellation()
                        try await Auth.auth().revokeToken(withAuthorizationCode: apple.code)
                    } else if user.providerData.contains(where: { $0.providerID == "google.com" }) {
                        let credential = try await self.googleCredential()
                        try Task.checkCancellation()
                        _ = try await user.reauthenticate(with: credential)
                    }
                    try Task.checkCancellation()
                    guard Auth.auth().currentUser?.uid == user.uid else { throw self.failure("Your signed-in account changed. Review your account, then retry deletion.") }
                    try await user.delete()
                    GIDSignIn.sharedInstance.signOut()
                    self.pendingLink = nil
                default: throw self.failure("This account action is unavailable.")
                }
                self.publish()
                result = NativeAuthResult(error: nil, cancelled: false)
            } catch {
                let ns = error as NSError
                let cancelled = Task.isCancelled || ns.domain == ASAuthorizationError.errorDomain && ns.code == ASAuthorizationError.canceled.rawValue || ns.domain == kGIDSignInErrorDomain && ns.code == GIDSignInError.canceled.rawValue
                result = NativeAuthResult(error: cancelled ? nil : self.message(error), cancelled: cancelled)
            }
            if token == self.generation { completion(result) }
        }
    }
    @MainActor private func googleCredential() async throws -> AuthCredential {
        guard let client = FirebaseApp.app()?.options.clientID, !client.isEmpty else {
            throw failure("Google sign-in isn’t configured in this build. Choose another method or keep using your journal.")
        }
        let reversed = client.split(separator: ".").reversed().joined(separator: ".")
        let types = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]] ?? []
        guard types.contains(where: { ($0["CFBundleURLSchemes"] as? [String] ?? []).contains(reversed) }) else {
            throw failure("Google sign-in isn’t configured in this build. Choose another method or keep using your journal.")
        }
        guard let presenter = presenter() else { throw failure("Open the app before signing in.") }
        GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: client)
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenter)
        guard let token = result.user.idToken?.tokenString else { throw failure("Google did not return a sign-in credential.") }
        return GoogleAuthProvider.credential(withIDToken: token, accessToken: result.user.accessToken.tokenString)
    }
    @MainActor private func appleCredential() async throws -> (credential: AuthCredential, code: String) {
        var bytes = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else { throw failure("Couldn't prepare secure Apple sign-in. Try again.") }
        let nonce = bytes.map { String(format: "%02x", $0) }.joined()
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = SHA256.hash(data: Data(nonce.utf8)).map { String(format: "%02x", $0) }.joined()
        let controller = ASAuthorizationController(authorizationRequests: [request])
        appleController = controller
        controller.delegate = self
        controller.presentationContextProvider = self
        defer {
            controller.delegate = nil; controller.presentationContextProvider = nil
            if appleController === controller { appleController = nil }
        }
        let apple: ASAuthorizationAppleIDCredential = try await withCheckedThrowingContinuation { continuation in
            appleContinuation = continuation
            controller.performRequests()
        }
        guard let data = apple.identityToken, let token = String(data: data, encoding: .utf8),
              let codeData = apple.authorizationCode, let code = String(data: codeData, encoding: .utf8) else { throw failure("Apple did not return a sign-in credential.") }
        return (OAuthProvider.appleCredential(withIDToken: token, rawNonce: nonce, fullName: apple.fullName), code)
    }
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard controller === appleController, let continuation = appleContinuation else { return }
        appleContinuation = nil
        if let credential = authorization.credential as? ASAuthorizationAppleIDCredential { continuation.resume(returning: credential) }
        else { continuation.resume(throwing: failure("Apple did not return a sign-in credential.")) }
    }
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard controller === appleController else { return }
        let continuation = appleContinuation; appleContinuation = nil; continuation?.resume(throwing: error)
    }
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        presenter()?.view.window ?? ASPresentationAnchor()
    }
    private func presenter() -> UIViewController? {
        let window = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap(\.windows).first(where: \.isKeyWindow)
        var current = window?.rootViewController
        while let presented = current?.presentedViewController { current = presented }
        return current
    }
    private func failure(_ text: String) -> NSError { NSError(domain: "BarkLogAuth", code: 1, userInfo: [NSLocalizedDescriptionKey: text]) }
    private func message(_ error: Error) -> String {
        let ns = error as NSError
        #if DEBUG
        // Diagnostics contain numeric codes only, never SDK payloads or credentials.
        let underlying = ns.userInfo[NSUnderlyingErrorKey] as? NSError
        NSLog("BarkLogAuth failure code=%ld underlyingCode=%ld", ns.code, underlying?.code ?? 0)
        #endif
        if ns.domain == "BarkLogAuth" { return ns.localizedDescription }
        guard ns.domain == AuthErrorDomain else { return "Couldn't complete sign-in. Check your connection and provider setup, then try again." }
        switch AuthErrorCode(rawValue: ns.code) {
        case .networkError: return "Connect to the internet to change your account. Your journal works offline."
        case .operationNotAllowed: return "This sign-in provider is not enabled in Firebase yet."
        case .requiresRecentLogin: return "For your security, sign in again, then retry account deletion."
        case .weakPassword, .passwordDoesNotMeetRequirements: return "That password doesn't meet the account requirements. Try a longer password with a mix of characters."
        case .keychainError: return "Couldn't save your sign-in securely. Restart the app and try again."
        case .emailAlreadyInUse: return "An account already uses this email. Sign in or reset your password."
        case .invalidCredential, .wrongPassword, .userNotFound: return "The email or password didn't match. Try again or reset your password."
        case .invalidEmail: return "Enter a valid email address."
        case .userDisabled: return "This account is disabled. Contact support for help."
        case .tooManyRequests: return "Too many attempts. Wait a little before trying again."
        case .accountExistsWithDifferentCredential, .credentialAlreadyInUse: return "This email already uses another sign-in method. Use that method to continue."
        case .expiredActionCode, .invalidActionCode: return "That email link is invalid or expired. Request a fresh link."
        default: return "Couldn't complete sign-in. Check your connection and provider setup, then try again."
        }
    }
    func cancel() {
        // A delayed cancellation must never cancel a newer request.
        let expected = generation
        let previousTask = task
        let cancelRequest = { [weak self] in
            previousTask?.cancel()
            guard let self, self.generation == expected else { return }
            self.generation += 1
            let continuation = self.appleContinuation; self.appleContinuation = nil
            continuation?.resume(throwing: CancellationError())
        }
        if Thread.isMainThread { cancelRequest() }
        else { DispatchQueue.main.async(execute: cancelRequest) }
    }
    func close() {
        cancel()
        if let listener, FirebaseApp.app() != nil { Auth.auth().removeStateDidChangeListener(listener) }
        listener = nil; observer = nil; pendingLink = nil
    }
}
