# Soft Paws task005 · the care you planned

Status: implemented and simulator-verified on 21 October. Individual native
visual approval and physical/assistive review remain open. Approved board
surfaces: calendar, task-detail and task-form.

Use the approved cat layout and current joyful kit for a real selected-day agenda,
task creation/editing, explicit reminder choices and occurrence-specific completion.
Keep every existing task, completion, draft and Journal event. Preserve legacy
monthly repeats, notes, categories and saved time zones even though the prototype
only illustrates three repeat choices.

Provide reusable native date/time pickers with labelled manual entry available.
Apply them to task fields and the existing medication start/reminder and
vaccination date/optional next-date fields. A cancelled picker keeps the old value;
an optional clinic date stays blank until the caregiver supplies it. This also
closes the date/time-control refinement left open by task004's explicit ISO/24h
entry. Do not infer a medication or vaccination schedule.

The agenda must read the selected cat and day from SQLite; no sample grooming
task or fabricated completion is shown in normal app mode. Completion, undo,
rescheduling and deletion need stable IDs/revisions, truthful Journal history and
independent occurrences. A completion is a caregiver entry, not proof of a health
outcome. Task deletion must not erase unrelated or previously recorded care.

Reuse the real reminder boundary and DST-aware arithmetic. Save without permission;
request notification access only through an explicit action. Denial, cancellation,
offline operation and schedule failure leave the plan saved. Cancel/reconcile
native schedules after edits, deletion, undo, foregrounding and Android boot.
Notification taps resolve the actual current-cat record. Never count a medication
administration as task completion or turn prescribed text into a schedule.

Mobbin MCP: [Mindvalley · Creating a reminder](https://mobbin.com/flows/5fa563c5-ee26-4563-a70a-6bd98e484b7c).
Inspected the provided previews at positions 1, 4 and 6. Took the clear reminder
on/off state, explicit time/frequency choice and saved summary. Do not copy its
visuals, account/community setup, daily wellness framing or twice-daily presets.
Retain the already-approved Soft Paws board; this research does not authorize a
different visual direction.

Require real SQLite preservation/conflict/atomic-history checks, native
create/edit/relaunch/complete/undo/delete and permission journeys on both platforms,
light/dark/larger-text screenshots, reduced motion and current Debug/Release builds.
Keep implementation and individual native visual approval separate. No service
configuration, billing transaction, AI retry, upload or journal reset is in scope.

## Delivered · 21 October

The three cat layouts now use the real selected-cat/day SQLite agenda. The
rolling week, selected occurrence and Back state survive editing. Independent
drafts retain their existing slots. Monthly repeats, time zones, categories,
notes and stable IDs/revisions remain compatible; no schema change is needed.

Completion guards the current plan revision and atomically saves its supplied
facts with the Journal entry. Undo checks the captured Journal revision and
removes only that occurrence and its linked entry in one transaction. Removing a
plan preserves all previous completion/Journal history. Stale/early Android
alarms from an edited time are suppressed using current persisted choices.
Reminder scheduling waits for pending cancellation and skips completed days.
A permission denial, cancelled request or platform failure leaves the plan saved.

Native Android calendar/time dialogs and a UIKit calendar/wheel sheet now serve
task, medication and vaccination fields. Cancel preserves the old value; opening
an optional date never fills it. Labelled manual entry stays available. Pickers
follow app appearance, support lifecycle cancellation and preserve wall-clock
values without a device-time-zone day shift.

Larger-text review found a saved-summary bug: after an edit, restoring the old
detail scroll could hide the updated plan. A committed task/medication save now
clears only its destination view state. Back still retains the previous page.

## Actual verification

- Android Debug/Release, lint, migrations, **164 JVM tests** and 30 tooling tests
  pass. Five new real-SQLite tests cover disk reopen/legacy data, forced
  insert/undo rollback, revision conflicts, independent occurrences/cat isolation,
  retained history, reminder denial/failure and stale alarms.
- Full Android planning journeys pass at font scales 1.0 and 1.3. They check
  picker Cancel/Done, draft/relaunch, actual saved values/counts, completion/undo,
  an independent occurrence, edit/selected-day retention, reminder changes and
  preserving deletion. The existing medication/vaccination document journey also
  passes against the new shared fields and saved-summary behavior.
- iOS passes all four planning cases at normal text. The three functional cases
  pass at extra-extra-extra-large; the corrected resting capture passes separately
  at both sizes. Calendar/wheel Cancel/Done, drafts, health date cancellation,
  completion/undo/edit/removal and retained SQLite history are exercised.
- Current iOS Debug/Release simulator hosts and both bundle checks pass. Swift
  UI-test-only capture changes reused the already verified Debug framework through
  the existing Xcode switch, with production/source and framework hashes checked.
  The final optimized Release host used the normal integration build.
- All three board/Android/iOS light/dark pairs, larger-text sheets and native
  picker frames were inspected. See [planning evidence](../docs/design/evidence/soft-paws-planning/README.md)
  for accepted results, source hashes, failed helper iterations and limitations.

Mobbin MCP also returned [Amie’s calendar agenda](https://mobbin.com/screens/e198fa03-f4d9-4a6c-8f5c-854478fd40a2).
Its selected-day strip and chronological grouping informed structure only; the
approved joyful Soft Paws kit and copy remain our own.

The inventory is **38 implemented-unverified / 51 pending**. No journal was
cleared, app uninstalled, AI retried or service/billing configured. The iOS review
device already allowed notifications; Android exercised permission-off handling.
Physical delivery, battery/boot/tap behavior, minimum-OS devices, assistive review
and individual native visual approval remain unverified. Normal text/theme/motion
settings are restored for handoff. The continuous Rive cat remains unchanged.
