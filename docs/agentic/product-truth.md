# Soft Paws · current product direction

This repository is now Soft Paws, a separate cat-care app based on BarkLog.
Read [Soft Paws product and engineering truth](../source-of-truth/soft-paws-product-engineering.md)
and [the redesign task](../../tasks/soft-paws-task001-cat-redesign.md) first.
The native implementation below is inherited BarkLog status; the new cat board
was approved for the native port on 20 October 2026. Task002 is implementing
the cat app with separate app identities. The colourful palette refinement is
in the board and generated native theme. Cat SQLite contracts, core screens and
the Android offline save/reopen journey are implemented. The iOS accessibility
crash reproducer now passes with the updated renderer; full native parity
remains in progress. Own service
registrations remain deferred.

---

**20 October task047:** the approved new notebook-puppy Rive and three plan/paywall/
membership compositions are implemented in shared Compose on Android/iOS. Scoped
native/build/data-preservation checks pass; physical/assistive and global parity
review remain open. Home keeps the spaniel. Store setup and live AI rechecks stay
deferred; the food scanner is Coming soon only. See [task047](../../tasks/task047-premium-plan-motion-design.md).

# BarkLog product truth — KMP rebuild

**20 October 2026 · task046 superseding direction (local implementation verified):**
Additional dog creation and AI Safety explanations are Premium. Approved USD plans:
$2.99/week, $6.99/month, $39.99/year. Native RevenueCat integration is authorized;
the owner will supply configuration later. Existing dogs/journals and emergency
calls stay available. Nearby-vet Maps handoff is Premium; guided training is Coming
soon. See [current contract](../product/premium-revenuecat-and-safety.md) and
[task046](../../tasks/task046-premium-safety-and-nearby-vets.md). Older billing and
undecided-price statements below are historical for this scope. Release AI gates,
no journal sync and all local data-preservation rules remain in force.


**Latest 18 October direction — task039:** Atlas-only chat. The owner stopped local
LLM/RAG work after approving the recent-care card; no native card was implemented.
No local runtime is constructed or loaded in the active flow, and no local model
or photo-inference controls are offered. Preserve installed files and journals.
Cloud processing still requires saved permission, real Firebase identity and
server policy admission. Automatic local context and old local/demo exchanges do
not become cloud history. Release Atlas is gated pending live authenticated proof.
Earlier on-device-first notes below are superseded; see task039 and the AI contract.


**18 October 2026 owner update:** both app IDs are now `com.draco.apps.bark.log`.
Task036 replaces demo sign-in with native Firebase Authentication. Google is enabled
and both downloaded Google OAuth configs are verified; other provider setup, live
sign-in and device review remain pending. Task037 now wires real optional local
text/photo models and an authenticated Atlas text client; verification is in progress.
Atlas server admission/context checks and live proof remain pending, Release fallback
is disabled. Premium remains a demo; billing and journal sync remain disabled. See
[Firebase Authentication](../product/firebase-authentication.md).

## Current owner override · 17 October 2026

Task033 restores the Home “Ask about {dog}” entry and makes report/Memory Book
PDF export, print and PDF sharing Premium. Mobile reports and raw CSV stay free,
as do existing journal/care tools. Earlier all-exports-free statements below are
historical for this boundary. Demo plan state is not payment; real services and
prices remain deferred. The owner approved photo-video highlights for native KMP in task034;
shared editing and local MP4 encoders are implemented, with validation in progress. See [current Premium plan](../product/premium-features-and-video.md).


Latest 2026-10-16 authorization: [task027](../../tasks/task027-native-companion-board-and-main.md) ports task024–026 into the
KMP app. The owner explicitly chose local demo sign-in and AI replies now; real
credentials are deferred. Structured dog context and conversations use SQLite
schema v4 with preserving v1/v2/v3 migrations. Prices remain undecided and real
purchasing disabled. No simulator run is requested; native visual/device QA is
still outstanding. Earlier board-only statements below describe prior scope.


Later 2026-10-16: the owner requested a new board-only direction with required
Firebase login, detailed onboarding/optional native access and Premium AI chat
and generated features. Prices stay undecided. See
[task024](../../tasks/task024-premium-ai-onboarding-board.md),
[task025 refinement](../../tasks/task025-light-and-flexible-dog-onboarding.md) and
[the proposal](../../design/board/premium/README.md). This replaces the earlier
design exclusion for that chapter; the implemented native free/local behavior
below and disabled integrations have not changed.

2026-10-14: the owner replaced the previous React Native app with a fresh project
based on Draco Kotlin Multiplatform. The canonical spec is
[barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md).

