# KMP release preflight

Version 1.0.0/build 1. Current decision: foundation preview only; not a journal
release or store-ready artifact. Old RN evidence does not satisfy these gates.

| Gate | Evidence/status |
| --- | --- |
| Foundation automated/native build checks | See ../verification.md for actual run |
| Core offline journal and persistence | Pending tasks002–006 |
| Reminders, safety, export, training/photo/expenses/Memory Book | Pending tasks007–013/task019 |
| Legacy installed-data update boundary | Pending task015 before existing-user updates |
| Physical Android/iPhone QA | Pending task016 |
| Startup/scroll/memory measurements | Pending task016; no speed claim from compilation |
| Signed Android artifact | Pending private permanent upload key |
| Signed iOS archive | Pending Apple Team/profile/device |
| Privacy/store metadata | Pending exact shipped capabilities |
| Optional AI | Separate tasks014/017; can remain absent for core release |
| Optional remote AI/telemetry | Disabled; never required for journal release |

Record device/OS, artifact path, results/failures/retests, owner, distribution
target, last known good build and data-preserving rollback before submission.
