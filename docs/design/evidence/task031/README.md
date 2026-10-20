# task031 — actual Rive mascot evidence

17 October 2026. Original spaniel authored in the owner's installed Rive 0.9.272
editor via official local MCP server 0.6. Source/controller/export:
[study README](../../../../design/board/refinements/rive-dog/README.md).

## Passed checks

- Seven exported clips, with all six view-model trigger actions completing and
  returning to Idle. Eighteen real-time frames at 25/50/75% of each reaction,
  plus rest, paused, interruption, theme and phone-context captures: 32 total.
- Actual canvas pixels have transparent edges and no clipping throughout the
  captured poses. The native Rive capture also has transparent edges; at 640px
  its occupied bounds are `[146,69,520,576]`. The dog has no rectangular backdrop.
- Keyboard greeting, live-pixel Pause/Resume, system reduced-motion cancellation,
  local motion opt-in and restoration to the neutral source SVG.
- Greeting → Saved interruption: mean per-channel pixel change 2.077 over two
  rendered animation frames; inspected the handoff and return. This is a bounded
  discontinuity check, not a frame-rate or velocity-continuity claim.
- One random action after the quiet gap, scheduling off, real scroll-driven
  offscreen pause/resume, real page navigation cleanup once and usable browser Back.
- Light/dark, close-up/Home-card, 375/390px and 130% text with no page overflow;
  active controls at least 44px. The care region scrolls separately at narrow widths.
- Ten text pairs meet 4.5:1 and four unchecked-control border pairs meet 3:1.
- No browser console/page errors, failed resource responses or external playback
  requests. Runtime JavaScript/WASM, fonts and the `.riv` are served locally.
- A separate live Firefox preview was opened and the local motion opt-in enabled
  while preserving macOS Reduce Motion. Browser driving stopped when the user
  changed Firefox during review. Neither simulator journal was navigated/reset.

The headless checks run in their own browser, not in the owner's Firefox session.
The current Rive workspace adds a required intro splash; see the retained splash
capture. It has not been removed or hidden. Its `.rev` export was refused for the
workspace plan, attempted once and not retried. The editable cloud file and
original SVG/motion/authoring sources remain available.

## Captures and machine-readable results

- [Pose contact sheet](contact-sheet.png)
- [Light rest](light-rest.png)
- [Greeting paw detail](hello-0.25.png)
- [Dark Home-card greeting](dark-home-wave.png)
- [Phone with 130% text](phone-large-text.png)
- [Native transparent capture](rive-neutral.png)
- [Required Rive intro splash](rive-splash.png)
- [Browser checks, capture times and alpha bounds](browser-checks.json)
- [Native transparency and contrast](asset-validation.json)

## Validation boundary

No native Rive runtime or replacement mascot was installed. Android/iOS playback,
native runtime size, physical-device fps/energy and VoiceOver/TalkBack remain
unverified. This study does not close task022 parity or approve the new mascot.
The repeatable `--update-motion` path was executed; `--seed` reconstructs the
same import/rig steps but has not been run end to end in a second empty cloud file.
No extra cloud test file was created for that purpose.

Full temporary captures/logs stay inside `.verify-build/task031/`. Repository
metadata validation is recorded in `metadata.log` there.
