**Latest authentication evidence — task040, 18 October:** email/password QA
account creation, sign-in and SDK session restoration pass on the signed iOS
simulator. Unsigned simulator builds caused Keychain error 17995; verification now
uses standard simulator signing. A real message-only app request reached Atlas
but returned HTTP 403. Server admission and successful answer generation remain
unresolved; Release Atlas is off. This is not physical/store signing evidence.
See [task040 evidence](../design/evidence/task040/README.md).

# BarkLog — what is left to finish

**Latest scope, 18 October — task039:** Atlas-only chat replaces on-device-first
routing. Local LLM/RAG/photo inference and task038's approved new care card are
paused. On-device acceptance items below are deferred, not current AI launch
requirements. Shipping Atlas chat still requires native Firebase sign-in,
explicit cloud consent, approved server admission/context policy and a verified
signed-device reply. Release gate remains off pending that proof.

**19 October live update:** an authenticated web retry using the native request
shape returned HTTP 200 and a real answer, with matching required BarkLog context
receipts. Earlier 403/409/422 server blockers are historical for this tested
account/request. Signed native-device reply and broader policy/release acceptance
remain open; Release Atlas stays off. See
[current evidence](../design/evidence/task040/atlas-web-2026-10-19.json).

**Later 19 October native update:** normal Debug apps now display and save real
Atlas replies on both owned simulators, with source `atlas`; iOS identity and
reply restoration pass. Android restart coordination remains open during the
owner's manual review. Physical/store acceptance and broader policy checks still
precede Release activation. See [native evidence](../design/evidence/task040/native-2026-10-19/README.md).


Source audit: **18 October 2026**, including task036 authentication and task037 AI integration.
This is a handoff checklist, not authorization to activate services or publish.
Prices remain undecided.

**Later owner direction on 17 October:** restore the Home Ask entry, keep reports
readable on mobile/free CSV, and make report/Memory Book PDF/print/sharing Premium.
Task033 implements the local demo-plan gates; real billing is still absent.
Photo-highlight video now has the approved native editor and local MP4 encoders.
Physical-device playback/performance and real entitlements remain release work. See the [current Premium/video plan](../product/premium-features-and-video.md).
This supersedes earlier free-PDF expectations in historical project notes.

## Current position in plain language

**The local journal and the new animated dog are implemented. The app is not yet
ready for public release. Native Firebase login adapters are implemented; provider
setup and live success are unverified. Task037 now implements local model adapters
and an Atlas client, with native verification in progress.** Premium remains a
demo. Authenticated Atlas web and native simulator generation now pass;
physical/store proof remains open and Release stays off.

| Area | Current position | What is left |
| --- | --- | --- |
| Android/iOS app | Native KMP/Compose hosts; Debug/Release builds pass | Physical-device QA and signed distribution |
| Journal and care tools | Implemented with local SQLite | Final complete journeys and native/device checks |
| Rive dog | Transparent spaniel integrated on both platforms | Physical performance/haptics, native dark theme and assistive review |
| Screens and animations | Native screens exist; targeted simulator checks pass | Individual board/native comparison and full accessibility review |
| Login | task036 official native Firebase adapters replace demo identity | Enable providers, refresh OAuth config, signed-device/live success and deletion verification |
| Chat | Real local/Atlas response routing, saved source labels, local photos, vet contacts and report PDF | Native model/live backend acceptance, clinical review and physical QA |
| Atlas | Web and normal iOS/Android simulator replies verified on 19 October; saved source `atlas`, iOS relaunch passes | Physical/store, remaining lifecycle and broader policy/release acceptance |
| On-device AI/photo captions | Pinned Qwen/SmolVLM downloads and shared native adapters implemented | Synthetic native text/photo checks pass on Android/iOS; physical memory/latency/quality and assistive review |
| Premium/payments | Demo plan flag now gates PDF outputs; purchases disabled | Real entitlements if Premium ships; no prices chosen |
| Photo highlight films | Approved native editor, local MP4 export, cancel/cleanup and simulator sharing verified | Physical encoding/playback/performance and real entitlements |
| Old React Native journals | Not automatically imported into KMP | Tested import or a clearly communicated update/distribution plan |
| Store release | No completed signing/store sign-off | Signed builds, privacy/store material and release-channel testing |

“Implemented” means code and the recorded checks exist. It does not mean every
screen has been approved or every feature has passed on a real phone.

