# AI chat — Atlas only (task039)

Latest owner direction, 18 October 2026: **pause local LLM/RAG work and use Atlas
only**. This supersedes on-device-first routing. Task038's recent-care card was
approved, then paused before native implementation. No native chart/card is shipped.

Normal chat and explicit live review use `AtlasResponseProvider`. Default design
fixtures remain labelled demos. AppContainer does not create or read a local AI
runtime during startup/cleanup, and current chat does not perform automatic local
retrieval. Download controls and on-device photo-description actions are hidden in
the active flow. Existing model files, old source labels and journals are preserved.
No new model download or inference is performed.

Atlas requires saved cloud permission, a real Firebase identity, internet access
and server admission/context checks. Previous local-only message consent is not
cloud consent. Only explicitly allowed profile/selected record snapshots are sent,
including saved structured care details; automatic local facts and old local/demo
conversations are excluded. Prior Atlas exchanges are included only as complete
pairs whose source permissions still match. No photos or photo IDs are uploaded.

The selected profile's canonical name, breed/age, care notes and owner relationship
are supplied when profile sharing is enabled. Atlas is instructed to answer the
current question first and separate general education from saved observations.
Counts derive from explicitly selected records, never a generated health score.
No hosted journal index, synchronization or automatic whole-journal upload exists.

The transport keeps bounded request/response sizes, one same-key 401 refresh,
fresh Firebase UID checks, cancellation and mandatory server policy receipts.
Release remains disabled until server support and authenticated-device proof are
approved. `/health/ready` returned 200 during this pass; that is not live inference
or authentication proof. See [task039](../../tasks/task039-atlas-only-chat.md).

The composer clears only after the SQLite message transaction commits. Failed
saves and newer drafts remain intact. Billing stays disabled; Premium is a local
demo boundary. The free care journal remains usable offline without an account.

## Paused local implementation — historical task037 reference

The following documents preserved code and earlier checks, **not the active chat
route**. Local inference, model downloads, RAG refinements and native recent-care
card work are on hold at the owner's request. Do not resume them automatically.

### Runtime and downloads (paused)

The owner approved Android 8/API 26 and iOS 16.6 minimums for the shared runtime.
Llamatik 1.10.1 wraps native llama.cpp on both platforms. Its pinned source license
is MIT; the published Maven POM says Apache-2.0. The source license and bundled
native notices are included in Compose resources.

| Use | Optional model | Download | Memory eligibility |
| --- | --- | --- | --- |
| Text | Qwen2.5 0.5B Instruct Q4_K_M | 491,400,032 bytes, shown as 492 MB | At least 3 GB reported physical RAM |
| Scene captions | SmolVLM 500M Instruct Q8_0 plus f16 projector | 636,275,712 bytes, shown as 637 MB | At least 4 GB reported physical RAM |

Both models are Apache-2.0. The publisher repositories, immutable revisions,
filenames, sizes and SHA-256 values are in
[ModelCatalog](../../shared/src/commonMain/kotlin/com/dracoarts/shared/services/ai/ModelCatalog.kt).
These RAM thresholds are eligibility guards, not measured performance guarantees.

Downloads start only from an explicit action in **AI & your records**. They use a
separate unauthenticated Hugging Face/CDN client; no journal content, Firebase
token or photo is included. A `.part` file is published atomically only after
exact size and SHA-256 validation. Cancellation removes the partial file; retry
preserves already verified components. Storage needs remaining bytes plus 128 MB.
Removal touches only catalog model files. Models live outside the journal, in
Android no-backup storage or iOS Application Support excluded from backup.

Home/startup never loads weights or downloads them. Questions/captions validate
the files again, acquire one native-runtime lock, run on a worker thread and
release native resources afterwards. Stop, backgrounding, identity changes,
consent changes and dog changes cancel requests. Inference has a 90-second
deadline. Text uses CPU, two threads, a 4096-token context and at most 512 output
tokens. A context too large for the local adapter may use the explicit Atlas path.

