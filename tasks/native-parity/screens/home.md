# NP-home: Day line · tap a tile

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-home) · ID: `home` · section: `home`.
- Board source: [home.js](../../../design/board/js/screens/home.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: product-screen-or-contextual-state. Audit: rest-frame-and-source-gap-confirmed.

H1 v3. The day as a line from 06:00 to 24:00; each record sits at its time. Tap a care tile: its icon arcs onto the line at now, the count rolls, the newest record slides into Recent care, and Undo is offered. In the app the SQLite write commits before any of this moves.

## Native mapping and gap

- Current target: `Route.Home` (an existing route can host multiple distinct compositions/states).
- [HomeScreen.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/HomeScreen.kt)
- Coverage: Shared native implementation is under validation; paired visual and motion acceptance remains open.

Initial audit: Visually/source confirmed gap: native heading hierarchy and day line differ; board uses 44 px display, marker, separate count/dog columns, 06–24 line and expressive tiles.

Current pass: The current Home port includes the marker heading, separate count/dog, three-lane 06–24 day line, expressive tiles and floating tabs. Paired type/geometry, all variants, earned feedback and motion still require individual review.

## Reproduction scenario

Controlled 14 October 2026 fixture, Bruno, seven recorded moments; quick-save each type, Undo and return from a detailed save

## Required states and acceptance

Board inventory: Populated, empty, loading, committed quick log, Undo, detailed editor.

- [ ] Reproduce this board composition, art, type, colours, spacing and every visible control/selected state.
- [ ] Complete the scenario above against actual local repositories/native adapters; not a static screenshot replica.
- [ ] Exercise the required states below, including Back, cancellation, keyboard and retry where applicable.
- [ ] Preserve committed-before-success, dog scope, revisions, draft/file safety and factual copy.
- [ ] Pair board/native rest frames in light/dark and required sizes/text scale; inspect entrances and outgoing/shared motion.
- [ ] Owner reviews this individual screen/state before status becomes matched.

## Motion, accessibility and evidence

Native entry hint: cut. Reuse the board's actual timing, not the old generic 420 ms incoming-only substitution. Firm press, earned dog reactions and final-state reduced motion follow the shared contract.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G02, NP-G03, NP-G04.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