There are two completion targets: **the free offline journal**, or **the journal
plus a real AI companion**. The latter adds the service work below. Billing is a
separate future choice. Neither AI nor sign-in may block the free local journal.

## Is my Atlas already there?

The existing service is reachable at `https://atlas.dracoarts.com`; health and
readiness respond successfully. BarkLog is registered as
`caaf9c52-60f3-4fe2-b71a-3b59d065089a`. Its backend source/OpenAPI were inspected.
The normal app now uses RealResponseProvider and a native Firebase-authenticated
text client, with bounded chosen context, one 401 refresh retry and mandatory
matching context receipts.

This is not live acceptance. The latest console check still shows Firebase
registration disabled at revision 0 and context checks off with no feature
contracts. The owner is configuring the server. The project list takes project
metadata and a safe server secret reference, never private service-account JSON.
Release remains disabled until server approval and signed-device proof.
See [the AI contract](../product/local-ai-and-atlas.md) and
[task037](../../tasks/task037-local-ai-and-atlas-fallback.md).

## Main remaining work, in priority order

| Priority | Work | What completion means |
| --- | --- | --- |
| 1 | Choose launch scope and old-user update policy | Written list of what ships, which demos are replaced/excluded, and whether existing RN users receive this update |
| 2 | Finish exact screen/motion/accessibility review — task022 | Individual approved board/native evidence on Android and iOS, including dark/large text/reduced motion |
| 3 | Complete real Android/iPhone journeys — task016 | Saved/reopened/exported real records, native permissions/reminders/photos/share, failures and retests recorded |
| 4 | Protect old journals — task015 | Tested import or explicit distribution boundary before updating existing users |
| 5 | Connect real identity and AI, if included | Selected providers, account deletion, real model and optional Atlas work on both phones; local journal stays independent |
| 6 | Measure performance and prove supported OS versions | Physical startup/scroll/memory/battery/motion evidence and compatibility issues resolved |
| 7 | Finish signing, privacy and store material | Signed AAB/device archive, accurate listing/pages/disclosures and internal testing |
| 8 | Final release review | Verified exact artifacts, reviewed source revision, upgrade/rollback evidence and owner release approval |

## What is already real

The shared Android/iOS app stores dogs, care records, setup/context and conversations
in device-local SQLite, with preserving migrations. Photos/camera, local reminders,
haptics and CSV/PDF sharing have native adapters. These need final device QA, not
a Firebase database. Login uses task036 native Firebase adapters, pending provider
setup and live verification; generated responses and Premium remain demos. No live
AI or billing provider is installed. See [feature status](../product/current-feature-status-and-market-roadmap.md).

The latest full verification passed Android Debug/Release, lint, **97 JVM tests**,
preserving database migrations, **30 tooling tests**, and iOS Debug/Release
**simulator** hosts. See [release preflight](preflight-local.md) and
[Premium output evidence](../design/evidence/task033/README.md),
[native film evidence](../design/evidence/task034/README.md),
[chat care tools evidence](../design/evidence/task035/README.md) and
[Rive implementation/evidence](../design/evidence/task032/README.md).
This establishes a build/test baseline, not public-release approval.

## Information to provide first

- [ ] Firebase project ID/name, intended development/production environments and
  local paths to `google-services.json` and `GoogleService-Info.plist` for the IDs below.
- [ ] Apple Developer Team ID and confirmation that BarkLog's App ID/App Store
  Connect record belong to that team. Use the signed-in local Xcode account.
- [ ] Google Play application record and existing upload-keystore path/alias, if
  available. Keep passwords in a local secret store; preserve existing signing identity.
- [ ] Confirm which login methods ship: Apple, Google and/or email link. Decide
  how sign-in applies to AI; the free local journal remains accessible.
- [ ] AI direction: an explicitly downloaded on-device model, optional Atlas
  fallback, or defer real AI. Provide an existing backend's staging URL/API contract
  if available. A model/provider decision is still required; a key alone is insufficient.
  The current project direction is on-device first; online-only AI would be a
  separate product-direction change.
- [ ] Public support email, privacy-policy URL, support URL and account-deletion URL
  for a build with real accounts; identify the publisher and initial countries/languages.
- [ ] Release target: internal testing, TestFlight/Play testing or public stores;
  confirm whether existing RN users need an in-app import/update path.
- [ ] If paid AI is planned later, decide included features, usage limits and
  monthly/yearly pricing then. Keep the current undecided/disabled purchase state until that decision.

