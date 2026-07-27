# Task 027: Create Training Programs Database Schema and Models

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task026`

## Objective

Create the premium training data foundation: reference training programs and steps in Supabase, plus offline-first dog enrollments and training sessions in WatermelonDB with sync support.

## Implementation Baseline

Use existing Supabase migration patterns, WatermelonDB model conventions, TanStack Query conventions, and the established WatermelonDB to Supabase sync engine. Do not introduce a parallel persistence layer.

Training reference data is read-only from the client. User-generated enrollment and session data must persist locally first and sync later.

## Scope

- add Supabase tables for `training_programs`, `training_steps`, `dog_training_enrollments`, and `training_sessions`
- add RLS policies for all user-data training tables
- keep `training_programs` and `training_steps` as read-only reference data fetched from Supabase
- create WatermelonDB models for enrollments and sessions only
- add local schema support for enrollment and session tables
- add sync adapters for enrollments and sessions
- add typed Supabase query helpers for programs, steps, enrollments, and sessions
- add tests for schema constraints, local model mapping, and sync serialization

## Out of Scope

- seeding full program content beyond minimal migration scaffolding
- training hub UI
- training session logging UI
- weekly training AI insight generation
- adding `training` to `events.type`; that belongs to task030

## Data Contracts / Schema Changes

Supabase reference tables:

```sql
training_programs (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  description text,
  category text not null check (...),
  difficulty text not null check (...),
  estimated_days integer not null,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
)
```

```sql
training_steps (
  id uuid primary key,
  program_id uuid references training_programs(id) on delete cascade not null,
  step_number integer not null,
  title text not null,
  instruction text not null,
  tip text,
  estimated_duration_min integer default 10,
  created_at timestamptz default now(),
  unique(program_id, step_number)
)
```

Supabase user-data tables:

```sql
dog_training_enrollments (
  id uuid primary key,
  dog_id uuid references dogs(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  program_id uuid references training_programs(id) on delete cascade not null,
  current_step integer default 1,
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'active' check (...),
  created_at timestamptz default now(),
  unique(dog_id, program_id)
)
```

```sql
training_sessions (
  id uuid primary key,
  enrollment_id uuid references dog_training_enrollments(id) on delete cascade not null,
  dog_id uuid references dogs(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  step_id uuid references training_steps(id) not null,
  duration_min integer,
  success_rating integer check (success_rating between 1 and 5),
  dog_mood text check (...),
  notes text,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
)
```

Allowed categories:

- `obedience`
- `behavior_modification`
- `socialization`
- `tricks`
- `puppy_basics`
- `leash_skills`

Allowed difficulty values:

- `beginner`
- `intermediate`
- `advanced`

Allowed enrollment statuses:

- `active`
- `paused`
- `completed`
- `abandoned`

Allowed training session dog mood values must match the task025 mood enum.

## UX and Accessibility Requirements

- No new user-facing UI is required in this task.
- Any temporary developer-visible fetch or test surface must not ship to production navigation.
- Future UI consumers must receive typed loading, empty, and error states from query helpers.

## AI / Safety Requirements

- No AI generation is introduced in this task.
- Training schema should support pattern observation only; do not create fields that imply diagnosis or trainer replacement claims.

## Premium / Free Behavior

- Training enrollment and sessions are premium features.
- Database and local models may exist for all installs, but UI entry and mutation paths must later enforce RevenueCat premium entitlements.
- Reference programs can be browsed later by free users; enrollment remains gated in task029.

## Acceptance Criteria

- Supabase migration creates all four training tables with constraints.
- RLS is enabled for `dog_training_enrollments` and `training_sessions`.
- User-data RLS policies restrict rows to `auth.uid() = user_id`.
- WatermelonDB models exist for `TrainingEnrollment` and `TrainingSession`.
- WatermelonDB schema includes enrollment and session tables.
- Sync engine can push and pull enrollments and sessions without affecting event sync.
- Program and step reference data is fetched from Supabase through typed APIs.
- Tests cover schema constants, model mapping, and sync payload shape.

## Delivery Notes

- Added Supabase migration `202604270027_training_programs_schema.sql` with reference tables, user-data tables, constraints, indexes, RLS policies, updated-at triggers, and sync tombstone support.
- Added WatermelonDB schema version `2` with `dog_training_enrollments` and `training_sessions`.
- Added WatermelonDB migrations for upgrading existing local databases from schema version `1` to `2`.
- Added `TrainingEnrollmentModel` and `TrainingSessionModel`.
- Added offline-first local repository helpers for creating/listing/updating enrollments and creating/listing training sessions.
- Added training domain constants and generated Supabase type coverage for programs, steps, enrollments, and sessions.
- Added typed Supabase API helpers and TanStack Query option factories for reference programs, steps, enrollments, and sessions.
- Added training tables to sync collection constants, sync conflict policy, sync tests, and the `barklog-sync` Edge Function pull/push mappings.
- Reference program and step data remains remote read-only; full seed content remains task028.

## Validation

- `npm run check-types`
- `npx eslint src/types/training.ts src/types/supabase.ts src/db/constants.ts src/db/schema.ts src/db/migrations.ts src/db/types.ts src/db/modelClasses.ts src/db/models/TrainingEnrollmentModel.ts src/db/models/TrainingSessionModel.ts src/db/models/index.ts src/db/training/localTrainingRepository.ts src/db/training/index.ts src/db/training/localTrainingRepository.test.ts src/db/schema.test.ts src/db/sync/engine.test.ts src/db/sync/transport.test.ts src/api/training.ts src/api/training.test.ts src/api/index.ts supabase/functions/barklog-sync/index.ts`
- `npm run test -- --runInBand --coverage=false src/db/training/localTrainingRepository.test.ts src/db/schema.test.ts src/api/training.test.ts src/db/sync/engine.test.ts src/db/sync/transport.test.ts`
- Migration review confirmed training constraints, indexes, RLS policies, `updated_at` triggers, and sync delete tombstones.
- Local repository tests confirm enrollment and session writes happen locally and record sync metadata.

## Commit Boundary

One commit only: training schema, generated/handwritten types, local models, sync support, reference-data fetch helpers, and tests. Do not include seeded full training content or UI screens.

This workspace currently has no Git metadata, so no local commit hash is available.
