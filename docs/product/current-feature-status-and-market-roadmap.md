# Current KMP feature status

Reset date: 2026-10-14. The former RN feature list is reference only.

| Feature | Status | Rebuild task |
| --- | --- | --- |
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
| Local AI/model lifecycle | Not implemented | task014 |
| Legacy journal import/update compatibility | Not implemented | task015 |
| Physical-device/store/performance sign-off | Pending | task016 |
| Local conversation and captions | Local demo conversation/history implemented in task027; real on-device inference still deferred | task017/task027 |
| Optional Firebase/Atlas fallback | Deferred, disabled | task018 |
| Memory Book | Implemented; physical QA pending | task019 |
| Earlier Ungenerated native design foundation | Implemented foundation; current visual parity incomplete | task020 |
| Local-v1 board feature application | Functional implementation verified; not exact visual/motion parity | task021 |
| Exact current web-board parity | In progress; shared parts, Home/setup and product families being ported; 123 product entries, zero matched | [task022](../../tasks/task022-exact-board-native-parity.md) |
| Readable Home strip and shared motion refinement | Implemented; Android/iOS simulator checks pass; physical feel review remains | [task023](../../tasks/task023-readable-care-and-native-motion.md) |

Work next: task015 compatibility policy and task016 physical-device, assistive,
exhaustive motion-frame, performance/signing and release checks.
The owner requested the whole approved board in the application on 2026-10-15.
See [native board port](../native-board-port.md) for the actual scope and limits.
Optional AI and remote services remain separate. No cloud backup/sync, household
sharing, smart automation, ads or paid packaging is scheduled.
