# Native soft interaction sounds · 19 October 2026

The owner delegated the texture choice. Soft wood at 35% is selected; sounds stay
off until enabled. Native settings provide a toggle, adjustable volume, wood/pop
and three samples. Original PCM from the reviewed board synthesis is bundled in
`composeResources/files/sounds`; no recordings, downloads or sound service.

Android uses SoundPool with sonification attributes and ringer/system-sound gates.
Apple uses ambient AVAudioPlayer with interruption/route/background stop guards.
The shared coordinator enforces one voice, a 70 ms repeat guard, mute/foreground
checks and failure isolation. Common native controls invoke tap/selection cues.
Journal/event/care commit callbacks alone invoke the saved cue; a failed/cancelled
write cannot trigger it. Typing, scrolling, loading and AI generation stay silent.

## Verification

Full `tools/verify.py --ios` passes: Android/iOS Debug and Release, Android lint,
SQLDelight migrations, 133 JVM tests and 30 Python tools tests. Native tests cover
optional/rate/mute/background/close behavior, successful versus failed/cancelled
real SQLite writes, sound failures after commit and persisted UI preferences.
Both native players loaded the bundled clips; iOS sample controls reached ready
and Android exercised the settings/samples and a restart. Runtime results and
screenshots are recorded alongside this file. This is simulator evidence.

Android's QA emulator stalled during an install. A cold boot preserved its disk;
no app was uninstalled, no journal was cleared and the other app's emulator was
untouched. The new fixture uses a separate database/preferences namespace.

Test harnesses must select the actionable ancestor of Compose's Android label
nodes; their child description may report enabled while the real button is disabled.
iOS switches expose the Selected trait. Scroll inside the content above the fixed
chat composer; use the established slow right-edge gesture on journal screens.

Phone silent switches/ringer, headphones/speaker loudness, competing audio,
interruptions and VoiceOver/TalkBack still need physical review. No acoustic latency
or therapeutic/ASMR benefit is claimed. Sound stays independent of reduced motion
and visible feedback. No production sound dependency, paid service, billing or telemetry was introduced.


The normal Profile entry now commits the journal feature and companion dismissal
inside one existing navigation transition. Both platforms opened the real settings
through this entry. Earlier two-step navigation could discard its destination.
Normal defaults remain off/35%/wood; the fixture explicitly enables sound for QA.


[Build results](build-results.json), [full verification](full-verification.txt),
[runtime results](runtime-results.json), [iOS test summary](ios-test-summary.json),
[Android journey](android-journey.txt), [iOS settings](ios-sounds-settings.png),
[Android restored settings](android-sound-preference-restored.png),
[iOS normal Profile entry](ios-normal-sound-settings-entry.png) and
[Android normal Profile entry](android-normal-sound-settings-entry.png).
