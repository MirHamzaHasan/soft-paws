# task043 · Additional-dog onboarding evidence

The owner's 19 October request reuses the approved dog-information onboarding
for every additional dog, with independent fields and retained local drafts.

`native-2026-10-19/` records synthetic owned-simulator journeys. The dedicated
`park-add-dog-v1` database/preferences preserve all normal and other review
journals. The real SQLite repositories are used throughout. No credentials,
network AI or fake persistence are involved.

Android's complete journey passes (1 test); iOS's complete setup and restart
journeys pass (2 tests). All 137 JVM tests, Android/iOS Debug/Release builds,
lint, tool checks and preserving migrations pass. The saved profiles were checked
directly in SQLite. Normal journal row hashes match before/after snapshots.

The dated folder contains build/runtime summaries, synthetic saved profiles,
profile checks, preservation hashes and light-theme screenshots in `add-dog-qa/`.
The iOS save-to-Home crash found during QA is explained in
[crash-analysis.md](crash-analysis.md), with a forced SQLite regression and
passing native proof. Test gestures wait for keyboard/scroll settling and stay
inside the content above the review toolbar and system insets.

These are functional checks and visual inspection evidence; physical/assistive,
dark/large-text testing and the project's individual screen approval gates
remain separate. Both normal apps were reopened for manual review.
