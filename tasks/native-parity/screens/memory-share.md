# NP-memory-share: Memory Book · native share handoff

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-memory-share) · ID: `memory-share` · section: `memory`.
- Board source: [memory.js](../../../design/board/js/screens/memory.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: native-platform-handoff. Audit: native-port-in-progress-no-paired-acceptance.

A local monthly collection is prepared, then the operating system owns sharing.

## Native mapping and gap

- Current target: `Feature.MemoryShare` (an existing route can host multiple distinct compositions/states).
- [MemoryFeatureScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/MemoryFeatureScreens.kt)
- Coverage: Source-backed composition/interaction gap; native parity is incomplete.

Dedicated month-sharing composition now uses the real local PDF and native handoff. Pair its geometry, contents and cancellation with the board.

## Reproduction scenario

Select month/highlights, review local PDF handoff, explicitly open and cancel native sheet

## Required states and acceptance

Board inventory: Month, detail, sparse, missing photo, export/share.

- [ ] Reproduce this board composition, art, type, colours, spacing and every visible control/selected state.
- [ ] Complete the scenario above against actual local repositories/native adapters; not a static screenshot replica.
- [ ] Exercise the required states below, including Back, cancellation, keyboard and retry where applicable.
- [ ] Preserve committed-before-success, dog scope, revisions, draft/file safety and factual copy.
- [ ] Pair board/native rest frames in light/dark and required sizes/text scale; inspect entrances and outgoing/shared motion.
- [ ] Owner reviews this individual screen/state before status becomes matched.

## Motion, accessibility and evidence

Native entry hint: push. Reuse the board's actual timing, not the old generic 420 ms incoming-only substitution. Firm press, earned dog reactions and final-state reduced motion follow the shared contract.

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
