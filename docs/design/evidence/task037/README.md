# task037 — local AI and Atlas checks

18 October 2026. This records implementation/runtime checks, not complete visual,
clinical, physical-device or production-service approval.

## Composer and latency refinement · 18 October

[Before/after native timings](ios-latency-comparison.txt) isolate verification,
model loading, generation and release on the same owned iOS 18.5 simulator.
Full-weight verification was the main overhead: 10.2–10.5 seconds for Qwen,
13.2 seconds for SmolVLM. Using platform streaming SHA-256 reduces this to
0.37–0.54 seconds for Qwen and 0.50 seconds for SmolVLM. Complete sample requests:

| Synthetic request | Before | After |
| --- | ---: | ---: |
| Saved walk duration | 14.13 s | 4.43 s |
| Computed record count | 14.99 s | 5.13 s |
| General enrichment | 13.22 s | 3.27 s |
| Scene caption | 14.58 s | 1.79 s |

The runtime still checks every byte, loads on demand, releases after the request
and enforces the existing safety/cancellation rules. Model choice, prompts and
thread counts are unchanged. Native known-vector and changed-byte checks pass;
all four real-model checks pass. Physical-device latency/battery remain unmeasured.

SQLite regressions cover failed Send preserving input, whitespace/newline Send
clearing on commit, a queued keystroke arriving after commit, next-question typing
during inference, persistence after reopening, and suggested prompts/regeneration
preserving the existing draft. The composer now reads the controller's draft
directly instead of reconciling a second UI copy against trimmed submitted text.

[Native composer review](ios-composer-review.txt) verified a real UI send ending
in spaces/newline: the field emptied during preparation, then remained empty
when Qwen correctly returned 2 Walk records from 8 automatic source records.
[Final screenshot](ios-composer-cleared.png) shows the answer, empty field and
preserved current-dog context. The existing journal/model were retained and the
app was left open. Dark/large-text/assistive and physical checks remain open.

Final verification for this refinement: `python3 tools/verify.py --ios` passes
Android/iOS Debug and Release builds/bundle checks, lint, preserving migrations,
120 JVM tests and 30 metadata/tooling tests. Two explicit iOS native tests pass.
The fresh Android APK was built; its owned QA emulator was not running, so no
Android runtime update/check is claimed for this refinement.

- Android 15/API 35, owned `BarkLogExactBoardQA_20261016`, updated in place.
  [Native inference result](android-native-inference.txt): real pinned Qwen text
  answered “17 minutes”; real SmolVLM captioned the synthetic image “A red square.”
  Model removal preserved an unrelated file. Test-only model copies were removed;
  the caregiver database was not opened by the test.
- [iOS AI settings, light](ios-ai-privacy-light.png): actual shared Compose screen
  on the owned BarkLog Exact Board QA simulator, iOS 18.5. Separate empty review
  database/preferences; all consent starts off. A simulator restart preserved
  existing data and resolved launch requests that were hanging before process
  creation. No auth/provider permission or cloud-processing choice was enabled.
- Simulator automation did not complete scroll gestures. Lower download cards,
  dark/large-text layouts and screen-reader/device interaction remain visually
  unverified. Do not mark task022 parity or those accessibility gates complete.
- Android Debug/Release, lint/migrations and 115 JVM tests pass. Thirty metadata
  tooling tests pass. Both iOS host/bundle configurations pass with the automatic-context
  refinement. A final Debug refresh includes the later copy-only review notice.
- Release APK ZIP alignment passes `zipalign -c -P 16 4`. New arm64 native ELF
  load segments were inspected for 16 KB alignment. R8 mapping preserves native
  GenStream callback names through explicit product rules.

These emulator timings (about 18 seconds text, 53 seconds vision during concurrent
builds) are observations, not a speed promise. Physical RAM/latency/battery/quality,
minimum-OS and clinical review remain required. Existing ICU
object metadata still reports iOS simulator 17.2 against the approved 16.6 floor.

Atlas latest read-only console check: registration disabled at revision 0, project
array validation error, context checks off/revision 0, zero feature contracts.
No live generation request was sent and no server setting was changed. The
[feature contract](../../../product/atlas/barklog-ask-feature.json) is a review-only
proposal; credentials, registration, quotas/budgets and policy activation remain
server-owner work. Release Atlas stays disabled.

## Automatic local context refinement

- iOS native acceptance now exercises `RealResponseProvider` with automatic local
  profile/walk facts, no cloud profile/record selection and Atlas disabled. Qwen
  answered **“17 minutes”** (20.7 seconds on this simulator).
- With no records/profile, Qwen supplied grooming guidance (25.2 seconds). It did
  not require attached records. The answer repeated several tips: this is a
  known quality limitation of the 0.5B model, not a broad answer-quality pass.
- The same run captioned the synthetic scene **“A red square.”** (17.4 seconds).
  [Native result](ios-native-inference.txt). All weights were explicitly staged
  test assets; the test never opened a care database or made a network call.
