# Deployment: Android Builds

Historical remote-build guide. Use [local native builds](../release/local-build.md) for current Android signing and artifacts.

## Preview

```sh
eas build --profile preview --platform android
```

Use the preview build for release preflight, RevenueCat sandbox purchase restore, notification permission checks, export/share checks, and Sentry controlled-error verification.
The installed preview app must launch without Metro or an Expo dev server.

For step-by-step phone install and QA instructions, use [phone-preview-build-and-test-guide.md](phone-preview-build-and-test-guide.md).

## Production

```sh
corepack pnpm release:check-production-readiness
eas build --profile production --platform android
```

Production submission is blocked until [release-preflight-checklist.md](release-preflight-checklist.md) is fully complete.
Production builds must never depend on Metro, Expo Go, or a development client.

## Current Native Capability Position

- `android.permission.POST_NOTIFICATIONS` is declared for medication reminders.
- `com.android.vending.BILLING` is declared for RevenueCat purchases.
- Camera is not configured in this build.
- Location is not configured in this build.
- Google Fit is not configured in this build.
- Signing config is managed through EAS, `app.json`, and `eas.json`.
