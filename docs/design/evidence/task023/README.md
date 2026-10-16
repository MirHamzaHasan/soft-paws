# Readable Home care and KMP motion — 2026-10-16

Scope: the owner-reviewed Home strip and requested Earlier/Latest refinement,
plus shared navigation and touch motion. This is targeted simulator evidence;
task022's 166-entry ledger still has zero entries marked matched.

The Home preview is at
<http://localhost:4278/refinements/dayline-motion.html?reducedMotion=false#play-home>.
It uses named records, exact times, browse controls and real record destinations.
The prototype's records are examples; native captures use the existing separate
SQLite QA journals. Those journals are mutable through real interactions and are
not reset to make the figures or event types match the prototype.

## Recorded checks

- [Android navigation, record/Back, interruptions and committed log/Undo](checks/android-motion.txt).
- [Android loading geometry](checks/android-loading-layout.json): Quick care stays
  at 1850 px before/after reading the records, zero displacement.
- [Android light/dark, 130% text, reduced and empty variants](checks/android-variants.json).
- [Board interaction checks](checks/board-qa.json) and [token contrast](checks/board-contrast.txt).
- [Source/reference fingerprints](checks/source-fingerprints.txt). The original
  task022 board is pinned; the isolated Home refinement is the requested revision.

Native screenshots live in `screenshots/`; original recordings in `motion/`.
Contact sheets are inspection aids; original PNG/MP4 files remain unaltered.
Replays use wall-clock time. Native Android browse was inspected at 1×, ½× and ¼×;
tab, cover and Back frames were inspected on Android and iOS. Simulator capture
does not establish physical-device frame pacing, haptics or VoiceOver/TalkBack.

Reduced-motion comparison permits a per-channel 2/255 glyph raster tolerance.
An initial exact-pixel assertion detected 85 anti-alias pixels with a maximum
delta of 2, without geometry movement. The final capture differed by 0.
XCTest selectors account for Compose headings appearing as `Other` elements and
wait for the page's settled capture before tapping its child control; UIKit's
idle signal alone does not include the Compose page clock.

Full Android/iOS Debug/Release verification passed. The final iOS result is four
passed journeys with zero failures, including loading/ready geometry. The app
source fingerprint is `34c44c1b2d0eea4673e97ea083a18b767f7ca28dc98c12c4d000829d1e161909`.
The inherited iOS libicu deployment-target warning remains; older iOS releases
and physical-device release sign-off are not established by these simulator checks.
