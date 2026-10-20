# task030 — Glaxnimate mascot evidence

17 October 2026. Review preview, not native visual approval.

The installed Glaxnimate `0.6.0-git-d2da67a` CLI successfully imported generated
Lottie data into editable `.rawr` documents, re-exported all nine clips and rendered
20 selected native frames. Transparency validation found clear edges in all
20 frames, with the character staying inside the canvas.

The owner-supplied crash stack and failed GUI inspection implicate the Qt/macOS
accessibility query path. That path was avoided; no system accessibility/security
setting or app binary was modified. This pass does not repair or certify Glaxnimate's GUI.

## Inspected evidence

- [Real-time motion contact sheet](contact-sheet.png): greeting, curious and saved
  reaction intermediate frames, Home sizing in both grounds and interrupted wave.
- [Large-text phone](phone-large-text.png) and [dark preview](dark-rest.png).
- [Native Glaxnimate wave](glax-wave.png) and [native celebration](glax-celebrate.png),
  including the corrected expression/paw opacity after import.
- [Browser results](browser-checks.json): 36 captures, eight moving clips plus
  still, keyboard greeting, pause/resume, system reduced motion and explicit local
  preview opt-in, idle shuffle and actual scheduling, 375/390px and 130% text,
  targets at least 44px; no page errors or failed resource requests.
- An interrupted wave changes actual rendered path bounds by at most 0.0001px
  at the handoff, then eases into the new action through one player.
- [Native alpha/contrast checks](asset-validation.json): all 20 native frames
  have transparent edges and stay in bounds; all 10 text pairs meet 4.5:1.
- Repository metadata checks and 23 tooling tests passed, plus `git diff --check`.

Also opened the preview in the owner's Firefox, verified its controls and opted
into preview motion while preserving the system's Reduce Motion setting. When
the owner began using the preview, further live navigation stopped.

Compottie/native playback, physical-device accessibility/frame pacing and app-size
impact are not proved by these browser/CLI checks. No KMP dependency or installed
journal is changed by this study. Screens remain subject to owner review.

Working captures/build logs remain in `.verify-build/task030/`. See the
[study source and rebuild instructions](../../../../design/board/refinements/mascot-studio/README.md).
