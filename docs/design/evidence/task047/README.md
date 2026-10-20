> Latest: the owner approved the new R2 Rive on mobile. The shared Compose port
> and Android/iOS verification are complete; see [native evidence](native/README.md).
> Earlier board-only status below records the original review pass.

# task047 · Plan and paywall review evidence

**Latest: [R2 new Rive notebook puppy](rive-notebook/README.md).** The owner
rejected reusing Home's spaniel in feedback #40 and requested fresh artwork. R2
has a new Rive document/controller, original vector art and genuine runtime/
editable exports. Captures below are the historical first revision; the live
three plan screens now use R2. Native review remains pending.

20 October 2026. Board proposal implemented; **owner review pending before the
native port**. Task046's installed Android/iOS app, billing configuration and
journals remain unchanged. These are synthetic browser fixtures, not live AI,
store or native-device proof.

## Review

- [Paywall](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-paywall)
- [Care plan reveal](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-plan)
- [Account plan](http://127.0.0.1:4278/premium/index.html?reducedMotion=false#play-next-manage-plan)
- [Research and later native motion mapping](../../../../design/board/premium/research/plan-paywall-047.md)

The care plan uses the actual entered dog name/stage/breed, priorities, check-ins,
reminder state and AI topics. Values glide into their own final rows. Full profile
review stays available. The paywall displays USD $2.99/week, $6.99/month and
$39.99/year together, with one checked moving indicator and rolling selected
money. The free journal action stays visible above the phone's safe area. All
purchases remain disabled pending store setup. Free/restore/account return paths
remain usable. The account view distinguishes Free from an explicit preview state.

The later food-scanner request is a separate “Coming soon · Premium” card and
[task048](../../../../tasks/task048-premium-pet-food-scanner.md). It is not sold as
an available feature. No scan, pantry persistence, photo upload or recall monitor
is implemented by this pass.

## Checks

| Verification | Result |
| --- | --- |
| Three screens × light, dark, compact 375×667/130% text and reduced motion | 12 captures; no runtime errors, horizontal overflow, empty icons or targets under 48px |
| Authored Rive greeting/curious states, bounded rest, offscreen/pause/background, failure/disposal | Pass; background visibility event is synthetically dispatched |
| Price selection, interrupted reversal, keyboard, immediate reduced-motion final | Pass |
| Free route, account → paywall → free return, profile dialog and future scanner label | Pass |
| Motion/flow/Rive tool | 15 checks; no runtime errors or remote requests |
| Rendered paywall copy and price contrast | 32 pairs pass in both themes |
| Current kit's live token contrast | 94 pairs pass |
| Existing Premium/Safety board regression | Six journeys pass |
| Account Premium preview in both themes | Preview/no-purchase labels, future scanner and cancellation checked separately |
| JavaScript syntax / Git whitespace | Pass |
| `python3 tools/verify.py --metadata-only` | 30 tests and metadata pass; platform builds not requested for a board-only change |

Actual screenshots at rest and selection/reveal 25/50/75% were inspected. The
compact pass was adjusted so the complete recurring price cards and the free
action remain readable at 130% text. Phone/assistive/native animation and
performance claims still require the later native port and device review.

## Rive

The original clean runtime from task032 and its same-art SVG are reused, with no
new dependency, authoring or export. The local official MCP connection was read
with file 2660676 open: Dog Controller and Idle/Hello/Curious/Saved/Sleepy/Sniff/Ear
perk are present. No additional libraries/components are linked in that file.
No account, billing or artwork was changed. Read-only result is in
`rive-connection.json`.

The new wrapper waits for the controller's first Idle frame before a greeting;
the check asserts actual Hello/Curious state events. Playback is bounded and
returns to the neutral SVG. It stops offscreen/background/paused, cleans up when
disposed, and never starts under Reduce Motion. Failure retains the transparent
same-art still. Rive follows its authored timeline; the board speed control slows
the UI only.

## Reproduce

Use the existing local server on 4278 and an existing Playwright installation:

```sh
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs SCREEN_IDS=next-plan,next-paywall,next-manage-plan node design/board/premium/tools/qa.mjs http://127.0.0.1:4278/premium/index.html .verify-build/task047-board-final
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs node design/board/premium/tools/plan-motion.mjs http://127.0.0.1:4278/premium/index.html .verify-build/task047-motion
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs node design/board/premium/tools/contrast.mjs .verify-build/task047-live-token-contrast.json
PLAYWRIGHT_MODULE=/absolute/playwright/index.mjs node design/board/premium/tools/premium-safety.mjs http://127.0.0.1:4278/premium/index.html .verify-build/task047-safety-regression
python3 tools/verify.py --metadata-only
```

Source is isolated in `premium/plan-motion.css`, `premium/plan-rive.js` and
`premium/screens/plan-motion.js`. New visual directions require board approval
under AGENTS.md and the explicitly used Ungenerated workflow; no native screen
has been represented as updated or approved here.
