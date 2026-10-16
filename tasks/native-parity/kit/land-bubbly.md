# NP-land-bubbly: Bubbly · a mark landing

Status: open · Shared native part
Parent: [task022](../../task022-exact-board-native-parity.md)

## Reference and authority

- [Open exact board card](http://localhost:4278/#only-land-bubbly) · ID: `land-bubbly` · section: `kit`.
- Board source: [barklog-kit.js](../../../design/board/js/screens/barklog-kit.js). Shared style/JS override layers are pinned in [the baseline](../board-baseline.json).
- Target is the owner's current web board, including Bricolage display + Inter reading. Do not simplify it or change the board to fit native.
- Disposition: shared-parts-only. Audit: inventory-and-contract-only.

Feel picker for the one lively moment: a care mark landing on the day line. Spring 0.38 / 0.62. Presses stay Firm (approved). Proposed default: Bubbly. Pick one.

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
- Coverage: Shared native parts need computed-style and interaction parity; board review UI is not production UI.

Read the live component's computed styles and interaction poses. Implement reusable native equivalents for product usages; keep Firm selected, not all experimental feel variants as competing defaults.

## Reproduction scenario

Inspect Bubbly · a mark landing in light/dark, pressed/selected and reduced-motion states.

## Required states and acceptance

Board inventory: Light, dark, larger text, reduced motion.

- [ ] Extract this part's live computed typography, spacing, radii, colours, icons and poses.
- [ ] Implement its reusable Compose equivalent and review its actual product usages.
- [ ] Keep experimental comparisons in Debug; Firm remains the selected interaction.
- [ ] Check labels, 48 dp targets, keyboard/focus, 130% text and both themes.

## Motion, accessibility and evidence

Use this entry's live board playback and the shared contract. Do not infer movement solely from a rest frame.

Follow [the exact-parity contract](../CONTRACT.md). Platform sheets remain native; fake status bars and device frames are not app UI. Responsive/reduced-motion adaptations must preserve the design and be recorded, not silently called pixel-identical.

- Dependencies: NP-G01, NP-G03.
- Paired evidence: pending (board + iOS + Android, same fixture/clock/content viewport).
- Visual/motion/accessibility review: pending; functional tests alone cannot close this task.
- Owner approval: pending. Do not mark matched from route existence or task021 tests.
