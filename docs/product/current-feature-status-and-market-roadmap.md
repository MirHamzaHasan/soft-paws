# BarkLog Current Feature Status And Market Roadmap

## Executive Status

| Area | Status |
| ---- | ------ |
| Code backlog | `task001` through `task042` are complete |
| Local automated preflight | Passing |
| Release status | Blocked until external preview-build evidence is recorded |
| Product readiness label | Code-complete for preview validation, not store-release signed off |

BarkLog is now past the prototype backlog and has a production-hardening baseline. It should still be treated as a preview-validation build until EAS preview builds, physical device QA, Supabase staging checks, RevenueCat sandbox checks, observability dashboard evidence, and store metadata review are completed.

## Features Available Now

- Auth, onboarding, and trial bootstrap.
- Home one-tap logging for Poop, Pee, Meal, and Walk.
- Long-form detail logging for symptoms, medications, meals, walks, pee, and poop.
- Timeline and event detail review.
- Mood, behavior, expanded offline care logs, and training Timeline events.
- Dog profile, dog switcher, add dog, one-dog free limit, and Premium multi-dog path.
- Medication creation and notification reminder scheduling.
- Toxicity lookup, triage, Emergency SOS, and first-aid surfaces.
- Free Safety Center offline pack with local emergency card, source metadata, CPR timer entry, safe transport checklist, and core toxicity lookup links.
- Free local Care Calendar for medication refills, parasite prevention, grooming, vaccinations, vet follow-ups, training practice, custom care tasks, and explicit opt-in reminders.
- Free local Photo Baseline Tracker for dated visual references and owner-observed notes.
- Weekly insights, Ask BarkLog AI, monthly trends, Vet Visit Prep, generated care summaries, and AI Agent Center.
- Training hub, static free weekly program browsing, Premium training progress/session tracking, and personalized training insights.
- Premium Vet Prep report summaries with secure, time-limited, revocable vet share links.
- Premium household sharing with caregiver roles, sitter mode, invites, shared care handoffs, and shared-dog sync scoping.
- CSV/text export, PDF export, Memory Book, and Expense Tracker.
- WatermelonDB offline persistence and Supabase sync engine.
- RevenueCat-backed Premium entitlement checks.
- Mixpanel/Sentry-style observability with telemetry redaction.
- Release, native QA, store submission, and rollback checklists.

## What Is Done

- Local commands pass: typecheck, lint, Jest, Expo web export, and bundle secret scan.
- Test baseline has expanded beyond the original production-hardening baseline; run the local validation suite for current counts.
- Client code does not call AI providers directly; AI calls go through Supabase Edge Functions.
- Premium unlock depends on RevenueCat entitlement state, not local button success.
- Basic logging, timeline access, CSV export, and Safety Center access remain free.
- Camera, location, Apple Health, and Google Fit are intentionally not configured in the current build.
- Current native permission posture matches the build: Android declares notification permission only; iOS has no camera, location, or health permission copy.

## What Is Still Left Before Release

- EAS preview builds for iOS and Android.
- Physical-device QA using [native-device-qa-checklist.md](../deployment/native-device-qa-checklist.md).
- Supabase staging smoke tests for auth and sync.
- Supabase Edge Function deployment verification.
- RevenueCat sandbox purchase, cancel, restore, and expiry checks.
- Mixpanel and Sentry dashboard evidence from preview builds.
- Store metadata, privacy policy, screenshots, and data safety forms.
- Rollback target: known-good build URLs and deployed Supabase function versions.

Use [release-preflight-checklist.md](../deployment/release-preflight-checklist.md) as the release decision record. Do not mark BarkLog store-ready until every required release row has evidence.

## Market Signals

These are directional signals, not proof that BarkLog should copy any competitor directly.

- AI pet care apps are competing around reminders, records, photo/mood checks, and instant answers: [Clawmate](https://clawmate.com/) and [DogCare](https://apps.apple.com/dz/app/dogcare-ai-pet-health-tracker/id1640580693).
- Multi-pet records and vet-prep reports are a visible competitor direction: [Pet Monitor](https://petmonitor.ai/).
- AI, telehealth, preventive care, subscriptions, and wearables are current pet-tech themes: [Kinn 2026 trends](https://kinninc.com/blogs/news/what-s-ahead-in-2026), [Technavio AI pet wearables](https://www.technavio.com/report/ai-pet-health-wearables-market-industry-analysis), and [Pet symptom checker apps market](https://dataintelo.com/report/pet-symptom-checker-apps-market).

## Market-Crushing Feature Suggestions

1. **Household Handoff** (`task039` implemented)
   - Shared care notes, who-fed/walked/medicated tracking, and sitter mode.
   - Strong for multi-person households and travel.

2. **Vet Share Link** (`task038` implemented)
   - Generate a secure, time-limited vet-facing link with timeline, meds, symptoms, exports, and owner notes.
   - This is stronger than plain PDF export because it makes BarkLog useful inside the vet visit.

3. **Care Copilot Timeline**
   - AI summarizes what changed since last week or last month using only logged facts.
   - Non-diagnostic; focuses on pattern deltas, missed meds, appetite/stool changes, and questions to ask the vet.

4. **Medication Refill And Care Calendar** (`task041` implemented)
   - Add refill dates, inventory count, last-dose-left warnings, and subscription or auto-ship reminders.
   - High retention value for chronic-care and senior-dog owners.

5. **Photo Baseline Tracker** (`task042` implemented)
   - Let users capture recurring photos for skin, eyes, stool, weight shape, wounds, or mobility posture.
   - Use comparison and change notes, not diagnosis.

6. **Wearable And Activity Import Hub**
   - Add optional imports from Apple Health, Google Fit, and later pet wearables.
   - Position activity data as context, not as a required core feature.

7. **Emergency Offline Pack** (`task040` implemented)
   - Offline poison-control info, emergency card, medication list, vet contacts, and nearest-clinic handoff checklist.
   - Differentiates BarkLog as trustworthy under stress.

8. **Breed And Age Preventive Care Plan**
   - Personalized care schedule by age, weight, breed risk, vaccine dates, dental, parasite prevention, and senior checks.
   - Keep wording preventive and educational, not diagnostic.

9. **Vet Follow-Up Mode**
   - After a visit, turn instructions into reminders, med schedules, symptom watch items, and follow-up questions.
   - Converts vet appointments into ongoing product usage.

10. **Trust Layer**
    - Show source labels, not-medical-advice boundaries, escalation logic, and vet-review readiness.
    - In pet health, trust and restraint are product advantages.

## Recommended Priority After Release Sign-Off

1. Finish release evidence and ship a tightly scoped beta.
2. Define the next backlog slice after `task042`.
3. Add Care Copilot Timeline after enough logged data exists to make it useful.
4. Add native photo capture and activity imports only after permission, privacy, and store-copy requirements are fully designed.
