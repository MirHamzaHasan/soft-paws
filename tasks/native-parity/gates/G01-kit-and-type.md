# NP-G01: Current computed kit and exact typography

Status: in-progress. Implement before approving Home or downstream product screens.

The current board has Bricolage Grotesque 700/800 display/numerals, Inter 400/500
reading, marker accents, family folios, coloured stickers, expressive choice
controls and a dog ID card. Native's generated tokens and plain Inter 28/500
headings are an earlier foundation, not this full composition. The owner explicitly
selected the current web board on 2026-10-16, overriding the older Inter-only rule.

- [ ] Read live computed styles for all 15 Kit tasks, including every active JS/CSS
  override and both themes. Pin responsive variants, not only CSS declarations.
- [ ] Bundle the board font/license assets as Compose resources and verify exact
  runtime paths in Android and both iOS hosts. Extend packaging tests for new fonts.
- [ ] Create reusable folio, marker heading, dog ID, sticker option, rich notes,
  day-line, threaded Timeline, chart, attachment and status/handoff primitives.
- [ ] Preserve Firm defaults, 48 dp targets, scalable text, borders, native
  selection/keyboard and no decorative shadows/gradients.
- [ ] Compare each actual native part against the matching board part at rest and
  in pressed/selected/focused/reduced-motion states. Avoid redundant local styles.
- [ ] Update the generator/component registry only from actual implemented parts;
  token equality alone must never imply full screen parity.

Sources: `design/board/css/park-06.css`, loaded CSS/JS in
`../board-baseline.json`, bundled fonts, `AppTheme.kt`, `GeneratedDesignTokens.kt`,
`AppComponents.kt`, `CareComponents.kt`, `BarkField.kt`. Follow [CONTRACT](../CONTRACT.md).
