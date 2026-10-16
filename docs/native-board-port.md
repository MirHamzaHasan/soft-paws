# Approved board → shared Compose application

**Parity correction — 2026-10-16:** this page maps implemented functionality,
not exact visual acceptance. The owner rejected simplified native equivalents
and selected the current live board exactly. Typography, several compositions,
separate guided/state screens and outgoing/shared transitions still differ.
See [task022](../tasks/task022-exact-board-native-parity.md), the
[individual backlog](../tasks/native-parity/README.md) and
[audit](design/native-parity-audit.md). No current native entry is marked matched.

Owner request: 2026-10-15. Delivery: task021. The previous board-only boundary is
superseded for the approved product screens. Production UI is shared Compose;
iOS SwiftUI hosts it. The board HTML/JS is not embedded in the application.

**Later Home revision — task023:** the owner liked the named/time care-strip
preview and requested more motion for Earlier/Latest. Home now uses
`HomeCareStrip`; the original day line remains in its other approved contexts.
Shared tab/Back and touch motion were refined in the same pass. See
[task023](../tasks/task023-readable-care-and-native-motion.md). The original board
and task022 approval ledger remain pinned; this is not all-screen parity approval.

## Latest companion chapter — 2026-10-16, task027

The owner subsequently authorized task024–026 in the real KMP project, with demo
login/replies for now and no simulator launch. All 54 IDs have typed Compose
destinations: detailed setup/review/edit, account and demo plan states, scoped AI
context, streaming/stop/regenerate, sources and local thread history. The journal
remains usable without an account. Purchases are disabled and prices undecided.
The larger Home mascot, six shuffled idle actions and care strip inside its card
are native. Camera, selected photos and notification access use real adapters.
See [task027](../tasks/task027-native-companion-board-and-main.md) and its
[screen ledger](design/evidence/task027/screens.md). Compilation and local tests
do not establish native visual parity; task022's matched count remains zero.

## Route and data mapping

| Board family | Native routes and behavior |
| --- | --- |
| Opening / setup | Optional short intro, fast name-only start, guided optional profile, shortcuts and clearly marked unsaved practice |
| Home | Selected dog, SQLite daily totals, named/timed record strip with Earlier/Latest and actual detail, four committed quick saves, Undo, recent care and animated vector dog |
| Detailed logging | Nine typed forms, observation context/private attachment, retained SQLite drafts, revision-safe edits and confirmed deletion |
| Timeline | Dog/type/date scope, SQL-bounded lazy pages and actual detail routes |
| Profiles / settings | Add/edit/switch dogs, optional profile photo/contacts, editable dog-scoped Home shortcuts, appearance/accessibility, scoped confirmed journal deletion |
| Health | Medication plans, immutable given-dose snapshots, archive/history, vaccination records |
| Calendar | Local tasks, date/time/zone, daily/weekly/monthly recurrence, atomic completion plus Timeline entry, explicit reminder opt-in |
| Insights | Factual weekly counts plus 7/30/90-day typed walk minutes and dated weight observations; text equivalents, no estimates from notes |
| Safety | Version 2026-10-15 bundled reference, source links, emergency contacts, first aid and bounded toxicity lookup |
| Vet preparation | Actual dog/date snapshot, CSV/PDF, native share and print with cancellation/failure feedback |
| Training | Bundled original reward-based catalog, enrollment, monotonic timed/paused sessions, responses/rating/notes, atomic session and Timeline save |
| Photos | System selection, private resized copies, category/baseline metadata and missing-file recovery |
| Expenses | Description, exact minor-unit amounts, currency-specific precision, categories/months, private image/PDF receipt and separate-currency totals |
| Memory Book | Saved records/photos, selected source collections, editable factual captions and PDF with retained photos |

Board variants for loading, empty, error, denied, cancelled and success are actual
runtime states of these routes. Kit, Research, comparison cards and fabricated
board example data are design tools, not production routes. Online AI and remote
features remain outside this delivery; the later task027 uses labelled local demos.

## Motion and accessibility

`tools/design_tokens.py` generates the merged Park kit, light/dark palette,
Lucide paths, motion constants and dog vector parts. Native now bundles Bricolage 700/800 display/numbers and Inter 400/500 reading.
Task022 is correcting computed sizes, CSS-equivalent line boxes and per-screen geometry;
font presence alone does not establish visual parity.
Firm controls use the approved press/release spring. Primary buttons
have a low-opacity release bubble from the touch point; supporting text has a
3 pt/260 ms entrance. The tab pill glides and stretches with its velocity; the bar
stays fixed during tab changes. Glyphs respond separately from their control's
position; round stickers keep volume under a finger and new selection checks land
once. Reading rows highlight without scaling their text.

