# task033 — Home entry and Premium outputs

17 October 2026. The owner requested restoring “Ask about {dog}”, a free mobile
report with paid PDF/sharing, other useful paid outputs and photo-highlight video
research. This supersedes the earlier free-PDF policy. Real identity/responses/
purchases remain demo/disabled; prices are undecided.

## Native changes

- Existing-dog legacy Debug review now initializes the companion too. The approved
  Home Ask card appears with either tab layout. Its measured dock height reserves
  the content viewport so scrolling care tiles do not paint underneath the menu.
- `PremiumExportAccess` checks report PDF/print destinations and Memory Book PDF
  sharing, including direct review navigation. Mobile report/memory reading and
  CSV remain free. The check precedes file preparation; Memory Book checks before
  its old heading/load to avoid a duplicated hero.
- The existing Premium page carries the selected output's reason. Back/restore/
  dismissal return to the underlying feature, preserving its scope. A demo upgrade
  must commit before access changes; no actual store entitlement is installed.
- Report format/onboarding/deletion guidance reflects the new boundary. Existing
  care records, dog profiles and journal migrations are unchanged.

## Recorded native checks

- Android API35 owned emulator: restored Home entry, direct report-PDF gate and
  Memory Book gate; updated in place. [Home](android-home.png), [PDF gate](android-pdf-gate.png),
  [Memory Book gate](android-memory-gate.png).
- iOS iPhone14/iOS18.5 owned Visual Review simulator: actual Home tap reaches
  “Ask about Bruno”; direct PDF gate → contextual Premium → Back → gate → free
  report preview; CSV selected and a real local CSV becomes ready.
  [Home](ios-home.png), [Ask](ios-ask.png), [CSV ready](ios-csv-ready.png),
  [final Memory Book gate](ios-memory-gate.png).
- Only existing separate `park-day-v1` QA journals were used. No care record was
  created/deleted, no app was uninstalled/cleared, and the foundation iOS journal
  was untouched. Both QA apps are returned to Home for the owner.
- `python3 tools/verify.py --ios` passed on the final source: Android Debug/Release,
  lint, 79 JVM tests, preserving migrations, 23 tooling tests and iOS Debug/Release
  simulator hosts/bundle checks. `git diff --check` passed. Full final log is local
  ignored output `.verify-build/task033-verification-complete.log`.

## Board and motion checks

The [overview](board-overview.png) shows the free report, PDF/Memory Book offers,
Home entry and proposed video editor. The prototype has **no native MP4 encoder**.

- [36 captures](board-checks.json): nine affected screens in light/dark,
  375×667 at 130% text, and reduced motion. No runtime errors, horizontal overflow,
  undersized active buttons or empty icons. These are browser checks, not native
  accessibility/whole-screen approval. [Large text](editor-large-text.png),
  [dark editor](editor-dark.png).
- [Local journeys](board-journeys.json): Home Ask/free return; contextual report
  offer and disabled purchase; real local PNG selection; captions/reorder/format;
  play/pause; preserved draft after cancelling video offer; reduced-motion manual
  photo choice; keyboard return. No external requests. Additional pause check
  compares actual film PNG pixels 400 ms apart and passes.
- Actual pan frames: [25%](pan-25.png), [50%](pan-50.png), [75%](pan-75.png).
  These capture authored motion, not a measured frame rate. Playback pauses on
  disposal, offscreen visibility, background and system reduced-motion changes.
- [94 computed contrast pairs](contrast.json) pass the existing kit thresholds.
- Existing board integrity checks pass: routes, standalone review links,
  local-only requests and dialog focus. Native voice/screen-reader behavior
  still needs real device review.

## Remaining boundaries

New video editor/flow review is requested per Ungenerated. After approval, build
the shared draft/controller with Android Media3 and Apple AVFoundation adapters,
real MP4 progress/cancel/cleanup and native sharing. See the
[framework/feature plan](../../../product/premium-features-and-video.md).

Physical devices, native dark/large-text/assistive review, actual paid export and
store entitlements, native video rendering, resource profiling and task022's
individual parity gates remain. The pre-existing iOS ICU minimum-version warning
also remains a release gate. No signed/store or complete-parity claim is made.
