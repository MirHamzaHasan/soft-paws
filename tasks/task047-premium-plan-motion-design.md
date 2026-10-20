# task047 · Plan and paywall composition/motion

Owner request · 20 October 2026: make the paywall and “your plan” screen less flat,
use Ungenerated, add animation and Rive where appropriate.

Scope: setup plan reveal, paywall and account plan view. Preserve the approved
BarkLog fonts/tokens, no decorative shadows/gradients, all three USD prices,
RevenueCat configuration boundary, explicit free path and original data.
The owner's later #40 correction requests fresh Rive artwork instead of reusing
the spaniel. The three plan screens now use a new original notebook puppy in its
own editable Rive file/controller/export. Home's approved spaniel and installed
native assets remain unchanged. Reuse the runtime library; do not purchase
services, change account/billing settings or add fake trial/success states.

Status: implemented in shared Compose on Android/iOS. The owner approved the
new artwork and reviewed compositions (“Use this new Rive on mobile”). Final
Debug/Release builds, lint, migrations, 146 JVM tests, both native journeys,
large text/reduced motion and the journal-preservation audit pass. Physical and
assistive checks and task022's individual owner review remain separate gates.
See [native evidence](../docs/design/evidence/task047/native/README.md).

Latest revision: [new Rive review](http://127.0.0.1:4278/refinements/rive-care-notebook/index.html),
[editable cloud file](https://editor.rive.app/file/barklog-care-notebook-plan-study/2667617),
and [R2 evidence](../docs/design/evidence/task047/rive-notebook/README.md).
The existing review invitation was answered with the request for new artwork,
not approval of the earlier reused-character direction.

## Intended direction

- One named-dog care card on the plan reveal: entered answers land into their rows;
  no invented care stats or automatic reminder consent.
- Compact full-price choices, one moving lime selection and a rolling chosen price;
  text/cards use curves, only touched controls use the established Firm spring.
- Transparent Rive character with a short greeting/reaction and quiet rest. No
  perpetual sales/reward animation, offscreen playback, filled mascot press tint
  or motion under Reduce Motion. Same-art SVG on load failure.
- Account plan view uses a membership composition and honest Free/preview status,
  with direct store management/cancellation and preserved existing journals.

## Verification and review

Capture light/dark, compact/130% text, reduced motion, entry/choice interruption
frames and the Rive success/failure lifecycle. Check full visible recurring prices,
keyboard labels/selection, free/restore paths and no remote service requests.
No live AI recheck or real purchase is part of this visual pass.

Completed: 12 light/dark/compact-130%/reduced layouts, 15 motion/flow/Rive checks,
32 rendered contrast pairs, 94 live token contrast pairs, six existing Premium/
Safety journeys, JavaScript syntax and 30 metadata/tool tests pass. Rest and
25/50/75% motion screenshots were inspected. See
[evidence](../docs/design/evidence/task047/README.md).

The owner subsequently requested the Premium cat/dog food scanner/pantry recalls
as a future feature. Its separate Coming soon card is in this proposal; no scanner
or monitoring service exists yet. See [task048](task048-premium-pet-food-scanner.md).

Initial revision: Rive's local MCP connection was inspected read-only, with the owned paid file
2660676 open. Dog Controller and seven authored clips are available; no library
or component assets are linked in that file. No export, artwork, membership or
billing settings were changed. That revision reused the spaniel runtime export;
it is superseded for these three screens by the later notebook puppy.

R2: original vector art, rig pivots, 273 keyframes across Idle/Hello/Curious, the
Care Companion controller and hello/curious/rest triggers were authored through
Rive's official MCP in new file 2667617. Genuine `.riv` and editable `.rev` exports
are delivered alongside the SVG/motion/rebuild source and SHA256 manifest. The
exported player shows the new head tilt and page turn, with a same-art still and
the existing reduced-motion/offscreen/disposal behavior. Twelve screen variants,
15 motion/flow/Rive checks and 32 rendered contrast pairs pass again. No native
UI approval is inferred from the new-art request.

Review requested through the live paywall/care-plan/account-plan links. The
workflow says: “No native UI work on a screen that is not approved on the board.”
The owner subsequently approved this new-art direction for Android and iOS. The native delivery and completed checks are recorded below.


## Native delivery · 20 October 2026

The three approved screens now run as shared Compose with the new original
notebook puppy. Both official platform renderers select file/artboard/controller
without replacing Home's spaniel. A common same-art still covers reduced motion,
load failure and outgoing snapshots. Greetings/page turns return to quiet rest;
foreground, visibility and disposal own playback. No new runtime SDK was added.

The native compositions retain the full profile sheet (including legacy saved
profile notes), all three full-price choices, one retargeted selection spring,
rolling chosen price, pinned free exit and truthful membership status. Store
configuration, real entitlements, restore/errors, Debug-only preview and existing
free journals remain behind the original controller boundaries. The food scanner
is an explicitly unavailable future card. No billing configuration or live AI
request was made.

The final canonical `tools/verify.py --ios` matrix passes. Android's complete new
journey and both iOS new-screen/motion tests pass; both themes, large text, reduced
motion and mid-animation frames were inspected against R2. Test automation uses
the actual scrolling viewport above the pinned free footer. Normal SQLite row
hashes match before/after updates, testing and final normal-mode relaunch. Both
apps are left in normal mode; UI automation has ended. This does not claim full
task022 parity, physical haptics/frame pacing or VoiceOver/TalkBack acceptance.
