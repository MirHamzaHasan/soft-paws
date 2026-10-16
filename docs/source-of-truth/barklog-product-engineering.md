# BarkLog product and engineering spec

Latest 2026-10-16 authorization: [task027](../../tasks/task027-native-companion-board-and-main.md) ports task024–026 into the
KMP app. The owner explicitly chose local demo sign-in and AI replies now; real
credentials are deferred. Structured dog context and conversations use SQLite
schema v4 with preserving v1/v2/v3 migrations. Prices remain undecided and real
purchasing disabled. No simulator run is requested; native visual/device QA is
still outstanding. Earlier board-only statements below describe prior scope.


Canonical for the fresh Kotlin Multiplatform rebuild requested on 2026-10-14.
Previous framework instructions and implemented-feature claims are superseded.
This is product intent plus explicit current scope; the backlog separates them.

**Later 2026-10-16 board revision:** the owner requested required Firebase login,
richer onboarding, optional native access and Premium AI conversation/features,
with a usable free tier. The owner kept prices undecided. This authorizes the
[task024 board proposal](../../tasks/task024-premium-ai-onboarding-board.md) and
[task025 refinement](../../tasks/task025-light-and-flexible-dog-onboarding.md),
overriding the earlier no-account/no-paywall design exclusion for that proposal.
It does not enable auth, billing, cloud AI or new native screens. The following
free/local implementation scope remains the installed app's actual behavior;
native implementation of the new direction needs its own reviewed slices.

## 1. Product

BarkLog: "Daily dog health, in one tap." For caregivers recording daily dog care,
including senior dogs and medication routines. iPhone and Android are the targets.
No web target is required for this rebuild.

v1.0.0 remains free with no ads, purchase flow, subscription, trial expiry or paywall.
Logging, timeline and manual exports must remain free. The journal needs no account
or network. Multiple dogs, training, trends, care calendar, photos, expenses and
Memory Book are implemented local features in task021; simulator/build evidence
and outstanding physical-device gates are recorded below and in the native port map.

BarkLog records owner observations, organizes factual patterns and prepares records
for a vet. It is not a veterinary authority and never diagnoses or prescribes.

## 2. Current implementation

The owner authorized the complete approved board in the application on 2026-10-15
(task021). Shared Compose now implements setup, Home, detailed logging, Timeline,
profiles/settings, medication/vaccination records, calendar, factual insights,
offline Safety Center, CSV/PDF share/print, training, private photos, expenses and
Memory Book with real local repositories. The board kit and animated dog are native.

This is functional coverage, not exact visual parity. On 2026-10-16 the owner
reported screen mismatches and explicitly selected the current web board exactly,
including its typography. [Task022](../../tasks/task022-exact-board-native-parity.md)
tracks all 166 board entries (123 product screens/states/handoffs) individually.
Native family/state ports now include Bricolage/Inter, scoped recovery and snapshot/shared-element navigation. Geometry, motion and platform-state comparisons remain under validation; no native screen is marked matched without paired evidence and owner review.

Later on 2026-10-16 the owner reviewed and liked a more readable Home care strip,
then requested more animation for Earlier/Latest. [Task023](../../tasks/task023-readable-care-and-native-motion.md)
replaces Home's stacked icon chart with named, timed record controls and refines
shared KMP navigation/touch motion. Other screen directions and task022's visual
approval gates remain intact. This is a targeted owner-requested revision.

Schema v4 preserves v1/v2/v3 records and adds typed care items, observation context,
profile details, retained drafts and durable native-file/reminder cleanup.
Success feedback follows SQLite commit. AI, legacy RN import and store release
remain outside the implementation. See [native board port](../native-board-port.md)
for route mapping, exact evidence and remaining physical/assistive QA gates.

## 3. Stack and ownership

| Layer | Contract |
| --- | --- |
| Shared app | Kotlin Multiplatform from Draco KMP base |
| Shared UI | Compose Multiplatform; Android Compose host, iOS SwiftUI container |
| Async/state | Coroutines, immutable screen state and Flow/StateFlow |
| Persistence | SQLDelight 2.1.0 with device SQLite drivers, schema v4 with preserving v1/v2/v3 migrations |
| Preferences | Native preferences for UI settings only |
| Platform APIs | Narrow Android/iOS adapters for permissions, export, photos, reminders |
| Networking | Deferred; Ktor only when a concrete optional integration needs it |
| Fonts | Exact-board target: Bricolage Grotesque 700/800 display/numbers + Inter 400/500 reading, owner-selected 2026-10-16; native adoption open in task022 |
| Build | Gradle Kotlin DSL + tracked Android host/Xcode project |
| Startup | AppContainer dependency wiring and ModuleRegistry lifecycle |
| Tests | Kotlin/JVM business/lifecycle/storage tests, native builds and device QA |

