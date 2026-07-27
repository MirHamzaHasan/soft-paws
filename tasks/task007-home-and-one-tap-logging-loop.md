# Task 007: Home and One-Tap Logging Loop

- Status: `completed`
- Priority: `P0`
- Phase: `Core Care Loop`
- Depends on: `task003`, `task005`, `task006`

## Objective

Ship the BarkLog Home screen and instant event logging loop.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for Home and one-tap logging work. Do not introduce a parallel styling system.

## Scope

- Home header and dog context
- primary 2x2 event grid
- Medication full-width action
- secondary actions for symptom, weight, and grooming
- instant event creation for one-tap actions
- haptics and toast confirmation
- daily summary card
- anomaly banner placeholder logic

## Out of Scope

- advanced event-detail editing
- full insights logic

## Acceptance Criteria

- the primary Home actions are obvious within one screenful
- single tap logs supported events immediately
- logs persist locally first
- long-press entry points are defined for detail flows

## Validation

- event tap round-trip feels instant
- saved events appear in local state without waiting for network

## Completed Work

- rebuilt Home around real BarkLog quick-log behavior with dynamic dog context, primary event tiles, medication action, and secondary symptom/weight/grooming actions
- wired instant local-first event creation through WatermelonDB for supported quick logs with haptic feedback and animated toast confirmation
- added local Home snapshot loading for same-day counts, recent activity, pending-sync copy, and the poop-gap anomaly placeholder
- updated the Watermelon adapter bootstrap to use platform-specific web/native files so Expo web bundles the Loki adapter without pulling in SQLite

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint babel.config.js src/db/database.ts src/db/createAdapter.web.ts src/db/createAdapter.native.ts src/features/home/screens/HomeScreen.tsx src/features/home/hooks/useHomeLoggingLoop.ts src/features/home/components/HomeQuickActionTile.tsx src/features/home/components/HomeShell.tsx src/features/home/components/HomeSecondaryActionButton.tsx src/features/home/components/HomeToastOverlay.tsx src/features/states/screens/DesignSystemPreviewScreen.tsx src/db/models/EventModel.ts src/db/models/DogModel.ts src/db/models/UserModel.ts src/db/models/MedicationModel.ts src/db/models/InsightModel.ts src/db/models/VaccinationModel.ts src/db/models/ExpenseModel.ts`
- `corepack pnpm exec expo export --platform web`