Share project names, public client configuration and local file paths. Provider
API keys, service-account JSON, Apple `.p8` keys, signing passwords and refresh
tokens belong in the owner's secure local/server configuration, not chat or Git.

## Connections and implementation still needed

Identity/AI rows apply if the real companion is included. Store/signing rows
apply to either release target; paid AI remains optional.

| Area | What the owner supplies/configures | What still needs implementation and proof |
| --- | --- | --- |
| Firebase project | Register Android `com.draco.apps.bark.log` and iOS `com.draco.apps.bark.log`; matching client config; enabled providers; separate test environment | Native auth adapters behind a shared boundary, lifecycle/refresh/cancel/offline handling, sign-out and server account deletion. Replace the demo identity; do not treat saved demo state as proof of authentication. |
| Google sign-in | OAuth consent/support details, client IDs, Android debug/upload/Play app-signing fingerprints as applicable; iOS URL scheme/client config | Both native provider flows, account-linking/collision handling, cancellation/failure and release-signed sign-in. Register the certificate that signs the installed artifact. |
| Sign in with Apple | Apple capability; Team ID, Key ID and Service ID/private key where required by the selected Firebase flow; configure the provider securely and private email relay if sending account email | Native Apple flow and Android/web redirect flow if Apple login ships there; nonce validation, cancellation, name/email reuse, account linking and token revocation on deletion. |
| Email-link login | Authorized domain, Firebase Hosting link domain, sender/support details and email templates | Real send/resend/expiry, Android App Links, iOS Universal Links/Associated Domains, return-to-app routing, cold start and opening on another device. Use the current Hosting-based flow, not retired Dynamic Links. |
| On-device AI | Select licensed model/version, supported device floor, model size and download host/checksum; approve storage and download copy | Runtime adapters on both platforms, explicit download/cancel/remove, integrity check, missing/unsupported/out-of-space handling, streaming/stop, factual record references and measured memory/battery. Never load on Home. Tasks014/017 are not implemented by the demo chat. |
| Optional Atlas/online AI | Approved server environment, BarkLog Atlas UUID, Firebase audience, HTTPS endpoint/stream/error contract, model/provider, budgets/limits and retention/deletion policy; provider secret stored on the server | Verify fresh identity server-side, explicit message/profile/selected-record consent, minimal context, request IDs/idempotency, rate limits, timeout/cancel, context-policy checks and matching `X-Atlas-Context-Checked` evidence. Release stays off until approved server support exists. No direct provider secret in the mobile app. |
| Real account deletion | Account ownership/retention decision, working deletion/support web page, server endpoint and subscription explanation if applicable | Reauthentication, Firebase/provider revocation and server-data deletion, failure/retry and a truthful completion state. Keep account deletion, local journal deletion and subscription cancellation distinct and clearly explained. |
| Paid AI, only if selected later | Store agreements/tax/banking completed by owner; product IDs/subscription groups, prices, countries, trial choice and allowance policy | StoreKit/Play Billing adapters, server-verified entitlements, restore, pending/cancel/refund/expiry/grace handling, server notifications and sandbox tests. No entitlement from a local Boolean. No checkout while prices are undecided. |
| Public site and email | Owned domain/DNS access if using a custom domain; final support/privacy/terms/deletion pages; email sender identity | Host pages, configure auth-link associations, verify support/deletion routes and sender delivery/Apple relay. A Firebase Hosting default domain can serve auth links without buying another domain. |
| Android distribution | Existing Play Console app, upload signing configuration and Play App Signing access | Signed AAB, appropriate versionCode/target SDK for submission, internal-test install/update, R8 validation and store metadata. Debug APK and unsigned Release compilation do not establish store readiness. |
| iOS distribution | Apple team, correct App ID/capabilities, signing/profile access and App Store Connect app | Signed device archive, archive resource/privacy-manifest checks, TestFlight distribution, device install/update and release build/version. Simulator bundles are not device archives. |

