# Task 034: Expanded Offline Log Types

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Logging`
- Depends on: `task033`

## Objective

Expand BarkLog's free offline care record beyond the core event set so the app can become the most complete dog-only daily log while keeping summaries and cloud sync premium.

## Implementation Baseline

Follow existing event-type patterns from mood and behavior: typed details, Tamagui event tokens, Home or Timeline entry points, full detail logging where needed, WatermelonDB-first persistence, Supabase support for Premium sync, Timeline rendering, Event Detail support, and export serialization.

## Scope

- add a first expanded-log batch as offline-first event types
- update Supabase event type constraints for Premium sync compatibility
- update WatermelonDB event typing and detail serialization
- add UI entry points that do not overwhelm Home's core 2x2 logging grid
- add full detail screens or reusable dynamic detail forms where appropriate
- add Timeline, Event Detail, filters, export, and report support
- add tests for each new detail contract and renderer

## Out of Scope

- generated summaries; task036 owns summary surfaces
- cloud sync monetization; task032 owns entitlement model
- AI interpretation
- native health imports

## Data Contracts / Schema Changes

Recommended first expanded event batch:

```ts
type WaterDetails = {
  amount_oz?: number;
  source?: 'bowl' | 'fountain' | 'outside' | 'other';
};

type RestDetails = {
  duration_min?: number;
  quality?: 'settled' | 'restless' | 'interrupted';
};

type VomitDetails = {
  appearance?: 'food' | 'bile' | 'foam' | 'water' | 'unknown';
  frequency?: 'once' | 'multiple';
};

type CoughSneezeDetails = {
  type: 'cough' | 'sneeze' | 'reverse_sneeze';
  frequency?: 'once' | 'occasional' | 'frequent';
};

type MobilityDetails = {
  observation: 'normal' | 'stiff' | 'limping' | 'slow_to_rise' | 'reluctant_stairs' | 'other';
  severity?: 'mild' | 'moderate' | 'severe';
};

type AppetiteDetails = {
  appetite: 'normal' | 'less_than_usual' | 'more_than_usual' | 'skipped' | 'refused';
};

type DentalDetails = {
  action: 'brushing' | 'chew' | 'odor_note' | 'gum_note' | 'tooth_note';
};

type ParasitePreventionDetails = {
  prevention_type: 'flea_tick' | 'heartworm' | 'dewormer' | 'other';
  product_name?: string;
};

type VetVisitDetails = {
  visit_type: 'wellness' | 'sick_visit' | 'follow_up' | 'vaccination' | 'dental' | 'other';
  clinic_name?: string;
};
```

Use careful labels for owner observations. Do not imply diagnosis.

## UX and Accessibility Requirements

- Home must remain focused on Poop, Pee, Meal, Walk, Medication, and high-value secondary actions.
- Expanded logs should live behind a "More" or "Care log" entry point rather than crowding the first viewport.
- Each event keeps a fast path and a detail path where possible.
- Detail forms use existing chips, segmented controls, number inputs, notes, and photo patterns.
- Skeletons and disabled save states are required for loaded forms.
- Touch targets remain at least 44x44pt.

## AI / Safety Requirements

- User-facing copy must be observational.
- Vomiting, cough, mobility, and appetite screens must include escalation copy for urgent or repeated issues without diagnosing.
- Emergency action remains reachable from concerning health log screens.
- AI summaries are not part of this task.

## Premium / Free Behavior

- All expanded raw logs are free offline.
- Premium unlocks cloud sync and generated summaries for these logs.
- Manual export includes expanded logs for free users.

## Acceptance Criteria

- Expanded event types save locally first.
- Expanded event types appear in local Timeline.
- Event Detail can read and edit expanded details.
- Free users can export expanded raw logs manually.
- Premium users can sync expanded logs after task032 gating.
- Health-sensitive logs avoid diagnostic language.
- Home remains uncluttered and one-tap core logging remains prominent.

## Validation

- `pnpm check-types`
- targeted lint for event types, log screens, Timeline, Event Detail, and export files
- detail-contract tests for each expanded event type
- local persistence tests for offline save
- Timeline rendering tests for labels and details
- small and large phone checks for the expanded log entry point

## Completion Notes

- Added the first expanded offline care-log batch: water, rest, vomit, cough/sneeze, mobility, appetite, dental, parasite prevention, and vet visit.
- Added typed detail contracts, option metadata, emoji/label helpers, and observational safety copy for health-adjacent logs.
- Added Tamagui event color tokens for each expanded log type.
- Added Supabase CHECK constraint migration support and typed Supabase event unions for Premium sync compatibility.
- Added the `/care-log` route and a reusable expanded care detail screen at `/log/[eventType]`.
- Added a Home entry point labeled `More care logs` without crowding the core logging grid.
- Added Timeline and Event Detail rendering/editing support for all expanded care log details.
- Added export and insight-summary event type support so raw logs remain available to free users and future paid summaries can build on the same data.
- Kept all expanded raw logs free/offline-first; no Premium gate was added to local logging or manual export.

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint app/care-log.tsx 'app/log/[eventType].tsx' src/types/expandedCareEvents.ts src/types/events.ts src/types/supabase.ts src/theme/tokens.ts src/features/logging/screens/CareLogScreen.tsx src/features/logging/screens/LogExpandedCareDetailScreen.tsx src/features/logging/utils/expandedCareDetails.ts src/features/logging/utils/expandedCareDetails.test.ts src/features/archive/utils/eventPresentation.ts src/features/archive/utils/eventPresentation.test.ts src/features/archive/screens/EventDetailScreen.tsx src/features/export/utils/exportBuilders.ts src/features/export/utils/exportBuilders.test.ts src/features/home/hooks/useHomeLoggingLoop.ts src/features/home/screens/HomeScreen.tsx src/features/insights/utils/insightSummaries.ts src/features/insights/api/insightsAiClient.test.ts`
- `corepack pnpm test -- --coverage=false src/features/logging/utils/expandedCareDetails.test.ts src/features/archive/utils/eventPresentation.test.ts src/features/export/utils/exportBuilders.test.ts`
- `corepack pnpm web -- --port 8090`
- Route smoke checks returned `200 OK` for `/`, `/timeline`, `/care-log`, `/log/water`, and `/log/vomit`.
- No Git commit was created because this workspace currently has no Git metadata.

## Commit Boundary

One commit only: expanded event batch, local logging UI, Timeline/Event Detail/export support, schema/type updates, and tests. Do not include generated summaries.
