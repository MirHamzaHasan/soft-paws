# Task 001: KMP foundation and repository reset

Status: Implemented; validation evidence in docs/verification.md
Dependencies: None.

## Context

The owner requested a fresh project from draco-kotlin-base. Existing RN implementation status must be reset, while product intent and recoverable source/configuration are preserved.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- Import the pinned KMP base, set BarkLog IDs/version, retain shared Compose host and lifecycle.
- Remove the RN runtime/config/tasks and the base's sample/cloud/ad/billing flows.
- Brand four honest tab shells, replace instructions and create an ordered backlog.

## Acceptance criteria

- [x] Root uses Gradle/shared/androidApp/iosApp and contains no RN/Expo/Node runtime.
- [x] Android and iOS IDs/name/version match the canonical spec.
- [x] Home/Timeline/Insights/Profile open with explicit preview states and no fake care saves.
- [x] Inter 400/500 and paper/ink tokens work in light/dark; no startup permission/service request.
- [x] Old dirty work/config remain recoverable outside active checkout; Git history is retained.
- [x] Current docs/tasks/skills/CI use KMP and distinguish implemented from planned.

## Validation

- Metadata/plugin/link checks; Android Debug/Release/lint/JVM tests; iOS Debug/Release host builds.
- Simulator/emulator launch and tab navigation; actual device/performance/store work remains task016.

## Boundary and handoff

Do not mark later features implemented from this task. The next task is local database.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
