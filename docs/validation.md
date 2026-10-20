# BarkLog validation

## task046 update · 20 October 2026

RevenueCat is now an authorized optional billing dependency, inactive until the
owner supplies configuration. Android coarse/iOS When In Use location is requested
only by an explicit Safety area action; there is no startup or background request.
The older no-billing-dependency statement below is superseded for this slice.
Use the task046 matrix and [current contract](product/premium-revenuecat-and-safety.md)
for prices, entitlements, emergency calls and deferred store/device verification.

## Automated

```sh
python3 tools/verify.py --metadata-only
python3 tools/verify.py
python3 tools/verify.py --ios
python3 tools/verify.py --isolated
```

Metadata checks cover identities, plugin policy/registration, local Markdown links
and removal of the old runtime. Python tests cover plugin tooling and reproducible
board exports/explicit Debug review gates. Android checks
build Debug and Release (R8/resource shrinking), run lint and JVM tests. --ios
builds full Debug and Release SwiftUI simulator hosts and inspects each generated
bundle for the runtime plist key, identities and Inter font/license resources.
CI runs the same families.
No template identity-reset or generic sample smoke script remains in this product.

For an alternate XCTest DerivedData folder, inspect that exact host before launch:

```sh
python3 tools/check_ios_bundle.py Debug --bundle <derived-data>/Build/Products/Debug-iphonesimulator/iosApp.app
```

Do not skip the Kotlin Xcode build phase for a new test host: it also copies Compose
resources. Having fonts somewhere in a bundle is not sufficient; the checker
requires their exact Compose runtime paths. A resource-less QA host crashed on
2026-10-15 before setup; rebuilding normally corrects it without clearing a journal.

## Journal UI and native QA

- Launch iOS/Android without a credential, network or development server.
- Fresh install: add a dog name, verify Home, save Poop/Pee/Meal/Walk, open Timeline,
  terminate/relaunch and verify the same dog and four records. Do not clear app data.
- Verify real daily counts, recent records and dated rows. Insights, profiles and
  feature tools must read the selected dog’s actual local records.
- Android Back returns to Home; rotation preserves selected tab.
- Check light/dark appearance, small screens, tablet, large text, VoiceOver/TalkBack,
  touch targets, dog-name/Done keyboard handling, failed-save draft retention and safe areas.
- No notification/photo/camera/location/health permission prompt at startup.
- Confirm native identities/version and no ads/billing/telemetry dependency or permission.
- Use a simulator/emulator or fresh test device without valuable old care records.

## Approved design review

Normal launches and Release do not show review tooling. In Debug only:

```sh
xcrun simctl launch <owned-device-uuid> com.dracoarts.barklog -DesignReview
xcrun simctl launch <owned-device-uuid> com.dracoarts.barklog -DesignReview -DesignReviewScreen Weight
adb shell am start -n com.draco.arts.apps.bark.log.dogs.journal/.MainActivity --ez designReview true --es designReviewScreen Weight
```

Launch arguments are read at host creation; terminate the already-running app
first if needed. Review uses the real journal. Replay changes only animation
state; it does not reset records or drafts. Screen opens existing tabs, all product
family entry points or empty forms, never fabricated records. Destructive and
ID-dependent detail routes are reached through actual records, not the review menu.
Use a disposable QA journal for save testing.
Compare the board's current screen with native light/dark and large-text layouts.
The native port keeps one live editor/controller and read-only outgoing pixels.
Push/cover/carry, directional tabs and Back use their own page poses; fixed tabs
remain operable while their pill moves. Record-strip browsing keeps its position
on return, and the loading placeholder reserves the loaded height. It retains native responsive
layout/scrolling instead of a fixed 390×844 canvas. OS or app Reduce Motion snaps to the
final state. Check real-device spring/haptic/frame pacing separately.

## Native Android storage tests

On a fresh emulator only, build :androidApp:assembleDebug and
:androidApp:assembleDebugAndroidTest. Install both APKs with adb install -r, then
run am instrument -w -r with
com.draco.arts.apps.bark.log.dogs.journal.test/androidx.test.runner.AndroidJUnitRunner.
NativeJournalTest uses generated UUID filenames, never the actual caregiver DB.
It verifies four records across native driver reopen and preservation of a corrupt
fixture. Run with airplane mode enabled. Do not use a test runner that uninstalls
the existing app on a device containing valuable care records.

