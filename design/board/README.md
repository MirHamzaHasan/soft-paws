# BarkLog complete local-v1 design board

**New owner-requested chapter, later 16 October 2026:**
[AI, accounts, detailed onboarding and Premium proposal](premium/README.md), live
at <http://localhost:4278/premium/index.html?reducedMotion=false>. Prices remain
undecided. That separate chapter supersedes the earlier design exclusion for its
new direction; this selected reference and the KMP app remain unchanged.

This folder is a localhost-only interactive design prototype. It does not read or
write BarkLog's SQLDelight database, native preferences, photo files, reminders or
device journal. All dogs, records, medication plans, tasks, expenses and photos are
clearly labeled in-memory examples. Replay resets that preview state. Only reviewer
Picks and Notes persist, in `review/store.json`.

The production app remains Kotlin Multiplatform with shared Compose UI. Board
approval does not change an implementation-status claim and does not authorize a
production feature by itself.

**2026-10-16 owner selection:** the current live web board is the exact native
target, including Bricolage Grotesque display/numbers and Inter reading. Earlier
proposal/native-export notes below are historical. Native functional coverage
does not establish visual parity. See [every screen's native parity task](../../tasks/native-parity/README.md)
and [task022](../../tasks/task022-exact-board-native-parity.md); zero entries are
marked matched. This audit preserves the board and its Picks/Notes unchanged.

## Launch and direct links

From the repository root:

```sh
node design/board/tools/serve.mjs 4278
```

Open <http://localhost:4278/>. The server binds to loopback. Useful routes:

- `/#only-home` opens one screen for inspection.
- `/#play-opening-value` opens the player at a specific screen.
- `/#play-onboarding-route` opens the new optional guided path.
- `/#play-form-notes-example` opens the informative log with notes/context.
- `/#play` starts at onboarding and follows the proposed local-v1 review order;
  the preserved early-v1 Profile/Insights comparisons stay in their own row.
- `?textScale=1.3` previews 130% text.
- `?reducedMotion=true` previews final-state reduced motion.
- `?reducedMotion=false` previews the full motion pass when the review browser uses
  reduced motion by default.
- The board header has **Show motion / Motion on** so a reviewer can switch the
  preview without editing the URL; the system preference is the default.
- `?phone=375x667` or `?phone=430x932` reflows the actual phone canvas; this is not
  merely a scaled 390px image. Combine with `&textScale=1.3` as needed.

For local visual QA, a board-only Chromium can be installed in Playwright's user
cache without adding a package or mobile dependency:

```sh
npx --yes playwright@1.55.0 install chromium
node --experimental-websocket design/board/tools/qa.mjs http://localhost:4278/
node --experimental-websocket design/board/tools/journeys.mjs http://localhost:4278/
node design/board/tools/contrast.mjs
```

The board keeps Research, Kit, Screens and Transitions as separate views. Every
card has Replay, Pick, Note and an information panel containing its product task,
design/implementation status, entry point, required states and native parity rule.

## Screen inventory

| Board row | Included surfaces | Product task | Board status |
| --- | --- | --- | --- |
| Opening & first run | six-second optional opening; name-only fast start; guided identity/photo, breed/age, shortcuts, practice log/note/Timeline, storage, ready; one Home coach mark | 003 | design 05 proposal |
| Home | approved daily-care loop, quick feedback and Safety entry | 003 / 020 | approved core |
| Care logging | expressive chooser; nine observation editors, notes, context, drafts, sample attachments and save/edit lifecycle | 004 / 012 / 020 | design 04 proposal over approved mechanics |
| Timeline & records | filters, multi-dog scope, local-v1 event rows, detail, edit, delete, retry and revision conflict | 004 / 020 | approved core + proposed states |
| Profiles & settings | hub, switcher, add/edit, optional details, local storage, accessibility, one/all deletion | 005 | proposed design |
| Medication & vaccination | health hub, list, create/edit, plan history, mark given, archive and vaccinations | 006 | proposed design |
| Care calendar | agenda, task detail/form, completion, recurrence, overdue, reminder opt-in/denial/failure, reschedule/delete | 007 | proposed design |
| Insights | weekly overview, monthly range, accessible charts, sparse and empty observations | 008 | proposed design |
| Safety Center | home, emergency card/contacts, toxicity known/unknown, first aid and bounded escalation | 009 | proposed design |
| Vet prep & exports | scope, preview, CSV/PDF, progress/cancel/retry, completion and native share/print | 010 | proposed design |
| Training | catalog, program, enrollment/progress, active session, committed summary, cancel, empty and error | 011 | proposed design |
| Photo journal | journal, native picker handoff, metadata, detail/edit, baselines, cancel/denial and missing file | 012 | proposed design |
| Expenses | monthly/currency totals, working category filters, add/edit, receipt handoff/sample/cancel, detail, delete, precision error and empty | 013 | proposed design |
| Memory Book | month, explicit highlight collection, traceable highlight, editable caregiver caption, sparse/empty month, missing photo and native share | 019 | proposed design |
| Global states | startup/retry, no dog, empty/loading, read/save failure, offline, permission, stale revision and reduced motion | cross-cutting | proposed design |

Tasks 014, 017 and 018—local AI, conversation/captions and Atlas fallback—are
outside this board. Accounts, subscriptions, cloud sync, household sharing and
remote share links are also deliberately absent.

## Concept and standing decisions

- Angle: remember daily dog care with quick local records and find the exact fact later.
- Person: a caregiver capturing small observations while caring for one or more dogs.
- Promise: organize what the caregiver actually recorded, with dates and context.
- Hero: dog identity plus a dated record, carried from first run into the journal.
- Not: a veterinary authority, diagnostic tool, cloud account or subscription service.
- Visual direction: a warm editorial care journal—oat ground, terracotta brand action,
  richer semantic care colours, flat layered shapes and a recognizable dog portrait.
- Feature grounds carry meaning without replacing labels: blue for records/insights,
  green for profiles/memories, lavender for medication, amber for calendar/expenses,
  and red reserved for Safety and destructive states.
- Home remains the highest-priority screen. Local writes commit before success UI.
- Current target: Bricolage Grotesque 700/800 display/numbers, Inter 400/500 reading,
  BarkLog tokens, thin borders, no decorative shadows or gradients.
- Controls are at least 48 px, colour is never the only signal, and larger text may scroll.
- Firm motion remains approved: 0.97 scale and 1 px depth over 90 ms; 0.30 response
  and 0.86 damping release; 420–680 ms calm content entrances; no bouncing copy/cards.
- Native-reproducible transform, opacity, clip and blur only. Reduced motion lands
  directly on the final state while preserving meaning and focus order.

## v3 proposal · the day line (2026-10-15)

Proposed for review; the October 14 approvals are unchanged until the owner Picks. The previous
board was archived before v3; the internal backup archive was removed during the
owner-requested task027 cleanup. Board-only layer:
`css/barklog-v3.css` and `js/barklog-v3.js` (loaded after `barklog.js`, which stays the source
`tools/design_tokens.py` reads; `motion.tokens.js` and the native export are untouched).

- Hero: one day drawn as a line from 06:00 to 24:00. Every record sits at its time; close records
  stack in up to three lanes; solid up to now, dashed after. Marks carry an icon plus a type colour
  (each ≥ 4.3:1 against the grounds) and the line's accessible label lists every record and time.
- Ground: one flat oat ground on every screen. Colour lives in what was recorded.
- Words: the accent appears only where asked (`*Bruno’s* day`); the logo appears once, in the opening.
- Feedback: on Home, confirmation and Undo sit in the day card where the moment landed, so nothing
  covers the care tiles. Other screens keep a toast, now with optional Undo.

| Journey | Baton | Move | Native twin |
| --- | --- | --- | --- |
| Opening | dog → moments → line → dated card | moments arc from the dog onto the line; the card forms around it | `matchedGeometryEffect` / keyframed offset |
| Opening → Setup | the dog | carry | `SharedTransitionLayout` + `sharedElement` |
| Setup → Home | the dog, the typed name | carry; “Meet Luna.” becomes “Luna’s day” | shared element + `AnimatedContent` |
| Quick care | the care icon | arc from tile to the line at now (640 ms in-out), land on spring 0.38/0.62 with haptic on landing | `Animatable` path + `spring(0.62f, 273f)` |
| Timeline row → Record | the type icon | carry, grows into the record hero; record highlighted on its day | `sharedElement` |
| Tab → tab | the tab pill | spring 0.42/0.78, stretches with speed, squashes on arrival | `animateFloatAsState` + `graphicsLayer` |

Motion rules kept: presses stay Firm (approved 0.97 / 1 pt / 0.30 · 0.86). Only what the person
touched or made springs; headings come into focus (blur 6 → 0), content rises once (≤ 4 parts),
the day line draws itself and each mark arrives as the line reaches it. Reduced motion lands every
move on its final frame. The Kit has a Firm / Bubbly / Lively picker for the one lively moment
(a mark landing); Bubbly is proposed.

## Dog reacts to logging (2026-10-15)

Tap any Home quick-care tile: after the preview record is committed and its icon
lands on the day line, the dog makes one small bounce, tilts its head, follows with
its ears and wags its tail. The 6 pt lift and volume-preserving squash finish on
the kit's sampled 0.30 / 0.70 spring. Another log resumes from the visible pose;
there is only one reaction owner per part. Undo before landing skips the reward.

New detailed care records queue a single reaction for the next Home visit. The
pending reaction travels with that dog's preview data and is consumed once; a
deleted record, an edit, validation or a cancelled form does not create a reward.
Reduced motion preserves the written save confirmation and keeps the dog still.

Checked six focused journeys and 24 screen/mode passes at 375 × 667. Inspected
real-time rest, squash, lift, landing and settle frames in light and dark/130%.

## Dog card · clean artwork and shared motion (2026-10-15)

The screenshot's first-run card is `onboarding-route`; its twin appears on
`onboarding-ready`. Both now use one centered dog on a plain panel. The duplicate
small portrait and the park scenery have been removed. Tap the dog, or activate it
with the keyboard, for a short head tilt and tail wag without advancing setup.

`js/dog-character.js` and `css/dog-character.css` own the vector art and its parts.
Home, first run, Kit and Training share this component. Entry takes 620 ms on the
emphasized curve, ears follow the head, the tail greets once, and eyes blink at
intervals. Interrupted greetings begin at the current pose. A dog already being
carried or arriving with a screen does not get a second competing entrance.
Reduced motion keeps every part still at its final pose.

The route card advances to identity with a forward push on the same ground, keeping
the full dog inside its card as the smaller profile portrait arrives. This replaces
the old carry that swept the large illustration across the next screen's heading.

Checked all 10 affected screens in light/dark/130% text (30 passes), five focused
journeys including real pointer and keyboard greetings, and mid-motion captures.

## Home · one animated dog (2026-10-15)

Home, its empty/loading states and its first-run coach use one transparent sitting
dog, drawn in SVG so its parts can move. The count and dog have separate columns on
a plain panel. Confirmation and Undo are on a full-width row; the day line is below
that. Home's sky, green hills, plant, sun and ball have been removed.

The dog enters with an 18 pt / 8 pt glide over 620 ms, followed by a small head and
ear settle. One tail wag greets entry; saved logs get the short reaction above.
Discrete blinks give the dog life at rest; the loading state does not repeat them.
Reduced motion lands every part immediately.

Checked Home, empty, loading and coach at 375 × 667 in light, dark and 130% text:
12 clean browser passes, including dog/text separation. First run, quick log/Undo
and switching dogs passed. Entry frames and dark saved feedback were inspected;
reduced-motion frames at 150 and 1000 ms were identical.

## Feel 08 · quiet text, button bubble and slider (2026-10-15)

Board-only polish in `js/feel-08.js` and `css/feel-08.css`, on top of Feel 07.
On each screen, up to 16 short pieces of supporting copy rise 3 pt and fade in over
260 ms, grouped with the card or row that carries them. Form labels stay with their
fields so a value never appears without its label. Existing heading and screen
transitions keep their own timing. A main button makes one low-opacity bubble from
the finger, clipped to its pill, while its approved Firm press remains in place.
The Kit's **Care controls** screen has a working stepped slider: a thumb and value
bubble follow a drag, ticks respond once, and the thumb settles on release. Arrow
keys change the same value. Reduced motion shows final copy and omits the bubble.
Browser QA passed 444/444 screen checks and 36/36 journeys; mid-motion frames were
inspected in light and dark, including a form at 130% text.

## Feel 07 · touch and continuity (2026-10-15)

Proposed, on top of Design 06. Layer: `js/feel-07.js`, loaded last.

| Moment | Move | Native twin |
| --- | --- | --- |
| Press a round sticker | squish 1.06 × 0.92 in 90 ms; spring 0.34/0.60 back; glyph trails 36 ms | `scaleEffect(x:y:)` + spring / `graphicsLayer` scaleX/Y |
| Press an icon button | the control keeps its Firm depth; its glyph compresses to 0.9 and nudges 3 pt in the action's direction, then springs home | separate glyph `graphicsLayer` scale/translation |
| Pick a chip or option | ball fill blooms from the finger; chip lands on 0.38/0.62; tick trails | `matchedGeometry` fill / `animateFloatAsState` spring |
| Profile row → feature | the row's sticker flies into the folio sticker (carry, 680 ms in-out) | `matchedGeometryEffect` / `sharedElement` |
| Tab → tab | bar fixed; pill springs 0.42/0.78 with stretch; page exits 120 ms, next enters 440 ms from 40 pt | `TabView` custom / `AnimatedContent` slide |
| Back | top page slides off right in 320 ms (exit curve); page beneath parallax from −28 % | navigation pop / `popEnterTransition` |

Touch moves play on the CSS `scale` property so they compose with the Firm press on `transform`.
A page uncovered by Back or slid in by a tab does not replay its entrance. Reduce Motion: no squish,
pop or slide; screens land at once. Verified: QA 444/444, 35/35 journeys, frames of tab, carry,
push, back, chip pick, choice pick (dark) and sticker squish inspected.

## Design 06 · Park day (2026-10-15)

Proposed. Layers loaded last: `css/park-06.css` (tokens, type, parts) and `js/park-06.js` (motion).
Font: `assets/fonts/BricolageGrotesque.ttf` (OFL, licence beside it). The owner allowed a new
typeface for this proposal; AGENTS.md and the canonical spec still say Inter 400/500, so they must be
updated before any native port. `barklog-tokens.css` and the native export are untouched.

- Colour: chalk ground `#F3F1EA`, white panels, ink `#121A15`, one accent `#D2EE4A` (tennis ball):
  selected chips, the tab pill, the heading marker, the profile band. Primary buttons are ink pills
  (ball pills in dark). Care families keep a soft ground, a readable ink and a sticker colour that
  holds a white glyph at 3:1+. All 58 text/glyph pairs pass in light and dark.
- Type: Bricolage Grotesque 700/800 for headings, folios and numbers; Inter 400/500 for reading.
- Structure: Home's plain day panel, sitting dog and 88 pt count; Timeline thread; Profile ID card; feature folios with a
  family-coloured sticker; dark floating tab bar.
- Motion (park-06.js): marker draws under the key word; Home's dog glides in and settles; Timeline thread draws;
  ID band sweeps; folio stickers land on their tilt. Home’s count never shows a false value mid-move.

Research: Mobbin study 06 cards lead the Research view. Verified: QA 444/444 (light, dark, 130 %),
35/35 journeys, every screen inspected at rest in light; dark and mid-motion frames inspected for
Home, Timeline, Profile, folios and forms. Device frame rate, haptics and Compose parity not claimed.

## Motion v6 · every screen moves (2026-10-15)

Proposed. Board-only layer loaded after every screen file: `js/motion-v6.js` and `css/motion-v6.css`.
`barklog.js`, `motion.tokens.js` and the native export are untouched; `barklog-v4.js` now hands
`B.enter` to `B.choreograph`. Screens that never called `B.enter` are wrapped and get the same pass.

| Part | Move | Native twin |
| --- | --- | --- |
| Folio heading | clip unfolds from its top edge (640 ms emph); mark turns in from −18° | `clip` + `graphicsLayer` rotation |
| Display heading | words rise with a 6 → 0 blur, 70 ms apart | per-word `AnimatedContent` / `.transition` |
| Blocks | one wave, ≤ 5 steps, 60 ms apart, 10 pt rise, 480 ms decel | `tween(480, decel)` with stagger |
| Lists / chips | rows cascade 45 ms apart (≤ 5); icons turn in after their row | same |
| Money / counts | digits rise together in clipped slots, then settle as one readable value; clock times stay still | `AnimatedContent` slide per digit |
| Charts / progress | grow from baseline / left edge, 900 ms emph | `scaleY` / `scaleX` with origin |
| Photos | iris from 50 % 58 %; sun, hills and dog settle at different depths | `clip` circle + offsets |
| Status icons | ring, draw, turn, shake, beat, nudge, lift by meaning, once | keyframes on rotation/offset/clip |
| Dog | blinks every 4–6 s | `scaleY` on the eyes |

Inside the player, a screen entering by push, carry, step or layer runs a compressed pass (36 ms
stagger, 6 pt, 360 ms, no unfold) so it never slides in empty. Reduce Motion: no animation and no
hidden first frame. `reduced-motion-state` deliberately stays still. Nothing loops except the blink;
loading screens keep their “no shimmer” intent (placeholders draw in once).

Verification: all 148 screens animate on arrival (previously ~9 had none and most had only a
generic rise); QA 444/444 light/dark/130 % with no console errors, overflow or small targets; all 35
journeys pass; frames inspected at 0/150/350/650/1400 ms on 20 screens, light and dark, plus the
player push. Device frame rate, haptics and Compose parity are not claimed.

## Research record

Research informed flow and structure only; BarkLog did not copy another app's
visual design. Public sources used on the board:

- [Apple Human Interface Guidelines: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)
- [Apple Human Interface Guidelines: Charts](https://developer.apple.com/design/human-interface-guidelines/charts)
- [Android permission guidance](https://developer.android.com/topic/performance/issues/permissions)
- [11pets feature grouping](https://www.11pets.com/en/feature)
- [AVMA Pet First Aid](https://ebusiness.avma.org/files/ProductDownloads/mcm-client-brochures-pet-first-aid-2025.pdf)
- [ASPCA Poison Control](https://www.aspca.org/pet-care/aspca-poison-control)
- [Merck Veterinary Manual: dog and cat emergencies](https://www.merckvetmanual.com/special-pet-topics/emergencies/what-to-do-in-a-dog-or-cat-emergency)

Mobbin MCP was successfully queried for design 04. The returned images were inspected;
four high-resolution references were downloaded into `assets/research/mobbin/` for
this private localhost board. Each Research card links to its canonical Mobbin screen.

- [Fi · selected pet and Today context](https://mobbin.com/screens/0664355c-9bc5-4a8a-8b06-ea31593f8601): selected dog and bounded daily facts come first.
- [Finch · character beside daily actions](https://mobbin.com/screens/13d6c98d-d362-4ae2-971f-d63601dcd598): a recognizable character connects to a useful action.
- [Visible · note editor](https://mobbin.com/screens/2d46b0bd-9934-4d13-8d48-4c404c79d6fb): date, writing room, character count and a clear save action.
- [Clue · structured observations](https://mobbin.com/screens/1804377c-5636-4b61-b21d-0921f8e60260): labeled choices, optional detail and a persistent save action.

These informed mechanics and hierarchy. BarkLog's palette, dog artwork, compositions
and animation were authored for this board. Screenshots do not supply motion evidence.

## Design 04 · informative logging

Board layers: `css/barklog-v4.css`, `js/barklog-v4.js`, and
`js/screens/care-editor.js`. Earlier v3 source is retained. `barklog-tokens.css`
still feeds the pinned native export; no native source or implementation status changes.

- Home: one animated dog beside the count and a factual day line below, four one-tap actions, and Create a log.
- Feature screens: distinct colour folios, clearer hierarchy, and shared editorial controls.
- Create a log: nine labeled care cards grouped by their purpose.
- Every editor: structured observations, a 2,000-character notes area with optional writing
  guidance, date/time, optional place and a clearly labeled local sample attachment.
- Context adapts to the record: food/portion/eaten; walk duration/pace; consistency/colour;
  amount/appearance; observed symptom/frequency; behavior/preceding event; grooming/product;
  measured weight/unit/scale; observed mood.
- Drafts remain in the in-memory preview across navigation. Keep draft returns to the library;
  Discard removes only that preview draft. Replay starts fresh.
- Save shows a pending state, commits one preview record, then carries its icon to detail.
  Notes, fields and attachment survive editing and appear in Timeline. Clicking an individual
  board card carries its current preview state into the full-flow player.
- Motion: Firm presses, pointer-origin choice fill, a rising helper/attachment sheet, a short
  dog-tail response to a committed quick log, native-style navigation pushes, and the existing
  shared day-line journeys. Readable cards and text use curves; reduced motion shows final states.

Review direct links: `/#play-home`, `/#play-log-chooser`, `/#play-form-notes-example`.
The richer optional context and attachment fields are proposed product design; their eventual
SQLite/native slice remains a separate implementation task.

## Design 05 · deeper research and optional guided setup

The second Mobbin pass searched Finch onboarding and goals, pet-profile creation,
Headspace welcome composition, and Gentler Streak's illustrated summary screens.
Returned previews were inspected, and selected high-resolution references were
downloaded into the private Research view. Screenshot evidence informs composition
and flow only; it cannot establish an app's animation curves or prove conversion.

- [Headspace welcome](https://mobbin.com/screens/7dba3826-1195-4066-a96d-a894870048ec):
  bold flat illustration occupies its own area; short copy and one main action stay readable.
- [Gentler Streak](https://mobbin.com/screens/89addee0-a199-4220-bf7c-5fc6b916e1da):
  separate a character scene from dense data. Its health recommendations, gradients and
  shadows are not carried into BarkLog.
- [Finch goal selection](https://mobbin.com/screens/a06ac851-6e51-427f-bdb8-1ddce6f0e64a)
  and [answer reveal](https://mobbin.com/screens/c229ad54-ed26-4dec-80d1-399d54964f31):
  a selected value should arrive somewhere useful, with the same identity throughout.
- Mobbin's pet-profile search returned Amazon Shopping and Walmart commerce flows.
  These were rejected as the model for a local care journal, not presented as pet-care UX evidence.

Colour decision: retain warm paper and dark brown ink, one terracotta action accent,
then labeled semantic families (green care, lavender medication, blue photo/report,
amber planning, rose Safety). Dark mode has dedicated token pairs. The colour map
is visible in Kit. Inter 400/500 is retained deliberately; hierarchy comes from
display/heading scale, line length and spacing, not unrelated feature fonts.

The fast path remains opening → dog name → real Home coach. “Make it yours” opens
the optional 13-surface guided sequence, including that same opening/setup/coach:

| Guided surface | Choice or action | Where it is reused |
| --- | --- | --- |
| Route choice | guided or start now | immediate Home remains available |
| Identity | illustration or labeled sample photo | ready preview and dog metadata |
| Breed/mix | optional quick choice | dog Profile; arbitrary later edit remains available |
| Age estimate | optional range or unknown | dog Profile, never a health recommendation |
| Shortcuts | zero, one or two tools | Home shortcuts; four care tiles remain intact |
| Practice | tap a walk onto a dated day line | practice record, not the journal |
| Notes | write your own practice note | matching Timeline preview |
| Timeline preview | inspect the time and note | explains the real record mechanism |
| Local storage | read the actual storage boundary | no account/cloud/backup implication |
| Ready | review dog, zero saved logs and shortcuts | real Home begins with an empty journal |

Skip and Back stay available through guided setup. Single-choice questions advance
after 340ms; multi-selection has Continue. A practice record is never committed as
care. No permission is requested by onboarding, and no reminder is silently enabled.

Supporting interactions now include per-dog preview care isolation, real in-phone
choice sheets, inclusive Timeline date filters, confirmed preview record deletion,
training/task commits into Timeline, reminder retry, editable photo metadata,
retained expense fields across receipt selection, separate-currency expense totals,
Memory Book selection/caption editing, and trend scope carried into report preview.
Platform sheets and export files are labeled simulations: the board does not open
a real picker, schedule notifications, generate a real clinical report, or share files.

Board layers: `css/guided-onboarding.css` and `js/screens/guided-onboarding.js`.
The same existing feature-row files are extended. `review/store.json` still stores
only Picks and Notes. All visual changes are proposals; native source/tokens and
implementation-status claims remain unchanged.

## Continuity thread sheet

| Journey | Baton | Native-parity move |
| --- | --- | --- |
| Setup → Home | entered dog identity | name becomes Home heading; same ground |
| Guided route → identity | dog portrait | shared-element travel into the editable identity |
| Optional questions → ready | dog values and progress track | one ground; value reuse; no bouncing text |
| Practice → note → Timeline | dated walk mark and typed note | shared care mark; same timestamp and note |
| Timeline → detail → edit | type, timestamp, observation | shared identity plus calm push |
| Care library → editor → saved record | care mark, entered observation and note | shared care mark; 620 ms preview commit; carry into factual detail |
| Medication → administration | plan name, amount and time | plan becomes committed Timeline row |
| Calendar task → edit | task name, date and recurrence | agenda item carries into fields |
| Trend → report | dog, range and exact values | chart scope becomes report heading/table |
| Photo → Memory Book | local photo, date and caption | photo becomes a traceable highlight |

## Review workflow

1. Open Research and verify each “what we took” statement and public source.
2. Open Kit and check tokens, controls, data views, handoffs and Firm interaction.
3. Review rows in product order. Use Replay for local state and Play this section
   for its whole-part journey.
4. Pick a card only when that exact direction is preferred. Add a numbered Note
   for requested changes. Existing approved screens remain whole unless noted.
5. Review Transitions at rest, 25/50/75% and final poses, then repeat with reduced motion.
6. After approval, implement one KMP vertical slice at a time and compare shared
   Compose output side-by-side with the board. Real platform sheets, permissions,
   haptics and device behavior remain native validation items.

## Native parity and unproved behavior

Board HTML/CSS/JS is never shipped in the app. Compose must use generated/equivalent
tokens, semantic labels and the same curves—not WebView or copied DOM. Native work
must prove local persistence, cancellation, loading/empty/offline/failure states,
VoiceOver, TalkBack, text scaling, keyboard/IME behavior, safe areas, haptics,
frame rate, real photo picker, notification scheduling and system share/print.
None of those are claimed by this board.

## Verification · design 05 (2026-10-15)

- 148 non-sequence screens. Default-size light/dark/130% checks pass, as do all
  444 real 375×667 light/dark/130% cases and 148 wider 430×932 light cases.
- Captured all 296 light/dark rest frames. Inspected new guided and feature-state
  contact sheets plus the changed range/report surfaces. Captured 25/50/75% and
  final frames for guided identity, practice flight, note→Timeline, and range changes,
  then rechecked Timeline→detail→edit, medication→administration, task→edit and photo→Memory Book.
- All 35 scripted interaction journeys pass, including fast and guided first run,
  practice isolation, answer/photo reuse, dog isolation, confirmed deletion,
  task/Timeline commit, reminder retry, real range/report scope, receipt/draft
  retention, photo editing, currency/category totals, collection/caption scope,
  in-phone recurrence selection and sheet/dialog keyboard recovery.
- Screen registry, manifest, sequences, literal navigation targets and local
  script/style/research assets pass integrity checks. No console exceptions,
  horizontal overflows or controls below 48px were reported in the checked cases.
- Actual compact reflow fixed a 130%-text opening card/headline overlap. Shared
  clones now retain their measured size/type so an inherited style cannot pop at landing.
- All 38 text/status/event token pairs remain at least 5.40:1. JavaScript syntax,
  `git diff --check` and metadata/native-export verification pass.
- Real VoiceOver/TalkBack, native sheets/notifications, physical safe areas,
  keyboard/IME, haptics, frame rate and persistence are still unproved native work.

## Verification · design 04 baseline (2026-10-15)

- 126 non-sequence screens: light, dark and 130% text passed the console, registry,
  48 px target and horizontal-overflow checks (378 unique screen/theme/scale cases).
- All 19 interaction journeys passed. New journeys cover a note plus structured context and
  a sample attachment through save/edit/Timeline; retained drafts; validation preserving notes;
  standalone card state carried into the player; and sheet keyboard focus/Escape.
- Captured and inspected all 126 rest screens in light and dark, with contact sheets in `.qa/`.
  New choice-fill, helper-sheet, navigation-push and save/carry transitions were captured at
  intermediate frames; inspected the corrected fixed system chrome during navigation.
- A 375 × 667 phone at 130% text keeps the form scrollable and save action visible. Dark PDF
  preview uses explicit print-surface text colours. Reduced-motion finals retain every result.
- All 38 defined light/dark text/status/event token pairs pass at 5.40:1 or higher.
- JavaScript syntax, whitespace and metadata verification pass. Native colour/motion/icon
  exports still match the approved source. Device semantics, haptics and frame rate await native QA.

## Verification · v3 baseline (2026-10-15)

- 124 non-sequence screens rendered in Chromium across light, dark and 130% text: 372 automated
  passes, no console exceptions, error placeholders, targets below 48 × 48 px or horizontal overflow.
  Registry integrity passed.
- All 14 scripted journeys pass, including first run → coach on Home (name carried into the heading)
  and quick log → inline confirmation → Undo restores the count.
- Motion inspected frame by frame with `?reducedMotion=false` (headless Chromium reports reduced
  motion by default, so plain captures show final states): opening film, Home quick-log flight,
  Timeline row → Record carry, tab pill travel, Insights week reveal, and the full first run in the
  player. Light, dark and reduced-motion finals inspected for every redesigned screen.
- Contrast: existing 38 token pairs still pass (`tools/contrast.mjs`); the 24 new mark colours are
  ≥ 4.3:1 against both grounds in both themes.
- `python3 tools/design_tokens.py --check` and `python3 tools/verify.py --metadata-only` pass.
  No Gradle/Xcode, device, VoiceOver/TalkBack, haptic or frame-rate result is claimed.

## Credits

Ungenerated template: MIT (`UNGENERATED-LICENSE`). Lucide icon subset: ISC notice
in `js/icons.js`. Inter files are the app's existing OFL-licensed resources. The eight
Mobbin screenshots are private research references owned by their respective apps.
Product screens use original code-drawn dog artwork and local illustrative samples
labeled as examples.
