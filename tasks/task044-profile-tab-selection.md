# task044 · Profile tab selected background

Owner report · 19 October 2026: Profile opens its menu but does not gain the green
selected background.

Status: implemented; Android/iOS Light/Dark simulator checks, all 138 JVM tests,
lint and both platforms' Debug/Release checks pass.

The journal tab and companion account menu previously requested separate deferred
navigation transitions. The second transition could cancel the first before it
updated AppState, leaving the tab highlight and selected accessibility state on
the previous tab. `CompanionController.navigateTab` now changes both destinations
inside one existing Tab transition. Entering Profile selects Profile and opens
AccountSettings; leaving it selects the requested journal tab and closes the menu.
Account Back uses the same coordinated action to Home. No palette, tab geometry,
care persistence, account or AI behavior is changed.

A regression test holds the transition callback and checks that Home, Timeline
and Insights each enter/leave Profile in one action, with consistent saved route
and menu state. Android/iOS native checks verify selected semantics and real
screenshots from all three tabs in Light and Dark, in the existing isolated
`park-add-dog-v1` journal. Normal journals and preferences are preserved.

Verified on 19 October 2026:

- `python3 tools/verify.py --ios` passes, including 30 tool tests, all 138 JVM
  tests, preserving migrations, lint and signed Debug/Release iOS bundle checks.
- Android `ProfileTabJourneyTest` passes (1 test, 34.147 seconds); iOS
  `ProfileTabReviewJourneys` passes (1 test). Each checks Home/Timeline/Insights
  to Profile and back to Home in Light and Dark. Selected accessibility state,
  account content, and the green tab background are checked.
- Settled native screenshots were inspected on Android 15 and iOS 18.5. Profile
  icon/text stay readable in both themes. Existing token contrast is 13.57:1 on
  the selected tab; inactive labels are 9.72:1 Light / 6.82:1 Dark. Targets retain
  their existing 56 dp/pt height and selected semantics.
- Normal journal row hashes match before/after snapshots. Both normal apps are
  reopened; automated navigation has stopped. Physical assistive technology,
  large text and the existing individual visual-approval gates remain separate.

See [evidence](../docs/design/evidence/task044/README.md).
