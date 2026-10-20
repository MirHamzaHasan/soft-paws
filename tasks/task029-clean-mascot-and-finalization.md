# task029 — Clean mascot interaction and finalization checklist

Owner request: 17 October 2026. Remove the rectangular background seen when the
dog is tapped; retain the approved clean artwork and animation. Provide the full
connection/configuration checklist needed to finish the app.

Status: implemented; Android/iOS Debug and Release checks passed. Targeted
iOS tap-state visual check passed; final device/all-screen QA remains separate.

The vector contains no rectangular background. `AnimatedDog` used the default
Compose clickable indication, which paints its full rectangular bounds during
interaction. Use an explicit remembered interaction source and no indication;
keep the existing wave, button semantics, keyboard activation, label and reduced
motion behavior. This shared component covers onboarding, identity and Home.
No raster asset, layout, care data or service provider changes are needed.

The [finalization checklist](../docs/release/finalization-checklist.md) separates
real local functionality from demo auth/AI, records owner inputs and remaining
engineering, native/device QA and distribution work, and leaves prices undecided.
It does not activate services or authorize publishing.

## Validation

- `python3 tools/verify.py --ios` passed: Android Debug/Release, lint, 75 JVM
  tests, preserving SQLDelight migration checks, 23 tooling tests and both iOS
  simulator host configurations/bundle checks.
- Final metadata checks and `git diff --check` passed.
- Reproduced the tinted rectangle on iOS before the update; inspected the
  updated mascot waving after a tap with no rectangle, plus its settled state.
  Android updated opening rendered cleanly. See [screenshots and limits](../docs/design/evidence/task029/README.md).
- Existing iOS linker warning: bundled ICU object targets 17.2 while the host
  declares 15.0. This is recorded as a minimum-OS release gate in the checklist;
  no deployment target was changed by this mascot fix.
- Both QA apps were updated in place and remain open. No uninstall, journal
  clear or service activation. Temporary logs stay in `.verify-build/task029/`.
