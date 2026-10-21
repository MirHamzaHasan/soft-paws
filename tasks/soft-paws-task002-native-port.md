# Soft Paws task002 · approved native cat-care port

20 October 2026. Owner answer to the live board review: **“Approve the native port.”**
The complete direction at `design/soft-paws/` is approved for shared Compose on
Android/iOS, including the original Rive cat. No repeated direction approval is
required. All 89 product surfaces remain in scope; builds alone do not establish
visual parity. Task001 holds Mobbin research and board evidence.

## Later owner colour refinement

The owner requested another Mobbin MCP pass and a more joyful, colourful cat app.
Retain the approved layouts while updating board and native tokens to cream,
apricot, teal and stable care-category colours. See `design/soft-paws/feedback.md`.

## Delivery status

In progress. Separate `com.draco.apps.soft.paws` app identities, safe unconfigured
service adapters, cat profile/observation contracts, preserving SQLite v5
migrations, original native Rive cat, five-tab shell, setup, Home and care hubs
are implemented. The native observation editors and confirmation use the real
repository. Existing downstream feature screens still need their individual cat
layout/content ports. No screen has complete paired Android/iOS parity approval.

## Required complete outcome

- Keep the existing SQLite filename, serialized legacy keys, IDs, revisions,
  timestamps, drafts, attachment ownership and independent profile history.
  Add water/litter/play/sleep/note keys; never reinterpret old walk/poop/pee data.
- Use the approved CSS tokens, five-tab shell, setup, Home and native cat Rive;
  prove the first real save/reopen/failure path before widening implementation.
- Complete every journal, care, safety, memories, AI/account and global-state
  surface using real repositories and platform adapters. Keep unavailable
  services truthful; no fake repository or entitlement.
- Use primary veterinary sources for species-specific safety copy. Keep saved
  contact access free and usable offline. Preserve the deferred live AI gate.
- Keep first-cat care, existing records, on-phone reports and CSV free, with
  existing Premium boundaries and full prices. Training/scanning/recalls remain
  unavailable future concepts.
- Record paired Android/iOS/board evidence against the cat inventory, including
  dark theme, larger text, reduced motion, Back/drafts, denial and failure paths.
  Complete appropriate builds, real SQLite tests and both platform journeys.

## Configuration boundaries

The BarkLog registrations and local billing properties are inherited private
files, not Soft Paws configuration. New app builds must not initialize those
registrations or accept their service policy. Firebase/RevenueCat configuration,
real purchases, live AI rechecks, journal/photo uploads and signing/store release
remain deferred. Separate app IDs preserve BarkLog installations.

## Previous verified baseline · 20 October

- 152 JVM tests pass, including new cat validation, real SQLite reopen/edit,
  retained failure/retry, and v1/v2/v3/v4 → v5 preservation checks.
- Android Debug and the targeted instrumentation APK compile. A separate
  `SoftPawsApplicationQA_20261020` emulator was created after the old QA device
  lacked install space; its journals were preserved. The owned test fixture
  saved a litter observation offline, verified the SQLite count, reopened and
  exercised all five tabs. Stable light/dark Home frames and an explicit Rive
  tap response were captured and inspected. The final journey passed with airplane mode enabled.
- The initial iOS Debug bundle compiled and its separate identity/resources/
  unconfigured-service checks passed. The core XCTest triggered an iOS Compose
  `AccessibilityElement.cachedProperties` crash after a real fixture save.
  The official Compose accessibility fix is now applied to the iOS graph. Both
  core XCTest cases and a further explicit-tap/repeated-accessibility run pass;
  no recurrence was observed. Android retains its API 36-compatible baseline.
- Joyful colour board/source evidence: `docs/design/evidence/soft-paws-color/`.
  282 full-board checks, 18 compact checks, 82 contrast pairs and 15 browser
  journeys pass. Those are web results, not native visual parity proof.

Complete per-screen native cat ports, matched light/dark/larger
text captures, physical/assistive checks and complete feature-specific review
remain open. Android Debug/Release/lint/migrations/152 JVM checks and iOS
Debug/Release simulator hosts plus bundle checks pass with the final colour
changes. Do not mark delivery complete based on the inherited
BarkLog checker or the web prototype.

## 21 October · dated Journal and record flow

The approved Journal week strip, category chips and coloured observation rows now
read the selected cat's real dated SQLite query. Advanced filters retain all
legacy event types, arbitrary dates and photos; older results remain paged.
Query identity prevents a previous cat/date from flashing while a new read starts.

Record detail now uses the cat board's factual rows, full note and attachment.
Editing puts title and note first; the existing structured measurements, time,
place and attachment controls remain under Observation details. An optional
caregiver title uses the existing validated observation context, preserving IDs,
revision, details and timestamps. The delete screen names its exact record and
cat, keeps the safe choice first, and retains its captured revision until commit.
Cancel and failed/stale writes do not remove the record.

The selected day and category reveal themselves fully on narrow phones and with
larger text. An existing strict test also exposed a profile-selection race: a
delayed list could replace a newly confirmed cat. The controller now reads the
current committed profile snapshot before fallback and recovers when a selected
profile is deleted, preserving the other cat's history.

Android Debug/Release/lint/migrations and all **153 JVM tests pass**. The real
save/edit/keep/relaunch/filter/delete journey passes offline at font scales 1.0
and 1.3, including SQLite revision/count assertions. Current-source iOS core
XCTest passes all three cases; a further Journal journey at
extra-extra-extra-large text passes. The final optimized iOS Release build and
both Debug/Release bundle identity, runtime plist and font checks pass.

Paired board/Android/iOS light/dark screens and larger-text captures were
inspected: [Journal evidence](../docs/design/evidence/soft-paws-journal/README.md).
Four further surfaces bring the inventory to **29 implemented-unverified / 60
pending**. Individual native visual approval, physical/assistive coverage and the
remaining downstream ports stay open.
