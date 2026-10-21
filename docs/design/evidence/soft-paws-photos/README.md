# Soft Paws · private photos and Memory Book · 21 October 2026

The approved picker, detail and monthly Memory Book now run in shared Compose
with the cat kit, Bricolage/Inter, both themes and fixed actions. Real native
selection makes a private local copy. Existing titles, dates, categories,
body-area baselines, notes, drafts, revisions and confirmed removal remain
available. Selected images are never uploaded automatically.

Paired board/native compositions were inspected in both themes:

- Picker: [light](paired-light-photo-picker.jpg), [dark](paired-dark-photo-picker.jpg).
- Detail: [light](paired-light-photo-detail.jpg), [dark](paired-dark-photo-detail.jpg).
- Memory Book: [light](paired-light-memory-book.jpg), [dark](paired-dark-memory-book.jpg).

The board uses labelled example art. Native captures show an owned imported QA
image and actual saved synthetic records, including earlier retained collections.
The two platforms have different viewports and fixtures; these comparisons show
composition and runtime behavior, not exact pixel parity or individual approval.
Longer content scrolls above the actions. The full native metadata editor and
collection/highlight/caption subflows preserve functionality beyond the prototype.

Photo notes and collection captions are independent. Saving a photo, changing
its membership and consuming the draft form one revision-guarded SQLite
transaction. A failed book write rolls back the photo as well. Unselecting the
last source retains the book ID and caption. Other sources, legacy missing links
and original timestamps survive. Explicit month metadata keeps new selections
stable after travel, without a schema or database filename change.

Android's full journey passes at normal text in **263.702s** and cold-start 130%
in **277.057s**. It uses the real picker, cancels, imports, reopens a draft, forces
a real SQLite failure, retries, edits, selects/unselects, retains a caption-only
collection, temporarily moves/restores the owned image, cancels replacement and
removal, then imports a second image without relaunch and confirms its removal.
The first photo and source-library file remain. Both native share and print
sheets open and are dismissed. Font scale ends at **1.0**. Sheets:
[light](android-large-light-sheet.jpg), [dark](android-large-dark-sheet.jpg).

iOS passes **five normal cases**, **two larger-text cases** and **one actual
missing-file case**. These cover real PHPicker import/cancellation, retained
drafts, a one-shot save failure/retry, same-session second import/removal,
independent captions, membership, free export gate, native preview/share/print,
and photo-image navigation. The whole multiline caption input must exceed
85 points in the larger-text capture. The original text size, **large**, is
restored. Missing-file verification holds only the owned QA file and restores
its exact hash afterward. Sheets:
[light](ios-large-light-sheet.jpg), [dark](ios-large-dark-sheet.jpg).

Denial UI is exercised through a labelled Debug adapter fault; it is not an
observed OS permission denial. iOS's write-failure UI also uses a Debug-only
one-shot fault before writes; actual transaction rollback is covered on Android
and in SQLite tests. No normal journal or another app's data is touched.

The free boundary is checked before explicit Debug Premium preview. Real
RevenueCat/Release guards remain intact. PDFs are generated from current scoped
records; actual extracted text verifies the product, cat, separate captions and
absence of the unselected second photo. Android's fixture produces **10 pages**,
iOS's **8 pages**; their source sets differ. Native sheets are dismissed without
selecting a recipient, destination or printer. No delivery or purchase occurs.

**177 JVM tests**, **30 tooling checks**, Android Debug/Release/lint/migrations
and current iOS Debug/Release hosts/bundle checks pass. The final optimized iOS
Release framework completed in **11m 3s**. Its host uses the separate ignored
`soft-paws-release-xcode` DerivedData directory. Source and artifact hashes plus
test/PDF summaries accompany this note. Supplemental Swift-only tests use the
already-built, hash-checked current Debug framework; the build override does not
compile Kotlin.

Early harness failures included ambiguous image/row labels, clipped button
targets, an accessibility heading represented as Other and long retained fixture
lists. They are not counted as passes. Verification also exposed completed
picker/editor view state being reused for a second import: those view caches now
reset while the actual SQLite draft remains authoritative. Final journeys verify
two consecutive imports without terminating the application.

The current build also passes the original cat pixel-motion check: Android
**37.901s**, iOS **one case**. It checks ongoing Idle after the greeting and tap,
dark mode and an unchanged reduced-motion still. An initial Android process
crash and a later dark-frame failure occurred around an external Google account
error screen; these runs are excluded. After dismissing that screen, the full
motion case passed. The owned print test process was stopped for handoff, and
both apps were returned to Home with saved normal motion. OS motion settings
were not changed.

Only the named `soft-paws-day-v1` review journal and owned QA files are used.
No new service keys, cloud processing, purchases or model work is enabled.
Individual native visual approval, physical/assistive, minimum-OS and live Android
font-change behavior remain open. Existing AVFoundation deprecations and the ICU
minimum-link warning are unchanged. The full cat port is still in progress.
