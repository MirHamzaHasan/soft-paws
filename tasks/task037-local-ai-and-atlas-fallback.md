# Task037 — local AI and authenticated Atlas fallback

**Superseded active routing:** the owner stopped local LLM/RAG work on 18 October
and selected Atlas-only chat (task039). Preserve these implementations/checks for
later; do not load models or resume local QA now. The earlier scope below is
historical. Server/live-service and physical QA remain distinct open gates.


Owner authorization: 18 October 2026. Implement real on-device text replies and
photo captions, with Atlas text answers while the local model is unavailable.
This supersedes demo-only response scope; real billing remains disabled.

Status: In progress. Runtime/download/native adapters and the Atlas client are
implemented. Android native text inference is verified on synthetic observations;
vision passes on Android and iOS QA simulators; both iOS host configurations pass. Automatic local-context refinement passes native provider acceptance and JVM regressions. No live Atlas success is
claimed.

## Boundaries

- Preserve the local journal and SQLite filename/schema. No sign-in/network gate
  for care. Models are separate optional files and never loaded on Home.
- Explicit, cancellable downloads with pinned revision, size and SHA-256; retry
  and removal. Inference stays off the main thread and releases native resources.
- Try the available local text model first. Atlas text fallback requires an
  explicit saved cloud-processing choice, current Firebase identity, the BarkLog
  app UUID, bounded chosen context, idempotency and matching policy receipts.
- No photo upload. Scene captions run locally after a separate explicit action;
  unavailable local vision must say so. No clinical image interpretation.
- Emergency, toxicity, triage, diagnosis, medication/dose requests bypass models
  for the existing bounded safety response. AI never diagnoses or prescribes.
- Preserve the selected chat and existing settings/consent surfaces. Keep old
  saved demo answers labelled as demos. Demo Premium is not a server entitlement.
- Atlas Release remains off until approved server admission/context policy and
  signed-device proof exist; public client values cannot enable it alone.

## Verified external state

- BarkLog Atlas app: `caaf9c52-60f3-4fe2-b71a-3b59d065089a`.
- HTTPS origin `https://atlas.dracoarts.com`; health/readiness respond 200.
- Latest owner console check: Firebase registration remains disabled at revision 0;
  its project-list form has a JSON-array validation error. Context checks remain
  off at revision 0 with no authorized features. Server credential installation,
  safe-reference registration and credential rotation are owner-side prerequisites;
  no private credential values are stored in this task or app.
- Backend source/OpenAPI confirms Firebase bearer tokens for production `/v1`,
  `google-play`/`ios` attribution and UUID non-streaming idempotency.
- Shared downloadable runtime evaluation: Llamatik, llama.cpp GGUF text + VLM.
  Published runtime requires Android 26 and iOS 16.6. The owner explicitly approved
  raising both floors for the shared text/photo runtime; native targets now use them.

## Acceptance / evidence

- [x] Runtime/model/license/size selection and compatible native builds (minimum-OS/physical review remains open).
- [x] Model download, validation, cancel/retry/remove and corrupt/missing recovery (automated lifecycle tests; native UX/physical review remains open).
- [x] Local text and explicit local scene captions, truthful source labels (synthetic native checks on both platforms).
- [x] Atlas transport/auth, bounded context/receipts, failure/cancel/401 replay (automated; live server gate remains separate).
- [x] Controller consent removal, sign-out, dog switch and saved-message behavior.
- [x] Android/iOS Debug/Release builds, targeted regressions, metadata/lint/migrations.
- [ ] Configured live Atlas and native model evidence, physical-device profiling.
- [ ] Accessibility/visual checks for changed controls and remaining release gates.

## Earlier implementation checks (see final checks below)

- Metadata/tooling: 30 tests pass. Android Debug/Release, lint and SQLDelight
  migrations pass; 110 JVM tests pass, including auth-token UID binding, same-key
  401 replay, mandatory receipts, explicit cloud consent, no cloud captions,
  persisted source labels, old demo labels and consent cancellation.
- Real Android native text: the pinned Qwen model answered the synthetic chosen
  walk question with “17 minutes” (10.6 seconds on the QA emulator). This is a
  runtime check, not physical-device performance or broad answer-quality evidence.
- The first vision check was correctly withheld; investigation found the bridge
  adds the image marker but does not finish the SmolVLM conversation turn. The
  adapter now uses the pinned tokenizer's turn ending and a scene-only question.
  Repeat native acceptance passes: “A red square.” (52.7 seconds on the busy QA
  emulator). Text plus scene caption and removal/preserved-file acceptance:
  `LocalAiNativeTest`, 1 passed. Physical speed/quality is not inferred.
- Release R8 mapping preserves JNI GenStream callback method names with explicit
  product keep rules; the dependency's consumer rules did not include them.
- The first full iOS host build found the Firebase Swift async token method name
  mismatch; it now uses the installed SDK's `getIDToken(forcingRefresh:)`. Both
  host configurations must be rerun before reporting success.

## Owner refinement — automatic local dog context

After installing Qwen the owner requested no manual record attachment. Local
questions now read the current dog's profile and up to 12 recent/relevant saved
timeline observations from a bounded 60-record query. Structured care details,
UTC dates and question time/time zone are supplied; the cloud picker's Today/This
week list no longer restricts local context. Source snapshots persist with the
actual local answer. Empty logs still permit general dog-care/health education.
Clinical assessment, diagnosis and treatment remain excluded.

