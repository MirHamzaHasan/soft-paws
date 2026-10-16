# NP-seq-profile: Play this section

Status: open · Whole-flow review
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-seq-profile) · ID: `seq-profile` · section: `profile`.
- Board source: [profile.js](../../../design/board/js/screens/profile.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: comparison-flow-with-current-app-branches. Audit: inventory-and-contract-only.

Review sequence using example data only.

## Native mapping and gap

- Current target: `Sequence: profile → insights` (an existing route can host multiple distinct compositions/states).
- [AppTheme.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/theme/AppTheme.kt)
- [GeneratedDesignTokens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/theme/GeneratedDesignTokens.kt)
- [BarkMotion.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/theme/BarkMotion.kt)
- [AppComponents.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/components/AppComponents.kt)
- [CareComponents.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/components/CareComponents.kt)
- [BarkField.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/components/BarkField.kt)
- [AnimatedDog.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/components/AnimatedDog.kt)
- [BarkLogScreens.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/BarkLogScreens.kt)
- [DesignReviewBar.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/screens/DesignReviewBar.kt)
- [AppState.kt](../../../shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/navigation/AppState.kt)
- Coverage: End-to-end functional tests exist for some journeys; this board sequence has not passed matched visual/motion review.

This sequence includes historical comparison screens. Retain the comparison; verify only current destinations in the app, never add an old UI as a fake route.

## Reproduction scenario

Replay profile → insights forward, Back, interrupted and at 1×/0.5×/0.25×.

## Required states and acceptance

Board inventory: Current early-v1 availability.

- [ ] Replay the exact ordered current-app branches; historical comparisons stay board-only.
- [ ] Forward, Back, cancel/retry, interruptions and rapid repeat input preserve state/scroll.
- [ ] Every product member has its own evidence; a flow screenshot does not close member tasks.
- [ ] Capture each boundary at rest and 25/50/75% at 1× and inspect 0.5×/0.25× playback.

## Motion, accessibility and evidence

Use this entry's live board playback and the shared contract. Do not infer movement solely from a rest frame.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-profile, NP-insights.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
