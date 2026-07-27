# Developer Guide: BarkLog

## Start Here

Read these first:

1. [../agentic/product-truth.md](../agentic/product-truth.md)
2. [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)
3. [../agentic/workflows.md](../agentic/workflows.md)

## Product and Engineering Direction

BarkLog is a dog-only, software-only health companion app built around one-tap logging, offline-first persistence, AI-assisted observation, and carefully bounded health-safety tooling.

## Target Stack

- Expo
- React Native
- TypeScript strict mode
- Expo Router
- Tamagui
- Zustand
- TanStack Query
- WatermelonDB
- Supabase
- RevenueCat
- Expo Notifications
- Mixpanel
- Sentry

## Implementation Rules

- Logging is local-first. WatermelonDB writes happen before remote sync.
- AI calls only happen through Supabase Edge Functions.
- Premium features must be entitlement-gated.
- Free users retain logging, timeline access, and export rights.
- Home is the top-priority surface.
- BarkLog never diagnoses.

## Folder Guidance

- Keep route files in `app/` thin.
- Put shared UI in `src/components/ui/`.
- Put reusable BarkLog components in `src/components/features/`.
- Put persistence and sync logic in `src/db/` and `src/api/`.
- Use `src/stores/` for Zustand state.
- Use `src/services/` for RevenueCat, telemetry, and integration wrappers.

## Validation

Current repo commands:

- `pnpm check-types`
- `pnpm lint`
- `pnpm test`
- `pnpm web`

Install dependencies with `corepack pnpm install`.
