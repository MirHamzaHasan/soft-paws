# Soft Paws work

- [soft-paws-task001 · repository, cat design board and original Rive companion](soft-paws-task001-cat-redesign.md)
  — design approved on 20 October 2026; repository/design scope complete.
- [soft-paws-task002 · approved Android/iOS native port](soft-paws-task002-native-port.md)
  — in progress; cat storage and identity checks pass; screen parity remains unverified.
- [soft-paws-task003 · ongoing cat motion](soft-paws-task003-cat-motion.md)
  — complete; native motion/settings checks and both platform Debug/Release builds pass.
- [soft-paws-task004 · prescribed care and vaccination records](soft-paws-task004-prescribed-care.md)
  — implemented; 159 JVM tests, native care/document journeys and both platform builds pass; visual/physical approval remains open.
- [soft-paws-task005 · care planning and native date/time controls](soft-paws-task005-care-planning.md)
  — implemented; 164 JVM tests, native planning/picker journeys at both text sizes and both platform builds pass; visual/physical approval remains open.

- [soft-paws-task006 · cat Safety and contacts](soft-paws-task006-cat-safety.md)
  — implemented; nine cat Safety screens, 168 JVM tests, native normal/larger-text and permission-denial journeys, and both platform builds pass; visual/physical review stays open.

- [soft-paws-task007 · observations, measured weight and reports](soft-paws-task007-insights-and-reports.md)
  — implemented; 171 JVM tests, native journeys at both launch text sizes, real CSV/share, preserved report scope and both platform builds pass; live Android font-change and visual/physical review remain open.
- [soft-paws-task008 · recorded cat-care expenses](soft-paws-task008-cat-expenses.md)
  — implemented; 173 JVM tests, normal/larger-text expense/draft/receipt journeys, paired screens and both platform builds pass; individual visual/physical review remains open.
- [soft-paws-task009 · private cat photos and Memory Book](soft-paws-task009-cat-photos-and-memory-book.md)
  — Mobbin research and both-theme board review prepared; three native ports remain pending.

The BarkLog tasks below are inherited foundation history, not Soft Paws approvals.

---

# BarkLog KMP rebuild tasks

Fresh backlog created 2026-10-14. Old tasks were removed from the current checkout
and remain recoverable in the RN backup/Git history. This backlog describes a new
app; old features are not automatically implemented.

Start with [product truth](../docs/agentic/product-truth.md),
[the canonical spec](../docs/source-of-truth/barklog-product-engineering.md)
and [actual feature status](../docs/product/current-feature-status-and-market-roadmap.md).

