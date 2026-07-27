# Task 031: Connect Training to Behavior and Mood Data

- Status: `completed`
- Priority: `P1`
- Phase: `Mood, Behavior, and Training`
- Depends on: `task030`

## Objective

Add premium training personalization by connecting behavior logs, mood logs, training sessions, and active enrollment context through a Supabase Edge Function that generates short, supportive, non-diagnostic observations.

## Implementation Baseline

Use Supabase Edge Functions for all Claude calls. The mobile client must call only the BarkLog backend function and must never contain AI provider secrets or direct Anthropic client logic.

Use existing AI safety, premium gate, loading skeleton, retry, and observability patterns from the weekly insight and Ask BarkLog AI flows.

## Scope

- create Supabase Edge Function `generate-training-insight`
- summarize the last 14 days of behavior events, mood events, training sessions, and active enrollment context
- show the generated training insight on Program Detail below the current step
- show a training insight card on Weekly Dashboard when the dog has an active training enrollment
- update Ask BarkLog AI context builder to include active training programs, recent sessions, behavior patterns, and mood patterns
- enforce premium entitlement before requesting training insight
- add safe loading, empty, stale, and error states
- add tests for prompt construction, entitlement gating, and context assembly

## Out of Scope

- general-purpose trainer chat
- medical or diagnostic behavior interpretation
- new push notifications
- changing weekly insight length or canonical health prompt rules
- storing provider secrets anywhere outside Supabase Edge Function secrets

## Data Contracts / Schema Changes

Edge Function name:

```text
generate-training-insight
```

Input payload:

```ts
type GenerateTrainingInsightInput = {
  dog: {
    id: string;
    name: string;
    breed?: string | null;
    age?: number | null;
    weight_lbs?: number | null;
  };
  behavior_summary: string;
  mood_summary: string;
  training_summary: string;
  enrollment: {
    program_name: string;
    current_step: number;
    total_steps: number;
  };
};
```

Output payload:

```ts
type GenerateTrainingInsightOutput = {
  observation: string;
  generated_at: string;
  prompt_version: string;
};
```

Prompt rules:

- write two to three short, encouraging sentences
- focus on patterns, consistency, success rating trends, behavior frequency changes, and mood correlations
- celebrate small wins
- if behavior incidents decreased since training started, mention the trend
- if mood is often anxious before training sessions, suggest shorter sessions
- never diagnose
- never claim to replace a trainer, behaviorist, or veterinarian
- output only the observation

## UX and Accessibility Requirements

- Program Detail shows a compact training insight card below the current step for premium users with active enrollment.
- Weekly Dashboard shows a training insight card only when there is active training data.
- Loading states use skeletons.
- Empty states explain that insights appear after enough training activity, without upsell pressure inside the insight card.
- Error state offers retry and does not block logging or step progression.
- Insight text must be readable by screen readers and must not rely on color to indicate importance.

## AI / Safety Requirements

- Claude calls happen only in `generate-training-insight` or existing approved Supabase Edge Function paths.
- Prompt construction must exclude raw sensitive notes unless already summarized through existing safe summary helpers.
- User-facing copy must not diagnose anxiety, aggression, pain, illness, or behavioral disorders.
- Copy may suggest shorter sessions for patterns of anxious mood, but must not prescribe treatment.
- For severe behavior patterns, copy should stay measured and suggest using professional support without replacing BarkLog's health-safety boundaries.

## Premium / Free Behavior

- Training insights are premium.
- Non-premium users should not call the Edge Function.
- Free users browsing training programs can see static program content but not personalized training insights.
- Ask BarkLog AI remains governed by its existing free quota and premium unlimited behavior; added training context must respect current entitlement logic.

## Acceptance Criteria

- Completed: `generate-training-insight` Edge Function exists and is callable through the app API layer.
- Completed: function prompt includes dog profile, behavior summary, mood summary, training summary, and enrollment progress.
- Completed: Program Detail displays a premium training insight card for dogs with saved enrollment.
- Completed: Weekly Dashboard displays a training insight card when the selected dog has an active training enrollment.
- Completed: Ask BarkLog AI receives training context with active programs, recent training, behavior, and mood summaries.
- Completed: non-premium users cannot request personalized training insights from the client or Edge Function.
- Completed: loading, empty, error, and retry states are implemented.
- Completed: AI output remains short, supportive, positive-reinforcement aligned, and non-diagnostic by prompt contract.
- Completed: tests cover prompt safety rules, entitlement gating, and training insight context construction.

## Completion Notes

- Added `supabase/functions/generate-training-insight/index.ts` with premium access enforcement before the Anthropic model call.
- Added `TrainingInsightContext` and training context builders for Program Detail, Weekly Dashboard, and Ask BarkLog AI.
- Added `generateTrainingInsight` to the AI client with the same safe failure handling and client-side premium guard as existing AI features.
- Added Program Detail and Weekly Dashboard training insight cards with skeleton loading and safe empty/error copy.
- Expanded Ask BarkLog AI context and Edge Function prompt to include training context while preserving non-diagnostic and positive-reinforcement rules.
- Added targeted tests for AI Edge Function contracts, client entitlement gates, event summaries, and training insight context.

## Validation

- Passed: `npm run check-types`
- Passed: targeted ESLint for touched Edge Function, API, training route, weekly dashboard, Ask AI, summary, and test files
- Passed: `npm test -- --coverage=false src/features/insights/api/insightsAiClient.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts src/features/insights/utils/insightSummaries.test.ts src/features/training/utils/trainingInsightContext.test.ts`
- Passed with note: the same targeted Jest command without `--coverage=false` had all suites pass but failed repo-wide global coverage thresholds unrelated to this slice.
- Passed: `npm run tamagui:generate`
- Passed: route checks returned 200 for `/training/sit-stay-foundations`, `/insights`, and `/ask-ai` on the running Expo web server.

## Commit Boundary

One commit only: training insight Edge Function, client API integration, Program Detail card, Weekly Dashboard card, Ask BarkLog AI context expansion, premium gating, safety tests, and UI tests.
