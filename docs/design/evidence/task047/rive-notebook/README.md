> Later native adoption was approved and delivered. See [native evidence](../native/README.md).
> This R2 report records the original board-only study before that approval.

# task047 R2 · A newly authored care-notebook Rive

20 October 2026. Owner feedback #40 rejected using the existing spaniel again and
requested new Rive artwork. This revision replaces the illustration on the plan,
paywall and account-plan board previews. It does not change Home's native mascot,
the installed apps, journal data or purchase configuration. Native review remains
pending under the existing board-first workflow.

## Review / delivered source

- [Interactive new Rive review](http://127.0.0.1:4278/refinements/rive-care-notebook/index.html)
- [Editable cloud Rive file](https://editor.rive.app/file/barklog-care-notebook-plan-study/2667617)
- [Paywall](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-paywall)
- [Care plan](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-plan)
- [Account plan](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-manage-plan)
- [Source / rebuild / exports](../../../../../design/board/refinements/rive-care-notebook/README.md)

The newly drawn puppy has one upright ear, one folded ear, a cream/ink coat and
an open lime-trimmed care notebook. The art, SVG hierarchy, rig pivots and motion
are new. Rive file 2667617 in the existing owned project 2025006 contains the new
**Care Companion** state machine and **Care** view model, with `hello`, `curious`
and `rest` triggers. Three clips contain 273 original keyframes: Idle 6s, Hello
2.4s and Curious 2.8s. The head/ear/paw/tail motion accompanies an actual page
turn. It is a genuine exported Rive player, not CSS animation posing as Rive.

Genuine runtime `.riv` and embedded editable `.rev` exports were delivered. Both
were generated with the official exporter; no branding, plan, account or security
restriction was changed. The SHA256 manifest records the exact SVG, motion,
runtime and editable bytes. The old spaniel file/export remains unchanged. The
existing pinned runtime library is reused without a new SDK dependency.

## Verification

| Check | Actual result |
| --- | --- |
| Exported runtime | New Care Companion controller; actual Hello and Curious state events |
| New art motion | Real wall-clock frames at 650/1250/1850ms and 750/1450/2150ms inspected |
| Plan/paywall/account layouts | 12 light/dark, compact 375×667/130% text and reduced-motion captures pass |
| Motion/flow/lifecycle/Rive | 15 checks pass; no runtime errors or remote service requests |
| Rendered price/caption contrast | 32 pairs pass in both themes; palette unchanged |
| Reduced motion | Immediate selected-price final and the new character's own still |
| Export failure / lifecycle | New-art fallback, bounded rest, offscreen/pause/background stop and cleanup pass |
| Pricing / free access / future scanner | Three full prices and disabled purchases preserved; free return works; food scanner still Coming soon |
| Source syntax | Python compile and JavaScript syntax pass |
| Metadata / tooling | 30 tests and foundation/metadata checks pass |
| Export identity | Four delivered SHA256s match; original spaniel runtime hash preserved |

The normal app and native runtime were not rebuilt or launched for this board-only
revision. Physical frame rate, VoiceOver/TalkBack and native asset adoption are
not proved by these browser captures. The earlier R1 screenshots in the parent
directory are historical and still show the spaniel; the live screens use R2.

## Reproduce

Use the existing local server on 4278 and an existing Playwright install:

```sh
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs SCREEN_IDS=next-plan,next-paywall,next-manage-plan node design/board/premium/tools/qa.mjs http://127.0.0.1:4278/premium/index.html .verify-build/task047-rive-r2-layouts
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs node design/board/premium/tools/plan-motion.mjs http://127.0.0.1:4278/premium/index.html .verify-build/task047-rive-r2-motion
python3 tools/verify.py --metadata-only
```
