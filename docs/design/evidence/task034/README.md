# task034 · Native photo films and compact chat

Approved board: `board-next-highlight-editor.png` and `board-chat.png`. Native editor and picker/ready captures are prefixed `ios-video-`; Android encoder evidence is in `android-encoder*.txt`.

- Native Media3 and AVFoundation encoders produced portrait motion, square motion and reduced-motion square H.264 MP4s: 720p, 8.4 seconds for three photos. Frame checks verified photo order, caption backgrounds and moving/still frames.
- `ios-encoder.json` is the final five-case result: all three renders, cancellation and missing-input cleanup passed. AVAssetWriter fast-start sidecars are removed with the failed/cancelled output. `ios-encoder-initial.json` retains the earlier diagnostic run.
- Android real encoder instrumentation passed rendering, actual-frame validation, cancellation cleanup and missing input. The iOS native UI journey passed gallery opening/cancellation, actual export, native share-sheet cancellation and draft reopening.
- Shared SQLite tests cover draft persistence/reordering, reference cleanup, dog scoping, failed commits, repeated export taps and Premium boundaries.
- The approved compact chat now has a borderless composer, small controls, arrivals and typing motion. Runtime font resources are validated in both iOS build configurations.

The aggregate JVM run contains 87 tests. Android Debug/Release, lint/migrations, and iOS Debug/Release simulator hosts passed `tools/verify.py --ios` on 2026-10-17. Physical-device memory/performance, receiving-app playback and real purchases remain release work. No claim of complete task022 native parity is made.
