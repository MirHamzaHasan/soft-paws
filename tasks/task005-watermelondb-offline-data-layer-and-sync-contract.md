# Task 005: WatermelonDB Offline Data Layer and Sync Contract

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: `task004`

## Objective

Establish WatermelonDB as the local-first persistence layer for BarkLog events and related records.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for any supporting UI or diagnostics added during this task. Do not introduce a parallel styling system.

## Scope

- create WatermelonDB schema mirroring the BarkLog data model
- define local models for users, dogs, events, medications, and supporting data
- define sync metadata and conflict-handling strategy
- design the local write path for events
- define sync contract between WatermelonDB and Supabase

## Out of Scope

- full UI implementation
- analytics instrumentation

## Acceptance Criteria

- local schema covers the canonical event model
- event writes can succeed without network access
- sync queue or equivalent state is defined
- conflict handling is documented for production use

## Validation

- local persistence works in offline conditions
- sync contract is documented and testable

## Delivery Notes

- added WatermelonDB plus decorator support to the repo baseline and enabled TypeScript decorators for model classes
- created the canonical local schema in `src/db/schema.ts` covering `users`, `dogs`, `events`, `medications`, `insights`, `vaccinations`, and `expenses`
- added Watermelon model classes, collection exports, migrations, and lazy database bootstrap under `src/db/`
- configured Watermelon record IDs to use `expo-crypto` `randomUUID()` so offline-created local records stay compatible with Supabase UUID primary keys
- added web and native adapter selection in `src/db/database.ts` using `LokiJSAdapter` for web preview and `SQLiteAdapter` for native clients
- added the first local-first write contract in `src/db/events/createLocalEvent.ts`
- added sync metadata helpers backed by Watermelon local storage plus a documented sync/conflict contract in `docs/architecture/watermelondb-sync-contract.md`

## Validation Evidence

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/db babel.config.js`
- `corepack pnpm exec expo export --platform web`

## Validation Gap

- native SQLite runtime has not yet been exercised in a dev client or simulator
- Supabase push/pull endpoints are still intentionally deferred to later tasks
