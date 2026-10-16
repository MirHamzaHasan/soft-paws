# Task 010: Free local exports and vet preparation

Status: Implemented scoped CSV/PDF/native share/print; native handoff QA in progress
Dependencies: task004, task005, task006.

## Context

Without cloud backup, free factual exports are the caregiver's external copy. Reports must organize observations without diagnosis.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- I3 dog/date-scope factual report, CSV export and PDF generation.
- Android/iOS export/share/print adapters, file lifecycle and iPad share popover.
- Settings export affordance before deleting data.

## Acceptance criteria

- [ ] Exports work offline, include correct scope/timestamps/units and quote/escape CSV safely.
- [ ] PDF handles pagination, long notes, fonts and accessible readable layout.
- [ ] No free export is gated or sent to a server; no share link is promised.
- [ ] Cancellation/failure retains data and enables retry; temporary files are cleaned safely.
- [ ] Opening/sharing the actual CSV/PDF succeeds on both platforms.
- [ ] Report copy clearly separates owner observations from clinical judgment.

## Validation

- CSV injection/escaping/data scope tests; rendered PDF visual and content checks.
- Android/iPhone/iPad native share/print/offline/failure journeys.

## Boundary and handoff

Export success means a valid file/share handoff, not proof the owner retained an external copy.
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
