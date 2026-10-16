# Task 005: Multi-dog profiles and local settings

Status: Implemented local profiles/settings; native journey verification in progress
Dependencies: task003.

## Context

Caregivers can manage several dogs for free. Profile identity and delete-data behavior must respect device-local ownership.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- P1/M1/M3 dog profile, add/edit/switch and persisted selected dog.
- P3 settings, local storage explanation, accessibility preferences as needed.
- Confirmed single-dog/all-data deletion with record scope and future export affordance.

## Acceptance criteria

- [ ] Dog switching scopes all downstream reads/writes and never shows another dog's details.
- [ ] Invalid/deleted selected dog falls back safely; no dog routes to setup.
- [ ] Dog/all-data deletion uses one transaction where required and warns clearly.
- [ ] Export is offered when task010 is available; unavailable export is not advertised as working.
- [ ] Deletion cancellation leaves records untouched; failure offers retry and no false reset.
- [ ] Auth state never controls local dog access; no profile is uploaded.

## Validation

- Selection restoration, cascade/delete rollback and multi-dog scope tests.
- Both hosts: two dogs/logs, switch, restart, confirmed delete/cancel and first-run return.

## Boundary and handoff

Unknown legacy database files remain outside destructive actions until task015 policy is implemented.
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
