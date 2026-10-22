# Current KMP feature status

**Soft Paws · 22 October 2026:** This repository is now the separate cat app.
Its current port has 89 implemented-unverified / 0 pending surfaces, including
the native cat/Rive idle, Journal, prescribed-care/documents and care planning
with real native date/time controls, plus nine Safety/contact destinations, five
observations/report surfaces, three expense destinations and three photo/Memory
Book destinations with real local files, atomic selection and guarded native PDF.
Cat photo films add a preserving title, separate free preview and actual guarded
MP4 export/share; the reported preview navigation crash is corrected. Optional account/plan screens now use the cat kit, actual native availability,
transient passwords, full prices and free exits. AI, profiles, settings and seven recovery/global states finish the approved screen inventory, with preserved drafts/revisions and real unavailable-service behavior. All 184
JVM tests, Android/iOS builds and scoped native journeys pass. Individual visual
approval and physical/assistive coverage remain open. See the
[Soft Paws source of truth](../source-of-truth/soft-paws-product-engineering.md)
and [native port](../../tasks/soft-paws-task002-native-port.md). The BarkLog status
below is inherited history, not evidence that all cat screens/services are ready.

**Latest · 20 October 2026 · task046:** Additional dogs and AI/Safety explanations
are Premium; first-dog care, existing journals and emergency calls stay available.
The three USD plans and native RevenueCat boundary are implemented, inactive until
the owner supplies configuration. Coming soon training, six-country animal poison
presets, optional one-shot area lookup and Premium Maps vet search are implemented.
Android/iOS Debug/Release, 146 JVM tests and native pricing/Safety journeys pass.
The owner explicitly deferred the live AI recheck and real store setup. See
[task046](../../tasks/task046-premium-safety-and-nearby-vets.md) and its
[evidence](../design/evidence/task046/README.md) for actual coverage and release gates.


**Earlier provider direction · task039:** use Atlas only. Local model/RAG work and the
approved recent-care card are paused; no native graphical card is delivered.
Atlas-only client and consent/context paths are implemented. Authenticated web
generation using the native request shape passed on 19 October with HTTP 200 and
matching policy receipts. Normal iOS/Android simulator apps now display and save
real Atlas replies; physical/store acceptance remains open, with Release gated. Downloaded files and
journals are preserved. Earlier task037 implementation notes below are historical.


Reset date: 2026-10-14. The former RN feature list is reference only.

For the 17 October 2026 handoff, see the full
[finalization and connection checklist](../release/finalization-checklist.md):
owner inputs, real-service work, native QA and store/signing gates. Task036 on 18 October supersedes demo-only auth with native Firebase SDK adapters;
provider setup and live verification remain pending. Task037 implements optional
local models and the Atlas client, with native verification in progress. Premium
remains a demo; Atlas authenticated web and native simulator replies now pass,
while physical-device and Release acceptance remain open.

| Feature | Status | Rebuild task |
| --- | --- | --- |
| Pet food scanner / pantry recalls | Future Premium feature; Coming soon card only, no scanner or monitoring service | [task048](../../tasks/task048-premium-pet-food-scanner.md) |
| Plan/paywall visual refinement | Implemented in shared Compose; Android/iOS builds and native UI journeys pass; physical/assistive review open | [task047](../../tasks/task047-premium-plan-motion-design.md) |
| Premium, Safety and nearby vets | Local implementation/native journeys/builds pass; RevenueCat configuration and live AI recheck deferred by owner | [task046](../../tasks/task046-premium-safety-and-nearby-vets.md) |
| Soft interaction sounds | Native sound settings, wood/pop PCM adapters and committed-save cues verified in both simulators. Default off; wood at 35%; real-phone audio review remains | [task042](../../tasks/task042-soft-interaction-sounds.md) |
| BarkLog AI answer cards and automatic weekly context | Native cards, BarkLog AI naming, versioned weekly consent and bounded fresh SQLite context verified in simulator journeys. Current authenticated weekly and minimal calls return 422 CONTEXT_FEATURE_UNKNOWN; backend authorization and visual/physical gates remain | [task041](../../tasks/task041-barklog-ai-answer-cards.md) |
| Firebase Authentication | Native Google/Apple/email-password adapters and legacy links; live iOS/Android QA password identity and Atlas replies verified. iOS SDK identity survives relaunch. Android/iOS build/126-test baseline retained; other providers, physical/store signing remain open | [task036](../../tasks/task036-firebase-authentication.md) |
| Home Ask entry and Premium PDF outputs | Implemented; current 87-test/build baseline passes; mobile report/CSV free, local demo plan only | [task033](../../tasks/task033-premium-outputs-and-home-entry.md) |
| Photo highlight films | Approved shared editor and local MP4 encoders verified in simulators; real billing/physical QA pending | [task034](../../tasks/task034-native-video-highlights.md) |
| Chat photos, vet contacts and report | Local attachments, factual report/Premium PDF and keyboard layout verified; demo AI does not analyze photos | [task035](../../tasks/task035-chat-care-tools.md) |
| Native Rive spaniel mascot | Clean paid-workspace export; Android/iOS greeting, quiet idles, post-commit save/Undo, still motion and lifecycle; builds/simulator checks pass, physical QA pending | [task032](../../tasks/task032-native-rive-mascot.md) |
| Free Glaxnimate mascot animation study | Editable assets/browser preview checked; superseded by owner-selected Rive | [task030](../../tasks/task030-glaxnimate-mascot-preview.md) |
| Detailed onboarding, optional demo login and companion chat | 54 native routes; real local profiles/history, demo replies; no real credentials/billing; visual/device QA open | [task027](../../tasks/task027-native-companion-board-and-main.md) |
| Native KMP/Compose hosts and brand | Implemented foundation | task001 |
| Home/Timeline/Insights/Profile navigation | Implemented native routes; real local data | task001/task003 |
| Retryable startup, lifecycle, haptics | Implemented foundation | task001 |
| Local SQLite and care repository | Implemented; JVM and native driver tested | task002 |
| Dog setup, quick logs, basic timeline | Implemented; simulator journeys pass; platform gates remain | task003 |
| Detailed logs, event edits/filters | Implemented; simulator journeys pass; platform gates remain | task004 |
| Multiple dogs and settings/deletion | Implemented; physical QA pending | task005 |
| Medication/vaccination records | Implemented; physical QA pending | task006 |
| Care Calendar and reminders | Implemented; opt-in native adapters; physical delivery QA pending | task007 |
| Deterministic summaries/trends | Implemented; physical QA pending | task008 |
| Offline Safety Center | Implemented; physical QA pending | task009 |
| CSV/PDF and vet prep | Implemented; physical QA pending | task010 |
| Training catalog/progress/sessions | Implemented; physical QA pending | task011 |
| Photos/baselines | Implemented; physical QA pending | task012 |
| Expenses | Implemented; physical QA pending | task013 |
| Local AI/model lifecycle | Paused by owner; runtime/download code and installed files retained, no active model controls or inference | [task037](../../tasks/task037-local-ai-and-atlas-fallback.md) |
| Legacy journal import/update compatibility | Not implemented | task015 |
| Physical-device/store/performance sign-off | Pending | task016 |
| Local conversation and captions | Real text/local scene captions; automatic current-dog local context, saved source labels; synthetic native acceptance passes; physical/quality review open | task017/task027/task037 |
| Atlas-only AI chat | Explicit cloud consent/selected context, Firebase identity and mandatory policy receipts; web plus normal iOS/Android simulator replies verified on 19 October, saved source `atlas`; physical/store acceptance pending, Release gated | task039 |
| Memory Book | Implemented; physical QA pending | task019 |
| Earlier Ungenerated native design foundation | Implemented foundation; current visual parity incomplete | task020 |
| Local-v1 board feature application | Functional implementation verified; not exact visual/motion parity | task021 |
| Exact current web-board parity | In progress; shared parts, Home/setup and product families being ported; 123 product entries, zero matched | [task022](../../tasks/task022-exact-board-native-parity.md) |
| Readable Home strip and shared motion refinement | Implemented; Android/iOS simulator checks pass; physical feel review remains | [task023](../../tasks/task023-readable-care-and-native-motion.md) |

