# task028 — Companion simulator review

Owner request: 17 October 2026. Check the latest KMP app on both Android and iOS
simulators. This authorizes simulator launches after task027's build-only pass.

Status: both simulator apps launched; owner chose manual review. Automated navigation stopped.

Reuse owned QA devices and install updates without clearing or uninstalling.
Exercise the new setup, demo sign-in, Home care card/mascot, local journal and
scoped chat, including relaunch persistence. Inspect real screenshots and motion,
selected light/dark, larger-text and reduced-motion surfaces. Record the actual
coverage, failures/fixes and limits; do not infer physical-device or full visual
parity approval. Keep credentials/billing deferred and prices undecided.

Working artifacts: ignored `.verify-build/task028/` in this project. Final evidence
is retained under `docs/design/evidence/task028/` after inspection.

## Observed coverage and handoff

Latest Debug builds were installed in place on the owned Android API 35 emulator
and iOS 18.5 simulator. Both opening screens rendered and the practice interaction
responded. Android automation also reached photo-picker cancellation, custom/mixed
breeds, age/sex/size and multi-choice setup. These partial checks do not prove the
complete save/chat/relaunch journey or all-screen parity.

The owner explicitly selected “Leave both apps open for me to check”. UI drivers
were stopped, the unfinished new XCTest harness was removed, and the apps remain
running for manual review. No journal was cleared or app uninstalled. Diagnostic
attempts stay in ignored `.verify-build/task028/`; they are not passing evidence.
