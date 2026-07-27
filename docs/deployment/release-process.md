# Deployment: Release Process

## Prerequisites

- Expo account with EAS project access
- Apple Developer and Google Play Console access
- staging and production Supabase projects
- RevenueCat app configured for iOS and Android products
- Mixpanel token and Sentry DSN for the target environment

## Required Environment

Client-safe values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-production-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-production-supabase-anon-public-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=replace-with-production-revenuecat-ios-public-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=replace-with-production-revenuecat-android-public-key
EXPO_PUBLIC_MIXPANEL_TOKEN=replace-with-production-mixpanel-project-token
EXPO_PUBLIC_SENTRY_DSN=https://public@sentry.example.invalid/0
EXPO_PUBLIC_APP_ENV=production
```

Server-only values stay in Supabase Edge Function secrets:

- production DeepSeek text AI API secret
- production OpenAI vision AI API secret for future image understanding
- production Supabase privileged admin key

Do not place server-only secrets in `app.json`, `eas.json`, `.env.local`, `env.example`, or any `EXPO_PUBLIC_*` value.

## Preflight

Use [release-preflight-checklist.md](release-preflight-checklist.md) as the release gate. Do not mark the release ready until every required row has a passing result, owner, date, and evidence.

Minimum local commands:

1. Run `corepack pnpm release:check-local`.
2. Run `corepack pnpm lint --quiet`.
3. Run `corepack pnpm test -- --runInBand`.
4. Run `corepack pnpm exec expo export --platform web`.
5. Run `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist` and confirm no matches.

Minimum preview-build checks:

1. Complete the native preview-build QA matrix in [native-device-qa-checklist.md](native-device-qa-checklist.md).
2. Complete observability checks in [observability-preview-checklist.md](observability-preview-checklist.md).
3. Complete the RevenueCat sandbox checklist in [revenuecat-sandbox-purchase-checklist.md](revenuecat-sandbox-purchase-checklist.md).
4. Complete the Supabase sync smoke test in [watermelondb-supabase-sync-smoke-test.md](watermelondb-supabase-sync-smoke-test.md).

## Builds

Preview:

```sh
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

Production:

```sh
corepack pnpm release:check-production-readiness
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Submission

1. Upload final screenshots and app metadata.
2. Complete [store-submission-checklist.md](store-submission-checklist.md).
3. Confirm permission copy matches actual app behavior:
   - notifications for medication reminders
   - camera omitted until user-triggered dog photos, receipt photos, or toxicity scanning is implemented
   - location omitted until nearby emergency clinic lookup requests BarkLog location access
   - HealthKit or Google Fit omitted until explicit opt-in activity import is implemented
4. Submit iOS and Android builds from EAS or each store console.

## Rollback Basics

Record the rollback target in [release-preflight-checklist.md](release-preflight-checklist.md) before submission.

1. If a production build has not been released, cancel store review or phased rollout.
2. If a phased rollout is live, pause rollout in App Store Connect or Play Console.
3. Disable risky server behavior through Supabase function configuration or feature flags.
4. Keep free logging, timeline access, and export available during rollback.
5. Create a hotfix build from the last known good release point.
6. Apply only the minimal fix, increment the app version or build number, and rerun preflight.
