# New BarkLog care-notebook Rive · task047 R2

Owner correction #40 · 20 October 2026: make new Rive artwork for the dog app
instead of reusing the existing spaniel on the plan/paywall proposal.

- [Live local review](http://127.0.0.1:4278/refinements/rive-care-notebook/index.html)
- [Editable Rive file](https://editor.rive.app/file/barklog-care-notebook-plan-study/2667617)
- [Paywall in context](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-paywall)

This is an original cream/ink puppy with one upright ear, one folded ear, lime
collar and open care notebook. It is newly drawn vector artwork and a separate
Rive rig/controller. It is not the earlier spaniel with a different animation.
The approved Home character and native app assets have not been replaced.

## Delivered

- `companion.svg`: original named vector parts and same-art neutral fallback.
- `motion.py`: original 60fps channels, pivots, eased head/ear/paw/tail/page motion.
- `author.py`: strict new-file-only official local MCP author/rebuild/export path.
- `care-notebook.riv`: genuine runtime export from new cloud file 2667617.
- `care-notebook.rev`: genuine full editable export with embedded assets.
- `manifest.json`: source/runtime/editable/motion SHA256s and controller contract.
- `index.html` / `preview.js`: local interactive review using the actual Rive
  export and the existing pinned Rive runtime library.

Artboard: **BarkLog Care Notebook**. State machine: **Care Companion**. View model:
**Care**. Triggers: `hello`, `curious`, `rest`. Clips: Idle 6s, Hello 2.4s,
Curious 2.8s. Normal playback gives a bounded greeting or notebook page turn and
rests. No purchase celebration, scenery, filled press tint or continuous sales
animation. Reduced motion/failure retain this new character's own still.

## Rebuild

Open only file 2667617 in Rive; the script refuses all other files. The file was
created in the existing owned project 2025006. No membership, billing, publish,
sharing or library/account settings were changed.

```sh
python3 design/board/refinements/rive-care-notebook/author.py --update-motion
```

For an intentional SVG change in this new study only:

```sh
python3 design/board/refinements/rive-care-notebook/author.py --replace-art
```

`--seed` is for this file when empty. `--replace-art` replaces only the exact
named art root in this new file; Home's mascot file is never changed. Exports
use the official tool. The documented inline retry happens only after an actual
macOS sandbox refusal; no sandbox/security/branding restriction is bypassed.

## Verification / scope

The actual exported player entered Hello and Curious; real-time frames at
650/1250/1850ms and 750/1450/2150ms were inspected. Twelve plan-screen variants and
15 flow/motion/lifecycle/Rive checks pass with the new export. Native adoption,
physical accessibility and performance require the later reviewed KMP slice.
See [R2 evidence](../../../../docs/design/evidence/task047/rive-notebook/README.md).


## Later mobile approval · 20 October 2026

The owner approved this new artwork for Android/iOS (“Use this new Rive on
mobile”). Task047 bundles the exact runtime in both hosts, with a common
same-art still and shared Compose plan/paywall/membership layouts. Home keeps
the original spaniel. See the [native evidence](../../../../docs/design/evidence/task047/native/README.md).
The export manifest's board-study scope records the original authoring pass;
this later approval authorizes adoption without changing the approved export.
