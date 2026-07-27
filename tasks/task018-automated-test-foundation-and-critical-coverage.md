# Task 018: Automated Test Foundation and Critical Coverage

- Status: `completed`
- Priority: `P0`
- Phase: `QA Foundation`
- Depends on: `task016`

## Objective

Replace the current no-test state with a reliable automated test baseline.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- fix Jest command behavior by adding real tests, not `--passWithNoTests`
- add mocks and utilities for Expo, Supabase, WatermelonDB, and navigation where needed
- add critical tests for local event creation, export builders, premium access rules, toxicity lookup, medication scheduling helpers, and auth-session store selectors
- adjust coverage collection to meaningful critical modules instead of misleading whole-app coverage

## Initial Findings

Captured before remediation:

- Jest is configured, but there are no matching app or source test files
- `corepack pnpm test -- --runInBand` currently fails because no tests are found
- production-critical behavior is not protected by regression tests

## Out of Scope

- full end-to-end automation for every screen
- native device QA
- replacing the current Jest setup with a different test runner

## Acceptance Criteria

- `corepack pnpm test -- --runInBand` passes
- tests cover core product rights: local logging, safety escalation, free export, and premium gating
- new test utilities are documented for future feature tests
- critical module coverage is meaningful and not inflated by broad app-wide collection

## Deferred to Later Tasks

- auth lifecycle hardening tests are completed in `task019`
- sync tests are completed in `task020`
- RevenueCat tests are completed in `task021`
- AI safety tests are completed in `task022`

## Validation

- `corepack pnpm test -- --runInBand`
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`

## Completed Work

- Added a Jest runner shim so `corepack pnpm test -- --runInBand` passes arguments to Jest correctly without using `--passWithNoTests`.
- Replaced broad whole-app coverage collection with focused critical-module coverage for local logging, exports, premium catalog/access, safety lookup, medication scheduling, and auth-session selectors.
- Added shared test builders for BarkLog users, dogs, sessions, events, expenses, and medications.
- Added a WatermelonDB write harness for local-first repository tests.
- Added Jest setup mocks for Expo Router, haptics, linking, and notifications.
- Added critical coverage for:
  - local event creation and sync metadata updates
  - CSV/PDF-style export builders and non-diagnostic vet report copy
  - premium access, trial expiry, RevenueCat entitlement constants, and free access guarantees
  - toxicity lookup escalation, common hazards, weight context, and poison-control behavior
  - medication scheduling, time parsing, dose parsing, and metadata formatting
  - auth-session store selectors, selected-dog behavior, sign-in, and sign-out reset behavior
- Documented the new testing utilities in `test/README.md`.

## Validation Notes

- `corepack pnpm test -- --runInBand` passed on 2026-04-26 with 6 suites and 26 tests.
- Critical-module coverage passed on 2026-04-26 with 86.86% statements, 76.74% branches, 87.5% functions, and 87.63% lines.
- `corepack pnpm check-types` passed on 2026-04-26.
- `corepack pnpm lint --quiet` passed on 2026-04-26.
