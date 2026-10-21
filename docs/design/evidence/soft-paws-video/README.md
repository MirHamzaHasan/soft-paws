# Soft Paws · cat photo films · 21 October 2026

The approved video editor and separate preview now use shared Compose with the
cat kit, Bricolage/Inter, both themes and fixed actions. Actual selected private
images, title, captions, order, removal, portrait/square and native or journal
selection remain functional. Editing and the on-phone preview stay free. MP4
render/share uses current access guards; explicit Debug preview is separate from
purchases and unavailable in Release. Store configuration remains deferred.

Mobbin references inspected through MCP: [X editor](https://mobbin.com/screens/d268f7ed-340c-4733-8258-602f6c0b5aeb)
places selected media above its sequence/action; [Once film details](https://mobbin.com/screens/d4dcb2ca-977c-45d8-ae64-27ac1e3a7f33)
keeps the editable name beside the cover. Only structure informs the retained
approved Soft Paws layout. Both references are recorded in the board's research
view. The approved editor/preview were captured in light/dark before native edits.

Paired compositions: editor [light](paired-light-video-editor.jpg) /
[dark](paired-dark-video-editor.jpg); preview [light](paired-light-video-preview.jpg) /
[dark](paired-dark-video-preview.jpg).

The title is an optional JSON field on the existing SQLite draft. Legacy drafts
keep their order, captions, aspect and private references. Failed writes preserve
the prior commit and visible unsaved words, with Retry and a guarded leave choice.
No database filename, schema, draft slot or private directory changes. New outputs
use `SoftPaws-film-…`; guarded adapters also accept older `BarkLog-film-…` names.
Sharing says it opened the native sheet, without claiming delivery.

The owner's reported 18:37 iOS crash was reproduced in the isolated test console:
`AppState.open` rejected the new preview argument's reserved colon. The dedicated
`openHighlightPreview` helper uses `preview@N` and validates its index. Its real
navigation save/restore/Back regression passes; invalid indices and reserved
separators remain rejected. The current preview opens in both themes. Rive is
unchanged by this correction.

iOS passes the complete edit, order, removal/reselection, native PHPicker cancel,
relaunch, reduced-motion manual preview, free gate, Debug preview, actual export
and native share cancellation journey. Three other normal cases pass light/dark,
access failure and actual play/pause/background pause. These are passing cases
from two result bundles with unchanged production sources. Two further cases pass
at extra-extra-extra-large text, including a complete multiline caption input
over 85 points. The original size, **large**, is restored. Proof:
[light](ios-normal-light-sheet.jpg), [dark](ios-normal-dark-sheet.jpg),
[larger light](ios-large-light-sheet.jpg), [larger dark](ios-large-dark-sheet.jpg),
[export and native sheets](ios-export-sheet.jpg),
[motion and access failure](ios-motion-denial-sheet.jpg).

Android's full native case passes at normal text in **183.689s** and a
cold 130% launch in **189.055s**. It verifies real SQLite failure/Retry,
guarded leave, saved title/caption, order/aspect/removal/journal reselection,
native picker cancellation, reduced manual preview, both themes, free gate,
explicit Debug preview, actual missing-file recovery/MP4/share cancellation,
access failure and play/pause/background pause. Font scale ends at **1.0**.
Sheets: [normal light](android-normal-light-sheet.jpg),
[normal dark](android-normal-dark-sheet.jpg),
[larger light](android-large-light-sheet.jpg),
[larger dark](android-large-dark-sheet.jpg),
[failures](android-failure-sheet.jpg), [export/native sheets](android-export-sheet.jpg),
[paused preview](android-paused-sheet.jpg).
The paused control is tapped immediately; a screenshot or a general locator pass
can outlast the film. Static editing waits for native text acceptance before
asserting the actual SQLite result. Early harness timing/visibility failures are
excluded from accepted results. Both pre-existing Android journals pass integrity
and all records match the snapshot taken before QA OS recovery.

The actual native encoder checks pass on both platforms. Each renders ordered
three-photo portrait and square films with motion, plus a reduced-motion square
film; all are silent H.264, 720p, 30fps and **8.4 seconds**. Frames verify photo order
and captions. iOS changed 129,005 / 86,878 colour components during motion and only
7 without motion. Android tracks the black QA shape to allow lossy compression:
42 / 29 pixels of drift during motion and 1 pixel without it. Both check progress,
real playable metadata, cancellation cleanup and missing-input rejection without
added partial files. Android's encoder case passes in **17.098s**. Reports:
[iOS](ios-encoder-results.json), [Android](android-encoder-results.txt).

Native captures contain owned synthetic private QA images, rather than personal
photos or replacement cat artwork. The board shows example art. Screens may show
different selected aspects and saved titles; the evidence establishes layout and
runtime behavior, not exact pixel parity or individual native approval. The
native clock uses the encoder's real 2.8 seconds/photo instead of the board's
three-second example. Longer content scrolls above the fixed actions.

Photo-access denial is an explicit Debug adapter fault, not an observed OS denial.
Native pickers and share sheets open and are dismissed without a recipient or
outside delivery. The fixture is `soft-paws-video-v1`, with its own database and
preferences. No normal journal, photo upload, real entitlement, new dependency,
service key or live AI is involved. Individual native visual review, physical and
assistive checks, minimum-OS behavior and receiving-app playback remain open.


**179 JVM tests**, **30 tooling checks**, Android Debug/Release/lint/migrations
and current iOS Debug/Release hosts/bundles pass. Frozen production-source and
binary hashes tie native proof to the current build. Only `video-editor` and
`video-preview` move to implemented-unverified: **60 implemented-unverified /
29 pending**. The full cat port remains in progress.
