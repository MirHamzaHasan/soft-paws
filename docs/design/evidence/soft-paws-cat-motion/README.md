# Soft Paws · continuous cat motion · 21 October 2026

The owner reported that the application cat looked static. The shared player
explicitly paused after its greeting/reaction, freezing the original seven-second
Rive Idle. The iOS review namespace also had Reduce motion enabled. The player
now returns to its authored breathing, blink and tail loop while visible and in
the foreground. Taps still produce a bounded greeting; committed saves retain
their separate reaction. System/app Reduce Motion, offscreen/background pause,
transparent interaction and same-art fallback remain intact.

No new art, Rive export, runtime dependency, account or service was introduced.
The original clean runtime is still file 2667919; its contract and hashes remain
in `design/soft-paws/assets/cat/manifest.json`.

## Actual checks

- Android Debug/Release, lint, migrations and all **153 JVM tests pass**.
- The Android native motion test passes in **40.607 seconds**. It compares actual
  cat pixels after the greeting, after a tap, in dark theme and with reduced
  motion enabled. It excludes clocks and the rest of the screen.
- [Android frame comparison](android-frames.jpg), full native PNGs and
  [actual pixel counts](android-pixel-checks.json) accompany this note. The two
  reduced-motion frames have **zero changed pixels**; all moving comparisons
  change thousands of pixels. Timing labels are the scheduled capture points,
  not a frame-rate measurement.
- The iOS rendered-pixel case and a separate saved-setting/relaunch case both
  pass. [iOS frames](ios-frames.jpg) show the same transparent character in light
  and dark themes. The settings case proves the stored choice without a motion
  launch-argument override; the review preference ends at `false`.
  [Settings before/after](ios-saved-setting.jpg) shows both saved choices.
- Home comparison sheets: [light](home-paired-light.jpg) and
  [dark](home-paired-dark.jpg). Viewport sizes and retained synthetic records
  differ; these are composition/runtime evidence, not exact pixel parity or
  individual visual approval.
- **16 browser journeys pass**, including actual Rive file/view-model loading,
  reduced-motion fallback, return to idle and offscreen pause/visible resume.
  Browser captures after the greeting also contain actual character changes.
- Current-source iOS Debug/Release simulator builds and both bundle checks pass,
  including the independent identity, runtime plist and font resources.

Early combined iOS attempts completed their motion assertions but failed in the
settings helper: an offscreen/moving switch and an assumed UIKit-style numeric
value. This Compose control reports state through accessibility traits. The
helper now uses a slow scroll, waits for stable bounds, taps the observed track
and verifies saved behavior after relaunch. The final pixel and settings cases
are separate passing runs; earlier failed exits are not counted as passes.

The browser test was also corrected: its old kit-screen scroll did not move the
cat fully offscreen. It now adds scroll space and verifies the actual viewport
position before accepting a pause. It waits for runtime readiness rather than
assuming a fixed load time.

Only the separate `soft-paws-day-v1` review namespace is used. Normal journals,
drafts and models are preserved. OS accessibility preferences are not changed.
Physical-device frame rate and assistive-technology behavior are not claimed.
The wider native port remains 29 implemented-unverified surfaces / 60 pending.

Before this slice the owned Android guest stopped responding to shell commands
after the Journal suite. It was restarted without wiping its data; the motion
test above passed afterward. This is recorded as QA-host instability, not an
application crash or a physical-device result.
