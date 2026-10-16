# BarkLog KMP verification

This file records the KMP foundation, product slices and current native port checks.
Old RN checks/upstream template snapshots are not evidence for this app.

## Native companion chapter — 2026-10-16, task027

The owner authorized the 54 latest board destinations in shared Compose and
explicitly requested local demo login/replies, undecided prices and no simulator
launch. Structured dog context and conversations use real SQLite schema v4; the
previous journal filename and preserving v1/v2/v3 migrations remain intact.

`python3 tools/verify.py --ios` passed: Android Debug/Release, lint (0 errors,
13 warnings), 75 JVM tests, 23 Python tooling tests, SQLDelight migrations and
unsigned iOS Debug/Release host/bundle checks. Device-arm64 Kotlin source
compilation also passed without installing or running a device. The larger native screen set
exceeded the old 3 GiB Native Release compiler heap; the tracked Gradle build
heap is now 6 GiB. No app runtime memory setting was changed.

Tests cover failed local writes, profile/edit restart with existing vet contacts,
completed-draft autosave cancellation, source consent/dog scoping, immutable
snapshots, stopped replies/regeneration, sign-out/deletion preserving care,
history retention, all routes and mascot pose/shuffle invariants. The existing
iOS libicu 17.2-versus-15.0 linker warning remains a physical/older-OS release gate.

No simulator/device was launched, installed, uninstalled or cleared. This is
functional/compile evidence, not visual parity or physical accessibility, camera,
notification delivery, haptics or performance approval. Task022 stays zero matched.
See [task027 evidence](design/evidence/task027/README.md).

Delivered native source: `ea5013f806692ca18de27b64c90aa26b8a08c2a8fc8cb55586b6bd88cd2ea72a`.

## Readable Home and shared motion — 2026-10-16, task023

The owner reviewed and liked the named/time Home care strip, then requested more
animation for Earlier/Latest. That refinement is now shared Compose: rounded
controls, responsive arrows, interruptible 460 ms browse, real record detail/Back,
post-commit landing/count/dog feedback and actual Undo. Loading now keeps Quick
care at the same position. Shared tabs/Back and touch/selection motion were also
refined. The rest of the original board is pinned; task022 still has zero matched
entries. See [task023](../tasks/task023-readable-care-and-native-motion.md) and
[the evidence](design/evidence/task023/README.md).

- `python3 tools/verify.py --ios` passed on the delivered app source: Android
  Debug/Release/lint/JVM/migrations and full iOS Debug/Release host/bundle checks.
- Native Android passed record browse/detail/Back position, directional and
  interrupted tabs, chooser/Back, calendar/Back, committed quick-log/Undo and
  loading geometry (1850 px → 1850 px).
- The final iOS run passed 4/4 journeys: browse/detail/Back position, tabs/chooser/
  calendar/Back, loading geometry and committed quick-log/Undo.
- Native light/dark, larger text (Android 130%, iOS XXXL ≈135%), reduced and empty
  states were captured. Actual tab/cover/Back frames and Android ½×/¼× browsing
  were inspected. Physical frame pacing, VoiceOver/TalkBack and haptics remain open.

Delivered source: `34c44c1b2d0eea4673e97ea083a18b767f7ca28dc98c12c4d000829d1e161909`.
Earlier task022 evidence below predates this targeted Home/motion revision.

## Native product-family conversion and crash recovery — 2026-10-16

The shared Compose port now covers the current product families, typed editors,
guided setup and scoped local recovery. Home typography/tile geometry, floating
tabs, compact selects, photo frames, editor type, recorded shared-element pixels
and compact setup scroll were corrected through real screenshots. This is
implementation and validation evidence. Task022 remains in progress with **0
individually matched entries**; exact visual/motion/accessibility acceptance is open.

[Open the versioned comparison pack](design/evidence/task022/review/index.html)
and [context/fixture instructions](design/evidence/task022/contextual-qa.md).
The pack displays every product ID, missing captures, source versions and actual
OS chrome. Sample data/art and native safe-area differences are not approved
exceptions. The board's wide frame remains 390px inside its 430px viewport;
iOS XXXL is labeled about 135%, separately from Android's exact 130%.

The pasted crash incident `94CA16C8-C23C-448E-B99E-69E9268C3FCB` is the earlier
photo recovery run's Kotlin `NoSuchElementException` in Compose's depth-sorted
node removal. Kotlin 2.3.20 supplies the upstream collection fix. AGP 8.13.2
supplies compatible R8; `kotlin.native.binary.gc=pmcs` avoids the documented
Release compiler regression. See the linked contextual notes for primary sources.
No speed, battery or frame-rate gain is inferred from these build changes.

