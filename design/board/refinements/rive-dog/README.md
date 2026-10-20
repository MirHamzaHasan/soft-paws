# BarkLog Rive spaniel study

Owner requested a Rive dog test and explicitly allowed replacing the earlier
low-detail character on 17 October 2026. This is an original, editable vector
spaniel and working Rive prototype. The owner authorized native adoption in task032.

Preview: <http://localhost:4278/refinements/rive-dog/index.html?v=032>

Editor: <https://editor.rive.app/file/barklog-spaniel-motion-study/2660676>

## What is in the study

- `dog.svg`: original chestnut/cream character, separate named parts, transparent
  ground, forest collar and a lime paw tag. No stock character or bitmap tracing.
- `paw-pads.svg`: original greeting paw detail, attached to the moving paw in Rive.
- `motion.py`: seven clips, authored at 60 fps: Idle, Hello, Curious, Saved,
  Sleepy, Sniff and Ear perk. This is an authoring rate, not a measured device fps.
- `spaniel.riv`: clean Cadet runtime export used by the preview and native hosts.
- `spaniel.rev`: full editable export from the paid studio workspace.
- `author.py`: repeatable authoring through the desktop editor's official MCP.
- `manifest.json`: editor link, controller/trigger names and source/export hashes.
- `study.js` / `study.css` / `index.html`: local review controls, not production UI.
- `vendor/`: pinned `@rive-app/canvas` 2.44.2, MIT license and package integrity.
  Its JavaScript and WASM are local and are not shipped in the native application.

The Dog view model exposes `hello`, `curious`, `saved`, `sleepy`, `sniff`, `ears`
triggers. Dog Controller blends from Any State into a reaction over 200 ms,
then returns to Idle over 180 ms after the clip. All clips key the same pose
channels and settle before exit. The host supplies one accessible greeting action; decorative instances have no
hidden head-click listener. The browser wrapper provides keyboard semantics.
The additional rest trigger blends cancellation/Undo to Idle in 180 ms.

Random idles use shuffled bags of curious/sleepy/sniff/ears, with no immediate
repeat and a 4.8–8.2 second quiet gap after returning to idle. Tap/save reactions
interrupt with the controller's live blending. Pause retains the current pose;
reduced motion switches immediately to the original neutral SVG and cancels the
idle timer. The explicit preview motion checkbox can opt in locally without
changing macOS settings. Playback pauses when offscreen or the page is hidden,
and the player is cleaned up on page exit. Example care notes never read/write
a journal.

## Paid studio export · task032

Draco Arts Studios visibly shows Cadet. The original study was copied to the
owner's private Personal Files in that workspace (file2660676, project2025006).
The official exporter produces a clean 21,682-byte .riv and a 78,397-byte editable
.rev. No splash/branding objects were patched or bypassed. The earlier task031
free export/refusal is historical evidence, not the current export's behavior.

Rive's macOS sandbox refuses direct file access to this repository. The official
MCP tools provide data-URI uploads and an inline export retry; `author.py` uses
those documented transports, with bytes decoded directly to disk. No sandbox,
security, accessibility or network settings were weakened.

## Rebuild

Keep Rive open. The MCP tools act on the active file; the script refuses files
whose name does not contain BarkLog and study.

Open the paid studio copy linked above. Update only its named motion clips/controller
and export both runtime/editable files, then synchronize the two native copies:

```sh
python3 design/board/refinements/rive-dog/author.py --update-motion
cp design/board/refinements/rive-dog/spaniel.riv shared/src/androidMain/res/raw/barklog_spaniel.riv
cp design/board/refinements/rive-dog/spaniel.riv iosApp/iosApp/barklog_spaniel.riv
python3 tools/check_mascot.py
```

For a new source reconstruction, create an **empty** file in Rive and name it
`BarkLog Spaniel Motion Study`, then run:

```sh
python3 design/board/refinements/rive-dog/author.py --seed
```

The importer centres SVG groups on their bounds. The script moves the origins
to the real joints and compensates each direct child to retain the drawing's
world coordinates. Transforms use inspector percentages/degrees in this tested
MCP version, which converts them for runtime export. SVG instance x/y needs an
explicit property write in this version; the paw detail uses that verified path.

Serve the existing board (the current server already uses port 4278):

```sh
node design/board/tools/serve.mjs 4278
```

Use the complete `index.html` URL; this server does not auto-index directories.

## Verification

`qa.mjs` opens a separate headless browser for local prototype verification; it
does not drive the owner's browser or either installed journal. Use an available
Playwright module and Chromium executable through `PLAYWRIGHT_MODULE` and
`CHROMIUM_EXECUTABLE`, then run:

```sh
node design/board/refinements/rive-dog/qa.mjs
python3 tools/verify.py --metadata-only
```

Task031's original study evidence remains in
`docs/design/evidence/task031/README.md`. Current paid-export and native results
are in `docs/design/evidence/task032/README.md`: single-artboard clean export,
six reactions, cancellation, 32 browser captures, and Android/iOS native checks.
The browser suite does not establish native rendering or performance; those are
recorded separately. The authoring update command was executed in task031; the
later `--seed` reconstruction has not been independently run end to end in a
second empty file. Physical-device frame pacing, battery, haptics and assistive
review remain release gates.

Official references: [MCP](https://rive.app/docs/editor/ai/mcp),
[web player](https://rive.app/docs/runtimes/web/web-js),
[runtime transition flags](https://github.com/rive-app/rive-runtime/blob/master/include/rive/animation/state_transition_flags.hpp),
[Rive plans](https://rive.app/pricing),
[runtime license](https://github.com/rive-app/rive-wasm/blob/master/LICENSE).
