# NP-seq-exports: Play this section

Status: open · Whole-flow review
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-seq-exports) · ID: `seq-exports` · section: `exports`.
- Board source: [exports.js](../../../design/board/js/screens/exports.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: end-to-end-review. Audit: inventory-and-contract-only.

Review sequence using example data only.

## Native mapping and gap

- Current target: `Sequence: vet-prep → report-preview → export-format → export-progress → export-complete → share-handoff` (an existing route can host multiple distinct compositions/states).
- [ReportFeatureScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/ReportFeatureScreens.kt)
- Coverage: End-to-end functional tests exist for some journeys; this board sequence has not passed matched visual/motion review.

Reproduce the ordered board continuity and Back behavior using one active controller/editor; current native incoming-only animation is a tracked gap.

## Reproduction scenario

Replay vet-prep → report-preview → export-format → export-progress → export-complete → share-handoff forward, Back, interrupted and at 1×/0.5×/0.25×.

## Required states and acceptance

Board inventory: Scope, preview, format, progress, cancel, retry, complete, share/print.

- [ ] Replay the exact ordered current-app branches; historical comparisons stay board-only.
- [ ] Forward, Back, cancel/retry, interruptions and rapid repeat input preserve state/scroll.
- [ ] Every product member has its own evidence; a flow screenshot does not close member tasks.
- [ ] Capture each boundary at rest and 25/50/75% at 1× and inspect 0.5×/0.25× playback.

## Motion, accessibility and evidence

Use this entry's live board playback and the shared contract. Do not infer movement solely from a rest frame.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-vet-prep, NP-report-preview, NP-export-format, NP-export-progress, NP-export-complete, NP-share-handoff.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
