# WatermelonDB to Supabase Sync Smoke Test

Historical sync test. Care records remain local-only in v1.0.0. Use [native-device-qa-checklist.md](native-device-qa-checklist.md) for current offline persistence QA.

Run this against a staging Supabase project after applying all migrations and
deploying the `barklog-sync` Edge Function.

## Setup

- Use a staging Expo build or local dev client pointed at staging Supabase.
- Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured as
  Supabase Edge Function secrets.
- Confirm client env uses only staging `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Start with a test user and one owned dog from the auth lifecycle smoke test.

## Checklist

1. Sign in as the staging test user.
2. Turn off network connectivity.
3. Log Poop, Pee, Meal, and Walk events from Home.
4. Confirm the Home summary shows the events immediately while offline.
5. Restore network connectivity.
6. Background the app, then foreground it to trigger sync.
7. Confirm staging Supabase receives the four `events` rows with the same UUIDs
   as local WatermelonDB records.
8. Confirm the Home pending-sync count clears after the next local refresh.
9. Create or edit a dog row directly in staging Supabase for the same user.
10. Pull refresh Home or restart the app.
11. Confirm the remote dog change hydrates into local BarkLog state without
    clearing local events.
12. Simulate a conflict by editing the same dog locally and remotely before the
    next push.
13. Confirm the first push is rejected, the client retries after pull, and a
    persistent failure records sync metadata instead of blocking logging.

## Failure Handling

- If a local event does not appear remotely, inspect `barklog.sync.metadata`
  through the app logs and confirm the Edge Function returned no `sync_failed`
  error.
- If remote rows from another user appear locally, treat it as a launch-blocking
  authorization bug.
- If sync fails, Home may show a sync-paused warning, but instant logging must
  still save locally.
