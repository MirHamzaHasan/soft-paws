# Exact-board contextual implementation and QA

Task022 remains **in progress**, with **0 individually matched product entries**.
The native screen families and contextual behavior are implemented or under validation.
This document explains how to reproduce the contexts; it is not paired visual,
accessibility, motion or owner acceptance. The contract in
[tasks/native-parity](../../../../tasks/native-parity/CONTRACT.md) still applies.

The [local review pack](review/index.html) contains the board inventory and
versioned native captures. Missing entries/variants stay visible; older source
batches are labeled. [Capture configuration](review-capture-batches.json) and
`tools/build_native_review.py` reproduce the pack without changing approvals.

## Safe review setup

Use Debug and an explicitly selected `park-*` fixture. Android requires
`designReview=true`, `designReviewScreen=<board ID>` and
`designReviewFixture=<key>`. iOS requires `-DesignReview -DesignReviewScreen <ID>
-DesignReviewFixture <key>`. Both hosts reject the fixture in Release. iOS also
checks the Kotlin framework's Debug binary flag. Each fixture owns a different
SQLite file and preference namespace. Fixtures insert idempotently once and
never rewind, clear or replace a journal on replay.

The fixed QA time is 14 October 2026, 18:24 UTC. Successful operations use the real
SQLite repository and real platform services. Faults are one-shot failures or
cancellable delays, armed after fixture preparation; they never manufacture a
successful save, notification, export file or share. Retries use the same store.

| Fixture | Actual data and intended use |
| --- | --- |
| `park-day-v1` | Bruno and seven factual same-day care observations; Home and typed editors |
| `park-full-v1` | Day records plus Luna, plans, atomic administration/completion/session records, photos, expenses and highlights |
| `park-empty-v1` | Bruno with no care/supporting records; empty Home, trends, expenses and photos |
| `park-no-dog-v1` | No seeded dogs; recovery into name-only setup |
| `park-setup-v1` | No seeded dogs; guided first run. A dog created during a journey remains afterward |
| `park-contexts-v1` | Full records plus a missing-photo highlight, one September walk highlight, two measured weights and typed walk durations |
| `park-paged-v1` | Full records plus 75 older care observations, for actual 50→100 SQL paging |

Only owned QA devices receive the synthetic image in [fixtures](fixtures/README.md).
The intentionally missing image stays absent. Board example totals, dates and
all fixture contents are not identical across every card; mismatched data is a
capture limitation, never an accepted visual difference.

## Contexts and actions

| Board ID | Reproduction / native behavior |
| --- | --- |
| `startup-loading` | Hold required startup for 12 seconds, then open the same local journal; shaped static placeholders |
| `startup-retry` | Fail initialization once before opening local data; Try again opens the same store |
| `journal-error` | Fail the first dog read once; Try again restarts observation without resetting data |
| `no-dog` | Use no-dog fixture; Add a dog opens the name-only screen. Also used after removing the last profile |
| `home-empty` | Use empty fixture; actual zero and empty recent care, no sample score |
| `home-loading` | Delay the first real summary read; dash/placeholders and disabled quick writes until it completes |
| `timeline-filtered-empty` | Medication filter, 1–7 October; real SQL returns no matches; Clear filters restores records |
| `timeline-filters` | Expanded real dog/type/date controls |
| `timeline-pagination` | Use paged fixture, then Show older records; no repeated IDs or fabricated totals |
| `save-error` | Meal editor; enter data and Save meal. First create fails; draft stays and explicit retry commits once |
| `saving-state` | Walk editor; Save walk holds the real write for six seconds. No success feedback while pending |
| `retained-draft` | Meal editor; change entries, then Close. Keep/discard affects only its retained draft |
| `stale-record` | Edit the existing walk and Save changes. Debug commits a newer QA revision first; old revision conflicts. Review saved version retains the draft; reload requires confirmation |
| `medication-save-error` | Mark given on active plan fails once. Retry retains ID/time; cancel adds no administration |
| `training-empty`, `training-error` | One-shot local catalog empty/error; Retry loads packaged programs, leaving session history intact |
| `trends-empty`, `trends-sparse` | Empty fixture / contexts fixture respectively; measured values and dates, no invented pattern |
| `export-progress`, `export-failure` | Real scoped export with delayed/failed file preparation; retry creates an actual file before Ready |
| `share-handoff` | Prepare a file, Share or print, then Open platform handoff; genuine native share/print UI |
| `photo-unavailable`, `photo-permission-denied` | Explicit picker action returns cancellation/denial once; separate result copy and recovery. Next picker is native |
| `photo-missing`, `memory-photo-missing` | Full / contexts fixture references an absent private image; keep caption, date and sources |
| `expense-error` | Invalid decimal precision is retained in the editor; actual Money validation must reject it |
| `reminder-denied`, `permission-denied` | Explicit request denied once; saved task remains, system settings and continuation available |
| `reminder-failure` | Scheduler failure once; retry uses the real scheduler; no fake scheduled result |
| `offline-ready` | Behavioral contract on real Home: logging, reads, Safety and local exports remain available offline |
| `reduced-motion-state` | Debug Home with reduced motion forced; final poses and written feedback, no fake saved record |

For `reminder-failure` replay after another reminder scenario, first turn the
reminder off through Task detail. The earlier explicit request can leave reminder
intent on; foreground refresh would otherwise consume the one-shot scheduler
fault before the opt-in button is pressed. The captured retry uses this ordinary
UI precondition and preserves the task. Native notification prompts remain real
OS surfaces; dismiss an outstanding prompt before entering another scenario.

## Validation boundary

