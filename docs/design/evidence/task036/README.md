# Task036 Firebase Authentication evidence · 18 October 2026

Native implementation/build verification is complete. This is **not successful
live-provider or production-release evidence**.

## Implemented boundary

- Official Android Firebase Auth + Credential Manager/Google ID; official Apple
  Firebase Core/Auth + GoogleSignIn + AuthenticationServices, injected through
  shared `Authentication`/`NativeAuthEngine` contracts.
- Existing shared Compose account screens use real provider/send-link operations,
  busy/error/cancel states, sign-out and account deletion. Apple deletion includes
  authorization revocation; Google deletion reauthenticates the selected user.
- Firebase SDK state restores identity. Historical SQLite demo identity never
  authenticates; only explicitly local demo Premium is retained in that document.
- Journal tables, filename and existing schema/migrations are unchanged. Native
  auth adapters receive no care records, photos or conversations. AI/Premium stay
  demos; purchases, Atlas, analytics and cloud journal storage remain disabled.

## Executed checks

- `python3 tools/verify.py --ios`: Android Debug/Release, lint, 97 JVM tests,
  preserving SQLDelight migrations and both iOS simulator host configurations pass.
- `python3 tools/verify.py --metadata-only`: final 30 tooling tests pass, including
  rejection of a stale bundled Firebase config.
- JVM regressions cover saved demo identity rejection, SDK identity restoration,
  no identity serialization in journal documents, failed/cancelled/repeated auth,
  incoming links and reload, provider failure, offline startup, native listener
  cleanup, and retry after cloud deletion/local cleanup failure. Real in-memory
  SQLite is used for the journal/data-preservation cases.
- `:androidApp:signingReport`: this machine's debug SHA-1/SHA-256 are recorded in
  the [setup guide](../../../product/firebase-authentication.md). Release signing
  is not configured by this task.
- `python3 tools/firebase_config.py --sync`: matching project/app IDs; refreshed
  iOS Google OAuth client present and callback URL scheme synchronized. The owner
  then replaced Android JSON after registering certificates; both OAuth clients
  and the current debug signing SHA-1 pass local checks.
- The refreshed iOS config arrived during the full build. A separate Debug host
  rebuild refreshes the packaged copy; both host bundles are then checked against
  the current source config, not merely for the expected bundle identifier.
- `git diff --check` passes.

Local command logs are in ignored `.verify-build/firebase-*.log`. The first
superseded verification was stopped during Release compilation after recovery
fixes; `.verify-build/firebase-final-verification.log` records the initial
integration. `.verify-build/firebase-code-review-verification.log` is the latest
full successful Android/iOS run, and `firebase-code-review-metadata.log` records
the final 30-test metadata run.

Firebase Apple 12.19.2 and GoogleSignIn 10.0.0 resolve together. Firebase 13.0.1
conflicted with Google's AppCheckCore range and was not adopted. Only Auth/Core
and GoogleSignIn products are linked; fetched package availability does not mean
Firebase Analytics/Firestore products are installed in the app.

## Console observation and limits

The owner initially reported no providers enabled. The open Firebase Console later
showed Google enabled and its new-OAuth-config download dialog. The refreshed iOS
plist was downloaded, checked for the selected project/bundle and installed.
No authentication/security setting was changed through browser automation.

Android debug certificate registration and both refreshed Google configs are
verified locally. Apple/email configuration, release signing/Play certificates,
correctly signed Apple capabilities/Universal Links and actual
Google/Apple/email success, collision, expiration, cross-device, offline and
account-deletion journeys remain unverified on devices. No real account was
created/deleted and no sign-in email was sent during these checks.

No simulator UI was launched/navigated or installed journal cleared. No app-screen
screenshots or assistive tests were captured, and task022 parity entries are not
approved by this slice.

The native linker still warns that bundled ICU simulator objects target iOS 17.2
while the project declares iOS 15.0. Simulator compilation does not establish
oldest-OS runtime compatibility; supported-floor/physical-device proof remains a
release gate. No performance/battery claim is made.


## Code review follow-up · 18 October 2026

- Google/Apple success clears a previous pending email link on Android and iOS.
- Native provider flows check cancellation before subsequent credential exchange,
  reauthentication or deletion where the host can still stop submission. Already
  submitted Firebase SDK requests retain their documented completion behavior.
- Auth startup cancellation propagates through ModuleRegistry rollback instead
  of being treated as missing configuration. A caller-owned timeout remains
  cancellation; the native provider is cancelled and the operation lock released.
- `firebase_config.py` now fails for absent Google clients, mismatched callbacks
  and (when requested) missing Android signing certificates. Full verification
  invokes this checker when both owner-supplied configs are available.
- Six tooling regressions cover OAuth readiness, certificate/package matching,
  mixed projects and callback repair while preserving unrelated URL schemes.
  Two additional JVM regressions cover startup rollback and caller-timeout retry.
- `python3 tools/firebase_config.py --android-sha1 <current-debug-SHA-1>` passes.
  This checks the downloaded registration, not an actual Google login.

- Full follow-up `python3 tools/verify.py --ios` passes Android Debug/Release,
  lint, preserving migrations, 97 JVM tests, and iOS Debug/Release simulator hosts
  with current bundle/config checks. All 30 tooling tests pass. The optimized
  Android Release APK retains `default_web_client_id` for Google sign-in.
- `git diff --check` passes. Live sign-in, signed release/device acceptance and
  the existing ICU oldest-supported-iOS warning remain as described above.
