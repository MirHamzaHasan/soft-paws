# Task 006: Medication plans and vaccination records

Status: Implemented local plans, administration history and vaccinations; native QA in progress
Dependencies: task004, task005.

## Context

Owners record the plan prescribed by their vet. The app tracks facts; it never selects a dose or changes treatment.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- P2 plan create/edit/archive and medication administration event.
- Vaccination record/history and caregiver-entered due date.
- Local models/migrations and profile sections; reminder preferences prepare for task007.

## Acceptance criteria

- [ ] Medication name, caregiver-entered dosage/unit/schedule and dog scope are explicit.
- [ ] No dosing calculator, diagnosis or treatment recommendation is introduced.
- [ ] Administration history saves offline; plan edits preserve past administration facts.
- [ ] Validation/error/cancellation retain entries without duplicates.
- [ ] No notification prompt occurs just because a medication record is saved.

## Validation

- Plan/admin/vaccination validation and migration tests.
- Both hosts offline save/edit/archive/history and small-screen keyboard QA.

## Boundary and handoff

Reminder scheduling remains task007 and never gates a successful care record save.
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
