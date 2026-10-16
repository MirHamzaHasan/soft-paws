# Task 018: Optional Firebase/Atlas text fallback

Status: Deferred; disabled
Dependencies: task014; approved free-release server/context support.

## Context

Remote AI may be a configured fallback, never a prerequisite for local journaling. The base's persistent Firebase account provider was removed intentionally.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- User-triggered optional Firebase authentication with memory-only tokens and selected summarized context.
- BarkLog Atlas UUID, fresh ID token, request idempotency and matching context-policy evidence.
- Explicit Debug/QA configuration; Release stays disabled until server policy is approved.

## Acceptance criteria

- [ ] Auth never owns/syncs/gates dog or care records; sign-out/restart does not erase the journal.
- [ ] No ID/refresh/provider token is persisted or shipped in public configuration.
- [ ] Generated health content requires X-Atlas-Context-Checked true and matching feature evidence.
- [ ] Offline/invalid/missing/denied/configuration states fall back safely.
- [ ] No photos are sent to the text fallback; no direct client provider key/call.
- [ ] Release cannot enable fallback by changing client public values alone.

## Validation

- Auth refresh/token lifetime, headers/denial/idempotency/Release-gate tests with controlled server fixtures.
- Configured live Debug checks after policy approval, including network loss and sign-out.

## Boundary and handoff

Absent credentials/server policy does not block core local release work.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
