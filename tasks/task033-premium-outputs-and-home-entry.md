# Task033: Restore Home AI entry and add Premium output boundaries

Owner request: 17 October 2026. Work one feature at a time: restore “Ask about
{dog}”, keep reports readable on mobile but make PDF/sharing Premium, and research
photo-to-video highlights for Android/iOS as another Premium feature.

Status: native first slice implemented; Android/iOS Debug/Release, lint, 79 JVM
tests, migrations and 23 tooling tests pass. Scoped simulator checks pass.
Video editor/export is a checked review proposal, not installed native
functionality. Real billing remains disabled.

## Authorized change to the earlier free-export policy

The owner's latest request supersedes free PDF/print/sharing for this slice.
Free remains: daily logging, all existing care records/tools, on-screen reports,
factual charts, local photos/memories and raw CSV export. Premium output gates
cover report PDFs and Memory Book PDFs, printing and their native sharing.
Existing files outside BarkLog are not restricted. No cloud sharing/sync is added.
Prices are undecided. The existing explicitly labelled local demo plan can preview
the gates; it is not a store entitlement or a payment implementation.

## Native slice

- [x] Existing-dog journals initialize companion actions in older Debug review
  routes as well as normal launches. Old no-dog board review remains possible.
- [x] Show the approved Home entry with the floating and normal review tab bars.
- [x] Gate PDF/print at the export destination, including direct review navigation;
  keep preview/CSV free. Gate Memory Book PDF at its share destination too.
- [x] Reuse the existing Premium screen with the requested output's reason.
  Back/cancel/restore return to the original feature instead of onboarding.
- [x] Commit an explicit demo upgrade before allowing output; failed writes do
  not grant access. Keep prices and purchase action unavailable.
- [x] Android/iOS Debug/Release, tests/lint/migrations and scoped native visual checks.

## Video slice

- [x] Research native Android/iOS encoders and KMP editing alternatives using
  official sources; record limitations and recommendation.
- [x] Build/check a reviewable photo-preview/Premium-export board flow.
- [ ] Owner review of the new editor/flow, per Ungenerated workflow.
- [ ] After review: implement actual MP4 rendering, progress/cancel/file cleanup,
  local draft persistence and native sharing on both platforms; no fake success.
- [ ] Physical-device performance, output playback/metadata and store entitlement QA.

See [Premium features and video plan](../docs/product/premium-features-and-video.md).
Update status with actual evidence. Do not present a storyboard as an exported MP4.

## Verification and remaining gates

`python3 tools/verify.py --ios` passes on the final source, including the corrected
single Memory Book heading and measured Home dock. `git diff --check` passes.
Board: 36 light/dark/130%-text/reduced-motion checks, local photo/caption/order/
format/gate/return journeys, actual paused-pixel equality and 94 contrast pairs.
No browser runtime error or external request. See [evidence](../docs/design/evidence/task033/README.md).

Native: both owned QA apps show Ask on Home; Android direct PDF/Memory Book gates;
iOS Ask tap, contextual PDF Premium/back/free-preview and actual free CSV preparation;
final Memory Book gate checked on both. No journal reset/uninstall or care mutation.
Both apps remain open on Home. Physical/assistive/native-dark, actual store
entitlements and all-screen parity remain separate gates; the existing ICU minimum
OS warning remains. The next video slice waits for the new editor's owner review.


17 October follow-up: the owner approved native video highlights. Task034 owns
actual encoding and the requested restoration of the earlier chat design; the
proposal-only status above records this task's original handoff.
