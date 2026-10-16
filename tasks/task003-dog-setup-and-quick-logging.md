# Task 003: First dog, Home quick logs and basic Timeline

Status: Implemented; simulator journeys pass; remaining platform gates below
Dependencies: task002.

## Context

The first value moment is onboarding a dog and recording Poop/Pee/Meal/Walk on Home, with an observable local Timeline.

Read [the canonical spec](../docs/source-of-truth/barklog-product-engineering.md),
[architecture](../docs/architecture.md), [delivery workflow](../docs/agentic/workflows.md)
and [validation](../docs/validation.md). This is a fresh KMP implementation;
legacy RN code may inform intent but does not prove completion.

## Scope

- O1 dog name setup; return to Home after committed dog save; restore selection on launch.
- H1 selected dog/date, real same-day totals, four event actions and recent-care rows.
- T1 basic date-grouped local events; wire all reads/writes through JournalRepository.
- Replace preview copy for the completed loop and reuse native haptics after commit.

## Acceptance criteria

- [ ] Full Android first-run UI journey in airplane mode; native offline storage and standalone startup are verified, iOS first-run UI is verified.
- [x] Empty dog state leads to setup; failed save leaves the saveable draft and retry action.
- [x] Quick log takes one tap and never waits for AI, analytics or network.
- [x] Saving state prevents overlapping submissions; failed save has no success feedback/haptic.
- [x] Committed events appear in Home/Timeline and survive iOS process restart; Android native DB reopen is tested.
- [x] Local-day grouping handles timezone changes/midnight/DST; events retain UTC timestamp and dog scope.
- [ ] Large text, screen reader labels/order, native Back and rotation/draft state are usable.

## Implementation evidence — 2026-10-14

O1 name-only onboarding, H1 selected dog/date/day total/four colored actions/recent
records and T1 date-grouped records are wired to the real SQLite repository.
Timeline renders the first 50 records with Show older records; query-level paging,
filters, details/edit/delete remain task004. P1 shows saved dog/start date/count
and clear local-only/loss notices. Insights and advanced profile tools stay honest
coming-later states; no fake data or account/permission gate is introduced.

Five controller/date tests passed: first dog and post-commit feedback, failed dog/
event writes, pending duplicate/cancellation handling, valid/stale selection and
midnight/timezone/DST grouping. The name field is saveable and explicitly labeled;
full Android rotation/Back/TalkBack and iOS VoiceOver/touch-scroll QA are still
required. iOS light/dark/accessibility-extra-large rendering was inspected. A fresh
iPhone SE 3 final Debug build verified the dog-name label, software keyboard,
visible submit button and keyboard Done saving Luna/opening Home.
See docs/verification.md for native first-loop and build evidence.

## Validation

Task021 (2026-10-16) adds passing iOS guided setup and persisted-shortcut journeys,
real quick/detailed-save tests, Android surface renders and native driver tests.
See [native board port](../docs/native-board-port.md) for current scope/evidence;
the historical 2026-10-14 coming-later descriptions above are superseded. Remaining
unchecked platform criteria are not established by simulator screenshots.

- Controller/repository tests for onboarding routing, quick-save failure, rapid taps and day grouping.
- Android and iOS offline first-run → dog → four logs → Timeline → restart; both host builds.

## Boundary and handoff

This is the first usable journal milestone. Detailed event fields remain task004.
All local behavior is free. Cover first-run/empty, loading/failure, offline,
cancellation/lifecycle, accessibility and native implications in the same slice.
No hosted telemetry is required; do not add a sender without an owner request.
Update this task and the feature status with exact commands/device evidence.
