# Deployment: iOS Builds

## Preview

```sh
eas build --profile preview --platform ios
```

Use the preview build for release preflight, RevenueCat sandbox purchase restore, notification permission checks, export/share checks, and Sentry controlled-error verification.
The installed preview app must launch without Metro or an Expo dev server.

For step-by-step phone install and QA instructions, use [phone-preview-build-and-test-guide.md](phone-preview-build-and-test-guide.md).

## Production

```sh
corepack pnpm release:check-production-readiness
eas build --profile production --platform ios
```

Production submission is blocked until [release-preflight-checklist.md](release-preflight-checklist.md) is fully complete.
Production builds must never depend on Metro, Expo Go, or a development client.

## Current Native Capability Position

- Notifications are used for medication reminders.
- Camera is not configured in this build.
- Location is not configured in this build.
- Apple Health is not configured in this build.
- Certificates and provisioning are managed through EAS or Apple Developer Portal.
