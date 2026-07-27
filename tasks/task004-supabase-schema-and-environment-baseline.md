# Task 004: Supabase Schema and Environment Baseline

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: `task001`

## Objective

Set up the BarkLog cloud backend baseline in Supabase.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for any supporting UI added during this task. Do not introduce a parallel styling system.

## Scope

- create and validate environment variable handling
- add the canonical SQL migrations
- configure RLS policies
- configure storage strategy for dog photos, receipts, and event photos
- scaffold Edge Functions:
  - `generate-weekly-insight`
  - `generate-vet-report`
  - `toxicity-lookup`

## Out of Scope

- final function logic
- client-side feature integration

## Acceptance Criteria

- canonical schema exists as runnable migrations
- environment variables are separated into client-safe and server-only groups
- Supabase client configuration exists in the repo
- Edge Function scaffolds are present

## Validation

- migrations apply cleanly in a local or staging Supabase project
- no server-only secret is referenced from client code

## Delivery Notes

- added client-safe environment parsing in `src/utils/clientEnv.ts` with explicit separation from server-only secrets
- added typed Supabase client bootstrap in `src/api/supabaseClient.ts` and MMKV-backed auth persistence in `src/services/supabaseAuthStorage.ts`
- added BarkLog storage bucket constants, signed URL TTL, and canonical object path helpers in `src/services/supabaseStorage.ts`
- added `src/types/supabase.ts` to establish the initial typed contract for the canonical public schema
- replaced the placeholder API client export surface with Supabase-backed client access in `src/api/`
- added the canonical SQL baseline in `supabase/migrations/202604240001_public_schema.sql`, including tables, indexes, RLS, auth-user sync triggers, helper functions, and storage policies
- initialized the Supabase CLI project baseline with `supabase/config.toml` and an empty `supabase/seed.sql`
- scaffolded shared Edge Function helpers plus placeholder entry points for `generate-weekly-insight`, `generate-vet-report`, and `toxicity-lookup`

## Validation Evidence

- `corepack pnpm check-types`
- targeted `corepack pnpm exec eslint` on touched client and Edge Function files
- `npx supabase --version`
- `npx supabase init --yes`

## Validation Gap

- `npx supabase start` could not complete because the local Docker daemon was unavailable at `unix:///Users/mirhamzahasan/.docker/run/docker.sock`
- local migration application still needs to be rerun once Docker Desktop is running or against a linked staging Supabase project
