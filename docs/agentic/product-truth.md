# BarkLog product truth — KMP rebuild

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
AI, legacy RN import and store release remain unimplemented.

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
Android: com.draco.arts.apps.bark.log.dogs.journal. iOS: com.dracoarts.barklog.

Safety content must organize observations and escalate, never diagnose/prescribe.
Native reminders are opt-in; saves work after denial. Future AI downloads are
optional and loaded only when used; Atlas/Firebase is deferred and cannot sync
care records or enable Release fallback without approved context checks.

The old working tree/configuration remains in a recoverable sibling backup.
The new app does not automatically read old journals. Use migration/export
planning before updating an installed app containing valuable records.
