# Task 007: Care Calendar and opt-in native reminders

Status: Implemented tasks/recurrence and native opt-in adapters; delivery/device QA pending
Dependencies: task005, task006.

## Context

Manual care plans and useful reminders reduce missed routines. Notification adapters were removed from the foundation; the pinned base can inform implementation but is not proof of a working BarkLog flow.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- P6 local care tasks: refill/preventive/grooming/vaccine/vet/training/custom, recurrence and completion.
- Wire native reminder adapters with minimal manifest/capability changes.
- Explicit reminder opt-in, denial state, reschedule/cancel and notification tap routing.

## Acceptance criteria

- [ ] Task saves locally even if permission is denied or scheduling fails; distinguish saved task from reminder failure.
- [ ] Permission is requested only after explicit reminder enablement; no Home/onboarding prompt.
- [ ] Editing/deleting/completing tasks updates OS schedules and retained records consistently.
- [ ] Android reboot restoration and iOS foreground/tap behavior work on current devices.
- [ ] Timezone/DST/recurrence boundaries and overdue tasks have tested behavior.
- [ ] Notification payload/copy minimizes care detail; no remote push or smart automation.

## Validation

- Recurrence/timezone, denial/scheduling failure, retry/cancel and idempotency tests.
- Physical Android/iPhone permission grant/deny, delivery/tap/reboot and no-save-blocking QA.

## Boundary and handoff

Enable notifications manifest flag only with the actual product wiring and device evidence.
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