The dog has separate body/head/ears/tail motion, an entry and a short celebration
after a committed log. Failed saves do not celebrate. OS or app Reduce Motion
settles to final poses. Task022 adds one active controller/editor with frozen outgoing pixel layers,
board push/cover timings, carried dog/care marks and Back without replaying entrances.
Task023 adds directional overlapping tab pages and Back's departing top page with
the prior page beneath. Incoming opacity includes its ground, so it cannot conceal
the outgoing page with a blank opaque layer. Home's 460 ms care-strip glide starts
from the current scroll position, cancels on another move, and restores its place
after viewing a record. Loading reserves the completed strip's height.
This implementation is under native frame QA; per-entry interaction parity is not yet accepted. Layouts reflow and scroll with native text scaling and safe
areas rather than using the board's fixed phone canvas. Real-device frame pacing,
haptics and VoiceOver/TalkBack remain task016 checks.

## Persistence and recovery

SQLDelight schema v4 keeps `barklog_kmp_v1.db`. The checked-in v1 snapshot and
numbered v1→v2→v3→v4 migrations preserve existing record identity, times and notes.
New typed care items, profile/context fields, drafts and a device-cleanup queue
are local SQLite data. UI preferences remain native preferences.

Stable request IDs make create retries idempotent. Expected revisions protect
edits/deletes. Session, task completion and administration writes commit together
with their Timeline records; deleting the matching Timeline activity also removes
its progress record. Medication history keeps the name/amount snapshot even after
a plan is edited or archived. Draft saves are serialized with consumption so a
late autosave cannot resurrect a saved draft. Draft photo references protect
files; post-commit cleanup checks all current references and retries on foreground.
Unknown legacy files are outside destructive actions.

Android's picker uses selected document access, private copies and EXIF-aware
resizing. iOS uses PHPicker and ImageIO thumbnails. No broad library permission is requested. Task027 adds an explicit per-use
camera action: Android delegates capture to the camera app; iOS asks for camera
access only after that action. PDF and share files are temporary native documents; no
network or account is needed. Sharing requires choosing a destination in the
system sheet.

## Reminder behavior

Only explicit reminder setup requests notification permission. Denial preserves
the task and offers retry/off. Android uses inexact alarms, task-unique intents,
boot/time-change reconciliation and scoped notification taps. iOS queues up to
eight upcoming one-shot occurrences per task within the available pending-request
budget. Opening the app refreshes future occurrences; the UI explains this limit.
Early completion cancels/rebuilds the remaining occurrences. Monthly recurrence
uses the same date and skips months without that date. Stored timezone/DST rules
are used rather than fixed 24-hour offsets. Platform delivery, reboot and long
absence behavior still need physical-device verification.

## Validation and release boundary

- 53 JVM tests pass, including ten storage/domain cases for rollback, retry,
  same-dog scope, drafts/cleanup, immutable history, currency precision, recurrence
  and CSV escaping/formula protection.
- Twelve Python metadata/tool tests and SQLDelight migration verification pass.
- `python3 tools/verify.py --ios` passed Android Debug/Release/R8/lint and iOS
  Debug/Release simulator host builds; final log is
  `.verify-build/task021-native-final.log` (2026-10-15/16).
- Native XCTest journeys use a separate owned `BarkLog Application QA` simulator
  and only synthetic QA records. Existing user journals/devices are untouched.
  Six journeys pass in `.verify-build/task021-native-journeys.xcresult`.
- A seventh, fresh-simulator guided setup journey passes separately in
  `.verify-build/task021-guided-final.xcresult`: optional identity, practice-only
  notes excluded from the real Timeline, profile reuse, persisted shortcuts and
  changing those shortcuts later. Neither suite clears existing journals.
- Android has three passing native SQLite instrumentation tests and 24 asserted
  product-family renders. Light/dark screenshots, 130% Android Home and iPhone SE
  rest frames were inspected; these use different fixtures from the board and do
  not establish exact per-screen parity or exhaustive native motion-frame QA.

The QA font crash came from skipping the Kotlin build phase for a separate
DerivedData host, which also skipped copying Compose resources. Rebuilding normally
corrected it. `check_ios_bundle.py --bundle <app>` now validates the exact runtime
resource paths for alternate test hosts as well as the standard Debug/Release host.
See task021 for logs, screenshots and the packaging regression tests.

Unsigned simulator/Android builds do not establish physical permission/delivery,
assistive behavior, performance, signing or store readiness. The iOS link still
reports the dependency ICU object minimum simulator version 17.2 versus host
minimum 15; the oldest supported physical OS needs explicit compatibility QA.
Legacy React Native journal import is task015. Release/signing is task016.
