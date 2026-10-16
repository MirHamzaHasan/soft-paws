# task026 — Home mascot and care card

Owner request: 16 October 2026. Status: board refinement implemented and checked;
awaiting owner review. Refines task024/task025, using Ungenerated workflow,
review, app screens, motion, bubbly motion, accessibility, visual QA and no-slop.

## Requested changes

Make the dog larger and more animated, add different random animations and move
the Earlier/Latest named care strip into the card where the dog animates.

## Implementation

- Home's dog grows from an 80×91 SVG box to 122×129, beside the care count. Named
  care records and Earlier/Latest stay inside that same card, above Quick care.
  The larger card scrolls with the page; all four quick actions remain reachable.
  The fixed AI entry reserves its measured height, including with larger text.
- `premium/mascot.js` reuses the vector dog and gives each front paw a pivot.
  Six shuffled idle actions: curious tilt, glance either way, ear perk/double
  blink, sniff, paw wave and stretch. Each action settles, then waits 4.4–7.4 s.
  The bag prevents repeats until all six play, including immediate cross-bag repeats.
- Tap/keyboard greeting and committed preview saves interrupt idle from its visible
  pose, with one animation owner per part. Save reaction uses a volume-preserving
  squash/hop/sampled spring. An offscreen reward waits until visible and checks
  that its record still exists. No mascot action writes care data.
- Home starts the controller explicitly; onboarding and identity dogs use the same
  controller. Entry and content use calm curves; the character owns the lively move.
- Offscreen, hidden-tab, paused and disposed controllers stop. Reduced motion cancels
  current movement and stays still. Native VoiceOver/TalkBack and frame rate are not
  proved by browser tests.
- Opening a Home care record and using Back returns to that Home variant and keeps
  the care rail's browse position. The rest of the previous proposal stays intact.

## Validation and limits

See [evidence](../docs/design/evidence/task026/README.md) and
[preview instructions](../design/board/premium/README.md).
Final checks: 216 screen/variant renders, 28 real-time mascot frames, nine Home/
mascot check groups, three onboarding regressions, 94 live contrast pairs and
repository metadata. No runtime, horizontal overflow, undersized active-button
or empty-icon findings.

All checks are browser-prototype checks. No Compose/native app source, original
exact-board reference, installed journal, pricing or live integration is changed.
Owner review remains open before a native port of this proposal.

## Subsequent native authorization

The owner later authorized the task024–026 chapter in shared Compose.
[task027](task027-native-companion-board-and-main.md) records that port, real local
persistence, explicit demo login/replies and the no-simulator validation limit.
The board checks and native fingerprints above describe this task's earlier
board-only delivery and are retained as historical evidence.
