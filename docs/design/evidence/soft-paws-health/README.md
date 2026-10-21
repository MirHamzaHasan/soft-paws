# Soft Paws prescribed care · 21 October 2026

Six approved cat-board destinations now use shared Compose and real local
SQLite: medications, med-form, med-detail, med-history, vaccinations and
vaccine-form. The supplied instructions remain caregiver-entered facts. Given
entries preserve the instructions and plan revision at that moment, even after
the plan changes or is archived. No dose or clinical schedule is inferred.

The paired light/dark images compare each board destination with Android and
iOS at rest. These are actual captures, without edited product content. The
board illustrates example records; native screens show the separately owned
`soft-paws-day-v1` review journal, including records accumulated by preservation
tests. The direct detail route can resolve an archived plan. Different data,
archive states and viewport heights are visible differences, not proof of exact
pixel parity. Individual native visual approval remains open.

## Runtime and preservation checks

- Android's real UI journey runs at font scales 1.0 and 1.3. It keeps and reopens
  a draft, commits a plan, records Given, edits the plan without rewriting the
  previous snapshot, keeps/cancels archive, then archives it. A separate chosen
  reminder is saved before notification permission and archived afterward.
  The journey also cancels the native document picker, imports an actual PDF,
  retains the attachment through a draft/relaunch, saves/reopens it and invokes
  the native handoff. SQLite counts, snapshots and the private file are checked.
- iOS passes seven XCTest cases across five runs: native PDF import and share,
  JPEG replacement through Files, missing-document recovery, resting captures,
  and three extra-extra-extra-large text cases covering the care flow, reminder
  choice/permission/archive and both themes. The missing-file test temporarily
  moves only its owned QA attachment, checks the disabled share action and
  explicitly removes the reference through the UI while preserving the record.
- Six additional JVM tests use real SQLite, including an on-disk reopen and an
  SQL trigger that forces rollback. They cover legacy JSON/draft preservation,
  stable retry IDs, stale revisions, cat isolation, immutable Given history,
  reference-aware document cleanup, DST arithmetic and reminder denial/failure.
  All 159 JVM tests pass, alongside migration checks, Android Debug/Release/lint
  and 30 tooling tests. Both current iOS simulator configurations build and
  their bundle identity, fonts and runtime plist checks pass.

See [checks.json](checks.json) for actual pass counts and Android durations.
[shipping-source-hashes.json](shipping-source-hashes.json) records the exact
production sources used by the final checks. All evidence generation requires
passing native results and an unchanged source freeze.

## Native document input and proof

The iOS tests use the separate [Files fixture](../../../../tools/native-document-qa/README.md),
which exposes its own generated PDF/JPEG in On My iPhone. The product selects
them with its production UIDocumentPicker and copies them into its private
attachment storage. No fixture document is seeded into the product database or
private files. Android generates its owned PDF in Downloads and selects it
through the native picker, then removes only that public test input.

The PDF/JPEG proof JSON and screenshots capture successive real saved states.
The later missing-file recovery intentionally removes that record's attachment
reference; the earlier proof does not claim the document is still attached.
Native activity-sheet frames demonstrate handoff, not delivery to a recipient.

## Review limits

The larger-text sheets show scrolling content and fixed actions on Android's
390×844 logical viewport and iOS's 375×667 viewport. Normal text/motion settings
are restored for handoff. The cat's previously verified continuous Rive idle is
unchanged by this slice.

Date/time fields currently accept labelled ISO dates and 24-hour times.
[Task005](../../../../tasks/soft-paws-task005-care-planning.md) tracks the reusable
native picker refinement. Physical-device notification delivery, notification
taps/boot behavior, assistive-technology operation and third-party Files
providers remain separate checks. No journal reset, real service, purchase,
cloud upload or AI request was used for this verification.
