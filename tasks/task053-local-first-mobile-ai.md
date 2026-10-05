# Task 053: Local-first mobile AI

- Status: `in_progress` (Android emulator verified; iOS and physical-device QA pending)
- Priority: `P0`
- Affected route: `/ask-ai`, with entry from Insights
- Data: read-only local WatermelonDB snapshot; model files in app document storage

## Caregiver value

After an optional download, a Premium caregiver can ask common factual questions about recent logs offline and get an answer from records on the phone. The first local model routes intent and never writes or interprets care data. Atlas remains the online fallback for other questions. Basic logging, Timeline, free export, and urgent safety do not depend on either AI path.

## Acceptance criteria

1. Native Ask AI opens without Firebase or Atlas identifiers. Web continues to require Atlas configuration.
2. Download starts only on user action, verifies pinned size and SHA-256, persists across restarts, and can be removed. Home never loads model weights.
3. Supported factual questions use ONNX inference and locally built answers with no Atlas request. Low-confidence, unsupported, clinical, and advice questions cannot receive a local answer.
4. Atlas fallback uses the existing Firebase, entitlement, selected-context, and context-policy checks. If Atlas is unavailable, the user gets a clear unavailable state; no silent remote care sync occurs.
5. Urgent language uses immediate deterministic escalation and free Safety Center access remains intact.
6. Check empty/loading/download-error/offline states, accessible controls, and source labeling. Record model download and answer-source analytics.
7. Pass typecheck, targeted tests, Android native build, iOS native build, and real-device offline/online QA before marking complete.

## Current evidence

- Selected model, SHA-256 checksums, and desktop ONNX input/output contract: [local-ai-models.md](../docs/engineering/local-ai-models.md).
- TypeScript, 43 Jest suites / 135 tests, local release gates, and targeted lint passed.
- Android debug APK compiled with the ONNX native bridge and ran on an x86_64 emulator. The native Ask AI route opened without Atlas configuration. The downloaded model answered the weekly summary and comparison prompts on the device.
- The emulator had no public DNS, so the download and SHA-256 path was exercised against a temporary local HTTP server serving the identical pinned files. The production manifest points to the pinned public model URLs. Removal and redownload passed.
- Expo autolinking detects the ONNX React Native bridge for both Android and iOS after applying the checked-in package patch. An iOS build, physical-device performance, and the online Atlas fallback still need QA. Model quality beyond the starter intent set is not claimed.
