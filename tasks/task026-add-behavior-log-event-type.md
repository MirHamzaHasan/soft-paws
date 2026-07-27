# Task 026: Add Behavior Log Event Type

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task025`

## Objective

Add behavior logging as a free, offline-first event type so caregivers can capture recurring behavior patterns quickly and BarkLog can later personalize training recommendations without blocking basic care behind premium.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind`, `Tailwind`, or a parallel styling system.

Follow the task025 mood event pattern for event typing, token extension, Home quick-log behavior, full detail route, Timeline rendering, Event Detail editing, exports, and weekly insight summaries.

## Scope

- add `behavior` to the Supabase `events.type` CHECK constraint through a new migration
- add behavior details typing and type guards in the shared event type layer
- add `behavior` to WatermelonDB event type support and sync serialization
- add behavior color tokens to Tamagui tokens and themes
- add Behavior to Home's secondary action area without reducing touch target quality
- implement a three-step quick-log bottom sheet: behavior, trigger, intensity
- create the full behavior detail route at `app/log/behavior.tsx`
- render behavior events in Timeline with behavior label and intensity
- support read and edit behavior details from Event Detail
- add behavior summaries to weekly insight context and export serialization
- add targeted unit and UI coverage for the new event type

## Out of Scope

- training enrollment or training sessions
- trainer replacement language or prescriptive behavior plans
- premium gating for behavior logging
- push notifications based on behavior logs
- direct AI provider calls from the client

## Data Contracts / Schema Changes

Behavior event details:

```ts
type BehaviorDetails = {
  behavior:
    | 'barking'
    | 'pulling'
    | 'jumping'
    | 'aggression'
    | 'anxiety'
    | 'destructive'
    | 'reactivity'
    | 'other';
  trigger?:
    | 'strangers'
    | 'dogs'
    | 'noises'
    | 'separation'
    | 'food'
    | 'guests'
    | 'car'
    | 'vet'
    | 'unknown'
    | 'other';
  intensity: 'mild' | 'moderate' | 'severe';
  duration_min?: number;
  context?: 'walk' | 'home' | 'car' | 'vet' | 'park' | 'guests' | 'alone';
};
```

Supabase `events.type` must include `behavior`.

Tamagui event token family:

```ts
behavior: {
  bg: '#FFF5EC';
  border: '#FFE0C2';
  text: '#7A4510';
}
```

Persist behavior values as stable lowercase enum strings. Display labels should be caregiver-friendly, for example "Barking", "Pulling", and "Mild".

## UX and Accessibility Requirements

- Home exposes Behavior beside Symptom, Weight, Grooming, and Mood.
- If five secondary actions are too wide, use the existing horizontal row or chip pattern rather than shrinking touch targets below 44x44pt.
- Quick-log bottom sheet uses three steps:
  - behavior type pills
  - trigger pills, including Unknown and Other
  - intensity selector
- The third step auto-saves after intensity selection and shows haptic feedback plus toast.
- Full detail screen includes when selector, behavior grid, trigger grid, intensity selector, duration numeric input, context chips, notes, optional photo, and Save event.
- Use existing form validation patterns for numeric duration and optional fields.
- Loading and saving states must use existing skeleton or disabled-action patterns.
- VoiceOver/TalkBack labels must include behavior, trigger, and intensity state.

## AI / Safety Requirements

- Behavior copy must stay observational. Do not diagnose behavior disorders or imply medical causes.
- AI summaries may say behavior frequency increased or decreased, and may mention common triggers from logs.
- Any severe or escalating language should remain non-diagnostic and encourage using existing safety or professional-help surfaces without claiming BarkLog replaces a trainer, behaviorist, or veterinarian.
- Claude remains reachable only through Supabase Edge Functions.

## Premium / Free Behavior

- Behavior logging is free.
- Behavior events remain visible in Timeline and exports for free users.
- Behavior data can feed premium training and AI personalization later, but the behavior event itself is not gated.

## Acceptance Criteria

- Behavior button is visible on Home.
- Quick-log bottom sheet completes behavior, trigger, and intensity in a single three-step flow.
- Quick-log saves locally first, then queues remote sync.
- Long press opens `app/log/behavior.tsx`.
- Full detail screen saves all required and optional behavior fields.
- Timeline shows behavior events with behavior label and intensity.
- Event Detail reads and edits behavior details.
- Weekly insight context includes behavior summaries, including counts and common triggers.
- CSV/PDF or report serializers do not drop behavior detail fields.
- No premium gate blocks behavior logging.

## Delivery Notes

- Added `behavior` to the Supabase event type contract and generated app-side Supabase types.
- Added the behavior JSON detail contract, stable option sets, labels, emoji helpers, and type guards.
- Added the behavior event color family to BarkLog theme tokens and Tamagui theme output.
- Added Home quick logging through a three-step bottom sheet: behavior, trigger, then intensity auto-save.
- Added the full behavior detail route at `app/log/behavior.tsx` and the dynamic log route fallback.
- Wired behavior into local event creation, Home recent events, Timeline/Event Detail presentation, Event Detail editing, exports, vet report timeline rows, and weekly insight context.
- Added behavior summary context to the weekly insight Edge Function prompt without introducing client-side AI calls.
- Behavior logging remains free and offline-first; no premium entitlement check was added.

## Validation

- `npm run check-types`
- `npx eslint 'app/log/[eventType].tsx' app/log/behavior.tsx src/types/events.ts src/types/supabase.ts src/theme/tokens.ts src/theme/tamaguiTheme.ts src/features/logging/screens/LogBehaviorDetailScreen.tsx src/features/home/hooks/useHomeLoggingLoop.ts src/features/home/screens/HomeScreen.tsx src/features/archive/utils/eventPresentation.ts src/features/archive/screens/EventDetailScreen.tsx src/features/insights/utils/insightSummaries.ts src/features/insights/api/insightsAiClient.test.ts src/features/export/utils/exportBuilders.ts src/features/export/utils/exportBuilders.test.ts src/db/events/createLocalEvent.test.ts src/features/insights/utils/insightSummaries.test.ts`
- `npm run test -- --runInBand --coverage=false src/db/events/createLocalEvent.test.ts src/features/insights/utils/insightSummaries.test.ts src/features/insights/api/insightsAiClient.test.ts src/features/export/utils/exportBuilders.test.ts`
- `npm run tamagui:generate`
- Supabase migration review confirmed `behavior` was added without removing existing allowed event types.
- Targeted local event tests confirm behavior details persist through the offline-first local event path.
- Native small/large phone visual QA was not run in this workspace; cover it during the next simulator/device pass.

## Commit Boundary

One commit only: complete behavior event vertical slice from schema and local typing through Home, full detail logging, Timeline, Event Detail, exports, weekly insight context, and tests.

This workspace currently has no Git metadata, so no local commit hash is available.
