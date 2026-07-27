# Task 040: Safety Center Offline Pack

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Safety`
- Depends on: `task039`

## Objective

Create a stronger free Safety Center with offline emergency content, emergency card access, first-aid basics, and core toxicity lookup that remains usable even without network or Premium.

## Implementation Baseline

Use existing Emergency SOS, first-aid, toxicity, local data, and navigation patterns. Safety-critical actions remain free. Premium may sync emergency cards or saved packets, but urgent guidance must not require payment.

## Scope

- create or consolidate Safety Center route
- add offline emergency pack content
- add emergency card local view
- add first-aid basics index and detail improvements
- add core toxicity lookup offline dataset support where feasible
- add poison-control and vet contact actions
- add CPR timer if not already complete
- add safety content versioning metadata
- add tests for offline availability and no-paywall safety paths

## Out of Scope

- AI emergency triage
- paid urgent guidance
- live clinic integrations
- location-based nearest clinic unless already approved through native permission planning

## Data and Content Contracts

Offline pack should include:

- emergency contacts
- dog emergency card
- medications
- allergies
- known conditions
- first-aid basics
- poison-control action
- safe transport checklist
- CPR timer
- core toxicity lookup

Content metadata:

```ts
type SafetyContentMetadata = {
  source: string;
  version: string;
  reviewed_at: string;
  offline_available: boolean;
};
```

## UX and Accessibility Requirements

- Safety Center uses sober, high-contrast, light-mode-first presentation.
- Emergency SOS remains prominent.
- Offline state should reassure users that saved safety content is available.
- Urgent actions must be one tap where possible.
- No decorative or playful tone in emergency contexts.
- Touch targets must remain at least 44x44pt.

## AI / Safety Requirements

- No AI is needed for urgent safety flows.
- Toxicity and first-aid copy must cite source metadata where practical.
- When uncertainty exists, prefer contacting a vet or poison control.
- Do not diagnose or prescribe treatment.
- Do not delay urgent actions behind forms.

## Premium / Free Behavior

- Free: Safety Center, Emergency SOS, first-aid basics, core toxicity lookup, local emergency card.
- Premium: cloud-synced emergency card, shareable safety packet, optional non-urgent AI prep in later tasks.

## Acceptance Criteria

- Safety Center is reachable from Home and Profile or existing safety entry points.
- Emergency SOS is free and prominent.
- First-aid basics and emergency card are available offline.
- Core toxicity lookup does not require Premium.
- No urgent safety path shows a paywall.
- Safety content has source/version metadata.
- Tests prove offline rendering for key safety screens.

## Completion Notes

- Added `/safety` as the consolidated free Safety Center route, with `/safety-center` as a route alias.
- Added Home and Profile entry points that route caregivers into Safety Center before narrower emergency, first-aid, or toxicity flows.
- Added `OFFLINE_SAFETY_PACK` with emergency contacts, first-aid topic IDs, CPR timer topic, core toxicity hazard IDs, safe transport checklist, and source/version/review metadata.
- Added a local emergency card builder using the selected dog profile and active local medications.
- Updated Toxicity Scanner to accept a `q` route query so Safety Center hazard chips can deep-link into the existing lookup.
- Kept safety surfaces light-mode-first and free of Premium Gate checks on urgent paths.
- Added data and static guardrail tests for offline pack content and no-paywall safety routes.

## Validation

- `corepack pnpm check-types`
- `corepack pnpm exec eslint app/safety.tsx app/safety-center.tsx app/_layout.tsx src/features/safety/data/offlineSafetyPack.ts src/features/safety/data/offlineSafetyPack.test.ts src/features/safety/screens/SafetyCenterScreen.tsx src/features/safety/screens/safetyFreeAccess.test.ts src/features/safety/screens/ToxicityScannerScreen.tsx src/features/home/screens/HomeScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx`
- `corepack pnpm test -- --coverage=false --runTestsByPath src/features/safety/data/offlineSafetyPack.test.ts src/features/safety/screens/safetyFreeAccess.test.ts src/features/safety/data/toxicityDatabase.test.ts`
- Route smoke through Expo web:
  - `/safety`
  - `/safety-center`
  - `/emergency`
  - `/first-aid/cpr`
  - `/toxicity?q=xylitol`

## Commit Boundary

One commit only: Safety Center consolidation, offline pack, source metadata, no-paywall safety enforcement, and tests.
