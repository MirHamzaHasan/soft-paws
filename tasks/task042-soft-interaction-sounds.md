# task042 · Soft interaction sounds

Owner request: 19 October 2026 — “can we add asmr kind of sound on button clicks
and all?” The preceding “ok great” accepts task041's card direction. Keep those
cards and the approved compact chat shell intact.

Status: owner delegated the texture choice (“do what are best”). Soft wood at
35% is selected. Optional native settings, bundled sound adapters and committed
save feedback are implemented and verified on both owned simulators.

## Listening preview

Open [Soft interaction sounds](http://localhost:4278/premium/index.html#play-next-sounds).
Turn on **Interaction sounds**, then compare **Soft wood** and **Soft pop**.
The three samples are a button tap, a lighter selection tick and a warm saved
note. **Try in AI chat** applies the selected texture to real prototype buttons;
normal Home quick-care and detail saves have a completion cue too.

Use original local PCM synthesis rather than recordings, a paid library or a
network sound service. No microphone/audio permission, account, download or
journal access is needed to listen. There is no claimed health/ASMR benefit.

## Behavior

- Off until enabled; default level 35%, adjustable 0–100%. Only the board's own
  enabled/volume/texture preferences persist in local storage. Restoring enabled
  preferences does not play sound or create an audio context on page load.
- User-activated ordinary buttons get a short rounded tap. Choices/tabs/toggles
  get a lighter tick. Pointer and keyboard activation use the same click path,
  with no extra pointer-down sound. Cancelled/disabled/busy controls stay quiet.
- A saved cue follows an actual completed preview-state write. It is never
  inferred from text, a generic toast, a network response or animation/haptic.
  The pinned Home source remains unchanged; the optional engine observes the
  quick-care preview write around a trusted click. Native save audio must follow
  the real SQLite commit, never its button press.
- Typing, scrolling, loading, AI generation and automatic board demonstrations
  remain silent. No loop, background ambience, spoken voice or barking.
- One active voice and a 70 ms repeat limit prevent accumulated loudness. Muting,
  switching off and backgrounding stop active/pending sounds. Web Audio failure
  shows a nonblocking settings message; it cannot prevent an action or save.
- Sound is independent of reduced motion and haptics. Visible feedback always
  remains available with sound off.

## Authorized native slice

Keep dependencies behind the existing shared device-services boundary with
native playback adapters. Persist only UI sound preferences. Prepare/reuse small
bundled PCM clips without blocking logging or changing audio for video exports.
Respect platform silent/ringer controls, interruption/background state and other
audio. Do not use a playback session to bypass mute. Release resources through
the existing lifecycle. Verify on both physical platforms, including headphones,
mute, rapid taps, failed/cancelled saves and interruptions.

References checked for the implementation:
[AudioContext resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume),
[offline rendering](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext),
[Apple ambient audio category](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/ambient).
The browser preview cannot verify a phone's silent switch or physical loudness.

## Acceptance

- [x] Locally generated wood/pop texture family and three semantic cues.
- [x] Optional toggle, volume, sample buttons and ordinary prototype controls.
- [x] Source cleanup, one voice, repeat limit, no autoplay and mute/background guards.
- [x] Trusted-gesture, persistence, mute/unavailable-audio and waveform checks.
  Visibility guard implemented; headless tabs did not expose a real hidden state.
- [x] Light/dark, small-phone/130%, keyboard and screenshot review; four sound
  layouts plus 22 task041 regression layouts. See [evidence](../docs/design/evidence/task042/README.md).
- [x] Owner delegated the choice and continuation of the native slice.
- [x] Native adapters, persisted settings and committed-save integration.
- [x] Mobile runtime verification and recorded screenshots: Android journey and
  two iOS journeys pass; native samples, Profile entry and preference restoration.
  See [native evidence](../docs/design/evidence/task042/native-2026-10-19/README.md).
- [ ] Physical silent switch/ringer, headphones, interruptions and assistive review.

No paid sound integration, telemetry or billing is introduced. Sounds are optional.
