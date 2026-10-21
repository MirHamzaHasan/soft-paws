# Soft Paws task005 · the care you planned

Status: planned; research inspected on 21 October. Native implementation has not
started. Approved board surfaces: calendar, task-detail and task-form.

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
