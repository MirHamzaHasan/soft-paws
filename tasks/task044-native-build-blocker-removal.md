# Task 044: Native Build Blocker Removal

- Status: `completed`
- Priority: `P1`
- Phase: `Native Release Readiness`
- Depends on: `task043`

## Objective

Remove local native-build blockers before iOS and Android preview-device QA.

## Completion Notes

- Aligned Expo SDK 54 dependencies with Expo Doctor and `expo install --check`.
- Replaced incompatible `expo-font@55` with SDK 54 `expo-font@14`.
- Added direct `react-native-worklets` and `expo-system-ui` dependencies required by the native runtime/config.
- Added Expo Doctor package exclusions for intentional WatermelonDB packages.
- Updated Android config to allow notifications and RevenueCat billing while blocking storage and system-overlay permissions.
- Regenerated the Android native project with clean Expo prebuild so package paths and manifest output match `app.json`.
- Updated native review docs and capability tests to include RevenueCat billing permission.

## Native Capability Position

- Allowed Android permissions:
  - `android.permission.POST_NOTIFICATIONS`
  - `com.android.vending.BILLING`
- Blocked Android permissions:
  - `android.permission.READ_EXTERNAL_STORAGE`
  - `android.permission.SYSTEM_ALERT_WINDOW`
  - `android.permission.WRITE_EXTERNAL_STORAGE`
- iOS remains without camera, location, or Health permission copy.

## Validation

- `corepack pnpm install --frozen-lockfile` passed.
- `corepack pnpm exec expo install --check` passed.
- `corepack pnpm dlx expo-doctor@latest` passed with 17/17 checks.
- `corepack pnpm check-types` passed.
- `corepack pnpm lint --quiet` passed.
- `corepack pnpm test -- --runInBand` passed with 48 suites and 181 tests.
- `corepack pnpm exec expo export --platform web` passed.
- `./gradlew :app:processDebugMainManifest` passed after adding ignored local Android SDK path configuration.
- `./gradlew :app:processReleaseMainManifest` passed.
- `rg "ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" dist` returned no matches.
- `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src` returned no matches.
- `rg -n "READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml | rg -v 'tools:node="remove"'` returned no active unwanted permission declarations.
- `rg -n "POST_NOTIFICATIONS|com.android.vending.BILLING" android/app/src/main/AndroidManifest.xml` confirmed expected notification and billing permissions.
- `rg -n "READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|SYSTEM_ALERT_WINDOW|POST_NOTIFICATIONS|com.android.vending.BILLING" android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml` confirmed only notification and billing permissions in the release merged manifest.

## Remaining External Gates

- EAS CLI is not logged in in this local session, so preview EAS env inspection and cloud build submission still require Expo account login.
