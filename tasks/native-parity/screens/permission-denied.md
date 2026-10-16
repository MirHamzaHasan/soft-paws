# NP-permission-denied: Permission · denied without dead end

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-permission-denied) · ID: `permission-denied` · section: `states`.
- Board source: [states.js](../../../design/board/js/screens/states.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: product-screen-or-contextual-state. Audit: source-mapping-only-no-paired-visual-pass.

The requested feature stays optional and the saved underlying work remains intact.

## Native mapping and gap

- Current target: `Feature.ReminderOptIn` (an existing route can host multiple distinct compositions/states).
- [BarkLogScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/BarkLogScreens.kt)
- Coverage: Shared native implementation is under validation; paired visual and motion acceptance remains open.

Match contextual denial composition; do not create a blanket permission gate for unrelated features.

## Reproduction scenario

Request an optional reminder explicitly, deny it, then continue with the saved task or open real system settings.

## Required states and acceptance

Board inventory: Startup, empty, read/save failure, offline, permission, stale data, reduced motion.

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

## Contextual implementation pass · 2026-10-16

Native composition/behavior and isolated Debug scenario work is underway. The real local repository remains authoritative. This status does not claim visual equality, full variant evidence or owner approval. See [contextual QA](../../../docs/design/evidence/task022/contextual-qa.md).