Current owner priority: the approved native films and compact chat care tools,
then reviewed native MP4 rendering. See [the current plan](premium-features-and-video.md).

Finalization still requires task015 compatibility policy and task016 physical-device, assistive,
exhaustive motion-frame, performance/signing and release checks.
The owner requested the whole approved board in the application on 2026-10-15.
See [native board port](../native-board-port.md) for the actual scope and limits.
Optional AI and remote services remain separate. No cloud backup/sync, household
sharing, smart automation, ads or paid packaging is scheduled.


### Chat care tools · task035 (2026-10-17)

The approved compact chat now includes up to three local photo attachments per message, saved vet/emergency call actions and a vet-report mobile preview. SQLite transfers composer attachment ownership atomically into each saved conversation. Report PDF uses the existing Premium gate; mobile preview and care logging remain free. Caregiver messages/selected dog-scoped records are factual inputs; demo AI replies and photos are separate opt-ins. General medication education never selects drugs/doses or treatment. Images are not analyzed or uploaded. Native photo/persistence, contacts, PDF and keyboard checks are recorded in task035; real AI, billing and clinical review remain deferred.

## Local AI and Atlas · task037 (2026-10-18)

[Current contract and models](local-ai-and-atlas.md) supersede historical demo-only
AI statements above. The owner approved Android API 26/iOS 16.6. Photos stay local;
Atlas is text-only and unavailable without saved consent, native Firebase identity
and server context receipts. Billing remains disabled.

The owner subsequently requested automatic local dog context: Qwen receives the
profile and up to 12 recent/relevant saved timeline observations, without a
manual selection step. General care education works without logs. Cloud context
remains an explicit separate sharing choice; source snapshots prevent unshared
local answers from entering Atlas history.

## Additional-dog setup · 19 October 2026

[task043](../../tasks/task043-additional-dog-onboarding.md) replaces the short
additional-dog form with the approved full dog onboarding. Independent local
drafts support Finish later/resume, final review and dog-scoped profile/AI data.
Implementation, SQLite tests, all 137 JVM tests and Android/iOS Debug/Release
checks pass. Complete setup, save-to-Home, switching and restart are verified in
the owned simulators. The iOS selection race exposed during testing is fixed;
normal journals retain their pre-test row hashes. Physical/assistive testing and
individual visual approvals remain open.

19 October · [task044](../../tasks/task044-profile-tab-selection.md) fixes the
Profile tab remaining unselected while its account menu is open. Menu and tab
now change in one navigation action. Android/iOS Light/Dark checks, all 138 JVM
tests and both platforms' Debug/Release checks pass; normal journals are preserved.

19 October · [task045](../../tasks/task045-continuous-tab-highlight.md) keeps the
same scene and bottom dock alive across Profile entry/exit, allowing the green
pill to glide using the existing spring. Android/iOS Light/Dark recordings show
intermediate positions and a stationary dock; Reduce Motion skips the slide.
Selected semantics, iOS profile/switcher navigation, 138 JVM tests and both
platforms' Debug/Release checks pass. Normal-journal hashes match after testing
and the owned Android emulator's in-place relaunch. Physical feel/assistive and
individual visual approvals remain open.
