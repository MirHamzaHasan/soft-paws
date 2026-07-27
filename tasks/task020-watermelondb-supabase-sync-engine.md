# Task 020: WatermelonDB to Supabase Sync Engine

- Status: `completed`
- Priority: `P0`
- Phase: `Offline Sync`
- Depends on: `task017`, `task018`, `task019`

## Objective

Implement actual authenticated sync for WatermelonDB collections instead of only sync metadata and contracts.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- implement pull and push orchestration for `users`, `dogs`, `events`, `medications`, `insights`, `vaccinations`, and `expenses`
- add Supabase Edge Functions or RPC endpoints using the existing Watermelon sync contract
- wire sync after auth bootstrap, app foreground, and manual refresh where appropriate
- surface sync status and failures without blocking local logging

## Initial Findings

Captured before remediation:

- local writes mark records unsynced and update sync metadata
- sync contract and metadata helpers exist
- no production push/pull engine is wired between WatermelonDB and Supabase

## Out of Scope

- changing local-first logging semantics
- replacing WatermelonDB
- building household sharing

## Acceptance Criteria

- offline-created events sync to Supabase with stable UUIDs
- remote changes hydrate local WatermelonDB after sign-in
- conflict behavior matches the documented reject-pull-retry policy
- local logging remains usable when sync fails
- sync status is observable enough for support and QA

## Completed Work

- added a Watermelon `synchronize()` engine with authenticated pull and push transport
- wired background sync after auth bootstrap, app foreground, and local quick-log writes
- added a manual sync path through Home refresh while keeping instant logging local-first
- added sync metadata for trigger, local/remote change counts, completion time, and failures
- surfaced sync-paused state on Home without blocking local logging
- added the `barklog-sync` Supabase Edge Function for authenticated pull and push
- added Supabase `updated_at` conflict timestamps and `sync_deleted_records` tombstones
- scoped server-side sync writes to the authenticated user and owned dogs
- implemented one retry after a backend `sync_conflict` response
- updated sync architecture and staging smoke-test documentation

## Deferred to Later Tasks

- native device sync validation evidence is required by the `task024` release preflight
- release preflight sync gates are completed in `task024`

## Validation Notes

- sync unit coverage includes pull, push, retry, conflict mapping, and failure metadata
- staging Supabase smoke test documented in `docs/deployment/watermelondb-supabase-sync-smoke-test.md`

## Validation

- sync unit tests for push, pull, retry, and conflict handling
- staging Supabase smoke test with offline event creation, reconnect, and remote hydration
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`
