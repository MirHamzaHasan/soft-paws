# BarkLog Native Build Runbook For AI Assistants

Use this file as a handoff prompt/runbook for ChatGPT, Claude, Codex, or any other assistant helping build BarkLog locally or for device testing.

The main purpose is to avoid confusing a development client with the finished app, avoid leaking environment secrets, and make clear which external accounts are actually required.

## Project Context

- Repo path: `/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log`
- App name: `BarkLog`
- iOS bundle ID: `com.dracoarts.barklog`
- Android package: `com.dracoarts.barklog`
- URL scheme: `barklog`
- Package manager: `pnpm@10.33.0` through Corepack
- Framework stack: Expo SDK 54, Expo Router, React Native 0.81.5, TypeScript, Tamagui, Zustand, TanStack Query, WatermelonDB, Supabase, RevenueCat
- Native modules are used, so Expo Go is not a release proof for this app.

Important files:

- `package.json`
- `app.json`
- `eas.json`
- `ios/BarkLog.xcworkspace` after prebuild/pod install
- `android/` after prebuild
- `.env.local` for local public client values only

Do not print `.env.local` values. It is fine to check whether expected keys exist, but do not echo secrets or full values.

## The Most Important Build Truth

Expo is part of this app's framework, but an Expo account or paid EAS plan is not required for local simulator builds.

There are three different things people often confuse:

| Thing | What It Is | Requires Metro? | Requires Expo Login? | Requires Payment? |
| ---- | ---- | ---- | ---- | ---- |
| Expo framework/packages | Libraries used by this app | No by itself | No | No |
| Expo development client | Debug shell for live development | Yes | No for local simulator | No |
| EAS cloud build | Expo's hosted build service | No | Yes | Not always, but account required |

If the simulator shows `Development Build` and `No development servers found`, the installed app is a Debug development-client build. It is not the finished app. Either start Metro for debugging or install a Release build.

For a finished local simulator test, build and install a Release simulator app.

## What Cannot Be Avoided

- iOS simulator testing does not require an Apple Developer Program subscription.
- Android local debug testing does not require a paid Google Play account.
- Physical iPhone release, ad hoc distribution, TestFlight, and App Store submission require Apple signing. For durable distribution, Apple requires a paid Apple Developer Program membership.
- A free Apple ID may allow a short-lived USB development install through Xcode, but it is not suitable for release QA, TestFlight, push-notification QA, or App Store submission.
- Google Play Store submission requires a Google Play Developer account.
- RevenueCat purchase QA requires RevenueCat setup and store sandbox/product setup.
- Supabase Edge Function features require the relevant Supabase project and secrets.

## Safe Starting Commands

```sh
cd /Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log
corepack enable
corepack pnpm install --frozen-lockfile
```

Run local release gates:

```sh
corepack pnpm release:check-local
```

If you need individual checks:

```sh
corepack pnpm check-types
corepack pnpm release:check-env-boundary
corepack pnpm release:check-native-capabilities
```

Avoid running commands that print all environment variables. Never paste `.env.local` into chat.

## iOS Local Simulator: Finished App Without Expo Dev Screen

This is the path to use when the user wants to test the app on the Mac iOS Simulator without Expo login, EAS, TestFlight, or Metro.

### 1. Ensure iOS Native Project Exists

If `ios/` does not exist, generate it:

```sh
corepack pnpm exec expo prebuild --platform ios
```

Install pods:

```sh
cd ios
pod install
cd ..
```

If `ios/BarkLog.xcworkspace` exists and pods are current, do not regenerate unless native config changed.

### 2. Find Or Install A Simulator Runtime

List destinations:

```sh
xcodebuild -workspace ios/BarkLog.xcworkspace -scheme BarkLog -showdestinations
```

If Xcode reports a missing platform such as `iOS 26.5 is not installed`, install the runtime:

```sh
xcodebuild -downloadPlatform iOS
```

Then rerun `-showdestinations` and choose an available iOS Simulator destination.

### 3. Build Release Simulator App

Replace `SIMULATOR_ID_HERE` with an available simulator ID from `-showdestinations`.

```sh
xcodebuild \
  -workspace ios/BarkLog.xcworkspace \
  -scheme BarkLog \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=SIMULATOR_ID_HERE' \
  -derivedDataPath ios/build/DerivedData-sim-release \
  build
```

Expected result:

```txt
** BUILD SUCCEEDED **
```

Expected output app:

```txt
ios/build/DerivedData-sim-release/Build/Products/Release-iphonesimulator/BarkLog.app
```

The Release build embeds `main.jsbundle`. That is why it opens BarkLog directly and does not need Metro.

