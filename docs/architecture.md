# BarkLog KMP architecture

**Current AI route — task039:** AppContainer selects AtlasResponseProvider. The
local runtime module is absent from active startup/cleanup and no local AI getter
is read. The owner paused local models/RAG and the approved new care card before
native UI. Explicit cloud consent/profile/record selection and Firebase/policy
receipts remain required; Release stays gated. Earlier task037 sections describe
the retained paused implementation. See product/local-ai-and-atlas.md.


Source lineage: Draco KMP base de1b575911bc514fde95ffba74aca33b0beea0f2.
One shared Compose UI is hosted by Android ComponentActivity and iOS SwiftUI.
The shared namespace stays com.dracoarts.shared, as the base's setup tool intends.
Product application identifiers are separate and already set to BarkLog.

## Ownership

Paths are relative to shared/src/commonMain/kotlin/com/dracoarts/shared.

| Layer | Current files | Rule |
| --- | --- | --- |
| Entry | App.kt | Own composition and lifecycle; no business persistence |
| Presentation | presentation/screens/BarkLogScreens.kt, presentation/state/JournalController.kt | Screen-specific feature routes, committed local activity, retained drafts and scoped recovery |
| Navigation | presentation/navigation/AppState.kt | Typed tab/event/feature stacks; saved state and dirty-form Back guards |
| Theme | presentation/theme/AppTheme.kt | Bundled Bricolage/Inter board type; per-screen geometry and acceptance in task022 |
| Components | presentation/components/AppComponents.kt | Paw, brand, cards, headings, startup UI |
| Domain | domain/model, domain/repository/JournalRepository.kt | Product record contracts; platform/UI independent |
| Data | data/local, commonMain/sqldelight | SQLDelight repository and preserving v4 schema, no sample snapshot store |
| Composition | services/AppContainer.kt, AppPlatform.kt | Explicit dependencies and device capability boundary |
| Lifecycle | services/ModuleRegistry.kt, presentation/state/StartupController.kt | Ordered init, rollback, retry, cancellation, reverse cleanup |
| Services | managers/AppManagers.kt | Preferences/haptics plus narrow DeviceServices adapters; no eager networking |

Platform sources: androidApp/src/main/kotlin/com/draco/arts/apps/bark/log/dogs/journal
and shared/src/iosMain/kotlin/com/dracoarts/shared. SwiftUI ContentView hosts
MainViewController. Shared resources live in shared/src/commonMain/composeResources.
The tracked iOS Info.plist supplies Compose's required frame-duration key;
Gradle resource synchronization packages fonts and their license into both bundles.

## Device-local care storage

SQLDelight 2.1.0 owns barklog_kmp_v1.db with Android and iOS SQLite drivers.
The iOS Swift host links system SQLite (-lsqlite3) for the static shared framework.
No network/account credential is involved. Schema v2 adds typed detail JSON,
update time and optimistic revision to the v1 owner/dogs/events/metadata schema.
Schema v3 adds profile/context JSON, typed care items, retained drafts and a durable
device cleanup queue. The original v1 snapshot, 1.sqm and 2.sqm preserve records; migrations are verified
by tools/verify.py and Android CI. Schema v4 adds local_documents for the optional
setup draft, local demo session and dog-scoped conversations. It preserves v3
care tables and the same database filename. See shared's data README for backup/file policy.
JournalRepository returns observable local reads and suspending writes.
Commit before emitting or returning success; serialize mutations when needed,
use transactions for coupled records, and run disk work off the UI thread.

Preferences store selected dog/settings, never care data. IDs are UUIDs,
timestamps are UTC epoch milliseconds, and presentation groups by device-local
day/timezone. Add migrations and tests from the first persisted schema.
The required LocalDataModule owns repository startup/retry and cleanup. Startup
checks version, format, integrity and references without any automatic reset.
JVM integration tests exercise real SQLite; native Android tests use a separately
named test journal. JournalController coordinates observations and saving feedback.
kotlinx-datetime 0.7.1 supplies device-zone/DST-aware calendar grouping; timestamps
are never rewritten when the timezone changes. Forms retain SQLite drafts and stable request IDs; transient UI state uses rememberSaveable.
TimelineController reads SQLite-limited filtered pages, rendered with LazyColumn
(50 initially, Show older records expands the SQL limit). Home reads count
aggregates and only three recent records. EventController owns scoped lookup and
post-commit create/edit/delete feedback; EventDraft is saveable form state.
Stable request UUIDs prevent duplicate create retries. Optimistic revisions protect
edits and confirmed deletes from overwriting a changed record. AppState saves
typed New/Detail/Edit context, and a saveable state holder retains Timeline filters.