Automatic local context and explicitly shared Atlas context are distinct fields.
Cloud history is filtered against allowed source snapshots. Regression tests
cover dog scoping, older saved records, structured duration, persistence, empty
logs/read failure, actual provider selection and no automatic context/history in
Atlas payloads. Chat/settings copy explains this separation; real chats no longer
show the old demo footer. Deterministic review fixtures remain labelled demo.

Initial iOS native runtime acceptance passed with the pinned Qwen and SmolVLM
models: “17 minutes” and “A red rectangle.” Production-provider local-context and
no-log general-care acceptance also pass: “17 minutes” and actual grooming
guidance, with Atlas disabled. The 0.5B answer repeated some guidance; broader
quality and clinical review remain open. See task037 evidence.

Final automatic-context verification: 115 JVM tests, 30 metadata/tooling tests,
Android Debug/Release, lint, SQLDelight migrations and iOS Debug/Release host/bundle
checks pass. Real iOS production-provider local facts and general care with no
logs pass; native scene captions pass on both platforms. Existing ICU simulator
17.2 object metadata against the approved 16.6 floor, physical-device/assistive
review, 0.5B answer quality and configured live Atlas remain open. Release Atlas
stays disabled. This task is therefore still in progress overall.

Live local-AI review refinement: the installed Qwen file was confirmed in the
owned iOS app, while the displayed separate design fixture still selected the
demo provider. Debug hosts now accept an explicit `LiveAIReview` option to use
the real provider with that existing review journal. Default deterministic
fixtures stay demo; normal app mode stays real. The fixture database, downloaded
model, existing messages and the separate normal journal are preserved. Fixture
Firebase/Atlas access remains disabled. No data is copied between journals.

Live iOS review confirmed the real model could use the existing dog profile
(“Bruno; Mixed breed”) with eight automatically included saved records. A further
quality check caught Qwen counting two Walk observations as three. The local
prompt now includes deterministic per-type/total counts computed from the bounded
supplied sample, following conversation history, and directs the model to use
current computed counts. These are sample counts across listed dates, not a
claim of complete-day coverage. Native acceptance includes a deliberately wrong
prior assistant count to check that current facts win. Broader 0.5B quality and
clinical review remain open.

The first counter-regression still followed an earlier incorrect AI answer.
Local factual questions therefore omit generated assistant drafts from runtime
history; only explicit editing/rewriting follow-ups may include an eligible draft.
Current SQLite-derived sample counts remain supplied separately. User questions
still provide conversational context. Atlas source-sharing filters are unchanged;
its count fields derive only from explicitly selected cloud records.

A later safety review rejected the generated grooming suggestion to use calming
scents without product/exposure context. BarkLog now conservatively withholds
outputs mentioning oils, aromatherapy, lavender/chamomile, herbal remedies or
supplements, alongside the existing diagnosis/dose limits. The observed output is
a regression fixture; it is not approved care guidance. General enrichment without
logs remains supported and is tested separately. These filters are not exhaustive
clinical validation. ASPCA explains that concentrated oil exposure can cause
health concerns and that formulation/exposure matters:
[ASPCA essential-oil guidance](https://www.aspca.org/news/essentials-essential-oils-around-pets).

Final post-safety verification passes: `python3 tools/verify.py --ios` completes
Android Debug/Release, lint, preserving SQLDelight migrations, 117 JVM tests,
30 metadata/tooling tests, and iOS Debug/Release host/bundle checks. Native pinned
model acceptance and the corrected real iOS chat check also pass. The owned
Android app was updated in place; iOS remains open in explicit live-AI review
using the existing installed Qwen file and preview journal. No live Atlas call or
server configuration change was performed. Clinical/quality, minimum-OS/physical,
assistive and live Atlas gates remain open; task037 is still in progress overall.

## Composer clearing and response latency · owner follow-up 18 October

The owner reported Send retaining text and slow local replies. The composer now
reads controller state directly and clears only when the SQLite message transaction
consumes its draft. A failed transaction retains input/photos; stale keystroke jobs
cannot restore consumed text; the next question may be typed during inference.
Suggested prompts/regeneration keep an existing draft. Whitespace/newlines are
trimmed only for the saved message, with no UI string-comparison clearing race.

Native profiling identified full-model Kotlin/Native SHA-256 as the dominant
cost (10.2–10.5 seconds per text request). Both platforms now use their native
streaming SHA-256 providers with a 64 KiB buffer, preserving full per-request and
download checks. On the same iOS 18.5 simulator and unchanged pinned prompts, text
requests fell from 13.2–15.0 seconds to 3.3–5.1 seconds; the scene caption fell from
14.6 to 1.8 seconds. Loading, threads, safety checks and release-after-request
behavior are unchanged. This is simulator evidence, not physical-device approval.
See docs/design/evidence/task037/ios-latency-comparison.txt.

Targeted acceptance passes: 120 JVM tests, two iOS native tests (known SHA-256
vector plus changed bytes; real text/count/no-log/caption inference). Full `python3 tools/verify.py --ios` verification passes: Android/iOS Debug and
Release, lint, migrations, 120 JVM tests and 30 metadata/tooling tests. Native UI
review confirms whitespace/newline Send clears during preparation and remains
empty after the real Qwen reply. The owned iOS app was updated in place and left
open; its installed model and journal remain intact. The owned Android QA emulator
was no longer running, so its fresh APK was built but not installed; the other
project's emulator was left untouched.
