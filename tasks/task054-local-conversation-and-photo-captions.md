# Task 054: Local conversation and photo captions

- Status: `implemented` (Android emulator verified; iOS and physical-device release QA pending)
- Priority: `P0`
- Route: `/ask-ai`
- Data: read-only bounded WatermelonDB summaries; selected photos and model files stay on the device

## Caregiver value

After optional model downloads, a Premium caregiver can ask broader factual questions about recent journal logs and request a visible-scene description of a selected photo without sending those inputs to a server. Atlas remains the text fallback when local answers are unsupported, rejected, or unavailable, provided Firebase sign-in, app configuration, entitlement, and context checks pass. The current Atlas contract has no photo capability.

## Acceptance criteria

1. Keep the deterministic local factual model first. Use the generative model only for bounded nonclinical journal questions; reject invented counts and clinical output.
2. Download conversation and photo models only on explicit Ask AI action. Verify pinned size and SHA-256, persist separately, and permit independent removal. Do not load either model on Home.
3. Run conversation and photo inference through `onnxruntime-react-native` on Android and iOS native builds. A selected photo is captioned locally, with no upload, care-record write, or Photo Baseline interpretation.
4. Give clear downloading, ready, unavailable, and error states. Label answer source and photo limits. Keep free logging, Timeline, exports, and urgent Safety Center independent of AI.
5. Keep Atlas text fallback behind fresh Firebase ID token, BarkLog Atlas app ID, entitlement, and context policy. Do not send a photo to the text-only Atlas endpoint.
6. Pass typecheck, targeted lint/tests, Android native build and inference. Complete iOS and physical-device download, offline, memory, storage, and battery QA before release sign-off.

## Evidence and remaining release gates

- The q4f16 Qwen3 model answered a recent-journal question on an Android x86_64 emulator without Atlas. The native float16 bridge patch is included in the checked-in pnpm patch.
- The Florence-2 ONNX components produced a reference caption on desktop and a caption of a selected photo in the Android app. The emulator result was labeled as an on-device visual description.
- The Android debug APK built with ONNX Runtime, Expo image picker, and image manipulator. TypeScript, targeted ESLint, and 13 relevant Jest tests passed. The rebuilt Android manifest omits camera and microphone permissions for the photo picker.
- This emulator could not resolve public DNS. The pinned production download URLs and hashes are checked in, but public conversation/photo downloads were not verified on the emulator. iOS native build, physical-device performance, real public downloads, and live Atlas text fallback remain release gates. Atlas photo fallback requires a server vision contract and BarkLog context policy before it can be offered.
