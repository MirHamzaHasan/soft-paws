# Soft Paws · cat-care board evidence

20 October 2026. This evidence covers the new **web design prototype**, not a
native app port, physical-device validation or a live service integration.
It records the initial moss palette. The later owner-requested colourful pass
and current evidence are in [soft-paws-color](../soft-paws-color/README.md).

The source is [`design/soft-paws/`](../../../../design/soft-paws/README.md).
See [the delivery task](../../../../tasks/soft-paws-task001-cat-redesign.md)
and [the product truth](../../../source-of-truth/soft-paws-product-engineering.md).

## Verification

- Board registry: 94 surfaces, 89 product screens/states plus 5 kit/motion screens.
  Ten chapter cards replay their own journeys. No duplicate screen IDs, missing
  sections, broken sequence members, missing route targets or broken script/style
  assets in the registry audit.
- Browser journeys: 15 checks pass, including entered name, save-to-Home, meal
  filtering, draft feedback, affirmative AI consent, disabled purchases and free
  exit, genuine Rive/view-model loading, transparent reaction, bounded rest and
  offscreen pause. No runtime warnings/errors in that run.
- Twenty light/dark token contrast pairs pass: reading text ≥4.5:1; input boundaries
  ≥3:1. The lowest checked muted-text pair is 4.60:1 on the light selected ground.
- [Layout sweep](layout-qa.json): 94 screens × light/dark/130% text = 282 checks,
  zero issues. [Compact 375 × 667 pass](compact-qa.json): ten selected screens
  across three modes = 30 checks, zero issues. Raw screenshots and
  temporary browser/venv output live in ignored `.verify-build/soft-paws/`.

During QA, fixes included missing icons, an opening null subtitle, Home's
text/mascot overlap, undersized week/day/event targets, a range-input overflow,
fully visible recurring plan prices, real 375/390/430 canvas support, targeted
player navigation, reduced-motion query handling and deprecated Rive event/API
usage. No warning was hidden to produce a pass.

## Review artifacts

- [Light screen sheet](light-review.jpg) and [dark screen sheet](dark-review.jpg).
- [Real-time Rive frames](rive-motion.jpg): 250, 600, 1000, 1700 and 3300 ms.
- [Home → meal transition](transition.jpg): 1100, 1220, 1370 and 1800 ms after load,
  with the tap at 1000 ms.
- [Browser journey results](journeys.json) and [actual token contrast](contrast.json).
- All 94 light and 94 dark rests were visually inspected in private contact sheets;
  larger-text samples were also inspected. Content below the fixed footer is
  intentionally scrollable, not clipped from the information hierarchy.
- `python3 tools/verify.py --metadata-only`: foundation/resource/parity/plugin
  checks and 30 tool unit tests pass. Native source was unchanged, so platform
  builds and device execution were not rerun for this board-only change.

## Rive provenance

New owned file [2667919 · Soft Paws Cat Companion](https://editor.rive.app/file/soft-paws-cat-companion/2667919),
with a real 480 × 520 runtime export and editable `.rev`. Original SVG and
reproducible Python author/motion sources are included. The MCP artboard capture
confirmed unpainted areas are transparent; `rest.png` is the actual captured
artboard. The manifest records SHA-256 hashes for all delivered assets.

The author script accepts only this new file ID. Existing spaniel/notebook puppy
Rive files and native assets were not modified. No account plan/branding restriction
was bypassed. No standalone Rive SKILL.md was available; the working local Rive MCP
and inherited authoring wrapper were used directly.

## Limits and next gate

All data is synthetic and all service/system operations are honest unavailable or
handoff previews. No native journal was changed; no simulator was navigated; no
real login, AI request, call, location request, photo upload, export or transaction
was performed. A prototype save is in memory, not SQLite. Prices are carried-over
design proposals; the new app has no configured store entitlement.

The owner subsequently approved this direction for shared Compose adoption.
Separate Soft Paws app identifiers are now implemented; current native delivery,
remaining parity, assistive/device and service/store gates are tracked in task002.
