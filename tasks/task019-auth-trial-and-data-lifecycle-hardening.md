# Task 019: Auth, Trial, and Data Lifecycle Hardening

- Status: `completed`
- Priority: `P0`
- Phase: `Auth & Data Lifecycle`
- Depends on: `task017`, `task018`

## Objective

Make auth restore, onboarding, trial state, and user/dog data lifecycle production-safe.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- verify Supabase user row creation and trial initialization
- harden onboarding resume, sign-out, failed bootstrap, and missing dog states
- define local hydration behavior for signed-in users before sync lands
- ensure free users retain logging, timeline, and CSV export

## Initial Findings

Captured before remediation:

- Supabase auth and dog profile setup exist, but staging lifecycle behavior needs proof
- trial setup is implemented but needs deterministic validation
- missing local hydration rules can create confusing states before remote sync is available

## Out of Scope

- implementing the full WatermelonDB to Supabase sync engine
- Apple Sign-In
- household sharing

## Acceptance Criteria

- auth restore routes users correctly to auth, onboarding, or tabs
- trial state is deterministic and does not silently skip setup
- user and dog ownership checks are tested
- free users retain logging, timeline access, and CSV export

## Deferred to Later Tasks

- remote sync orchestration is deferred to `task020`
- RevenueCat entitlement enforcement is deferred to `task021`

## Validation

- auth unit and integration tests added in the `task018` style
- manual Supabase staging smoke test documented
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`

## Completed Work

- Moved trial initialization into authenticated-session bootstrap so sign-up, sign-in, and restore paths initialize missing trial windows deterministically.
- Prevented `expired`, `active`, and `grandfathered` users from being silently moved back into trial.
- Added client-side dog ownership validation for bootstrap, onboarding completion, and add-dog flows.
- Hardened onboarding and add-dog lifecycle behavior so newly created dog rows stay in memory if the follow-up Supabase read lags.
- Added a pure auth routing decision helper for signed-out, onboarding-required, onboarded, expired-trial, and dismissed-paywall states.
- Preserved free-mode access after trial paywall dismissal so logging, timeline, CSV export, and safety tools remain reachable.
- Documented pre-sync local hydration rules in `docs/architecture/auth-data-lifecycle.md`.
- Documented the staging auth/trial/data lifecycle smoke test in `docs/deployment/auth-trial-data-lifecycle-smoke-test.md`.
- Added auth lifecycle and route decision tests in the `task018` Jest style.

## Validation Notes

- `corepack pnpm test -- --runInBand` passed on 2026-04-26 with 8 suites and 37 tests.
- Critical-module coverage passed on 2026-04-26 with 92.01% statements, 78.97% branches, 98.63% functions, and 91.54% lines.
- `corepack pnpm check-types` passed on 2026-04-26.
- `corepack pnpm lint --quiet` passed on 2026-04-26.
