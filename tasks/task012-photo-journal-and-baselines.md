# Task 012: Local photo journal and baselines

Status: Implemented private photo selection/references/baselines and cleanup; physical picker QA pending
Dependencies: task004, task005.

## Context

Dated owner-selected photos provide references. They do not imply medical comparison, analysis or cloud backup.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- T3/T4 native photo selection/copy, local file reference and baseline categories/date/title/body area/notes.
- Photo journal/list/detail and safe attachment deletion/file cleanup.
- Minimal platform photo picker configuration.

## Acceptance criteria

- [ ] Photo selection is user-triggered; cancellation/denial never discards the care draft.
- [ ] Retain a private local copy when required; restart still opens the reference.
- [ ] Missing/corrupt file has a useful fallback and never deletes unrelated records.
- [ ] No camera/microphone/broad storage permission, auto-upload or diagnostic comparison.
- [ ] DB/file failures are handled coherently with retry/cleanup policy and tests.

## Validation

- Metadata validation/file lifecycle/missing reference/migration tests.
- Physical Android/iPhone picker grant/deny/cancel/restart and large-image memory QA.

## Boundary and handoff

Local scene captioning is task017; photo compare/smart health analysis remains outside scope.
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
