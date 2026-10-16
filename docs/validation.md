# BarkLog validation

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
  ARCHS=arm64 CODE_SIGNING_ALLOWED=NO test
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
