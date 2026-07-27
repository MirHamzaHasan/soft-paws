# Task 037: Static Free Training Program Rotation

- Status: `completed`
- Priority: `P2`
- Phase: `Best-In-Market Training`
- Depends on: `task036`

## Objective

Add the free weekly training offer: one static training program per week that any user can read offline without progress tracking, cloud sync, or AI personalization.

## Implementation Baseline

Build on the training reference data from tasks027-task029. Keep free access read-only and static. Keep Premium tracking, enrollment, sessions, analytics, and personalization gated.

## Scope

- define the weekly free program selection strategy
- add UI labels for "Free this week"
- allow free users to open and read the selected static program
- block progress tracking, enrollment, session history, analytics, and AI personalization for free users
- cache the current free program for offline viewing after first load where feasible
- add Premium upgrade path from tracking actions
- add tests for free read-only access and Premium tracking gates

## Out of Scope

- creating new training content beyond existing seeded programs
- training session logging; task030 owns Premium sessions
- personalized training recommendations
- community training programs

## Program Rotation Rules

Recommended v1:

- one globally selected free program per calendar week
- selection is deterministic from program `sort_order` and ISO week number
- free users can read steps but cannot mark them complete
- local-only free mode does not cloud-save training progress

Future option:

- dog age, breed, or behavior-based local selection after privacy and content review.

## UX and Accessibility Requirements

- Training Hub shows a "Free this week" section.
- Program Detail clearly distinguishes reading from tracking.
- Tracking actions open Premium Gate.
- Copy should say: "Read this week's program free. Premium tracks progress and personalizes insights."
- Touch targets remain at least 44x44pt.
- Read-only state must be accessible to screen readers.

## AI / Safety Requirements

- Static content must remain positive-reinforcement only.
- Do not imply a program fixes behavior problems.
- Do not claim to replace a trainer or behaviorist.
- No AI calls are made for free static program reading.

## Premium / Free Behavior

- Free: one static weekly program, read-only.
- Premium: unlimited programs, enrollment, progress, session logging, analytics, sync, and AI insights.

## Acceptance Criteria

- Free users can read exactly one weekly static program.
- Free users cannot enroll, track completion, log sessions, or generate training insights.
- Premium users retain full training functionality.
- Free weekly program selection is deterministic and testable.
- Offline cache behavior is documented and tested if implemented.

## Validation

- `pnpm check-types`
- targeted lint for training hub/detail logic
- tests for weekly program selection
- tests for free read-only state and Premium tracking gates
- small and large phone checks for Training Hub labels and detail read-only state

## Completion Notes

- Added deterministic ISO-week free program selection from sorted training program reference data.
- Added a local cache for the current free weekly program so it can be reopened from this device after first load.
- Added Training Hub "Free this week" presentation and locked Premium previews for all other programs when the user is not Premium.
- Updated Program Detail so free users can read only the current weekly program in expanded read-only mode.
- Kept enrollment, progress tracking, session logging, training insights, sync, and personalization Premium-gated.
- Added haptics and redacted analytics events for free-program opens and training Premium gate moments.
- Added focused tests for rotation, read-access state, and cache freshness.

## Validation Results

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/features/training/utils/freeTrainingRotation.ts src/features/training/utils/freeTrainingRotation.test.ts src/features/training/utils/freeTrainingProgramCache.ts src/features/training/screens/TrainingHubScreen.tsx src/features/training/screens/TrainingProgramDetailScreen.tsx src/features/observability/services/analyticsService.ts`
- `corepack pnpm test -- --coverage=false src/features/training/utils/freeTrainingRotation.test.ts src/features/training/utils/trainingPresentation.test.ts src/features/premium/utils/premiumAccess.test.ts`
- `corepack pnpm web -- --port 8090` with route smoke checks for `/training`, `/training/loose-leash-walking`, and `/premium-gate?feature=training-programs`

## Commit Boundary

One commit only: free weekly training rotation, read-only UI state, Premium tracking gates, copy, and tests.
