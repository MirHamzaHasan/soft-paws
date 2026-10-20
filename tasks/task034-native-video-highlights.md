# task034 · Native photo highlights and approved chat restoration

Status: implemented; simulator encoder/UI verification complete (2026-10-17). Physical-device and real entitlement release checks remain.

The owner approved `next-highlight-editor` / `next-highlight-gate` on 17 October
2026: “Use this design for native video highlights.” No further design approval
is needed for this slice. The owner also requested restoring the previously
created AI chat: clean conversation, compact controls and motion, without big
buttons. That is a correction toward the existing board, not a new direction.

## Scope

- Shared Compose editor: 3–12 selected local photos, captions up to 100 characters,
  reorder/remove, portrait/square, free play/pause preview and reduced motion.
- SQLite draft table stores the film and explicit private photo references
  atomically. This reuses existing reference/cleanup and dog-deletion behavior;
  no schema migration, new database filename or preferences persistence.
- Native output: silent H.264 MP4, 720×1280 or 720×720, 30 fps, 2.8 seconds/photo,
  cuts, gentle 1→1.08 zoom and upward pan. No licensed music or cloud upload.
- Media3 Transformer 1.11.1 on Android; AVFoundation AVAssetWriter on iOS15+.
  AppContainer wires the service/controller; ModuleRegistry closes the controller.
  Encoders start only after export, never during journal startup.
- Access checked before render and share. The local demo Premium switch remains
  a preview, not a verified purchase; real billing/prices remain deferred.
- Actual codec progress, cancel/background/navigation cleanup, retryable error,
  missing input/storage checks and native share sheet. Completed cached videos
  expire after 24 hours when another export starts; drafts remain saved.
- Restore the approved chat's centered welcome, compact question/source rows,
  borderless composer, round send/stop, message arrival and typing motion.
  Preserve local demo labels, explicit context, stop/retry/history and free reading.

## Validation

Evidence and exact limitations are recorded in
`docs/design/evidence/task034/README.md`. Physical-device
encoding, receiving-app playback, accessibility services and performance remain
release gates; simulator compilation does not establish these.
