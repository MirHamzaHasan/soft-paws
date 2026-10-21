# Soft Paws care planning · 21 October 2026

The approved calendar, task detail and task form now use shared Compose and the
selected cat's real SQLite records. The rolling date strip keeps its selected day
and window beneath editors/details. Saved times, time zones, monthly repeats,
categories, notes, IDs, revisions and retained drafts remain intact.

Completion belongs to one occurrence. It snapshots the supplied title/date and
plan revision, and commits with its Journal entry. Undo explicitly removes that
mark and its linked Journal revision in one transaction. Removing a plan preserves
previously recorded care. No completion, sensor reading or health outcome is inferred.

Medication, vaccination and task fields now offer native date/time controls with
labelled manual entry. Cancel keeps the old value; a blank optional date is not
filled by opening its picker. The iOS controls represent calendar/wall-clock
values without converting them into a different day in the device's time zone.
Android dialogs follow the app's appearance choice.

## Actual checks

[checks.json](checks.json) records the accepted native/JVM results and Android
runtime durations. The Android journey runs at font scales 1.0 and 1.3, checking
actual SQLite counts and JSON after draft/relaunch, picker Cancel/Done,
completion/undo, a separate occurrence, edit, reminder changes and deletion.
A further native medication/vaccination journey checks the shared field and
saved-summary refinement against the existing document/Given flows.

iOS passes all four planning cases at normal text. At extra-extra-extra-large,
the three functional cases pass; a separate corrected resting-screen case also
passes. Final normal and larger-text resting captures are separate passing runs. They exercise native calendar/wheel selection,
draft/relaunch, prescribed-care date cancellation, both themes and the full
completion/edit/removal flow. The read-only preservation proof JSON shows that
the removed plan's two independent completion marks and original Journal titles
remain saved after editing/removal.

Five new real-SQLite tests cover on-disk reopen, legacy monthly data/drafts,
stale plan revisions, forced insert/undo rollback, occurrence isolation, retained
history, reminder denial/failure and alarms left over from an edited time. All
164 JVM tests pass, together with Android Debug/Release/lint/migrations and 30
tooling tests. Current iOS Debug/Release hosts and bundle checks pass.

The source hashes in [shipping-source-hashes.json](shipping-source-hashes.json)
match the final build freeze. For UI-test-only Swift helper/capture changes, the
existing Xcode `OVERRIDE_KOTLIN_BUILD_IDE_SUPPORTED=YES` switch reused the already
verified, unchanged Debug framework. Its artifact hash and the frozen production
sources were checked before and after. The final Release host uses the full
normal integration build.

## What the frames show

The paired light/dark sheets compare the same three destinations on the board,
Android and iOS. Native frames show the separately owned `soft-paws-day-v1` review
journal, including records retained from earlier QA. The final detail capture
opens a real retained plan from its agenda card. Example data, titles, record
counts and viewport heights differ; these are composition/runtime evidence,
not a claim of exact pixel parity or individual native visual approval.

Native picker images and larger-text sheets accompany the pairs. Content scrolls
above the fixed actions. Android uses a 390×844 logical viewport; iOS uses
375×667. Normal text/motion preferences are restored for handoff.

Larger-text QA found a real saved-summary issue: editing restored the detail's
old scroll position and hid the updated plan. After a committed task/medication
save, only that destination's retained view state is cleared, so the summary
opens at the top. Back still restores the earlier page and selected date. An
optimized build made before this correction was cancelled and is not delivery
proof. Earlier helper failures were corrected for checked radio choices,
offscreen header controls, text views and existing notification permission.
The first larger-text resting capture failed because its helper included a
changing combined accessibility label. Its three functional cases passed; the
corrected stable-prefix capture was rerun separately. The failed overall run is
recorded as failed, not counted as an all-green suite.

## Boundaries

Reminders are explicit and independent of saving. The iOS device already allowed
notifications; its refresh/scheduled path was exercised. Android exercised the
permission-off path. Native acceptance is not proof of physical delivery, timing
under battery saving, boot/tap behavior or assistive-technology operation. Those
checks, minimum-OS physical review and individual native visual approval remain
open. The existing iOS ICU deployment-version/AVFoundation warnings are not a
minimum-device compatibility claim.

No journal was cleared or app uninstalled. Existing normal journals, drafts,
models, credentials and other QA apps remain separate. No account, cloud upload,
AI request, real transaction or service registration was used. The cat's previously
verified continuous Rive idle is unchanged. Fresh final Home frames also confirm
ongoing cat motion with normal saved review preferences:
[Android pixel check](latest-android-cat-check.json) and
[iOS pixel check](latest-ios-cat-check.json). Their crops exclude the clock and
other controls; neither result is a frame-rate measurement.
