# Plan / paywall refinement · 20 October 2026

Later owner correction #40 requests new Rive art. The current plan screens use
the newly authored care-notebook puppy in file 2667617, not Home's spaniel. The
new dog, notebook page turn and head tilt are in their own original SVG, rig,
controller and genuine `.riv`/`.rev` exports. The first-revision reuse rationale
below is historical; the existing native mascot stays unchanged.

This pass reuses BarkLog's existing researched journey and kit. It changes only
`next-plan`, `next-paywall` and `next-manage-plan`; it does not introduce a new
onboarding, trial, store offer or purchase entitlement.

## What we took

- **Headspace's answers → recommendation structure**, already reviewed in
  [the goals flow](https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e):
  make the entered answers visible again. BarkLog's dog, priorities, check-in
  rhythm, reminder state and AI topics become one care card. No invented scores,
  health readings or recommended subscription are added.
- **Finch's companion continuity**, already reviewed in
  [the reminders flow](https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa):
  keep the same companion through setup and daily care. Reuse BarkLog's original
  clean Rive spaniel, same-art still, a single greeting and bounded touch reaction.
  This takes structure only; it copies no Finch artwork or reward economy.
- **The existing honest price boundary**: three equally readable complete USD
  prices, a visible checked choice, a permanent free return and reachable restore
  and legal links. No trial, invented discount, scarcity or testimonials. Monthly
  remains the default, with no “recommended” claim. The owner selected prices in
  task046; older research statements that prices are undecided are historical.

The reference screenshots remain in this directory. No new conversion or
performance claim is made from this refinement.

## Motion and native mapping for later review

| Object | Board behavior | Shared Compose equivalent after approval |
| --- | --- | --- |
| Plan care card | 24px rise, 620ms, 80ms delay, emph `(0.16,1,0.3,1)` | Single translation/alpha state, `tween` with matching cubic easing |
| Entered values | 25px into their final row, 900ms emph, 180ms then 170ms stagger | Per-value translation/alpha; same final content and reading order |
| Price choice | One indicator translating from its current position; Firm response .42 / damping .86 | One retargetable `Animatable`; native spring mapped from the existing Firm control |
| Selected money | Only changed characters roll for 260ms strong `(0.23,1,0.32,1)` | Stable money slots/translation; periods remain readable words |
| New notebook puppy | New Care Companion controller, `hello` / `curious` page turn, then its own still | Existing runtime adapters can host a later reviewed new asset; no new SDK |
| Reduced Motion | Immediate final content/selection and same-art still | Existing reduced-motion setting; no Rive playback |
| Fixed free action | Measured footer; scroll viewport ends above it | Measured bottom slot / safe inset; do not cover price cards |

One object owns one pose. Interrupted selections cancel the old animation and
start from its current computed position. Only transform, opacity and blur move;
layout, text wrapping and prices are never interpolated frame by frame. Rive
uses its authored timeline; the board speed control slows the UI, not that file.
Offscreen/background motion stops, disposal cleans up observers/player, and a
failed Rive export keeps the original transparent vector.

No native UI has been ported in this pass. New direction requires board review
under AGENTS.md and `app-design-workflow`.
