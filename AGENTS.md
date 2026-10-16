# BarkLog KMP Agent Guide

## Start here

- [Canonical product and engineering spec](docs/source-of-truth/barklog-product-engineering.md)
- [Condensed product truth](docs/agentic/product-truth.md)
- [Architecture and file map](docs/architecture.md)
- [Delivery workflow](docs/agentic/workflows.md)
- [Engineering instructions inherited from the KMP base](docs/engineering-instructions.md)
- [Component registry](docs/design/components.md)
- [Fresh rebuild backlog](tasks/README.md)

The owner requested a fresh Kotlin Multiplatform rebuild on 2026-10-14. Earlier
Expo, React Native, Tamagui, WatermelonDB and pnpm instructions are superseded.
Old implementation status is not evidence that a KMP feature exists.

## Hard guardrails

- Use Kotlin Multiplatform, shared Compose Multiplatform UI, Coroutines/Flow and
  Gradle Kotlin DSL from the Draco KMP base. SwiftUI hosts shared Compose on iOS.
- Keep presentation, domain and data separate. AppContainer wires dependencies;
  ModuleRegistry owns startup and cleanup. Reuse the base where it fits.
- SQLDelight with local SQLite is the selected care persistence direction.
  Schema v4 and the repository are implemented, with preserving v1/v2/v3 migrations.
  Keep the existing database filename. Preferences are for UI settings only.
- Journal use requires no account, network or service credential.
- v1.0.0 is free: no ads, subscriptions, trial expiry, billing SDK or paywalls.
  Basic logging, timeline and CSV/PDF export must remain free.
- No cloud journal sync, backup, household sharing or vet share links.
- No new hosted analytics or paid integrations without the owner's request.
  Base auth/analytics/ads/purchases entries stay disabled; their providers were removed.
- Home is the highest-priority screen. Commit local writes before success feedback.
  Network, telemetry and model loading never block logging.
- Match the owner-selected current web board: Bricolage Grotesque 700/800 for
  display/numbers, Inter 400/500 for reading, BarkLog tokens and clear borders.
  No decorative shadows/gradients. The 2026-10-16 exact-board decision supersedes
  the earlier Inter-only rule; native font/layout parity is still task022 work.
- Organize caregiver observations; never diagnose or prescribe.
- Future reminders are explicit and opt-in. Permission denial must not block saves.
- Future AI uses explicitly downloaded on-device models first, loaded only on demand.
  Optional Atlas fallback requires fresh Firebase identity and context-policy checks;
  it is deferred and disabled in Release until approved server support exists.
- Android ID: com.draco.arts.apps.bark.log.dogs.journal.
  iOS ID: com.dracoarts.barklog. Do not change identity casually.
- Never uninstall or clear an existing device journal as a build troubleshooting step.
  The new KMP shell does not migrate WatermelonDB records; see migration notes.

## Implementation

Use [.agents/skills/kmp-template/SKILL.md](.agents/skills/kmp-template/SKILL.md)
for product implementation and integration changes. The old RN-specific skills
were retired with the previous app. Product safety/design rules are in the new docs.

Start with one task and implement its complete vertical slice: success,
loading/empty, offline, failure/cancellation, accessibility and native behavior.
Do not add fake repositories to make incomplete features look implemented.
Update task status and actual feature status together.

## Design skill routing

The owner selected [Ungenerated](https://github.com/iammirrr/ungenerated) for
visual design enhancement. Its 28 skills are installed in
`/Users/mirhamzahasan/.codex/skills/` at revision
`7e337c9e425c35e3096e3e4e858165a296a93f79`.

- For requested visual redesigns, start with `app-design-workflow` and select its
  relevant design, motion, interaction, accessibility and visual QA skills.
- Review the live board before implementing approved screens. Board HTML/CSS/JS
  is a design prototype only; production UI stays shared Compose Multiplatform.
- The canonical BarkLog spec overrides generic skill suggestions: retain BarkLog
  tokens, the current board font pairing, no decorative shadows/gradients, accessible controls and
  reduced motion. Do not introduce accounts, paywalls or subscription flows.
- The owner requested the current-screen redesign on 2026-10-14. The live
  prototype lives in `design/board/`. The complete current-screen direction and
  Firm interaction were approved on 2026-10-14 for task020's native port.
  The owner authorized all approved board product screens and local logic in
  task021 on 2026-10-15. See docs/native-board-port.md for mapping and evidence.
  On 2026-10-16 the owner rejected simplified native equivalents and selected the
  existing web board exactly, including typography. task022 and
  tasks/native-parity/ track every board screen/state/flow. Feature implementation
  is not visual parity: require paired board/native evidence and individual review.
  Future new directions still require review. Installing skills alone never
  authorizes a redesign.
  Later on 2026-10-16 the owner reviewed and liked task023's named Home care strip,
  then requested animated Earlier/Latest controls. That requested refinement
  replaces Home's stacked icon representation only; see
  tasks/task023-readable-care-and-native-motion.md. Keep the rest of the selected
  board and task022's individual evidence/approval gates intact.

## Later 2026-10-16 board direction

The owner subsequently requested a board-only proposal with required Firebase
login, richer onboarding, opt-in native permission flows and paid AI chat/features,
while retaining a usable free tier. This explicitly overrides the earlier
no-account/no-paywall design restriction for task024 and its task025/task026 refinements. Prices remain undecided by
the owner's reply. See `design/board/premium/index.html` and
`tasks/task024-premium-ai-onboarding-board.md` and
`tasks/task025-light-and-flexible-dog-onboarding.md` and
`tasks/task026-home-mascot-and-care-card.md`. The existing KMP app's free/local
behavior, disabled integrations and task022 reference remain unchanged. Do not
implement authentication, billing, network AI or new native screens from this
proposal until the owner reviews it and authorizes the native slice.

## task027 native authorization · 2026-10-16

The owner authorized the complete task024–026 chapter in shared Compose, backup
cleanup and pushing all accumulated work to main. This supersedes the board-only
restriction above. The owner then explicitly requested demo sign-in and demo AI
responses for this pass; real credentials are deferred. Label the demo honestly,
keep real care/context/conversations in SQLite, retain undecided prices and
unavailable purchases, and never treat a local demo identity as real Firebase auth.
No simulator launch is authorized for this pass; run noninteractive builds/tests.
Native visual parity and physical-device QA remain unverified. See task027.
Keep routine work in this project and ignored `.verify-build/` output. Do not
create additional sibling backup projects; use Git history for source checkpoints.
The owner requested removal of the earlier sibling backups and board archives.

## Validation

- python3 tools/verify.py --metadata-only
- python3 tools/verify.py
- python3 tools/verify.py --ios (macOS; Debug and Release simulator hosts)
- Targeted JVM tests and platform/device journeys from docs/validation.md.

Open iosApp/iosApp.xcodeproj with the iosApp scheme. No Expo prebuild, CocoaPods,
Metro, Node or API credential is needed. Signing and physical-device/store QA
remain separate from simulator compilation. Do not claim speed gains without profiling.
