# task041 · BarkLog AI answer cards and automatic weekly context

Owner request: 19 October 2026, following live native AI testing.

Status: owner accepted the board direction on 19 October (“ok great”). Native
cards, fresh weekly context, versioned consent and BarkLog AI branding are now
implemented and simulator journeys pass. Current live requests are blocked by
server feature authorization (422 CONTEXT_FEATURE_UNKNOWN). Task040's earlier live
responses remain historical proof under their prior manual scope. Do not resume
paused local-model/RAG work.

## Owner direction

Keep the liked overall chat layout, typography, text style and compact controls.
Make replies easier to read with cards and question-relevant previous care logs.
Reserve a contextual dog-product placement for a later Amazon affiliate phase;
no product catalog, real recommendation, price, link or integration now.

The later clarification supersedes per-record selection for this new AI flow:
automatically include the current dog's name/profile and the past seven days.
Use **BarkLog AI** in every product surface, source label, error and export.
Atlas remains an internal transport/service name, header and source identifier.
Do not rename the registered server feature or alter identity/policy receipts.

## Reviewable board

New isolated `next-answer-cards` section in the existing premium board:

- [Walk question and related logs](http://localhost:4278/premium/index.html?answerTheme=light#play-next-chat-cards)
- [Brushing and related notes](http://localhost:4278/premium/index.html?answerTheme=light#play-next-chat-cards-brushing)
- [No matching notes](http://localhost:4278/premium/index.html#play-next-chat-cards-no-match)
- [No logs](http://localhost:4278/premium/index.html#play-next-chat-cards-empty)
- [Automatic sharing consent](http://localhost:4278/premium/index.html#play-next-ai-cards-consent)
- [Future product placement, inactive](http://localhost:4278/premium/index.html#play-next-chat-cards-products)
- Loading/stop and connection-error/retry states in the same row.

The examples use an explicitly authored 13–19 October fixture. Counts and daily
bars derive from its rows (12 total, 7 walks, 2 grooming, 3 meals). The empty and
no-match variants remove rows; zero never means an action did not happen.
Sources open original readable notes. The automatic-context button reviews the
profile and week rather than asking the user to understand record selection.
No real care data, Firebase session or service request is accessed by the board.

Research reuses the previously reviewed Claude writing column and ChatGPT
conversation structure, with BarkLog's existing kit. General handling copy is
checked against [Dogs Trust's handling guidance](https://www.dogstrust.org.uk/dog-advice/health-wellbeing/at-home/how-to-handle-your-dog)
and [enrichment guidance](https://www.dogstrust.org.uk/dog-advice/life-with-your-dog/enrichment/enrichment-activities-for-dogs).
The graph is a record count, never a health, activity adequacy or wellbeing score.

## Authorized native slice

1. Version the consent scope for automatic profile + weekly cloud context. Older
   messages/profile/selected-record consent must not silently expand. One clear
   affirmative opt-in enables the new AI flow; declining leaves the local journal
   and saved conversations usable. No individual record picking is required.
2. Read the current dog's persisted profile and SQLite records fresh per question.
   Seven local calendar days means today and six preceding days, ending at the
   question timestamp (exclude future records), using the device time zone.
   No photos, contacts, other dogs, documents or older journal records enter this
   scope. Cancel in-flight requests on dog/account/consent changes as today.
3. Derive scope/counts from the database. Bound source text to the server's current
   payload budget; include honest total/shared counts and a visible limitation
   when a busy week cannot fit. Never silently call 50 selected rows a whole week.
   Request exact facts from supplied counts, not model arithmetic; retain source
   snapshots and date range with each saved answer. No local LLM/RAG is needed.
4. Separate a question-first answer, a relevant saved-log card and general care
   ideas. Do not invent structured facts from model prose. Relevance operates
   within the consented seven-day set. Missing logs stay unknown; observations
   cannot establish a condition or that the dog is healthy.
5. Keep Firebase freshness, server context checking and feature receipts intact.
   Retain existing protection against leaking older local/demo or differently
   scoped conversations through cloud history. Keep Release gating unchanged.
6. Replace user-facing backend names across normal/review UI, auth/network errors,
   historical answer labels and report output. Keep internal `atlas` persistence
   IDs/headers/classes unchanged. Prevent model replies from exposing backend
   branding; do not rewrite historical caregiver messages.
7. Product module is absent in current answers. A future matched category can use
   the reserved placement after a separate catalog/affiliate authorization. Never
   show unrelated products or commerce beside urgent/clinical refusals.

## Acceptance / remaining work

- [x] Preserve the existing board chat shell; isolate the new response section.
- [x] Authored populated, unrelated-log, empty, consent, future-slot, loading/stop
  and error/retry states.
- [x] Screenshots/contrast/keyboard/130%/small-phone/reduced-motion verification:
  22 layouts, source/context/profile sheets, explicit consent, stop/retry, no
  browser errors/external requests. See [evidence](../docs/design/evidence/task041/README.md).
- [x] Owner visual review before new native cards/consent UI, as required by AGENTS:
  accepted on 19 October. Preserve this direction while reviewing task042's new sounds.
- [x] Shared native context/consent/branding/card implementation and meaningful
  dog isolation, week boundary, truncation, reconsent, source/history and failure tests.
- [x] Native simulator cards, sources, context review and sound/settings journeys
  on the isolated authored fixture. Normal care events/profiles remain unchanged.
  See [native evidence](../docs/design/evidence/task041/native-2026-10-19/README.md).
- [ ] Live weekly acceptance: both weekly and minimal authenticated Android requests
  currently return 422 CONTEXT_FEATURE_UNKNOWN. Backend must authorize the existing
  feature; see the [exact report](../docs/product/atlas/2026-10-19-feature-authorization-diagnostic.md).
- [ ] Individual native visual/assistive review: captured iOS status icons remain
  light after dismissing the source modal; system-bar contrast needs another pass.

This task does not activate billing, Amazon, local models or Release cloud AI.
