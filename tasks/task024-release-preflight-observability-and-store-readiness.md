# Task 024: Release Preflight, Observability, and Store Readiness

- Status: `completed`
- Priority: `P0`
- Phase: `Release Readiness`
- Depends on: `task020`, `task021`, `task022`, `task023`

## Objective

Create a repeatable release gate for App Store and Google Play readiness.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- verify Mixpanel and Sentry in preview builds
- add a preflight checklist covering tests, typecheck, lint, export, EAS builds, Supabase functions, RevenueCat, and device QA
- confirm store permission copy matches app behavior
- document rollback and hotfix process from a known-good build

## Initial Findings

Captured before remediation:

- monitoring and release docs exist but are not yet enforced as a release gate
- observability needs real preview-build verification
- store readiness depends on completion of sync, RevenueCat, AI safety, and native QA blockers

## Out of Scope

- post-launch growth experiments
- family plan launch work
- non-blocking visual polish unrelated to store readiness

## Acceptance Criteria

- release cannot be marked ready unless all P0 validations pass
- observability receives screen, quick-log, export, and controlled-error events without sensitive payloads
- store submission checklist is complete for iOS and Android
- rollback and hotfix instructions are actionable from a known-good build

## Delivery Notes

- added [release-preflight-checklist.md](../docs/deployment/release-preflight-checklist.md) as the release decision record and required P0 gate
- added [observability-preview-checklist.md](../docs/deployment/observability-preview-checklist.md) for Mixpanel and Sentry preview-build evidence
- added [store-submission-checklist.md](../docs/deployment/store-submission-checklist.md) for iOS and Android store metadata, permission, privacy, and health-claim checks
- updated release, launch, iOS build, Android build, and monitoring docs to route release readiness through the new gate
- documented rollback and hotfix requirements from a known-good build in the release preflight gate and release process
- added automated observability preflight tests covering release-critical Mixpanel and Sentry payload redaction
- preserved task023 native-device QA rows as release blockers until actual preview-build evidence is recorded

## Validation Notes

- local automated gates passed in this execution
- EAS preview builds were not run from this environment because they require project credentials and remote build execution
- release readiness remains blocked until the release owner records preview-build, Supabase, RevenueCat, observability, and native-device evidence in the preflight checklist

## Validation

- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`
- `corepack pnpm test -- --runInBand`
- `corepack pnpm exec expo export --platform web`
- EAS preview build checklist completed with required evidence before release sign-off
