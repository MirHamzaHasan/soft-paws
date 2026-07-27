# BarkLog Production Readiness Plan

## Objective

Take BarkLog from the current mixed prototype / boilerplate repo state to a production-ready mobile app aligned to the canonical BarkLog spec.

## Current Baseline

`task001` through `task015` completed the prototype-completion backlog and established broad BarkLog feature coverage. `task016` through `task024` added the production-hardening gates for tests, secret hygiene, authenticated sync, RevenueCat entitlement enforcement, AI safety, native QA, and release preflight. The app should not be submitted until the release owner fills the preview-build evidence in the release preflight checklist.

## Production Rebaseline Findings

| Area                            | Current State                                                                                                                                                                | Production Blocker                                                                                              | Owner Task                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Stack and UI runtime            | The repo is implemented with Tamagui and task docs use Tamagui as the active runtime.                                                                                        | Older canonical docs still mention NativeWind, so production-hardening work must not start a styling migration. | `task016`                       |
| Secrets and environment         | Environment examples now use safe placeholders and docs separate client-safe values from server-only secrets.                                                                | Remote preview and production secrets still need to be configured outside the repo before release validation.   | `task017`                       |
| Automated tests                 | Jest now runs focused critical-module coverage for local logging, exports, premium access, toxicity lookup, medication scheduling, and auth-session selectors.               | Broader auth lifecycle, sync, RevenueCat, AI, and native QA tests remain in later production tasks.             | `task018`                       |
| Auth, trial, and user lifecycle | Auth restore, trial initialization, dog ownership checks, free-mode paywall dismissal, and pre-sync local hydration rules are hardened and tested.                           | Staging smoke test must be run against a real Supabase project before release.                                  | `task019`                       |
| Offline sync                    | WatermelonDB sync now has an authenticated client engine, Supabase Edge Function, conflict retry, tombstones, and Home sync status surfacing.                                | Staging and native-device sync validation still need to run before release.                                     | `task020`, `task023`, `task024` |
| Premium access                  | RevenueCat SDK purchase, restore, offering lookup, and entitlement reads now gate Premium activation. Supabase caches only verified entitlement state.                       | iOS and Android sandbox purchase evidence still needs to be captured before store release.                      | `task021`, `task024`            |
| AI and safety                   | AI calls go through Supabase Edge Functions with Premium and dog-ownership checks before model calls, emergency escalation fixtures, safe failures, and telemetry redaction. | Release observability verification still needs preview-build evidence.                                          | `task022`, `task024`            |
| Native and export QA            | Notification manifests now match configured capabilities, unsupported camera/location/health copy is explicit, reminder scheduling fails safely, and native text exports write shareable files. | Physical preview-build permission, reminder, export, and layout evidence still needs to be captured in release preflight. | `task023`, `task024`            |
| Release gate                    | A repeatable release preflight checklist now ties tests, builds, Supabase functions, RevenueCat, observability, store copy, native QA, rollback, and hotfix evidence together. | Release sign-off still requires actual preview-build and service-dashboard evidence from the release owner.     | `task024`                       |

## Implementation Baseline

- Tamagui is the active styling and UI foundation for this repo.
- All task execution should reuse and extend Tamagui rather than introduce NativeWind or Tailwind.
- This production-hardening backlog treats Tamagui as the implementation baseline; NativeWind migration is out of scope unless a future stack task explicitly reopens that decision.

## Readiness Definition

BarkLog is production-ready when:

- the repo matches the canonical stack and route structure
- one-tap logging works offline-first with local persistence and remote sync
- auth, trials, entitlements, and premium gates work end to end
- AI and safety surfaces follow the defined trust boundaries
- analytics, crash reporting, notifications, and release processes are in place
- iOS and Android builds are testable and app-store ready

## Phase Breakdown

### Phase 1: Foundation

