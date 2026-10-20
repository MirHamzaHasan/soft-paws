# task035 · Chat photos, vet contacts and report

Status: implemented; native simulator verification complete (2026-10-17). Physical-device and clinical-policy release checks remain.

The owner requested these additions to the existing approved compact chat, and confirmed the floating keyboard/emoji toolbar appears in the simulator. Preserve the chat composition; add compact controls in place.

- Up to three local photos per message through native photo picker or camera. SQLite draft ownership transfers to the saved message in one transaction. Failed writes retain the draft. Conversation/dog deletion queues unreferenced attachments for cleanup. No cloud upload or image analysis.
- Chat menu opens saved vet/emergency contacts and the existing contact editor. Calling requires an explicit tap and opens the platform dial action. Missing contacts and unsupported calls have visible fallback text.
- A free mobile vet-report preview includes caregiver messages and explicitly selected dog-scoped records. Profile, caregiver photos and clearly separated unverified demo AI replies are optional. PDF preparation and native save/share use the existing Premium boundary; no real purchase is enabled.
- General medication education refers people to their veterinarian’s label and questions for their vet/pharmacist. Never select a medicine, prescribe, dose, diagnose or offer a treatment plan. Keyword matches only surface help; they are not validated triage. Vet contacts remain available for every message.
- Keep dummy login/replies. Real vision, a vetted clinical policy, provider consent and real entitlements remain finalization work.

Primary policy references: [FDA medication questions](https://www.fda.gov/animal-veterinary/animal-health-literacy/medications-your-pet-questions-your-vet), [FDA animal-drug FAQ](https://www.fda.gov/animal-veterinary/safety-health/frequently-asked-questions-about-animal-drugs), [AVMA first aid](https://ebusiness.avma.org/files/ProductDownloads/mcm-client-brochures-pet-first-aid-2025.pdf).

Verification: Android/iOS Debug and Release hosts, 87 aggregate JVM tests (including SQLite failure/restart/cleanup and report dog-scope/separation), native picker/keyboard/report journeys and light/dark/large-text captures. The iOS composer no longer reserves keyboard space twice; photo/context/Send controls remain visible while typing. The reported floating strip matches Gboard’s stylus toolbar; handwriting was disabled only on the owned review emulator. See `docs/design/evidence/task035/README.md`. Existing journals were preserved.