| Task | Slice | Status | Depends on |
| --- | --- | --- | --- |
| [task048](task048-premium-pet-food-scanner.md) | Premium cat/dog food-label scanner, saved pantry and recall alerts | Planned; Coming soon card only; scanner/services not implemented | Owner’s 20 October product direction |
| [task047](task047-premium-plan-motion-design.md) | Plan reveal, paywall and account plan composition with Rive/Firm motion | Implemented; Android/iOS Debug/Release and native journeys pass; physical/assistive review open | Owner’s 20 October visual feedback; task046/task032 |
| [task046](task046-premium-safety-and-nearby-vets.md) | Three RevenueCat-ready plans, Premium additional dogs/AI/safety and worldwide vet search | Implemented; Android/iOS Debug/Release, 146 JVM tests and native journeys pass; IDs/live AI recheck deferred | Owner's 20 October direction; task033/task039/task043 |
| [task045](task045-continuous-tab-highlight.md) | Smooth green tab highlight through Profile entry/exit | Fixed; Android/iOS Light/Dark and Reduce Motion recordings, 138 JVM tests and Debug/Release checks pass | Owner's 19 October motion feedback; task044 |
| [task044](task044-profile-tab-selection.md) | Profile tab selected background matches its menu | Fixed; Android/iOS Light/Dark simulator checks, 138 JVM tests and Debug/Release checks pass | Owner's 19 October bug report; shared journal/companion navigation |
| [task043](task043-additional-dog-onboarding.md) | Full independent onboarding for each additional dog | Implemented; SQLite, 137 JVM tests, Android/iOS builds and simulator journeys pass; physical/assistive and individual visual review remain open | Owner’s 19 October request; existing approved task025–027 onboarding |
| [task042](task042-soft-interaction-sounds.md) | Optional soft button/selection/save sounds | Native settings/adapters and committed-save cues verified on Android/iOS; Soft wood 35%, optional; physical audio review open | Owner's 19 October sound request; task041 cards retained |
| [task041](task041-barklog-ai-answer-cards.md) | BarkLog AI answer cards, automatic dog profile + seven days, future product slot | Native cards, weekly consent/context and BarkLog AI branding implemented; simulator journeys pass; live generation blocked by server CONTEXT_FEATURE_UNKNOWN | Owner's 19 October mobile-review feedback; task039/task040 |
| [task036](task036-firebase-authentication.md) | Real native Firebase Authentication | Native implementation/build checks pass; Google configs/debug certificate verified; live/other-provider/device verification pending | Owner authorization 2026-10-18 |
| [task033](task033-premium-outputs-and-home-entry.md) | Restore Home Ask entry; Premium PDF/keepsake outputs and video proposal | Native first slice verified; checked video board awaits review/native rendering | Owner's 2026-10-17 direction; task027/task032 |
| [task001](task001-kmp-foundation.md) | KMP foundation and repository reset | Implemented foundation | None |
| [task002](task002-local-database.md) | Device-local SQLDelight database | Implemented; native driver tested | task001 |
| [task003](task003-dog-setup-and-quick-logging.md) | First dog, Home quick logs and basic Timeline | Implemented; simulator journeys pass; platform gates remain | task002 |
| [task004](task004-detail-logs-and-timeline.md) | Detailed observations and Timeline tools | Implemented; simulator journeys pass; platform gates remain | task003 |
| [task005](task005-profiles-and-local-settings.md) | Multi-dog profiles and local settings | Implemented; physical QA pending | task003 |
| [task006](task006-medication-and-vaccination-records.md) | Medication plans and vaccination records | Implemented; physical QA pending | task004, task005 |
| [task007](task007-care-calendar-and-reminders.md) | Care Calendar and opt-in native reminders | Implemented; physical QA pending | task005, task006 |
| [task008](task008-offline-insights-and-trends.md) | Deterministic insights and monthly trends | Implemented; physical QA pending | task004, task006 |
| [task009](task009-offline-safety-center.md) | Versioned offline Safety Center | Implemented; physical QA pending | task001; task005 for dog-scoped emergency card |
| [task010](task010-csv-pdf-and-vet-prep.md) | Free local exports and vet preparation | Implemented; physical QA pending | task004, task005, task006 |
| [task011](task011-training-catalog-and-progress.md) | Bundled training catalog and sessions | Implemented; physical QA pending | task004, task005 |
| [task012](task012-photo-journal-and-baselines.md) | Local photo journal and baselines | Implemented; physical QA pending | task004, task005 |
| [task013](task013-expense-tracker.md) | Local care expenses | Implemented; physical QA pending | task005 |
| [task014](task014-optional-local-ai-models.md) | Optional local AI model lifecycle and factual journal answers | Not started | task008; core journal stable |
| [task015](task015-legacy-journal-migration.md) | Legacy journal compatibility and update policy | Not started | task002, task010; before updates to existing users |
| [task016](task016-native-qa-signing-and-release.md) | Physical QA, performance, signing and store release | Not started | task003–013 and task019 for intended v1 scope; task015 for existing-user updates |
| [task017](task017-local-conversation-and-photo-captions.md) | Bounded local conversation and scene captions | Not started | task014; task012 for captions |
| [task018](task018-optional-firebase-atlas-fallback.md) | Optional Firebase/Atlas text fallback | Deferred / disabled | task014; approved free-release server/context support |
| [task019](task019-memory-book.md) | Local Memory Book | Implemented; physical QA pending | task004, task012; task010 for PDF sharing |
| [task020](task020-approved-native-design.md) | Earlier native design foundation | Functional foundation; current visual parity incomplete | task003/task004 core; owner-approved board |
| [task021](task021-complete-board-application.md) | Approved board feature application | Functional implementation verified; exact visual parity reopened in task022 | task005–013/task019/task020 |
| [task022](task022-exact-board-native-parity.md) | Exact current-board native parity, screen by screen | In progress; [166 individual entries, 123 product screens/states](native-parity/README.md); zero matched | task021 functional foundation |
| [task023](task023-readable-care-and-native-motion.md) | Readable Home care and shared native motion | Implemented; Android/iOS simulator checks pass; physical feel review remains | task022 foundation |
| [task024](task024-premium-ai-onboarding-board.md) | Rich onboarding, required account and Premium AI board | Board checked; native demo chapter delivered in task027; visual review open | Owner's later 2026-10-16 direction; prices undecided |
| [task025](task025-light-and-flexible-dog-onboarding.md) | Light default, notification switches and flexible dog context onboarding | Board checked; native refinement delivered in task027; visual review open | Refinement of task024; prices remain undecided |
| [task026](task026-home-mascot-and-care-card.md) | Larger dog, varied mascot motion and one Home care card | Board checked; native refinement delivered in task027; visual review open | Refinement of task024/task025 |
| [task027](task027-native-companion-board-and-main.md) | Native companion chapter, backup cleanup and main delivery | Implemented; Android/iOS builds and local tests pass; visual/device review open | Owner authorized native port; demo login/AI; no simulator run |
| [task028](task028-companion-simulator-review.md) | Native companion simulator review | Smoke launch checked; owner chose manual simulator review | Owner authorized simulator launches on 2026-10-17 |
| [task029](task029-clean-mascot-and-finalization.md) | Transparent mascot press and finalization checklist | Implemented; Android/iOS builds pass; iOS tap checked | Owner's simulator feedback on 2026-10-17 |
| [task030](task030-glaxnimate-mascot-preview.md) | Glaxnimate automation and mascot animation preview | Automation and visual checks pass; superseded by owner-selected Rive | Owner installed Glaxnimate on 2026-10-17 |
| [task031](task031-rive-spaniel-mascot-study.md) | Original Rive spaniel and interactive mascot study | Study approved; native adoption delivered in task032 | Owner installed Rive and authorized new dog artwork on 2026-10-17 |

