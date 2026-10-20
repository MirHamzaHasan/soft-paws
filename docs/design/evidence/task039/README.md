# task039 — Atlas-only checks

18 October 2026. Supersedes active on-device-first routing; historical task037
runtime/timing evidence remains valid only for the now-paused local implementation.

- 123 JVM tests pass. Production and explicit
  live-review DI select Atlas-only; the test platform throws if any local runtime
  property is read, including during cleanup. Default review fixtures remain demo.
- Provider checks reject missing cloud consent and photo inference; exclude local
  automatic profile/logs and complete old local/demo exchanges; drop both sides of
  older Atlas exchanges when their source permissions no longer match.
- Real SQLite controller checks preserve a pending draft at the cloud-consent gate,
  then persist an Atlas-labelled reply/clear the committed composer while automatic
  journal reads are deliberately unavailable.
- Atlas /health/ready returned 200. No credential value was printed, changed, copied into the app or sent in an
  Atlas request by this change. No live authenticated generation or server configuration change
  is claimed. Firebase registration/context policy and signed-device proof remain
  separate requirements; Release gate remains disabled.
- The owner paused the approved graphical recent-care card before native UI.
  No local inference/model acceptance runs are part of this task.

Native iOS UI review: updated owned QA app in place and reopened the same private
preview journal with explicit live-review routing. The existing cloud/profile/record
choices were already checked and were not changed. The screen says “Choose what
Atlas sees”, “Text via Atlas”, describes selected-only sharing and shows no model
download controls. [Light screenshot](ios-atlas-consent-light.png). No Save, sign-in
or send action was performed, and preview auth/Atlas are disabled. Lower actions,
dark/large-text/assistive and signed-device review remain unverified. The existing
491,400,032-byte model file was confirmed preserved; it is not loaded.

The owned Android QA emulator was no longer running; the current APK is built but
no runtime installation/check is claimed. Other projects' devices were not used.

Final `python3 tools/verify.py --ios` verification passes Android/iOS Debug and
Release builds/bundle checks, lint, preserving migrations, 123 JVM tests and
30 metadata/tooling tests. This proves client compilation/behavior, not live Atlas
admission or physical/assistive QA. The initial Release run was superseded by the
final source after correcting the AI privacy header to “Text via Atlas”.
