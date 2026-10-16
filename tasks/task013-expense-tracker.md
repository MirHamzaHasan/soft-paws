# Task 013: Local care expenses

Status: Implemented decimal-safe local expenses, receipts and currency-separated totals; native QA in progress
Dependencies: task005.

## Context

Caregivers record dog spending and review totals without purchasing features or sending financial data to a backend.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- P5 expense add/edit/delete with amount/currency/category/date/notes and optional receipt after task012.
- Local monthly totals and free export inclusion after task010.
- Decimal-safe monetary representation and migration.

## Acceptance criteria

- [ ] Currency/unit are explicit; avoid floating-point rounding in persisted totals.
- [ ] Invalid amounts/dates fail safely; offline writes and restart preserve records.
- [ ] Totals/filter/date/dog scope match raw expenses.
- [ ] Receipt failure never blocks a valid expense save; removal cleans only owned files.
- [ ] No financial advice, bank connection, hosted analytics or purchase gate.

## Validation

- Monetary precision/validation/aggregation/delete and migration tests.
- Both hosts offline edit/filter/receipt/export journeys.

## Boundary and handoff

Receipt selection is optional and depends on task012 when included.
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
