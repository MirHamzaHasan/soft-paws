# Task 004: Detailed observations and Timeline tools

Status: Implemented; simulator journeys pass; remaining platform gates below
Dependencies: task003.

## Context

Caregivers need nuance beyond quick logs while Timeline remains a factual record. Treat symptom/mood/behavior fields as owner observations.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- H2–H8 detailed Poop/Pee/Meal/Walk/Symptom/Mood/Behavior/Grooming/Weight forms.
- T2 detail, edit and confirmed delete; dog/type/date filters and paginated/lazy timeline.
- Typed event details, schema changes/migrations as needed, timestamps and optional notes.

## Acceptance criteria

- [x] Type-specific fields validate at the domain/repository boundary; weight units are explicit.
- [x] Saveable drafts retain input/expected revision; cancel preserves navigation context; request IDs make create retries idempotent. Actual rotation QA remains below.
- [x] Edit retains ID/creation time/type and dog scope; delete requires confirmation and checks the revision captured when confirmation opened.
- [x] Filtered empty/loading/error states are explicit and offline.
- [x] Symptoms are caregiver observations without diagnosis or treatment suggestions.
- [ ] Time/date controls and long lists work on small screens and with large text.

## Implemented slice

- Detailed Poop consistency, Pee amount, Meal food/portion, Walk minutes, Symptom
  observation, Mood choice, Behavior observation, Grooming activity and Weight
  amount with explicit kg/lb. Notes and local date/time are shared across forms.
- T2 lookup/edit/confirmed delete, with optimistic revisions and no change to ID,
  dog, type or creation time. Failed transactions publish no changed records.
- T1 dog/type/inclusive-local-date filters, SQLite-limited pages and LazyColumn.
  Home queries daily aggregates/only three recent records, not the entire journal.
- Schema v2 uses the existing filename and a non-destructive 1.sqm migration.
  The original 1.db snapshot stays unchanged. Existing details remain null.
- One-tap Home logging is unchanged. Styling is intentionally retained; the owner
  deferred screen redesign to tomorrow (2026-10-15).

JVM coverage currently passes the detail/repository/controller families, including
all nine detail types, request replay, scope/revision checks, failed edit/delete,
5,000-row paging/summary queries, v1 migration/reopen, saveable draft, DST gaps/
overlap/day bounds and navigation restoration. Native evidence will be recorded
in docs/verification.md. Physical accessibility/rotation/performance is not implied
by these tests or compilation.

## Validation

Task021 (2026-10-16) supersedes the historical schema-v2/styling notes above with
preserving schema v3 and the approved shared Compose kit. iOS tests now prove
retained SQLite drafts/notes, saving, detail and Timeline; Android native migration
and reopen tests pass. See [native board port](../docs/native-board-port.md).
The unchecked large-list/text/device acceptance criterion remains open.

- Detail validation/edit/delete/filter tests, migration tests and large synthetic timeline checks.
- Both hosts and Android/iOS form/keyboard/cancel/filter journeys.

## Boundary and handoff

Keep quick logging fast; rich forms must not replace the simple Home loop.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