Full SHA-256 verification streams through Apple CommonCrypto or Android's
MessageDigest with a 64 KiB buffer. No model-integrity check is skipped or cached.
Native iOS profiling found common Kotlin hashing consumed 10.2–10.5 seconds per
text request; platform hashing consumed 0.37–0.54 seconds. The same synthetic
text prompts took 13.2–15.0 seconds before and 3.3–5.1 seconds afterwards on the
owned iOS 18.5 simulator. Loading still happens on demand and weights are released
after every request. These are simulator samples, not physical-device promises.
See [timing evidence](../design/evidence/task037/ios-latency-comparison.txt).

The composer reads controller state directly. Successful SQLite message commit
consumes its draft and clears the field before inference; a failed commit keeps
the typed text and attachments. Trimming the saved message cannot prevent the
field from clearing. Delayed pre-send draft jobs cannot restore consumed text,
and typing the next question while inference runs preserves that new draft.

## Data and safety

The owner requested automatic local context after downloading Qwen on 18 October.
After AI opt-in, each local text question receives the current dog's profile and
up to 12 recent/relevant care observations from the latest 60 saved timeline
records, independently of the cloud picker's date range. Structured details
(such as walk duration) and bounded caregiver notes are included. Only this dog's
records are read; no photos, receipts or whole-journal dump are added. The prompt
includes question time/time zone, readable UTC record times, a limited-coverage
notice and up to two recent caregiver questions. Generated replies are excluded from factual
questions. An explicit rewrite/edit follow-up may include an eligible earlier
draft, subject to the same source-context checks. Profile/note text is
bounded for the small model. Older demo/safety/caption answers are excluded.

The prompt also includes total/per-type counts computed from the supplied
record sample. These are not complete-day totals. Earlier generated answers
never substitute for these facts.

General dog-care/health education (grooming, routines, enrichment and preparing
for vet visits) works without logs. Missing personal facts stay unknown; clinical
assessment, diagnosis and treatment remain outside the model's role.

Atlas profile/record toggles control **cloud sharing only**. Automatic local
profile/records are separate request fields and never silently become cloud
context. Earlier local assistant text with unshared or changed source snapshots
is also excluded from Atlas conversation history. Sources and response origin persist in SQLite; old messages
without a source field remain labelled **demo**. Failed requests save the user
message without inventing an assistant reply.