| [task032](task032-native-rive-mascot.md) | Paid clean Rive export and native animated spaniel | Implemented; builds and simulator checks pass; physical QA pending | Owner authorized paid studio export and application changes on 2026-10-17 |

## Delivery order

Current owner priority (17 October): task033's restored Ask entry and Premium
outputs, then review/build the photo-video slice before returning to finalization.
Its new editor needs review; live billing and prices remain deferred.

1. task022: current board parity gates, then Home first and each individual screen/state. Do not simplify the board to fit native.
2. Preserve task021's functional evidence; it does not establish exact screen/motion parity.
3. task003–013/task019: physical-device and assistive QA; keep actual native parts aligned with the current rendered kit.
4. task015 and task016: data update policy, physical QA and release evidence.
5. task014/task017/task018: optional AI, independently of local journal access.

Each task includes context, scope, dependencies, testable criteria and verification.
Complete one vertical slice at a time. Keep Home polished; retain the free/local
product boundary. Mark completion only from actual implementation and evidence.

- [task034 · Native video highlights and approved chat restoration](task034-native-video-highlights.md) — implemented; native simulator encoder/UI checks complete, physical QA/real entitlements pending.

- [task035 · Chat photos, vet contacts and report](task035-chat-care-tools.md) — implemented; native simulator verification complete, physical/clinical release checks pending.

- [task037 · Local AI and authenticated Atlas fallback](task037-local-ai-and-atlas-fallback.md) — local runtime implementation retained but paused by owner; current Atlas-only routing is task039. Earlier runtime evidence remains historical.

- [task038 · Grounded dog chat](task038-grounded-dog-chat.md) — paused by owner; card approved, native UI not built. Atlas-only supersedes current scope.

- [task039 · Atlas-only chat](task039-atlas-only-chat.md) — client implemented; authenticated web and normal iOS/Android simulator replies verified on 19 October; SQLite source is `atlas`. iOS relaunch passes; physical/store acceptance open, Release off and local LLM/RAG paused.

- [task040 · Email/password authentication](task040-email-password-authentication.md) — client implemented; 126-test baseline, iOS/Android native QA password sessions and live Atlas replies verified. iOS reply/session survive relaunch; Android saved history verified, restart pending manual-testing handoff. Physical/store acceptance remains open.
