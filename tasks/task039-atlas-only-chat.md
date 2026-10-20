# Task039 — Atlas-only chat

Owner direction: 18 October 2026. Pause local LLM, RAG and recent-care-card work;
use Atlas only for current AI chat. This supersedes task037's on-device-first
routing. Task038's approved board remains a future design, with no native card.

Status: Atlas-only client implemented and platform verification passes.
Authenticated web generation using the native request shape passed on 19 October:
HTTP 200, real answer and matching required context receipts. Normal native Debug
apps subsequently displayed and saved real Atlas replies on iOS/Android simulators;
iOS identity/reply restoration also passes. Physical/store and broader policy
acceptance remain open; the existing Release gate stays off. See
docs/design/evidence/task040/native-2026-10-19/README.md for the bounded proof.

Implementation:
- AppContainer selects AtlasResponseProvider in normal and explicit live-review
  hosts. Default design fixtures remain labelled deterministic demos.
- No local model/runtime module is created at startup or cleanup, no automatic
  local journal retrieval, no download controls or on-device photo-analysis action
  in the active product flow. Installed files and old conversations are preserved.
- Cloud consent is required before sending. Previous local-only message consent
  does not authorize cloud processing; the field remains intact at the consent gate.
- Atlas receives only the current question, explicitly permitted profile/records,
  and eligible prior Atlas exchanges with matching still-allowed sources. Local and
  demo exchanges, automatic local context, images and image IDs are excluded.
- Selected source snapshots include saved structured care detail, legacy profile
  breed/age/notes, bounded notes and exact selected-record counts. No automatic
  whole-journal sharing or hosted vector index.
- Keep fresh Firebase UID checks, same-idempotency-key 401 refresh, required server
  policy receipts, cancellation, local safety guidance and response validation.
- Commit messages before clearing; failures preserve input; newer drafts survive.

Targeted checks: 123 JVM tests pass, including no local-runtime reads during DI
startup/cleanup, Atlas-only provider/privacy/history/permission tests, and real
SQLite controller proof with automatic journal reads deliberately unavailable.
Atlas /health/ready returned 200. This is health, not authenticated admission proof.

Final validation: `python3 tools/verify.py --ios` passes Android Debug/Release,
lint, preserving SQLDelight migrations, 123 JVM tests, 30 metadata/tooling tests,
and iOS Debug/Release host/bundle checks. Native iOS consent copy was reviewed in
the owned simulator; the app was updated in place and left open. Installed Qwen
and all journals remain intact, with no inference run. The owned Android QA
emulator was stopped, so its APK was built but not installed. New-card and local
model work remain paused. See docs/design/evidence/task039/README.md.

Live follow-up in task040: QA Firebase account creation/password sign-in pass on
the ad-hoc signed iOS simulator. A generic message-only app request reached Atlas
and returned HTTP 403. Exact backend denial is unknown; no generated response or
current server-policy approval is established. Journal/profile sharing stayed off.
Release remains disabled. See task040 evidence for the actual native error.
