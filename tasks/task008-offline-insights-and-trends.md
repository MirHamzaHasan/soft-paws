# Task 008: Deterministic insights and monthly trends

Status: Implemented deterministic weekly/monthly summaries; native QA in progress
Dependencies: task004, task006.

## Context

Facts from saved observations provide value before AI. Missing logs cannot be interpreted as medical findings.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- I1/I2 weekly/monthly counts, care patterns and readable trend charts.
- Pure deterministic summaries with date range, dog scope and source records.
- No hosted analytics or model required.

## Acceptance criteria

- [ ] Counts/ranges/timezones match Timeline and distinguish no observations from a negative health outcome.
- [ ] Empty/sparse/large datasets produce useful, bounded factual copy.
- [ ] All summaries work offline and avoid diagnosis, predictions or invented observations.
- [ ] Charts include text equivalents and do not encode state only in color.
- [ ] Expensive aggregation runs off UI and is measured before optimization claims.

## Validation

- Fixed-input summary/date/unit/multi-dog tests and large-data aggregation checks.
- Both hosts offline charts/range changes/accessibility and layout review.

## Boundary and handoff

AI narratives are later optional enhancements, never a replacement for factual summaries.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.

## 2026-10-15 application port

Implemented under [task021](task021-complete-board-application.md), following the
owner’s request to move the whole approved board into the application. Shared
Compose routes use real local SQLDelight data, retained drafts and scoped errors.
`CompleteJournalTest` adds storage/transaction, scope, precision, recurrence and
source-reference checks. Physical-device gates above remain separate.
