# Task 047: Native Device QA

- Status: `in_progress`
- Priority: `P0`
- Depends on: `task046`

## Objective

Install locally built Android and iOS artifacts on real devices, without Metro or a development client, and record evidence for the first free release.

## Acceptance

- Founder builds an Android signed APK/AAB and iOS Release archive using [local-build.md](../docs/release/local-build.md), recording artifact paths and identities in [preflight-local.md](../docs/release/preflight-local.md).
- Fresh offline install completes dog onboarding and saves walk, meal, symptom, medication, mood, and behavior logs. Timeline and records persist across restart.
- CSV and PDF export, Safety Center, toxicity lookup, first aid, emergency card, reminders, multi-dog, training sessions, trends, Memory Book, expenses, photo baselines, and downloaded local AI are checked on the supported devices.
- No ad, trial expiry, paywall, purchase prompt, or Play billing permission appears. Atlas AI remains hidden in production until its server policy is ready.
- With online QA and GameAnalytics credentials configured, launch, quick log, and export events appear in each platform game, without care text or dog IDs.
- Loading, empty, error, permission denial, and offline paths remain usable. Record results in [native-device-qa-checklist.md](../docs/deployment/native-device-qa-checklist.md).
