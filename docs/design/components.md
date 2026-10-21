# BarkLog Compose component registry

## Soft Paws · 21 October 2026

Soft Paws uses the separate cat board and generated joyful tokens, with five tabs.
The BarkLog entries below are inherited component history. The approved cat
Journal is now native: dated week strip, filters, coloured rows, record facts,
compact title/note editing and scoped revision-guarded deletion. Selected dates
and filters reveal themselves fully on smaller phones and at larger text sizes.
Structured measurements, timestamps and attachments remain editable, and saves
still go through the real repository before feedback. See
[the native cat port](../../tasks/soft-paws-task002-native-port.md).
Individual native visual approval and the remaining cat screen ports stay open.


20 October task047: the owner approved the new notebook-puppy Rive and the three
reviewed plan/paywall/membership screens for mobile. Shared Compose implementation, Android/iOS builds and scoped native
journeys are verified. Physical/assistive review remains open. Home retains its spaniel; RevenueCat
configuration/entitlement behavior and all local care records are preserved. See
[task047](../../tasks/task047-premium-plan-motion-design.md).

Current task033 boundary: the existing Home Ask entry is restored in old Debug
review paths too. `PremiumExportAccess` checks PDF/Memory Book output destinations
and reuses the existing contextual Premium screen. Preview/raw CSV stay free.
The local demo plan is not a verified entitlement. The new photo-film editor is
a board proposal; no native video component/encoder is registered yet.

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
| BarkLogShell/tab bar | Implemented | Four tabs, safe areas, scrolling/scaled text; task044 coordinates Profile selection/menu; task045 retains one fixed dock and live pill through Profile transitions |
| EventButton | Implemented | Event color, disabled/saving state, post-commit feedback |
| Home daily summary / RecentCare | Implemented | Local same-day facts, no invented values |
| Dog-name field | Implemented | Saveable draft, keyboard/error/accessibility behavior |
| TimelineRow | Implemented | Factual observation preview; full details/notes in detail route |
| ChoiceChips / DateFilters | Implemented | Optional selection, labeled units, bounded SQL filtering |
| Record deletion confirmation | Implemented | Record/date/dog scope, revision capture, Keep record |
| PawAvatar | Implemented | Decorative local fallback; no photo/profile editing implied |
| BarkMotion | Implemented | Firm press, soft release bubble, supporting-text entry and OS/app reduced motion |
| AnimatedCareNotebook | Implemented; physical/assistive review open | Original new Rive, bounded greeting/page turn, same-art still, transparent interaction and visibility/foreground/snapshot cancellation |
| PremiumPlanScreen | Implemented; scoped native QA passes | Approved setup plan, full-price moving selection with pinned free exit, truthful membership view and unchanged controller/store guards |
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


## Native Rive character · task032

AnimatedDog now renders the owner-approved spaniel through official Android and
Apple runtimes; shared Compose keeps placement, interaction semantics and motion
policy. The original editable source and .riv live in
`design/board/refinements/rive-dog/`. The Dog Controller view-model triggers are
hello, curious, saved, sleepy, sniff, ears and rest (cancellation). Native rest
art is `composeResources/drawable/spaniel_rest.png`, captured from the same rig.
Use this component rather than drawing another dog. Loading/failure/reduced
motion use the same still; live views detach for native page snapshot animation.
The original web board's older dog is superseded for this owner-authorized mascot
slice; task022's remaining screen-by-screen gates still apply.


Task034 reuses the approved video board: neutral bordered player, 174dp portrait
preview or full-width square, 66dp selected/check-marked thumbnails, compact
48dp move/play/aspect controls, optional caption and clear Premium export action.
Chat restores the approved display font, 44dp lime paw emblem, compact question
and source rows, borderless input and 48dp round send/stop. Shared controls keep
minimum targets, scalable text and reduced/foreground motion policies.


### Chat care tools · task035 (2026-10-17)

The approved compact chat now includes up to three local photo attachments per message, saved vet/emergency call actions and a vet-report mobile preview. SQLite transfers composer attachment ownership atomically into each saved conversation. Report PDF uses the existing Premium gate; mobile preview and care logging remain free. Caregiver messages/selected dog-scoped records are factual inputs; demo AI replies and photos are separate opt-ins. General medication education never selects drugs/doses or treatment. Images are not analyzed or uploaded. Native verification is tracked in task035; real AI, billing and clinical review remain deferred.

### Weekly reply cards and quiet controls · task041/task042

`WeeklyLogCard` uses a saved question-time profile/week snapshot, exact SQLite
counts, seven labeled bars and dated source excerpts. Zero/missing logs never
imply health or adequate care. `WeeklyAiConsent` versions the expanded automatic
scope; `WeeklyContextDialog` reviews it and supports revocation/read retry.
The existing compact chat layout remains. Product/affiliate placement is inactive.

`SoundSettingsScreen` provides optional interaction sounds, a 0–100% slider,
Soft wood/Soft pop and three explicit samples. Soft wood/35% is selected and
off until enabled. Samples have one accessible description each. Shared
`soundAction` and `LocalInteractionSounds` cover common control activation;
SQLite completion callbacks alone trigger actual saved cues. Sound never replaces
visible state, changes reduced-motion preferences or accompanies loading/typing.
