# Task 019: Local Memory Book

Status: Implemented factual collections/captions and native PDF sharing; native QA in progress
Dependencies: task004, task012; task010 for PDF sharing.

## Context

Caregivers can revisit everyday moments without creating a medical narrative or unlocking a paid feature.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- P4 month/dog-based local highlights using saved care events and selected photos.
- Factual captions and local share/export integration when available.
- Sparse/empty/error/month navigation and accessible photo presentation.

## Acceptance criteria

- [ ] Every highlight comes from real local records; no invented events or medical interpretation.
- [ ] Works offline and remains free; no upload, household sharing or cloud story generation.
- [ ] Dog/month scope and timezone boundaries match Timeline.
- [ ] Missing photos do not break records; large images/lists remain bounded.
- [ ] Share/export failure preserves records and useful retry.

## Validation

- Highlight/month/dog selection and missing-photo tests.
- Both hosts offline month navigation, long notes, photo memory and native sharing.

## Boundary and handoff

AI prose is optional later work and must follow task014/task017 boundaries.
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
