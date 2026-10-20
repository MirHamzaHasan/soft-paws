# task047 · Native plan companion and reviewed screens

Owner approval · 20 October 2026: “Use this new Rive on mobile.”

The new notebook puppy is bundled in Android and iOS and rendered by the existing
official Rive runtimes behind shared Compose. The care-plan reveal, paywall and
account-plan view use the approved R2 compositions. Home retains its original
spaniel. These captures use the separately named synthetic review journal, not the
caregiver's normal records. The native review bar accounts for the shorter viewport;
production has no review controls.

## Delivered behavior

- Plan: the dog's saved/setup context, named care card, staggered values and full
  profile sheet, including legacy breed/age/notes when present.
- Paywall: all three full recurring prices, one continuous Firm selection, rolling
  chosen price, bounded greeting/page-turn reactions and a pinned free exit.
- Account plan: truthful free, Debug-preview or real store-access status. Existing
  store management, restore and ending the local preview remain available.
- Reduced motion uses the new character's own still. Live instances stop when
  offscreen/backgrounded or captured as outgoing pixels, and close on disposal.
  The mascot has no rectangular press/hover fill. No perpetual sales animation.
- Existing entitlement/configuration guards, localized offers, purchase errors and
  free care access are retained. The unconfigured purchase/restore actions stay
  unavailable. The pet-food scanner card explicitly says Coming soon/unavailable.

## Validation

| Check | Actual evidence |
| --- | --- |
| Android Debug/Release, lint, migrations | Final canonical verifier passes |
| iOS Debug/Release host and bundle resources | Final canonical verifier passes |
| JVM/domain/storage suite | 146 tests, zero failures/errors/skips |
| Metadata/tool suite | 30 tests and foundation/token/plugin checks pass |
| Android native journey | Light/Dark, full profile, actual Rive readiness, all billing choices, disabled purchases/restore, free exit, manage-plan entry, reduced motion and 130% font scale pass |
| Android motion | Real-time quarter-speed entry and interrupted selection frames inspected; one moving indicator, readable final price, actual page turn |
| iOS native journey | Both new tests pass: Light/Dark profile/plan switching, actual Rive readiness, disabled purchases/restore and free exit; entry frames and reduced-motion final pass |
| iOS larger text | All three screens captured in Light/Dark at system XXXL, then original text size restored |
| Normal journal preservation | Before/after row counts and SHA256s match after updates, tests and normal-mode relaunch: Android 1 dog/17 care events, iOS 1 dog/5 care events; all existing care items and local documents unchanged |
| Artifact identity | Both bundled runtime copies match the reviewed R2 export; original spaniel copies unchanged |

Build output is in [build-verification.log](build-verification.log). Android
runtime results are in [android-journey.log](android-journey.log), with settled,
large-text and reduced-motion [captures](android/),
[entry frames](android-motion-entry/) and
[interrupted selection frames](android-motion-selection/). The reviewed board reference
remains [R2](../rive-notebook/README.md). iOS results are in
[ios-retry-summary.json](ios-retry-summary.json) and
[ios-motion-test.json](ios-motion-test.json), with [captures](ios/).
The successful retry corrected the XCTest swipe start to lie above the pinned
footer; no product change or journal reset was needed.

The motion review uses wall-clock captures, not virtual-time screenshots. Captured
CLI input completion times are recorded alongside the frames; encoder startup
and input delivery add timing uncertainty. These are visual interruption checks,
not physical-device frame-pacing measurements.

No real purchase, store catalog setup, live AI recheck, scanner/recall service or
journal upload was performed. RevenueCat IDs and live AI admission remain deferred
by the owner. Signed physical-device, VoiceOver/TalkBack, haptics/frame pacing,
actual localized store offers/transactions and task022's individual owner review
remain separate gates. This is not blanket board-parity approval.

## Repeat

Run `python3 tools/verify.py --ios`. Install both APKs with `adb install -r`, then
run `PremiumPlanJourneyTest` using the existing instrumentation runner. On the
owned iOS simulator, run `PremiumSafetyJourneys/testNewNotebookPlansAndFreeExit`
and `PremiumSafetyJourneys/testNewPlanMotionAndReducedMotionFrames` in the
`BarkLogUITests` target. Use the review selector's three `next-*` destinations and
quarter-speed/Replay controls for motion comparison. Never uninstall or clear the
normal app to obtain a fresh fixture.
