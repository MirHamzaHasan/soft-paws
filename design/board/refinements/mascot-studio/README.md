# BarkLog mascot animation study

Task030, 17 October 2026. Free, local authoring and playback proof after the owner
installed Glaxnimate. This is a review preview, not a new production mascot port.

Open <http://localhost:4278/refinements/mascot-studio/index.html> using the existing
board server (`node design/board/tools/serve.mjs 4278`). Try the dog, greeting,
curious look and save reaction; switch Close up/Home card and Light/Dark.
The Home card uses explicitly labelled example records and never saves journal data.

System Reduce Motion stays respected by default. The optional **Play motion in
this preview** checkbox permits a deliberate local review without altering OS
settings. Pause holds the current pose. Hidden pages pause and disposed players
stop. Six shuffled idle actions have quiet gaps and avoid consecutive repeats.

## Editable source and exports

- `dog.svg`: BarkLog's own existing vector silhouette, with eye highlights,
  brows, a greeting paw-pad detail and a celebration expression.
- `build.py`: imports the SVG and authors transform keyframes using the
  python-lottie package bundled with the installed official Glaxnimate macOS app.
- `assets/*.rawr`: editable Glaxnimate documents, one per action.
- `assets/*.lottie.json`: exported from those documents by Glaxnimate's native CLI.
- `pose-bridge.js`: a 200 ms transition from the actual visible transform values
  when a higher-priority action interrupts another. One live player owns the dog.
- `vendor/`: Lottie Web 5.13.0, MIT, used only by this browser study. The npm
  tarball integrity was checked against registry metadata; its license is included.

The native KMP app has no new dependency from this study. Compottie integration,
native lifecycle/rendering checks and app-size profiling follow review of the art
and motion. Browser parity is not evidence of native playback or frame rate.

## Rebuild and validate

Requires the installed Glaxnimate app; paths can be overridden with
`GLAX_PYTHON_PACKAGES` and `--glax`. Python 3.11 is used on the owner's Mac.
The pure Python animation package is imported by the system interpreter; no app
bundle or macOS security/accessibility setting is modified.

```sh
python3 design/board/refinements/mascot-studio/build.py --evidence .verify-build/task030/glax-frames
python3 design/board/refinements/mascot-studio/validate.py
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs CHROMIUM_EXECUTABLE=/path/to/headless-shell node design/board/refinements/mascot-studio/qa.mjs
```

`--scratch` controls the ignored intermediate JSON folder. Native CLI export/render
is used as the acceptance boundary, rather than merely assuming generated Lottie
will open. The source script's opacity handling keeps child paints visible and
lets the expression group own opacity; otherwise SVG inherited opacity is baked
into the Lottie child fills.

## Glaxnimate crash and workaround

The owner's crash report records `EXC_BAD_ACCESS` on the main thread in
`libqcocoa.dylib`, with AppKit accessibility hierarchy queries in the stack.
The installed app reports `0.6.0-git-d2da67a`. The first GUI inspection also failed,
so this pass stops using accessibility-tree inspection of Glaxnimate. That is
evidence of a Qt/macOS accessibility-path crash, not a confirmed root-cause fix.
CLI export/render completes successfully. No security protection, accessibility
preference or installed app binary was changed.

The embedded standalone Python executable also has a broken relative framework
lookup; the system interpreter can import its pure Python animation package.
Glaxnimate's own CLI handles native rendering, so the missing embedded-interpreter
path does not block the preview. This workaround does not claim to repair the GUI.

See [task030](../../../../tasks/task030-glaxnimate-mascot-preview.md) and
[evidence](../../../../docs/design/evidence/task030/README.md).
Official references: [Glaxnimate scripting](https://glaxnimate.org/contributing/scripting/)
and [its Python package](https://pypi.org/project/glaxnimate/).