Schema changes require :shared:verifySqlDelightMigration, the checked-in v1
snapshot and numbered migrations; never regenerate old snapshots to mask a mismatch.

## Feature gates

Database/onboarding: offline writes, failed transaction, migration, restart,
dog scoping and deletion. Logging/timeline: rapid taps, duplicate handling,
timezone/day grouping, filters and edit/delete. Reminders: denial and save,
reboot, rescheduling, tap routing, cancellation and daylight saving changes.
Exports: native share sheets and factual CSV/PDF, including iPad popovers and
offline failures. Photos: selection cancellation, retained local file and missing
file. Safety: source/version, offline urgent actions and bounded copy.
AI: user download, missing model, cancellation/removal, memory and device profiling,
health boundaries and Release fallback disabled.

## Release

Unsigned compilation is not signing or store readiness. Record physical device
results, startup/scroll/memory measurements, signed artifacts and privacy/store
decisions in [release preflight](release/preflight-local.md). Legacy RN test counts
do not validate this implementation.

## Complete board application journeys

`iosApp/BarkLogUITests/JournalJourneys.swift` exercises synthetic QA records only:
quick/detailed logging and retained drafts, medication history, receipt-picker
cancellation, expenses, calendar completion, training sessions, supporting routes,
appearance/reduced motion and native PDF handoff. Use an owned test simulator,
`ARCHS=arm64`, an explicit destination and a new result bundle path. The tests
preserve existing records and do not uninstall or clear the app. Run them only on
a journal intended for test records; they create records.

```sh
xcodebuild -project iosApp/iosApp.xcodeproj -scheme iosApp -configuration Debug \
  -destination 'platform=iOS Simulator,id=<owned-device-uuid>,arch=arm64' \
  -derivedDataPath .verify-build/xcode -resultBundlePath .verify-build/journeys.xcresult \
  ARCHS=arm64 CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=- test
```

See [native board port](native-board-port.md) and task021 for the delivered scope,
run evidence and physical-device gates. Picker selection with a retained image,
Android reminder reboot/delivery and iOS long-absence delivery need platform QA
beyond host compilation and transaction tests.

`FirstRunJourney` in the same XCTest source covers optional guided setup, profile
reuse, two Home shortcuts, a practice note that must never enter the real Timeline,
and editing shortcuts later in Settings. Run this class on a newly created, owned
simulator using `-only-testing:BarkLogUITests/FirstRunJourney`. It skips when a
journal already exists instead of clearing anything. Run the other six journeys
with `-only-testing:BarkLogUITests/JournalJourneys` on an owned synthetic journal.

## Latest companion port (task027)

The owner requested no simulator launch in this pass. `tools/verify.py --ios`
compiles Android Debug/Release and generic iOS SDK hosts, runs JVM SQLite tests,
lint, migration and metadata checks; it does not launch a simulator. Record only
those results in task027 evidence. Do not reuse task023 screenshots as proof of
the newer companion layouts or mascot frames.

Next native QA should cover all 54 destinations using the debug review selector;
light/dark, compact/large text, reduced motion, keyboard, screen readers and motion
frames; demo sign-in/cancel/sign-out and account deletion; profile restart/edit;
actual chosen photo/camera cancellation/denial; notification Settings recovery;
and dog-scoped chat consent/snapshots/stop/regenerate/history. Use an owned QA
journal and preserve installed data. Real credentials, billing and model
inference remain explicitly unimplemented.

## task039 Atlas-only acceptance

Normal AppContainer routing is Atlas-only. Startup/cleanup tests use a platform
that fails on any local-runtime property read. Provider/controller tests check
explicit cloud consent, selected-source isolation, old local/demo history exclusion,
photo rejection, source persistence and no automatic journal query. Default design
fixtures remain deterministic demos. Live Firebase/Atlas receipts on signed native
clients are still required before the Release gate can be enabled; health 200 is
not generation proof. Local model/RAG acceptance is paused at the owner's request.

## task037 native model acceptance — retained, paused

