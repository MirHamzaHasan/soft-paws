# Task 025: Add Mood Check-In Event Type

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task020`, `task022`, `task024`

## Objective

Add mood as a free, offline-first logging event so caregivers can capture emotional and energy context quickly, and so BarkLog's weekly insight pipeline has richer non-diagnostic pattern data.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind`, `Tailwind`, or a parallel styling system.

Mood logging is part of the free care record. It must persist to WatermelonDB first, sync to Supabase through the existing sync engine, and remain available in Timeline, Event Detail, exports, and weekly insight context.

## Scope

- add `mood` to the Supabase event type constraint and generated database types
- add `mood` to the WatermelonDB event type contract and event detail typing
- add mood color tokens to the Tamagui token and theme layer
- add a Home quick-log mood action using the existing bottom-sheet and toast patterns
- add `app/log/mood.tsx` for full mood detail logging
- render mood events in Timeline and Event Detail with readable labels
- support editing mood and energy values from Event Detail
- include mood summaries in weekly insight context and report/export surfaces where event details are serialized
- add targeted coverage for mood typing, summaries, UI rendering, and export behavior

## Out of Scope

- premium gating for mood logging
- training program logic
- behavior logging
- new notification types
- direct client calls to Claude or any AI provider

## Data Contracts / Schema Changes

Mood event details:

```ts
type MoodDetails = {
  mood: 'happy' | 'calm' | 'anxious' | 'lethargic' | 'hyper' | 'clingy' | 'off';
  energy: 'low' | 'normal' | 'high';
};
```

Supabase `events.type` must include `mood`.

Tamagui event token family:

```ts
mood: {
  bg: '#F5F0FF';
  border: '#E0D4F5';
  text: '#4A3580';
}
```

Use the canonical mood labels and emoji mapping from the source-of-truth spec. Keep persisted values lowercase and stable.

## UX and Accessibility Requirements

- Home shows Mood in the secondary action row.
- Single tap opens a bottom sheet with seven mood pills and three energy pills.
- Selecting a mood and energy auto-saves the event with haptic feedback and a toast.
- Long press opens the full mood detail route.
- Full detail route includes when selector, mood grid, energy row, optional notes, and Save mood action.
- Touch targets remain at least 44x44pt.
- Mood color is not the only state cue; selected states must also use text, border, or icon treatment.
- Loading and saving states follow existing skeleton or disabled-button patterns.

## AI / Safety Requirements

- Mood data is context only. User-facing AI and insight copy must describe patterns, not diagnose mood, anxiety, depression, pain, or illness.
- Weekly insight prompt context may mention mood frequency, streaks, and deltas.
- Claude remains reachable only through Supabase Edge Functions.

## Premium / Free Behavior

- Mood logging is free.
- Mood events appear in Timeline and exports for free and premium users.
- Mood data may improve premium insight quality, but the act of logging mood is never gated.

## Acceptance Criteria

- Mood button is visible on Home in the secondary action area.
- Quick-log bottom sheet saves mood plus energy in the expected details shape.
- Long press opens `app/log/mood.tsx`.
- Full mood detail screen saves when, mood, energy, and notes.
- Mood events appear in Timeline with mood label and mood-specific presentation.
- Event Detail can read and edit mood and energy.
- Mood events sync through the existing WatermelonDB to Supabase path.
- Weekly insight context includes mood summaries.
- No premium gate blocks mood logging.

## Delivery Notes

- Added mood event typing in `src/types/events.ts`.
- Added Supabase migration for the `mood` event type.
- Updated generated Supabase event type support.
- Extended Tamagui event color tokens and generated Tamagui output.
- Added Home quick mood sheet and full mood log route.
- Updated Timeline, Event Detail, export, and insight-summary paths for mood details.
- Preserved offline-first logging and avoided client-side AI calls.

## Validation Notes

- Local validation completed after implementation.
- This workspace does not currently expose Git metadata, so this task records completion state without claiming a Git commit.

## Validation

- `npm run check-types`
- targeted ESLint for touched mood, timeline, event detail, theme, and insight files
- targeted Jest suites for event details, timeline rendering, weekly insight summaries, and export details
- `npm run tamagui:generate`

## Commit Boundary

Task 025 is a single feature commit covering the complete mood event vertical slice: schema, local model typing, Home quick-log, full log route, Timeline, Event Detail, exports, insight context, and tests.
