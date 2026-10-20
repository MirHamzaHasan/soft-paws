# task030 — Glaxnimate automation and mascot review preview

Owner request: 17 October 2026. The owner selected a free/open-source path for
more expressive BarkLog animation, installed Glaxnimate and asked to start.
The agreed first step is automation proof and a reviewable mascot preview.
The owner then supplied a Glaxnimate crash report; continue through a working
automation path while preserving the original preview objective.

Status: automation proof and review preview implemented and visually checked;
owner review pending before native adoption.

Uses Ungenerated app workflow, motion, bubbly motion, interaction, accessibility,
no-slop and visual QA. Preserve the familiar dog, transparent ground, BarkLog
typography and restrained gestures; no decorative shadows/gradients or paid service.

## Delivered slice

One editable SVG character, nine editable Glaxnimate documents and nine native
Lottie exports: still, breathing/blinking idle, curious, glance, ears, sniff,
hello, stretch and celebrate. Brighter eyes/brows and a greeting paw detail refine
the existing dog instead of introducing another character. A short earned
celebration uses volume-preserving squash, a hop and a sampled spring landing.

The [live review study](../design/board/refinements/mascot-studio/README.md) has
close-up and Home-card views, light/dark, keyboard greeting, immediate gesture
interruption from the visible pose, pause/resume, shuffled quiet idles and
reduced-motion behavior. Example care moments are clearly labelled preview-only.
No network/account or journal data is involved in playback.

The pasted report points to Glaxnimate's Qt/macOS accessibility query path. Avoid
that GUI inspection route; its documented CLI imports/exports/renders successfully.
The owner's installed app and OS settings remain intact. Do not claim the upstream
GUI crash is fixed. Details and a repeatable rebuild are in the study README.

## Validation and boundary

Final results are recorded in [task030 evidence](../docs/design/evidence/task030/README.md).
Nine native Glaxnimate round-trips, 20 native renders/transparency checks,
36 browser captures, gesture interruption, keyboard/pause/reduced-motion, random
idles, light/dark, 375/390px/130% text, 44px targets and 10 text-contrast pairs
passed. Final repository metadata/tooling checks passed (23 tests).
This study does not approve the new native appearance, install Compottie in KMP,
close all-screen parity or establish native frame rate/build size. Review the
asset and motion before the native slice, then prove playback on both platforms.
Keep all work in this project and temporary captures in `.verify-build/task030/`.