### 4. Install And Launch The Release App

```sh
xcrun simctl boot SIMULATOR_ID_HERE
xcrun simctl bootstatus SIMULATOR_ID_HERE -b
xcrun simctl terminate SIMULATOR_ID_HERE com.dracoarts.barklog || true
xcrun simctl uninstall SIMULATOR_ID_HERE com.dracoarts.barklog || true
xcrun simctl install SIMULATOR_ID_HERE ios/build/DerivedData-sim-release/Build/Products/Release-iphonesimulator/BarkLog.app
xcrun simctl launch SIMULATOR_ID_HERE com.dracoarts.barklog
open -a Simulator
```

Optional verification screenshot:

```sh
xcrun simctl io SIMULATOR_ID_HERE screenshot /tmp/barklog-release-launch.png
```

Expected screen: BarkLog splash/onboarding/home, not the Expo development-server picker.

## iOS Local Simulator: Debug Development Client

Use this only when actively developing and needing live reload/debugging.

```sh
corepack pnpm start
```

Then in another terminal:

```sh
corepack pnpm ios
```

Or run Xcode Debug from `ios/BarkLog.xcworkspace`.

Expected behavior:

- The app may show `BarkLog Development Build`.
- It needs Metro running.
- If Metro is not running, it will show `No development servers found`.

This is normal for Debug. It is not a release problem.

## iOS Physical Device Without EAS Cloud

This is possible only if Apple signing is configured locally.

Open the workspace:

```sh
open ios/BarkLog.xcworkspace
```

In Xcode:

1. Select the `BarkLog` project.
2. Select the `BarkLog` target.
3. Open `Signing & Capabilities`.
4. Choose a Team.
5. Confirm bundle identifier is `com.dracoarts.barklog`.
6. Connect the iPhone by USB.
7. Choose the iPhone as the run destination.
8. Build and run.

Notes:

- A free Personal Team may work for temporary USB development installs, but the app can expire and capabilities may be limited.
- Durable install links, TestFlight, App Store, and full push notification/purchase QA require a paid Apple Developer Program account.
- Simulator `.app` files cannot be installed on a real iPhone. Real iPhones require `iphoneos` builds and code signing.

Local archive command template:

```sh
xcodebuild \
  -workspace ios/BarkLog.xcworkspace \
  -scheme BarkLog \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath ios/build/BarkLog.xcarchive \
  archive
```

If this fails with signing/provisioning errors, the fix is Apple signing configuration, not Expo payment.

## EAS Cloud Builds Are Optional

EAS is useful for shareable internal builds and production builds, but it is not required for local simulator testing.

Current `eas.json` profile meanings:

```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "environment": "development"
  },
  "preview": {
    "distribution": "internal",
    "environment": "preview"
  },
  "production": {
    "autoIncrement": true,
    "environment": "production"
  }
}
```

Use:

```sh
corepack pnpm dlx eas-cli@latest whoami
```

If this says `Not logged in`, EAS cloud builds are blocked until login or `EXPO_TOKEN` is provided. Local Xcode simulator builds are not blocked.

For iPhone preview builds through EAS:

```sh
corepack pnpm dlx eas-cli@latest login
corepack pnpm dlx eas-cli@latest device:create
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```

The installed `preview` app must launch without Metro or the Expo dev-client server picker.

## Android Local Build Paths

If `android/` does not exist, generate it:

```sh
corepack pnpm exec expo prebuild --platform android
```

Debug install on emulator or USB device:

```sh
corepack pnpm android
```

Release APK build:

```sh
cd android
./gradlew :app:assembleRelease
cd ..
```

Likely output:

```txt
android/app/build/outputs/apk/release/app-release.apk
```

If release signing is not configured, Gradle may fail or produce an unsigned/uninstallable artifact. For local Android testing, use Debug or configure a local keystore. For Play Store, produce a signed AAB with proper Play signing:

```sh
cd android
./gradlew :app:bundleRelease
cd ..
```

