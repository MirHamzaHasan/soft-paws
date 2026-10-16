# task023 — Readable Home care and shared native motion

Owner request, 2026-10-16: the day-line icons are messy and hard to understand;
redesign that representation with Ungenerated and improve animations across KMP.

## Scope

- Propose a Home care strip with explicit type names, times and accessible record
  controls. Close timestamps must never overlap; earlier records stay reachable.
- Preserve the selected dog/count, quick care and BarkLog typography/colour kit.
- Port the already-selected board's Feel 07 navigation/touch motion to shared
  Compose: directional tabs, Back uncover, one current pose, tactile glyphs.
- Commit before success feedback. No journal/schema/identity changes.
- Reduced motion, text scaling, dark mode and native cancellation remain required.

## Implementation

- `HomeCareStrip` renders real SQLite observations as named/time controls. Swipe,
  Earlier and Latest share one scroll position; a new move cancels the previous
  glide. Returning from a record keeps the browsed position.
- Navigation buttons have Firm depth and a separate arrow response. A committed
  quick log travels to its measured mark, earns one volume-preserving landing,
  then updates the total and dog response. Undo remains the actual repository action.
- Loading placeholders reserve the completed header/record height. Android's
  measured Quick care position is 1850 px before and after the delayed read.
- Shared navigation now overlaps directional tab pages, keeps the bar fixed and
  uncovers the previous page on Back. Incoming opacity includes its background.
- Common buttons, text actions, dog chips, care stickers, rows and selection
  checks use the shared touch motion. Preselected/restored checks stay still;
  reading rows highlight without scaling their text. Reduced motion lands final.

## Verification

The board passed light/dark, compact 130% and reduced-motion interaction checks,
including browse, record selection, committed preview logging/Undo and empty/loading.
Native Android passed browse → actual record → Back position preservation,
directional/interrupted tabs, chooser/Back, calendar/Back and real quick-log/Undo.
Light/dark, 130% text, reduced and empty were captured; reduced browse's two frames
matched (a 2/255 glyph-raster tolerance is allowed; the final capture differed by 0).
Real Android and iOS tab/Back/cover frames and Android half/quarter browse replays
were inspected. The original full-resolution recordings remain local.

Full Android/iOS Debug/Release checks passed against source
`34c44c1b2d0eea4673e97ea083a18b767f7ca28dc98c12c4d000829d1e161909`.
All four final iOS journeys passed: browse/detail/Back position, directional
tabs/chooser/calendar/Back, loading-height preservation and committed quick-log/Undo.
The Android loading metric is zero displacement; the iOS loading test permits 2 pt
and passed. See [the review evidence](../docs/design/evidence/task023/README.md).
Physical VoiceOver/TalkBack, haptics and frame-pacing sign-off remain task016.

## Review and implementation

The new Home representation is an isolated working proposal at
`design/board/refinements/dayline-motion.html`; the task022 pinned board is intact.
The owner reviewed it and said “i like” on 2026-10-16, requesting another pass on
Earlier/Latest animation. Keep that accepted composition; implement the requested
control refinement in the board and shared Compose. The controls now have clear
rounded borders, a separate arrow pose, Firm depth and an interruptible 460 ms
glide. This is a requested Home revision, not a rebaseline of every task022 screen.

## Status

Implemented and simulator-validated for the requested scope. The owner accepted
the Home layout and requested the applied control refinement. Physical feel and
the broader task022 screen-by-screen approvals remain open; no task022 entry was
automatically marked matched.
