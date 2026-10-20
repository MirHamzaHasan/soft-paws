# task032 · Paid Rive export and native mascot

Owner authorization: 2026-10-17. Draco Arts Studios is now Cadet; export the liked
spaniel and begin its Android/iOS application integration. This supersedes the
prototype-only status and earlier free-workspace export restriction in task031.
It does not enable product subscriptions or change app pricing.

Status: implemented and verified in Android/iOS simulators. Physical-device,
assistive and whole-board review remain release gates.

## Slice

- Copy the study into the owner's paid workspace; use official clean .riv export
  and keep editable .rev source. Never patch runtime branding.
- Replace AnimatedDog through a narrow native rendering boundary, keeping shared
  Compose layout and policy. Official Android Compose runtime and Apple SPM runtime.
- Greeting, shuffled quiet idles, and a save reaction after the existing committed
  local-write signal. Cancel work offscreen/background; neutral same-art fallback
  for reduced motion, loading and renderer failure. No runtime network requests.
- Keep the approved layout, tokens, type, surrounding care-strip/navigation motion,
  transparent press feedback and existing journals.

## Acceptance / evidence to complete

- [x] Cadet shown on Draco Arts Studios; studio copy file2660676.
- [x] Official clean export 21,682 bytes plus editable export 78,397 bytes.
- [x] Android and iOS Debug/Release builds, lint, JVM/migration/tooling checks.
- [x] Real native screenshots and motion checks, greeting/save, reduced motion,
      lifecycle and clean transparent edges.
- [x] Runtime dependency/size and remaining physical-device limits documented.

## Dependency decision

Use official maintained runtimes, pinned Android11.14.3 and Apple6.28.1, verified
against official source/release tags on 2026-10-17. Android's recommended Compose
API is still labelled Beta upstream. Apple uses Swift Package Manager, not
CocoaPods. Compose Multiplatform is updated from 1.9.3 to 1.10.3 specifically for its official
transparent UIKit overlay API. The older under-canvas interop cuts out the card
and cannot meet the clean mascot requirement. This is a rendering compatibility
change; all shared UI, IDs, tokens and data architecture remain. Both Rive runtimes
provide native rendering and data-binding triggers. No browser,
WASM, online asset URL, account or API key is needed by the installed app.
Compatibility, size and remaining limits are recorded in
[task032 evidence](../docs/design/evidence/task032/README.md).


## Delivery

`python3 tools/verify.py --ios` passed on the final source: Android Debug/Release,
lint, 76 JVM tests, SQLDelight migrations, 23 tooling tests, iOS Debug/Release and
both bundle checks. Native screenshots/video establish Android greeting and still
motion, and iOS greeting, post-commit save hop, save/Undo, navigation, lifecycle,
opening and still motion. No journal was cleared/uninstalled. Both QA apps remain
open. The app reads the bundled character without any Rive account/credential.

See [evidence and dependency/size limits](../docs/design/evidence/task032/README.md).
This is the owner-approved mascot adoption, not approval of all task022 screens.