`LocalAiNativeTest` runs the production GGUF adapter with pinned catalog files and
synthetic text/image inputs. It never opens the care database. Stage the three
files via `adb shell -T` and `run-as` into the owned QA app's private
`no_backup/ai-native-qa-staged/` folder, build/install
both Debug APKs in place, and run only this class with `-e localAiModels true`.
The test verifies chosen-note text, an actual local scene caption and model removal
preserving unrelated files. It skips without the explicit argument. Native model
files live in a generated test-only no-backup folder and are removed afterwards.

This is simulator/emulator acceptance, not physical memory, battery, quality or
clinical sign-off. Atlas still needs live authenticated receipt evidence on both
platforms before Release can be enabled. See [task037](../tasks/task037-local-ai-and-atlas-fallback.md).

Explicit iOS native inference acceptance (outside the normal test source set):

```sh
python3 tools/native-ai-qa/prepare_scene.py /tmp/barklog-native-ai-qa-20261018
# Stage the three exact ModelCatalog GGUF files in that same test-only directory.
./gradlew :shared:linkDebugTestIosSimulatorArm64 --init-script tools/native-ai-qa.init.gradle
SIMCTL_CHILD_BARKLOG_LOCAL_AI_QA_DIRECTORY=/tmp/barklog-native-ai-qa-20261018 \
  xcrun simctl spawn 02668D64-55D6-4702-A689-712B6EC72E62 \
  "$PWD/shared/build/bin/iosSimulatorArm64/debugTest/test.kexe" \
  '--ktest_filter=com.dracoarts.shared.services.ai.LocalAiIosNativeTest.*' --ktest_logger=SIMPLE
```

Use the owned BarkLog simulator only. The explicit init script adds the acceptance
source; standard builds do not require staged weights. Host Documents access was
denied to the spawned process, so use a dedicated `/tmp` QA directory; never
change OS privacy/security settings. The test exercises the production response
provider with automatic local facts and general care without logs, plus actual
local scene inference. It makes no network call and never opens a journal.

### Atlas-only UI with an existing review journal

Default design fixtures retain deterministic demo responses. The Debug-only
`-LiveAIReview` option now selects **AtlasResponseProvider**, not a downloaded local
model. Use it with `-DesignReview`, `-DesignReviewFixture park-empty-v1` and
`-DesignReviewScreen next-ai-privacy` to inspect current consent copy while preserving
the separate fixture journal. Android uses `--ez liveAiReview true` with the existing
review extras on a fresh Activity launch. Both hosts ignore this option in Release.
Fixture Firebase/Atlas access remains disabled, so this is UI/provider-selection
proof only, never a live cloud reply. No fixture records are copied into the normal
journal. Verify actual Firebase/Atlas traffic in normal Debug mode with an explicitly
signed-in account and saved cloud/context permission. Premium remains a local demo
gate, not a purchase entitlement. Do not resume local model/RAG testing unprompted.

## task040 email/password authentication

Default Email uses native Firebase password sign-in, explicit Create account and
Forgot password. Keep legacy incoming email-link completion. Test wrong/empty
credentials, provider disabled, weak password, duplicate taps/cancellation,
network failure and recovery. Login failure must not create an account. Passwords
must be masked and absent from AX stateDescription, saved state, SQLite documents,
preferences and logs. Preserve exact password whitespace; clear form secrets on
route change/background/success. Verify real sign-in before claiming a live Atlas
reply. See docs/design/evidence/task040/README.md for current evidence.

Task040 runtime correction: use standard simulator code signing (CODE_SIGNING_ALLOWED=YES,
CODE_SIGN_IDENTITY=-) for Firebase tests. Unsigned compilation passed but session
persistence failed with Auth Keychain error 17995. Ad-hoc simulator signing fixes
that; it is not physical/store signing. Live iOS password login passes, while a
message-only Atlas app request returns 403. Do not bypass the admission gate.

### 19 October live Atlas mobile acceptance

The earlier 403 is historical. Web generation now returns 200 with matching
required receipts; normal native iOS/Android Debug apps also display and save
real Atlas replies. See [current native evidence](design/evidence/task040/native-2026-10-19/README.md).
Physical/store signing and broader policy/release acceptance remain separate.