Android preview through EAS is optional:

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform android
```

## Environment Rules

App users do not receive Supabase keys. They install and use BarkLog normally.
The production app bundle contains only client-safe public values; authenticated
calls and AI-backed work go through Supabase Edge Functions.

Optional signup contact preferences are account-owner data stored behind
Supabase RLS. Do not place phone numbers, chat handles, preferred names, or
other contact details in analytics events, Sentry context, environment files, or
release evidence.

Client-safe values may be embedded in the app:

```txt
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_MIXPANEL_TOKEN
EXPO_PUBLIC_SENTRY_DSN
```

For production EAS builds, configure those public values in the Expo/EAS
`production` environment, not by editing app source files:

```sh
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co"
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_PUBLIC_ANON_KEY"
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "YOUR_PUBLIC_REVENUECAT_IOS_KEY"
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "YOUR_PUBLIC_REVENUECAT_ANDROID_KEY"
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_MIXPANEL_TOKEN --value "YOUR_PUBLIC_MIXPANEL_TOKEN"
corepack pnpm dlx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_SENTRY_DSN --value "YOUR_PUBLIC_SENTRY_DSN"
```

Server-only values must not be in `.env.local`, `app.json`, `eas.json`,
`env.example`, `app/`, `src/`, EAS client env, or the built bundle:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BARKLOG_TEXT_AI_*
BARKLOG_VISION_AI_*
```

Server-only values belong only in the production Supabase project's Edge
Function secrets:

```sh
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co" --project-ref YOUR_PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" --project-ref YOUR_PROJECT_REF
supabase secrets set BARKLOG_TEXT_AI_API_KEY="YOUR_TEXT_AI_KEY" --project-ref YOUR_PROJECT_REF
supabase secrets set BARKLOG_VISION_AI_API_KEY="YOUR_VISION_AI_KEY" --project-ref YOUR_PROJECT_REF
```

Secret scans:

```sh
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist app src env.example
```

If a real secret appears, stop and fix it before building.

## Common Problems And Fixes

| Symptom | Cause | Fix |
| ---- | ---- | ---- |
| Simulator shows `Development Build` and `No development servers found` | Debug dev-client app installed without Metro | Start `corepack pnpm start` or replace it with a Release simulator build |
| User expected finished app but sees Expo UI | Wrong build type | Build `Release` with `xcodebuild`, install `DerivedData-sim-release/.../BarkLog.app` |
| `iOS X.Y is not installed` | Xcode simulator runtime missing | Run `xcodebuild -downloadPlatform iOS` |
| `ios/BarkLog.xcworkspace` missing | Pods not installed or prebuild not done | Run `expo prebuild --platform ios`, then `cd ios && pod install` |
| `pod install` fails | CocoaPods or native dependency issue | Run from `ios/`, inspect first fatal error, avoid deleting `ios/` unless config changed |
| EAS says `Not logged in` | EAS cloud requires auth | Use local Xcode build, or login/provide `EXPO_TOKEN` if cloud build is desired |
| Real iPhone install fails | Signing/provisioning issue | Configure Xcode Team/cert/profile or register device for ad hoc build |
| Simulator build installed on iPhone fails | Simulator binaries are not physical-device binaries | Build for `iphoneos` with signing |
| App opens but backend features fail | Supabase/RevenueCat/Sentry/Mixpanel env or backend setup missing | Verify client env keys and Supabase Edge Function secrets |
| Notifications do not prompt immediately | BarkLog should prompt only when reminder flow needs it | Test reminder creation, not first launch |
| RevenueCat purchases fail | Store products/sandbox/offering not configured | Check RevenueCat entitlement `premium`, products, offering, and store sandbox |
| TypeScript passes but native build fails | Native dependency/toolchain issue | Use the first Xcode/Gradle fatal error, not warning noise |
| Many third-party warnings appear | Normal native dependency warnings | Ignore unless build exits nonzero |

## Assistant Behavior Rules

When helping with builds:

1. Do not claim Expo payment is required for local simulator builds.
2. Do not use Expo Go as proof that BarkLog is release-ready.
3. Do not confuse Debug development-client builds with Release builds.
4. Do not print `.env.local` values.
5. If the user wants no Expo account, use local Xcode/Gradle paths.
6. If the user wants physical iPhone distribution, explain Apple signing requirements directly.
7. If a command fails, report the first concrete fatal error, not the warning flood.
8. Keep the installed simulator app aligned with the user's intent: Debug for live development, Release for finished-app testing.

## Known Good iOS Simulator Result

On 2026-05-13, this repo successfully built a Release simulator app with:

```sh
xcodebuild \
  -workspace ios/BarkLog.xcworkspace \
  -scheme BarkLog \
  -configuration Release \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=A37B114E-A7F2-4A26-9133-AC7AC3017024' \
  -derivedDataPath ios/build/DerivedData-sim-release \
  build
```

The resulting app installed and launched directly to BarkLog onboarding:

```txt
ios/build/DerivedData-sim-release/Build/Products/Release-iphonesimulator/BarkLog.app
```

This confirmed that the Expo development-server picker was caused by installing a Debug development-client build, not by an unavoidable Expo platform requirement.
