# Soft Paws · native Journal · 21 October 2026

The approved cat Journal, record, edit and delete surfaces are implemented in
shared Compose using the joyful CSS tokens and the real local repository.
This is one section of the full native port: **29 product surfaces implemented,
60 pending; individual native visual approval remains open.**

## Screens inspected

- [Board / Android / iOS · light](paired-light.jpg)
- [Board / Android / iOS · dark](paired-dark.jpg)
- [Larger text · light](large-light.jpg)
- [Larger text · dark](large-dark.jpg)

The board uses its stated examples. Native frames use the retained, separate
`soft-paws-day-v1` synthetic SQLite journal, including earlier QA observations.
Meal amounts, titles and record counts therefore differ. The native phones are
390 × 844 Android and 375 × 667 iOS; their scrolling viewports differ. These are
composition/runtime evidence, not a claim of exact pixel parity or final approval.
Full-resolution native PNGs accompany the sheets.

The port retains advanced date/type/cat/photo filtering and older-record paging.
Those controls are under Dates & cat. Editing keeps the board's title/note focus;
structured observations, time, place and attachments remain under Observation
details. The destructive action names its actual scope and uses a captured
revision. Record notes and lower facts scroll above the fixed action area.

## Actual verification

- Android Debug/Release, lint, migration verification and **153 JVM tests pass**.
- Android real UI save → record → edit → keep record → relaunch → date/type
  filtering → delete passes at font scales 1.0 and 1.3, in airplane mode.
  The test checks actual SQLite counts/revision before and after deletion.
- Current-source iOS **three core XCTest cases pass**, including real save/reopen,
  all five tabs and repeated accessibility queries with the live Rive cat.
  A further Journal run at **extra-extra-extra-large** text passes.
- Light/dark and larger-text rests were visually inspected. A discovered small
  iPhone clipping issue was corrected: selected days and chips reveal themselves
  fully in the horizontal strips. Manual browsing remains available.
- Current-source iOS Debug/Release simulator builds and both bundle checks pass,
  including the independent Soft Paws identity, runtime plist and font resources.

The JVM storage test covers the 25-hour daylight-saving day, half-open date
boundaries, all/type filters, paging, cat isolation, title/edit preservation,
optimistic deletion conflict, and retained independent drafts/records. A strict
existing profile-selection test exposed a real race: an old list could replace a
newly confirmed selection. The controller now reads the current committed profile
snapshot before fallback and keeps its observer alive when a deleted profile
invalidates an obsolete summary. Selection and deletion recovery tests pass.

## Verification limits

No physical device, VoiceOver/TalkBack session, store purchase, authentication,
AI call, upload, call or location request was performed. Minimum-OS compatibility
and individual visual approval remain separate gates. Existing compiler warnings
include the inherited AVFoundation deprecations and a bundled ICU data object's
simulator deployment version; simulator results do not prove minimum-device QA.

An initial Android attempt failed before Home while the guest OS logged a
watchdog/launch stall. The owned emulator was restarted with its data preserved;
normal and larger-text journeys then passed. Test-input/selection and screenshot
settling issues were corrected in the harness. An older iOS Release job was
cancelled after its sources were superseded; it is not counted as final evidence.
No app was uninstalled and no journal, model or draft was cleared.
