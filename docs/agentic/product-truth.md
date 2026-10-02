# BarkLog Product Truth

## Canonical Source

- Canonical spec: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)
- If any older BarkLog document conflicts with the canonical spec, the canonical spec wins.

## Current task051 and task052 rebaseline

BarkLog needs no account for journaling. WatermelonDB is the sole journal store. All care records stay on this device; free CSV and PDF exports are the only external copy. Uninstalling the app or deleting its data removes the journal. RevenueCat uses a stable local owner ID. Optional Firebase email/password sign-in enables Atlas AI only. An AI action sends selected summarized context to Atlas, which must enforce a BarkLog context policy; Firebase credentials stay in memory. Training content ships in the app. Native builds use local Expo prebuild, Gradle, and Xcode. Older Supabase and AI descriptions below document former plans and are superseded by this section.

## Product Summary

- Product: `BarkLog`
- Tagline: `Daily dog health, in one tap.`
- Category: software-only dog health companion app
- Platforms: iPhone and Android
- Primary audience: US-based Millennial and Gen Z dog parents
- Secondary audience: senior-dog owners managing medications or chronic conditions

## Product Goals

- Make daily dog-health logging faster than memory.
- Turn event history into useful, non-diagnostic health observations.
- Give dog parents a trustworthy emergency and toxicity safety net.
- Produce clean, vet-friendly reports and exports.
- Offer a premium tier around leverage and intelligence rather than basic care.

## Non-Negotiable Principles

1. One-tap obsessed. Daily actions should fit within three taps.
2. Dog-only. No multi-species abstractions.
3. Local-only logging. Events save to WatermelonDB without a network.
4. No medical advice. BarkLog observes patterns and organizes facts.
5. Data freedom. CSV and PDF export stay available to users.
6. Fast over fancy. Logging latency matters more than ornamental motion.
7. Notifications are sacred. Only medication reminders and anomaly alerts by default.

## Core Product Pillars

### One-Tap Logging

- Prioritize `Poop`, `Pee`, `Meal`, and `Walk` on Home.
- Keep a scannable same-day summary visible.
- Use long-press or detail screens for deeper event fields.
- Keep Mood and Behavior as free logging extensions that add context without slowing the core loop.

### Health Intelligence

- Weekly AI narratives summarize patterns, deltas, and streaks.
- Symptom logging converts vague owner language into structured signals.
- BarkLog AI is assistive and context-aware, but never diagnostic.
- The AI Agent Center is the Premium hub for specialist agents. Free users can browse agent descriptions, while invocation is gated behind RevenueCat and Supabase Edge Functions.
- The implemented Premium care-summary suite uses `generate-care-summary` for weekly health, monthly health, mood, behavior, medication, nutrition, expense, and training summaries.
- Premium Vet Prep reports use `generate-vet-report` for factual visit summaries and questions. Free manual PDF/print export remains available.

### Safety and Emergency

- Toxicity lookup must feel sober, specific, and high-trust.
- Emergency surfaces foreground poison-control and emergency-vet actions.
- First-aid content must remain available offline where possible.
- Safety Center is the free offline-first safety hub at `/safety`, with emergency actions, local emergency card, first-aid basics, CPR timer entry, core toxicity lookup, safe transport checklist, and source/version metadata.

### Lifetime Record

- Timeline is the factual truth surface.
- Vet Visit Prep is the professional export surface.
- Secure vet share links are Premium, time-limited, revocable, and served through `/vet-share/[token]` after token-hash lookup.
- Household sharing is Premium cloud collaboration with role permissions, sitter expiration windows, shared care handoffs, and shared-dog sync scoping through `/household`.
- Memory Book and Expense Tracker support retention and long-term care value.
- Expanded offline care logs now cover water, rest, vomit, cough/sneeze, mobility, appetite, dental, parasite prevention, and vet visits as free raw records with manual export support.
- Care Calendar is implemented at `/care-calendar` as a free local planning surface for refills, preventives, grooming, vaccinations, vet follow-ups, training practice, and custom care tasks.
- Photo Baseline Tracker is implemented at `/photo-baselines` as a free local visual-reference record for owner observations. It does not analyze photos or diagnose conditions.

### Mood, Behavior, and Training