`LiveAtlasJourneys.testQuestionGetsRealReplyAndSurvivesRelaunch` is an explicit
live-network XCTest. Build the signed Debug UI-test host normally with
`build-for-testing`; set `EnvironmentVariables.BARKLOG_LIVE_ATLAS_QA=1` in a copy
of the generated `.xctestrun` beside its existing products, then run only
`BarkLogUITests/LiveAtlasJourneys` with `test-without-building`. It skips without
the marker. Use the owned synthetic journal, existing native Firebase identity,
local demo Premium and the current explicit profile/seven-day consent; no credential belongs in test
source or the runner file. The test uses no fixture/DesignReview flags. It sends
one general question, observes the accepted answer and verifies reply/SDK identity
restoration after terminating and relaunching. Preserve all existing care data.


### 19 October · weekly cards and optional sounds

`SoundAndWeeklyReviewJourneys` (iOS) and `SoundAndWeeklyJourneyTest` (Android)
exercise the named `park-ai-cards-v1` separate review database: original PCM
readiness/samples, persisted sound preferences, the weekly walk card, dated source
sheet and automatic-context review. Replies are labelled demos; fixture Firebase
and online AI stay disabled. iOS also checks the normal Profile entry. Android's
volume check uses the real accessibility progress action. Preserve normal care,
installed models and every other review database.

Save all test edits before `build-for-testing`. Xcode can cache/compile the test
target while the host Kotlin phase is still running; an edit during that phase
needs a subsequent build before `test-without-building`. Use the current generated
runner, the owned simulator ID and a fresh result bundle. Compose Android labels
can be child nodes; resolve their actionable ancestor for enabled/checked state.
Scroll inside the chat body above its fixed composer and above the review toolbar.

`AtlasWeeklyDiagnosticTest` requires explicit `liveAtlas=1`. It checks the owned
synthetic normal profile/consent, uses the existing Firebase SDK identity and
writes only sanitized status/metadata/errors. Add `messagesOnly=1` for the minimal
comparison. No credentials are supplied in test source or extracted to the host.
The current weekly and minimal requests both return 422 `CONTEXT_FEATURE_UNKNOWN`;
see task041 native evidence and its backend report. Never bypass the checks or
claim accepted generation from these diagnostics.

Real phone audio/silent mode, headphones/interruption behavior, assistive review,
native dark/large-text review and task022 individual owner approval remain gates.

### 19 October · adding another dog

`task043` reuses the approved onboarding questions for a new independent dog.
Use `AddDogJourneyTest` on Android and `AddDogReviewJourneys` on iOS, with the
explicit `park-add-dog-v1` fixture. The fixture has its own database/preferences
and uses the real repositories; preserve every normal and other review journal.

Exercise every dog-information screen, enter distinct details, Finish later at
care notes, relaunch and resume, leave notifications off, review/edit the name,
then confirm and check both dogs in the switcher. Verify the new dog's saved
profile and Home selection. No account, entitlement, credential or online reply
is needed. `CompanionTest` additionally checks all stored fields, original
profile/record preservation, new-dog AI consent/context separation and real SQLite
write/cleanup failures with duplicate-safe retry. Check hashes/counts of normal
journals before and after runtime QA. Native visual/physical acceptance remains
separate; see [task043](../tasks/task043-additional-dog-onboarding.md).

The save-to-Home regression holds the journal observer behind a real SQLite
profile commit, then selects that new dog before the screen list refreshes.
Selection must succeed without inheriting care. Missing profiles/read errors
must stay recoverable; cancellation must propagate.


## task047 plan/Rive review

`PremiumPlanJourneyTest` on Android and the iOS `PremiumSafetyJourneys` methods
`testNewNotebookPlansAndFreeExit` and `testNewPlanMotionAndReducedMotionFrames`
cover the approved three-screen slice in the separate Premium/Safety fixture.
The Android helper targets the actual scrollable viewport; the iOS helper starts
above the pinned free footer. Restore/purchases remain disabled without setup.
Large-text and reduced-motion settings are restored after capture. See
[actual evidence](design/evidence/task047/native/README.md). Both normal journals
were checked with before/after row hashes; no uninstall or data clear was used.
