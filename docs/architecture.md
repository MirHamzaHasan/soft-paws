# BarkLog KMP architecture

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

Native camera and notification authorization live behind DeviceServices. Android
uses the system camera through a scoped FileProvider URI; iOS asks for camera
access in context. Selected photos become bounded private copies. Setup-owned
check-in tasks reconcile only their stable IDs and never rewrite independent
task or medication opt-ins. No simulator/device run was requested for this port.
