# Task 028: Seed Initial Training Programs

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task027`

## Objective

Seed BarkLog's first premium training catalog with clear, positive-reinforcement programs that can be browsed, enrolled in, and completed through the training experience.

## Delivery Notes

- Added idempotent Supabase seed migration `202604270028_seed_initial_training_programs.sql`.
- Seeded all eight initial training programs with stable slugs, metadata, icons, and deterministic sort order.
- Seeded 53 ordered training steps across the catalog.
- Every step includes title, instruction, tip, estimated duration, and explicit "Success looks like" self-assessment language.
- Added static validation coverage for program metadata, step count/order, step readability, allowed enums, idempotent upserts, and forbidden aversive/dominance language.
- No training UI, enrollment behavior, WatermelonDB model changes, or AI personalization were included in this task boundary.
- This workspace currently has no Git metadata, so no local commit hash is available.

## Implementation Baseline

Use Supabase migration seed data for `training_programs` and `training_steps`. Keep the data deterministic, idempotent, and stable across environments. Do not add WatermelonDB models for reference programs or steps.

## Scope

- seed eight initial training programs
- seed five to eight concrete steps per program
- include title, instruction, tip, and estimated duration for every step
- use stable slugs and sort order for deterministic display
- include difficulty, category, estimated days, and icon metadata for every program
- add tests or static checks for required content fields and allowed enum values
- update any reference-data fixtures used by tests

## Out of Scope

- training hub UI
- enrollment logic
- AI personalization
- behavior or mood event implementation
- custom remote CMS or admin tooling

## Data Contracts / Schema Changes

Seed these programs:

- `sit-stay-foundations`: Sit & stay foundations, obedience, beginner, 7 days
- `loose-leash-walking`: Loose leash walking, leash_skills, beginner, 10 days
- `recall-come-when-called`: Recall (come when called), obedience, intermediate, 10 days
- `calm-greetings`: Calm greetings, socialization, beginner, 7 days
- `crate-training`: Crate training, puppy_basics, beginner, 7 days
- `reactivity-management`: Reactivity management, behavior_modification, intermediate, 14 days
- `leave-it-drop-it`: Leave it / drop it, obedience, beginner, 5 days
- `separation-comfort`: Separation comfort, behavior_modification, intermediate, 14 days

Each step must include:

```ts
type TrainingStepSeed = {
  step_number: number;
  title: string;
  instruction: string;
  tip: string;
  estimated_duration_min: number;
};
```

Instruction copy must be two to three short sentences and include what success looks like. Tips should be practical and may include breed-energy considerations where relevant.

## UX and Accessibility Requirements

- Program names, descriptions, and step titles should be short enough for mobile cards and detail headers.
- Step instructions should be readable in a compact mobile layout without dense paragraph blocks.
- Avoid jargon. Use caregiver-facing copy.

## AI / Safety Requirements

- Use positive reinforcement language only.
- Do not use punishment, dominance theory, alpha language, correction collars, prong collars, shock collars, or aversive tools.
- Do not claim BarkLog replaces a professional trainer, veterinary behaviorist, or veterinarian.
- Keep reactivity and separation-comfort language supportive and observational.
- Avoid medical or diagnostic claims.

## Premium / Free Behavior

- Program content is part of the premium training feature.
- Free users may later browse program cards, but enrollment and guided progression remain premium-gated in task029.

## Acceptance Criteria

- All eight programs are seeded with stable slugs.
- Each program has complete metadata: category, difficulty, estimated days, icon, sort order, and description.
- Each program has five to eight ordered steps.
- Every step includes title, instruction, tip, and estimated duration.
- Copy uses positive reinforcement only.
- Copy includes self-assessable success signals.
- Seed migration is idempotent or safely repeatable in local development.
- Static content checks pass for missing fields and forbidden phrases.

## Validation

- Passed: `npm run check-types`
- Passed: `npx eslint supabase/migrations/trainingProgramSeeds.test.ts src/types/training.ts`
- Passed: `npm run test -- --runInBand --coverage=false supabase/migrations/trainingProgramSeeds.test.ts`
- Completed migration review confirming stable slugs, unique step numbers, and `on conflict` upsert behavior.
- Completed static test coverage for seeded program requirements and forbidden aversive or dominance-based phrasing.

## Commit Boundary

Completed within one task boundary: seed migration and content validation tests only. Training UI and enrollment behavior remain owned by task029.
