# task035 · Chat care tools verification

The existing approved compact chat was extended in place. The board snapshots are `board-*.png`; native captures are `android-journey/` and `ios-chat-*.png`.

- Real SQLite tests cover composer-to-message attachment transfer in one transaction, a forced failed commit, reopening, dog scoping, deletion cleanup, unsent draft preservation when using a suggested question, optional AI/photo report content and Premium return navigation.
- The iOS native gallery selected the synthetic red QA image. Its draft survived app termination/reopening, then transferred into the saved caregiver message. `ios-photo-attached.png` shows the retained attachment.
- The iOS report included that saved image in a real two-page PDF, rendered and inspected as `ios-vet-pdf-page-1.png` and `ios-vet-pdf-page-2.png`. The Android native PDF was also rendered/inspected (`android-vet-pdf-page.png`).
- All three final iOS native journeys passed (114 seconds): real video export/share cancellation and draft reopening; chat context/consent, a reply, contacts, PDF and native gallery cancellation; keyboard entry and cleanup. The synthetic typing draft was verified empty in SQLite afterward.
- The keyboard-open regression removed duplicate IME padding from the chat: safeDrawing owns the keyboard space. The review bar hides while typing. The native test checks the controls sit below the input; rendered captures verify the photo/context/Send row remains visible above the keyboard.
- Android light/dark and 130% text captures show the compact controls and readable icon contrast. Reduced motion was enabled for those layout captures and the original app preferences/font scale were restored.
- `keyboard-settings.json` records the sole Android keyboard preference change on `BarkLogExactBoardQA_20261016`: stylus handwriting off. Normal keyboard-with-hardware behavior was already enabled and retained. Gboard’s stylus delete/return/emoji/menu controls match the reported floating strip. The application retains normal stylus support on users’ devices.

Demo replies do not assess images. General medication education never selects a medicine, prescribes or supplies doses. Caregiver messages and selected dog-scoped records are distinct from optional unverified AI replies; report photos are opt-in, capped at the latest 12. No image is uploaded, no call is placed automatically and no purchase is enabled.

The final build/test baseline is 87 passing JVM tests, 23 tooling tests, Android Debug/Release/lint/migrations and iOS Debug/Release simulator hosts. The native Android photo import/report/contact journey and all three iOS journeys passed.

Real camera/dial handoff, physical VoiceOver/TalkBack, large-text photo reports and clinician review remain release checks in `docs/release/finalization-checklist.md`. The separate owner foundation simulator and existing journals were preserved.
