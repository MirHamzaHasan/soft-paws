# NP-G04: Exhaustive screen/state coverage and setup visibility

Status: in-progress. Ledger exists; runtime mapping and visual parity remain unfinished.

- [x] Resolve `setup` missing from `BOARD.sections`: `dog-setup` and `seq-setup`
  are registered, directly reachable, and incorrectly classified by the board's
  fallback manifest. Expose them in the same board without redesign or duplication;
  record an explicit baseline revision when configuration changes.
- [x] Implement distinct breed/age guided screens, not native's combined page.
- [x] Implement the board's separate export scope/content choices and format
  selector with working data logic, not inert design toggles.
- [x] Implement distinct training progress, Memory Book caption and share
  compositions; generic combined detail views are not enough.
- [ ] Map every failure/loading/empty/permission/stale/missing-file card to its
  genuine contextual state. Add direct Debug scenarios without fake Release routes.
- [x] Map all 18 flow cards; preserve three historical comparisons and alternative
  Kit feel demos as references, not additional production destinations.
- [ ] Verify live registry/manifest/task coverage whenever a board card is added
  or renamed. Keep no missing, duplicate, orphaned or silently skipped IDs.

Run `python3 tools/check_native_parity.py` and the fresh live-inventory check in
[README](../README.md). All 123 product entries and their interactions require
individual evidence before closure; this audit does not claim they already match.

The configuration correction is recorded in `board-baseline.json.configurationRevisions`. A fresh live inventory confirmed the same 166 screens and all flow arrays, with only the existing setup section exposed. No product composition, style, copy or animation asset was rebaselined. Other gates and per-screen acceptance remain open.

The checked implementation items have dedicated Compose compositions and real
local data logic. They are not visual approvals. Contextual device captures,
paired comparisons and per-entry owner review remain open.