JVM recovery tests verify unchanged records on failure, retained drafts, idempotent
atomic retries, real stale revisions and same-store read recovery. Context and
pagination fixtures are also validated through real SQLite.

Native collection regression passed on the owned iPhone 14 simulator. After the Kotlin fix, all eight iOS recovery journeys passed (startup/read retry, catalog states, administration, photo cancellation/denial, export failure/retry, retained meal save, stale edit/reload confirmation and actual native share cancellation).

The first iOS recovery run passed startup/read retry, catalog recovery, medication
retry and actual export retry; the photo test exposed an intermittent native
layout crash. Its stack matches JetBrains [CMP-8935](https://youtrack.jetbrains.com/issue/CMP-8935),
caused upstream by [KT-82783](https://youtrack.jetbrains.com/issue/KT-82783).
Kotlin was updated from 2.2.21 to stable 2.3.20, which contains the collection fix;
a native collision regression test and device reruns validate that change.
Do not count a zero-test xcodebuild invocation as a passing journey.

Capture results and final verification are recorded in [verification](../../../verification.md).
Full paired light/dark, compact/wide, 130% text, reduced-motion, motion-frame,
physical assistive/haptic and individual owner review remain open until evidenced.

## Flow and reference ownership

All 18 flow IDs now enter the corresponding real native journey through `BoardReviewSequences.kt`; seven motion IDs enter their live controls/transition origin. They never replay writes automatically. Historical Home/Profile/Insights comparisons and alternative Kit feels stay board references. `seq-states` begins at startup loading; the other operation states use the explicit scenarios above. The board configuration now exposes the existing name-only setup section; the pinned configuration-only revision records unchanged product screens and sequences.

## Observed comparison gaps

The first current comparison of Memory Book showed a taller native photo frame
and excess gallery padding. A subsequent code pass sets the board's 158 dp photo
frame, keeps missing-file text able to grow, removes the nested gallery card and
adds the scrapbook caption/tilt. Earlier diagnostic captures predate this pass.
The synthetic blue QA photo differs from the board's green Memory example image;
real user images remain real images, not per-screen decorative replacements.

Native OS status/safe-area bounds differ from the board's drawn device chrome.
Calendar weekdays retain 48 dp targets and scroll at narrow widths. Extra native
settings and optional stored facts remain reachable. These adaptations and the
remaining per-screen geometry/motion/text-scale comparisons need individual review;
none is recorded as an owner-approved visual exception.

The high-contrast preference now also changes border tokens used directly by the
board components, rather than affecting only Material controls. Default board
tokens remain the selected palette. Physical VoiceOver/TalkBack and native haptic
verification remain separate from readable automation trees.

## Compiler and build-tool compatibility

The native crash fix uses Kotlin 2.3.20. Android Gradle Plugin 8.13.2 supplies the
Kotlin-2.3-compatible R8 8.13.19; the previous AGP emitted Kotlin metadata warnings
when shrinking Release. The compatible Android Debug/Release/lint/JVM/migration
pass succeeds without those warnings.

A sampled iOS Release build spent over eight minutes in
`StaticInitializersOptimization`. This matches JetBrains
[KT-84412](https://youtrack.jetbrains.com/issue/KT-84412). The documented
`kotlin.native.binary.gc=pmcs` setting preserves the collector used by the prior
Kotlin baseline and avoids the CMS-related compiler regression. The superseded
build was interrupted explicitly; it is not counted as a passing Release check.
Current-source Debug/Release and native journeys are rerun afterward. No app speed,
battery, haptic or frame-rate gain is inferred from compiler behavior.

Source: [Android Gradle Plugin 8.13.2 release notes](https://developer.android.com/build/releases/agp-8-13-0-release-notes?hl=en).

## Home comparison follow-up

Fresh iOS `park-day-v1` and the unchanged Android Day fixture both contain the
same seven records. The paired rest comparison identified native font leading
below the large count and a hard scroll boundary above the tab bar. Home now
uses the board's 88 sp count line box, and the four root tabs float over scroll
content with bottom clearance for the last row. Native system safe-area offsets
remain intact. Root navigation, early Undo, drafts, guided setup and recovery
journeys are rerun for that change. Text actions also use the current board's
13 sp label and accent underline. These changes are still subject to paired
variant/motion review and individual owner approval.

## Recording and compact-setup follow-up

Frame inspection exposed a blank destination bitmap in the chooser-to-editor
carry. Each shared part now records its own pixels with the drawing-context
`GraphicsLayer.record { ... }`, following the
[Compose recording example](https://developer.android.com/develop/ui/compose/graphics/draw/modifiers#composable-to-bitmap).
Only its displayed copy is hidden during flight. Native recordings show the
icon throughout its movement; this is diagnostic evidence, not complete motion
parity or measured physical frame pacing. Back/interruptions retain the single
active editor and use the current carried bounds.

Paired editor captures also identified undersized eyebrow/subtitle text. The
shared editor hero now uses the board's computed 10.5/15.75 and 14/20.3 sp pairs,
8 dp gaps and title letter spacing. Meal keeps the board's portion placeholder.
All nine editors are captured again at normal and larger text.

A real guided journey passed on iPhone SE, but its screenshots exposed scroll
carrying from the shortcut page into practice. Each setup step now resets its
scroll to the heading so Back and Skip start visible. A new owned SE simulator
replays the journey; the completed earlier QA journal is preserved.

The current board still caps its wide frame at 390 px inside a requested
430×932 viewport. Captures preserve that actual geometry instead of stretching
the board or squeezing native. iOS XXXL (about 135%) is labeled separately from
Android's exact 130% setting. These differences remain for individual review.
