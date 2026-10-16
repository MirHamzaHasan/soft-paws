# Task 021: Complete approved board in the application

Status: Functional foundation implemented and simulator/emulator verified (2026-10-16).
Exact board visual/interaction parity is incomplete and reopened in task022;
physical/release QA remains task016.
Dependencies: task002–013, task019, task020.

The owner reported that native screens do not match the current web board.
[task022](task022-exact-board-native-parity.md) now accounts for every screen and
state individually. The checked delivery sections below record functional
coverage, not visual acceptance. Generic native equivalents, earlier typography
and incoming-only motion must not be called exact parity.

The owner approved moving the current board screens, their motion and working
logic into the shared Compose application. This supersedes the earlier board-only
scope. “Loginc” is interpreted as application logic; the journal stays account-free.

## Delivery sections

- [x] Shared board tokens, physical controls, navigation and animated vector dog.
- [x] First run, optional guided setup, Home, quick saves/Undo and detailed forms.
- [x] Timeline/detail/edit/delete, retained drafts, scoped errors and recovery.
- [x] Multiple dogs, editable profiles, settings and confirmed local deletion.
- [x] Medication/vaccination records and immutable administration history.
- [x] Calendar, recurrence, completion and explicit native reminder opt-in.
- [x] Factual weekly/monthly insights from local records.
- [x] Versioned offline Safety Center and native contact handoff.
- [x] Scoped CSV/PDF, native share/print and cancellation/retry.
- [x] Offline training catalog, enrollment, sessions and atomic Timeline entries.
- [x] Native photo selection, private copies, baselines and missing-file handling.
- [x] Decimal-safe expenses, receipts, filters and totals.
- [x] Memory Book from saved records/photos and factual share/export.
- [x] Migration, domain/storage tests, Android/iOS builds and family rest-frame evidence (not exact visual approval).

Board empty/loading/failure/permission/cancellation cards map to real application
states rather than fabricated example records. Preserve the existing database
filename and legacy files. Implement each section end to end before moving on.
No optional AI, accounts, hosted services, payments or release publishing is part
of this board. Physical-device and store sign-off remain task016.

## Verification — 2026-10-15 through 2026-10-16

- `python3 tools/verify.py --ios`: passed Android Debug/Release/R8/lint, 53 JVM
  tests, migration verification, 12 Python/tool tests and both iOS simulator hosts.
  Final log: `.verify-build/task021-native-final.log`.
- Android native instrumentation: three tests pass on an isolated API 35 arm64
  emulator, including v1→v3 migration/reopen and corrupt-file preservation.
  Log: `.verify-build/task021-android-native-tests.log`.
- 24 Android product entry surfaces rendered and asserted against the real QA
  journal. Screenshots/manifest: `.verify-build/task021-android-surfaces/`.
  Home dark/130% text: `.verify-build/task021-android-home-dark-130.png`.
- Six iOS XCTest journeys pass with zero failures/skips on the owned iPhone SE 3
  `BarkLog Application QA`: `.verify-build/task021-native-journeys.xcresult`.
  They cover retained notes, committed logging, medication, calendar, training,
  expenses, picker cancellation, supporting screens, dark/reduced motion and the
  actual PDF system share sheet. Attachments: `.verify-build/task021-ios-evidence/`.
- A separate fresh iPhone SE 3 completes the optional guided setup, preserves the
  profile and two shortcuts, proves the practice note is absent from the actual
  Timeline, and edits Home shortcuts in Settings. One pass, zero failures/skips:
  `.verify-build/task021-guided-final.xcresult`.
- Debug review now exposes all safe feature-family entry points in addition to
  tabs and the nine log forms. Replay never resets records. Home shortcuts include
  Medication/Care tasks and remain optional; choosing them enables no reminders.
- Single-line fields provide Done; tapping non-interactive space dismisses the
  keyboard. Multiline notes retain Return for line breaks.
- A separate QA host initially omitted Compose fonts when its Kotlin build phase
  was skipped. Standard rebuilding corrected the launch crash without a journal
  reset. Bundle checks now require the exact non-empty Compose font/license paths
  and can inspect alternate test hosts; two regression tests cover this mistake.
- Light/dark screenshots and family contact sheets were inspected. `git diff
  --check` passes. All saves used synthetic records on owned QA devices; existing
  user journals were not cleared or uninstalled.

Not established here: every transition's native intermediate frames, physical
VoiceOver/TalkBack, haptic/frame pacing, reminder delivery/reboot/long absence,
retained-photo selection on physical devices, oldest-iOS compatibility, signing
or store readiness. Native navigation currently uses one active editor with an
incoming-only transition. This is a task022 parity gap, not an approved substitute
for the board's shared-object/Back choreography. Preserve one active writer while
implementing read-only outgoing presentation as needed.
