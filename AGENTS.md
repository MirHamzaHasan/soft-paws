# BarkLog Agent Guide

## Start Here

- Treat [docs/source-of-truth/barklog-product-engineering.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/docs/source-of-truth/barklog-product-engineering.md:1) as the canonical source of truth.
- Use [docs/agentic/product-truth.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/docs/agentic/product-truth.md:1) for the condensed BarkLog truth summary.
- Use [docs/agentic/workflows.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/docs/agentic/workflows.md:1) as the delivery playbook.
- Use [docs/design/components.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/docs/design/components.md:1) as the reusable component registry.

## Hard Guardrails

- Build BarkLog with `Expo Router`, `Tamagui`, `TypeScript`, `Zustand`, `TanStack Query`, `WatermelonDB`, and `Supabase`.
- Do not introduce NativeWind, Tailwind, or a parallel styling system.
- Do not treat the previous manager-first prototype architecture as the source of truth.
- Logging is `offline-first`. Persist to WatermelonDB before syncing remotely.
- Do not present BarkLog as a veterinary authority. Organize facts and patterns, then escalate when appropriate.
- Do not lock basic logging, timeline access, or export rights behind a paywall.
- Keep Home as the most polished and highest-priority screen in the app.
- Use `Inter` 400 and 500 only, BarkLog design tokens only, and no decorative gradients or shadows.
- Never call AI providers from the client. Use Supabase Edge Functions only.

## Skill Routing

- Use `$barklog-feature-workflow` for planning, backlog slicing, and acceptance criteria.
- Use `$barklog-health-safety` for toxicity, triage, symptoms, first aid, vet exports, and AI health boundaries.
- Use `$barklog-ios-android-readiness` for notifications, camera, permissions, location, Apple Health, and Google Fit.
- Use `$barklog-monetization-engagement` for trials, paywalls, premium gates, reminders, and subscription flows.

Use the repo-local Tamagui implementation skill for codebase discovery and implementation patterns. The canonical BarkLog spec overrides older prototype documents for product decisions.

## Default Delivery Flow

1. Read the canonical spec and identify the exact route, screen ID, or system section involved.
2. Define the vertical slice:
   - happy path
   - loading, empty, error, and offline states
   - premium / free behavior
   - accessibility and analytics hooks
3. Implement the smallest end-to-end slice that proves value.
4. Validate with typecheck, targeted lint/tests, and route preview where relevant.

## Current Feature Backlog

- Task backlog lives in [tasks/README.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/tasks/README.md:1).
- `task025` mood check-in is completed locally and documented as the first Mood, Behavior, and Training slice.
- `task026` behavior logging is completed locally and documented.
- `task027` through `task031` define completed premium training foundations: schema, seed content, hub/detail screens, session logger with Timeline events, and training AI personalization.
- `task032` premium sync and backup entitlement model is completed.
- `task033` local-only free mode and sync status UI is completed.
- `task034` expanded offline log types is completed.
- `task035` AI Agent Center is completed.
- `task036` health and behavior summary suite is completed.
- `task037` static free training program rotation is completed.
- `task038` vet share link and report upgrade is completed.
- `task039` household sharing and sitter mode is completed.
- `task040` Safety Center offline pack is completed.
- `task041` care calendar and refill planning is completed with `/care-calendar`, local `care_tasks`, opt-in reminders, Home/Profile entry points, and a Premium smart automation gate.
- `task042` Photo Baseline Tracker is completed at `/photo-baselines` with local `photo_baselines`, Home/Profile entry points, and a Premium photo-compare gate.
- The strategy input for `task032` and later is [barklog-best-in-market-product-and-monetization-plan.md](/Users/mirhamzahasan/Documents/DracoArts/draco-apps/bark-log/docs/product/barklog-best-in-market-product-and-monetization-plan.md:1).
- Mood and behavior logging are free care-record features. Training enrollment, sessions, personalized training insights, cloud sync, backup, restore, and sharing are premium-gated through RevenueCat.
- Per the strategy plan, cloud sync and backup are Premium while free users keep local offline tracking and manual export.
- Generated care summaries are Premium and invoke `generate-care-summary` only through Supabase Edge Functions.
- Free users can read one deterministic static training program per ISO week. All training progress tracking, session logging, sync, analytics, and personalization remain Premium.
- Premium vet report summaries invoke `generate-vet-report` only through Supabase Edge Functions. Secure vet share links use hashed tokens, expiry, revoke state, and the public `/vet-share/[token]` route.
- Household sharing and sitter mode are Premium cloud collaboration features. The implemented path uses `/household`, `/household/invite/[token]`, Supabase RLS helpers, hashed invites, role permissions, and shared-dog sync scoping.
- Safety Center is a free offline-first safety surface at `/safety`, with `/safety-center` as an alias. Urgent actions, first-aid basics, core toxicity lookup, and the local emergency card must not be Premium-gated.
- Photo Baseline Tracker is free local recordkeeping. It organizes owner-observed visual references only; photo compare, cloud backup, AI summaries, and sharing extensions are Premium.

## Current Repo Notes

- The repo still contains legacy prototype code and docs from the earlier stack direction.
- `pnpm check-types` is the current reliable validation baseline.
- `pnpm lint` may still report inherited debt outside the touched slice.
- `pnpm web` remains useful for flow visibility, but it is not a substitute for the canonical BarkLog mobile architecture.
