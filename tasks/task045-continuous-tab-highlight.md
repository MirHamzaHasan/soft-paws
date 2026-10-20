# task045 · Continuous tab highlight

Owner request · 19 October 2026: the green selected background must glide smoothly,
including entry to and return from Profile.

Status: implemented; native motion/selection checks, 138 JVM tests, lint and
Android/iOS Debug/Release verification pass.

Task044 corrected the selected destination, but Profile still replaced the journal
shell with a separate companion host. This disposed the pill's Animatable and
created another at the destination. It also put the dock inside the page scene.

AccountSettings now renders its existing content inside the journal shell's
persistent BoardScene. The same tab bar remains outside the moving content, with
the existing spring, speed-dependent stretch, colors, press response and selected
semantics. The parent handles safe areas once and reserves the measured dock
height for account scrolling. Full-screen companion flows retain their host.
Both controllers share the active scene handler; tab/menu changes still use
task044's single coordinated action. No domain, database or network changes.

Validation uses the existing isolated `park-add-dog-v1` SQLite fixture. Native
selection journeys now assert identical dock geometry before and after Profile.
Android/iOS recordings capture actual rendered highlight positions through
entry/exit in Light, Dark and Reduce Motion for visual frame review. Both retain
the dock's height and show intermediate horizontal positions; Reduce Motion
skips the slide. The iOS saved-dog/profile/switcher journey also passes.

`python3 tools/verify.py --ios` passes, including all 138 JVM tests, migrations,
Android Debug/Release/lint and signed iOS Debug/Release bundle checks. The final
Android native journey passes in 52.51 seconds after relaunching the owned QA
emulator, whose earlier session had stalled. The same device data is retained;
before/after normal-journal row hashes match on both platforms. No journal was
uninstalled, cleared or reset. Both normal apps are open with navigation stopped.
Physical feel, assistive technology, large text and individual visual approval
remain separate gates; recordings do not establish frame-rate performance.

See [evidence](../docs/design/evidence/task045/README.md) for the final checks and
remaining device/assistive review boundaries.
