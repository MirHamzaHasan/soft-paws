# Current board/native parity audit — 2026-10-16

Outcome: **native feature coverage is not exact board parity**. The owner selected
the existing localhost board, not a new visual direction. Task022 reopens visual/
interaction acceptance while retaining task021's valid functional/build evidence.

[All individual tasks](../../tasks/native-parity/README.md) ·
[Parent task](../../tasks/task022-exact-board-native-parity.md) ·
[Live board](http://localhost:4278/)

## Audited inventory

The actual live registry contains 166 entries: 148 screen/demo cards and 18 flows.
Of these, 123 are product screens/states/handoffs, 15 are Kit/component/feel
comparisons, seven are motion demos and three are historical references.
Every entry has its own task, source/native mapping and acceptance path. Zero
native entries are marked matched. No research card or system mockup is added
as a fake production route.

The runtime `setup` section is absent from configured rows despite registering
`dog-setup`/`seq-setup`. They are explicitly included and tracked in G04. Board
Picks/Notes were empty when read; no per-screen native approval was inferred.
The baseline pins 58 loaded source/font assets. It does not assert that external
research links or OS rendering are frozen.

## Confirmed gaps

| Area | Current native evidence | Required live-board design |
| --- | --- | --- |
| Typography | Inter-only native; general heading 28/500 | Bricolage 700/800 display/numbers plus Inter 400/500 reading; Home computed h1 44/800, line height 42.24 |
| Home | Earlier heading/day-line scale and layout | Marker heading, separated dog/count, 06–24 line, rich care tiles, exact feedback/Undo and earned dog reaction |
| Profile | Plain heading, neutral generic dog row | Green feature folio, illustrated dog ID card with bright band, coloured module marks |
| Timeline | Single Filters button and generic cards | Type chips, Dates & dog scope, day lines and threaded timed sticker rows |
| Insights | Summary card, per-type progress bars and day rows | Seven day-line overview and board chart/folio hierarchy with factual text equivalents |
| Guided setup | One combined breed/age page; generic choices/notes | Distinct breed and age screens, expressive shortcut choices, practice line/notes continuity and anchored Home coach |
| Log chooser/editors | Vertical rows and generic native fields | Nine coloured choice/editor compositions with informative observations, generous notes, context, attachment and all states |
| Reports | Current-dog date scope; inline export buttons | Working dog/content scope and dedicated format-selection composition; precise progress/failure/completion/handoff states |
| Training/Memory | Combined native detail/progress/caption/share | Separate board program progress, caption editor and pre-share compositions |
| Calendar outcomes | List navigation and inline reminder results | Week/agenda composition plus exact denied/failure/scheduled/overdue/completion variants |
| Navigation | One incoming rise with a single active editor | Actual shared-object/push/cover/Back choreography; keep one writer with read-only outgoing presentation |
| Review access | Safe family roots and forms | Every board ID/step/state reachable in explicit Debug review with matched owned fixtures |

These findings combine source inspection with direct rest-frame comparison of
Home, Profile, Timeline and Insights. Other screen tasks are source-mapped and
unverified visually; this is not a claim of 123 completed visual inspections.

## Evidence and limits

Current board rest captures (actually inspected):

- `.verify-build/parity-audit/board-home-1400.png`
- `.verify-build/parity-audit/board-profile-1400.png`
- `.verify-build/parity-audit/board-timeline-1400.png`
- `.verify-build/parity-audit/board-insights-1400.png`

Existing native family captures were inspected in
`.verify-build/task021-android-surfaces/{Home,Profile,Timeline,Insights}.png`.
They use a different owned synthetic dog/date/record fixture and device viewport.
They demonstrate composition mismatches, **not** a matched pixel-difference test.
Task021's XCTest/SQLite/JVM/build results remain useful functional evidence only.

No new Kotlin screens, SQLite data, schema, production dependencies or device
journals are changed by this audit/backlog pass. Full paired capture/mid-motion
review, per-screen owner approval and real-device assistive/haptic/permission/
delivery behavior remain open. G01–G04 establish those gates, then Home is first.

## Standing decision

The owner's 2026-10-16 answer to the font question was to use the web board exactly.
This supersedes the earlier Inter-only design constraint for this port. Preserve
the board; fix native, not the reference. Apply the Ungenerated review/native-port/
motion/visual-QA/accessibility checks in the task contract and record any necessary
native-platform adaptation explicitly before calling it accepted.

## Audit tooling verification

The fresh live-inventory/coverage check, JavaScript syntax check, metadata checks,
tooling regression tests and `git diff --check` pass. No platform builds were
re-run for this documentation/inventory-only pass. Native parity remains open.
