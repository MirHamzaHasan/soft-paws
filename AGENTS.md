# Soft Paws KMP Agent Guide

## Latest owner direction · 20 October 2026 · Soft Paws task001

This workspace is **Soft Paws**, a separate cat-care app based on BarkLog's KMP
foundation. The owner explicitly selected `https://github.com/MirHamzaHasan/soft-paws.git`
as its repository. Never push this workspace to the BarkLog repository.

The owner requested the same feature range redesigned for cats using Ungenerated,
Mobbin MCP and Rive. The new live board is `design/soft-paws/`; the original
`design/board/` and previous task approvals are inherited references, not approval
of a Soft Paws screen. The owner explicitly approved the complete Soft Paws
direction for the native Android/iOS port on 20 October 2026. Implement that
approved board in shared Compose; do not request the same approval again.

Later in this review the owner requested another Mobbin pass and a more joyful,
colourful palette for the cat app. This supersedes the initial paper/moss palette:
warm cream, an apricot cat card, teal primary actions and stable care-category
colours (butter meals, lilac litter, mint play, rose notes, sky water, periwinkle
sleep). Keep the reviewed layouts, original cat, clear borders and accessible
light/dark pairs. `design/soft-paws/css/tokens.css` and `js/color-roles.js` are the
colour source; regenerate Compose via `python3 tools/soft_paws_tokens.py`.

The reported iOS XCTest crash was in Compose accessibility disposal. The iOS
dependency graph now uses renderer/foundation/runtime 1.12.2 and matching
Material3; shared/Android retain the compatible 1.10.3 baseline. The official
CMP-10615 fix is present and the core/repeated-accessibility/tap tests pass.
Keep accessibility enabled. Do not align Android to the newer iOS renderer
without a separate Android toolchain/API upgrade: it requires API 37 / AGP 9.1.
Xcode now uses ignored `.verify-build/shared` framework outputs, matching the
isolated Gradle checks and avoiding inherited BarkLog build-cache paths.

- Read `docs/source-of-truth/soft-paws-product-engineering.md` and
  `tasks/soft-paws-task002-native-port.md` first.
- Start visual work with Ungenerated `app-design-workflow`. Use actual Mobbin MCP
  references for flow research, with source links; do not copy other apps' artwork.
- Original Soft Paws cat: Rive file **2667919**. Editable SVG, motion source,
  real `.riv` / `.rev` exports and manifest: `design/soft-paws/assets/cat/`.
  Never modify inherited BarkLog Rive files for Soft Paws.
- Shared Compose, domain/data separation, local SQLDelight persistence, committed
  save feedback, accessibility, reduced motion and truthful safety remain required.
- Cat care includes meals, water, litter (urine/stool observations), play/movement,
  sleep, behaviour, grooming, weight and notes. Dog-specific clinical copy and
  assumptions must not be carried over through blind global text replacement.
- Use `com.draco.apps.soft.paws` for the separate Android/iOS app containers.
  Never install over BarkLog or reuse its private service registrations. Own
  Firebase/billing configuration remains deferred; local care must run safely
  without it. Preserve all existing device journals and drafts.
- No real AI retries, billing transactions, new service configuration or uploads
  of journal/photos are authorised by this redesign. Retain the inherited gates.
- First cat's care, existing records, on-phone reports, raw CSV and direct saved
  emergency contacts stay free. Additional cats, AI, nearby search and premium
  outputs retain the base's boundaries; proposed prices are shown honestly.
- Mark feature delivery and visual approval separately. A prototype screen is
  never proof that a new native cat feature exists.

The following BarkLog guide is historical base context. Soft Paws direction above
and later explicit owner instructions take precedence over its product identity,
dog wording, references and previous screen approvals.

---

# BarkLog KMP Agent Guide

## Latest owner direction · 20 October 2026 · task046

