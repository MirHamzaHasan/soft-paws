# Local release preflight

Record actual artifact paths, device evidence, and a release decision before production submission. `corepack pnpm release:check-production-readiness` checks this file and intentionally fails while fields or gates remain pending.

## Release Decision

| Field | Value |
| --- | --- |
| App version | `1.0.0` |
| Build method | Local Expo prebuild, Gradle, and Xcode |
| iOS artifact path |  |
| Android artifact path |  |
| RevenueCat project |  |
| Mixpanel project |  |
| Sentry project |  |
| Release owner |  |
| Decision | Blocked: signed builds and device QA pending |

## Required gates

| Gate | Evidence | Status |
| --- | --- | --- |
| Local automated checks | `corepack pnpm release:check-local`, `corepack pnpm check-types`, and 129 Jest tests passed on 2026-10-03 | Passed |
| Android signed AAB and APK | Local QA artifacts in `android/app/build/outputs/`; APK v2 and AAB JAR signatures verified 2026-10-03 | Debug key passed; production upload key pending |
| Android offline device smoke | API 36 emulator: fresh install, dog onboarding, four log types, timeline, restart persistence, PDF share sheet, Safety Center, toxicity, first aid, emergency card, and local deletion passed on 2026-10-03 | Emulator passed; physical device pending |
| iOS signed archive and device smoke | Mac Xcode archive, install, same offline flow | Pending |
| RevenueCat sandbox | Purchase, expiry, restore, entitlement gates | Pending |
| Store privacy and data safety | Local-only copy and shipped SDK labels | Pending |

## Rollback And Hotfix Gate

| Field | Value |
| --- | --- |
| Last known good app version |  |
| Last known good iOS artifact path |  |
| Last known good Android artifact path |  |
| RevenueCat rollback action |  |
| Local data rollback action | Preserve on-device database; provide free export path |
| Store rollback action |  |