Firebase configuration and provider setup follow the official
[Android Google sign-in](https://firebase.google.com/docs/auth/android/google-signin),
[Apple authentication](https://firebase.google.com/docs/auth/ios/apple) and
[Hosting email-link migration](https://firebase.google.com/docs/auth/android/email-link-migration)
guides. These are service configuration prerequisites, not evidence of an existing integration.

### Atlas-specific completion checklist

Having your existing Atlas platform should let us reuse infrastructure. These
checks determine which parts already exist on your server and which need work:

- [x] Locate the existing Atlas repo/API documentation and deployed environment.
- [ ] Confirm BarkLog's registered app UUID, allowed environment and Firebase
  project/audience; reuse a correct existing registration.
- [ ] Verify server-side identity validation, app authorization and context-policy
  enforcement; add only missing server capabilities.
- [ ] Agree request/context format, streaming response, error/status contract,
  cancellation, limits, retention and deletion behavior.
- [x] Implement the BarkLog client with fresh identity, memory-only tokens,
  request IDs/idempotency, timeout/stop and recoverable failure handling. Do not
  persist tokens in the journal or treat a saved demo session as authentication.
- [x] Send only the message and explicitly selected minimal profile/record
  summaries. No automatic journal upload or photos in this text-only fallback.
- [x] Validate required context-checked headers and matching feature evidence;
  reject results that fail the agreed policy.
- [ ] Test real Android/iOS requests, expired/denied identity, consent removal,
  dog switches, network loss, rate limits, server errors and interrupted streams.
- [ ] Record successful staging evidence and approve production server support
  before enabling Release. Public client values alone must not bypass that gate.

### On-device AI and captions · task037 acceptance — paused by owner

- [x] Select and license the model/runtime; document version, device floor,
  download size/host/checksum and storage needs.
- [x] Implement Android/iOS inference and explicit download/progress/cancel/
  integrity check/remove/redownload, without automatic Home/startup loading.
- [ ] Handle unsupported devices, insufficient storage, missing/corrupt models,
  interruption and memory pressure while keeping the journal usable.
- [ ] Ground factual answers/conversations in the selected dog's actual records,
  with source references, bounded context, streaming and stop/regenerate.
- [ ] If image captions ship, evaluate a separate image-capable model and real
  selected-photo processing. Real adapters exist; native acceptance is in progress.
- [ ] Test missing facts, ungrounded output and urgent safety routing. Organize
  observations; never diagnose, prescribe or invent care records.
- [ ] Measure latency, storage, memory and battery on physical Android/iPhone.

## Native features that need no extra cloud connection

| Feature | Connection required | Remaining final check |
| --- | --- | --- |
| Journal, timeline, insights and Memory Book | None; local SQLite | Offline create/edit/delete/relaunch, multi-dog isolation, failed-save recovery and migrations |
| Dog setup, profiles and settings | None; local SQLite/settings | Editing/relaunch, long names, per-dog isolation and correct deletion scope |
| Medication, vaccination and calendar | None; local records | Edit/delete/history, related reminder changes and correct dates |
| Training and expenses | None; bundled catalog/local SQLite | Complete/undo/reopen progress; amount/currency/date and edit/delete checks |
| Safety Center and emergency contacts | Bundled content; OS call/link handoffs | Source/content review, offline access and real-phone handoffs |
| Photos/camera | System picker/camera, private files | Real selected photo, cancel/deny/settings, restart retention, missing file and iPad presentation |
| Scheduled reminders | Local Android/iOS notification permission | Real delivery/tap, reboot/timezone changes, cancellation and long absence. FCM/APNs remote push is not needed for these local reminders. |
| CSV/PDF, print and share | OS share/print sheet; CSV free, PDF/print/sharing Premium demo gate | Real entitlements before selling, actual file contents/receiving app, cancellation, offline errors and iPad popover |
| Mascot and haptics | No runtime service connection; Rive assets/runtimes are bundled | task032 native light/reduced-motion and lifecycle checks pass; native dark/assistive, physical motion/haptics and resource profiling remain |

The paid Rive workspace is for authoring/exporting the dog. It is separate from
charging BarkLog users; bundled mascot playback needs no end-user Rive login.

Cloud journal sync/backup, Firebase Storage/Firestore, household sharing, remote
vet links, ads and hosted analytics are outside the agreed scope. Do not add them
as prerequisites for auth, AI or local release.

## Final release gates

- [ ] Finish native review of the latest 54 companion destinations and the older
  product-screen parity ledger: light/dark, compact phone/tablet, large text,
  keyboard, Back, safe areas, VoiceOver/TalkBack and reduced motion. Compilation
  and partial simulator checks do not establish all-screen parity.
  The [ledger](../../tasks/native-parity/README.md) has **166 entries, including
  123 product screens/states/handoffs; zero are individually marked matched**.
  This is outstanding review evidence, not 166 missing screens. The 54 companion
  routes describe a different scope; do not add the counts as a unique screen total.
- [ ] Complete the real onboarding → dog save → four care types → timeline →
  relaunch/export journey on Android and iPhone, plus demo or real chat according
  to the selected release scope. Preserve existing installed journals.
- [ ] Exercise rapid taps, failed saves and retained drafts, cancellation, dates
  across midnight/timezones, multi-dog switching, attachment cleanup and all
  local feature groups above. Success feedback must follow the committed write.
- [ ] Test real auth/AI only after integration: provider cancel, email expiry,
  token expiry, offline/retry, consent removal, dog switches, stop/regenerate,
  history persistence, account deletion and any paid-state changes.
- [ ] Close task015 before updating existing RN journal users: export/import or
  an explicitly communicated compatibility plan. The KMP app does not import
  WatermelonDB automatically.
  Verify record counts, dogs, dates, notes/photos, repeated import, failed import
  and rollback if an importer is built. Preserve legacy files and the current
  `barklog_kmp_v1.db` filename; new KMP schema migrations are a separate concern.
- [ ] Profile startup, scrolling, mascot frame pacing, memory and AI resource use
  on representative physical devices. Record device/OS/artifact and measured results.
- [ ] Verify the actual minimum supported OS. The current iOS simulator link
  reports a bundled ICU object built for 17.2 against the declared 15.0 target;
  resolve that compatibility question before promising iOS 15 support. An iOS 18.5
  simulator run does not establish the older-device baseline.
- [ ] Test native Android runtime behavior on the supported OS/device baseline,
  including a real 16 KB page-size environment as applicable. Binary alignment
  checks already pass; they do not establish runtime behavior.
- [ ] Measure final signed AAB/IPA, installed and store download sizes. Current
  reference: **30,993,003-byte unsigned universal APK (~31.0 MB)** and
  **63,854,021-byte uncompressed iOS Release simulator app (~63.9 MB)**.
  These are not measured store download sizes or a signed device IPA.
- [ ] Finalize truthful permissions/privacy wording, AI processing/retention and
  deletion disclosures; complete App Privacy/Data safety for the exact SDKs and
  data actually sent. Never label the future online build as wholly device-local.
- [ ] Finalize icon, store screenshots/copy, age/content ratings, countries,
  category, support/privacy links and review access/instructions for real login.
- [ ] Run full verification, create signed artifacts, install through the chosen
  testing channels and record failures/retests, data-preserving rollback and owner approval.
  Record the reviewed source revision, exact artifacts and upgrade results;
  recheck bundled native resources/privacy manifests in the signed Release builds.
- [ ] Ship a production scope without review controls, demo identities or demo
  Premium claims. If real services are deferred, explicitly choose and package
  the free local-only release instead of presenting the demo as a finished service.

Official store references to recheck when implementing/submitting:
[Android signing](https://developer.android.com/studio/publish/app-signing),
[Apple account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/),
[Google account deletion](https://support.google.com/googleplay/android-developer/answer/13327111),
[Apple subscription lifecycle notifications](https://developer.apple.com/documentation/AppStoreServerNotifications).
Recheck the selected markets' store requirements when submitting.

## Owner information sheet

Fill in known names/URLs/local paths; “not decided” is a valid answer. This avoids
creating duplicate service projects or guessing configuration. No secrets here.

```text
First release: free journal / journal + real AI companion / not decided
Existing RN users with journals to preserve: yes / no / not sure
Atlas repository path or staging URL/API docs:
BarkLog Atlas app UUID:
Firebase project ID and audience trusted by Atlas:
Android google-services.json local path:
iOS GoogleService-Info.plist local path:
Login methods to ship: Apple / Google / email link / not decided
On-device model/runtime choice: selected name / evaluate next / defer
Apple Developer team + App Store Connect app:
Play Console app + upload-keystore path/alias (no password):
Physical Android/iPhone models and OS versions available for QA:
Publisher name and support email:
Privacy / support / account-deletion URLs, if already hosted:
Initial countries/languages:
Distribution target: internal testing / TestFlight + Play testing / public stores
Paid AI: deferred; prices undecided unless separately chosen
```

Signing access, Atlas deployment readiness, final public page URLs and the model
choice remain **unverified/pending**, rather than assumed missing everywhere.
No new animation tool or journal cloud database is needed for the current app.

## Suggested order

The owner's latest priority is to finish task033's Premium output work and review/
build the photo-highlight video slice before returning to these release steps.
Any paid launch also requires real store entitlements; the current demo gates
cannot establish a purchase.

1. Choose the release scope, finish visual/native QA and resolve the legacy-update
   policy while existing Atlas/Firebase/signing details are gathered.
2. If the companion ships, connect real sign-in and account deletion; verify
   both platforms end to end.
3. If real AI ships, implement the selected on-device AI slice; separately
   approve and test any optional online fallback. Keep free logging independent.
4. Add paid entitlements only if selected later, after the deferred pricing decision.
5. Complete physical QA, privacy/store assets, signed internal distribution and
   final owner review before public submission.


### task034 update · 17 October

The approved video editor and native MP4 encoders pass simulator checks. Before
release, replace demo Premium with verified store entitlements and test photo-film
encoding/share on physical Android/iPhone, including low storage, 12-photo memory,
background cancellation, receiving-app playback, rotation, captions and accessibility.
No Firebase/Atlas/photo upload is needed for local films. Chat follows the earlier
approved compact design, with all responses still explicitly demo.


## Chat care tools follow-up (task035)

- [ ] Review photo-based AI scope, explicit image consent, retention and provider policy before enabling any real image analysis. Demo stores local attachments only.
- [ ] Obtain veterinarian review of medical boundaries, medication education, urgency wording and the caregiver report. Keyword shortcuts are not triage.
- [ ] Test real-device camera/photo denial, dial handoff and multi-page PDF with photos on both platforms.
- [ ] Verify screen-reader focus and large text in chat sheets on physical devices.


## task036 update · 18 October

The owner installed matching Firebase configs and authorized real authentication.
Official native SDKs and Google/Apple/email-link flows replace demo login, with
SDK-owned session restore/sign-out/deletion and shared controller tests. No providers
were initially enabled. Google is now enabled; both refreshed OAuth configs and
the current Android debug SHA-1 are verified locally. Apple/email setup, release
signing and live sign-in remain pending. Follow the
[Firebase setup guide](../product/firebase-authentication.md) before live testing.
AI/Premium remain demos; Atlas/billing and cloud journal storage remain disabled.
The older connection table describes the broader release target; the native
implementation now exists but provider/device/release proof is still required.

## task037 update · 18 October

[Real local models and the Atlas client](../product/local-ai-and-atlas.md) now
replace normal demo replies. The owner approved Android API 26/iOS 16.6. Earlier
demo-only AI statements describe prior scope. Native/build acceptance is in
progress; live Atlas, physical quality/memory/latency and clinical review remain
open. Release fallback and real billing stay disabled.

Task037 automatic-context refinement: local questions use the current dog's
profile plus up to 12 recent/relevant saved timeline observations automatically;
manual record attachment is not required. Atlas receives only chosen cloud
context and eligible history. General dog-care education works without logs;
clinical decisions remain excluded. Synthetic native text/photo inference passes
on Android and iOS; iOS production-provider no-log guidance also passes but
repeated tips demonstrate that broad quality approval remains open. See
[task037 evidence](../design/evidence/task037/README.md).

## 19 October · current AI and interaction direction

Task039's Atlas-only route supersedes local inference/RAG in the active flow.
Task040 has prior authenticated web and native reply proof. Task041 now implements
the approved weekly reply cards and app-facing BarkLog AI naming. Every allowed
question reads a fresh current-dog profile and today plus six preceding local
calendar days after versioned affirmative cloud consent. Counts cover that full
window; note excerpts stay bounded and limitations visible. Declining/revoking
keeps the free local journal usable. Other dogs, photos, contacts and older
records are outside the new scope. Existing server/Firebase/receipt checks remain.

Task042's owner-delegated Soft wood/35% choice is implemented as optional native
sound settings/adapters, default off. Commit callbacks gate saved feedback;
foreground/mute/one-voice/rate guards and failure isolation protect care logging.
See task041/task042 native evidence for actual runtime results. Remaining gates:

- [ ] Physical silent switch/ringer, headphones, other audio and interruption review.
- [ ] VoiceOver/TalkBack and physical large-text/native screen review.
- [ ] Task022's individual board/native parity and owner acceptance gates.
- [ ] Existing server/policy/physical/signing release gates; Release online AI stays off.

No billing, real prices, catalog, affiliate links or automatic photo upload was added.
