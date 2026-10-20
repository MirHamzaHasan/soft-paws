# task044 · Profile tab selection · 19 October 2026

Profile's green background now agrees with its displayed account menu. A single
deferred Tab action updates both the journal route and companion screen. The
regression test holds that action and checks entry/exit from Home, Timeline and
Insights, including saved route consistency.

`android/` and `ios/` contain synthetic, real-repository screenshots in Light and
Dark, from all three originating tabs. Settled screenshots were visually
inspected for the green selected Profile, visible icon/label and inactive Home.
Native tests also check the account heading and selected accessibility state,
then return to Home and check its selection. The Android test checks the parent
tab node rather than its unselected text child.

Validation passes:

- Android `ProfileTabJourneyTest`: 1 passed, 34.147 seconds.
- iOS `ProfileTabReviewJourneys`: 1 passed, both themes and all origins.
- `python3 tools/verify.py --ios`: metadata/30 tool tests, 138 JVM tests, Android
  Debug/Release, lint, preserving migrations and signed iOS Debug/Release checks.
- A final Android test build/lint run also passes. Full verification log:
  `.verify-build/task044-verification-final.log`; final Android runtime:
  `.verify-build/task044-android-rest-complete.log`; iOS result:
  `.verify-build/task044-ios-rest-runtime.xcresult`.

The existing palette and 56 dp/pt tab targets are retained. Selected tab contrast
is 13.57:1 in both themes; inactive labels are 9.72:1 Light and 6.82:1 Dark.
Selected semantics provide an accessibility signal in addition to color. Existing
reduced-motion behavior is retained; physical VoiceOver/TalkBack, large text and
individual owner visual approvals are not established by these captures.

The dedicated `park-add-dog-v1` fixture isolates care and UI preferences. Before
and after normal-journal hashes match for dogs, care events/items and local
documents (Android: 1 dog/16 events; iOS: 1 dog/5 events). Both normal apps are
open for manual review, with automated navigation stopped.