- JVM regressions cover an actual saved 30-day-old structured walk, excluding a
  second dog's record, automatic profile/source persistence with cloud sharing
  off, no-log local inference, read failure and isolation of automatic facts and
  earlier local assistant text from the Atlas payload.
- These checks do not prove physical-device latency, factual/medical quality or
  full accessibility/visual parity. The earlier light screenshot predates the
  automatic-context copy and must not be treated as current screen approval.

- [Updated automatic-context settings, light](ios-ai-automatic-context-light.png):
  current native copy is readable with no overlapping text on the owned iOS
  simulator. Observed existing review choices were left unchanged; nothing was
  saved or sent to Atlas. Native simulator drag automation still did not scroll,
  so lower cards/dark/large-text/assistive checks remain open.

## Live review provider selection

The existing iOS app contained the exact 491,400,032-byte Qwen file, but its
separate design fixture still used deterministic `DemoResponseProvider`. An
explicit Debug-only `LiveAIReview` launch option now chooses the real provider
without changing/copying the fixture database or model files. Normal mode remains
real; default design fixtures remain deterministic. The latest DI regression
passes, bringing the JVM total to 116. Fixture auth and Atlas stay disabled.

Live iOS review confirmed the real model could use the existing dog profile
(“Bruno; Mixed breed”) with eight automatically included saved records. A further
quality check caught Qwen counting two Walk observations as three. The local
prompt now includes deterministic per-type/total counts computed from the bounded
supplied sample, following conversation history, and directs the model to use
current computed counts. These are sample counts across listed dates, not a
claim of complete-day coverage. Native acceptance includes a deliberately wrong
prior assistant count to check that current facts win. Broader 0.5B quality and
clinical review remain open.

- [Real profile answer in the existing review app](ios-live-qwen-profile.png):
  “Bruno; Mixed breed”, labelled On-device AI, with eight automatic source records.
  The old demo response had five manually selected sources; the new local answer
  did not require changing that selection.
- [Real general-care suggestion](ios-live-qwen-guidance.png): the same installed
  model suggested a puzzle toy for indoor enrichment. This demonstrates live
  generation, not clinical or comprehensive quality approval.
- Source-sheet inspection independently confirmed two Walk entries in the eight
  actual saved observations. The original live Qwen count was incorrectly three;
  deterministic sample counts were added to the prompt after this observed error.

The first counter-regression still followed an earlier incorrect AI answer.
Local factual questions therefore omit generated assistant drafts from runtime
history; only explicit editing/rewriting follow-ups may include an eligible draft.
Current SQLite-derived sample counts remain supplied separately. User questions
still provide conversational context. Atlas source-sharing filters are unchanged;
its count fields derive only from explicitly selected cloud records.

Final native count regression passes with the actual eight-record type mix and a
wrong prior AI count: **“There are 2 Walk records in the supplied observations.”**
(24.1 seconds). The same run also passes the 17-minute duration, general care
without logs and red-square scene tests. [Updated transcript](ios-native-inference.txt).
Factual local questions exclude prior generated drafts; explicit rewrite requests
can still use a source-eligible draft. The JVM suite now has 117 passing tests,
including cloud count isolation and actual provider selection.

A later safety review rejected the generated grooming suggestion to use calming
scents without product/exposure context. BarkLog now conservatively withholds
outputs mentioning oils, aromatherapy, lavender/chamomile, herbal remedies or
supplements, alongside the existing diagnosis/dose limits. The observed output is
a regression fixture; it is not approved care guidance. General enrichment without
logs remains supported and is tested separately. These filters are not exhaustive
clinical validation. ASPCA explains that concentrated oil exposure can cause
health concerns and that formulation/exposure matters:
[ASPCA essential-oil guidance](https://www.aspca.org/news/essentials-essential-oils-around-pets).

The final source-state native acceptance passes after the remedy-output guard:
17-minute duration, two Walk entries out of eight despite a wrong prior draft,
**“Fetch”** as a general indoor-game answer with no profile/records, and a red-square
caption. The rejected longer grooming answer is not approved care guidance.
The exact rejected remedy suggestion is covered by a JVM withholding regression.

The final Debug host was installed in place and launched with live AI using the
same existing preview journal and downloaded Qwen file. Repeating the ordinary
count question now returns **“The supplied observations contain 2 Walk records.”**
The actual app still shows eight automatic source records and the On-device AI
label. [Corrected live result](ios-live-qwen-count-corrected.png). No sharing
choice, manual source selection, model file or journal record was changed for
this check. Added test questions/replies remain in the local review conversation.
The app is left open on this result for manual review.

Final post-safety verification passes: `python3 tools/verify.py --ios` completes
Android Debug/Release, lint, preserving SQLDelight migrations, 117 JVM tests,
30 metadata/tooling tests, and iOS Debug/Release host/bundle checks. Native pinned
model acceptance and the corrected real iOS chat check also pass. The owned
Android app was updated in place; iOS remains open in explicit live-AI review
using the existing installed Qwen file and preview journal. No live Atlas call or
server configuration change was performed. Clinical/quality, minimum-OS/physical,
assistive and live Atlas gates remain open; task037 is still in progress overall.
