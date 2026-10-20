# task029 — Mascot tap background

17 October 2026. Narrow correction to the shared `AnimatedDog` interaction; the
approved vector, layout, wave/idle timing and reduced-motion logic are retained.

## Visual inspection

- [iOS before tap fix](ios-before-tap.png): reproduced the full rectangular tint
  by clicking the dog on the existing practice screen.
- [iOS after tap fix](ios-after-tap.png): updated Debug host, tapped the dog;
  inspected the wave in flight and the settled screen. No tinted rectangle.
- [Android updated opening](android-opening.png): updated Debug app renders the
  same shared vector on its clean ground. Android tap-state capture is not claimed.

iOS: existing BarkLog Visual Review 20261016, iOS 18.5,
`D9F26A43-4A92-4E2A-8CC5-0147A80F87EF`. Android: existing API 35 QA emulator,
`emulator-5554`. Apps were updated in place; no uninstall, journal reset or
destructive fixture replacement. Only the explicit review UI was opened.
Both review apps remain open after the targeted check.

Also inspected the live approved board opening and tapped its mascot in Firefox.
The board has transparent art and an outlined focus state; no board redesign was needed.
Native button semantics/label and keyboard activation are retained by `clickable`;
decorative instances remain excluded from accessibility. No animation or colour
tokens changed. VoiceOver/TalkBack, physical feel, dark/large-text regression and
exhaustive motion frames are not established by this narrow screenshot pass.

## Build verification

`python3 tools/verify.py --ios` passed: Android Debug/Release/lint, 75 JVM tests,
SQLDelight migrations, 23 tooling tests and iOS Debug/Release simulator hosts with
bundle inspection. Final metadata and whitespace checks passed. Both iOS links
emit the existing ICU 17.2 versus host 15.0 deployment warning; older OS support
remains a release gate. See [machine-readable results](checks.json).

Temporary logs are in ignored `.verify-build/task029/`.
This evidence does not close task022's all-screen parity
ledger, task028's unfinished full journeys or task016's physical/store gates.
