# NP-home-coach: Coach mark · quick care

Status: in-progress · Product screen/state
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-home-coach) · ID: `home-coach` · section: `onboarding`.
- Board source: [onboarding.js](../../../design/board/js/screens/onboarding.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: product-screen-or-contextual-state. Audit: native-port-in-progress-no-paired-acceptance.

One skippable coach mark on the real Home screen. The dog and their name arrive from setup; the tip points at the first tile and then gets out of the way.

## Native mapping and gap

- Current target: `Route.Home` (an existing route can host multiple distinct compositions/states).
- [HomeScreen.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/HomeScreen.kt)
- Coverage: Source-backed composition/interaction gap; native parity is incomplete.

Native inline guidance card is not the board coach mark anchored to the real quick-care target.

## Reproduction scenario

First entry after setup with the one-time quick-care coach mark; skip and relaunch

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

## Implementation pass · 2026-10-16

Shared Compose port changes are underway in this screen’s mapped family.
The real repository and native adapter behavior remain authoritative. This is
not a visual acceptance: contextual replay, paired current-source captures,
required accessibility/motion variants and individual owner review remain open.