Use shared presentation/domain/data folders; domain is free of UI/platform types.
No React Native, Expo, Tamagui, WatermelonDB, JavaScript build pipeline or Metro.
Do not add an unnecessary DI/navigation framework or dependency.
Record dependency choices and actual compatibility verification in the task.

Android ID: com.draco.arts.apps.bark.log.dogs.journal.
iOS ID: com.dracoarts.barklog. iOS minimum 15.0; Android minimum API 24.
Versions: 1.0.0, build 1. URL/deep-link support is implemented with its feature,
not claimed from a configuration entry.

## 4. Local data

SQLite owns the local caregiver, dogs, events, medication plans, vaccinations,
expenses, training enrollment/sessions, care tasks and photo references as they
are introduced. No cloud journal account, sync, restore or hosted backup.
IDs use UUIDs; UTC epoch timestamps are grouped by the current device timezone.

Writes commit before success feedback/Flow updates. Compound records save in one
transaction. Validate at repository/domain boundaries; disk work never blocks UI.
Migrations start with schema version 1 and preserve valid records. Corrupt/unsupported
data produces a recoverable error, never silent destructive reset.

Preferences and optional model files are separate from care records. Native
backup policies must match the local-only promise; manual CSV/PDF export is the
caregiver's external copy. Uninstalling/clearing device data loses unexported data.
Deletion requires confirmation and offers export once implemented.

The KMP app does not automatically import the old WatermelonDB journal.
Task015 is required before distributing an update to existing journal users.
Never erase unknown old SQLite/files, even if new onboarding finds no dogs.

## 5. Experience

Home is the most polished screen: selected dog/date, same-day summary, Poop/Pee/
Meal/Walk quick actions and a recent-care view. Basic logs fit in three taps.
Details add timestamps/notes and type-specific fields without slowing quick logs.
Failures keep the draft and explain retry; no success on a failed local write.

Timeline is the factual source, with dog/date/type filters and event detail/edit/
delete. Insights are deterministic factual summaries before any AI work.
Multi-dog switching preserves each dog's scope. Training content ships locally
with positive reinforcement, enrollment, progress and atomic session/event saves.

Care Calendar supports manual plans, recurrence and opt-in reminders. Photos
retain dated owner references; no automatic medical comparison or upload.
Expenses and Memory Book use local records. Vet prep uses factual free exports.

Photo comparison, smart automation, household sharing, sitter mode, journal
sync/backup and remote vet share links are outside this rebuild.

## 6. Design system

Clean paper and ink, strong hierarchy, thin borders, no gradients or shadows.
Color encodes event category or meaningful state. Shared components implement
tokens once, with readable system dark variants.

| Brand token | Light color |
| --- | --- |
| Ink | #0A0A0A |
| Paper | #FAFAFA |
| Surface | #F5F5F4 |
| Border | #E7E5E4 |
| Muted | #737373 |
| Faint | #A3A3A3 |

| Event | Background | Border | Text |
| --- | --- | --- | --- |
| Poop | #FDF3EC | #EDDCCE | #6B3418 |
| Pee | #EEF4FB | #D7E4F2 | #1E3A5F |
| Meal | #F0F5E8 | #DCE6C8 | #2F4017 |
| Walk | #FBF1DD | #EEDCB4 | #5C3F0F |
| Medication | #F3F0FB | #E2DCEF | #362B68 |
| Symptom | #FCEBEB | #F7C1C1 | #791F1F |
| Grooming | #E1F5EE | #9FE1CB | #085041 |
| Weight | #F1EFE8 | #D3D1C7 | #444441 |
| Mood | #F5F0FF | #E0D4F5 | #4A3580 |
| Behavior | #FFF5EC | #FFE0C2 | #7A4510 |
| Training | #EEF8EE | #C8E6C8 | #1B5E20 |

