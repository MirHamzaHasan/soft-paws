# Task 048: Production Builds, Store Submission, And Rollback

- Status: `in_progress`
- Priority: `P0`
- Phase: `Native Release Build Readiness`
- Depends on: `task047`

## Objective

Promote BarkLog from passing preview-build evidence to production iOS and Android builds, then complete store submission and rollback readiness.

## Release Build Position

Production builds are only allowed after preview evidence passes.

- iOS production builds target TestFlight, App Store Connect, and App Store review.
- Android production builds target Google Play internal testing, closed testing, or production rollout.
- Store metadata must describe BarkLog as a dog care journal and organization tool, not a veterinary authority.
- Rollback targets must be recorded before submission.

## External Inputs

- Passing `task047` preview-build and native-device QA evidence.
- App Store Connect access.
- Google Play Console access.
- Final production Supabase, RevenueCat, Mixpanel, and Sentry projects.
- Privacy policy URL.
- Store screenshots and metadata matching the submitted build.
- Release owner sign-off.

## In Progress Notes

- Started the local production-readiness guard while production builds remain blocked on `task045` through `task047` external evidence.
- Added `corepack pnpm release:check-production-readiness` to fail production promotion when release-preflight fields are blank, gate rows are pending or blocked, rollback targets are missing, or the store submission checklist loses required positioning/privacy language.
- The command is intentionally expected to fail until preview build URLs, service project evidence, store gate statuses, rollback targets, and release-owner sign-off are recorded.
- Local validation passed on 2026-05-13 for targeted ESLint on release scripts and `corepack pnpm check-types`; `corepack pnpm release:check-production-readiness` failed as expected against the incomplete release record.

## Scope

- Confirm release preflight is fully filled before production builds.
- Build iOS production:

```sh
corepack pnpm dlx eas-cli@latest build --profile production --platform ios
```

- Build Android production:

```sh
corepack pnpm dlx eas-cli@latest build --profile production --platform android
```

- Submit production builds only after successful build review:

```sh
corepack pnpm dlx eas-cli@latest submit --profile production --platform ios
corepack pnpm dlx eas-cli@latest submit --profile production --platform android
```

- Complete `docs/deployment/store-submission-checklist.md`.
- Confirm privacy and data-safety metadata covers:
  - Supabase account data
  - RevenueCat purchases
  - Mixpanel analytics
  - Sentry crash reporting
  - manual export rights
- Record rollback targets in `docs/deployment/release-preflight-checklist.md`.

## Store Review Requirements

- Do not claim BarkLog diagnoses, prescribes, treats, or replaces veterinary care.
- Emergency and toxicity surfaces must escalate to veterinarians, emergency clinics, or poison-control resources.
- Permission metadata must match actual configured permissions.
- Notifications are described as caregiver reminders, not broad engagement messaging.
- Camera, location, Apple Health, and Google Fit are omitted from store copy until native adapters ship.
- Free users keep basic logging, Timeline access, CSV export, basic PDF export, and urgent safety tools.
- Premium descriptions focus on leverage, intelligence, sync, backup, household collaboration, and reports.

## Out Of Scope

- No production submission if preview-build evidence is incomplete.
- No new feature work.
- No new native permissions.
- No new runtime backend.
- No release if any required free right is broken.

## Acceptance Criteria

- iOS production build URL is recorded.
- Android production build URL is recorded.
- Store submission checklist is complete.
- App metadata, screenshots, privacy labels, and permission descriptions match the submitted binary.
- Rollback targets include last known good app version, build URLs, Supabase function versions, RevenueCat fallback action, server rollback action, and store rollback action.
- Release owner signs off in the release preflight checklist.

## Validation

Required before production build:

```sh
corepack pnpm check-types
corepack pnpm lint --quiet
corepack pnpm test -- --runInBand
corepack pnpm exec expo install --check
corepack pnpm dlx expo-doctor@latest
corepack pnpm exec expo export --platform web
corepack pnpm release:check-production-readiness
rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" dist
```

Required after production build:

- Install TestFlight/internal testing builds where available.
- Confirm production app launches without Metro.
- Confirm production environment points at production Supabase, RevenueCat, Mixpanel, and Sentry.
- Confirm purchase restore works in the store testing path.
- Confirm urgent safety tools and free export rights remain available.
- Confirm rollback target is recorded before any wider rollout.
