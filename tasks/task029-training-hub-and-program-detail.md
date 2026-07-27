# Task 029: Build Training Hub and Program Detail Screens

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task028`

## Objective

Build the premium Training Hub and Program Detail screens so caregivers can browse programs, understand progression, enroll with premium access, and continue the current step without adding a fifth tab.

## Delivery Notes

- Added `app/training/index.tsx` and `app/training/[programSlug].tsx`.
- Added a Profile Hub entry point labeled `Training Programs`, avoiding a fifth tab.
- Added Training Hub with active programs, available programs grouped by category, loading skeletons, empty states, error retry, and Premium value messaging.
- Added Program Detail with metadata, progress text/bar, ordered steps, highlighted current step, expanded current instruction, tip, completion state, and local-first step progression.
- Added `training-programs` to the centralized Premium feature catalog and Premium Gate routing.
- Added reusable training presentation helpers and tests for grouping, enrollment matching, progress, active program pairs, and advancement/completion planning.
- Extended local training repository coverage to verify enrollment updates persist locally before sync metadata is recorded.
- Session logging was left for task030; task030 has since enabled the logger route.
- This workspace currently has no Git metadata, so no local commit hash is available.

## Implementation Baseline

Use Expo Router, Tamagui primitives, existing premium gate patterns, existing RevenueCat entitlement helpers, and TanStack Query for Supabase reference data. User-generated enrollment changes must persist to WatermelonDB first and sync later.

## Scope

- create `app/training/index.tsx`
- create `app/training/[programSlug].tsx`
- add a Training entry point from the Profile Hub or Home without adding a fifth tab
- fetch available programs and steps from Supabase reference tables
- read active enrollments from WatermelonDB and sync-aware local state
- show active programs with progress and current step
- show available programs grouped by category
- gate Start program behind the existing Premium Gate bottom sheet for non-premium users
- create or resume enrollment for premium users
- advance current step locally first when "Mark complete & next" is used
- show completion state after the final step
- add loading, empty, error, and offline states
- add route and interaction tests for browse, gate, enroll, and advance behavior

## Out of Scope

- training session logger; task030 owns session capture
- training AI insight card; task031 owns AI personalization
- editing seeded program content from the app
- replacing the existing tab structure

## Data Contracts / Schema Changes

No new Supabase schema changes are expected.

Program detail route parameter:

```ts
type TrainingProgramRouteParams = {
  programSlug: string;
};
```

Enrollment mutations must use the task027 enrollment model and maintain:

- one active enrollment per dog and program
- local `current_step` progression
- `completed_at` when the final step is completed
- `status` changes using the allowed enum values

## UX and Accessibility Requirements

- Training Hub sections:
  - Active programs
  - Available programs
- Program cards include icon, name, difficulty, estimated days, and short description.
- Program grouping uses readable category labels, not raw enum names.
- Program Detail includes header, category, difficulty, estimated days, progress, step list, expanded current step, tip, estimated duration, Log session, and Mark complete & next.
- Free users can browse program cards and details, but Start program opens Premium Gate.
- Premium users can start, resume, and advance programs.
- Loading states use skeletons for program cards and detail content.
- Empty state should be encouraging but not ornamental or decorative.
- Touch targets remain at least 44x44pt.
- Progress bars must also expose textual progress for accessibility.

## AI / Safety Requirements

- Training copy shown from seeded data must preserve positive reinforcement language.
- Program Detail must not claim to replace a trainer or behaviorist.
- For behavior-modification programs, show supportive, non-diagnostic framing.

## Premium / Free Behavior

- Free users can browse available programs and program details.
- Free users cannot start programs or log training sessions.
- Premium users can enroll, advance steps, and access session logging.
- Gating uses the existing Premium Gate bottom sheet, not a new paywall implementation.

## Acceptance Criteria

- Training Hub shows active enrollments and available programs.
- Program cards are grouped by category and display complete metadata.
- Program Detail opens by slug and displays ordered steps.
- Current step is highlighted and expanded.
- Start program is gated for non-premium users.
- Premium enrollment writes to WatermelonDB before sync.
- Mark complete & next advances `current_step` locally first.
- Completion state appears after the final step.
- Entry point from Home or Profile works without adding a fifth tab.
- Loading, empty, error, and offline states are present.

## Validation

- Passed: `npm run check-types`
- Passed: targeted lint for training routes, hook, screens, helpers, premium catalog/access, local training repository test, and Profile Hub touchpoint
- Passed: `npm run test -- --runInBand --coverage=false src/features/training/utils/trainingPresentation.test.ts src/db/training/localTrainingRepository.test.ts src/features/premium/utils/premiumAccess.test.ts src/api/training.test.ts`
- Covered: grouped program presentation, active enrollment matching, progress labels, completion planning, local-first enrollment update, Premium feature catalog key, and training API reference data grouping.
- Not run: native small/large phone manual preview in this environment.

## Commit Boundary

Completed within one task boundary: training navigation entry, hub screen, program detail screen, enrollment start/progression behavior, premium gate integration, and tests. Session logger and AI personalization remain owned by task030 and task031.
