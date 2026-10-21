# Soft Paws task003 · cat keeps moving · 21 October 2026

Status: complete for this playback correction and simulator verification.

The owner reported that the application cat did not animate. Inspection found
that the native controller paused playback after its bounded greeting/reaction,
freezing the authored seven-second Idle animation. The displayed iOS review
namespace also had Reduce motion enabled. Normal application settings and OS
accessibility preferences are separate and must not be overridden.

The shared player now returns to the original cat's breathing, blink and tail
loop after greetings, taps and committed save reactions. Reactions remain
bounded; Idle never becomes a save/reward cue. The renderer still stops when
offscreen or backgrounded, and uses the same-art still for reduced motion,
snapshot capture or failure. No Rive artwork, runtime, library or service changed.
The live board follows the same policy.

Native runtime checks pass on Android and iOS. Tests compare rendered cat pixels at
4.5, 6.6 and 9.7 seconds after readiness, then repeat after a tap and in dark
theme. Reduced-motion pixels must remain unchanged. The owned review preview
finishes with normal motion enabled; OS Reduce Motion remains respected. A
separate iOS test verifies that the setting survives relaunch without a motion
argument override. Android Debug/Release/lint/migrations and 153 JVM tests pass;
both iOS Debug/Release simulator hosts and final bundle checks pass.

See [the native motion evidence](../docs/design/evidence/soft-paws-cat-motion/README.md)
for light/dark frame comparisons, actual Android pixel counts, paired Home
captures and the test-harness corrections.

The browser journey now waits for real runtime readiness. Its previous offscreen
assertion relied on a pause that had already happened: the kit screen did not
scroll the cat fully out of view. The test now creates scroll space, verifies
the cat is offscreen and paused, then verifies it resumes when visible again.
All 16 browser journeys pass, including real Rive loading, reduced-motion still,
transparent interaction, return to idle and visibility pause/resume.

The full native port remains **29 implemented-unverified / 60 pending**. This
motion correction does not imply approval or implementation of other surfaces.
