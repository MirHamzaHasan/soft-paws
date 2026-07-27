# Task 022: AI Safety, Edge Functions, and Premium Gates

- Status: `completed`
- Priority: `P0`
- Phase: `AI & Safety`
- Depends on: `task017`, `task018`, `task021`

## Objective

Harden AI features for production trust boundaries, premium access, and non-diagnostic behavior.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- verify all AI calls go through Supabase Edge Functions only
- enforce premium access before weekly insight and Ask BarkLog AI calls
- add tests for emergency-language escalation and no-diagnosis wording
- ensure telemetry never sends raw notes, symptoms, prompts, or exports

## Initial Findings

Captured before remediation:

- AI client calls currently go through Supabase Edge Functions
- Edge Function prompts include non-diagnostic and emergency-escalation rules
- production readiness requires tests and premium enforcement around those boundaries

## Out of Scope

- adding new AI product surfaces
- changing the AI model vendor
- replacing toxicity lookup with generative AI

## Acceptance Criteria

- client never calls Anthropic directly
- emergency AI inputs return escalation guidance
- AI failures produce safe UI errors
- premium-gated AI is inaccessible to free or expired users
- telemetry excludes raw caregiver notes, symptom text, prompts, and export content

## Deferred to Later Tasks

- release observability verification is gated by `task024` and requires preview-build evidence

## Delivery Notes

- added shared AI safety helpers for emergency-language detection,
  non-diagnostic fixture checks, safe failure copy, and Premium access
  assertions
- updated Ask BarkLog AI so emergency-language prompts return immediate
  escalation guidance before any paywall or generative AI call
- updated Ask BarkLog AI and weekly insight client helpers so expired/free
  users cannot invoke the Supabase AI Edge Functions directly
- added `dogId` to Ask BarkLog AI requests so the Edge Function can verify dog
  ownership
- added a shared Supabase Edge auth helper for AI functions that:
  - requires a valid bearer token
  - reads the BarkLog user row with the service-role key
  - allows active, grandfathered, or unexpired trial access
  - rejects free or expired users with `premium_required`
  - verifies dog ownership before model calls
- updated `ask-barklog-ai` and `generate-weekly-insight` Edge Functions to call
  Anthropic only after Premium and ownership checks pass
- replaced AI provider error details with safe caregiver-facing failure copy
- added telemetry privacy sanitization for analytics and crash-reporting
  payloads that redacts raw notes, symptoms, prompts, answers, CSV/PDF/export
  content, and other raw payload keys
- added tests covering AI client gates, Edge Function contracts, emergency
  escalation, no-diagnosis fixture checks, and telemetry redaction

## Validation

- Edge Function contract tests or local function smoke tests
- prompt safety fixture tests
- telemetry privacy review
- `corepack pnpm test -- --runInBand`
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`
