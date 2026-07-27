# BarkLog Supabase Baseline

## Schema

- Canonical SQL lives in `supabase/migrations/`.
- The initial migration creates the BarkLog public schema, RLS policies, auth bootstrap trigger, storage buckets, and storage object policies.
- Sync migrations add `updated_at` conflict timestamps and `sync_deleted_records` tombstones for Watermelon pull deletes.
- `supabase/config.toml` contains the local Supabase CLI baseline for BarkLog.
- `supabase/seed.sql` is intentionally empty until later tasks introduce fixture data.

## Sync Function

- `supabase/functions/barklog-sync` is the authenticated WatermelonDB sync endpoint.
- Client pull requests send `action: "pull"` with the standard Watermelon pull args.
- Client push requests send `action: "push"` with the standard Watermelon change set and `lastPulledAt`.
- The function authenticates the user from the bearer token, uses the service-role key for scoped server writes, and validates dog ownership before writing dog-scoped records.
- A `sync_conflict` response means the client should pull again and retry once.

## AI Functions

- `supabase/functions/generate-weekly-insight`, `supabase/functions/ask-barklog-ai`, `supabase/functions/generate-training-insight`, `supabase/functions/generate-care-summary`, and `supabase/functions/generate-vet-report` are the only places BarkLog calls text AI providers.
- AI functions require a signed-in user and verify Premium access server-side before any non-emergency model call.
- Valid access is `active`, `grandfathered`, or an unexpired `trial` row in `public.users`.
- Dog-scoped AI requests must include `dogId`; the function verifies ownership before model calls.
- Emergency-language Ask BarkLog AI inputs return immediate escalation guidance without calling the provider.
- Generated care summaries are Premium and must remain short, factual, non-diagnostic, and free of medication dosage advice.
- AI provider failures return safe caregiver-facing errors and do not expose raw prompts or provider details.

## Environment Separation

- Client-safe variables stay under `EXPO_PUBLIC_*` and are parsed only from `src/utils/clientEnv.ts`.
- Server-only variables are only referenced inside `supabase/functions/_shared/env.ts`.
- Run `corepack pnpm release:check-env-boundary` before preview and production builds to confirm the client bundle boundary still excludes AI keys and Supabase service-role keys.

## Storage Strategy

Private buckets:

- `dog-photos`
- `event-photos`
- `expense-receipts`
- `vaccination-records`

Path convention:

- first path segment is always the authenticated `user_id`
- later segments scope to dog, event, expense, or vaccination records

Signed URL rule:

- use `24h` signed URLs
- shared constant: `BARKLOG_SIGNED_URL_TTL_SECONDS` in `src/services/supabaseStorage.ts`
