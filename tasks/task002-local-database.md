# Task 002: Device-local SQLDelight database

Status: Implemented; extended native UI/release QA remains task003/task016
Dependencies: task001.

## Context

Preferences and sample snapshots are unsuitable for relational care records. This slice introduces the actual journal store before any save button is wired.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Verify an established SQLDelight version against Kotlin 2.2.21/AGP 8.11.1 and both platforms; record the choice.
- Add platform SQLite driver factories and required local-data startup/cleanup in AppContainer.
- Schema v1: device owner, dogs, care_events; dog/time/type indexes, UUIDs, UTC timestamps and metadata for schema/version.
- Implement JournalRepository reads/writes with transactions, input validation and Flow; use a distinct new DB filename.

## Acceptance criteria

- [x] No account/network/credential is needed to open/read/write the database.
- [x] Writes complete and commit before observable records or success are emitted.
- [x] Dog names are trimmed/validated; unknown dog/event references and invalid input fail safely.
- [x] Database work runs off the UI thread; cancellation before commit and failed transactions leave data intact.
- [x] Schema v1 reopen preserves records; version/format/corruption failure offers retry, not automatic reset. No v2 migration exists yet.
- [x] Unknown old WatermelonDB files are untouched; no legacy import claim is made.
- [x] Native Android driver reopen and iOS process restart read persisted records; preferences never contain care records.

## Implementation evidence — 2026-10-14

SQLDelight 2.1.0 compiles with Kotlin 2.2.21, Compose 1.9.3 and AGP 8.11.1.
kotlinx-datetime 0.7.1 supports shared device-zone/DST grouping. The static iOS
host links system SQLite with -lsqlite3 in both configurations.

Seven real-SQLite JVM repository tests cover file reopen/stable owner, ordering,
dog scope, validation, transaction failure/no emission, cancellation rollback,
unsupported metadata/version and unknown type/downgrade rejection. The v1
schema snapshot passes :shared:verifySqlDelightMigration (also in verify.py/CI).

Native Android API 35 tests passed with airplane mode enabled: a uniquely named
test DB saves a dog/four events and reopens, and a deliberately corrupt file is
rejected without deletion or byte changes. Android's default destructive
onCorruption handler is explicitly overridden. iPhone 16/iOS 18.5 first-run
setup/four saves/Timeline/process relaunch retained the dog and all four records.
See docs/verification.md for full build evidence and remaining limits.

## Validation

- Repository integration tests for write/read/reopen, ordering, dog scoping, failed transaction and schema handling.
- Build both hosts; exercise offline reopen on Android and iOS; update architecture/data docs.

## Boundary and handoff

This task makes storage available, not user onboarding. task003 connects the first real caregiver loop.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
