# Soft Paws task004 · prescribed care and vaccination records

Status: implemented; native storage/journeys/builds verified on 21 October 2026.
Individual native visual approval and physical/assistive checks remain open.
Six approved board surfaces: medications, med-form, med-detail, med-history,
vaccinations and vaccine-form.

The shared Compose chapter uses the joyful cat kit, instructions-first forms,
real saved summaries and archived history. Instructions are copied from the
caregiver's provided plan. The app never infers doses, interactions, vaccination
requirements or a treatment schedule. Legacy amount/frequency/time facts remain
editable. New optional JSON fields preserve existing records, IDs, revisions,
drafts and files without a schema or database filename change.

Given commits an administration and its Journal event atomically, with an
immutable copy of the instructions and the plan revision. Stable request IDs
prevent duplicate retries; stale or cross-cat writes fail without changing
history. Archiving keeps old plans and Given entries and cancels future reminders.

Medication reminders require an explicit time/repeat/time zone. A plan saves
before permission; Enable notifications is a separate action. Denial,
cancellation, scheduling failure and offline use leave the plan saved. Existing
foreground/Android boot reconciliation and notification routing use the actual
record. Given entries do not imply a reminder was fulfilled.

Vaccinations support genuine native image/PDF selection, draft retention,
relaunch, save/reopen, local preview and native open/share. Cancel or failed
selection keeps entered details. Replacement/removal is reference-aware; a
missing file disables handoff and permits explicit removal of its reference
without deleting the vaccination. No file is uploaded.

Mobbin research: [Apple Health · adding a medication](https://mobbin.com/flows/61a17fd3-3918-40b6-bfcb-6b12927d5244),
inspected through MCP on 21 October. Took the distinction between entered details,
the chosen schedule and the saved summary. Its artwork, medication database and
clinical options were not adopted. Ungenerated layout, copy, accessibility and
visual-QA passes use the approved Soft Paws direction.

## Actual verification

- Android Debug/Release/lint/migrations and all **159 JVM tests pass**. Six new
  real-SQLite tests cover legacy decoding/drafts, on-disk reopen, idempotency,
  rollback under an SQL trigger failure, stale edits, cat isolation, instruction
  snapshots, document references and DST/reminder failure boundaries.
- The Android native care/reminder/document journey passes at font scales 1.0
  (**108.322 s**) and 1.3 (**112.210 s**), using real SQLite and a native PDF picker.
- iOS passes **seven XCTest cases across five runs**, including PDF import/share,
  JPEG replacement, missing-file recovery, resting captures and three cases at
  extra-extra-extra-large text. The separate Files fixture provides actual
  external input through the production picker; product storage settings stay
  unchanged. Current Debug/Release simulator hosts and both bundle checks pass.
- All six paired board/Android/iOS destinations were visually inspected in light
  and dark, alongside both platforms' larger-text sheets. Production source
  hashes match the build freeze. Metadata checks and 30 tooling tests pass.

Earlier harness attempts exposed stale nodes, incomplete field visibility and
Android's alternate permission-denial button ID. The helpers were corrected;
those failed attempts are not counted as passing evidence. All existing review
records/drafts were retained. No app was uninstalled or journal cleared.

[Health evidence and verification limits](../docs/design/evidence/soft-paws-health/README.md)
include the actual captures, pass counts, source hashes and attachment proofs.
The direct review route can resolve an archived plan; the board's example data,
native records and viewport sizes differ. Implementation is not exact visual
parity approval. Date/time entry is currently labelled ISO/24-hour text;
[task005](soft-paws-task005-care-planning.md) tracks reusable native picker controls.
Physical notification delivery/taps/boot, third-party document providers and
assistive-technology operation remain separate checks.

The inventory is now **35 implemented-unverified / 54 pending**. The cat's Rive
idle fix remains intact. No service configuration, AI retry, purchase or upload
was performed. Normal text/motion settings are restored for handoff.
