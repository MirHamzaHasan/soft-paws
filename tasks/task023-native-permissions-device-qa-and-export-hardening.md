# Task 023: Native Permissions, Device QA, and Export Hardening

- Status: `completed`
- Priority: `P0`
- Phase: `Native QA`
- Depends on: `task018`, `task020`

## Objective

Validate production behavior on real iOS and Android surfaces.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- test notification accepted and denied states and medication reminder scheduling
- verify camera, location, HealthKit, and Google Fit copy matches actual configured capability
- validate CSV and PDF export on iOS, Android, and web
- test small and large device layouts for Home, Timeline, Safety, Paywall, Profile, and Vet Prep

## Initial Findings

Captured before remediation:

- notification handling exists but needs native acceptance and denial testing
- HealthKit, Google Fit, camera, and location readiness is currently capability-gated
- export flows exist but need device validation

## Out of Scope

- implementing a full HealthKit or Google Fit adapter unless required by production scope
- changing export formats
- store submission

## Acceptance Criteria

- permission prompts appear only from relevant user-triggered surfaces
- medication reminders schedule or fail safely
- export and share work on native devices
- layout issues are recorded as blocking bugs or fixed
- launch QA checklist contains actual device results

## Delivery Notes

- removed unimplemented camera, location, HealthKit, and Google Fit permission declarations from `app.json`
- kept Android notification permission and Expo notification plugin configuration for medication reminders
- updated native integration copy so Apple Health, Google Fit, camera, and location are clearly marked unavailable until their adapters are connected
- updated onboarding permission copy so medication reminders are the notification prompt reason
- hardened medication reminder scheduling so denied permissions, unsupported environments, and partial native scheduling failures do not block saving medication data
- added native file writing for text and CSV exports before opening platform share sheets
- preserved web CSV download and PDF print behavior
- added automated coverage for native manifest permissions, capability messaging, medication reminder fallbacks, and native text export sharing
- added [native-device-qa-checklist.md](../docs/deployment/native-device-qa-checklist.md) and linked it from the launch and release checklists

## Validation Notes

- local automated validation covers manifest permissions, fallback behavior, and export file handoff
- physical iOS and Android preview builds were not available in this execution environment
- preview-build device rows are explicitly marked not run in the native QA checklist and remain `task024` release blockers

## Deferred to Later Tasks

- final store-readiness gate is completed in `task024`
- physical iOS and Android preview-build evidence is required by the `task024` release preflight using the task023 QA checklist

## Validation

- update launch QA checklist with actual device results
- preview builds tested on iOS and Android
- native capability and fallback tests
- `corepack pnpm test -- --runInBand`
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`
- `corepack pnpm exec expo export --platform web`
