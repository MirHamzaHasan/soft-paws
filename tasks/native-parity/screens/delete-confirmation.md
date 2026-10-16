# NP-delete-confirmation: Delete · safer action first

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-delete-confirmation) · ID: `delete-confirmation` · section: `records`.
- Board source: [records.js](../../../design/board/js/screens/records.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: product-screen-or-contextual-state. Audit: native-port-in-progress-no-paired-acceptance.

A preview dialog only. Never deletes the device journal.

## Native mapping and gap

- Current target: `JournalPage.Detail` (an existing route can host multiple distinct compositions/states).
- [EventScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/EventScreens.kt)
- Coverage: Shared native implementation is under validation; paired visual and motion acceptance remains open.

Match the scoped destructive composition and Keep record action; no deletion from a visual replay.

## Reproduction scenario

Delete the matched record; cancel first, then confirm; induce a stale revision before a second attempt

## Required states and acceptance

Board inventory: Detail, edit, delete confirm, retry, stale revision.

- [ ] Reproduce this board composition, art, type, colours, spacing and every visible control/selected state.
- [ ] Complete the scenario above against actual local repositories/native adapters; not a static screenshot replica.
- [ ] Exercise the required states below, including Back, cancellation, keyboard and retry where applicable.
- [ ] Preserve committed-before-success, dog scope, revisions, draft/file safety and factual copy.
- [ ] Pair board/native rest frames in light/dark and required sizes/text scale; inspect entrances and outgoing/shared motion.
- [ ] Owner reviews this individual screen/state before status becomes matched.

## Motion, accessibility and evidence

Native entry hint: Inspect live entrance / contextual-state transition. Reuse the board's actual timing, not the old generic 420 ms incoming-only substitution. Firm press, earned dog reactions and final-state reduced motion follow the shared contract.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G02, NP-G03, NP-G04.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.

## Implementation pass · 2026-10-16

Shared Compose port changes are underway in this screen’s mapped family.
The real repository and native adapter behavior remain authoritative. This is
not a visual acceptance: contextual replay, paired current-source captures,
required accessibility/motion variants and individual owner review remain open.
