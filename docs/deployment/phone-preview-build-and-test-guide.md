# Phone Preview Build And Test Guide

Use this guide to build BarkLog with EAS and test it on your own Android phone and iPhone from a MacBook.

This is for `preview` builds. Do not use Expo Go as release proof. BarkLog uses native modules and must be tested as an installed app.

## Current Native Position

- Android package: `com.dracoarts.barklog`
- iOS bundle identifier: `com.dracoarts.barklog`
- EAS profile: `preview`
- Android permissions expected in release preview:
  - `android.permission.POST_NOTIFICATIONS`
  - `com.android.vending.BILLING`
- Android permissions that must not be active:
  - storage permissions
  - system overlay permission
- iOS permissions not configured yet:
  - camera
  - location
  - Apple Health
- Server-only AI and Supabase privileged keys must stay in Supabase Edge Function secrets, not Expo env.

## 1. Open The Project

```sh
cd /Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log
corepack enable
corepack pnpm install --frozen-lockfile
```

## 2. Run Local Readiness Checks

Run these before starting EAS builds:

```sh
cd android
./gradlew :app:processReleaseMainManifest
cd ..
corepack pnpm release:check-local
corepack pnpm exec expo install --check
corepack pnpm dlx expo-doctor@latest
corepack pnpm check-types
corepack pnpm lint --quiet
corepack pnpm test -- --runInBand
corepack pnpm exec expo export --platform web
```

Expected result:

- The local EAS release config check passes. It may report that the EAS project ID is not set until the project is linked.
- The environment boundary check passes without printing local secret values.
- The native capability check passes after the Android release manifest has been generated.
- Expo dependency check passes.
- Expo Doctor says `17/17 checks passed`.
- TypeScript, lint, tests, and web export all pass.

Run secret scans:

```sh
rg "ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" dist
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src
```

Expected result: both commands return no matches.

## 3. Log In To EAS

```sh
corepack pnpm dlx eas-cli@latest login
corepack pnpm dlx eas-cli@latest whoami
corepack pnpm release:check-eas:linked
corepack pnpm dlx eas-cli@latest project:info --non-interactive
```

`whoami` must print the Expo account that owns or can build the BarkLog project.
`release:check-eas:linked` must pass only after `app.json` contains the real BarkLog EAS project UUID.
`project:info` must show the expected BarkLog EAS project for `com.dracoarts.barklog`.

## 4. Check EAS Preview Client Environment

```sh
corepack pnpm dlx eas-cli@latest env:list --environment preview
```

The EAS `preview` environment must include these client-safe values:

```txt
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_MIXPANEL_TOKEN
EXPO_PUBLIC_SENTRY_DSN
```

Do not put these server-only values in EAS client env, `.env.local`, `env.example`, `app/`, or `src/`:

```txt
BARKLOG_TEXT_AI_API_KEY
BARKLOG_VISION_AI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 5. Check Supabase Preview Secrets

In the preview Supabase project, Edge Function secrets must include:

```txt
BARKLOG_TEXT_AI_PROVIDER=deepseek
BARKLOG_TEXT_AI_BASE_URL=https://api.deepseek.com
BARKLOG_TEXT_AI_API_KEY=...
BARKLOG_TEXT_AI_MODEL=deepseek-v4-flash
BARKLOG_TEXT_AI_THINKING=disabled

BARKLOG_VISION_AI_PROVIDER=openai
BARKLOG_VISION_AI_BASE_URL=https://api.openai.com/v1
BARKLOG_VISION_AI_API_KEY=...
BARKLOG_VISION_AI_MODEL=gpt-5.4-nano

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Confirm these functions are deployed before AI or sync QA:

- `barklog-sync`
- `ask-barklog-ai`
- `generate-weekly-insight`
- `generate-care-summary`
- `generate-vet-report`
- `generate-training-insight`
- `toxicity-lookup`
- household and vet-share functions if testing those flows

## 6. Build Android Preview First

