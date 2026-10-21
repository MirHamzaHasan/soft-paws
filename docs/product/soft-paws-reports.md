# Soft Paws · observations and care reports

The approved cat board supplies the five destinations: Insights, Weight history,
Report, Export options and Export progress. Meals are caregiver observations,
not calories, inferred intake or a health score. Missing days mean no observation
was recorded. Daily grouping uses the selected calendar dates and timezone.
Legacy Walk/Pee/Poop records keep their original keys/labels; they never become
cat Play or Litter records. Source counts and earlier/monthly ranges remain
available behind the date/count controls.

Weight history reads saved Weight records, preserves each kg/lb unit, optional
scale/method, location and notes, and opens its original dated record. Latest
weight means the latest saved measurement; no ideal/range or conversion is
inferred. Empty, loading and failed reads retain an add/retry action. Longer
histories load earlier records without altering them.

The report card is readable for free. It carries one explicitly selected cat,
inclusive local date range, chosen content types and optional vet questions.
Those choices live in a separate per-cat SQLite `vet-report` draft, never a
care observation. Back/keep/discard and application relaunch preserve the draft
through the existing real repository. Export options persist the draft before
navigation. `CareReportScope` encodes the scope as UTF-8 hex so punctuation and
non-English questions cannot be mistaken for navigation delimiters. A missing
requested cat fails rather than exporting another cat's journal.

The same scope filters mobile preview, CSV and PDF. Current recorded medication
plans may precede the date range and are labelled separately from recorded Given
entries. Only supported plan/history/reference items enter the item count;
completed-care events are not counted twice as item exports. Caregiver questions
are a distinct CSV row and a labelled PDF section. Existing CSV quoting and
formula protection retain full notes. Photo choices export local captions and
reference statements, never image files. Legacy two-date callers, including the
Memory Book, retain their original all-content scope.

CSV remains free and uses a `SoftPaws_<cat>_<from>_to_<through>.csv` filename.
PDF/print/sharing require current real entitlements or explicit Debug-only preview
access. The destination, file preparation and native handoff recheck access;
unconfigured builds never manufacture an entitlement or start a transaction.
The mobile report and existing records remain available. Exports build a real
local file before a separate explicit native share/print action. A failed write,
cancellation or unavailable destination retains report choices and saved care.
iOS reports share-sheet cancellation; Android acknowledges handoff to its system
chooser and cannot establish whether the recipient completed the operation.
No automatic upload, vet share link, live AI call or account is required.

Shared UI uses the generated joyful palette, Bricolage/Inter, clear borders,
48 dp controls and the approved flat fixed actions. The five-screen board was
reviewed in light and dark before implementation. Actual Mobbin research is
[Visible's trends screen](https://mobbin.com/screens/dd1ad5e7-a166-48a0-a8b1-0c1efb859820):
we took the visible range and separate measures, keeping Soft Paws' own visuals.

See [task007](../../tasks/soft-paws-task007-insights-and-reports.md) for actual
verification and remaining review gates. Compilation, native journeys and visual
comparison do not by themselves establish physical/assistive acceptance or
individual native approval.
