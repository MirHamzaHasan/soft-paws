# Task 014: Optional local AI model lifecycle and factual journal answers

Status: Not started
Dependencies: task008; core journal stable.

## Context

AI is a user-selected enhancement. The framework reset does not bring the old ONNX integration or model-download behavior along.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Evaluate KMP-compatible native inference adapters/runtime/model licenses and measured device limits.
- Explicit download/checksum/version/storage estimate, cancellation/remove/redownload, separate model files.
- I4 bounded factual routing over real local summaries; deterministic fallback without a model.

## Acceptance criteria

- [ ] No model automatically downloads or loads on Home/startup.
- [ ] Journal, safety and exports work when model absent/offline/unsupported.
- [ ] Model sessions/inference are off UI and release memory on cancel/remove/background as designed.
- [ ] Answers cite actual observations and never invent logs or diagnose/prescribe.
- [ ] Emergency/triage/toxicity/dose requests bypass inference to bounded safety escalation.
- [ ] Record physical memory/startup/battery/storage evidence before calling device support ready.

## Validation

- Download/checksum/failure/cancellation/orchestration and safety-routing tests.
- Physical Android/iPhone supported-model factual query offline, removal/redownload and profiling.

## Boundary and handoff

Remote fallback and local conversation/captions are separate tasks, not implicit scope.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
