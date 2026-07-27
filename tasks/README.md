# BarkLog Tasks

This folder contains the execution backlog for taking BarkLog from the current repo state through production readiness and into the next product feature modules.

`task001` through `task015` capture the completed prototype-completion backlog. `task016` through `task024` capture the production-hardening blockers that must be resolved before BarkLog should be treated as launch-ready. `task025` through `task044` capture post-hardening product modules and local native build blocker removal. `task045` through `task048` capture signed release-build execution, external environment gates, and store submission readiness. `task049` captures release-blocking production feedback and error-handling hardening across core launch flows. `task050` captures the optional, consent-based signup contact-preference slice for opted-in onboarding support and product updates.

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
- EAS project linking and profile lockdown `task045` is in progress.
- Release environment and Supabase gates `task046` are in progress for local boundary checks and still externally gated for service-dashboard evidence.
- Preview builds and native device QA `task047` are in progress for local capability checks and still externally gated for signed build/device evidence.
- Production builds, store submission, and rollback `task048` are in progress for the local production-readiness guard and still externally gated for signed production builds and store evidence.
- Production feedback and error handling hardening `task049` is in progress with local implementation and automated validation complete; it still blocks production sign-off until manual iOS Simulator smoke confirms core launch flows use consistent toast, inline error, safe-copy, haptic, retry/status, and observability behavior.
- Consented signup contact preferences `task050` is completed locally with optional post-signup capture, explicit consent, Supabase-only PII storage, routing updates, safe telemetry, privacy docs, and targeted validation.
- `corepack pnpm release:check-local` now bundles the local release gates before the external EAS, service-dashboard, native-device, and store-submission steps.
- Local native build blockers are complete, but BarkLog is not release-signed until `task045` through `task049` are completed with preview-build, service-dashboard, native-device, production-build, store-submission, rollback, and production feedback/error-handling evidence.