Adding another dog, AI, AI toxicity lookup, personalized AI Safety topics and
nearest-vet search are Premium. The first dog's journal, existing profiles/data
and direct emergency contact access remain free. "What are you seeing?" stays
free and leads to saved veterinary contacts, including suspected poisoning.
Add "Train your dog" as Premium / Coming soon, never an available training claim.
Approved USD recurring plans: $2.99/week, $6.99/month and $39.99/year. RevenueCat
is selected; the owner explicitly deferred keys/IDs/store configuration. Prepare
the integration without enabling transactions or fabricating entitlements in
unconfigured builds. Explicit preview access must remain separate from real
RevenueCat access and unavailable in Release. Preserve all existing dogs/drafts.
Verified country-specific animal-service numbers, optional in-context location
and a free-to-integrate worldwide map-based vet search are authorized. Manual
region/place entry and denial/offline handling are required; never invent a
national vet number or advertise guaranteed worldwide clinic coverage. See
tasks/task046-premium-safety-and-nearby-vets.md for requirements and actual proof.
The owner subsequently deferred another live AI recheck; do not keep retrying it
unprompted. Preserve the existing Release server-policy/live-proof gate.

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
  Basic logging, timeline, on-screen reports and raw CSV remain free. The later
  task033 owner request below supersedes free PDF/print/sharing; real billing is
  still disabled and prices remain undecided.
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
- Android ID: com.draco.apps.bark.log.
  iOS ID: com.draco.apps.bark.log. Do not change identity casually.
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

## task033 Premium outputs authorization · 2026-10-17

The owner requested restoration of the existing “Ask about {dog}” Home menu,
free on-phone report reading with Premium PDF/sharing, other useful paid outputs,
and KMP Android/iOS photo-video highlight research/feature work before finalization.
This supersedes earlier free-PDF/all-local-features-free statements for report
and Memory Book PDF/print/sharing. Preserve free care tools, mobile previews,
raw CSV and all existing data. Reuse existing approved native screens for gates;
review the new video editor/flow on the board before its native UI/encoder slice.
Demo Premium remains explicitly local, not a purchase entitlement. Do not enable
billing, set prices, upload photos or activate Atlas merely because outputs are gated.
See tasks/task033-premium-outputs-and-home-entry.md and
docs/product/premium-features-and-video.md for scope and actual delivery status.

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

## task028 simulator review · 2026-10-17

The owner now requested checking both platforms in simulators. This supersedes
task027's earlier no-launch constraint for this review. Reuse owned QA devices,
update apps in place, preserve journals and record actual runtime evidence.
The owner then selected manual review: leave both displayed apps open and stop
background UI navigation for that handoff.

## task029 mascot feedback · 2026-10-17

Owner feedback on 2026-10-17: the dog mascot must remain on a clean transparent
ground during interaction. Do not add a rectangular tap/hover tint behind it;
use the character's own response. See task029 and the finalization checklist at
`docs/release/finalization-checklist.md` for current integration prerequisites.

## task030 mascot preview · 2026-10-17

The owner installed Glaxnimate on 2026-10-17 and started task030's free/open-source
mascot authoring/preview proof. `design/board/refinements/mascot-studio/` contains
editable sources and a checked review preview. Its CLI exports/renders work;
Glaxnimate GUI accessibility inspection crashed in Qt, so avoid that inspection
path. Do not disable OS accessibility/security to work around it. New native
mascot art/playback remains a subsequent reviewed slice; no Compottie dependency
was added by task030. Keep the mascot workflow free of paid export/branding needs.

## task031 Rive study · 2026-10-17

The owner subsequently selected Rive, installed its macOS editor, verified MCP
and explicitly requested a better dog test, allowing new artwork. This supersedes
task030's free-only authoring constraint for this study. The original spaniel,
editable cloud design, local SVG/motion/rebuild sources and exported-player
preview live in `design/board/refinements/rive-dog/`. The current workspace's
runtime export includes Rive's required intro splash; editable `.rev` backup was
refused by its plan and must not be represented as delivered. No plan/account
settings or branding restrictions were bypassed. Native adoption is a later
reviewed KMP slice; no Rive SDK was added to Android or iOS by task031.

## Validation

- python3 tools/verify.py --metadata-only
- python3 tools/verify.py
- python3 tools/verify.py --ios (macOS; Debug and Release simulator hosts)
- Targeted JVM tests and platform/device journeys from docs/validation.md.

Open iosApp/iosApp.xcodeproj with the iosApp scheme. No Expo prebuild, CocoaPods,
Metro, Node or API credential is needed. Signing and physical-device/store QA
remain separate from simulator compilation. Do not claim speed gains without profiling.


