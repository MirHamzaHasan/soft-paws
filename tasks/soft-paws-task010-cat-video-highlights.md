# Soft Paws task010 · cat photo films

21 October 2026. Status: implemented; current native simulator journeys/builds pass. Individual
native visual, physical/assistive and minimum-OS acceptance remain open.

Approved destinations: `video-editor` and `video-preview`. Use the approved
Soft Paws board and generated cat kit. Preserve the actual shared film draft,
native photo import, saved journal photo selection, 3–12-photo export bounds,
reordering, captions, portrait/square and free local preview. Add the board's
editable title as a backwards-compatible optional draft field. Never replace
real private photos with sample cat art or claim an encoder has run from preview.

Existing native encoding remains 2.8 seconds/photo, silent H.264, 720p and 30fps.
Show its real duration rather than the board's three-second illustration. Keep
actual progress/cancellation, lifecycle cleanup and retryable failures. MP4
render/share requires current Premium access; explicit Debug preview is separate
from purchases and unavailable in Release. No SDK/service configuration changes.
Preserve existing draft slots, private directories and old exported filenames.

Actual Mobbin MCP screens inspected: [X editor](https://mobbin.com/screens/d268f7ed-340c-4733-8258-602f6c0b5aeb)
keeps the selected media above its sequence and main action; [Once film details](https://mobbin.com/screens/d4dcb2ca-977c-45d8-ae64-27ac1e3a7f33)
keeps the editable title beside the cover. Borrow structure only; keep Soft Paws'
approved cat layout, art and colours. Both approved board screens were captured
and inspected in light/dark before native edits, in ignored
`.verify-build/soft-paws/video/board/`.

Verify actual draft save/reopen, independent cat scope, legacy decoding, failed
writes, picker cancellation/denial, ordering/removal, preview play/pause and
reduced/background motion, current access guards, actual MP4 geometry/duration/
frames and native share cancellation on both platforms. Inspect normal/larger
text and light/dark native captures. Keep physical/assistive/minimum-OS and
receiving-app playback separate from simulator proof.


## Reported iOS crash · corrected

The owner supplied the Soft Paws SIGABRT report from the owned iOS QA simulator
at 18:37 on 21 October. The isolated native run's console identifies an uncaught
`IllegalArgumentException` from `AppState.open`: the new preview argument used a
colon, which is reserved by the persisted navigation format. The dedicated
`openHighlightPreview` helper now validates the index and uses `preview@N`.
A regression exercises the real helper, navigation save/restore and Back to the
editor; invalid indices and the reserved separator remain rejected. The current
native light/dark preview case passes. This was an application navigation error;
the Rive runtime is unchanged.

All 179 JVM tests, 30 tooling checks, Android Debug/Release/lint/migrations and
current iOS Debug/Release host/bundle checks pass. Source and embedded Debug
framework hashes stayed frozen throughout the native video checks. The Android
QA OS needed recovery before in-place installation: both existing journals passed
SQLite integrity and every table's logical digest matches the pre-reboot snapshot.
Their private disk layers remain protected in ignored verification output.


## Completed native verification

Android's full case passes at normal text in **183.689s** and a cold
130% launch in **189.055s**. It covers real SQLite failed-write/Retry and
leave guard, title/caption reopen, order/aspect/removal/journal selection, native
picker cancellation, access failure, free gate/explicit Debug preview, a held and
restored missing input, actual MP4 metadata/native share cancellation, and real
play/pause/background pause. Native shape tracking distinguishes motion from
lossy H.264 noise. Font scale ends at 1.0. Both pre-existing Android journals pass
integrity and all records match their pre-recovery snapshot.

iOS passes four normal cases (passing cases across two bundles with unchanged
production), two larger-text cases and all five actual encoder cases. The
encoder checks photo order, captions, both output geometries, duration, moving and
reduced frames, cancellation and missing-input cleanup. iOS text ends at large.
Both approved destinations have paired light/dark board/native captures and
larger-text evidence. No recipient, purchase, upload or receiving-app playback is
claimed. See [video evidence](../docs/design/evidence/soft-paws-video/README.md).

Only `video-editor` and `video-preview` move to implemented-unverified, leaving
**60 implemented-unverified / 29 pending**. The complete cat port stays active.
