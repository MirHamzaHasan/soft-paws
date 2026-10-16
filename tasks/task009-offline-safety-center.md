# Task 009: Versioned offline Safety Center

Status: Implemented bounded, source-checked offline pack and contacts; physical call QA pending
Dependencies: task001; task005 for dog-scoped emergency card.

## Context

Urgent information must be available without network, account or model. Content needs explicit evidence and health boundaries.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- E0–E4 emergency actions/card, first-aid basics, core toxicity lookup and bounded triage.
- Bundle reviewed source/version metadata and deterministic content; copy veterinary contact actions.
- Native call handoff where appropriate with no location/camera/AI dependency.

## Acceptance criteria

- [ ] Core information and escalation work offline; urgent actions remain prominent.
- [ ] Content is sourced/versioned and reviewed against authoritative veterinary sources before use.
- [ ] No diagnosis, treatment/dose calculation, camera identification or AI safety decision.
- [ ] Emergency contact editing/saving works locally; missing contact state gives useful guidance.
- [ ] Unknown toxicity query does not imply safe; provide appropriate veterinary escalation.
- [ ] Accessible hierarchy/contrast/large targets and physical call handoff are checked.

## Validation

- Content/schema/search/unknown/urgent-routing tests and manual source review.
- Both hosts airplane-mode lookup/first aid/emergency and platform call/cancel behavior.

## Boundary and handoff

No safety copy is invented during UI scaffolding. Ship only reviewed deterministic content.
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