| Check | Executed result |
| --- | --- |
| Full current-source verification | `python3 tools/verify.py --ios` passed: metadata/tooling, Android Debug/Release/lint, JVM, SQLite migrations, iOS Debug/Release and generated-bundle checks |
| JVM | 65 tests; 0 failures, errors or skips |
| Native crash regression | Current PMCS/Kotlin binary passed the collision/remove/reinsert regression on the owned iPhone 14 simulator |
| Current iOS recovery | 8/8 passed: startup/read, catalog, administration retry, picker cancellation/denial, export retry, meal retry, stale edit/reload cancellation and real share cancellation |
| Current compact setup | Fresh owned iPhone SE: guided journey passed; practice absent from the real Timeline, answers/shortcuts reused, Back/Skip visible after the scroll correction |
| Current typed editors | All nine captured on iOS at default/XXXL and Android at default/exact 130%; both iOS capture journeys and both Android 9/9 label passes succeeded |
| Other family captures | 70 iOS light views; sampled light/dark, compact/wide and larger-text families; 99 Android entry/rest views. Older source batches remain labeled; these counts are not parity approvals |
| Actual Android offline behavior | Airplane mode + Wi-Fi off: quick commit, early Undo, reopen/count preservation and Safety passed. Real PDF (32,238 bytes) and CSV (2,876 bytes) prepared; network/font/display settings restored |
| Release runtime isolation | iOS Release ignored Debug review arguments and showed ordinary first run; every QA database table count was unchanged across install/launch. Debug review restored afterward |
| Capture/artifact validation | Individual originals copied verbatim with hashes; review page search/selection/variants checked in a real browser; no task/approval status changed by packaging |

Durable [build log](design/evidence/task022/review/checks/full-verification.txt),
[native regression](design/evidence/task022/review/checks/native-regression.txt),
[iOS summaries](design/evidence/task022/review/checks/ios-test-summaries.json),
[offline file checks](design/evidence/task022/review/checks/offline.json),
[Release data preservation](design/evidence/task022/review/checks/release-data-preservation.json)
and [source fingerprints](design/evidence/task022/review/checks/source-fingerprints.txt)
bind these results to the actual native source. No journal was uninstalled,
cleared or reseeded. A QA quick log whose six-second Undo window expired during
automation was removed through its own scoped record confirmation before the
successful early-Undo rerun; other records were preserved.

Physical VoiceOver/TalkBack, haptics, measured frame pacing, complete per-state
paired motion/variant review, older-OS compatibility, signing and store delivery
remain unverified. No commit, push or upload was performed. Earlier audit-only
and foundation snapshots below remain historical evidence.

## Exact-board audit/backlog — 2026-10-16

Current functional/build evidence is in [task021](../tasks/task021-complete-board-application.md).
It does not establish exact current-board visual/motion parity. The owner reopened
that acceptance in [task022](../tasks/task022-exact-board-native-parity.md).

The read-only live inventory accounts for all 166 registry entries, including
123 product screens/states/handoffs. Individual tasks, a pinned reference,
native mappings and coverage/drift/evidence checks are in `tasks/native-parity/`.
Current native parity remains open: zero entries matched. No Kotlin/runtime/data
change or new native build is claimed by this audit-only pass.

## First usable journal — 2026-10-14

SQLDelight 2.1.0 and kotlinx-datetime 0.7.1 integrate with the pinned KMP stack.
Journal schema v1 has a local owner, dogs, events, foreign keys, indexes and format
metadata. It uses a unique filename; no old WatermelonDB file is opened/reset.
Native backup exclusions were checked (Android no-backup path and iOS directory
com.apple.MobileBackup exclusion). No credential, network client or account gate.

| Check | Evidence |
| --- | --- |
| Tooling | Metadata/generated registration and 5 Python tests passed |
| JVM tests | 24 passed: prior 12 lifecycle/foundation tests plus 7 real SQLite repository and 5 controller/date tests |
| Schema baseline | :shared:verifySqlDelightMigration passed against databases/1.db; added to verify.py/CI |
| Android native | API 35 fresh BarkLog Core QA emulator (emulator-5572), airplane mode enabled: 2 instrumentation tests passed |
| Driver behavior | Native four-record reopen/no-backup path and corrupt-file retention without byte changes passed; JVM rollback/cancellation/validation/version handling passed |
| iOS first caregiver loop | iPhone 16/iOS 18.5: entered Bruno, committed four quick logs, checked Timeline, terminated/relaunched, verified same dog and 4 total/1 each |
| iOS SQLite | Direct read confirmed schema user_version 1, quick_check ok, Bruno and one record of each quick type |
| Final Release runtime | Installed final Release over the same test journal without uninstall/reset; Bruno and the dated Timeline remained accessible |
| Appearance | Light and dark Home/Timeline and accessibility-extra-large Home rendered; headings/action counts present in accessibility tree |
| Small-screen form | Fresh iPhone SE (3rd generation)/iOS 18.5 final Debug build: labeled dog-name field, Luna draft, software keyboard with visible submit action, Done saved dog and opened Home |
| Native hosts | Final python3 tools/verify.py --ios passed: Android Debug/Release/lint/JVM/schema checks and complete iOS Debug/Release hosts/bundle checks |
| Android manifest | Actual merged Debug/Release permissions remain VIBRATE plus AndroidX's app-scoped signature receiver permission; no network/notifications/billing permission |