## task032 native Rive authorization · 2026-10-17

The owner activated Cadet on Draco Arts Studios and explicitly requested export
and application integration of the liked spaniel. The paid studio copy is file
2660676, project2025006. Task032 uses the official clean runtime export and an
editable .rev, with official native Android/Apple runtimes behind shared Compose.
This supersedes task031's prototype-only/old-workspace limitation for this slice.
Keep the dog transparent on press, a same-art reduced-motion/failure fallback,
quiet shuffled idles and save feedback strictly after local commit. Rive is an
authoring/rendering dependency; no product billing or real service is enabled.

Task032 uses Compose Multiplatform 1.10.3 specifically for its supported transparent
UIKit overlay API; the prior 1.9.3 under-canvas interop could not blend the live
mascot over cards. Android/iOS Debug/Release and current native mascot checks pass;
see docs/design/evidence/task032/README.md. Physical/assistive and task022's
individual screen review gates remain open. Do not infer full board parity.


## 17 October video approval and chat correction

The owner approved the task033 video editor/offer for native KMP implementation
(task034). Photo editing/preview stay free; MP4 export/share use the demo Premium
boundary until real entitlements exist. Reuse the approved `next-chat` design with
compact controls; the owner rejected the simplified large-button native chat.


## task036 Firebase Authentication authorization · 18 October 2026

The owner selected the downloaded Firebase registrations and changed both build
identifiers to `com.draco.apps.bark.log`, then requested real Firebase Authentication.
This supersedes the old application identifiers and demo-only auth constraint.
Implement native Google/Apple/email-link authentication behind shared boundaries;
Firebase SDKs own secure credentials. Never authenticate a saved demo identity.
The owner initially reported no providers enabled. Google was subsequently observed
enabled in the console, and its refreshed iOS config/callback scheme were installed.
Both Google OAuth configs and the current Android debug certificate are now
verified locally. Live provider success, Apple/email configuration, release signing
and signed-device testing remain separate gates.
The journal remains local/usable without an account. AI replies, Premium access,
billing and Atlas retain their existing demo/disabled boundaries. No Firestore,
Storage uploads, analytics or journal sync is authorized. Existing installations
with the old app IDs remain separate; never uninstall them to test these builds.
See tasks/task036-firebase-authentication.md and docs/product/firebase-authentication.md.

## task037 local AI authorization · 2026-10-18

The owner requested real on-device text/photo models with Atlas text fallback
while local inference is unavailable, and explicitly approved Android API 26 /
iOS 16.6 minimums. Task037 replaces normal demo replies with Llamatik GGUF adapters
and an authenticated Atlas client. Downloads/scene captions/cloud processing are
explicit choices; no photo upload or automatic model load/download. Release Atlas
stays disabled until server admission/context approval and live signed proof.
Server credentials remain server-only; a console registration uses safe secret
references, never private JSON. See tasks/task037-local-ai-and-atlas-fallback.md
and docs/product/local-ai-and-atlas.md for actual verification, remaining gates
and the superseding scope. Billing stays disabled.

The owner then downloaded Qwen and explicitly requested automatic current-dog
context for local answers, without manually attaching records. Local AI uses the
profile and bounded recent/relevant saved care observations automatically after
AI opt-in, and answers general dog-care/health education even without logs. This
does not authorize diagnosis/prescribing or automatic Atlas sharing: cloud
profile/record choices remain separate and automatic local sources cannot leak
through conversation history. See task037's actual tested coverage.

Live local-AI review refinement: the installed Qwen file was confirmed in the
owned iOS app, while the displayed separate design fixture still selected the
demo provider. Debug hosts now accept an explicit `LiveAIReview` option to use
the real provider with that existing review journal. Default deterministic
fixtures stay demo; normal app mode stays real. The fixture database, downloaded
model, existing messages and the separate normal journal are preserved. Fixture
Firebase/Atlas access remains disabled. No data is copied between journals.

## task038 grounded chat refinement · 2026-10-18

The owner requested RAG-style local dog context: correct saved dog identity and
owner relationship, relevant saved logs, question-first answers and readable recent
care readings. Implement local SQLite retrieval/grounding without automatic cloud
sharing or new model downloads. Exact facts/counts are database-derived and labelled
honestly; observations never establish a health condition. Preserve the existing
chat composition. Review the new graphical recent-care card on the board before
its native UI, retaining the existing design review gate. See task038.

