# iOS Physical Device Testing Guide

Historical remote-build guide. Use [local native builds](../release/local-build.md) and the [local release preflight](../release/preflight-local.md) for current iPhone testing.

Use this guide to get BarkLog onto a real iPhone, run preview QA, and know when it is safe to move to TestFlight.

## Scope

This guide is for the current Expo app in this repo:

- App name: `BarkLog`
- Bundle identifier: `com.dracoarts.barklog`
- URL scheme: `barklog`
- Expo SDK: `54`
- EAS profiles: `development`, `preview`, `production`
- Preferred first iPhone test path: EAS `preview` internal distribution

Do not use Expo Go as the release proof for BarkLog. This app uses native modules such as WatermelonDB, RevenueCat, Expo Notifications, MMKV, and `expo-dev-client`; a real installed build is required.

## Source References

Checked on 2026-05-04:

- Expo internal distribution: https://docs.expo.dev/build/internal-distribution/
- Expo development builds: https://docs.expo.dev/develop/development-builds/create-a-build/
- Expo EAS environment variables: https://docs.expo.dev/eas/environment-variables/
- Expo production iOS/TestFlight flow: https://docs.expo.dev/tutorial/eas/ios-production-build/
- Apple TestFlight overview: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/

## Choose The Right iPhone Build

| Path | Use When | Needs Dev Server | Distribution |
| ---- | -------- | ---------------- | ------------ |
| `preview` | Release preflight, stakeholder QA, real iPhone smoke tests | No | EAS internal ad hoc install link |
| `development` | Active debugging with live Metro updates | Yes | EAS internal ad hoc install link |
| `production` + TestFlight | Preview has passed and you need App Store Connect beta testing | No | App Store Connect/TestFlight |

Start with `preview`. Move to `development` only when you need live JS debugging on the device. Move to `production` only after preview QA is clean.

## Current Native Capability Position

| Capability | Current iOS Position | Expected Test Behavior |
| ---------- | -------------------- | ---------------------- |
| Notifications | Configured through `expo-notifications` | Prompt appears only after a caregiver enables reminders or saves a scheduled care item |
| Camera | Not configured | No camera permission prompt should appear |
| Location | Not configured | Emergency clinic actions should use external maps/search without BarkLog requesting location |
| Apple Health | Not configured | No HealthKit prompt should appear |
| Purchases | Configured through RevenueCat in native builds | Premium unlocks only after RevenueCat returns the `premium` entitlement |

Urgent safety content, basic logging, Timeline, CSV export, and basic PDF export must remain available to free users during every test.

## Prerequisites

You need:

- A real iPhone.
- An Expo account with access to the BarkLog EAS project.
- A paid Apple Developer Program membership for iPhone device signing.
- Apple account access that can create certificates and provisioning profiles.
- App Store Connect access if you will test RevenueCat purchases or TestFlight.
- A preview Supabase project with required Edge Functions deployed.
- RevenueCat iOS app, products, offering, and entitlement configured.
- Mixpanel and Sentry preview projects if observability QA is in scope.

A Mac with Xcode is recommended for device logs and local builds. EAS cloud builds can create iPhone builds without using your local Xcode install.

## Do You Need A Separate Server?

No. You do not need to run a separate VPS, Express app, Next.js API server, or custom backend just to protect server-only keys.

BarkLog's server boundary is Supabase:

