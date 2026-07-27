---
name: barklog-react-native-tamagui
description: BarkLog implementation guidance for Expo Router, Tamagui, Zustand, and the repo's manager-based architecture. Use when Codex needs to build or refactor BarkLog screens, routes, components, stores, logging flows, offline behavior, or UI code in this codebase.
---

# BarkLog React Native Tamagui

Read [../../../AGENTS.md](../../../AGENTS.md), [../../../docs/agentic/product-truth.md](../../../docs/agentic/product-truth.md), and [references/implementation-rules.md](references/implementation-rules.md).

## Implementation Rules

- Build with `Expo Router` and `Tamagui`.
- Do not add Tailwind, NativeWind, or parallel styling systems.
- Prefer small screen-level route files in `app/` and move reusable logic into `src/`.
- Use Zustand for client state and existing managers for cross-cutting services.
- Keep routine BarkLog actions tap-first. Put detail in sheets, secondary routes, or long-press flows.

## Screen Delivery Flow

1. Confirm the route and the primary action.
2. Implement the layout with Tamagui primitives before adding logic-heavy polish.
3. Add empty, loading, error, and offline states in the same slice.
4. Wire data or store changes only after the route contract is clear.
5. Validate with typecheck and targeted lint.

## Tamagui-Specific Notes

- Reuse simple `XStack`, `YStack`, `Button`, `Paragraph`, and text primitives before creating styled abstractions.
- Run `npm run tamagui:generate` if Tamagui config or generated CSS output changes.
- Keep accessibility visible in code: labels, touch target size, readable text hierarchy, and Dynamic Type tolerance.
