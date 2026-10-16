# task026 · Larger mascot and one Home care card

Scope: owner-requested board refinement, 16 October 2026. Native app and the original
exact-board reference remain unchanged. Prices stay undecided.

The larger dog and named/time care strip now share one Home card. The same vector
mascot has six shuffled idle actions, tap/keyboard greeting and a prioritized save
reaction. Its count/labels stay still, with clear space around each moving part.

## Evidence

- [Visual QA](checks/visual-qa.json): all 54 proposal screens × light/dark, compact
  375×667 at 130% text and reduced motion = 216 clean renders. Top and scroll-bottom
  captures are in `screenshots/`; `contacts/` groups them for review.
- [Mascot and Home checks](motion/results.json): nine groups check nested rail,
  larger dog geometry, separated facts, measured AI reservation, shuffled action
  bags/no adjacent repeats, keyboard greeting, interruption ownership, natural
  automatic variety, Earlier/Latest/detail/Back, reachable care controls, saved
  record/Undo, immediate reduced motion and disposal. All 28 real-time frames cover
  six idle actions and the saved-log reaction. `motion/contact.jpg` is a cropped
  inspection sheet; the full phone frames remain alongside it.
- [Onboarding checks](checks/onboarding.json): opening greeting/practice, small
  practice mascot/next step and reduced-motion feedback; no practice care write.
- [Live contrast](checks/contrast.json): 94 computed pairs pass in both themes.
- [Repository metadata](checks/metadata.txt), JavaScript syntax and whitespace
  checks pass. [Native/reference fingerprints](checks/native-source.txt) remain
  `34c44c1b…` / `00443170…`; 166 entries, 123 product, zero matched.

The Home card is taller; the page scrolls to the remaining care actions. The fixed
AI entry reserves its actual height, so every action can scroll fully above it.
Original task024/task025 packs remain historical evidence, not claims about this
later source. Diagnostic attempts remain in ignored `.verify-build/task026/`.

These are browser-prototype checks. Native performance, haptics and physical
VoiceOver/TalkBack remain unproved. No native build is repeated for board-only
changes, and no real journal, OS permission, account or purchase is accessed.
