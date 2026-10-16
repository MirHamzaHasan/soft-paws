# task025 · Light and flexible dog onboarding

Owner-requested board refinement, 16 October 2026. The proposal now has 54 screens/
states, including 20 opening/setup surfaces. Prices remain undecided. Native app,
authentication, real OS grants, billing and AI integrations are unchanged.

[Requirements](requirements.md) map the request to implemented behavior.
[Proposal instructions](../../../../design/board/premium/README.md) describe replay
links and reproducible checks. Historical task024 evidence remains unchanged.

## Final checks

- [Visual QA](checks/visual-qa.json): 54 × light/dark/compact 375×667 at 130% text/
  reduced motion = 216 renders, with zero runtime, overflow, active-target or empty-icon
  findings. The three latest age/permission/review recaptures are included in the report.
- [Journeys](checks/journeys.json): seven groups cover default Light and explicit Dark,
  full multi-answer/custom-breed setup, age/weight validation, iOS/Android switch
  permission/dismissal/denial/Settings, camera/photo cancellation, review edits, email
  recovery, free use, explicit profile AI context and its immutable source, chat
  controls/errors, subscription handoff and ended access.
- [Journal retention](checks/retention.json): editing breed/name and signing out/in
  preserves the original example record.
- [Integrity](checks/integrity.json): 29 static destinations, seven independent reviewer
  links, no external requests/runtime errors, sheet focus trap/Escape and 48 px
  checkbox labels. Dynamic next-step routes are exercised in the journey.
- [Motion](motion/results.json): 16 real-time frames cover selection, notification
  thumb travel, page/progress and profile reveal; seven reduced profile values stay
  fully visible and the reduced switch lands immediately at its final 20 px offset.
- [Contrast](checks/contrast.json): 94 live computed pairs pass in both themes,
  including notification switch boundaries.
- [Metadata](checks/metadata.txt), JavaScript syntax and whitespace checks pass.

`screenshots/` retains top and scroll-bottom captures. `contacts/` contains review
sheets; `motion/` retains actual frame timestamps; `journeys/` contains screenshots
of the executed flows. Diagnostic failure captures are excluded from this pack.

[Source hashes](checks/proposal-source.json) identify the current HTML/CSS/JavaScript.
[Native/reference fingerprints](checks/native-source.txt) remain `34c44c1b…` /
`00443170…`, with 166 entries / 123 product / zero matched. No native build was repeated
for this board-only change. Physical-device motion, haptics, VoiceOver/TalkBack,
store eligibility and actual integrations are outside these browser checks.
