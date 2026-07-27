# Task 047: Preview Builds And Native Device QA

- Status: `in_progress`
- Priority: `P0`
- Phase: `Native Release Build Readiness`
- Depends on: `task046`

## Objective

Create signed Android and iOS preview builds, install them on real devices, and capture release evidence that BarkLog launches and works without Metro, Expo Go, or a development-client launcher.

## Release Build Position

Preview builds are the first release-proof installable builds.

- Android preview builds should install directly on physical Android phones.
- iOS preview builds require registered iPhone devices through EAS ad hoc provisioning.
- Preview builds must launch from the phone home screen without a local Expo server.
- Preview builds must preserve free logging, Timeline access, manual export, and urgent safety tools.

## External Inputs

- Passing `task046` environment gates.
- Android phone for direct install QA.
- Registered iPhone for iOS ad hoc QA.
- Apple Developer access for device registration and signing.
- Test accounts for free, trial, expired, and Premium states.
- RevenueCat sandbox tester accounts.
- Preview Supabase project with deployed functions.

## In Progress Notes

- Started local preview-build readiness while signed preview builds remain blocked on `task045` and `task046` external gates.
- Added `corepack pnpm release:check-native-capabilities` to verify the checked native files keep BarkLog's current capability surface release-safe before EAS builds.
- The local capability check confirms Android notification and billing declarations are present, blocked storage/system-overlay permissions are not active, and camera, location, media-library, microphone, storage, overlay, and health permissions are absent from checked native files.
- Local validation passed on 2026-05-13: `./gradlew :app:processReleaseMainManifest`, `corepack pnpm release:check-native-capabilities`, `corepack pnpm release:check-env-boundary`, targeted ESLint for release scripts, and `corepack pnpm check-types`.
- Actual Android/iOS preview build URLs, device installs, RevenueCat sandbox evidence, Supabase smoke evidence, and observability dashboard evidence still require external project/device access.

## Scope

- Run the local automated gates before spending EAS build time.
- Build Android preview first:

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform android
```

- Register iPhone devices before the iOS build:

```sh
corepack pnpm dlx eas-cli@latest device:list
corepack pnpm dlx eas-cli@latest device:create
corepack pnpm dlx eas-cli@latest device:list
```

- Build iOS preview:

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```

- Install both builds on real devices.
- Record build URLs, device models, OS versions, tester, date, and result in release evidence.
- Complete the relevant deployment checklists:
  - `docs/deployment/release-preflight-checklist.md`
  - `docs/deployment/native-device-qa-checklist.md`
  - `docs/deployment/auth-trial-data-lifecycle-smoke-test.md`
  - `docs/deployment/watermelondb-supabase-sync-smoke-test.md`
  - `docs/deployment/revenuecat-sandbox-purchase-checklist.md`
  - `docs/deployment/observability-preview-checklist.md`

## Required Device QA

- App launches without Metro or Expo Go.
- Home logs `Poop`, `Pee`, `Meal`, and `Walk`.
- Offline logging persists after app restart.
- Timeline shows local events.
- Safety Center urgent actions and offline content are not Premium-gated.
- CSV export opens the native share sheet.
- Basic Vet Prep PDF export opens the native share sheet.
- Notification permission appears only from reminder-related actions.
- Denying notifications does not block medication or care task saves.
- Free users retain logging, Timeline, CSV export, basic PDF export, and urgent safety tools.
- Premium gates protect AI, sync/backup, household sharing, secure share links, advanced summaries, and training progress.
- RevenueCat purchase, cancel, restore, and non-subscriber restore cases behave correctly.
- Supabase sync and Edge Function smoke tests pass for Premium users.
- AI outputs stay non-diagnostic and emergency wording returns escalation copy.
- Mixpanel and Sentry preview events exclude raw notes, symptoms, prompts, answers, CSV content, and PDF text.

## Out Of Scope

- No production/TestFlight build submission.
- No new native permissions.
- No new backend runtime.
- No new product features.

## Acceptance Criteria

- Android preview build URL is recorded.
- iOS preview build URL is recorded.
- At least one Android phone and one iPhone launch BarkLog without a development server.
- Native QA checklist has passing or explicitly blocked rows for required release surfaces.
- Release preflight checklist contains dated preview-build evidence.
- Any blocker discovered during QA is split into a new task before production builds.

## Validation

Local gates before EAS builds:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm exec expo install --check
corepack pnpm dlx expo-doctor@latest
corepack pnpm check-types
corepack pnpm lint --quiet
corepack pnpm test -- --runInBand
corepack pnpm release:check-eas
corepack pnpm release:check-env-boundary
corepack pnpm exec expo export --platform web
rg "ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" dist
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src
```

Native manifest gate:

```sh
cd android
./gradlew :app:processReleaseMainManifest
cd ..
corepack pnpm release:check-native-capabilities
rg -n "READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml | rg -v 'tools:node="remove"'
rg -n "POST_NOTIFICATIONS|com.android.vending.BILLING" android/app/src/main/AndroidManifest.xml
```

Expected result:

- Automated gates pass.
- No server-only secrets appear in client source or exported bundles.
- Android release manifest keeps notification and billing permissions only from the searched native permission set.
- Preview builds install and launch without a local server.
