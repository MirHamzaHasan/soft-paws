# BarkLog Compose component registry

Current implementation lives in `shared/src/commonMain/kotlin/com/dracoarts/shared/presentation/`.
`components/` contains the reusable controls; `theme/` contains the native kit.

The owner requested an Ungenerated redesign on 2026-10-14. The live review board
is in `design/board/` (see its README). The owner approved all current-screen
previews and Firm interaction on 2026-10-14. task020/task021 provide the native
functional foundation, not current-board visual parity. The owner's 2026-10-16
decision selects the existing web board exactly: Bricolage Grotesque 700/800
display/numbers with Inter 400/500 reading, current compositions and continuity.
[task022](../../tasks/task022-exact-board-native-parity.md) tracks the port per screen.
Native bundles Bricolage 700/800 display/numbers and Inter 400/500 reading. Per-screen geometry and visual acceptance remain in progress. The table below is
an implementation registry, not a visual-approval list; native routes use real local data.

`python3 tools/design_tokens.py --check` checks generated light/dark colors,
motion constants and the licensed Lucide/dog vector paths against board sources.
Use `--write` to regenerate committed native sources; default output is an apply_patch patch. No new
runtime icon/animation package or bitmap asset is required.

| Component | State | Contract |
| --- | --- | --- |
| BoardScene / shared parts | In progress | One live writer; outgoing native frame, per-part recorded carry pixels, current interruption bounds, intent-specific push/cover/carry/Back and immediate reduced-motion final |
| HomeCareStrip | task023 validation | Owner-reviewed Home revision: explicit event/time controls, Earlier/Latest glide, native record detail, preserved browse position on Back, post-commit flight destination and reduced-motion final |
| BoardSelect | Implemented, visual review open | Compact labeled field and bounded native Compose menu; selected value, 48 dp rows, no decorative elevation |
| BoardCoach | Implemented, visual review open | Actual quick-grid bounds; modal coaching focus, Skip and Start, persistent dismissal |
| BoardConfirmDialog | Implemented, visual review open | Safe action first, real draft/delete semantics, scroll at larger text, scoped focus |
| LocalPhoto | Implemented, visual review open | Separate loading/missing/ready state, private file only, missing metadata retained |
| ReceiptAttachment / native picker | Implemented, device QA open | Bounded private image/PDF, real cancellation, independent valid expense save |
| PreparedExport | Implemented, device QA open | Actual file preparation before Ready; separate genuine share/print handoff; cancellation preserves journal |

| PawMark / BrandHeader | Implemented | Five-oval brand, accessible text identity |
| JournalCard | Implemented | Bordered, zero elevation, shared surface/radius/padding |
| SectionTitle | Implemented | Bricolage heading with native heading semantics |
| ScreenHeading / CaptionText | Implemented | Bricolage 34/44 pt headings, Inter 12 pt secondary text, CSS line boxes and scalable native type |
| BarkButton / BarkTextAction | Implemented | >=56 / >=48 dp, disabled state, shared press motion |
| BarkField / ChoiceField | Implemented | >=52 dp, visible labels/current values, single-line Done dismissal, multiline Return and native selection |
| BarkIcon / EventMark | Implemented | Cached 24 dp vectors, event palettes, decorative semantics |
| SupportingText | Implemented | Muted readable body |
| StartupMessage | Implemented | Loading/error message and retry action |
| BarkLogShell/tab bar | Implemented | Four tabs, safe areas, scrolling/scaled text |
| EventButton | Implemented | Event color, disabled/saving state, post-commit feedback |
| Home daily summary / RecentCare | Implemented | Local same-day facts, no invented values |
| Dog-name field | Implemented | Saveable draft, keyboard/error/accessibility behavior |
| TimelineRow | Implemented | Factual observation preview; full details/notes in detail route |
| ChoiceChips / DateFilters | Implemented | Optional selection, labeled units, bounded SQL filtering |
| Record deletion confirmation | Implemented | Record/date/dog scope, revision capture, Keep record |
| PawAvatar | Implemented | Decorative local fallback; no photo/profile editing implied |
| BarkMotion | Implemented | Firm press, soft release bubble, supporting-text entry and OS/app reduced motion |
| AnimatedDog | Implemented; latest native visual review open | One pose owner, six shuffled idle actions, greeting/saved-log priority, foreground/visibility cancellation and reduced-motion neutral |
| DesignReviewBar | Debug opt-in | Replay/speed/destinations; real journal; no draft/data reset |
| DogAvatar / Switcher | Implemented | Local identity and fallback |
| HomeShortcut settings | Implemented | Up to two optional dog-scoped shortcuts; editable in Settings; legacy choices preserved; no reminder opt-in implied |
| ConfirmDeletion | Implemented | Count/scope, export offer, cancellation |
| ReminderToggle / ScheduleField | Implemented | Opt-in state, denial and timezone copy |
| StatCard / ChartCard | Implemented | Actual facts, empty/loading/error states |
| SafetyCallout / ContactCard | Implemented | Offline urgent actions, versioned sources |
| ReportPreview | Implemented | Factual export and native share errors |
| TrainingProgress | Implemented | Local catalog/session state |
| PhotoAttachment / BaselineRow | Implemented | User selection, missing-file fallback |
| ExpenseRow | Implemented | Local currency/date/category |
| ModelDownload / AIMessage | task014/task017 | Optional resource state and bounded output |
| MemoryBookCard | Implemented | Real local highlights, no medical narrative |

New/updated components must match the current board's colours and Bricolage/Inter
pairing, not preserve the older plain heading/row composition. Support system dark
theme, large text, screen-reader labels and minimum touch targets. No premium,
paywall or household component belongs in v1.0.0.

## Board-only onboarding proposal controls (task025)

`design/board/premium/context.js` provides the animated permission switch,
segmented control, multi-choice selection tray, progress indicator and structured
profile/snapshot views. `screens/dog-details.js` and `screens/permissions.js` use
these for optional dog context and per-type notification preferences. They are
prototype controls, not registered native Compose implementations. See
[task025](../../tasks/task025-light-and-flexible-dog-onboarding.md) for evidence.

`premium/mascot.js` (task026) adds proposal-only character parts, shuffled idle
scheduler, greeting/save priority, visibility/pause/disposal and reduced-motion
handling. Home's named care strip stays inside its larger mascot card. These are
board controls; they do not update the native component registry or parity status.

## Native companion controls (task027)

The owner authorized the task024–026 port after the historical board-only passes
above. `presentation/companion` now implements `CChoice`, `CMulti`, `CSegment`,
`CSwitch`, `CProfile`, `CDialog` and `CompanionHomeEntry` with BarkLog tokens,
Bricolage/Inter, spring checks/thumbs, scalable labels and reduced motion. The
fixed Home AI entry reserves its measured height above the normal tab bar.
`AnimatedDog` uses the task026 pose rules and a shuffled six-action idle scheduler.
`LocalPhoto` shows real selected photos in setup and the dog profile.

All 54 destinations are in the native review selector with replay and speed
controls. They remain pending paired native visual/accessibility review; no
simulator was launched for task027. Login/AI/plan states are labelled local demos,
prices stay undecided and purchase actions are unavailable. The free care journal
is accessible without sign-in.
