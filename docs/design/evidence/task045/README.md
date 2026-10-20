# task045 · Continuous tab highlight · 19 October 2026

The Profile account menu now uses the journal shell's persistent scene and bottom
dock. Its original content is reused without a second safe-area inset. The green
pill keeps its existing spring and speed-dependent stretch across all four tabs.
The active scene handler still coordinates the selected route and menu together.

Android and iOS selection/dock checks pass in Light, Dark and Reduce Motion.
Each asserts the same tab bounds before/after entering Profile from Home,
Timeline and Insights, checks account content/selected semantics, and returns
to Home. Reduced-motion checks repeat Home/Profile in both themes. The iOS
saved-dog/profile/switcher journey also passes after the host change.

The `android/` and `ios/` directories contain synthetic native screenshots and
contact sheets from real-time recordings. Rest, 25/50/75% of detected travel,
and settled images were visually inspected in both themes. The highlight moves
through intermediate horizontal positions while its vertical center stays
within one full-resolution pixel; control bounds remain identical. Reduced
Motion produces no intermediate slide positions in either theme. Pixel samples
are in the motion-analysis JSON files. Recordings were sampled at 30 Hz; this is
motion-continuity evidence and does not establish rendering frame rate.

Validation passes:

- Android `ProfileTabJourneyTest`: 1 passed, 52.51 seconds, all four theme/motion
  combinations. The earlier emulator session stalled during startup; the final
  accepted run uses the same owned AVD/data after relaunch. No uninstall/reset.
- iOS `ProfileTabReviewJourneys`: 1 passed, all four combinations; the separate
  saved-dog/profile/switcher check also passes. Runtime summaries are included.
- `python3 tools/verify.py --ios`: 30 tool tests, 138 JVM tests, preserving
  migrations, Android Debug/Release/lint and signed iOS Debug/Release checks.
- Final Android test compilation/lint and metadata/link checks also pass.

Ignored full logs/results: `.verify-build/task045-verification.log`,
`.verify-build/task045-android-restart-test-build.log`,
`.verify-build/task045-android-final-runtime.log`,
`.verify-build/task045-ios-runtime.xcresult` and
`.verify-build/task045-ios-submenu-runtime.xcresult`. Original recordings stay
under `.verify-build/task045-native/`.

All app captures use the synthetic `park-add-dog-v1` journal. Fixture preferences
are restored; iOS overrides use the transient argument domain. Before/after
normal-journal row hashes match for dogs, care events/items and local documents
(Android 1 dog/16 events; iOS 1 dog/5 events), including after the emulator
relaunch. Both normal apps are open and automated navigation has stopped.

Existing colors, selected semantics and 56 dp/pt targets are retained. Physical
feel, VoiceOver/TalkBack, large text and individual owner visual approvals remain
separate gates.
