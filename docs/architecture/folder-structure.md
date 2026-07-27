# Architecture: Folder Structure

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Target Layout

- `app/`
  - Expo Router entry files only
  - auth, onboarding, tabs, and pushed routes
- `src/components/ui/`
  - base UI primitives
- `src/components/features/`
  - reusable BarkLog feature components
- `src/db/`
  - WatermelonDB schema, models, migrations, sync helpers
- `src/api/`
  - Supabase client and query hooks
- `src/stores/`
  - Zustand stores
- `src/hooks/`
  - product hooks and native integration hooks
- `src/services/`
  - RevenueCat, Mixpanel, Sentry, and native service adapters
- `src/utils/`
  - date helpers, formatters, and shared helpers
- `src/constants/`
  - event enums, symptom maps, breed data, toxicity constants
- `src/types/`
  - shared TypeScript contracts
- `src/theme/`
  - JS-accessible design tokens
- `supabase/migrations/`
  - SQL schema and policy migrations
- `supabase/functions/`
  - Edge Functions

## Folder Rules

- Keep route files thin.
- Put reusable logic in `src/`, not `app/`.
- Prefer feature components under `src/components/features/` before duplicating screen-local markup.
- Keep storage and sync logic out of screen components.
