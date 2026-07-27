# Task 036: Health and Behavior Summary Suite

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market AI`
- Depends on: `task035`

## Objective

Build the first Premium generated summary suite so BarkLog can turn raw logs into short, useful, non-diagnostic weekly and monthly patterns across health, mood, behavior, medication, nutrition, expenses, and training.

## Implementation Baseline

Use Supabase Edge Functions for all generation. Use existing weekly insight safety rules, Premium entitlement checks, skeletons, retry states, and telemetry redaction.

## Scope

- define shared summary input builders for logged event data
- create or extend Edge Functions for summary generation
- add Premium summary cards to Insights
- add summary entry points from Timeline filters where appropriate
- include health, mood, behavior, medication, nutrition, expense, and training summary types
- add generated-state caching or persisted summary records where consistent with existing patterns
- add prompt safety tests and UI tests
- add manual review fixtures for representative safe outputs

## Out of Scope

- general AI chat
- vet share link generation; task038 owns shareable reports
- training insight card from task031 unless reused
- emergency triage generation

## Summary Types

Recommended summary contracts:

```ts
type SummaryKind =
  | 'weekly_health'
  | 'monthly_health'
  | 'mood'
  | 'behavior'
  | 'medication_adherence'
  | 'nutrition_consistency'
  | 'expense'
  | 'training';

type GeneratedSummary = {
  id: string;
  dog_id: string;
  kind: SummaryKind;
  range_start: string;
  range_end: string;
  content: string;
  generated_at: string;
  prompt_version: string;
};
```

Outputs should be short, factual, and pattern-based. Raw logs stay accessible without Premium.

## UX and Accessibility Requirements

- Insights becomes the primary Premium summaries surface.
- Free users see locked summary previews but can still navigate to raw Timeline.
- Premium users see generated cards with refresh or retry where allowed.
- Skeletons appear while summaries load or generate.
- Empty states explain that more logs are needed.
- Summary cards must be readable and concise on small phones.

## AI / Safety Requirements

- Never diagnose.
- Never say "your dog has".
- Use "logged", "appears", "pattern", and "worth discussing" language.
- Urgent patterns should route to Emergency SOS or vet contact.
- Do not generate medication dosage advice.
- Keep training summaries positive-reinforcement aligned.

## Premium / Free Behavior

- Generated summaries are Premium.
- Raw logs, local Timeline, and manual export remain free.
- Non-premium users must not call summary Edge Functions.

## Acceptance Criteria

- Premium users can generate or view summary cards for the defined summary types.
- Free users see Premium Gate before any generated summary call.
- Summary prompts include only necessary context.
- AI output remains non-diagnostic and short.
- Raw Timeline remains free and accessible.
- Tests cover entitlement gating, prompt construction, empty data states, and forbidden phrasing.

## Validation

- `pnpm check-types`
- targeted lint for Edge Functions, summary builders, Insights UI, and API files
- prompt tests for required context and forbidden claims
- UI tests for locked, loading, empty, generated, and error states
- telemetry redaction test for summary events

## Completion Notes

- Added typed care-summary contracts and context builders for weekly health, monthly health, mood, behavior, medication, nutrition, expense, and training summaries.
- Added the Premium-gated `generate-care-summary` Supabase Edge Function with server-side entitlement checks before Anthropic calls.
- Added the `care-summaries` Premium feature key and paywall metadata.
- Added Premium summary cards to Insights with locked, empty-data, loading, generated, refresh, and error states.
- Added a Timeline entry point that keeps raw Timeline access free and routes generated summaries through Insights.
- Added telemetry events for summary generation start, success, and failure.
- Updated AI function allowlists and Supabase documentation for the new Edge Function.
- Added manual AI review fixtures at `docs/operations/care-summary-ai-review-fixtures.md`.
- Added targeted tests for summary context building, client Premium gating, Edge Function safety wording, Premium metadata, and AI agent allowlists.

## Validation Results

- `corepack pnpm check-types`
- `corepack pnpm exec eslint supabase/functions/generate-care-summary/index.ts src/features/insights/utils/generatedSummaries.ts src/features/insights/utils/generatedSummaries.test.ts src/features/insights/api/insightsAiClient.ts src/features/insights/api/insightsAiClient.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts src/features/insights/screens/InsightsScreen.tsx src/features/archive/screens/TimelineDailyScreen.tsx src/features/premium/utils/premiumAccess.ts src/features/premium/data/premiumCatalog.ts src/features/premium/utils/premiumAccess.test.ts src/features/observability/services/analyticsService.ts src/features/assistant/data/aiAgentCatalog.ts src/features/assistant/data/aiAgentCatalog.test.ts`
- `corepack pnpm test -- --coverage=false src/features/insights/utils/generatedSummaries.test.ts src/features/insights/api/insightsAiClient.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts src/features/premium/utils/premiumAccess.test.ts src/features/assistant/data/aiAgentCatalog.test.ts`
- `rg -n "api\\.anthropic\\.com|ANTHROPIC_API_KEY|x-api-key" app src`
- `corepack pnpm web -- --port 8090` with route smoke checks for `/insights`, `/timeline`, and `/premium-gate?feature=care-summaries`

## Commit Boundary

One commit only: summary contracts, generation path, Premium Insights cards, gating, prompt safety tests, and UI tests.
