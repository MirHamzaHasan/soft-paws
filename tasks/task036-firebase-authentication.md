# Task036 — real Firebase Authentication

Owner authorization: 18 October 2026. Both app identities selected by the owner:
`com.draco.apps.bark.log`, Firebase project `bark-log`.

Status: native implementation and Android/iOS build/test verification complete;
live provider/device acceptance remains pending. Google was
observed enabled in the console after the owner’s initial no-provider report.
Both refreshed Google configs/callbacks are installed, and the current Android
debug SHA-1 is present in the downloaded OAuth registration. Apple/email setup
and signed-device acceptance remain pending; no live sign-in success is verified.

## Scope

- Replace local demo identity with official Firebase Android/Apple SDK adapters.
- Reuse existing shared Compose Google, Apple and email-link screens, with busy,
  provider failure, cancellation and offline recovery. Journal remains accessible.
- SDK-owned session restoration, sign-out, recent authentication and account
  deletion. Apple deletion revokes Apple authorization. Care stays local.
- Email links use current Firebase Hosting links, native Android App Links and
  iOS Universal Links; ask for the receiving email rather than trusting a link's
  query string. Link codes and credentials are never written to SQLite.
- Ignore historical saved demo identities. Retain clearly labelled demo Premium
  and demo AI. No Atlas, billing, analytics, Firestore or photo upload.
- Preserve existing old-ID installed journals; new IDs install separately.

## Checks and remaining gates

- [x] Metadata/tooling checks: 30 tests.
- [x] Android Debug/Release, lint, 97 JVM tests and preserving SQLite migrations.
- [x] iOS Debug/Release simulator host builds and bundle checks.
- [x] Google enabled; refreshed Android/iOS OAuth configs and current Android debug SHA-1 verified.
- [ ] Apple/email provider setup and Apple team/capabilities; release signing/Play certificate verification.
- [ ] Real Google/Apple/email success on both platforms, cancellation, relaunch,
  collision, offline, expired link, cross-device link and deletion/revocation.
- [ ] Physical-device, assistive and paired visual evidence for changed account states.

The [setup guide](../docs/product/firebase-authentication.md) records configuration
and verification boundaries. Compilation is not evidence of successful sign-in.


## Verification evidence · 18 October 2026

`python3 tools/verify.py --ios` passed; an additional metadata run covers the new
stale-Firebase-config regression (24 tooling tests). The refreshed iOS OAuth
config arrived during compilation, so Debug was rebuilt separately to refresh its
bundled config. See [evidence](../docs/design/evidence/task036/README.md).
No account was created/deleted, no sign-in email was sent, no simulator UI was
navigated and no installed journal was changed by these build/test checks.


## Code review follow-up

The owner requested remaining code fixes after installing both Google configs.
Successful Google/Apple sign-in now discards older pending email links on both
platforms. Cancellation is checked before subsequent SDK mutations; startup
cancellation rolls back instead of being swallowed, and caller-owned timeouts
remain cancellation. OAuth/callback readiness checks now fail for missing config,
with optional Android SHA-1 enforcement. The six new tooling and two JVM
regressions pass; see the evidence record for platform verification.


Latest follow-up verification: `python3 tools/verify.py --ios` passes both Android
and iOS Debug/Release hosts, lint, preserving migrations, 97 JVM tests and 30
tooling tests. Both current iOS bundles/configs pass inspection. The Release APK
retains the Google OAuth resource after shrinking. Existing ICU simulator-floor
warning and live/signed-device acceptance remain open; no account action or
simulator navigation was performed by verification.

Later owner refinement: task040 replaces the default Email link screen with
ordinary email/password login, explicit account creation and password recovery.
Incoming links remain compatible. Refer to task040 for the current native checks.
