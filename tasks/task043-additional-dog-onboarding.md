# task043 · Full onboarding for each additional dog

Owner request · 19 October 2026: adding another dog must collect the same dog
information as initial onboarding, because this is a different dog.

Status: implemented and verified in shared Compose, real SQLite and both owned
simulators. Android/iOS Debug/Release builds and all 137 JVM tests pass.
Physical/assistive testing and task022's individual visual approvals remain open.

## Behavior

“Add another dog” reuses the approved `next-dog` through `next-context-review`
screens: name/photo, life stage, estimated age/birthday, breeds/mix, sex and
neutering, size/measured weight, guidance preference, goals, routines, AI topics,
traits, activities, food/allergies, existing conditions/care instructions/notes,
and optional reminder/access choices. Existing optional/unknown choices stay
available. This does not ask the owner to create another account or repeat the
intro, practice, AI demo or plan flow.

Each dog starts with independent fields, a new stable request ID and no photo or
clinical/care facts inherited from the selected dog. `companion-add-dog` is a
separate SQLite draft from initial/edit setup. “Finish later” and Back from the
name screen save that draft and return to the switcher. Reopening resumes at the
saved step, including after relaunch. Review edits return directly to review.
Setup uses one keyboard inset and supports tapping the background to dismiss
the keyboard, including in multiline care notes. No dog row is created until
the owner confirms “Add {name}”. A failed write keeps
the details and an inline retry message. Saving is guarded against concurrent
submissions; an interrupted cleanup retries the same request without duplicating
the dog. Success selects the saved dog and opens their journal.

The existing dog's full profile, records, conversations and preferences remain
intact. The new dog has their own conversations and fresh AI context consent;
weekly reads use only their saved profile and records. Reminders stay off until
explicitly enabled for this dog. No billing, upload, model or server configuration
changes are part of this slice.

## Implementation and validation

- `CompanionController` owns independent draft persistence, resume/pause, review
  navigation and guarded local commits. `CompanionHost` reuses existing Compose
  screens and progress with reduced-motion behavior.
- `Feature.DogAdd` opens that full flow. Profile/account expose “Switch or add
  dog”. Completion crosses into the journal in one coordinated navigation action.
- `CompanionTest` uses real SQLite for all dog fields, partial setup/relaunch,
  original-profile and record preservation, separate consent/weekly context,
  local write failure and idempotent cleanup retry.
- `AddDogJourneyTest` and `AddDogReviewJourneys` exercise Android/iOS UI using
  the dedicated `park-add-dog-v1` fixture database/preferences. They preserve all
  normal and other review journals; no credentials or online calls are needed.
- An iOS save-to-Home crash exposed a selection race: a committed dog was absent
  from the still-pending screen observer. Selection now reads a fresh SQLite
  snapshot, handles missing/read failures without throwing into Compose, and
  waits for that dog's journal before leaving setup. A real-SQLite regression
  holds the screen observer behind the committed write and verifies safe
  selection, empty new-dog care and preservation of the original dog's records.

## Verified · 19 October 2026

- `python3 tools/verify.py --ios`: metadata/30 tool tests, Android Debug/Release,
  lint, all 137 JVM tests, preserving migrations and signed iOS Debug/Release
  bundle checks pass. Targeted selection regressions also pass.
- Android 15: `AddDogJourneyTest`, 1 passed. iOS 18.5/iPhone 14:
  `AddDogReviewJourneys`, 2 passed. Complete questions, keyboard entry,
  Finish later/relaunch/resume, optional access off, review/name edit,
  confirmation to the new dog's Home, profile, switcher and restart are checked.
- Saved synthetic profiles were checked directly in SQLite, including all
  entered notes, preferences and no inherited care. Normal journals match their
  pre-test row hashes: Android 1 dog/16 care records and iOS 1 dog/5 care records;
  care items and local documents are also unchanged. Both normal apps were
  reopened and background UI navigation stopped.
- Light-theme phone captures were inspected for field/keyboard space, retained
  notes, review, new-dog Home and restart. No full dark/large-text, physical-device,
  VoiceOver/TalkBack or individual board-parity approval is inferred.

See [runtime/build evidence](../docs/design/evidence/task043/README.md) and
[iOS crash analysis](../docs/design/evidence/task043/crash-analysis.md).
