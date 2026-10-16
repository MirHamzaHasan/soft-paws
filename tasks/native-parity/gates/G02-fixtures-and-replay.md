# NP-G02: Matched fixtures and every board-ID replay

Status: in-progress. Current Debug review selects roots and nine forms, not every board
ID, state and onboarding step. Existing QA screenshots use different dates/dogs/
viewport from Bruno's board examples and cannot establish exact pixel parity.

- [ ] Add explicit Debug-only board-ID/state/scenario entry for all 123 product
  entries plus shared Kit/motion review where relevant; Release stays disabled.
- [ ] Use owned isolated QA installations with real SQLite/native adapters, a
  controlled clock/timezone and synthetic fixtures matching board content.
- [ ] Verify the canonical seven-moment Home and weekly/monthly data, both dogs,
  typed events, immutable administration, tasks, photos, expenses and highlights.
- [ ] Provide deterministic pending/failure/stale/permission outcomes through
  test-only fault controls. No fake production repositories or journal resets.
- [ ] Replay animation without resetting records, consuming a draft, resaving a
  session, sending a notification or repeating destructive operations.
- [ ] Record fixture IDs/fingerprints, source revision, selected route/step/scroll
  and canonical content viewport for each capture; supply 1×/0.5×/0.25× controls.
- [ ] Keep practice records/notes outside the persisted journal. Document owned
  QA environment setup separately from any installed user journal.

Sources: `DesignReviewBar.kt`, `DesignReviewSections.kt`, `BarkLogScreens.kt`,
`OnboardingScreen.kt`, native test hosts and repository test fixtures. Follow
[CONTRACT](../CONTRACT.md); a screenshot fixture must not become product sample data.
