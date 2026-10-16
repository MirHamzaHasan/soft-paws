# NP-onboarding-practice: Practice · a tap becomes a dated record

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-onboarding-practice) · ID: `onboarding-practice` · section: `onboarding`.
- Board source: [guided-onboarding.js](../../../design/board/js/screens/guided-onboarding.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: product-screen-or-contextual-state. Audit: source-mapping-only-no-paired-visual-pass.

Optional guided setup. Skip is always available. Values are reused in the real preview surfaces; no account or permission gate.

## Native mapping and gap

- Current target: `Onboarding.step7` (an existing route can host multiple distinct compositions/states).
- [OnboardingScreen.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/OnboardingScreen.kt)
- Coverage: Shared native implementation is under validation; paired visual and motion acceptance remains open.

Native practice uses a dog/button composition rather than the board's dated day-line landing; practice must remain unsaved.

## Reproduction scenario

Tap the practice action repeatedly, continue, then inspect the actual journal

## Required states and acceptance

Board inventory: Six-second opening, fast start, optional identity/photo/breed/age, shortcuts, practice log, notes, Timeline preview, local-storage boundary, ready, skip/back, coach.

- [ ] Reproduce this board composition, art, type, colours, spacing and every visible control/selected state.
- [ ] Complete the scenario above against actual local repositories/native adapters; not a static screenshot replica.
- [ ] Exercise the required states below, including Back, cancellation, keyboard and retry where applicable.
- [ ] Preserve committed-before-success, dog scope, revisions, draft/file safety and factual copy.
- [ ] Pair board/native rest frames in light/dark and required sizes/text scale; inspect entrances and outgoing/shared motion.
- [ ] Owner reviews this individual screen/state before status becomes matched.

## Motion, accessibility and evidence

Native entry hint: carry. Reuse the board's actual timing, not the old generic 420 ms incoming-only substitution. Firm press, earned dog reactions and final-state reduced motion follow the shared contract.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G02, NP-G03, NP-G04.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
