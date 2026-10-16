# Task 022: Exact current-board native parity, screen by screen

Status: In progress — product-family ports, shared kit, guided setup and scoped recovery implemented; current-source validation and individual screen review underway 2026-10-16. **Native visual parity is not complete**.
Dependencies: task021's functional foundation; current owner-selected web board.

The owner explicitly rejected feature-equivalent simplified native layouts and
selected the existing localhost board, exactly, including its typography. Do not
redesign the board, revive the older October 14 visual export as the target, or
call a working route a visual match. Shared Compose remains the implementation.

## Inventory and authority

[Open the complete screen-by-screen backlog](native-parity/README.md). The [versioned local comparison pack](../docs/design/evidence/task022/review/index.html) shows captured and missing entries explicitly; it does not change approval status.

- 166 live registered entries: 123 product screens/states/handoffs, 15 Kit cards,
  7 motion contracts, 18 whole-flow cards and 3 historical comparisons.
- Every entry has an individual task and a native mapping/disposition in
  [manifest.json](native-parity/manifest.json). **Zero are marked matched.**
- The [baseline](native-parity/board-baseline.json) pins 58 runtime/source/font
  assets and captures the actual screen registry/order. Picks/Notes were empty;
  no individual native approval is inferred from historical board labels.
- The existing `dog-setup` / `seq-setup` section is now exposed in the board row
  configuration. The baseline records this configuration-only correction; no
  product design, screen or flow was changed.
- The 2026-10-16 owner answer selects Bricolage Grotesque 700/800 for the board's
  headings/numbers and Inter 400/500 for reading. This supersedes Inter-only for
  this port. Native font resources are now bundled; computed type/layout and per-part acceptance remain in progress in G01.

## Delivery order

1. G01–G04: computed-style parts/type, safe matched fixtures/replay, shared motion
   and evidence, exhaustive contextual-state coverage.
2. Home first, including exact quick-care/day-line feedback and coach placement.
3. Fast setup and every separate optional guided onboarding page.
4. Chooser, nine informative editors, notes/context, drafts and lifecycle states.
5. Timeline/filter/pagination, detail/edit/deletion and revision conflict.
6. Profiles/settings, medication/vaccinations and calendar/reminder outcomes.
7. Weekly/monthly Insights, Safety, report scope/format/export/handoffs.
8. Training, photos/baselines, expenses/receipts and Memory Book/captions/share.
9. All global states, backwards/interrupted transitions and full journeys.

Complete one screen's functional + visual + motion vertical slice at a time.
Parallel family completion or passing old tests is not permission to batch-mark
the 123 product entries matched. See the [contract](native-parity/CONTRACT.md).

## Acceptance

- [ ] Every current product composition and contextual variant is present, not
  collapsed into generic native cards; all 166 ledger dispositions are resolved.
- [ ] Bricolage/Inter, geometry, artwork, colours, control states and copy follow
  the live board, with approved platform/accessibility adaptations recorded.
- [ ] No regression to local commits, drafts, scopes, migrations, file cleanup,
  native handoffs, notification opt-in or factual/non-medical safety boundaries.
- [ ] Per-entry paired board/iOS/Android evidence, motion frames, light/dark,
  compact/wider phone, 130% text, focus/targets and reduced motion are reviewed.
- [ ] Per-screen owner review and unresolved differences are recorded honestly.
- [ ] JVM/native tests, Android Debug/Release/lint, iOS Debug/Release and relevant
  device journeys are re-run for implementation slices, not asserted from docs.
- [ ] Task/feature status and manifest completion change together; physical
  assistive, haptic/frame-rate and platform delivery checks remain explicit.

## Baseline and implementation verification boundary

The initial audit inventories the live board, source-maps all entries, inspects current
Home/Profile/Timeline/Insights board rest frames against existing native family
evidence, creates the backlog and corrects earlier visual-parity overclaims.
That read-only baseline remains the reference. The subsequent authorized port
changes shared Compose screens, native adapters and owned QA infrastructure.
It preserves schema v3, existing database identity and ordinary device journals.
Implementation and per-screen visual acceptance are tracked separately; the
full set of paired/state/accessibility/motion checks above remains open.

Run `python3 tools/check_native_parity.py` and `python3 tools/verify.py --metadata-only`.
Use `--live .verify-build/parity-audit/live-board.json` after a fresh localhost
inventory to verify the actual runtime registry. Tests/builds in task021 remain
valid functional evidence, not proof that native matches this board.
