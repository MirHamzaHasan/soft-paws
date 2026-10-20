# task043 · iOS save-to-Home crash

The owner's 19 October 2026 crash report matches the iOS simulator UI run at
20:12:32 +0500. This was a real app failure, not an XCTest selector failure.
The exported app stderr identifies `IllegalArgumentException: Dog not found.`
from `JournalController.selectDog`, called by the onboarding completion callback.
The original failed result is retained in ignored build output:
`.verify-build/task043-ios-stable-runtime.xcresult`.

The profile write had already committed. The long-lived journal observer had
not yet added the new dog to its screen state. Selecting against that cached
list threw an uncaught exception into the Compose coroutine.

Selection now validates against a fresh repository snapshot and publishes the
selected profile with cleared care state before requesting its journal summary.
Missing profiles and read failures return a recoverable error. Cancellation
continues to propagate. Setup waits for the selected dog's summary and retains
its review screen if opening fails; retry uses the existing stable request ID.

The SQLite regression deliberately holds the screen observer behind the new
profile commit. It verifies selection succeeds in that exact ordering, the new
dog has no inherited records, and the original dog's care is preserved. Unit
coverage also checks missing profiles, read failure and cancellation.

The corrected iOS native run passes both complete setup and restart/switcher
journeys: `.verify-build/task043-ios-complete-flow.xcresult` (2 passed, 0 failed).
Its app stderr contains no uncaught Kotlin exception. Android's complete journey,
all 137 JVM tests and both platforms' Debug/Release checks also pass. The dated
evidence includes native screenshots, profile checks and unchanged normal-journal
row hashes. Physical/assistive and individual visual approvals remain separate.
