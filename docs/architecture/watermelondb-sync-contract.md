# Architecture: WatermelonDB Sync Contract

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Local Ownership

- WatermelonDB owns local-first persistence for `users`, `dogs`, `events`, `medications`, `insights`, `vaccinations`, `expenses`, `dog_training_enrollments`, `training_sessions`, `care_tasks`, and `photo_baselines`
- Watermelon internal `_status` and `_changed` fields are the queue-equivalent for pending writes
- BarkLog sync health metadata lives in Watermelon local storage under `barklog.sync.metadata`

## ID Strategy

- BarkLog local Watermelon records use `expo-crypto` `randomUUID()` via Watermelon `setGenerator()`
- this keeps local IDs compatible with Supabase UUID primary keys
- offline-created records can therefore be pushed as inserts without remapping local IDs later

## Adapter Strategy

- native: `SQLiteAdapter`
- web preview: `LokiJSAdapter` with IndexedDB persistence
- the database is bootstrapped lazily through `getBarklogDatabase()` so the app does not hard-couple route rendering to database creation before feature consumers land

## Pull Contract

Watermelon `pullChanges` requests must follow the standard Watermelon shape:

- `lastPulledAt`
- `schemaVersion`
- `migration`

The backend response must return:

- `changes`
- `timestamp`

The client calls the authenticated Supabase Edge Function at
`/functions/v1/barklog-sync` with `action: "pull"`. The function scopes all
returned rows to the signed-in BarkLog user, converts remote timestamp columns
to Watermelon number fields, and returns tombstoned delete IDs from
`public.sync_deleted_records`.

## Push Contract

Watermelon `pushChanges` requests must send:

- `changes`
- `lastPulledAt`

The backend must:

- authenticate the BarkLog user
- upsert by client-provided UUID
- reject pushes when the same remote record changed after `lastPulledAt`
- return rejected IDs only when partial acceptance is explicitly supported later

The client calls the same Edge Function with `action: "push"`. Pushes process
`users`, `dogs`, `events`, `medications`, `insights`, `vaccinations`,
`expenses`, `dog_training_enrollments`, `training_sessions`, `care_tasks`, and
`photo_baselines`, with dog-owned tables validated against the signed-in user's
dog IDs before service-role writes occur.

## Conflict Policy

- default Watermelon pull resolution is kept: locally dirty columns remain authoritative during pull merges
- if Supabase detects a newer remote update during push, the push should fail, the client should pull again, and then retry push
- event creation remains append-first; profile-style records such as `dogs` and `medications` are the main concurrent-edit risk

The client sync engine retries one time after a `sync_conflict` response. If the
retry fails, sync metadata records the error and local logging remains usable.

## Sync Lifecycle

- auth bootstrap triggers background sync after a signed-in session is restored
- returning to the foreground triggers background sync
- Home refresh can trigger manual sync before reloading the local snapshot
- quick logging still returns after the local Watermelon write; network sync is fire-and-forget
- Home surfaces a sync-paused warning when the latest sync attempt fails

## Local Event Write Path

1. Home or detail flow calls `createLocalEvent()`
2. Event is written inside a Watermelon writer
3. `synced` is initialized to `false`
4. sync metadata records `lastLocalWriteAt`
5. sync orchestration reads Watermelon dirty state and local sync metadata before pushing
6. UI pending-sync counts use Watermelon `syncStatus` so successfully pushed records are no longer shown as pending

## Follow-Up Work

- validate native SQLite behavior in dev client / simulator before production release
- validate the sync Edge Function against staging Supabase before release