## Feature delivery

Extend each feature's presentation/domain/data code together. Prefer a small
controller with StateFlow for meaningful asynchronous screen state; avoid giant
manager classes and service locators. AppContainer owns repositories and
controllers' dependencies. Native permissions/export/photo/inference adapters
stay behind narrow interfaces with both platform implementations.

## Retained and removed base elements

Retained: Gradle wrapper/version catalog, Compose resource support, shared UI
host strategy, preference/haptic adapters, module lifecycle and plugin tooling.
DeviceServices owns explicit photo selection, private files, CSV/PDF share/print,
contact handoff, foreground state and opt-in reminders. Android uses inexact alarms
and boot reconciliation; iOS queues bounded upcoming occurrences and refreshes on
foreground. Denial never blocks task saves. See [native port](native-board-port.md).

Removed: sample item repository/editor/account screens, persistent Firebase
credentials, remote HTTP clients, PostHog delivery, ads/billing managers and
providers, MAX Swift package and Play Billing/AppLovin dependencies.
The disabled integration manifest entries preserve tooling compatibility;
enabling a flag alone cannot recreate a removed provider.

See [plugins](plugins.md), [product truth](agentic/product-truth.md),
and [migration decision](migration/react-native-to-kmp.md).

## Companion chapter (task027)

`presentation/companion/CompanionController` owns durable setup, explicit context,
local demo identity and per-dog conversations through `LocalDocumentRepository`.
`DogContext` is an optional domain value inside existing DogDetails JSON.
`CompanionResponseProvider` is the replaceable response boundary; this pass installs
only `DemoResponseProvider`, with no network client or credential. The journal can
be opened without sign-in. Demo Premium is an explicit local UI state; it grants
no actual entitlement and starts no purchase or trial.

The 54 typed companion routes share the normal Compose host and board motion
engine. Message writes commit before the composer clears. Replies save their
selected dog/profile/record snapshots, while cancellation stores a partial reply
without source claims. Switching dogs cancels and joins the previous writer before
loading that dog's workspace. Sign-out preserves conversations; confirmed demo
account deletion removes them while retaining all care records.

Task033 adds transient `PremiumFeature` context to the existing Premium route.
`PremiumExportAccess` checks report/Memory Book PDF destinations before file
preparation; raw CSV and mobile previews remain free. Existing-dog legacy review
also loads the companion so its actions work. The local demo flag is not a store
entitlement; real billing/Atlas are still absent. A future photo-highlight renderer
must be wired behind AppContainer; the current editor is a board proposal only.

Native camera and notification authorization live behind DeviceServices. Android
uses the system camera through a scoped FileProvider URI; iOS asks for camera
access in context. Selected photos become bounded private copies. Setup-owned
check-in tasks reconcile only their stable IDs and never rewrite independent
task or medication opt-ins. No simulator/device run was requested for this port.


## Native Rive mascot (task032)

The approved original spaniel is a bundled .riv, with a shared neutral PNG for
loading, reduced motion, failure and navigation snapshots. Shared AnimatedDog
owns greeting/save timing, shuffled quiet idles and viewport/foreground policy.
Its platform renderer boundary does not read or mutate journal data. Android uses
the official Compose runtime with owned worker/file/controller resources; iOS
injects the official Swift Rive renderer factory from the host and lazily caches
one file/worker, with independent per-view controllers and explicit disposal.
Compose 1.10.3 supplies the transparent UIKit overlay API needed on iOS. Live native
surfaces draw directly; a same-art still is recorded during shared-element/page
transitions to avoid recording a native Texture/Metal surface into a Compose layer.
The exported art and native rest image remain transparent. Runtime assets are
local, independent of the Rive editor/workspace subscription and app services.


Task034: `HighlightDraft` is a platform-free ordered edit model; SQLite
`care_drafts` stores JSON and explicit photo references atomically. This preserves
existing attachment reference counting/cleanup and dog deletion. AppContainer
owns `HighlightController` and platform `HighlightRenderer`; ModuleRegistry closes
its coroutine scope before local-data. Shared Compose owns preview/edit/progress;
Android Media3 and the injected Swift `IosVideoEngine` own native codecs/files.


### Chat care tools · task035 (2026-10-17)

