# Soft Paws task001 · repository and cat-care design

Owner request · 20 October 2026: this is Soft Paws, a separate app based on the
BarkLog foundation. Link its own GitHub repository first, retain the function
range for cats, and complete the screen redesign using Ungenerated, Mobbin MCP
and Rive.

## Scope and status

Repository linked; full cat-care screen proposal and original Rive cat authored.
Board verification and source handoff are recorded in
[the evidence index](../docs/design/evidence/soft-paws/README.md).
**Owner approved the native Android/iOS port on 20 October 2026.**
Task001's design/repository scope is complete; implementation continues in
[task002](soft-paws-task002-native-port.md). Native parity is not yet verified.
Previous BarkLog board/native approvals do not approve the Soft Paws direction.

- `origin` fetch/push: `https://github.com/MirHamzaHasan/soft-paws.git`.
  The remote was confirmed empty and public; no BarkLog remote remains configured.
- New product truth, README, agent guide and task entry identify Soft Paws.
  BarkLog task/spec history remains available as foundation evidence.
- New loopback-only board: `design/soft-paws/`, port 4285. It has Research, Kit,
  Screens, Transitions, chapter playback and persistent reviewer Pick/Note tools.
- Actual Mobbin MCP research: Finch onboarding/goals, Fi pet Home, BitePal logging,
  Bevel journal, Nike Run Club activity rows, Peerspace compact conversation,
  Lovi plan comparisons and Fitbit's explicit missing-data treatment. Canonical
  links and structural “what we took” notes are in `board.config.js`.
- No competitor artwork/screenshots are copied into the app or public board.
- No standalone Rive skill was installed. The active Rive MCP at loopback was
  used through the foundation's established authoring wrapper, with a new file.

## Screen inventory

94 designed surfaces: 89 product screens/states, 3 kit screens and 2 motion
screens, plus 10 chapter playback cards. The machine-readable inventory is
[`screen-inventory.json`](../design/soft-paws/screen-inventory.json).

| Chapter | Surfaces | Included |
| --- | ---: | --- |
| Opening | 1 | Five beats, one persistent cat and a hands-on example record |
| Cat setup | 9 | Name-only route; lifestyle, age, breed/birthday, sex/neuter, measured weight, care notes, goals, opt-in reminders, plan reveal |
| Home | 1 | Current cat, named care actions, today's observations, AI and free contacts |
| Journal | 15 | Nine care editors, chooser, saved, timeline/filter, detail, edit and delete |
| Health | 15 | Medication plans/history, vaccinations, calendar/tasks, insights/measurements, vet report and output boundaries |
| Safety | 9 | Saved contacts, symptoms including suspected exposure, manual region/place, optional location denial, nearby search and Premium topics |
| Memories | 9 | Private picker handoff, photo/caption, Memory Book, highlight editor/preview, expenses/form/detail |
| AI | 5 | Entry, unticked weekly consent, compact answer/source cards and unavailable-service draft |
| Account | 18 | Profile/edit/switcher, additional-cat gate, Apple/Google/email/password/account/reset, full-price paywall, plan, store management, settings/sound/data, deliberate deletion and future concepts |
| Global states | 7 | First entry, skeleton loading, offline, save failure, permission denial, missing file and revision conflict |
| Kit / motion | 5 | Tokens/type, controls, Rive companion, bounded reactions and press/release |

## Original Rive companion

- File [2667919 · Soft Paws Cat Companion](https://editor.rive.app/file/soft-paws-cat-companion/2667919).
- Original transparent tabby SVG, 480 × 520 artboard. Calm 7s Idle, 2.4s Hello,
  2.8s Curious and 2.2s Saved, with trigger-driven return to rest.
- Real `.riv`, editable `.rev`, transparent captured `rest.png`, author/motion
  source and SHA-256 manifest in `design/soft-paws/assets/cat/`.
- File-ID guard prevents the author script modifying inherited dog files.
- Local official runtime, same-art fallback, reduced motion, offscreen/background
  pause, resource cleanup and transparent interaction. No rectangular press tint.

## Truthful prototype boundaries

Records/drafts are synthetic in-memory examples; only review notes persist.
The board does not write SQLDelight or native preferences and never touches real
photos, credentials, model files or journals. Calls, location/pickers, exports,
auth, AI and store transactions are labelled handoff/unavailable previews.
No entitlement is fabricated. The base's first-profile/free-contact/CSV and
Premium-output boundaries are visible. Prices are proposals carried from the
base, not configured Soft Paws store products. Training and scanning/recalls are
unavailable future features. No live AI recheck was attempted.

## Native continuation after review

The [native adaptation audit](../docs/soft-paws-native-readiness.md) records the
actual source gaps: new cat event keys require a preserving SQLite migration,
lifestyle/stage facts need compatible contracts, navigation changes from four
to five tabs, the safety/policy context is canine, and both Rive bridges select
hard-coded dog resources. This read-only preflight is complete; it is not a
native implementation or design approval.

1. Record the owner's Picks/Notes and approved direction, preserving liked screens.
2. Define independent Soft Paws Android/iOS identifiers and service registration
   boundaries. Do not install inherited IDs over BarkLog or reuse its Firebase.
3. Port approved rows to shared Compose using the KMP skill, preserving domain,
   data, SQLite migrations, existing journals/drafts, runtime gates and native
   adapter ownership. Cat litter/profile and safety contracts need deliberate
   species-aware design rather than global string replacement.
4. Use the new Rive cat on approved cat surfaces, with native still/runtime parity.
5. Run native builds/tests and paired board/native screenshot/interaction review.
   Physical accessibility, signing/store and live service proof remain separate.

Native source is unchanged by task001. No claim of native visual parity, cat
feature implementation, live authentication/AI, transactions or store readiness.
