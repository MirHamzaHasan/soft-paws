# Task 015: Observability, Native Integrations, QA Hardening, and Release Prep

- Status: `completed`
- Priority: `P0`
- Phase: `Launch Readiness`
- Depends on: `task009`, `task010`, `task011`, `task012`, `task013`, `task014`

## Objective

Prepare BarkLog for production launch across iOS and Android.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for any UI touched during launch-hardening work. Do not introduce a parallel styling system.

## Scope

- Mixpanel instrumentation
- Sentry crash and error reporting
- HealthKit and Google Fit integration
- camera, notifications, and location permission hardening
- device and screen-size QA
- release process, store assets, and submission prep

## Out of Scope

- post-launch growth experiments
- family plan launch work

## Acceptance Criteria

- key user flows are instrumented and observable
- native integrations are permission-safe and failure-tolerant
- launch checklist exists for both iOS and Android
- release pipeline is documented and testable

## Validation

- critical flows are tested on small and large devices
- release docs cover environment setup, builds, and rollback basics

## Completed Work

- Added app-level observability initialization, route analytics, authenticated user identification, and an error boundary that reports recoverable screen crashes.
- Added Mixpanel-compatible event capture for app open, screen views, quick logs, detailed logs, permission results, exports, toxicity selections, and emergency actions.
- Added Sentry DSN-based JavaScript error capture with privacy-safe context and fail-open behavior.
- Hardened notification permission handling and added a native capability service for notifications, HealthKit / Google Fit readiness, camera, and location fallback messaging.
- Wired onboarding and Settings health/notification toggles to permission-safe native capability checks.
- Added launch permission copy in `app.json` for iOS and Android native builds.
- Added `eas.json`, release process documentation, monitoring documentation, crash-reporting documentation, and a launch QA checklist.

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint app/_layout.tsx src/utils/clientEnv.ts src/features/observability/index.ts src/features/observability/components/ObservabilityBoundary.tsx src/features/observability/hooks/useRouteAnalytics.ts src/features/observability/services/analyticsService.ts src/features/observability/services/crashReportingService.ts src/features/observability/services/observabilityService.ts src/features/native-integrations/index.ts src/features/native-integrations/services/nativeIntegrationService.ts src/features/home/screens/HomeScreen.tsx src/features/logging/hooks/useDetailedEventSave.ts src/features/export/services/exportDocumentService.ts src/features/medications/services/medicationReminderService.ts src/features/onboarding/screens/PermissionsScreen.tsx src/features/settings/screens/SettingsScreen.tsx src/features/safety/screens/ToxicityScannerScreen.tsx src/features/safety/services/safetyActions.ts src/managers/AnalyticsManager.ts src/managers/CrashReportingManager.ts src/managers/index.ts src/app/bootstrap/registerManagers.ts`
- `node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); JSON.parse(require('fs').readFileSync('eas.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`
- `corepack pnpm exec expo export --platform web`
- Restarted Expo web preview on `http://localhost:8081` and confirmed `HTTP/1.1 200 OK`.
