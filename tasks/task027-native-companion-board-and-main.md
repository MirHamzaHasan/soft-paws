# task027 — Native companion board and main delivery

Owner authorization: 16 October 2026. Port all task024–026 board product screens
into the real shared KMP application, remove the identified backup folders, and
push the accumulated rebuild to `main`. Do not launch a simulator. The owner
explicitly chose **demo login and demo AI replies now**, with real service
credentials deferred to the next run. Prices stay undecided.

Status: implemented and noninteractive validation passed; native visual/device review open.

## Native implementation

- All 54 board IDs have typed native routes in `presentation/companion/CompanionScreen.kt`.
  The new first-run journey collects optional structured dog context, custom/mixed
  breeds, multiple priorities/routines/topics, age/size/weight, traits/activities,
  food and care notes. Profile review/editing uses the same values. Practice is UI
  state only and never creates a journal event.
- SQLite schema v4 adds `local_documents` for pre-dog setup drafts, demo identity
  and per-dog conversations. Existing v1/v2/v3 migrations and database filename are
  preserved. DogDetails carries the structured context without losing old fields.
- Native photo selection/camera, explicit OS notification authorization, settings
  recovery and opt-in check-in tasks use the existing platform boundaries. No
  permission is requested at launch, and denial never blocks dog/journal saves.
- Local demo sign-in supports provider approval/cancel and email-link states.
  No email/Firebase authentication, real entitlement, trial or purchase is claimed.
  Prices remain undecided; purchasing is disabled; demo Premium is explicit.
- Chat has explicit message/profile/record choices, scoped date ranges, streaming,
  stop/regenerate, immutable profile/record snapshots, local history/new/delete,
  read-only ended access and bounded emergency/medical responses. The response
  provider is explicitly local demo logic. Nothing is sent to an AI service.
- Home keeps care records inside its mascot card. A larger vector dog uses six
  shuffled idle actions, tap/keyboard greeting, saved-log priority, reduced motion
  and visibility/lifecycle cancellation. AI entry reserves space above the tab bar.
- Native debug review provides all 54 destinations, replay and 1×/½×/¼× controls.
  All previous journal features remain available through All care tools. The free
  journal can be opened without signing in. Finished setup cancels pending
  autosaves; conversation creation never prunes earlier saved history.

## Validation and delivery

Evidence and final build/test status are recorded in
[task027 evidence](../docs/design/evidence/task027/README.md).
The expanded Native Release compiler exceeded the earlier 3 GiB Java heap;
`gradle.properties` now allows 6 GiB for build-time optimization. This does not
change app runtime memory settings.
No simulator/device is launched, installed, reset or cleared. Native screenshots,
paired visual approval, physical haptics and performance remain unverified.
Task022 remains a separate original-board parity ledger; functional routes and
compilation do not mark its screens matched.

Four identified BarkLog backup directories were removed from the parent workspace
by moving them to macOS Trash. The two obsolete archives inside the board’s
`.backup` directory were also moved to Trash, keeping backups out of main. The active project and unrelated projects remain.
The full KMP rebuild supersedes the old tracked React Native tree; accumulated
source/design/docs changes are included in the authorized main-branch delivery.
