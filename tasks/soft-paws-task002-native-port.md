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


## 21 October · prescribed care and vaccination documents

The approved medication list/form/detail/history and vaccination list/form now
use shared cat Compose screens and real SQLite. Given entries atomically preserve
the supplied instructions and plan revision; archive/edit never rewrites past
care. Explicit reminder choices save before permission. Documents use real
native image/PDF selection, retained drafts, reference-aware replacement/removal,
missing-file recovery and native handoff. Legacy data and all journals remain
preserved. See [task004](soft-paws-task004-prescribed-care.md).

Android Debug/Release/lint/migrations, **159 JVM tests**, both Android text-size
journeys, seven iOS XCTest cases across five runs and current iOS Debug/Release
bundle checks pass. All six paired light/dark destinations and larger-text sheets
were inspected: [health evidence](../docs/design/evidence/soft-paws-health/README.md).
The inventory is **35 implemented-unverified / 54 pending**. Individual native
visual approval, physical/assistive coverage and downstream ports stay open.
The later task005 slice below adds the care agenda and native date/time controls.

## 21 October · care planning and native date/time controls

The approved calendar, task form and task detail now use the selected cat/day's
real records, retained week/occurrence navigation and independent drafts. Monthly
repeats, notes, categories, time zones and revisions remain compatible. Completion
and undo use atomic, revision-guarded Journal history; removing a plan preserves
past care. Explicit reminders survive denial/failure without losing the plan.
Android suppresses stale/early alarms after schedule edits.

Tasks, medication and vaccination fields share real Android calendar/time dialogs
and cancellable UIKit calendar/wheel sheets, retaining manual entry and optional
blank dates. Larger-text review also corrected saved-summary scroll restoration.
See [task005](soft-paws-task005-care-planning.md).

Android Debug/Release/lint/migrations, **164 JVM tests**, both Android text-size
planning journeys and the medication/document regression pass. iOS passes all
four normal-text cases, three larger-text functional cases and corrected resting
captures separately at both sizes. Current iOS Debug/Release hosts and bundle
checks pass. All three paired destinations, larger-text sheets and native pickers
were inspected: [planning evidence](../docs/design/evidence/soft-paws-planning/README.md).

The inventory is now **38 implemented-unverified / 51 pending**. Individual native
visual approval, physical notification delivery, assistive review and downstream
ports remain open. Both owned apps finish on Home with normal motion; fresh
cat-only pixel comparisons confirm the continuous Rive idle remains live.

## 21 October · cat Safety and saved contacts

All nine approved Safety destinations now use the joyful shared cat kit and real
profile/draft/device boundaries. The two contact slots gain independent optional
address/notes without replacing general care notes or other profile facts.
Confirmed clear affects one contact; drafts and captured revisions remain intact.
Caregiver selections become a free call summary without creating Journal entries.

Country listings use rechecked primary sources, explicit manual selection and no
invented unsupported-country number. Punctuation/non-English place names survive
manual fallback. Real native permission denial on both platforms preserves the
typed place and free contacts. Maps remains Premium; AI keeps per-cat weekly
consent, identity and unavailable-service guards. No live AI call was made.

Android Debug/Release/lint/migrations, **168 JVM tests**, normal/larger-text full
journeys and a separate native denial case pass. iOS passes four cases at both
text sizes plus real native denial, with current Debug/Release hosts and bundle
checks. All 18 paired destinations and larger-text sheets were inspected:
[Safety evidence](../docs/design/evidence/soft-paws-safety/README.md).

See [task006](soft-paws-task006-cat-safety.md) for scope and source checks. The
inventory is now **47 implemented-unverified / 42 pending**. Individual native
visual approval, physical/assistive/integration review and downstream ports remain
open. Both apps finish on Home with normal text and continuous cat motion.

## 21 October · observations, measured weight and selected reports

Five approved cat destinations now use recorded meal counts, saved-unit weight
history, retained vet questions and an explicit cat/date/content report scope.
Selecting a week from Insights wins over an older report draft while preserving
its questions; Back retains manual edits. Free CSV builds a real local file before
a separate native share action. PDF/print rechecks current access and stays
unavailable without configuration or explicit Debug preview. No Journal records
are created for report preparation or exports. Legacy Memory Book scopes remain
compatible. See [task007](soft-paws-task007-insights-and-reports.md).

Android Debug/Release/lint/migrations and **171 JVM tests** pass. The full native
journey passes at font 1.0 and cold-start font 1.3; the existing cat idle/tap/still
regression also passes. iOS passes five cases at both text sizes and current
Debug/Release host/bundle checks. Paired light/dark and larger-text evidence was
inspected: [report evidence](../docs/design/evidence/soft-paws-reports/README.md).
Android live font-change behavior remains unverified after a blank startup/bridge
stall; the accepted protocol sets/restores size while the app is stopped.