- Mood check-ins capture emotional and energy context as part of the free care record.
- Behavior logs capture incidents, triggers, intensity, duration, and context without diagnostic language.
- One static training program is free each ISO week in read-only mode.
- Training progress tracking, enrollment, sessions, analytics, sync, and personalization are premium guided plans built on positive reinforcement and local-first progress tracking.
- Training session logs save both a `training_sessions` record and a matching Timeline event before sync.
- Personalized training insights must use Supabase Edge Functions and remain supportive, short, and non-diagnostic.
- The implemented training insight path is `generate-training-insight`, which receives summarized behavior, mood, session, and enrollment context after RevenueCat premium gating.

## Business Model

### Free

- 7-day full trial
- one dog
- offline local logging
- timeline access on this device
- manual CSV and PDF export
- urgent safety tools
- Safety Center offline pack, including core toxicity lookup, first-aid basics, poison-control actions, and local emergency card
- local Care Calendar tasks, medication refill planning, and explicit opt-in care task reminders on this device
- local Photo Baseline Tracker records for dated visual references on this device
- one deterministic free weekly training program in read-only mode

### Premium

- `$5.99/month`
- `$49/year`
- unlimited dogs
- AI insights
- AI chat
- PDF vet reports
- monthly trends
- photo compare
- memory book
- expense tracking
- guided training programs
- personalized training insights
- cloud sync, backup, restore, household sync, and share links are Premium per the best-in-market monetization plan
- The implemented sync boundary uses `SyncCapability`: free and loading states stay local-only, while Premium can pull, push, and restore cloud data.
- The implemented sync status UI makes this explicit across Home, Timeline, Settings, Profile, and `/sync-backup`: free users see "Saved on this device" plus export reassurance, while Premium users see backup, restore, retry, and last-sync states.
- Deeper expanded care-log summary depth remains Premium future work; raw expanded logs stay free and local-first.
- AI Agent Center access is Premium. The implemented route is `/ai-agents`, with locked free cards, data-readiness states, and allowlisted Edge Function routing.
- Generated care summaries are Premium. The implemented Insights cards show locked previews to free users, use local data-readiness checks for Premium users, and never call AI from the client.
- Static free training rotation is implemented in `/training`: free users can read one weekly program, while all tracking actions open the Training Programs Premium gate.
- Advanced vet reports and secure share links are Premium. The implemented Vet Prep upgrade preserves free manual export, gates generated summaries/share links, and resolves public links through `resolve-vet-share-link`.
- Household sharing and sitter mode are Premium. The implemented collaboration path uses `/household`, `/household/invite/[token]`, hashed invite tokens, Supabase RLS helpers, and shared-dog sync scopes.
- Future cloud-synced safety packets may be Premium, but urgent safety actions and local offline safety content remain free.
- Smart care automation is Premium. The implemented `care-automation` gate covers care calendar sync, household coordination, and future AI-generated checklists while preserving free local planning.
- Photo compare, cloud backup, future AI photo summaries, and future share-link inclusion are Premium. The implemented Photo Baseline Tracker keeps raw records free and local-first.

## Target Technical Truth

- Expo + React Native + TypeScript
- Expo Router for file-based navigation
- Tamagui for styling
- Zustand for UI and local interaction state
- TanStack Query for server state
- WatermelonDB for offline-first local persistence
- Supabase for auth, database, storage, and Edge Functions
- RevenueCat for subscriptions
- AI providers only through Supabase Edge Functions; text defaults to DeepSeek and future vision keys are OpenAI-only server secrets
- Expo Notifications for reminders and anomaly alerts
- Mixpanel and Sentry for telemetry and observability

## Delivery Priorities

1. Foundation and auth
2. Home and one-tap logging
3. Timeline and sync
4. Weekly dashboard and AI insight generation
5. Safety surfaces
6. Premium gating and subscription flows
7. Multi-dog, memory, and expense expansion
8. Mood, behavior, and training expansion
9. Care calendar and refill planning
10. Photo baseline tracker
11. Low-cost AI provider migration and vision-ready server key boundary

## Accessibility and Safety Baselines

- WCAG AA contrast
- 44x44pt minimum touch targets
- Dynamic Type support
- color is never the only meaning carrier
- no diagnostic copy
- emergency escalation stays explicit and prominent
