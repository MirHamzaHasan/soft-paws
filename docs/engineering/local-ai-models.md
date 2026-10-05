# Local-first mobile AI

BarkLog's on-device models are optional downloads for iOS and Android. They stay in app document storage outside WatermelonDB and never read care records directly. The app builds bounded local summaries for journal questions. Supported questions use local inference first; unsupported, uncertain, clinical, and advice text questions use Atlas only when its optional sign-in and configuration are available. Urgent language goes directly to the free emergency escalation path. Selected photos are processed on the phone.

## Starter model

| Item | Value |
| --- | --- |
| Model | `Xenova/all-MiniLM-L6-v2`, int8 ONNX |
| Purpose | Sentence embeddings to route factual journal questions |
| Source revision | `751bff37182d3f1213fa05d7196b954e230abad9` |
| Download | 22,972,370-byte ONNX model plus 231,508-byte WordPiece vocabulary |
| License | Apache-2.0; [model card](https://huggingface.co/Xenova/all-MiniLM-L6-v2) |
| Integrity | SHA-256 hashes pinned in `src/features/local-ai/modelManifest.ts` |

The initial supported intents are weekly summary, comparison with the previous week, and counts/patterns for walks, meals, mood, and behavior. The model does not generate prose. The intent must clear a similarity and margin threshold, match a supported question form, and avoid clinical/advice language. Care data never leaves the device for a successful local answer.

## Optional local conversation model

| Item | Value |
| --- | --- |
| Model | `onnx-community/Qwen3-0.6B-DQ-ONNX`, q4f16 ONNX |
| Purpose | Short answers from a bounded recent journal summary |
| Source revision | `d6beae7d59bc21264488d12f466f4ca6b252806f` |
| Download | 366,943,594 bytes including weights and tokenizer |
| License | Apache-2.0; [model card](https://huggingface.co/onnx-community/Qwen3-0.6B-DQ-ONNX) |
| Integrity | Size and SHA-256 hashes pinned in `src/features/local-ai/chatModelManifest.ts` |

Ask AI tries the starter factual path first. If it cannot answer, the local conversation model can answer supported nonclinical journal questions. The prompt contains only bounded caregiver summary text and asks the model to state logged facts or insufficient information. Output filters reject diagnostic language and ungrounded counts. A rejected or failed local answer proceeds to Atlas text fallback when configured. This is a narrow journal assistant, not open-ended medical advice or general chat. The downloaded weights run on the phone, never on the BarkLog server.

## Optional local photo model

| Item | Value |
| --- | --- |
| Model | `onnx-community/Florence-2-base-ft`, q4f16 vision/encoder/decoder plus int8 token embeddings |
| Purpose | Describe visible objects and scenes in a caregiver-selected photo |
| Source revision | `e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f` |
| Download | 186,197,519 bytes including weights and tokenizer |
| License | MIT; [model card](https://huggingface.co/onnx-community/Florence-2-base-ft) |
| Integrity | Size and SHA-256 hashes pinned in `src/features/local-ai/visionModelManifest.ts` |

The image picker gives the app only a selected photo. The app resizes it to 768 × 768, normalizes pixels on-device, and runs a fixed caption prompt through four ONNX graphs. The displayed answer is labeled as a visual description, not a health assessment. Captions with diagnostic or clinical language are rejected. The photo and caption are not written to WatermelonDB and are not uploaded. Photo Baseline records remain a separate manual feature. The current Atlas `/v1/chat` contract accepts text only; there is no photo fallback until Atlas exposes a tested vision request and BarkLog context policy.

## Runtime and fallback

- `onnxruntime-react-native` is part of native Android and iOS builds. The checked-in pnpm patch removes its obsolete `unimodule.json` marker so Expo autolinks its React Native bridge and maps float16 output bytes to `Uint16Array` on Hermes. Expo Go cannot exercise this native dependency; use local development or release builds.
- A user downloads the model from Ask AI. It is hash-checked before it is marked ready. Downloads are not automatic. The user can remove it.
- The ONNX session loads on the first supported Ask AI request, not at launch or on Home. The app can answer supported questions without Firebase or network once the model is installed.
- Conversation and photo model files are separate optional downloads. The user can remove each one independently. Their ONNX sessions are released after each answer or caption.
- For unsupported questions or failed inference, Atlas is the online fallback if BarkLog's Atlas application and Firebase sign-in are available. No server is used for local inference. The existing Atlas context-policy response checks remain mandatory.
- Web remains Atlas-only. Production Atlas access remains disabled until Atlas supports the free v1.0.0 release and passes BarkLog context checks. Supported local Ask AI actions are included in v1.0.0 without a purchase.

## Release acceptance

The starter model input/output contract and example intent scores were inspected with desktop ONNX Runtime. Android emulator inference, local download verification, removal, and redownload passed. The emulator had no public DNS, so it downloaded identical pinned files from a temporary local test server. The conversation model answered an empty-journal question on the Android emulator without Atlas. The photo model generated a scene caption from a selected emulator photo; the same graph pipeline produced a reference caption on desktop ONNX Runtime. Android debug build, TypeScript, and targeted tests passed. The emulator had no public DNS during this work, so the public downloads for the two new models remain unverified on-device. Before release sign-off, build and test on iOS, repeat public downloads and offline inference on physical devices, test Atlas text fallback online, and measure launch time, memory, storage, and battery on a lower-end device. Model quality beyond the tested prompts remains a device QA gate.
