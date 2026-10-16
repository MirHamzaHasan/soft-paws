# BarkLog KMP rebuild tasks

Fresh backlog created 2026-10-14. Old tasks were removed from the current checkout
and remain recoverable in the RN backup/Git history. This backlog describes a new
app; old features are not automatically implemented.

Start with [product truth](../docs/agentic/product-truth.md),
[the canonical spec](../docs/source-of-truth/barklog-product-engineering.md)
and [actual feature status](../docs/product/current-feature-status-and-market-roadmap.md).

| Task | Slice | Status | Depends on |
| --- | --- | --- | --- |
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

## Delivery order

1. task022: current board parity gates, then Home first and each individual screen/state. Do not simplify the board to fit native.
2. Preserve task021's functional evidence; it does not establish exact screen/motion parity.
3. task003–013/task019: physical-device and assistive QA; keep actual native parts aligned with the current rendered kit.
4. task015 and task016: data update policy, physical QA and release evidence.
5. task014/task017/task018: optional AI, independently of local journal access.

Each task includes context, scope, dependencies, testable criteria and verification.
Complete one vertical slice at a time. Keep Home polished; retain the free/local
product boundary. Mark completion only from actual implementation and evidence.
