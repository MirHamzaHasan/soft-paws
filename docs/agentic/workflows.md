# BarkLog Delivery Workflows

## Canonical Source

Start every BarkLog task by reading:

1. [product-truth.md](./product-truth.md)
2. [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

If repo-local notes or older design docs disagree with the canonical spec, follow the canonical spec.

## 1. Foundation Workflow

Use this for stack setup, environment setup, data-layer setup, and project scaffolding.

1. Confirm the relevant source-of-truth sections:
   - tech stack
   - file structure
   - database schema
   - environment variables
2. Deliver the foundation in this order:
   - Expo + TypeScript + Expo Router
   - Tamagui token setup
   - Supabase client and migrations
   - WatermelonDB schema and local persistence
   - auth bootstrap
   - shared UI primitives
3. Do not start premium, AI, or safety features before their shared infrastructure exists.

## 2. Screen Workflow

Use this for any BarkLog screen implementation.

1. Confirm the screen ID and route from the canonical spec.
2. Start with the primary action on the screen.
3. Define the same slice before coding:
   - happy path
   - empty state
   - loading state
   - error state
   - offline behavior
   - premium / free behavior
   - accessibility labels and target sizes
4. Reuse shared primitives before creating screen-local wrappers.
5. Keep routine flows tap-first and detail second.

## 3. Logging Workflow

Use this for Home and event logging surfaces.

1. Treat Home as the highest-priority screen in the product.
2. Persist logs to WatermelonDB first.
3. Sync to Supabase in the background only when `SyncCapability` allows Premium cloud sync.
4. Support instant tap logging and long-press detail expansion where specified.
5. Include haptics and toast confirmation on successful save.
6. Mood and behavior logging are free care-record data and must not be premium-gated.
7. Expanded care logs for water, rest, appetite, mobility, dental, parasite prevention, vet visits, and owner-observed health notes are free raw records; generated summaries remain Premium.

## 4. AI Workflow

Use this for weekly insights, BarkLog AI chat, and AI-assisted summaries.

1. AI providers must only be called through Supabase Edge Functions.
2. Use the canonical prompt contracts from the source-of-truth spec.
3. Keep outputs warm, short, and non-diagnostic.
4. Escalate to SOS or vet-oriented guidance for emergency language.
5. Always preserve premium gating where defined.
6. Training personalization uses `generate-training-insight` with summarized behavior, mood, session, and enrollment context only.
7. AI Agent Center cards are browsable by free users, but every agent invocation must pass Premium checks and use approved Supabase Edge Functions.
8. Generated care summaries use `generate-care-summary`, must pass Premium checks, and must stay short, factual, and non-diagnostic.
9. Premium Vet Prep summaries use `generate-vet-report`, must pass Premium checks before model calls, and must output factual visit summaries plus discussion questions only.

## 5. Health and Safety Workflow

Use this for symptoms, toxicity, triage, first aid, emergency, and vet-report surfaces.

1. Define content source and trust boundary before UI work.
2. Keep copy bounded to observation, organization, and escalation.
3. Never frame outputs as diagnosis.
4. Keep urgent actions obvious and reachable.
5. Confirm what must work offline.
6. Vet reports must keep free manual export available; Premium-generated report copy stays factual, timestamp-aware, and non-diagnostic.
7. Safety Center offline pack content is free, local-first, source/version labeled, and must not route urgent actions through a paywall.
8. Photo baseline records are owner observations only. Do not describe photo changes as diagnosis or image interpretation unless a future approved Edge Function returns bounded, non-diagnostic summary copy.

## 6. Monetization Workflow

Use this for trials, paywalls, premium gates, entitlements, and plan management.

1. Preserve free logging, timeline access, and export guarantees.
2. Gate leverage, automation, and intelligence rather than basic care.
3. Keep entitlement checks centralized through RevenueCat.
4. Use the canonical plan and trial logic exactly as defined.
5. Training enrollment, training sessions, and personalized training insights are premium. Static browsing of training programs may remain visible to free users where the task specifies it.
6. Cloud sync, backup, restore, connected-device sync, and share links are premium. Free users keep local-only tracking and manual export.
7. Free users can read one deterministic static training program per ISO week, but every tracking, session, sync, analytics, or personalization action routes to Premium.
8. Vet report share links are Premium because they depend on cloud-backed share state. They must support expiry and revoke behavior.
9. Household sharing, sitter mode, caregiver roles, and shared-dog cloud sync are Premium. Free users keep local single-owner tracking and manual export.
10. Smart care automation is Premium, but local care tasks, refill planning, and explicit opt-in reminders remain free on-device.
11. Photo Baseline Tracker raw records remain free on-device. Photo compare, cloud backup, future AI summaries, and sharing extensions are Premium.

## 7. Native Integration Workflow

Use this for notifications, Apple Health, Google Fit, camera, location, and device-specific behaviors.

1. Confirm timing, fallback, and permissions behavior first.
2. Keep notification volume intentionally low.
3. Treat health-data import as additive, not required for core value.
4. Keep logging useful even when integrations are unavailable.
5. Care task reminders must be opt-in per task and handle denied notification permission without blocking local saves.
6. Camera or image-picker capture must not be introduced without permission copy, store metadata, and fallback behavior. The current photo baseline slice stores local photo references only.

## 8. Validation Workflow

Run this before marking a slice complete.

1. `pnpm check-types`
2. targeted lint on touched files
3. relevant tests for changed logic
4. `pnpm web` for flow visibility when screen behavior changes
5. platform-specific validation when native integrations are involved

## 9. Mood, Behavior, and Training Workflow

Use this for task025 through task031 and later related work.

1. Keep Mood and Behavior as free, offline-first event types.
2. Treat Training as a premium module layered on top of event history, enrollments, and sessions.
3. Persist user-generated training progress locally before sync.
4. When logging a training session, create the session record and matching Timeline event as one local action.
5. Keep training content positive-reinforcement only.
6. Keep AI personalization behind Supabase Edge Functions and RevenueCat entitlement checks.
7. Never frame behavior or training outputs as diagnosis, treatment, or a replacement for a professional trainer, behaviorist, or veterinarian.
8. Task040 Safety Center offline pack is complete.
9. Task041 Care Calendar and Refill Planning is complete.
10. Task042 Photo Baseline Tracker is complete; create `task043` before starting the next feature slice.

## 10. Skill Routing Notes

- Use `$barklog-feature-workflow` for planning, slicing, and acceptance criteria.
- Use `$barklog-health-safety` for symptom, triage, toxicity, emergency, and vet-report work.
- Use `$barklog-monetization-engagement` for trial, paywall, reminder, and upgrade work.
- Use `$barklog-ios-android-readiness` for notifications, camera, health data, and permissions.

Use the repo-local Tamagui implementation skill for codebase discovery and implementation patterns. The canonical BarkLog spec is the source of truth for product decisions.