- The iPhone app gets only public client values such as `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and the RevenueCat public iOS key.
- Server-only keys stay in Supabase Edge Function secrets.
- The iPhone app calls Supabase Edge Functions over HTTPS.
- Edge Functions read trusted secrets with `Deno.env.get(...)`, verify the signed-in user, check Premium when required, then perform sync, AI, report, or admin work.

The server-only values currently read by BarkLog Edge Functions are:

```txt
BARKLOG_TEXT_AI_PROVIDER
BARKLOG_TEXT_AI_BASE_URL
BARKLOG_TEXT_AI_API_KEY
BARKLOG_TEXT_AI_MODEL
BARKLOG_TEXT_AI_THINKING
BARKLOG_VISION_AI_PROVIDER
BARKLOG_VISION_AI_BASE_URL
BARKLOG_VISION_AI_API_KEY
BARKLOG_VISION_AI_MODEL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
```

Default preview values use DeepSeek `deepseek-v4-flash` for text AI with thinking disabled and OpenAI `gpt-5.4-nano` as a server-side future vision configuration. No image AI feature ships in this build.

You can still install and inspect the app on an iPhone without every backend feature working, but release preflight needs a real preview Supabase project with the required Edge Functions and secrets configured.

## 1. Open The Project

```sh
cd /Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log
corepack enable
corepack pnpm install --frozen-lockfile
```

Use `corepack pnpm` in this repo. Plain `pnpm` may point at a different package-manager version.

## 2. Confirm Local Release Gates

Run these before spending EAS build time:

```sh
corepack pnpm check-types
corepack pnpm lint --quiet
corepack pnpm test -- --runInBand
corepack pnpm exec expo export --platform web
```

Then run the client bundle secret scan:

```sh
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src
```

Both `rg` commands should return no matches. If either command prints a real secret, stop and fix the leak before building.

## 3. Log In To Expo

```sh
corepack pnpm dlx eas-cli@latest login
corepack pnpm dlx eas-cli@latest whoami
```

`whoami` should print the Expo account that owns or can build the BarkLog project.

## 4. Confirm EAS Build Profiles

`eas.json` must keep these profile meanings:

```json
{
  "build": {
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
}
```

The `preview` profile is the iPhone QA build. The `production` profile is for TestFlight and App Store Connect only.

## 5. Configure Preview Environment

Set these client-safe values in the EAS `preview` environment:

```txt
EXPO_PUBLIC_APP_ENV=preview
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_REVENUECAT_IOS_KEY=...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...
EXPO_PUBLIC_MIXPANEL_TOKEN=...
EXPO_PUBLIC_SENTRY_DSN=...
```

Use the Expo dashboard or EAS CLI environment commands. Client-side variables should use plain-text or sensitive visibility, not secret visibility, because anything embedded in the app bundle must be treated as public. Do not put server-only secrets in Expo client env values.

Server-only values belong in Supabase Edge Function secrets only:

- Supabase service role key
- DeepSeek text AI key
- OpenAI vision AI key reserved for future image understanding
- Any private webhook or signing secrets

If you need a local `.env.local` that matches preview for debugging, pull only readable client-safe values:

```sh
corepack pnpm dlx eas-cli@latest env:pull --environment preview
```

## 6. Confirm Preview Service Dashboards

Before building, verify these non-code dependencies:

- Supabase preview project is reachable.
- `barklog-sync` is deployed for authenticated sync tests.
- `generate-care-summary`, `generate-vet-report`, `generate-training-insight`, and AI agent functions are deployed if premium AI QA is in scope.
- Server-only text AI, future vision AI, and Supabase privileged secrets are set in Supabase, not EAS.
- RevenueCat entitlement ID is `premium`.
- RevenueCat iOS products exist: `barklog_annual` and `barklog_monthly`.
- RevenueCat current offering includes annual and monthly packages.
- App Store Connect sandbox tester is available for purchase QA.
- Mixpanel and Sentry preview projects are ready if telemetry QA is required.

## 7. Register The iPhone

For EAS internal iOS builds, the iPhone UDID must be in the ad hoc provisioning profile before the build is created.

```sh
corepack pnpm dlx eas-cli@latest device:create
```

Open the generated URL or scan the QR code on the iPhone and follow the profile installation flow.

Confirm the device is visible:

```sh
corepack pnpm dlx eas-cli@latest device:list
```

If you add another iPhone later, register it and create a new build. Old ad hoc builds will not install on devices that were added after the build was signed.

## 8. Create The iOS Preview Build

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```

When EAS asks about Apple credentials:

- Sign in with the Apple Developer account that owns `com.dracoarts.barklog`.
- Let EAS manage certificates and provisioning unless you already have a specific signing setup.
- Make sure the registered iPhone is included in the provisioning profile.

Record the EAS build URL as soon as the build is queued.

## 9. Install The Preview Build On iPhone

Use one of these install paths:

- Open the EAS build URL on the iPhone and tap the install action.
- Use the QR/install link from the EAS build page.
- Use Expo Orbit with the iPhone connected by USB.

After install:

1. Open BarkLog from the iPhone home screen.
2. Confirm the app launches without requiring a Metro dev server.
3. Confirm the build under test is the `preview` build.
4. Record the device model, iOS version, build URL, date, and tester.

## 10. Required iPhone Smoke Test

Use a fresh test account first.

### Startup And Auth

- App opens without crashing.
- Sign up with a test email.
- Dog onboarding appears.
- Create a dog profile.
- Close and reopen the app.
- Confirm the signed-in app restores and the dog remains selected.
- Sign out from Settings.
- Sign back in.

### Home And Free Core Logging

- From Home, log `Poop`, `Pee`, `Meal`, and `Walk`.
- Confirm each event appears on Home immediately.
- Open Timeline and confirm every event appears there.
- Open an event detail page if available.
- Confirm tap targets feel usable on the physical device.

### Offline Logging

- Turn on Airplane Mode.
- Log `Poop`, `Pee`, `Meal`, and `Walk` again.
- Confirm each event saves immediately while offline.
- Close and reopen the app while still offline.
- Confirm events are still present.
- Turn Airplane Mode off.
- Confirm the app remains responsive during sync/retry.

### Timeline And Export

- Open Timeline and scan today's records.
- Open Profile.
- Run CSV export and confirm the iOS share sheet opens.
- Open Vet Prep.
- Run basic PDF export and confirm the iOS share sheet opens.
- Confirm free users can still export CSV and basic PDF.

### Safety Center

- Open Safety Center through `/safety`.
- Open emergency actions.
- Open first-aid content.
- Open toxicity lookup.
- Confirm urgent actions are not Premium-gated.
- Confirm copy does not diagnose, prescribe, or replace veterinary care.
- Turn on Airplane Mode and confirm core offline safety content remains usable.

### Notifications

- Create or edit a medication with reminders enabled.
- Accept the iOS notification prompt.
- Confirm the medication saves and the app does not crash.
- Repeat on a clean install or another device with notifications denied.
- Confirm denying notifications does not block saving the medication or care task.
- Confirm notification copy is about caregiver reminders, not broad engagement.

### Care Calendar And Photo Baselines

- Open Care Calendar and create a local task.
- If reminders are enabled, confirm notification permission behavior matches the reminder flow.
- Open Photo Baselines.
- Create a baseline with category, title, date, body area, and notes.
- Confirm it saves locally.
- Delete the baseline.
- Confirm no camera permission prompt appears in this build.

### Premium Gates And RevenueCat

- Open a Premium surface such as Monthly Trends, AI Agent Center, training progress, photo compare, sync backup, household sharing, or generated vet report.
- Confirm free users see a Premium gate.
- Confirm free users can still use basic logging, Timeline, CSV export, basic PDF export, and urgent safety tools.
- Open the paywall.
- Cancel a purchase and confirm Premium does not unlock.
- Complete a sandbox purchase and confirm Premium unlocks only after RevenueCat returns the `premium` entitlement.
- Restore purchases on a subscribed sandbox account.
- Restore purchases on a non-subscribed sandbox account and confirm Premium stays locked.

### Sync And Backup

- With a free user, confirm sync/backup surfaces explain local-only mode and preserve export reassurance.
- With a Premium sandbox user, create a few records and confirm sync status reaches a successful state.
- Delete/reinstall only after you have recorded evidence, then confirm restore behavior if backup/restore QA is in scope.

### Layout And Accessibility

Check at least:

- Home
- Timeline
- Safety
- Paywall
- Profile
- Vet Prep
- Care Calendar
- Photo Baselines

Release blockers:

- clipped primary actions
- overlapping text
- hidden emergency actions
- blocked free export
- unreadable contrast
- tap targets that feel below 44x44 pt
- health copy that sounds diagnostic

## 11. Evidence To Record

Update `docs/deployment/release-preflight-checklist.md` with:

- iOS build URL
- build profile
- Git commit or branch
- tester
- iPhone model
- iOS version
- date tested
- pass/fail result
- bug links or notes
- screenshot or screen recording links

Use this template in the release notes or checklist:

```txt
iOS preview build:
Device:
iOS version:
Tester:
Date:
Result:
Evidence:
Blocking bugs:
Follow-up bugs:
```

Do not move to a production/TestFlight build until the iPhone preview build passes or every failure has an explicit release-owner decision.

## 12. Optional Live Debugging With A Development Build

Use this only when you need fast UI debugging on a physical iPhone.

Register the iPhone first, then build:

```sh
corepack pnpm dlx eas-cli@latest build --profile development --platform ios
```

Install the development build from its EAS URL.

Start Metro for the development client:

```sh
corepack pnpm start:dev-client
```

Open BarkLog on the iPhone and connect it to the Metro server.

Rebuild the development client when you change:

- `app.json`
- `eas.json`
- native plugins
- native dependencies
- notification, permission, or entitlement configuration

Regular JS and TS changes can usually reload through Metro without a rebuild.

## 13. Move To TestFlight Only After Preview Passes

Create the production iOS build:

```sh
corepack pnpm dlx eas-cli@latest build --profile production --platform ios
```

Submit it to App Store Connect:

```sh
corepack pnpm dlx eas-cli@latest submit --profile production --platform ios
```

In App Store Connect:

- Wait for Apple to finish processing the build.
- Add TestFlight test information.
- Add internal testers or a tester group.
- Install through the TestFlight app.
- Rerun the core smoke test, RevenueCat sandbox checks, notification checks, export checks, and store-copy checks.

Production builds cannot be installed directly from an EAS ad hoc link. They distribute through App Store Connect/TestFlight.

## Troubleshooting

### The iPhone Cannot Install The Build

Most likely causes:

- The iPhone was not registered before the build.
- The provisioning profile did not include the device.
- The tester opened an old build created before their device was registered.

Fix:

```sh
corepack pnpm dlx eas-cli@latest device:create
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```

If build time is the only blocker, use `eas build:resign` to re-sign an existing compatible build with an updated provisioning profile.

### The App Opens But Uses The Wrong Backend

Check the EAS build profile and environment:

- `preview` should set `EXPO_PUBLIC_APP_ENV=preview`.
- `preview` should use preview Supabase, RevenueCat, Mixpanel, and Sentry values.
- `.env.local` does not affect cloud builds unless values are also configured in EAS.

### The App Crashes On Launch

Check:

- EAS build logs for missing env values.
- Sentry for a preview crash event.
- `src/utils/clientEnv.ts` requirements.
- Supabase URL and anon key.
- Native dependency changes that require a fresh build.

### RevenueCat Offerings Are Missing

Check:

- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` points to the iOS RevenueCat app.
- RevenueCat entitlement ID is `premium`.
- `barklog_annual` and `barklog_monthly` are attached to the current offering.
- App Store Connect product IDs match RevenueCat product IDs.
- The sandbox tester is signed in correctly for purchases.

### Notifications Do Not Prompt

Expected constraints:

- iOS only shows the notification permission prompt when the app asks for it.
- BarkLog should ask only from reminder-related caregiver actions.
- If permission was already denied, manage it in iOS Settings or reinstall/reset the test app.

Saving medications or care tasks must still work when notifications are denied.

### Camera, Location, Or Apple Health Prompts Appear

That is a blocker for this build. Those capabilities are not configured yet and should not appear in iOS prompts, app metadata, or store permission copy.
