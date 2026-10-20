# Native Atlas acceptance · 19 October 2026

The owner requested mobile acceptance after authenticated web generation passed.
Both native Debug apps now display real Atlas replies, saved in SQLite with
`responseSource: "atlas"`. These are normal app launches, not design fixtures or
demo answers. Release Atlas remains disabled; physical/store acceptance is separate.

| Check | iOS 18.5 simulator | Android API 35 emulator |
| --- | --- | --- |
| Native Firebase identity | Existing SDK session restored; Email · Firebase account | Existing QA account signed in through native password UI |
| Actual Atlas reply | Passed through current native provider, transport and answer validation | Passed through current native provider, transport and answer validation |
| Saved source and answer | SQLite confirms `atlas` | SQLite confirms two `atlas` replies |
| Composer commit/loading | Cleared after send; preparing-answer state captured | Native UI/manual send and saved messages inspected |
| Terminate/relaunch | Reply and Firebase session restored; opt-in XCTest passes | Pending coordination while owner tests manually |
| Care data | Existing one dog, zero care events/items preserved | One clearly labelled QA dog added to the previously empty normal journal; zero care events/items |

The iOS question was “How can you help me related to my dog?” with message-only
cloud consent, no dog profile and no selected care records. The real response
covered general care and organizing notes without invented dog-specific facts.

The owner used Android manually during setup. Automation stopped navigation to
avoid interrupting that interaction. Read-only inspection confirmed real replies
to the owner's greeting and general health-help question. The owner enabled
profile/record consent; the actual saved reply used the synthetic QA dog profile
and **zero selected care records**. These choices were preserved. The response
referred clinical assessment/treatment to a veterinarian and offered general care
and factual note organization. No photo was sent.

`LiveAtlasJourneys.testQuestionGetsRealReplyAndSurvivesRelaunch` is opt-in through
the test runner's `BARKLOG_LIVE_ATLAS_QA=1`. It contains no credentials and requires
an existing authenticated QA journal. It launches normally, starts a new
conversation without selected context, sends the question, observes completion
and verifies the same saved chat and SDK identity after relaunch. An initial
selector/navigation attempt was corrected in the test harness; the final run
passed one test with zero failures. No production app logic changed.

The Android Debug APK was updated in place because its installed version predated
the current Atlas-only/password flow. No application was uninstalled and no
journal was cleared. The separate old-ID apps, review journals and model files
were untouched. Credentials were entered via hidden input, stayed out of source,
SQLite and evidence, and were never included in diagnostic output.

Validation: signed iOS Debug test build; live opt-in XCTest; actual native Android
Firebase/Atlas UI; real SQLite source/answer/count inspection; native answer-limit
checks; metadata/tooling checks (30 tests). Build/test logs remain in ignored
`.verify-build/atlas-mobile-2026-10-19/`. No new Android/Release or physical-device
acceptance is inferred from these checks.

This is targeted live AI acceptance. Light screenshots were inspected; dark,
large-text, screen-reader, physical performance and individual board-parity gates
remain separate. The keyboard-open Android frame is a manual capture, not a claim
of complete keyboard-layout or visual approval.

- [iOS reply](ios-answer.png), [after relaunch](ios-answer-after-relaunch.png), [loading](ios-loading.png)
- [Android reply](android-answer.png)
- [iOS saved-source evidence](ios-result.json), [Android saved-source evidence](android-result.json)
