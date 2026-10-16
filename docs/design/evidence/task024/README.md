# task024 · onboarding, account and Premium AI board

Scope: owner-requested design prototype, 16 October 2026. Prices are intentionally
undecided. Firebase, native permissions, store billing and AI are simulations.
The KMP app and its task022 reference are unchanged.

The [proposal](../../../../design/board/premium/README.md) contains 46 new
screens/states and five replay sequences. Research includes all 62 returned
screens across five Mobbin flows, primary platform/subscription sources and a
[business memo](../../../../design/board/premium/research/strategy.md).

Final automated results, screenshot contacts, phone captures and motion frames
are recorded here. These are browser-prototype checks,
not evidence of native integration, store eligibility, frame rate, physical-device
haptics, VoiceOver/TalkBack, legal sign-off or profitability.

Earlier diagnostic failures stay in ignored `.verify-build/task024/`; they are
not counted as final passes. Native journaling files were not accessed or changed.

## Verified results

- [Visual checks](checks/visual-qa.json): 46 screens × light, dark, compact
  375×667 at 130% text and reduced motion = 184 renders; no runtime errors,
  horizontal overflow, undersized active buttons or empty icons. All 46 reduced
  captures confirm the engine was actually in reduced mode.
  The report includes four follow-up privacy recaptures after enlarging the
  associated checkbox labels to at least 48 px; sheet labels are measured in the
  integrity check as well.
- [Journeys](checks/journeys.json): seven passing groups covering personalized
  setup/free choice, permission denial, OAuth cancellation, email validation and
  expiry, AI permission/context, streaming/stop/regenerate, sources/history,
  emergency boundaries, weekly recap, cancellation handoff and ended read-only
  conversations, connection failure/retry and Android reminder authorization.
- [Retention](checks/retention.json): editing an existing dog's setup and signing
  out/in preserves the original example care record.
- [Integrity](checks/integrity.json): 32 destinations exist; seven review links
  open the correct proposal independently; no external requests; keyboard focus
  stays in a sheet and Escape closes it.
- [Motion frames](motion/results.json): 17 real-time captures across choice/page,
  plan reveal, practice and reply, plus five immediate reduced-motion plan values.
  Capture timestamps are actual wall-clock times, not virtual-time advances.
- [Contrast](checks/contrast.json): 88 live computed token/glyph pairs pass across both themes.
- [Repository metadata](checks/metadata.txt) passes. Native platform builds were
  not repeated because no app source or native configuration changed.

`screenshots/` contains all top captures and scroll-bottom captures where needed;
`contacts/` groups them for inspection. `journeys/` includes platform-sheet,
streaming, source and retained-journal captures. Original files are unaltered.

The [proposal source manifest](checks/proposal-source.json) identifies the HTML,
CSS and JavaScript. [Native/reference fingerprints](checks/native-source.txt)
remain unchanged: native `34c44c1b…`, task022 baseline `00443170…`, 166 entries /
123 product / zero matched. No new board screen is claimed native or approved.
