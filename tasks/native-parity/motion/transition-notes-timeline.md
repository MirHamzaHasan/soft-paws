# NP-transition-notes-timeline: Practice note → Timeline

Status: open · Motion/continuity contract
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-transition-notes-timeline) · ID: `transition-notes-timeline` · section: `motion`.
- Board source: [feature-transitions.js](../../../design/board/js/screens/feature-transitions.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: interaction-contract-only. Audit: inventory-and-contract-only.

Write a note and follow its dated walk mark into the real Timeline preview. No practice entry is persisted.

## Native mapping and gap

- Current target: `Shared Compose kit / Debug review` (an existing route can host multiple distinct compositions/states).
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
- Coverage: Native incoming-only page animation does not establish the board transition choreography.

Match the real board transition's clock, start/end geometry, easing, shared object and outgoing layer. Keep one live writer; a read-only outgoing layer is allowed.

## Reproduction scenario

Inspect Practice note → Timeline in light/dark, pressed/selected and reduced-motion states.

## Required states and acceptance

Board inventory: Rest, 25/50/75%, final, reduced-motion final.

- [ ] Record the board's actual clock, shared object's start/end rect, easing/spring and z-order.
- [ ] Port forward/Back/interrupted behavior without duplicate active writers or remounted outgoing entrances.
- [ ] Capture rest plus 25/50/75% frames on both platforms and compare to board.
- [ ] Reduced motion lands on the final pose with equivalent focus and written meaning.

## Motion, accessibility and evidence

Use this entry's live board playback and the shared contract. Do not infer movement solely from a rest frame.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G03.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