The approved compact chat now includes up to three local photo attachments per message, saved vet/emergency call actions and a vet-report mobile preview. SQLite transfers composer attachment ownership atomically into each saved conversation. Report PDF uses the existing Premium gate; mobile preview and care logging remain free. Caregiver messages/selected dog-scoped records are factual inputs; demo AI replies and photos are separate opt-ins. General medication education never selects drugs/doses or treatment. Images are not analyzed or uploaded. Native verification is tracked in task035; real AI, billing and clinical review remain deferred.


## task036 Firebase Authentication · 18 October

Owner-selected Android/iOS application ID is now `com.draco.apps.bark.log`.
`domain/repository/Authentication.kt` defines the token-free identity boundary.
`services/NativeAuthentication.kt` adapts native callbacks to StateFlow/suspending
operations and owns listener lifecycle via ModuleRegistry. AppContainer injects
this service into CompanionController. Native adapters are `AndroidFirebaseAuth`
and injected Swift `BarkFirebaseAuth`; official SDK secure persistence restores
identity. Saved historical demo identity is ignored; only demo Premium remains in
the legacy local session document. Existing local care/conversations stay on the
phone and are not synchronized. Provider setup and live/device proof remain
pending; [task036 setup](product/firebase-authentication.md) is authoritative over
the historical demo-only descriptions above.

## task037 · local AI and Atlas

AppContainer now wires RealResponseProvider in the normal app; demo replies remain
only in explicit review/test hosts. LocalAi owns optional GGUF models through
ModelStore and Llamatik native bridges. AtlasClient uses native Firebase tokens,
a separate bounded HTTP transport and mandatory context receipts. ModuleRegistry
owns shutdown; weights never load on Home. SQLite preserves response sources and
cloud choice. See [the data/runtime contract](product/local-ai-and-atlas.md).

Task037 refinement, 18 October: the owner requested automatic local dog context.
After AI opt-in, each local question receives the current dog's profile and up to
12 recent/relevant observations from a bounded query of the latest 60 timeline
records, including structured care details. General non-clinical dog-care
education does not require logs. Local request context is separate from the
explicitly allowed Atlas profile/record fields; history filtering prevents
unshared local-source answers from becoming cloud context. Clinical assessment,
diagnosis, prescribing and automatic photo/cloud upload remain excluded.

Task039 supersedes local inference in the active app: normal chat is authenticated
Atlas-only; installed models and legacy source labels remain preserved. Task041
adds `JournalRepository.readCareWeek`, implemented as a SQLDelight read transaction
with a fresh dog, seven local-day counts and bounded relevant/latest observations.
`prepareWeeklyContext` enforces the cloud byte budget, honest total/shared counts
and source snapshots. Versioned affirmative scope is required before those reads
and requests; earlier consent cannot expand silently. Native cards render database
facts independently of model prose. Server feature IDs/receipt checks remain intact.

Task042 adds `InteractionSounds` to AppManagers, with native SoundPool/AVAudioPlayer
adapters and bundled original PCM resources. Compose control helpers invoke semantic
cues; committed-write callbacks supply the saved cue. Settings persist only UI
preferences. No playback failure propagates into a journal write. Lifecycle cleanup,
foreground/mute checks and one-voice/repeat guards stay in the sound boundary.

Task043 adds the additional-dog mode to the existing CompanionController/Compose
onboarding. `companion-add-dog` is an independent SQLite document; first-run and
profile edits retain `companion-setup`. Stable request IDs keep final dog creation
idempotent. One coordinated navigation action crosses between the companion
setup and AppState's journal/switcher routes. No schema, app identity or cloud
persistence changes are required. Native UI QA uses the isolated AddDog review
data set through the real repositories.
Journal selection validates against a fresh repository snapshot because the
screen observer can lag a committed profile. It returns recoverable missing/read
errors, clears the previous dog's care state on a switch, and opens Home after
the selected dog's summary is ready.

Task044 routes journal tabs and the companion account menu through
`CompanionController.navigateTab`. The selected AppState route and menu change
inside one Tab callback. Separate `show`/`go` requests can cancel the earlier
deferred transition and leave the selected tab behind the displayed screen.

Task045 keeps AccountSettings inside that journal shell's existing BoardScene.
The same bottom dock and pill Animatable survive Profile entry/exit, outside the
page transition. CompanionHostContent reuses the account content with its parent
handling safe areas and measured dock space. Full-screen companion routes still
use CompanionHost. Both controllers receive the active scene handler so nested
account actions retain the existing navigation behavior.
