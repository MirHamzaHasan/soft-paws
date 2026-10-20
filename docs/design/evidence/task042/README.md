# task042 · Soft interaction sounds · 19 October 2026

Native implementation followed after owner acceptance/delegation. See the task file
for current status; the measurements below describe the original board pass.

Local board preview only. Native sound/settings implementation and physical
listening/silent-mode verification are still pending.

[Open the listening screen](http://localhost:4278/premium/index.html#play-next-sounds),
enable **Interaction sounds**, then compare **Soft wood** and **Soft pop**.
Each standalone listening file contains tap, selection and saved cues, with gaps,
at the default 35% setting:

- [Soft wood](wood-preview.wav)
- [Soft pop](pop-preview.wav)

These are original synthesized mono PCM, 48 kHz, 16-bit, two-second files. The
saved note is shared between both texture families. No recording, purchased
sample, microphone or network audio source was used. The browser engine creates
the same waveform family locally; these are review exports, not native assets.

## Verification

Ran `design/board/premium/tools/sounds.mjs` with the existing isolated Playwright
Chromium installation, then reran task041's 22-layout card/source/consent/retry
suite with the optional sound engine present. All assertions pass.

- Default off creates no audio context and produces no autoplay. Restored enabled
  preferences also wait for interaction. Volume/texture survive reload.
- Real pointer activation resumes audio. Samples play once; ordinary chat buttons
  play once; keyboard activation produces one cue with reduced motion enabled.
  Typing, scrolling and synthetic DOM clicks remain silent.
- A quick-care preview adds a record before its saved cue. Its later haptic/icon
  landing creates no duplicate sound. The selected Home source/hash is unchanged.
- Zero volume and the off switch stop active voices; delayed output does not
  appear in the exercised mute path. Rapid real clicks are rate-limited with at
  most one active voice, and ended sources disconnect.
- Simulated unavailable Web Audio disables sound controls while chat navigation
  remains usable. No live account, backend, model or device journal is involved.
- Four layouts: light/dark at 390 × 844, and both themes at 375 × 667 with 130%
  text/reduced motion. First/end scroll positions were captured and inspected.
  Custom text contrast minimum **5.79:1**, named controls at least **48 × 48**
  design pixels and no horizontal overflow.
- Six waveform combinations measured: selection 65 ms, tap approximately 85 ms,
  saved 210 ms. Digital peaks are bounded (0.30 selection / 0.42 other cues before
  master gain); endpoints are zero, low DC, no clipped samples. This establishes
  digital properties, not perceived loudness or an ASMR effect.
- Zero browser errors/external requests. Metadata checks and all 30 Python tools
  tests pass. No native Gradle/Xcode build is claimed for this board-only change.

## Evidence and limits

[Off](off.png), [light](light.png), [dark](dark.png),
[small/larger-text](light-375-130.png),
[small/larger-text end](light-375-130-lower.png),
[dark small end](dark-375-130-lower.png),
[summary](summary.json), [full results](results.json),
[AI card regression](card-regression.json).

The visibility/background stop guard is implemented. Headless Chromium kept the
tested tabs visible, so it did not prove an actual hidden-tab stop. Phone silent
switches, headphone/speaker loudness, audio interruptions, VoiceOver/TalkBack and
native lifecycle still require native/physical review. No claim of perceptual
sound quality or acoustic latency is made from headless output.

The owner subsequently delegated the sound choice (“do what are best”). Soft wood
at 35% is selected for the authorized native slice; sounds remain optional.


Native implementation and simulator evidence: [19 October native results](native-2026-10-19/README.md).
