# Task 015: Legacy journal compatibility and update policy

Status: Not started
Dependencies: task002, task010; before updates to existing users.

## Context

The same bundle/application IDs retain update lineage, but the new SQLite app does not read WatermelonDB automatically. Old device records must not be silently erased.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Inventory the archived RN schema and on-device file layout without altering installed records.
- Define tested mappings/export-import route or a clearly communicated fresh-install/distribution boundary.
- Preserve legacy DB/files and define rollback behavior; make the decision explicit in release docs.

## Acceptance criteria

- [ ] Unknown/old DB files are preserved by startup, deletion and upgrade code until authorized policy says otherwise.
- [ ] A dry-run inventory/mapping identifies supported/unsupported fields, files, versions and record counts.
- [ ] Implemented import is transactional/idempotent with verified counts and attachment/date/dog mappings.
- [ ] Failed import/cancel/rollback keeps the original data recoverable.
- [ ] If import is deferred, distribution cannot claim journal-compatible updates; caregiver export guidance is clear.
- [ ] New DB naming/schema never collides with old data.

## Validation

- Golden exported/schema fixtures and migration rollback/idempotency tests when import is implemented.
- Upgrade on a disposable RN installation with known records; verify source files and restored/opened exports.

## Boundary and handoff

This gate precedes distribution over valuable existing journals, even if all new-app tests pass.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
