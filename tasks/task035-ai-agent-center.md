# Task 035: AI Agent Center

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market AI`
- Depends on: `task034`

## Objective

Create a Premium AI Agent Center that organizes BarkLog's AI capabilities into clear specialist agents while keeping every AI call behind Supabase Edge Functions and RevenueCat Premium access.

## Implementation Baseline

Use the existing Ask BarkLog AI, Edge Function, premium gate, Tamagui card, skeleton, retry, and safety-copy patterns. Do not call Claude or any AI provider directly from the client.

## Scope

- create AI Agent Center route and navigation entry point
- define agent catalog metadata
- show locked and unlocked agent cards
- route free users to Premium Gate before any AI call
- create shared client API wrapper for invoking approved agent Edge Functions
- add loading, empty, error, quota, and retry states
- add observability events without sensitive payloads
- add tests for entitlement gating and agent routing

## Out of Scope

- implementing every agent's final summary logic; task036 owns the first summary suite
- changing core Ask BarkLog AI safety prompt unless required for routing
- emergency AI triage
- storing AI provider secrets in client code

## AI Agent Catalog

Initial agent cards:

- Weekly Health Summary Agent
- Vet Prep Agent
- Training Observer Agent
- Behavior Pattern Agent
- Mood Pattern Agent
- Medication Adherence Agent
- Nutrition Consistency Agent
- Expense Summary Agent
- Memory Book Agent
- Care Coordinator Agent

Recommended metadata:

```ts
type AiAgentDefinition = {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'training' | 'behavior' | 'records' | 'lifestyle' | 'household';
  premium: true;
  edgeFunctionName?: string;
  requiredData: string[];
  safetyLevel: 'low' | 'medium' | 'high';
};
```

## UX and Accessibility Requirements

- Agent Center should feel like a work surface, not a marketing page.
- Cards must be compact, scannable, and grouped by category.
- Locked cards show what the agent does and open the Premium Gate.
- Premium cards open the correct agent flow or summary surface.
- Skeletons appear while entitlement and available-data state load.
- Cards have accessible labels describing title, locked state, and purpose.

## AI / Safety Requirements

- All AI calls go through Supabase Edge Functions.
- Agent output must be non-diagnostic.
- High-risk health or urgent scenarios must route users to Emergency SOS or vet contact rather than generating casual advice.
- Agent prompts must exclude raw sensitive notes unless passed through approved summarization.

## Premium / Free Behavior

- Free users can browse what agents do.
- Free users cannot invoke agents unless a later task explicitly adds a trial quota.
- Premium users can invoke available agents when enough local/synced context exists.

## Acceptance Criteria

- AI Agent Center exists and is reachable from an approved navigation surface.
- Agent catalog is typed and centralized.
- Free users see locked agent cards and Premium Gate on action.
- Premium users can open available agent flows without duplicate paywalls.
- No client code imports or calls Anthropic directly.
- Empty states explain what logs are needed for useful agent output.
- Tests cover entitlement gating, card rendering, and routing.

## Validation

- `pnpm check-types`
- targeted lint for AI routes, agent catalog, and API wrapper
- UI tests for free, premium, loading, empty, and error states
- static search confirming no direct client AI provider calls
- safety copy review for all agent descriptions

## Completion Notes

- Added `/ai-agents` as the Premium AI Agent Center route.
- Added a centralized typed agent catalog with 10 specialist agents across health, behavior, training, records, lifestyle, and household categories.
- Added card state logic for locked, ready, loading, error, no-dog, and needs-more-logs states.
- Added a shared AI agent client wrapper that gates through RevenueCat Premium access before invoking allowlisted Supabase Edge Functions.
- Added an `ai-agents` Premium feature key and paywall metadata.
- Added an Insights screen entry point that opens the Agent Center for both free and Premium users.
- Added safe observability events for locked and opened agent cards without raw caregiver notes.
- Kept free users able to browse agent descriptions while blocking AI invocation behind Premium.

## Validation Notes

- `corepack pnpm check-types`
- `corepack pnpm exec eslint app/ai-agents.tsx src/features/assistant/data/aiAgentCatalog.ts src/features/assistant/data/aiAgentCatalog.test.ts src/features/assistant/utils/aiAgentAvailability.ts src/features/assistant/api/aiAgentClient.ts src/features/assistant/api/aiAgentClient.test.ts src/features/assistant/screens/AiAgentCenterScreen.tsx src/features/premium/utils/premiumAccess.ts src/features/premium/data/premiumCatalog.ts src/features/premium/utils/premiumAccess.test.ts src/features/observability/services/analyticsService.ts src/features/insights/screens/InsightsScreen.tsx`
- `corepack pnpm test -- --coverage=false src/features/assistant/data/aiAgentCatalog.test.ts src/features/assistant/api/aiAgentClient.test.ts src/features/premium/utils/premiumAccess.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts`
- Static search confirmed no client Anthropic provider call or key usage in `app` or `src`.
- `corepack pnpm web -- --port 8090`
- Route smoke checks returned `200 OK` for `/ai-agents`, `/insights`, `/ask-ai`, and `/premium-gate?feature=ai-agents`.
- No Git commit was created because this workspace currently has no Git metadata.

## Commit Boundary

One commit only: Agent Center route, typed catalog, premium gating, shared AI invocation wrapper, navigation entry, and tests. Do not implement the full summary suite.
