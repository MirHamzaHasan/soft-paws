# Local release preflight

Record actual artifact paths, device evidence, and a release decision before production submission. `corepack pnpm release:check-production-readiness` checks this file and intentionally fails while fields or gates remain pending.

## Release Decision

| Field | Value |
| --- | --- |
| App version | `1.0.0` |
| Build method | Local Expo prebuild, Gradle, and Xcode |
| iOS artifact path |  |
| Android artifact path |  |
| Billing model | Free v1.0.0; no in-app purchases |
| GameAnalytics Android game |  |
| GameAnalytics iOS game |  |
| Release owner |  |
| Decision | Blocked: signed builds and device QA pending |

## Required gates

| Gate | Evidence | Status |
| --- | --- | --- |
| Local automated checks | `corepack pnpm release:check-local`, TypeScript, and 143 Jest tests passed 2026-10-05 | Passed |
| Android signed AAB and APK | Earlier disposable-key artifacts used the old Android ID and do not count for this release. Build fresh AAB/APK with the permanent upload key. | Pending new ID and production key |
| Android offline device smoke | Earlier API 36 emulator flow used the old Android ID; repeat on the new v1.0.0 artifact, then test a physical device. | Pending current artifact and physical device |
| iOS signed archive and device smoke | Mac Xcode archive, install, same offline flow | Pending |
| Free access | No paywall, purchase, trial expiry, or ads; formerly gated features open | Pending device QA |
| Native manifest check | Run `corepack pnpm release:check-native-capabilities` after clean prebuild and signed Android build; verify no Play billing | Pending |
| GameAnalytics protocol | Signed sandbox `init` and `events` requests with synthetic session/design events returned HTTP 200 on 2026-10-05 | Passed |
| GameAnalytics events | Set separate Android/iOS game key and secret pairs; verify a real launch, quick log, and export in each dashboard with no care details | Pending |
| Store privacy and data safety | Local-only copy and shipped SDK labels | Pending |

## Rollback And Hotfix Gate

| Field | Value |
| --- | --- |
| Last known good app version |  |
| Last known good iOS artifact path |  |
| Last known good Android artifact path |  |
| Local data rollback action | Preserve on-device database; provide free export path |
| Store rollback action |  |
