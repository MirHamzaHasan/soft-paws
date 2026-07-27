# BarkLog Test Utilities

This folder contains the shared Jest helpers for production-readiness tests.

- `utils/builders.ts` creates typed BarkLog users, dogs, sessions, events, expenses, and medications without requiring Supabase or WatermelonDB.
- `utils/watermelon.ts` creates an in-memory write harness for repository tests that need to assert local-first WatermelonDB writes.
- `jest.setup.ts` owns lightweight Expo and navigation mocks used by unit tests.
- Sync tests mock Watermelon `synchronize()` and the Supabase function transport so pull, push, retry, and conflict behavior stay deterministic without a remote project.

Prefer focused tests for pure functions, stores, repository write contracts, safety copy boundaries, free-access guarantees, and premium gates. Do not add `--passWithNoTests`; an empty suite should fail.
