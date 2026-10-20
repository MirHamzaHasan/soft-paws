# Firebase Authentication — task036

Owner direction: 18 October 2026. Firebase project `bark-log`; Android and iOS
application IDs `com.draco.apps.bark.log`. Old-ID installs keep their separate
local journals; never uninstall or clear them during this integration.

The app uses official native Firebase Authentication SDKs behind shared
`Authentication`/`NativeAuthEngine` boundaries. `AppContainer` wires the adapter;
`ModuleRegistry` owns its listener lifecycle. Authentication configuration errors
do not block local-data startup. SDK-owned identity is observed in memory; the
historical `companion-session` SQLite document now saves only demo Premium.
Old demo identity fields are ignored. No token is serialized into the journal.

Android uses Firebase Auth, Credential Manager and Google ID. Apple uses Firebase
Auth/Core via Swift Package Manager, GoogleSignIn and AuthenticationServices with
a cryptographically random Apple nonce. Firebase Apple 12.19.2 and GoogleSignIn
10.0.0 resolve together on the existing iOS 15 floor; Firebase 13.0.1 was rejected
because its AppCheckCore range conflicts with GoogleSignIn 10.0.0. Only Auth/Core
and GoogleSignIn products are linked, not Firebase Analytics or Firestore.

AI replies and Premium remain local demos. Authentication does not establish a
purchase entitlement, enable Atlas or upload any journal/photo/conversation.

## Current email direction — task040

The owner requested ordinary email/password login instead of email-link sign-in
on 18 October 2026. The Email screen now defaults to Sign in, with an explicit
Create account choice, masked password/confirmation fields and Forgot password.
Both native Firebase adapters use the official password APIs. A failed login never
silently creates an account. Passwords are passed only in memory, are not trimmed,
and never enter saved UI state, controller snapshots, SQLite or diagnostics. The
form clears them on leaving/backgrounding/success; the SDK owns the session.
Existing incoming email links remain redeemable for compatibility.

Live QA account creation and password sign-in now pass on the owned iOS simulator
with standard simulator signing, including session restoration after restart
and a final in-place update. The earlier unsigned build returned Keychain
error 17995 after the server accepted credentials; no insecure persistence fallback
was added. A real app question then reached Atlas but returned HTTP 403. No AI
answer was received; server admission still needs resolution.

Live email-link request was accepted by Firebase after the owner enabled the
provider; delivery/redemption was not verified before this direction changed.
Enable Email/Password for the current flow; Email link is no longer required for
ordinary login. Password resets still use a recovery email and never sign in.

See [task040](../../tasks/task040-email-password-authentication.md) for current
validation and live-auth/Atlas evidence.

## Owner Firebase Console setup

The owner initially reported no providers enabled. Later in this session the open
console showed Google enabled and its refreshed-config download dialog. The new
iOS config with its OAuth client was downloaded and installed, and its callback
scheme synchronized. The owner subsequently registered the Android certificates
and replaced the JSON. Both Google OAuth clients are present, and the current
Android debug SHA-1 matches a registered OAuth certificate. Apple/email
configuration and live sign-in remain unverified. Setup steps for reference:

1. In Firebase Authentication, initialize Authentication if prompted. Enable
   Google and choose the support email. Add the installed Android certificate's
   SHA-1 and SHA-256 under Project settings → Android app. Use debug fingerprints
   for local builds; register upload/Play App Signing identities for distribution.
   Run `./gradlew :androidApp:signingReport` for local certificate fingerprints.
2. Download the refreshed `androidApp/google-services.json` and
   `iosApp/iosApp/GoogleService-Info.plist`. Both use the existing project/app
   registrations. Run `python3 tools/firebase_config.py --sync` to validate
   identities and install the plist's reversed Google callback URL scheme. The
   checker fails for missing Google clients or a mismatched callback. Use
   `--android-sha1 <certificate-SHA-1>` to require a specific signing certificate.
   Full local verification also checks the configs when both files are present.
3. Enable Email/Password **and Email link (passwordless sign-in)**. The app uses
   email links, not password forms. Confirm `bark-log.firebaseapp.com` is an
   authorized domain and the default Hosting link domain. No Dynamic Links SDK.
   Android's manifest intercepts `/__/auth/links`; Firebase needs both certificate
   fingerprints to serve the association. iOS uses the matching associated domain.
4. For Apple, configure the app ID's Sign in with Apple capability in the correct
   Apple team and enable Apple in Firebase. Configure the Apple Service ID,
   Team ID, Key ID/private key and Firebase redirect URL as required for the
   Android web flow. Keep the private key in the provider console, never Git/chat.
   Set the Apple team on the Xcode target, enable Associated Domains and verify
   Firebase's Apple team/App ID association for Universal Links. Configure Apple
   private email relay if sending auth links to Apple relay addresses.
5. Rebuild and test both platforms. Simulator builds now use standard ad-hoc
   signing so Firebase can persist sessions in the app’s Keychain. Physical Apple
   capabilities/Universal Links still require the correct team/provisioning.

The downloaded client configs are ignored by Git. They are public client metadata,
not admin credentials; never replace them with service-account JSON.

### Current local Android debug certificate

These are public certificate fingerprints from `:androidApp:signingReport` on
18 October 2026. They belong only to this machine's debug build, not a Play release.

```text
SHA-1: 05:B8:A7:DC:38:D8:17:CC:98:09:B1:01:DF:E7:0A:F7:BD:35:FD:0C
SHA-256: A7:67:F4:C3:9D:71:E5:5E:17:B8:00:05:4B:2E:18:7F:EE:E9:C5:3C:BA:D7:1D:24:FB:28:E4:56:28:C2:6B:1B
```

## Runtime behavior

- Successful Google/Apple sign-in clears any older pending email link. Cancelled
  provider requests stop before a subsequent SDK mutation where cancellation is
  observable; an already submitted SDK request can still complete.
- Google and Apple open native/provider UI. A collision asks the user to use the
  original method; credentials are never silently merged into another account.
- Email send advances only after Firebase accepts the request. Opening a valid
  project HTTPS auth link routes to the existing confirmation screen. Enter the
  receiving email to complete sign-in, including links requested on another device.
  The link stays in native memory until completion/close; reopen it after a process
  restart. Receiving-email input is restored only as normal screen state.
- Sign-out preserves local care and conversations. Auth state comes from the SDK
  on relaunch, including its supported offline cached session behavior.
- Account deletion deletes the Firebase identity first, then this phone's local
  saved conversations. Google/Apple request fresh provider credentials as needed;
  Apple authorization is revoked. An email account may require a fresh sign-in
  link before retrying a sensitive deletion. Journal records/photos/exports stay.
  Other devices retain their device-local data; no cloud journal exists.
- Missing provider configuration, network errors and expired links show recoverable
  errors. Provider prompts can be cancelled. Account operations are serialized.
  Native SDK network mutations may finish after UI/process cancellation; the
  SDK's current account remains authoritative when the app resumes.

## Verification

Build/test evidence is recorded in [task036](../../tasks/task036-firebase-authentication.md).
Live-provider, signed-device, visual and assistive gates remain open until actually
performed. No live account is created by the build/test checks.

Primary references: [Android Google](https://firebase.google.com/docs/auth/android/google-signin),
[Apple Google](https://firebase.google.com/docs/auth/ios/google-signin),
[Android Apple](https://firebase.google.com/docs/auth/android/apple),
[Apple authentication/deletion](https://firebase.google.com/docs/auth/ios/apple),
[Android email links](https://firebase.google.com/docs/auth/android/email-link-auth),
[Apple email links](https://firebase.google.com/docs/auth/ios/email-link-auth).
