# Launch readiness

The active release decision is [local preflight](../release/preflight-local.md). Use [local-build.md](../release/local-build.md) for founder-run signing and [native-device-qa-checklist.md](native-device-qa-checklist.md) for device results.

## Required before submission

- [ ] Source checks and final native manifest check pass.
- [ ] Signed Android AAB/APK and iOS archive are recorded with version, build number, and owner.
- [ ] Physical Android and iOS testing covers offline journal, restart persistence, local CSV/PDF export, reminders, Safety Center, and data deletion.
- [ ] All implemented local features work without ads, trial expiry, paywalls, or purchases.
- [ ] If GameAnalytics is configured, separate platform dashboards show launch, log, and export events with no care content.
- [ ] Store copy, screenshots, privacy policy, and data safety disclosures match the shipped build.
- [ ] Rollback/hotfix path and release decision are recorded in [preflight-local.md](../release/preflight-local.md).

Production Atlas AI remains hidden until its server policy supports free access and BarkLog context checks pass. Journal logging and on-device AI do not require Firebase sign-in.
