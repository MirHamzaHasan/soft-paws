# Task 001: Stack and Workspace Alignment

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: none

## Objective

Align the repository to the agreed BarkLog implementation stack and workspace model before feature work begins.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- reconcile current dependencies against the canonical stack
- stabilize and preserve the existing Tamagui styling and runtime foundation
- standardize package-manager direction toward `pnpm`
- identify repo areas still tied to boilerplate managers or prototype-only assumptions
- update build, validation, and local setup commands as needed

## Initial Findings

Captured before remediation:

- package name is still `react-native-boilerplate`
- current package manager artifacts are npm-based:
  - `package-lock.json`
  - npm scripts in `package.json`
- current UI stack uses Tamagui packages and generation scripts and should remain the active styling system
- canonical stack dependencies are not yet present:
  - TanStack Query
  - WatermelonDB
  - Supabase client packages
  - RevenueCat target client setup
  - Mixpanel target package
  - Sentry target package
  - Lucide React Native
- repo still contains legacy bootstrap artifacts:
  - `src/managers`
  - `app.managers.ts`
  - `module-registry.json`
- current source layout still uses `src/store` instead of the target `src/stores`
- current feature folders are partly aligned, but the canonical support folders are still missing:
  - `src/db`
  - `src/services`
  - `src/theme`
  - `src/components/features`

## Out of Scope

- feature implementation
- screen redesign
- backend data modeling beyond setup requirements

## Acceptance Criteria

- dependency gap analysis is documented
- canonical stack decisions are reflected in package and setup files
- obsolete stack assumptions are either removed or clearly marked legacy
- local setup instructions match the target workspace model

## Delivery Notes

- preserved `Tamagui` as the active styling and runtime foundation
- restored and validated the Tamagui root provider, Babel plugin, Metro plugin, and generation files
- added a BarkLog root provider layer for React Query and navigation theming
- renamed app and Android metadata from the starter boilerplate to BarkLog
- switched workspace setup and docs to `pnpm`
- replaced starter README and environment example with BarkLog-specific versions
- scaffolded canonical support folders:
  - `src/components/features`
  - `src/db`
  - `src/services`
  - `src/stores`
  - `src/theme`
- removed the abandoned NativeWind/Tailwind path so the repo has one active styling system
- neutralized obsolete ads, PostHog, and direct IAP managers so the repo can drop those starter dependencies

## Deferred to Later Tasks

- WatermelonDB implementation and sync wiring are deferred to `task005`
- Supabase environment bootstrapping and client wiring are deferred to `task004`
- RevenueCat implementation is deferred to `task012`
- Mixpanel and Sentry integration are deferred to `task015`

## Validation

- install succeeds with the chosen package manager path
- `pnpm check-types` passes after the transition changes
- updated docs reference the same stack without contradiction