## task039 Atlas-only direction · 2026-10-18

The owner then explicitly stopped local LLM/RAG work, holding it for a later
larger-model evaluation, and selected Atlas-only chat now. This supersedes the
on-device-first routing above. Normal chat uses Atlas with explicit cloud consent,
fresh Firebase identity and existing server policy receipts. Do not create/load
local runtimes, offer model downloads or photo-model inference in the active flow.
Preserve installed models/journals and historical source labels. Task038's card
was approved but is paused before native implementation; do not resume that work
unprompted. Default design fixtures remain labelled demos. Release Atlas stays
gated pending approved server support and authenticated proof; choosing Atlas-only
does not install credentials or authorize automatic whole-journal uploads.
See tasks/task039-atlas-only-chat.md.


## task040 email/password direction · 2026-10-18

The owner replaced the default email-link flow with ordinary email/password
sign-in and an explicit Create account action. Use native Firebase password APIs
behind the shared Authentication boundary; never save/log passwords or hardcode
QA credentials. Existing link callbacks remain compatible. Preserve local care,
Google/Apple sign-in and Atlas identity/context gates. See task040 for proof.

## task041 answer cards and automatic weekly context · 2026-10-19

The owner likes the compact chat shell/text style and requested clearer answer
cards, question-relevant prior-log cards and space for later contextual dog
products. Show the new response/consent design on the board before native UI.
No Amazon integration, live products, prices or links are authorized in this phase.

The owner further requested the current dog's name/profile and the past seven
days automatically with every question. This supersedes manual per-record context
selection for the new flow after explicit consent to this scope; do not silently
broaden previously saved consent. Preserve current-dog isolation, bounded truthful
scope, fresh Firebase identity, server policy checks, local journal access and
Release gating. No whole-journal/photo upload or resumed local LLM/RAG work.
Use BarkLog AI throughout product UI/errors/exports; Atlas is internal only.
The board direction was accepted. Shared native implementation now uses versioned
reconsent, fresh seven-calendar-day SQLite snapshots, exact counts and bounded
source excerpts; see task041 and its native evidence for actual verification.

## task042 soft interaction sounds · 2026-10-19

The owner accepted the task041 direction (“ok great”), requested ASMR-like button
sounds, then delegated the texture choice (“do what are best”). This authorizes
the retained card design and native sound/settings slice. Soft wood at 35% is the
selected texture; sounds remain off until enabled and adjustable. Preserve the
card/chat design. Typing, scrolling, loading and AI generation stay silent.
Save sounds must follow committed local writes. Never bypass silent mode or
let audio block care logging. No paid sound service/library or telemetry is needed.
Bundled original PCM clips play through Android SoundPool and Apple ambient
AVAudioPlayer adapters behind the shared coordinator. Keep one voice, repeat
guards, mute/background/interruption cleanup and failure isolation. Use the named
`park-ai-cards-v1` review database for synthetic card/audio checks; preserve all
normal and older review journals. Native/physical claims require their own evidence.


## task043 additional-dog profile · 2026-10-19

The owner requires the same full dog-information onboarding when adding another
dog. Reuse the approved dog/profile/reminder questions, start independent facts,
preserve the existing dogs and keep an unfinished additional-dog draft separate
from first-run/profile-edit setup. Only create/select the dog on final confirmation.
Do not repeat account/plan setup or inherit another dog’s AI consent/history.
See tasks/task043-additional-dog-onboarding.md for implementation and verification.


## task047 new plan companion authorization · 20 October 2026

The owner approved the new original notebook puppy and the reviewed plan reveal,
paywall and account-plan designs for Android/iOS (“Use this new Rive on mobile”).
Use file 2667617's clean runtime and same-art still on these three shared Compose
screens; preserve Home's original spaniel. Keep bounded greetings/page-turn
reactions, transparent interaction, reduced-motion and lifecycle fallbacks. Retain
RevenueCat configuration/entitlement guards, visible full prices and free journal
access. Pet food scanning/recall monitoring is a clearly unavailable future Premium
feature (task048), not authorized service implementation. Live AI rechecks and
real store configuration remain deferred by the owner.
