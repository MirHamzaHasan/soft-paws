# BarkLog Agent Guide

## Start Here

- Treat [docs/source-of-truth/barklog-product-engineering.md](docs/source-of-truth/barklog-product-engineering.md) as the canonical source of truth.
- Use [docs/agentic/product-truth.md](docs/agentic/product-truth.md) for the condensed BarkLog truth summary.
- Use [docs/agentic/workflows.md](docs/agentic/workflows.md) as the delivery playbook.
- Use [docs/design/components.md](docs/design/components.md) as the reusable component registry.

## Hard Guardrails

- Build BarkLog with `Expo Router`, `Tamagui`, `TypeScript`, `Zustand`, `TanStack Query`, and local `WatermelonDB`.
- Do not introduce NativeWind, Tailwind, or a parallel styling system.
- Do not treat the previous manager-first prototype architecture as the source of truth.
- Logging and profiles are local-only. Persist all care records to WatermelonDB on the device.
- Do not present BarkLog as a veterinary authority. Organize facts and patterns, then escalate when appropriate.
- Do not lock basic logging, timeline access, or export rights behind a paywall.
- Version 1.0.0 has no ads, trial expiry, subscriptions, or paywalls. All implemented local features are included without a purchase. Android uses `com.draco.arts.apps.bark.log.dogs.journal`.
- Keep Home as the most polished and highest-priority screen in the app.
- Use `Inter` 400 and 500 only, BarkLog design tokens only, and no decorative gradients or shadows.
- On native devices, supported AI actions use a downloaded on-device ONNX model first. Model files are optional and separate from WatermelonDB care records. Do not preload models on Home or automatically download them.
- Firebase Auth signs users in for optional Atlas fallback only. The local owner and care journal remain in WatermelonDB; there is no Firebase care-record sync.
- Atlas is the remote AI fallback when online and configured. Send a fresh Firebase ID token and BarkLog's own Atlas app ID to Atlas; never put AI provider keys or Firebase tokens in client configuration or local storage. Require Atlas context checks for generated health content.

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

- Task backlog lives in [tasks/README.md](tasks/README.md).
- `task025` mood check-in is completed locally and documented as the first Mood, Behavior, and Training slice.
- `task026` behavior logging is completed locally and documented.
- `task027` through `task030` provide local training content, screens, and session logging. Training AI from `task031` uses the optional Atlas adapter when configured.
- `task032` and `task033` describe the former cloud sync path, removed by `task051`.
- `task034` expanded offline log types is completed.
- `task035` AI Agent Center is available when optional AI is configured. `task036` deterministic health and behavior summaries remain available offline.
- `task037` static free training program rotation is completed.
- `task038` local vet report export remains; cloud share links were removed.
- `task039` household sharing and sitter mode were removed.
- `task040` Safety Center offline pack is completed.
- `task041` care calendar and refill planning is completed with `/care-calendar`, local `care_tasks`, opt-in reminders, and Home/Profile entry points. Smart automation is not implemented for v1.0.0.
- `task042` Photo Baseline Tracker is completed at `/photo-baselines` with local `photo_baselines` and Home/Profile entry points. Photo compare is not implemented for v1.0.0.
- `task051` rebaselines care data and native builds as local-only. `task052` adds optional Firebase sign-in for Atlas AI; `task053` adds the first on-device AI model path; `task054` adds optional local journal conversation and photo captions. Cloud sync, backup, restore, and sharing remain unavailable.
- Native local Ask AI is available without Firebase when its optional model is downloaded. Atlas-backed AI routes are hidden without BarkLog Firebase/Atlas identifiers and in production until Atlas supports this free release and passes BarkLog context checks.
- Mood and behavior logging, training enrollment/progress/sessions, multi-dog, trends, and other implemented local features are included in v1.0.0. RevenueCat purchase UI is off.
- The deterministic weekly training rotation remains as a featured program; the full local training catalog and progress tracking are included in v1.0.0.
- Manual CSV and PDF exports remain free. Losing or deleting the device data loses the journal unless the caregiver exported a copy.
- Safety Center is a free offline-first safety surface at `/safety`, with `/safety-center` as an alias. Urgent actions, first-aid basics, core toxicity lookup, and the local emergency card must not be Premium-gated.
- Photo Baseline Tracker is free local recordkeeping. It organizes owner-observed visual references only; the unimplemented photo-compare upsell is hidden.

## Current Repo Notes

- The repo still contains legacy prototype code and docs from the earlier stack direction.
- `pnpm check-types` is the current reliable validation baseline.
- `pnpm lint` may still report inherited debt outside the touched slice.
- `pnpm web` remains useful for flow visibility, but it is not a substitute for the canonical BarkLog mobile architecture.