Android is the easiest first device test because it does not require device registration.

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform android
```

When the build finishes:

1. Open the EAS build URL on your Android phone.
2. Download the APK or install package.
3. If Android blocks install, allow installs from that browser or file app.
4. Open BarkLog from the phone home screen.

Expected first launch:

- App opens without Metro.
- No camera prompt.
- No location prompt.
- No storage prompt.
- Notification prompt appears only when testing reminders.

## 7. Register iPhone For iOS Preview

iOS internal builds require your iPhone to be registered before the build is created.

Check registered devices:

```sh
corepack pnpm dlx eas-cli@latest device:list
```

If your iPhone is missing:

```sh
corepack pnpm dlx eas-cli@latest device:create
```

On the iPhone:

1. Open the registration link or scan the QR code.
2. Follow the Apple profile/device registration flow.
3. Return to your MacBook and confirm the phone appears:

```sh
corepack pnpm dlx eas-cli@latest device:list
```

If you add a new iPhone later, create a new iOS preview build. Old ad hoc iOS builds will not install on newly added devices.

## 8. Build iOS Preview

```sh
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```

When prompted:

- Use the Apple Developer account for `com.dracoarts.barklog`.
- Let EAS manage credentials unless you already have a manual signing setup.
- Confirm the registered iPhone is included in the provisioning profile.

When the build finishes:

1. Open the EAS build URL on your iPhone.
2. Install BarkLog.
3. Open BarkLog from the iPhone home screen.

Expected first launch:

- App opens without Metro.
- No camera prompt.
- No location prompt.
- No Apple Health prompt.
- Notification prompt appears only when testing reminders.

## 9. Basic Smoke Test On Each Phone

Use a fresh test account first.

1. Open BarkLog.
2. Sign up with a test email.
3. Create a dog profile.
4. Close and reopen the app.
5. Confirm the signed-in session restores.
6. Log `Poop`, `Pee`, `Meal`, and `Walk`.
7. Open Timeline.
8. Confirm each event appears.
9. Sign out.
10. Sign back in.

## 10. Offline Logging Test

Run this on Android and iPhone.

1. Turn on Airplane Mode.
2. Log `Poop`, `Pee`, `Meal`, and `Walk`.
3. Confirm each event saves immediately.
4. Close and reopen the app while still offline.
5. Confirm the events are still present.
6. Turn Airplane Mode off.
7. Confirm the app remains responsive during sync or retry.

## 11. Export And Safety Test

Run this on Android and iPhone.

1. Open Profile.
2. Run CSV export.
3. Confirm the native share sheet opens.
4. Open Vet Prep.
5. Run basic PDF export.
6. Confirm the native share sheet opens.
7. Open Safety Center.
8. Open emergency actions.
9. Open first-aid content.
10. Open toxicity lookup.
11. Confirm urgent safety tools are not Premium-gated.
12. Turn on Airplane Mode and confirm core offline safety content still works.

## 12. Notification Test

Run this on Android and iPhone.

1. Create or edit a medication with reminders enabled.
2. Accept the notification permission prompt.
3. Confirm the medication saves and the app does not crash.
4. Repeat on a clean install or after resetting notification permission.
5. Deny notification permission.
6. Confirm the medication or care task still saves.

Expected behavior:

- Notification permission is requested only from reminder-related caregiver actions.
- Denying notifications does not block saving.
- Notification copy is about caregiver reminders, not broad engagement.

## 13. Premium And RevenueCat Test

Run this on Android and iPhone if purchase QA is in scope.

1. Open a Premium surface.
2. Confirm free users see a Premium gate.
3. Confirm free users can still use logging, Timeline, CSV export, basic PDF export, and urgent safety tools.
4. Open the paywall.
5. Cancel a purchase.
6. Confirm Premium does not unlock.
7. Complete a sandbox purchase.
8. Confirm Premium unlocks only after RevenueCat returns the `premium` entitlement.
9. Restore purchases on a subscribed sandbox account.
10. Restore purchases on a non-subscribed sandbox account and confirm Premium stays locked.

## 14. AI And Sync Test

Run this after Supabase preview functions and server secrets are confirmed.

Premium user:

1. Ask a normal BarkLog AI question.
2. Confirm the answer is warm, short, and non-diagnostic.
3. Ask emergency-style wording.
4. Confirm BarkLog returns immediate escalation copy before model calls.
5. Generate weekly insight, care summary, vet report, and training insight.
6. Confirm generated output is bounded and non-diagnostic.
7. Create a few records and confirm Premium sync reaches a successful state.

Free user:

1. Open Premium AI surfaces.
2. Confirm the user sees a Premium gate or `premium_required`.
3. Confirm basic logging, Timeline, CSV export, basic PDF export, and urgent safety tools still work.

## 15. Layout And Permission Check

Check these screens on both phones:

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
- camera, location, storage, Apple Health, or Google Fit prompts in this build
- health copy that sounds diagnostic

## 16. Record Evidence

Update `release-preflight-checklist.md` after testing.

Use this template:

```txt
Android preview build:
iOS preview build:
Device:
OS version:
Tester:
Date:
Result:
Evidence:
Blocking bugs:
Follow-up bugs:
```

Do not move to production/TestFlight until preview builds pass or every failure has an explicit release-owner decision.

## Quick Command Order

```sh
cd /Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log

corepack pnpm dlx eas-cli@latest login
corepack pnpm dlx eas-cli@latest whoami
corepack pnpm dlx eas-cli@latest env:list --environment preview

corepack pnpm dlx eas-cli@latest build --profile preview --platform android

corepack pnpm dlx eas-cli@latest device:create
corepack pnpm dlx eas-cli@latest build --profile preview --platform ios
```
