# BarkLog

[![CI](https://github.com/MirHamzaHasan/bark-log/actions/workflows/ci.yml/badge.svg)](https://github.com/MirHamzaHasan/bark-log/actions/workflows/ci.yml)

> Daily dog health, in one tap.

BarkLog is an offline-first dog care companion for iPhone and Android. It helps dog parents log daily care quickly, keep a trustworthy timeline, prepare clean records for vet visits, and access carefully bounded safety tools—without requiring a wearable or other hardware.

> [!IMPORTANT]
> BarkLog organizes owner observations and care records. It does not diagnose conditions or replace a veterinarian. Urgent safety actions and local record access are never placed behind a paywall.

## Product status

BarkLog is code-complete for preview validation, but it is **not yet store-release signed off**. The local implementation and automated release gates are in place; EAS preview builds, service-dashboard verification, physical-device QA, store evidence, and final production feedback checks remain tracked in the release checklist.

- Product and engineering source of truth: [docs/source-of-truth/barklog-product-engineering.md](docs/source-of-truth/barklog-product-engineering.md)
- Current task status: [tasks/README.md](tasks/README.md)
- Release decision record: [docs/deployment/release-preflight-checklist.md](docs/deployment/release-preflight-checklist.md)
- Feature and roadmap overview: [docs/product/current-feature-status-and-market-roadmap.md](docs/product/current-feature-status-and-market-roadmap.md)

## What is included

- One-tap Poop, Pee, Meal, and Walk logging
- Detailed symptom, medication, mood, behavior, and expanded care logs
- WatermelonDB-backed offline persistence with Premium Supabase sync
- Timeline, event details, local CSV/PDF export, and vet-prep tools
- Medication reminders and a local care/refill calendar
- Free offline Safety Center, toxicity lookup, first-aid basics, and emergency actions
- Free local Photo Baseline Tracker for dated owner observations
- Static weekly training content plus Premium progress and personalization
- RevenueCat entitlement checks, Premium AI summaries, and Ask BarkLog AI
- Secure vet share links, household sharing, caregiver roles, and sitter mode
- Supabase migrations and Edge Functions with server-only AI provider access

The free tier preserves basic logging, on-device timeline access, manual export, and urgent safety tooling. Premium focuses on intelligence, automation, collaboration, and cloud-backed features.

## Tech stack

| Layer | Technology |
| --- | --- |
| App | Expo SDK 54, React Native, TypeScript |
| Navigation | Expo Router |
| UI | Tamagui with BarkLog design tokens |
| Client state | Zustand |
| Server state | TanStack Query |
| Offline data | WatermelonDB |
| Backend | Supabase Auth, Postgres, Storage, and Edge Functions |
| Subscriptions | RevenueCat |
| Notifications | Expo Notifications |
| Testing | Jest and React Native Testing Library |

## Getting started

### Prerequisites

- Node.js 20.19.4 or newer
- Corepack enabled
- Xcode for iOS development or Android Studio for Android development
- A Supabase project for authenticated and cloud-backed flows

### Install and run

```bash
corepack enable
corepack pnpm install
cp env.example .env.local
corepack pnpm start
```

From the Expo terminal, open an available simulator/device, or run a platform command directly:

```bash
corepack pnpm web
corepack pnpm android
corepack pnpm ios
```

WatermelonDB and other native modules require a development/native build for complete device behavior. The web target is useful for UI and route visibility, not as a substitute for native QA.

## Environment configuration

Copy `env.example` to `.env.local` and replace the placeholders with client-safe public values:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_APP_ENV=development
```

Only client-safe values belong in `EXPO_PUBLIC_*` variables. AI provider keys and Supabase privileged credentials must be configured as Supabase Edge Function secrets and must never be committed or shipped in the Expo client. See [docs/deployment/env-management.md](docs/deployment/env-management.md).

## Validation

Run the standard checks before opening a pull request:

```bash
corepack pnpm check-types
corepack pnpm lint
corepack pnpm test
corepack pnpm release:check-local
```

The full local release gate validates EAS/app identity, client/server secret boundaries, native capabilities, release scripts, and TypeScript. Signed builds, service configuration, native-device behavior, and store submission evidence are validated separately.

## Repository structure

```text
app/                  Expo Router route files
src/                  Features, UI, state, data, and services
src/db/               WatermelonDB schema, repositories, and sync
supabase/              SQL migrations and Edge Functions
assets/                App icons, splash assets, and Inter fonts
docs/                  Product, architecture, design, and release docs
tasks/                 Delivery backlog and acceptance records
test/                  Shared test helpers
scripts/               Validation and release checks
```

Generated `ios/` and `android/` projects are intentionally ignored and reproduced through Expo tooling. Local env files, build artifacts, caches, signing credentials, and Supabase CLI temp state are also excluded.

## Engineering guardrails

- Persist logs locally before attempting remote sync.
- Keep Expo Router files thin; reusable implementation belongs in `src/`.
- Use Tamagui and BarkLog tokens—do not add a parallel styling system.
- Keep free logging, timeline access, export rights, and urgent safety tools available.
- Route every AI provider call through a Supabase Edge Function.
- Keep health narratives factual, non-diagnostic, and escalation-aware.
- Treat Home and the one-tap logging loop as the highest-priority surfaces.

Start with [AGENTS.md](AGENTS.md) and the [developer guide](docs/developer/developer-guide.md) before making implementation changes.

## License

Released under the [MIT License](LICENSE).