Current implementation: shared Compose screens for setup, Home, Timeline, detailed
logs, profiles/settings, health records, calendar, insights, offline Safety Center,
exports, training, private photos, expenses and Memory Book. The approved board's
kit foundation, Firm controls and animated dog are native, but the current web
board's exact type/compositions/states/continuity are not fully ported. The owner
reopened visual parity on 2026-10-16: see [task022](../../tasks/task022-exact-board-native-parity.md)
and its exhaustive screen-by-screen ledger. Functional coverage is not visual approval.
SQLDelight schema v4 preserves v1/v2/v3
journals and stores retained drafts. See [the native port](../native-board-port.md)
for source mapping, verification and remaining physical-device gates.
Task037 AI verification, legacy RN import and store release remain open.

Product decisions retained: free local dog journal, no account required, no ads,
trial expiry, purchases or paywalls. SQLDelight 2.1.0 owns local SQLite (schema v4).
No cloud journal sync/backup, sharing or remote vet links.
Home and one-tap Poop/Pee/Meal/Walk stay the primary loop.

Use KMP, Compose Multiplatform, Kotlin/Coroutines/Flow, Gradle and native Android/
iOS adapters. Match current-board Bricolage Grotesque 700/800 display/numbers and
Inter 400/500 reading (owner decision 2026-10-16), BarkLog colours/borders/spacing;
no decorative gradients/shadows. Native typography parity remains open until implemented.

The later 2026-10-16 [task023](../../tasks/task023-readable-care-and-native-motion.md)
request replaces Home's crowded icon chart with the owner-reviewed named/time
strip and animated Earlier/Latest controls. Shared KMP motion gains directional
tabs, Back uncover, tactile glyphs/stickers and selection feedback. This Home
revision does not rebaseline the rest of task022 or mark any screen matched.
Android: com.draco.apps.bark.log. iOS: com.draco.apps.bark.log.

Safety content must organize observations and escalate, never diagnose/prescribe.
Native reminders are opt-in; saves work after denial. Task037 model downloads are
optional and weights load only when used. Atlas needs explicit cloud consent and
Firebase identity; it cannot sync care records or enable Release fallback without
approved server/context checks. Android API 26 and iOS 16.6 are the approved floors.
See [local AI and Atlas](../product/local-ai-and-atlas.md).

The old working tree/configuration remains in a recoverable sibling backup.
The new app does not automatically read old journals. Use migration/export
planning before updating an installed app containing valuable records.

The owner added chat-local photos, vet call actions and a downloadable caregiver report on 2026-10-17 (task035). Up to three local images per message; demo AI cannot assess images. General medication education is allowed, while diagnosis, prescribing, doses and treatment remain veterinary decisions. Reports separate caregiver observations from optional unverified AI text and explicitly chosen images/records. No automatic sharing or medical upload.

Task037 owner refinement (18 October): downloaded local Qwen uses the current
dog's profile and up to 12 recent/relevant timeline observations automatically;
no manual record attachment is required for local chat. General dog-care
education does not require logs. Atlas still gets only explicitly allowed
profile/selected records, with automatic local-source history excluded when
unshared. Diagnosis, prescribing and clinical assessment remain excluded.

Task037 composer/performance refinement (18 October): Send clears the controller-owned
composer after SQLite commit and preserves failed/newer drafts. Full model integrity
checks use native streaming SHA-256; unchanged synthetic iOS text prompts measured
3.3–5.1 seconds versus 13.2–15.0 seconds before. Simulator samples do not establish
physical-device latency. See task037 timing and native composer evidence.

Task041/042 owner refinement (19 October): the approved compact BarkLog AI chat
now has database-derived weekly log cards, source excerpts and profile review.
After explicit versioned consent, each allowed question includes this dog's fresh
profile and today plus six preceding local days, ending at question time. Weekly
counts are exact; note excerpts are bounded and limitations visible. Old consent
does not expand silently. Internal Atlas IDs/receipts and disabled Release gate
remain intact. Local LLM/RAG remains paused; no products/affiliate links are active.

Optional interaction sounds use original bundled PCM and native adapters. The
owner delegated the texture: Soft wood at 35%, off until enabled. UI preferences
persist locally. Tap/selection cues follow activation; completion cues follow
successful SQLite writes. Typing, scrolling, loading and AI responses stay silent.
Audio failure cannot block an action or save. See task041/task042 for actual
simulator evidence and the remaining physical audio/accessibility gates.

19 October · task043: “Add another dog” reuses every dog-information question
from approved onboarding, with a fresh independent profile and a separate
SQLite draft that can be finished later. Only final confirmation creates the dog;
success selects their journal. Accounts, existing dogs and per-dog AI consent
remain separate. See [task043](../../tasks/task043-additional-dog-onboarding.md)
for actual verification status.
