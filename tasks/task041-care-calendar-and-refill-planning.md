# Task 041: Care Calendar and Refill Planning

- Status: `completed`
- Priority: `P2`
- Phase: `Best-In-Market Automation`
- Depends on: `task040`

## Objective

Add a care calendar and refill planning system that helps caregivers see upcoming medications, preventives, grooming, vet follow-ups, training sessions, and recurring care tasks without creating noisy or guilt-driven notifications.

## Completion Notes

- Added a local-first `care_tasks` data model across Supabase, WatermelonDB, sync collection constants, typed Supabase rows, model classes, and sync transport mappings.
- Added local care task repository helpers for create, update, list, open-list, fetch-by-id, and completion.
- Added recurrence and due-date utilities for date normalization, due-state labels, next-due calculations, and due-date sorting.
- Added opt-in Expo notification scheduling for care task reminders with denied-permission and unsupported-platform fallbacks.
- Added the `/care-calendar` route and Care Calendar screen with:
  - upcoming, due-today, overdue, and recently completed sections
  - medication refill planning tied to medication `refillDate`
  - recurrence, remaining-count, reminders, notes, and custom tasks
  - explicit local-only free planning copy
  - Premium smart automation gate for sync, household coordination, and future smart checklists
- Added Home and Profile entry points so caregivers can reach care planning without adding another tab.
- Registered `care-automation` in the Premium feature catalog and paywall row set.
- Updated sync tombstone handling so deleted care tasks can propagate for owners and shared-dog household members.

## Implementation Baseline

Use existing medication reminders, Expo Notifications, local persistence, Tamagui calendar/list patterns, and notification guardrails. Notifications remain sacred: default notifications should stay limited and explicitly opted in.

## Scope

- create care calendar data model for local recurring tasks
- support medication refills, parasite prevention, grooming, vaccination due dates, vet follow-ups, training practice, and custom care tasks
- add calendar/list screen
- add upcoming care card on Home or Profile
- add refill count or refill date support for medications
- add opt-in reminder scheduling for eligible tasks
- add Premium advanced automation gates where summaries, sync, household assignment, or smart scheduling are used
- add tests for recurrence, due dates, reminder permissions, and offline behavior

## Out of Scope

- e-commerce or auto-ship integrations
- insurance claim submission
- high-frequency habit streaks
- non-care marketing notifications

## Data Contracts / Schema Changes

Recommended care task contract:

```ts
type CareTaskType =
  | 'medication_refill'
  | 'parasite_prevention'
  | 'grooming'
  | 'vaccination'
  | 'vet_follow_up'
  | 'training_practice'
  | 'custom';

type CareTask = {
  id: string;
  dog_id: string;
  type: CareTaskType;
  title: string;
  due_at: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  reminder_enabled: boolean;
  completed_at?: string | null;
  notes?: string | null;
};
```

Premium extensions may include:

- sync
- household assignment
- AI-generated care checklist
- smart rescheduling suggestions

## UX and Accessibility Requirements

- Calendar should have list-first fallback for small screens.
- Due tasks should be scannable by dog and care type.
- Completion should be fast and haptic.
- Reminder opt-in must be explicit.
- Empty state should suggest adding a refill, prevention, grooming, or follow-up task.
- Avoid guilt-heavy streak language.

## AI / Safety Requirements

- Do not generate medication dosage advice.
- Preventive care suggestions must be educational and non-diagnostic.
- Follow-up tasks can remind users of their own notes or vet instructions, not invent instructions.
- Notifications should not create medical urgency unless the user configured the reminder.

## Premium / Free Behavior

- Free: local care tasks, local due list, basic medication reminder behavior.
- Premium: sync, household assignments, smart summaries, advanced automation, and AI-generated care checklists.

## Acceptance Criteria

- Users can create, complete, and view local care tasks offline.
- Medication refill planning supports refill date or remaining-count workflow.
- Reminder scheduling is opt-in and handles denied permissions safely.
- Care Calendar shows upcoming and overdue tasks.
- Free users can manage local tasks.
- Premium gates apply only to sync, household assignment, smart summaries, and advanced automation.
- Tests cover recurrence, completion, reminders, and permission denial.

## Validation

- `corepack pnpm check-types`
- `corepack pnpm exec eslint src/types/care.ts src/db/models/CareTaskModel.ts src/db/care/localCareTaskRepository.ts src/db/care/localCareTaskRepository.test.ts src/features/care/utils/careTaskSchedule.ts src/features/care/utils/careTaskSchedule.test.ts src/features/care/services/careTaskReminderService.ts src/features/care/services/careTaskReminderService.test.ts src/features/care/screens/CareCalendarScreen.tsx app/care-calendar.tsx src/features/home/screens/HomeScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx src/features/premium/utils/premiumAccess.ts src/features/premium/data/premiumCatalog.ts src/features/premium/utils/premiumAccess.test.ts src/db/sync/engine.test.ts src/db/sync/transport.test.ts src/db/schema.test.ts test/utils/builders.ts`
- `corepack pnpm test -- --coverage=false src/features/care/utils/careTaskSchedule.test.ts src/db/care/localCareTaskRepository.test.ts src/features/care/services/careTaskReminderService.test.ts src/db/schema.test.ts src/db/sync/transport.test.ts src/db/sync/engine.test.ts src/db/sync/syncEdgeFunctionContracts.test.ts src/features/premium/utils/premiumAccess.test.ts`
- `corepack pnpm web -- --port 8090`, then `curl -I -L http://localhost:8090/`, `curl -I -L http://localhost:8090/profile`, and `curl -I -L http://localhost:8090/care-calendar`

Note: a targeted Jest run without `--coverage=false` passed all targeted suites but failed the repo-level global coverage threshold because it intentionally executed only this slice's tests.

## Commit Boundary

One commit only: care task model, calendar/list UI, refill planning, reminder opt-in, premium automation gates, and tests.
