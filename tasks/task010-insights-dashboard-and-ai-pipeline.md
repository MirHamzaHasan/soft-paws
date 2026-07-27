# Task 010: Insights Dashboard and AI Pipeline

- Status: `completed`
- Priority: `P1`
- Phase: `Intelligence and Safety`
- Depends on: `task008`, `task009`, `task012`

## Objective

Implement the BarkLog insights surfaces and the Claude-backed AI pipeline.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for insights and AI surfaces. Do not introduce a parallel styling system.

## Scope

- Weekly Dashboard
- Monthly Trends
- Ask BarkLog AI
- weekly insight generation Edge Function
- AI prompt contract enforcement
- premium gating on AI surfaces

## Out of Scope

- full export pipeline
- safety and emergency suite

## Acceptance Criteria

- weekly insights are generated through Supabase Edge Functions only
- Ask BarkLog AI uses the canonical system prompt boundaries
- insights surfaces remain observational, not diagnostic
- premium gates appear where required

## Validation

- no client code calls Anthropic directly
- free and premium user paths behave differently where defined

## Completed Work

- Added local weekly/monthly insight summaries from WatermelonDB events and active medications.
- Added a local insight repository so generated weekly observations can be cached by dog/week.
- Wired Weekly Dashboard to live local event data, week switching, anomaly observations, premium AI generation, and saved insights.
- Wired Monthly Trends to local monthly events with an interim premium gate.
- Wired Ask BarkLog AI to local BarkLog context, starter questions, local chat state, and an interim premium gate.
- Added client AI helpers that invoke Supabase Edge Functions only.
- Implemented `generate-weekly-insight` and `ask-barklog-ai` Edge Functions with canonical prompt contracts and Anthropic calls isolated to the Edge runtime.
- Added emergency-language handling inside the Ask BarkLog AI Edge Function.

## Validation Notes

- `corepack pnpm check-types`
- targeted `corepack pnpm exec eslint ...`
- `rg "anthropic|Anthropic|api\\.anthropic\\.com|x-api-key" src app -n`
- Deno CLI is not installed locally, so Edge Function runtime typechecking could not be run in this workspace.
