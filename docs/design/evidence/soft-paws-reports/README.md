# Soft Paws · observations, weight and reports · 21 October 2026

Five approved cat board destinations now use shared Compose and real local data:
`insights`, `weight-history`, `report`, `export-options`, `export-progress`.
The original cat/Rive playback and generated joyful palette remain intact.

## Actual verification

- Current-source Android Debug/Release, lint, migrations and **171 JVM tests** pass.
  The three new JVM cases use real SQLite, including disk reopen, exact local
  date boundaries, preserved legacy types/weight units, cat/content isolation,
  scope/draft restoration, full CSV notes/formula protection and legacy Memory
  Book requests. Report preparation does not create Journal events.
- Android normal-text journey passes in **120.912 s**.
  The cold-start font-1.3 journey passes in **81.832 s**.
  Both exercise retained questions/relaunch, actual CSV contents, native sharing,
  unavailable PDF, injected one-shot write failure/real retry, a committed weight
  and source reopening, and an explicit previous week overriding an older draft.
- iOS passes all **five cases at both text sizes**: actual share/cancellation,
  retained questions/PDF boundary, measurement save/reopen, failure/retry, resting
  screens, and selected-week scope are covered across those cases. Larger text
  uses extra-extra-extra-large; the original `large` setting is restored.
  The larger run reuses a hash-guarded, normally built final Debug framework;
  its Swift-only followup does not stand in for a Kotlin build.
- Final-source iOS Debug/Release simulator hosts and identity/runtime plist/
  Bricolage/Inter bundle checks pass. The optimized framework build passes.
  [Checks](checks.json) and [226 code/resource hashes](shipping-source-hashes.json)
  record the exact final source used for the accepted checks.
- All ten paired light/dark sheets and four larger-text contact sheets were
  inspected. Native data is retained synthetic QA data; the board's 16-meal
  example is deliberately not fabricated in the journal. Android is 390×844
  logical / 1170×2532 PNG; iOS SE is 375×667 / 750×1334. Shorter viewports scroll
  above fixed actions. Source/date/content controls, full notes and actual file
  names extend the prototype; this is not exact pixel parity or native approval.

## Data and native handoff proof

[SQLite preservation](ios-preservation-proof.json) confirms all original
20 iOS review Journal rows, the profile and
27 care items are unchanged; only owned QA weight
observations were added. The distinct report draft is retained. A real UTF-8 CSV
contains one explicitly labelled vet-questions row. Android asserts its actual
CSV and unchanged event count before adding its one QA measurement.

[Android native chooser](android-native-csv-share.png),
[iOS native chooser](ios-native-csv-share.png),
[iOS cancellation](ios-csv-share-cancelled.png),
[Android selected week](android-selected-report-week.png) and
[iOS selected week](ios-selected-report-week.png) show the real boundaries.
No sharing destination was selected; no file was sent/uploaded, purchase started,
service configured, live AI retried or normal journal modified.

The existing Android cat idle/tap/dark/reduced-motion regression passes in
**38.405 s**. [Fresh Home cat comparisons](home-cat-motion-check.json)
exclude clocks/other controls and show ongoing movement on both platforms.
They do not measure frame rate. The same-art reduced-motion still is separately
checked by the native motion test. Both displayed QA apps finish on Home with
normal text and normal cat motion; OS accessibility preferences are respected.

## Environment and limits

The owned Android QA guest/bridge became unresponsive during this pass. Original
AVD data was preserved. Accepted runs use temporary read-only AVD overlays on
ports 5564/5566 and an isolated ADB server on 5038; the default server and Munshi
app/device were not restarted. A live font-change attempt left a blank startup
window and stopped responding through the bridge. The accepted large run stops
the app before setting/restoring text size. It does **not** establish live font-
change behavior. The validation overlay remains open for review; its temporary
QA writes are discarded when that instance closes.

Early failures were test setup/harness issues (SQLite schema-version setup,
JUnit's Unit return, scroll/footer targeting and the OS text-selection menu).
The questions case now exercises real draft discard before entering a new QA
question. Earlier runs and the pre-scope optimized build are not counted as
final-source passes. Final source and accepted result names are recorded above.

Physical devices, VoiceOver/TalkBack, live Android font changes, minimum-iOS
runtime behavior, external print destinations and individual native visual
approval remain open. Inherited iOS ICU minimum-version and AVFoundation
warnings remain; no toolchain/service changes were introduced to hide them.
The full port remains **52 implemented-unverified / 37 pending**.
