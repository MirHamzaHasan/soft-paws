# Soft Paws task007 · observations, measurements and reports

21 October 2026. Status: implemented and simulator-verified at both launch text sizes.
Individual native visual/physical/assistive approval and Android live font-change
behavior remain open.

Approved board surfaces: `insights`, `weight-history`, `report`, `export-options`,
`export-progress`. The full cat direction and native port are already authorized.
This chapter uses Ungenerated app screens/native port, human copy, motion,
accessibility/no-slop and visual QA. The actual Mobbin reference is Visible's
explicit trends range/separate measures; its source/structural lesson is on the
board's Research view. The five board surfaces were captured and inspected in
both themes before native implementation.

The shared cat UI reads exact meal observations for the selected local dates,
keeps absent days at zero recorded observations, and preserves legacy record
labels. Weight history reads saved measurements with their original units,
source method and record links; it never infers an ideal or converts a legacy
activity into Play. Monthly/date navigation and source counts remain available.

The report combines the approved factual card with editable, retained scope and
vet questions. Scope travels safely through navigation even with punctuation or
non-English questions. Fresh reads fail for a missing requested cat rather than
substituting the current cat. Content exclusions apply to preview and all file
formats. Questions are explicitly included in the file and use a separate CSV
row; raw notes retain CSV quoting/formula protection. No Journal event is created
for a report/draft/export. Existing drafts, filenames/storage identities, journals,
attachments and database migrations remain preserved.

Raw CSV and on-phone reading remain free. The export builds a real local file
before explicit native sharing. PDF/print access uses current entitlements or
explicit Debug preview only; it is checked on destination, preparation and handoff.
Unconfigured purchases stay unavailable. Loading, cancellation, missing-scope,
read/write failure/retry and unavailable destinations keep the selected report.
No automatic upload, vet link, live AI retry, real transaction or service setup.

An explicit range from Insights is applied after the retained report draft loads,
preserving vet questions. Fresh entry clears that destination's retained view
state; Back still restores in-screen edits. Both native journeys verify that an
older draft cannot replace the newly selected week. Legacy Memory Book two-date
requests retain all their original content.

Current-source Android Debug/Release/lint/migrations and all **171 JVM tests pass**.
The three new JVM cases cover real SQLite/disk reopen, exact local-day counts and
legacy types, requested-cat isolation/content, retained scope/questions, CSV
quoting/formula protection and legacy report requests. iOS passes all **five cases
at both text sizes**, with final-source Debug/Release hosts and bundle checks.
Android passes the full journey at font 1.0 and at a cold-start font 1.3, including
actual CSV, native share, PDF gate, write failure/retry, measurement save/reopen
and selected-week scope. The existing live cat motion/reduced-motion test passes.

Paired board/Android/iOS light/dark images and larger-text captures were inspected:
[evidence and actual limits](../docs/design/evidence/soft-paws-reports/README.md).
Android's live font-change run encountered a blank startup/unresponsive bridge;
the cold-start protocol stops the app before setting/restoring the text size.
That successful run does not establish live font-change behavior. No journal was
uninstalled/cleared, and no unrelated emulator was restarted.

The inventory is now **52 implemented-unverified / 37 pending**. Physical/assistive
review and individual native visual approval remain separate. Real purchases,
service setup and live AI remain deferred; no calls/uploads were made.
