# Task 003: Design System and Tamagui Foundation

- Status: `completed`
- Priority: `P0`
- Phase: `Foundation`
- Depends on: `task001`, `task002`

## Objective

Implement the BarkLog design token system and shared UI primitives in Tamagui.

## Implementation Baseline

Use `Tamagui` as the single styling and primitive system for BarkLog execution work. Do not introduce `NativeWind` or `Tailwind`.

## Scope

- configure BarkLog tokens, themes, and shared values in Tamagui
- load Inter 400 and 500
- define light and dark theme behavior
- build base primitives:
  - screen shell
  - card
  - button
  - input
  - toast
  - tab bar
- implement event color tokens and semantic states through the Tamagui theme layer

## Out of Scope

- feature-specific business logic
- premium gating logic

## Acceptance Criteria

- BarkLog tokens are available through the Tamagui styling system
- shared UI primitives follow the canonical design system
- Emergency SOS can opt out of dark mode
- reusable primitives support accessibility and reduced motion

## Validation

- key primitives render correctly on web and native preview
- token usage is centralized rather than hard-coded across screens

## Delivery Notes

- replaced the stock Tamagui config with BarkLog-specific tokens, fonts, themes, media, and shorthands in `tamagui.config.ts` and `src/theme/tamaguiTheme.ts`
- expanded `src/theme/tokens.ts` to cover BarkLog semantic colors, event color triplets, spacing, radii, and typography
- loaded only local `Inter 400` and `Inter 500` assets through the root app layout
- wired app-wide light and dark theme behavior through the Tamagui provider and navigation theme bridge
- forced the `Emergency SOS` route to stay in light mode from the app shell
- added shared Tamagui primitives for `button`, `card`, `input`, `screen shell`, `toast`, and `tab bar`
- refactored `PrimaryButton` and the shared Home bottom tab bar to use the new primitive layer
- added an internal preview route at `/design-system-preview` for primitive validation

## Validation Evidence

- `corepack pnpm tamagui:generate`
- `corepack pnpm check-types`
- targeted `eslint` on all touched theme, primitive, and root-layout files
- `corepack pnpm exec expo export --platform web`
