# task032 · Native Rive spaniel evidence

17 October 2026. Owner activated Draco Arts Studios Cadet and authorized the liked
spaniel in the application. The private paid studio copy is
[the editable Rive design](https://editor.rive.app/file/barklog-spaniel-motion-study/2660676).
The original free-workspace file was preserved. Official export provides a clean
21,682-byte .riv and a 78,397-byte editable .rev; no branding was patched/hidden.

## Checked implementation

- All AnimatedDog callers use the new native character: onboarding, Home,
  companion/account surfaces and training. Shared Compose owns layout, semantics,
  greeting/save timing, shuffled quiet idles and cancellation.
- Official Android 11.14.3 Compose and Apple 6.28.1 SPM runtimes. Compose 1.10.3 is a
  necessary rendering update for the official transparent UIKit overlay API.
  The earlier under-canvas API cannot blend a transparent mascot over a card.
- Six trigger reactions, quiet gaps of 4.8–8.2 seconds, no immediate idle repeat,
  no random save celebrations. Undo uses a 180 ms transition to rest.
- Same-art neutral image during loading, failure, reduced motion and page
  snapshots. Live Texture/Metal surfaces are not recorded into Compose layers.
  iOS transient noDrawable before view attachment retries, rather than disabling
  motion. View constraints size the renderer after attachment.
- Local bundled assets; no Rive editor login, API key, runtime URL or network is
  required by journal users. Auth/AI remain local demos; billing stays disabled.

## Actual checks

`python3 tools/verify.py --ios` passed on the final source: Android Debug/Release,
lint, 76 JVM tests, preserving SQLDelight migrations, 23 tooling tests, and iOS
Debug/Release simulator hosts plus bundle checks. `git diff --check` passed.
Both iOS bundles contain the exact .riv, neutral image, Rive license, native
framework and its privacy manifest; see [bundle checks](ios-bundle-checks.json).

- Browser: single character artboard, no splash/branding artboards, all six clips
  return to Idle, 18 mid-motion captures, live interruption, keyboard greeting,
  pause/resume, light/dark, small widths/large text, reduced motion, offscreen
  pause and disposal; 32 captures, no errors, failed resources or external requests.
  See [results](browser-checks.json), [motion](browser-motion.png) and
  [clean first frame](clean-first-frame.png). Live save cancellation to Idle also
  passed; see [cancellation](cancel-check.json).
- Android: API 35 arm64 QA emulator, final Compose 1.10.3 build. Actual greeting,
  breathing/idle frames, clean transparent contours, and reduced motion. Two
  mascot-region captures 700 ms apart are byte-identical with reduced motion.
  [Home](android-home.png), [wave](android-wave.png),
  [motion](android-motion.png), [still check](android-reduced-check.json).
- iOS: iPhone 14/iOS 18.5 owned Visual Review simulator. Actual tap greeting, local
  save/count and happy hop, save/Undo with “Poop removed”, Home→Timeline→Home with
  no stray overlay, background/foreground, larger opening character and reduced
  motion. Two still-region captures 700 ms apart match exactly. A 58.34 second native
  capture yielded 292 sampled frames; samples are evidence, not a frame-rate claim.
  [Home](ios-home.png), [wave](ios-wave.png), [save hop](ios-save-hop.png),
  [motion](ios-motion.png), [opening](ios-opening.png),
  [still check](ios-reduced-check.json). See [native observations](native-checks.json).

Only separate park-day-v1/park-no-dog-v1 review SQLite/preference namespaces were
used. Existing journals were never uninstalled, cleared or reset. Both QA apps
were left open; the separate foundation iOS device/journal was preserved.

## Size and remaining gates

The universal unsigned Android Release APK is 30,993,003 bytes (~31.0MB), including
Rive binaries for four ABIs; arm64's Rive .so is 5,687,760 bytes uncompressed.
The uncompressed iOS Release **simulator** bundle is 63,854,021 bytes (~63.9MB).
These are not store download sizes or a signed device IPA/AAB measurement.
Rive adds native runtime weight beyond the 21.7 KB character file.
[Binary report](native-binary-checks.json) records 64-bit ELF alignment; APK
`zipalign -c -P 16 4` passed. A real 16 KB device run remains separate.

Physical frame pacing, memory/battery, haptics, VoiceOver/TalkBack, native dark-theme
and broad font-size/device review remain task016/task022 gates. Native dark theme
was not established by the browser's dark pass. The legacy debug review bar's
slow UI clock does not retime native Rive clips; production runs at authored time.
No claim that all 166 board entries match, or that the app is store-ready.
The existing Kotlin ICU data-object simulator minimum 17.2 versus deployment 15.0
linker warning remains; Rive's signed simulator framework also emits a
not-stripping notice. Device/archive compatibility is still a release gate.

References: [Android runtime](https://rive.app/docs/runtimes/android/android),
[Apple runtime](https://rive.app/docs/runtimes/apple/apple),
[Compose overlay source](https://github.com/JetBrains/compose-multiplatform-core/blob/v1.10.3/compose/ui/ui/src/uikitMain/kotlin/androidx/compose/ui/viewinterop/UIKitInteropProperties.uikit.kt),
[Android alignment checks](https://developer.android.com/guide/practices/page-sizes).
