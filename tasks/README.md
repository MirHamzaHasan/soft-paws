# BarkLog Tasks

This folder contains the execution backlog for taking BarkLog from the current repo state through production readiness and into the next product feature modules.

`task001` through `task044` record earlier product and engineering work. `task051` keeps the journal local in WatermelonDB and native builds local. `task052` adds optional Firebase sign-in for Atlas AI, without Firebase care sync. `task045` is superseded. Release tasks `task046` through `task049` require local signed artifacts, device QA, store submission, and production feedback checks. `task050` contact capture was removed by `task051`.

## Source of Truth

- Canonical spec: [../docs/source-of-truth/barklog-product-engineering.md](../docs/source-of-truth/barklog-product-engineering.md)
- Product summary: [../docs/agentic/product-truth.md](../docs/agentic/product-truth.md)
- Delivery rules: [../docs/agentic/workflows.md](../docs/agentic/workflows.md)
- Owner-friendly feature and roadmap status: [../docs/product/current-feature-status-and-market-roadmap.md](../docs/product/current-feature-status-and-market-roadmap.md)

## Naming Convention

- `task001-...`
- `task002-...`
- `task003-...`

Lower numbers are earlier in the critical path.

## Status Vocabulary

- `ready`: can start now
- `planned`: defined but blocked by earlier tasks
- `in_progress`: currently being executed
- `completed`: completed and validated

## Implementation Baseline

- Use the existing `Tamagui` styling foundation across all tasks.
- Do not introduce `NativeWind`, `Tailwind`, or a parallel styling system into execution work.
- Prefer extending existing Tamagui tokens, themes, layouts, and reusable primitives instead of replacing them.
- For `task016` and later, Tamagui is the implementation baseline. Older NativeWind or prototype-stack notes are not the execution source of truth.

## Current Execution Target

- Prototype-completion tasks `task001` through `task015` are completed.
- Production-readiness rebaseline `task016` is completed.
- Secrets, environment, and config hardening `task017` is completed.
- Automated test foundation and critical coverage `task018` is completed.
- Auth, trial, and data lifecycle hardening `task019` is completed.
- WatermelonDB to Supabase sync engine `task020` is completed.
- RevenueCat entitlements and premium enforcement `task021` is completed.
- AI safety, Edge Functions, and premium gates `task022` is completed.
- Native permissions, device QA, and export hardening `task023` is completed.
- Release preflight, observability, and store readiness `task024` is completed.
- Mood check-in event type `task025` is completed.
- Behavior log event type `task026` is completed.
- Training schema and model foundation `task027` is completed.
- Initial training program seed content `task028` is completed.
- Training hub and program detail screens `task029` are completed.
- Training session logger and timeline event integration `task030` is completed.
- Training AI personalization `task031` is completed.
- Premium sync and backup entitlement model `task032` is completed.
- Local-only free mode and sync status UI `task033` is completed.
- Expanded offline log types `task034` are completed.
- AI Agent Center `task035` is completed.
- Health and behavior summary suite `task036` is completed.
- Static free training program rotation `task037` is completed.
- Vet share link and report upgrade `task038` is completed.
- Household sharing and sitter mode `task039` is completed.
- Safety Center offline pack `task040` is completed.
- Care calendar and refill planning `task041` is completed.
- Photo Baseline Tracker `task042` is completed.
- Low-cost AI provider migration and vision-ready key boundary `task043` is completed.
- Native build blocker removal `task044` is completed.
- EAS project linking `task045` is superseded by `task051`.
- Release environment `task046` now covers local client-safe env, signing, and release artifact checks; remote backend gates no longer apply.
- Native device QA `task047` now uses locally built, signed Android and iOS artifacts.
- Production builds and store submission `task048` now use local Gradle/Xcode artifacts and manual store upload.
- Production feedback and error handling hardening `task049` is in progress with local implementation and automated validation complete; it still blocks production sign-off until manual iOS Simulator smoke confirms core launch flows use consistent toast, inline error, safe-copy, haptic, retry/status, and observability behavior.
- Consented signup contact preferences `task050` were removed because the app no longer has accounts or a contact-data backend.
- Remove Supabase and EAS for a local-only build `task051` is in progress. Automated gates and a disposable-key signed Android AAB/APK passed; offline device smoke and iOS validation remain before completion.
- Firebase sign-in and Atlas AI `task052` is in progress. Code and mocked tests pass; BarkLog Atlas registration, tested context policy, live signed-in flow, and paid-entitlement linkage remain before production release.
- `corepack pnpm release:check-local` bundles local environment, native capability, script lint, and TypeScript gates.
- BarkLog is not release-signed until local Android and iOS artifacts, device QA, store submission, rollback, and production feedback/error-handling evidence are recorded.
