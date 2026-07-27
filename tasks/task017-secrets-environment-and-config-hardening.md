# Task 017: Secrets, Environment, and Config Hardening

- Status: `completed`
- Priority: `P0`
- Phase: `Production Hardening`
- Depends on: `task016`

## Objective

Make environment handling safe for production, preview, and local development.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- replace real-looking values in `env.example` with dummy placeholders
- document client-safe versus server-only variables
- ensure service-role and Anthropic keys are never exposed to Expo client builds
- validate `app.json`, `eas.json`, Supabase function secrets, and environment docs

## Initial Findings

Captured before remediation:

- `env.example` contains real-looking Supabase URL and token-shaped values
- server-only variable names appear near client-safe variables, which can lead to accidental Expo exposure
- release docs describe environment needs but do not yet provide a production-safe verification gate

## Out of Scope

- changing feature behavior
- deploying remote projects
- rotating remote secrets directly from this task

## Acceptance Criteria

- no service-role-shaped secret appears in tracked examples or docs
- setup docs show local, preview, and production environment requirements
- Expo export does not expose server-only variables
- client-safe and server-only variables are documented separately

## Deferred to Later Tasks

- RevenueCat entitlement wiring is deferred to `task021`
- AI Edge Function safety checks are deferred to `task022`
- release preflight verification is deferred to `task024`

## Validation

- `rg "SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" env.example docs app src`
- `corepack pnpm exec expo export --platform web`

## Completed Work

- Replaced real-looking Supabase and key-shaped values in `env.example` with dummy placeholders.
- Removed server-only secret names and key-shaped examples from tracked environment docs and examples.
- Documented local, preview, and production environment requirements in `docs/deployment/env-management.md`.
- Clarified that server-only AI provider and Supabase privileged admin secrets belong in Supabase Edge Function secret management, not Expo env files or `EXPO_PUBLIC_*` values.
- Verified `app.json` does not define static environment values and `eas.json` only defines `EXPO_PUBLIC_APP_ENV` per build profile.
- Expanded `.gitignore` so all dot-env files remain local-only.
- Updated the root README setup notes to point developers at `env.example` and client-safe Expo variables only.

## Validation Notes

- `rg "SUPABASE_SERVICE_ROLE_KEY|sk-ant|service_role" env.example docs app src` returned no matches on 2026-04-26.
- `corepack pnpm exec expo export --platform web` passed on 2026-04-26.
- `EXPO_NO_DOTENV=1 EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-supabase-anon-public-key EXPO_PUBLIC_APP_ENV=development corepack pnpm exec expo export --platform web` passed on 2026-04-26.
- `rg "SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|sk-ant|service_role" dist` returned no generated web bundle matches on 2026-04-26.