Photos are never sent to Atlas. Each saved attachment has an explicit
**Describe on device** action. The vision model receives only that local photo
and a scene-only prompt, with a 5 MB input limit. Captioning failure cannot fall
back to a cloud image service. No health, breed or clinical interpretation is
authorized. Generated drafts can be wrong; safety filters are not clinical
validation. Oil/aromatherapy, lavender/chamomile, herbal and supplement text is
conservatively withheld, along with diagnosis/dose outputs. This follows an
observed unapproved grooming suggestion; [ASPCA explains the importance of
formulation and exposure](https://www.aspca.org/news/essentials-essential-oils-around-pets).
The filter is not exhaustive veterinary review. Emergency, toxicity, dosing and treatment questions use bounded
non-model responses. Veterinarian review and physical-device evaluation remain
release requirements.

## Atlas text contract

The client uses `https://atlas.dracoarts.com/v1/chat`, BarkLog app UUID
`caaf9c52-60f3-4fe2-b71a-3b59d065089a`, native Firebase bearer tokens and
`google-play`/`ios` platform attribution. Public identifiers are not credentials.
There is no operator key or service-account JSON in the app.

Cloud processing requires a separate saved choice, off by default. Local text
runs first; unavailable/unsupported/missing models may use Atlas with that choice
and a current SDK identity. Requests are non-streaming, with bounded context,
650 output tokens, optimization off and a UUID idempotency key. A 401 gets one
forced-token-refresh retry with the same body/key. Account identity is checked
before and after network work. Other failures do not retry automatically.

`metadata.contextRequired=true` names `barklog.ask-barklog-ai`. Answers require
both `X-Atlas-Context-Checked: true` and the matching
`X-Atlas-Context-Feature` receipt; missing/mismatched receipts withhold the answer.
The request body is limited to 32 KB; responses to 64 KB and answer text to 16,000
characters. Tokens stay in transient memory, outside documents and diagnostics.

Release fallback remains disabled. Debug wiring does not prove live service
readiness. At the latest console check, Firebase registration was disabled at
revision 0 and context checks were off with no feature contracts. The owner is
configuring the server. Service-account JSON belongs only in the approved server
secret store, referenced by a safe `file:` or `env:` value. The console project
field accepts an array of `projectId`, numeric-string `projectNumber` and
`credentialRef`, never the private JSON itself.

A review-only [BarkLog feature contract](atlas/barklog-ask-feature.json) is prepared
for the server owner, including general non-clinical care education without logs.
It does not activate checks or choose provider budgets,
quotas, retention or user provisioning. Those server decisions and live preview
tests remain required.

See [task037](../../tasks/task037-local-ai-and-atlas-fallback.md) for current
verification and remaining native/live/physical-device gates.

## Live local AI in a design-review journal

Normal app mode always uses the real provider. Deterministic design fixtures use
labelled demo responses by default, even if a model has been downloaded. To test
real inference with existing preview records, Debug hosts accept an explicit
live-review option:

- iOS: add `-LiveAIReview` alongside `-DesignReview`, a known
  `-DesignReviewFixture` and `-DesignReviewScreen next-chat`.
- Android: add `--ez liveAiReview true` with the corresponding `designReview`,
  `designReviewFixture` and `designReviewScreen` extras on a fresh Activity.

Both hosts disable this option in Release. The existing fixture database,
conversation history and downloaded files stay in place. No records are moved
into the separate normal journal. Fixture Firebase/Atlas access stays disabled;
local inference needs no account. The existing Premium demo flag remains a
local access boundary, never a purchase entitlement.

Synthetic native text, count, no-log general-care and scene-caption checks pass.
Actual iOS live preview also used the installed Qwen file and automatic dog
context. The 0.5B model has demonstrated miscounts, repetitive text and an
unapproved remedy suggestion. Computed facts, draft-history isolation and a
conservative output filter address those observed cases; broad factual/clinical
quality, physical-device behavior and accessibility remain release gates.


## Current AI and interaction direction · 19 October 2026

Task039 supersedes the preceding local-first route: normal chat is Atlas-only.
Local LLM/RAG work is paused; preserve installed models and history without loading
or downloading models in the active flow. Fresh native Firebase identity, context
policy checks and matching receipts remain required. Task040 has live Debug proof;
Release stays gated. Native password authentication never treats a demo identity
as real Firebase auth.

The owner approved task041's compact reply cards and delegated task042's sound
choice/native continuation. New affirmative versioned consent automatically includes
this dog's fresh saved profile/name and seven local calendar days (today plus six
preceding days), ending at question time. Prior manual consent cannot expand
silently. One SQLite read transaction provides exact counts and daily bars. At most
50 relevant/latest note excerpts and bounded profile facts fit the existing context
byte budget. Disclose total/shared counts and shortened profile facts; save source
snapshots with replies. Exclude photos, contacts, documents, other dogs and older
journal records. Dog/account/consent changes cancel requests; history is restricted
to compatible scope. Local care stays usable with AI declined or revoked.

Use BarkLog AI in product UI/errors/exports; internal registered IDs stay unchanged.
Show question-first answers, relevant saved-log cards and separate general care
ideas. Observations cannot establish health, diagnosis or treatment. No catalog,
products, affiliate links, billing or automatic photo upload is introduced.

Soft wood at 35% is selected, off until enabled. Optional volume/texture preferences
persist locally. Bundled original PCM plays through native adapters with one voice,
repeat/foreground/mute/interruption guards and nonblocking failure. Saved cues follow
committed local writes. Typing, scrolling, loading and AI generation stay silent.
See task041/task042 and their native evidence for actual verification; task022 parity
and physical audio/accessibility/release gates remain separate.
