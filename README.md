# Soft Paws

A cat-care journal built from the Draco/BarkLog Kotlin Multiplatform foundation.
This is the separate [Soft Paws repository](https://github.com/MirHamzaHasan/soft-paws).

The new design is a complete review board with cat onboarding, daily care,
litter logging, timeline, health, reminders, insights, safety, photos, expenses,
Memory Book, highlights, AI and account/Premium flows. Its original tabby is a
real Rive asset with an editable backup. See [the board](design/soft-paws/README.md)
and [current scope and status](tasks/soft-paws-task001-cat-redesign.md).

```sh
node design/soft-paws/tools/serve.mjs 4285
```

Open <http://localhost:4285/>. Use Research, Kit, Screens, Transitions, Pick/Note
and Play the flow. All board records are synthetic and stay in memory; it does
not read native journals or call AI, authentication, billing or location services.

**Native status:** the inherited app remains the BarkLog base. The new Soft Paws
screens await review before shared Compose adoption. Do not install the inherited
IDs over BarkLog journals. Separate application/service identities and cat domain
adaptation are subsequent work; no native cat-parity or release claim is made.

[Soft Paws product truth](docs/source-of-truth/soft-paws-product-engineering.md) ·
[Original Rive cat](design/soft-paws/assets/cat/manifest.json) ·
[Inherited base guide](AGENTS.md)

---

## Inherited BarkLog README (historical)

The text below records the foundation's history. Its identity and historical
service/status statements are not Soft Paws delivery claims.

# BarkLog

Daily dog health, in one tap.

A fresh Kotlin Multiplatform rebuild using
[MirHamzaHasan/draco-kotlin-base](https://github.com/MirHamzaHasan/draco-kotlin-base)
at commit `de1b575911bc514fde95ffba74aca33b0beea0f2`.

The approved design board is implemented as shared native Compose screens with
real local logic: setup, Home, detailed logs, Timeline, profiles/settings, health
records, calendar, insights, Safety Center, CSV/PDF, training, private photos,
expenses and Memory Book. The dog reacts after committed logs. SQLDelight schema
v4 preserves KMP journals across restarts and numbered migrations.
See [native board port](docs/native-board-port.md) for mapping and verification.
AI, legacy React Native journal import and physical/store release QA remain separate.


The latest companion chapter adds detailed multi-select dog onboarding, editable
profiles, permission switches, a larger animated mascot, account/plan screens and
conversation UI. Sign-in and AI replies are **local demos**, as requested; profile
and conversation persistence is real SQLite. No Firebase, online AI or store
billing is connected. Prices remain undecided. See
[task027](tasks/task027-native-companion-board-and-main.md).

## Run

Requirements: JDK 17+, Android SDK platform 36 for Android, Python 3.9+ for tools,
and a Mac with Xcode for iOS. Android minimum API 24; iOS minimum 15.0.

For iOS, open `iosApp/iosApp.xcodeproj`, choose the `iosApp` scheme and an
iPhone simulator, then Run. Xcode builds and embeds the Kotlin framework.
A physical iPhone needs your Apple Development Team.

For Android, open the repository in Android Studio and run `androidApp`.
Set `ANDROID_HOME` or an ignored `local.properties` with `sdk.dir=...`.

```sh
./gradlew :androidApp:assembleDebug
./gradlew :androidApp:testDebugUnitTest
./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
python3 tools/verify.py --metadata-only
python3 tools/verify.py
python3 tools/verify.py --ios
```

No service credentials, Node, Metro, CocoaPods or environment file is needed.
Debug Android APK: `androidApp/build/outputs/apk/debug/androidApp-debug.apk`.
Release Android compilation produces an unsigned artifact; store signing is a later task.

## Project map

- `shared/`: shared Compose UI, domain contracts, platform Kotlin adapters.
- `androidApp/`: Android activity, device adapters, JVM tests.
- `iosApp/`: tracked SwiftUI host and Xcode project.
- `template/plugins.json`: inherited integration flags; haptics and opt-in notifications are enabled.
- `tools/`: configuration, documentation and build verification.
- `docs/`: new product, architecture, design and delivery context.
- `tasks/`: ordered KMP rebuild tasks with dependencies and acceptance criteria.

Start at [AGENTS.md](AGENTS.md), [the canonical spec](docs/source-of-truth/barklog-product-engineering.md),
and [the task index](tasks/README.md). The complete board application is tracked in
[task021](tasks/task021-complete-board-application.md). Physical QA/signing remains
[task016](tasks/task016-native-qa-signing-and-release.md); legacy compatibility is
[task015](tasks/task015-legacy-journal-migration.md).

## Rewrite boundary

The owner requested a new framework and a fresh backlog, not automatic feature
parity. The old code, local configuration and uncommitted work were moved to a
recoverable sibling backup; original Git history remains in this repository.
See [migration notes](docs/migration/react-native-to-kmp.md).

The new app uses the existing platform IDs but does not read the old WatermelonDB
journal. Do not install over a device containing valuable records before reviewing
the migration/export task. Do not uninstall that app to test this preview.

No ads, purchases, account gates, cloud journal storage or hosted telemetry are
configured. AppLovin, Play Billing, RevenueCat and PostHog providers are absent.
