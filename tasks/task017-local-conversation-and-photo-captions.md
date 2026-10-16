# Task 017: Bounded local conversation and scene captions

Status: Local demo context/history delivered in task027; model inference not started
Dependencies: task014; task012 for captions.

## Context

Journal conversation and photo descriptions are optional additions after the simpler factual model path is stable.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Local bounded context/history and controlled conversation lifecycle.
- Optional selected-photo scene caption using a separately evaluated/downloaded model.
- Clear limitations, resource costs, cancellation and deterministic fallback.

## Acceptance criteria

- [ ] Conversation context is minimized and remains on-device; no hidden upload.
- [ ] Captions describe scenes, never diagnose or compare health changes.
- [ ] Missing-model/device/offline/error/cancel states are truthful and recoverable.
- [ ] No model preload on Home; removal releases sessions/files without deleting care records.
- [ ] Unsafe/urgent content is escalated and ungrounded output is rejected.
- [ ] Actual image/conversation memory/latency is measured on both physical platforms.

## Validation

- Grounding/output-limit/safety/cancel/missing-model tests.
- Physical Android/iPhone conversation and user-photo caption/removal/profiling.

## Boundary and handoff

Atlas is text fallback only when explicitly implemented in task018.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.

## Later demo delivery (task027)

The owner requested local demo login and replies before real credentials. Task027
implements dog-scoped SQLite conversations, consent, immutable source snapshots,
streaming cancellation/regeneration and plain-text memory captions from supplied
details. These are demo replies, not downloaded model inference or image scene
recognition. The model/device acceptance and profiling gates above remain open.