The early journal is usable; event details/edit/delete/filters, multi-dog UI,
settings/deletion, exports, medication/reminders, Insights, safety, training,
photos, expenses, Memory Book and AI are still unimplemented.
Task003 retains unchecked extended UI QA: Android complete touch journey, Back/
rotation/draft restore/TalkBack, iOS VoiceOver/touch-scroll, scaled-text small-screen
and tablet testing. Simulator coordinate gestures could not be verified through the
current UI controller, so large-text rendering is not full accessibility sign-off.
Physical devices, older OS support, performance, signing and store readiness remain
task016. No performance/battery benefit is inferred from compilation.

## Foundation verification history

## Verified on 2026-10-14

Mac with Xcode 26.5, JDK 17.0.17, Android SDK 36, Python 3.11,
Gradle 8.14, Kotlin 2.2.21 and Compose Multiplatform 1.9.3.

| Check | Evidence |
| --- | --- |
| Metadata and docs | python3 tools/verify.py --metadata-only passed: IDs, free/local policy, no old runtime, local links, fonts/plist, generated registration |
| Python tooling tests | 5 plugin configuration/scaffold/no-overwrite tests passed |
| Android Debug and Release | assembleDebug and assembleRelease passed, including R8/resource shrinking |
| Android lint | lintDebug passed: 0 errors, 4 inherited warnings (target API 35 and preference KTX suggestions) |
| Kotlin JVM tests | 12 passed, 0 failures/errors/skips across FoundationTest, ModuleRegistryTest and PluginLifecycleTest |
| iOS native hosts | python3 tools/verify.py --ios passed on the final source: complete Debug and Release SwiftUI/shared-framework builds |
| Generated iOS bundles | Debug/Release identity/version, strict frame-duration plist key and Inter fonts/license checks passed |
| Manifest policy | Actual merged Android Debug/Release manifests contain VIBRATE plus AndroidX's app-scoped signature receiver permission; no network, notifications or billing permission |
| Runtime UI | Fresh iPhone 16 simulator, iOS 18.5: standalone launch; Home/Timeline/Insights/Profile navigation; headings/labels; honest preview states |
| Appearance and large text | Release dark appearance and accessibility-extra-large text render; Home touch scrolling reaches remaining tiles; navigation stays accessible |
| Tab scroll regression | Updated Debug build opens Profile at the top after navigating from Home; content headings/labels verified |
| Artwork | Opaque 1024px iOS paw icon generated from tools/generate_app_icon.swift; Android vector mark and compiled iOS icon inspected |
| Diff hygiene | git diff --check passed |

Final full verification log: /tmp/barklog-kmp-verify.nRDOuY.
Reports: androidApp/build/reports/tests/testDebugUnitTest and lint-results-debug.html.
Debug APK: androidApp/build/outputs/apk/debug/androidApp-debug.apk.
Unsigned Release APK: androidApp/build/outputs/apk/release/androidApp-release-unsigned.apk.
iOS simulator apps: .verify-build/xcode/Build/Products/{Debug,Release}-iphonesimulator/iosApp.app.
These generated artifacts/logs are ignored and are not signed store artifacts.

## Runtime issues corrected during verification

The upstream host lacked Compose's required CADisableMinimumFrameDurationOnPhone
plist key, producing a strict-check startup abort. A tracked Info.plist now
supplies true for both configurations. The upstream disabled iOS Compose resource
sync; enabling it packages the new Inter fonts and license. Generated-bundle
checks prevent both regressions. Dormant notification adapters were removed after
lint identified their absent permission; task007 will add adapters and permissions
with the actual reminder flow. Tab-specific scroll state avoids carrying Home's
offset into another tab.

## Remaining limits

The foundation-only snapshot above predates task002/task003. Current local journal
evidence and remaining UI limits are in the first section. Export, safety, AI,
physical Android/iPhone QA, signing, store submission and measured performance
remain separate tasks. No speed or battery improvement is claimed from builds.

Xcode emits an upstream libicu object warning: built for iOS simulator 17.2 while
linking the declared 15.0 target. iOS 18.5 launch was tested; actual older-iOS
compatibility must be verified before publishing that support range.
Gradle also reports upstream deprecations; this project stays on its pinned 8.14 wrapper.

Old installed journal migration is not implemented. Existing-user updates remain
blocked by task015's data compatibility/export policy, not by the foundation build.
No Git commit/push or store upload was performed.
