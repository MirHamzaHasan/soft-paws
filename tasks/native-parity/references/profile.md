# NP-profile: Profile · dog and local journal

Status: open · Historical comparison
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-profile) · ID: `profile` · section: `profile`.
- Board source: [profile.js](../../../design/board/js/screens/profile.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: historical-reference-only. Audit: inventory-and-contract-only.

P1. Name, journal start, real-record count, storage limits. No fake settings, export or add-dog action.

## Native mapping and gap

- Current target: `Reference only` (an existing route can host multiple distinct compositions/states).
- [ProfileFeatureScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/ProfileFeatureScreens.kt)
- Coverage: Historical comparison only; not an additional production route.

Retain this historical comparison on the board; use home, profile-hub and insights-overview for current production parity. Do not ship the old unfinished Insights as a substitute for the implemented feature.

## Reproduction scenario

Inspect Profile · dog and local journal in light/dark, pressed/selected and reduced-motion states.

## Required states and acceptance

Board inventory: Current early-v1 availability.

- [ ] Retain the original board reference unchanged; do not add a retired production screen.
- [ ] Link the current replacement and explain the comparison in the ledger.
- [ ] Confirm this entry is excluded from product-screen completion totals.

## Motion, accessibility and evidence

Use this entry's live board playback and the shared contract. Do not infer movement solely from a rest frame.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G03.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