- `task001` stack and workspace alignment
- `task002` route and folder structure migration
- `task003` design system and Tamagui foundation
- `task004` Supabase schema and environment baseline
- `task005` WatermelonDB offline data layer and sync contract
- `task006` auth, onboarding, and trial bootstrap

### Phase 2: Core Care Loop

- `task007` Home and one-tap logging loop
- `task008` event detail flows and timeline
- `task009` medications, reminders, and settings foundation

### Phase 3: Intelligence and Safety

- `task010` insights dashboard and AI pipeline
- `task011` toxicity, triage, emergency, and first-aid suite
- `task012` paywall, entitlements, and premium gating

### Phase 4: Expansion and Retention

- `task013` profile hub, household, and multi-dog support
- `task014` memory book, expense tracker, and export completion

### Phase 5: Launch Readiness

- `task015` observability, native integrations, QA hardening, and release prep

### Phase 6: Production Hardening

- `task016` production readiness gap rebaseline
- `task017` secrets, environment, and config hardening
- `task018` automated test foundation and critical coverage
- `task019` auth, trial, and data lifecycle hardening
- `task020` WatermelonDB to Supabase sync engine
- `task021` RevenueCat entitlements and premium enforcement
- `task022` AI safety, Edge Functions, and premium gates
- `task023` native permissions, device QA, and export hardening
- `task024` release preflight, observability, and store readiness

## Critical Path

1. Preserve the completed prototype baseline from `task001` through `task015`.
2. Rebaseline production gaps and remove unsafe environment assumptions.
3. Establish automated tests for core product rights and safety boundaries.
4. Harden auth, trial state, sync, RevenueCat entitlements, and AI safety gates.
5. Execute the release preflight checklist and record preview-build evidence before store submission.

## Task Index

| Task | Title                                                              | Status    | Depends On                   |
| ---- | ------------------------------------------------------------------ | --------- | ---------------------------- |
| 001  | Stack and workspace alignment                                      | completed | none                         |
| 002  | Route and folder structure migration                               | completed | 001                          |
| 003  | Design system and Tamagui foundation                               | completed | 001, 002                     |
| 004  | Supabase schema and environment baseline                           | completed | 001                          |
| 005  | WatermelonDB offline data layer and sync contract                  | completed | 004                          |
| 006  | Auth, onboarding, and trial bootstrap                              | completed | 002, 004, 005                |
| 007  | Home and one-tap logging loop                                      | completed | 003, 005, 006                |
| 008  | Event detail flows and Timeline                                    | completed | 007                          |
| 009  | Medications, reminders, and settings foundation                    | completed | 006, 008                     |
| 010  | Insights dashboard and AI pipeline                                 | completed | 008, 009, 012                |
| 011  | Toxicity, triage, emergency, and first-aid suite                   | completed | 003, 006, 008                |
| 012  | Paywall, entitlements, and premium gating                          | completed | 004, 006                     |
| 013  | Profile hub, household, and multi-dog support                      | completed | 008, 012                     |
| 014  | Memory book, expense tracker, and export completion                | completed | 010, 013                     |
| 015  | Observability, native integrations, QA hardening, and release prep | completed | 009, 010, 011, 012, 013, 014 |
| 016  | Production readiness gap rebaseline                                | completed | 015                          |
| 017  | Secrets, environment, and config hardening                         | completed | 016                          |
| 018  | Automated test foundation and critical coverage                    | completed | 016                          |
| 019  | Auth, trial, and data lifecycle hardening                          | completed | 017, 018                     |
| 020  | WatermelonDB to Supabase sync engine                               | completed | 017, 018, 019                |
| 021  | RevenueCat entitlements and premium enforcement                    | completed | 017, 018, 019                |
| 022  | AI safety, Edge Functions, and premium gates                       | completed | 017, 018, 021                |
| 023  | Native permissions, device QA, and export hardening                | completed | 018, 020                     |
| 024  | Release preflight, observability, and store readiness              | completed | 020, 021, 022, 023           |
