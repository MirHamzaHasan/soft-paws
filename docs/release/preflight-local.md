# KMP release preflight

Version 1.0.0/build 1. Updated 17 October 2026: local journal features are
implemented; the companion chapter uses demo replies; task036 replaces demo login with native
Firebase adapters, pending provider configuration/live sign-in verification. This is not a
store-ready artifact. See the full [finalization and connection checklist](finalization-checklist.md).
Old RN evidence does not satisfy these gates.

| Gate | Evidence/status |
| --- | --- |
| Automated/native build checks | task036 Android/iOS Debug/Release, lint, 97 JVM tests, migrations and 30 tooling tests pass; [auth evidence](../design/evidence/task036/README.md); [output-gate evidence](../design/evidence/task033/README.md) and [mascot evidence](../design/evidence/task032/README.md) |
| Core offline journal and persistence | Implemented tasks002–006; final exact-artifact/device QA remains |
| Reminders, safety, export, training/photo/expenses/Memory Book | Implemented tasks007–013/task019; physical delivery/picker/share gates remain |
| Legacy installed-data update boundary | Pending task015 before existing-user updates |
| Physical Android/iPhone QA | Pending task016 |
| Startup/scroll/memory measurements | Pending task016; no speed claim from compilation |
| Signed Android artifact | Pending private permanent upload key |
| Signed iOS archive | Pending Apple Team/profile/device |
| Privacy/store metadata | Pending exact shipped capabilities |
| Real identity and AI | task036 native Firebase adapters implemented, provider setup/live proof pending; tasks014/017 inference and task018 fallback remain separate |
| Paid AI | Prices undecided, purchases disabled; no billing/entitlement integration |
| Premium PDF outputs / photo films | Report/Memory Book PDF/print/sharing use demo-plan gates; mobile preview/CSV free. Video approved; task034 implements shared editing and local MP4 rendering, with simulator encoder/share/cancellation validation recorded. Real entitlements required before paid release. |
| Native visual review | task022 parity ledger and latest task027 companion screens remain open; task028 was partial/manual review |
| Optional remote AI/telemetry | Disabled; never required for journal release |

Record device/OS, artifact path, results/failures/retests, owner, distribution
target, last known good build and data-preserving rollback before submission.
