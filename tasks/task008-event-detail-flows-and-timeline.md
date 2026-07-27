# Task 008: Event Detail Flows and Timeline

- Status: `completed`
- Priority: `P0`
- Phase: `Core Care Loop`
- Depends on: `task007`

## Objective

Implement detailed event logging, Timeline, and event-detail review.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for detail flows and timeline work. Do not introduce a parallel styling system.

## Scope

- `log/[eventType]` flows for poop, meal, walk, and medication
- `log/symptom`
- `event/[id]`
- Timeline with date navigation and delete flow
- photo attachment handling for supported events

## Out of Scope

- AI narratives
- premium gating

## Acceptance Criteria

- all core event-detail fields exist per canonical spec
- Timeline is a trustworthy review surface
- event detail supports read-only and edit mode
- symptom logging follows BarkLog health-safety constraints

## Validation

- all event types can be created, viewed, edited, and deleted locally
- Timeline reflects same-day and historical entries correctly

## Completed Work

- wired poop, pee, meal, walk, medication, and symptom detail flows to create local-first WatermelonDB events
- added canonical detail fields, shared save behavior, and placeholder local photo attachment handling for supported flows
- replaced the static Timeline with date navigation, same-day local event queries, newest-first rows, empty/loading/error states, and row delete actions
- replaced the event placeholder with a local event detail screen that loads by ID, defaults to read-only, supports edit mode for time/notes/photo, and deletes locally
- kept symptom logging observational with explicit emergency escalation copy and no diagnostic guidance

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/db/events/localEventRepository.ts src/features/logging/hooks/useDetailedEventSave.ts src/features/logging/components/LogNotesCard.tsx src/features/logging/components/LogMediaUploadButton.tsx src/features/logging/components/LogSegmentedControl.tsx src/features/logging/screens/LogPoopDetailScreen.tsx src/features/logging/screens/LogPeeDetailScreen.tsx src/features/logging/screens/LogMealDetailScreen.tsx src/features/logging/screens/LogWalkDetailScreen.tsx src/features/logging/screens/LogMedicationDetailScreen.tsx src/features/logging/screens/LogSymptomScreen.tsx src/features/archive/components/TimelineEventRow.tsx src/features/archive/screens/TimelineDailyScreen.tsx src/features/archive/screens/EventDetailScreen.tsx src/features/archive/utils/eventPresentation.ts`
- `corepack pnpm exec expo export --platform web`
- restarted Expo web with cleared Metro cache at `http://localhost:8081`
