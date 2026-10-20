# Soft Paws · complete cat-care screen proposal

Run from the repository root:

```sh
node design/soft-paws/tools/serve.mjs 4285
```

Open <http://localhost:4285/>. The server binds to loopback. Research contains
the actual Mobbin source links and the structural lessons used. Kit contains the
tokens, controls and real Rive cat. Screens contains the full cat product proposal;
Transitions contains the motion examples. Pick and Note are available on cards.
Reviewer notes are ignored by Git. Play the flow opens an interactive phone.

- [Home](http://localhost:4285/#play-home)
- [Cat setup](http://localhost:4285/#play-cat-name)
- [Journal](http://localhost:4285/#play-timeline)
- [Care](http://localhost:4285/#play-health)
- [Safety](http://localhost:4285/#play-safety)
- [Memories](http://localhost:4285/#play-photos)
- [Example AI chat](http://localhost:4285/#play-ai-entry)
- [Premium](http://localhost:4285/#play-paywall)
- [Rive preview](http://localhost:4285/#only-kit-cat)

`#only-<id>` is a screen at its real canvas size. `?textScale=1.3` checks larger
text. `?reducedMotion=true` keeps the same cat illustration and immediate page
transitions; `false` explicitly previews motion. Use the header for light/dark.

The full inventory and verified status are in
[soft-paws-task001](../../tasks/soft-paws-task001-cat-redesign.md). All cat records,
photos and AI copy are labelled synthetic examples. Edits last only for the
player's in-memory session; they never touch native SQLDelight journals or files.
Account, AI, calls, native pickers, exports, location and billing are honest
handoff previews and cannot operate a service. No transactions are enabled.

The owner approved the complete direction for native Android/iOS adoption on
20 October 2026. The shared Compose port is in progress, tracked in task002;
the web board remains a prototype. The subsequent colour refinement uses cream,
apricot, teal and seven care-category colours, with refreshed Mobbin research.
See [the review log](feedback.md).

## Cat companion

[Soft Paws Cat Companion](https://editor.rive.app/file/soft-paws-cat-companion/2667919)
is original SVG vector art, rigged/animated through the live Rive MCP. Runtime
`.riv`, editable `.rev`, SVG, reproducible motion/authoring sources and hashes
are in `assets/cat/`. The author script refuses any active file except 2667919.
It never touches the inherited dog Rive files.

The web runtime is the existing official bundled Rive library; licensing is
documented in `assets/vendor/`. It loads locally, pauses offscreen/background,
cleans up disposed controllers and falls back to the same transparent cat art.
No separate Rive SKILL.md was installed in this session; the working MCP and the
foundation's established authoring workflow were used directly.

## Verification

```sh
QA_CAPTURE=1 node --experimental-websocket design/soft-paws/tools/qa.mjs http://localhost:4285/
node --experimental-websocket design/soft-paws/tools/journeys.mjs http://localhost:4285/
python3 tools/verify.py --metadata-only
```

QA captures/results are kept in ignored `.verify-build/soft-paws/`. Selected
review artifacts and actual limitations are in `docs/design/evidence/soft-paws/`.
VoiceOver/TalkBack, physical-device motion, native parity and service/transaction
proof remain separate gates.
