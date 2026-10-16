# Task 016: Physical QA, performance, signing and store release

Status: Not started
Dependencies: task003–013 and task019 for intended v1 scope; task015 for existing-user updates.

## Context

A simulator build proves compilation, not usability, performance or store readiness. Signing/device evidence must be recorded for the exact artifact.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Offline end-to-end Android/iPhone QA and accessibility/small-screen/tablet checks.
- Measure startup/scrolling/memory/battery on representative devices; fix observed issues.
- Permanent Android signing, iOS Team/archive/TestFlight, versions, privacy/store assets and rollback evidence.

## Acceptance criteria

- [ ] Core journal flows persist/reopen/export/delete offline with no account, ads or purchase controls.
- [ ] Native reminders/photos/share/error paths pass physical-device grant/deny/cancel checks.
- [ ] Exact artifact has expected identities/version/capabilities and no unwanted SDK/permission.
- [ ] Measured performance results are recorded; no speed claim is based solely on compilation.
- [ ] Signed artifacts, devices, failures/retests, release owner and decision are in preflight.
- [ ] Store privacy/local-storage copy and backup/migration expectations match shipped behavior.

## Validation

- Full verify.py --ios plus exact signed-artifact installs and physical QA.
- Review data-preserving rollback and legacy compatibility before distribution.

## Boundary and handoff

Optional AI/Atlas can remain absent; release scope must explicitly state what ships.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
