# task020 · Approved current-screen native redesign

Status: Earlier native foundation implemented; current visual parity incomplete
and reopened in task022. Owner approved the review direction on 2026-10-14
and asked to apply it to the native app. Depends on implemented task003/task004 UI.

## Scope

Port `design/board/` into shared Compose: H1 Home first, T1 Timeline, T2 detail/
edit/confirmed delete, nine detailed forms, O1 first-dog setup, P1 Profile and
I1's honest unfinished state. Retain controllers, scoped SQLite writes, saved
drafts, filters, paging, Back and navigation behavior. No schema/data changes.

Historical scope used board-derived tokens and Inter 400/500. The owner selected
the current web board exactly on 2026-10-16; task022 supersedes that font/layout
target with Bricolage display and Inter reading. Small Lucide vector subset,
no icon/animation dependency, no bitmap assets. Borders, no elevation, accessible
labels/targets and system dark mode. Firm press: 0.97 scale, 1 pt, 90 ms down;
0.30 response / 0.86 damping out. Calm 420 ms content entrances. OS reduced motion
renders final states, with lifecycle-scoped preference observation.

Canonical responsive/accessibility rules override the skill's fixed canvas and
SwiftUI-first demo recipe. iOS still hosts shared Compose. Do not retain two active
edit/controller compositions just to animate navigation. An explicitly launched
Debug review bar offers replay, destinations and slow motion. Normal launches and
Release do not display it. Never reset an existing journal.

## Acceptance

- [ ] Approved hierarchy/components on every current screen; no fabricated features.
- [ ] Success, loading, empty, retry and offline states remain factual and usable.
- [ ] Detail, type/scope/revision safeguards and confirmed deletion remain intact.
- [ ] Drafts, filters, scroll, quick saves and keyboard actions survive the restyle.
- [ ] Current board font pairing, contrast, >=48 dp targets, scalable text, safe areas and reduced motion.
- [ ] Generated color/icon/motion tokens match the board; no new runtime dependency.
- [ ] Debug replay/slow-motion tools are explicit and Release-disabled.
- [ ] Metadata, tests, Android Debug/Release/lint and iOS hosts checked.
- [ ] Native screens compared to board; physical haptics/frame rate/assistive QA reported separately.

Analytics stay disabled. Local features stay free and credential-free. The owner
authorized the full board application on 2026-10-15; task021 supersedes this task’s
earlier core-only boundary. AI remains unavailable. Physical QA remains separate.
