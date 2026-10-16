# Task 011: Bundled training catalog and sessions

Status: Implemented bundled catalog, enrollment and atomic sessions; native QA in progress
Dependencies: task004, task005.

## Context

Positive-reinforcement training and progress are included for every dog. Weekly rotation highlights content without restricting catalog access.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- TR1–TR3 bundled catalog/programs/steps, enrollment and progress.
- Session duration/step/observations/rating/mood and matching Timeline event.
- Deterministic training summary hooks.

## Acceptance criteria

- [ ] Entire catalog and progress work offline without purchase/sign-in.
- [ ] Content has reviewable provenance, positive reinforcement and no punitive advice.
- [ ] Session and Timeline event commit atomically; failure does not advance progress.
- [ ] Multi-dog enrollment and completion stay independent; repeat/cancel behavior is clear.
- [ ] Catalog empty/error/loading and large-text progress UI are handled.

## Validation

- Catalog validation, enrollment/progress/session transaction and rotation tests.
- Both hosts offline catalog → enroll → session → Timeline → restart.

## Boundary and handoff

Optional AI personalization remains deferred and bounded by task014/task018 policies.
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