Semantic colors: Success #16A34A, Warning #D97706, Danger #DC2626, AI #534AB7.
Use these when the relevant feature is implemented, with tested dark variants.
Typography: Display 28/500, Title 18/500, Body 14/400, emphasis 14/500,
Caption 12/500, Overline 11/500, stats 24/500. Layout adapts to scaled text.
Spacing: 4, 8, 12, 16, 20, 24, 32 dp. Radius: 4, 8, 12, 14, pill.
Logo: solid five-oval paw, one pad and four toes.

Minimum 44pt iOS / 48dp Android actions, VoiceOver/TalkBack, semantic labels/
headings, readable contrast, no color-only states. Respect safe areas, reduced
motion and Android Back/lifecycle. Measure startup/scroll/memory on actual devices.

## 7. Screens and implementation order

| ID | Screen | Current KMP state |
| --- | --- | --- |
| H1 | Home | Implemented local care loop and animated dog |
| T1 | Timeline | Implemented filters, SQL-bounded pages and local date grouping |
| I1 | Insights | Implemented factual weekly insights |
| P1 | Profile | Implemented profiles and local feature hub |
| O1 | Dog setup | Implemented fast path and optional guided setup |
| H2–H8 | Detail/mood/behavior logging | Core implemented; native QA ongoing |
| T2 | Event detail/edit/delete | Core implemented; native QA ongoing |
| P2/P3/M1/M3 | Medication, settings, switch/add dog | Implemented; physical QA pending |
| P6 | Care Calendar | Implemented; physical QA pending |
| I2 | Monthly trends | Implemented; physical QA pending |
| E0–E4 | Safety, toxicity, emergency, first aid, triage | Implemented; physical QA pending |
| I3 | Vet prep and CSV/PDF | Implemented; physical QA pending |
| TR1–TR3 | Training catalog/program/session | Implemented; physical QA pending |
| T3/T4 | Photo journal/baselines | Implemented; physical QA pending |
| P5 | Expenses | Implemented; physical QA pending |
| I4/AI | Local AI, conversation/captions, optional Atlas | task014/task017/task018 |
| P4 | Memory Book | Implemented; physical QA pending |

Use typed Compose navigation as required by each slice; old Expo paths are not
runtime contracts. No auth gate precedes local onboarding or the four tabs.

## 8. Native capabilities and integrations

Native haptics, private photo pickers, file share/print, phone handoff and opt-in
notifications are implemented behind DeviceServices. Notification permission is
requested only from explicit reminder setup; denial preserves saved tasks. Photo
pickers grant access only to selected images. No runtime camera, location,
microphone or health permission is requested. Physical platform QA is task016.

Ads/billing SDKs and cloud providers from the base were removed. Manifest flags
for auth, analytics, ads and purchases stay disabled. Optional telemetry is
deferred and requires a separate owner request; never collect care notes, IDs,
prompts, answers or export contents.

No credentials are required for simulator/emulator/local journal testing.
Apple team and private signing belong to Xcode/Keychain, not tracked files.
Android upload signing belongs outside the repo. There is no .env workflow until
a concrete optional integration needs client-safe configuration.

## 9. Safety and future AI

Core safety content is bundled and available offline, with source/version
metadata and urgent escalation. Do not use a local model for toxicity, triage,
dosing, treatment or emergency decision-making. Training is positive reinforcement.

Supported AI uses user-downloaded on-device models first, separate from the DB.
No automatic downloads or Home preloading; support cancellation/removal and
recoverable missing-model/offline/device-capability errors. Factual responses
use real journal summaries and never invent records. Photo captions describe
scenes, not health findings.

Atlas is a deferred optional text fallback. Firebase identity is only for that
fallback and never syncs care records. Tokens stay in memory; send a fresh ID
token plus BarkLog's own Atlas UUID. Require matching context-checked headers
for generated health content. Release fallback stays off pending approved free
release/server policy. Never store provider keys in the mobile app.

## 10. Evidence and delivery

tasks/README.md defines the new ordered backlog. Feature status records actual
implementation. Verify metadata, Android Debug/Release/lint/JVM tests and iOS
Debug/Release hosts; record physical device, signing and store gates separately.
See docs/validation.md and docs/release/preflight-local.md.

The RN backup/history is reference material for intent, content and migration.
It is not the current architecture, build instructions or KMP test evidence.
