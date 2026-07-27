# Task 043: Low-Cost AI Provider Migration And Vision-Ready Key Boundary

- Status: `completed`
- Priority: `P1`
- Phase: `Production Cost Hardening`
- Depends on: `task042`

## Objective

Replace BarkLog's Anthropic-only Edge Function integration with a lower-cost, provider-neutral AI boundary while keeping all AI keys and model calls server-side in Supabase Edge Functions.

## Completion Notes

- Added a provider-neutral shared AI adapter at `supabase/functions/_shared/aiProvider.ts`.
- Replaced the old Anthropic-specific shared module with text AI configuration, request body shaping, safe provider logging, and reusable output clamp helpers.
- Updated existing AI Edge Functions to use `createTextAiMessage(...)` without changing their public contracts:
  - `ask-barklog-ai`
  - `generate-weekly-insight`
  - `generate-care-summary`
  - `generate-vet-report`
  - `generate-training-insight`
- Preserved Premium checks, dog ownership checks, prompt versions, emergency bypass behavior, markdown stripping, clamp helpers, and safe caregiver-facing failure copy.
- Added server-side parsing for future vision AI configuration without exposing image interpretation in the UI.
- Updated environment, release, architecture, Supabase, and agent-facing docs with the new key boundary.
- Added focused tests for provider env parsing, request body shape, and client contract protection.
- Moved local server-only values out of `.env.local` into ignored Supabase-only local env storage so Expo exports load only client-safe values.

## Provider Decisions

Default text provider:

```txt
BARKLOG_TEXT_AI_PROVIDER=deepseek
BARKLOG_TEXT_AI_BASE_URL=https://api.deepseek.com
BARKLOG_TEXT_AI_MODEL=deepseek-v4-flash
BARKLOG_TEXT_AI_THINKING=disabled
```

Default future vision provider:

```txt
BARKLOG_VISION_AI_PROVIDER=openai
BARKLOG_VISION_AI_BASE_URL=https://api.openai.com/v1
BARKLOG_VISION_AI_MODEL=gpt-5.4-nano
```

Pricing basis checked on 2026-05-04:

- Anthropic pricing: <https://platform.claude.com/docs/en/about-claude/pricing>
- DeepSeek pricing and models: <https://api-docs.deepseek.com/quick_start/pricing>
- DeepSeek thinking toggle: <https://api-docs.deepseek.com/guides/thinking_mode>
- OpenAI pricing: <https://developers.openai.com/api/docs/pricing>
- OpenAI models: <https://developers.openai.com/api/docs/models>
- Gemini fallback research: <https://ai.google.dev/gemini-api/docs/pricing>

## Server-Only Secrets

Set these in Supabase Edge Function secrets for each remote environment:

```txt
BARKLOG_TEXT_AI_PROVIDER=deepseek
BARKLOG_TEXT_AI_BASE_URL=https://api.deepseek.com
BARKLOG_TEXT_AI_API_KEY=...
BARKLOG_TEXT_AI_MODEL=deepseek-v4-flash
BARKLOG_TEXT_AI_THINKING=disabled

BARKLOG_VISION_AI_PROVIDER=openai
BARKLOG_VISION_AI_BASE_URL=https://api.openai.com/v1
BARKLOG_VISION_AI_API_KEY=...
BARKLOG_VISION_AI_MODEL=gpt-5.4-nano

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Legacy Anthropic secrets are unsupported by default:

```txt
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
```

Do not place any provider secret in `EXPO_PUBLIC_*`, `.env.local`, `env.example`, `app/`, or `src/`.

## Scope

- Create a provider-neutral text AI adapter for current Supabase Edge Functions.
- Default text AI to DeepSeek non-thinking mode to reduce cost.
- Parse future OpenAI vision configuration server-side.
- Keep all existing Edge Function request and response contracts unchanged.
- Keep all current AI product surfaces behind the same server-side entitlement and dog ownership checks.
- Keep emergency Ask BarkLog AI prompts on deterministic escalation copy before any model call.
- Update docs and release scans so new provider keys are treated as server-only.
- Add focused tests for config parsing, request body shape, and client secret boundaries.

## Out Of Scope

- No custom VPS, Express server, Next.js API route, or extra backend runtime.
- No image AI product launch.
- No camera, image-picker, photo compare, toxicity vision, or generated photo summary UI.
- No deterministic toxicity lookup rewrite.
- No prompt behavior expansion beyond the provider migration.

## Safety And Privacy Requirements

- The mobile client must never call DeepSeek, OpenAI, Anthropic, Gemini, or any AI provider directly.
- Provider failures must return existing safe caregiver-facing errors and must not expose provider details.
- Logs may include provider, model, feature, prompt version, success/failure, and token counts when available.
- Logs must never include raw prompts, notes, symptoms, report text, or photo contents.
- Toxicity lookup remains deterministic and reference-based.
- BarkLog remains a care journal and organization tool, not a veterinary authority.

## Acceptance Criteria

- BarkLog text AI no longer requires `ANTHROPIC_API_KEY`.
- All existing AI product surfaces still work through Supabase Edge Functions only.
- Free and expired users still cannot invoke Premium AI.
- Emergency Ask BarkLog AI prompts still return immediate escalation copy before model calls.
- DeepSeek requests include `thinking: { type: "disabled" }`.
- Provider failures return safe caregiver-facing errors and never expose provider internals to users.
- Vision keys are documented and parsed server-side.
- No image interpretation is exposed to users in this task.
- Client source and generated bundles do not contain AI provider server secrets.

## Validation

Required baseline:

```sh
corepack pnpm check-types
corepack pnpm lint --quiet
corepack pnpm test -- --runInBand
```

Focused validation:

```sh
corepack pnpm test -- --coverage=false --runTestsByPath src/features/insights/api/aiProviderConfig.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts
rg "api\\.anthropic\\.com|ANTHROPIC_API_KEY|x-api-key" app src
rg "ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY" dist
```

Manual preview checks:

- Ask BarkLog AI returns a non-diagnostic answer for a normal Premium question.
- Ask BarkLog AI emergency wording bypasses the provider call.
- Weekly insight, care summary, vet report, and training insight still return bounded output.
- A deliberately missing DeepSeek key returns safe "AI unavailable" copy.
- Free user access still routes to Premium gate or `premium_required`.

Result: automated validation passed locally on 2026-05-04.

- `corepack pnpm check-types` passed.
- `corepack pnpm lint --quiet` passed.
- `corepack pnpm test -- --runInBand` passed with 48 suites and 181 tests.
- `corepack pnpm test -- --coverage=false --runTestsByPath src/features/insights/api/aiProviderConfig.test.ts src/features/insights/api/aiEdgeFunctionContracts.test.ts` passed.
- `corepack pnpm exec expo export --platform web` passed after `.env.local` was limited to client-safe values.
- `rg "api\\.anthropic\\.com|ANTHROPIC_API_KEY|x-api-key" app src` returned no matches.
- `rg "ANTHROPIC_API_KEY|SUPABASE_SERVICE_ROLE_KEY|BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" dist` returned no matches.
- `rg "BARKLOG_TEXT_AI_API_KEY|BARKLOG_VISION_AI_API_KEY|sk-ant|service_role" env.example app src` returned no matches.

## Commit Boundary

One commit only: provider-neutral AI adapter, Edge Function caller updates, provider config tests, task document, and environment/release/source-of-truth documentation updates.