This chapter left **52 implemented-unverified / 37 pending**. Individual native
visual approval and physical/assistive coverage remain open. The expense chapter
below supersedes that implementation count.

## 21 October · recorded cat-care expenses

The list, form and detail now use the approved cat kit with retained currencies,
entered dates, exact legacy/custom categories, notes and native image/PDF receipts.
Saved drafts and attachment ownership remain intact. Explicit monthly report
entry selects Expenses for this cat; report inclusion now uses entered dates so
time-zone changes cannot move a cost out of its listed month. Validation/write
errors stay beside Save, and removal captures the displayed revision.

All **173 JVM tests**, Android Debug/Release/lint/migrations and 30 tooling checks
pass. Full native expense/receipt/draft/failure journeys pass at Android font
1.0 and cold-start 1.3. iOS passes three normal and two larger-text cases, with
the entire note input's visible bounds checked, plus current Debug/Release hosts
and bundle checks. The optimized Release framework completed in 8m 56s.
All paired light/dark and larger-text captures were inspected:
[expense evidence](../docs/design/evidence/soft-paws-expenses/README.md).

The inventory is now **55 implemented-unverified / 34 pending**. Individual native
visual approval, physical/assistive and Android live font-change review remain
open. The photo/Memory Book chapter below supersedes this implementation count.


## 21 October · private cat photos and Memory Book

The three approved photo-picker, photo-detail and memory-book surfaces now use
the cat kit and actual local images/records. Native selection, private copies,
retained drafts, title/date/category metadata, replacement and confirmed removal
remain functional. Photo captions and collection captions stay independent. A
revision-guarded SQL transaction commits the photo, month-specific membership
and draft consumption together; failure retains the previous records and draft.
Removing the last source retains the collection ID/caption. Legacy missing links
and original dates remain intact. PDF/print/share retain current entitlement
guards and explicit native handoff; mobile reading stays free.

All **177 JVM tests**, **30 tooling checks**, Android Debug/Release/lint/migrations
and iOS Debug/Release hosts/bundles pass. Android's full journey passes at normal
and cold-start 130% text. iOS passes five normal, two larger-text and one actual
missing-file case. Both platforms verify a second native import without relaunch,
confirmed deletion, retained captions, rollback/retry and native share/print.
Actual PDF text verifies the chosen sources and separate captions. Paired
light/dark and larger-text captures were inspected; see
[photo/Memory Book evidence](../docs/design/evidence/soft-paws-photos/README.md).

The inventory is now **58 implemented-unverified / 31 pending**. Individual native
visual, physical/assistive, minimum-OS and live Android font-change review remain
open. The full cat port stays active.


## 21 October · cat photo films and reported iOS preview crash

The two approved film destinations now use the cat kit with real selected private
images, preserving title/caption drafts, order/removal, native/journal selection,
portrait/square and a separate free preview. Native MP4 render/share retains current
access guards, actual progress/cancellation and private files. Legacy draft fields,
slots, directories and older exported names remain compatible. The new preview
argument's reserved colon caused the reported iOS abort; a validated navigation
helper and real save/restore/Back regression correct it.

All **179 JVM tests**, **30 tooling checks**, Android Debug/Release/lint/migrations
and iOS Debug/Release hosts/bundles pass. Both encoders verify actual frames,
geometry/duration, order/captions, reduced motion, cancellation and missing inputs.
Both platforms' normal/larger-text journeys verify real native picker/share
cancellation and current free/Debug access boundaries. Android additionally
forces a SQLite write failure, retries and verifies preserved journals. Paired
light/dark, larger-text and failure/handoff evidence is inspected in
[cat video evidence](../docs/design/evidence/soft-paws-video/README.md).

The inventory is now **60 implemented-unverified / 29 pending**. Individual native
visual, physical/assistive, minimum-OS, receiving-app playback and Android live
font-change review remain open. The full cat port stays active.


## 21 October · optional account and plan screens

Task011 ports eight approved account/access destinations using the original cat,
shared kit and native controllers. Actual configuration guards unavailable auth
before credentials reach an engine. Protected transient passwords clear on routes
and real background transitions. Full recurring charges, free exits, restore/store
management, setup-note policy dialogs and explicit Debug preview stay honest.
Future training/scanning concepts remain unavailable. No service setup occurs.

182 JVM and 30 tooling checks, Android/iOS Debug/Release, normal/larger-text native
journeys and three-journal preservation per platform pass. Paired captures are in
[account evidence](../docs/design/evidence/soft-paws-account/README.md). Only these
eight surfaces change status, leaving **68 implemented-unverified / 21 pending**.
Individual native visual approval, physical/assistive and real provider/store
success remain open. The owner's later scope question is pending; no additional
screen set starts from this pass.
