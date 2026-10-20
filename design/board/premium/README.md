# BarkLog · AI and onboarding proposal

Owner-requested 16 October 2026. Uses Ungenerated's BarkLog kit, motion, onboarding,
account, paywall, copy, accessibility and visual QA guidance. This is a new review
chapter; the selected local-v1 board and installed KMP app are unchanged.

Run the existing server from the repo root:

```sh
node design/board/tools/serve.mjs 4278
```

Open <http://localhost:4278/premium/index.html?reducedMotion=false>.

20 October refinement: [Paywall](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-paywall),
[care plan](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-plan)
and [your plan](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-manage-plan).
Task047 now uses a new original notebook puppy, a moving checked price choice and
the owner-selected three USD prices. Store setup remains pending; this pass is
a board proposal awaiting review before native UI. The owner rejected reused
spaniel art and requested this fresh Rive file in #40.
[Watch the new Rive](http://localhost:4278/refinements/rive-care-notebook/index.html).
See [refinement notes](research/plan-paywall-047.md).

19 October listening preview: [Soft interaction sounds](http://localhost:4278/premium/index.html#play-next-sounds).
Enable the switch to compare Soft wood / Soft pop and tap/selection/saved cues.
Sound stays optional and local; native audio is a subsequent reviewed slice.

19 October review: [BarkLog AI answer cards](http://localhost:4278/premium/index.html?answerTheme=light#play-next-chat-cards),
[automatic profile/week consent](http://localhost:4278/premium/index.html#play-next-ai-cards-consent)
and [future product placement](http://localhost:4278/premium/index.html#play-next-chat-cards-products).
These eight isolated task041 states supersede manual context picking for the new
proposal only. Native automatic weekly sharing and cards await this board review.

- [Full first session](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-opening)
- [Free Home](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-home)
- [Premium Home](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-home-premium)
- [Chat](http://localhost:4278/premium/index.html?scenario=premium&reducedMotion=false#play-next-chat)
- [Paywall](http://localhost:4278/premium/index.html?reducedMotion=false#play-next-paywall)

Five new rows contain 54 screens/states and five replay sequences. The first-session
setup has 20 surfaces, including eight added dog-detail/review screens. The original
journal library remains below them. Research is in the board's Research view and
the [concept](research/concept.md) and [business memo](research/strategy.md).

## Working prototype paths

Light is the default, including under a dark system theme; an explicit theme choice
is retained. Optional dog context covers age/birthday, any custom or mixed breeds,
sex/neuter status, size/measured weight, traits, activities, food/sensitivities and
caregiver-provided care notes. Priorities, routines and AI topics support multiple
selections with removable chips. A review screen lets people edit every answer.

Personal choices carry into the plan, Profile and explicitly selected AI context. Permission
approval/denial, reminder on/off, selected-photo/cancel and camera are separate.
The notification switch stays off until Allow returns; denial offers a Settings
preview. Turning reminders off keeps the simulated OS grant. Three notification
types have separate preferences. Photos and camera stay per-use actions.
Apple/Google provide approval, cancel and failure review outcomes. Email validates,
waits for a simulated link and handles expiry. Use **Email link** outside the phone
to simulate the return.

Home groups a larger dog, count and readable strip inside one card, above the four
quick-care targets, with a fixed AI
entry above the tabs. Tap the dog to greet it. Six shuffled idle actions settle
with quiet gaps; a saved care moment takes priority. The larger card scrolls with
the page, and the AI entry reserves its measured height so controls stay reachable.
Offscreen/hidden/paused mascots stop, and reduced motion stays still. Free users see the paid value screen. Premium chat has
explicit message/profile/record permission, authored streaming, stop/regenerate, source
records and an immutable dog-profile source snapshot, Today/This week context selection and removal, history/new/delete, no data, connection failure/retry,
an allowance state and bounded responses to urgent/medical requests. AI recap,
appointment questions and memory captions have Home entries.

Prices are **undecided** by owner request. Both billing options say so and paid
CTAs are disabled. The review controls open Premium, a proposed dated trial or an
ended subscription. Cancellation leads to a platform handoff preview. Previously
kept conversations remain readable after simulated Premium access ends. Account
deletion is distinct from billing and the device journal.

## Boundaries and review

Data is in memory and resets for a new review session. Only existing reviewer
Picks/Notes use the local board store. This board does not authenticate Firebase,
send email, run AI, purchase, change a subscription or grant any OS permission.
Native sheets are simulations; legal text is a draft. Provider/retention terms,
account ownership, prices, allowance and store configuration require separate
decisions before native implementation and release.

Use `?platform=android` for Android sheets; iOS is the default. Also review
`?textScale=1.3&phone=375x667`, `?reducedMotion=true` and both themes. Firm press,
emphasized movement, earned dog reactions and stoppable streaming have immediate
reduced-motion finals.

## Validation

The tools accept an existing Playwright install; no mobile dependency is added.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/qa.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/journeys.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/onboarding-motion.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/mascot.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/contrast.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/integrity.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node design/board/premium/tools/retention.mjs
```

See [task026 mascot evidence](../../../docs/design/evidence/task026/README.md),
[task025 refinement evidence](../../../docs/design/evidence/task025/README.md)
and [the original task024 evidence](../../../docs/design/evidence/task024/README.md). Prior
simulator checks do not validate these new board screens. Native parity, physical
accessibility/performance, store approval and real integrations remain unproven.

## task038 review — paused after approval

The owner approved `next-chat-grounded` (direct answer, dog identity and recent-care
bars) on 18 October, then stopped local LLM/RAG work and chose Atlas-only chat.
The three `next-grounded-chat` board examples remain for later; no native card was
built. Task039 takes priority. Do not restart local-model/card work unprompted.
