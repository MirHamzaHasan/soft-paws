# Task 011: Toxicity, Triage, Emergency, and First-Aid Suite

- Status: `completed`
- Priority: `P1`
- Phase: `Intelligence and Safety`
- Depends on: `task003`, `task006`, `task008`

## Objective

Build BarkLog's high-trust safety flows with explicit escalation boundaries.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for safety and emergency flows. Do not introduce a parallel styling system.

## Scope

- Toxicity Scanner
- Emergency SOS
- First Aid guide routes
- Vet or Wait triage flow
- trusted content source integration
- location and phone-action behavior where relevant

## Out of Scope

- speculative diagnosis
- non-dog safety content

## Acceptance Criteria

- urgent actions are faster than exploratory actions
- offline behavior is defined for first-aid content
- copy remains bounded to observation, risk, and escalation
- Emergency SOS remains light-mode only

## Validation

- danger scenarios surface the correct escalation actions
- safety copy passes health-boundary review

## Completed Work

- Replaced the static Toxicity Scanner with local lookup data, source labels, clickable recent/common hazard chips, poison-control call actions, and dog-weight context for exposure calls.
- Added offline first-aid topic data for choking, bleeding, CPR, heatstroke, poisoning, and seizures, including a CPR cycle timer and source links.
- Wired Emergency SOS call, map-search, medical-summary share, and quick first-aid topic actions; kept the emergency route forced to light mode.
- Replaced Vet or Wait placeholder with a stepwise triage flow that only returns monitor, contact-vet, or emergency escalation outcomes.
- Replaced the `toxicity-lookup` Edge Function stub with a bounded reference lookup contract.

## Validation Notes

- `corepack pnpm check-types`
- targeted `eslint` on task011 files
- safety-copy boundary grep for diagnosis/treatment language
- `corepack pnpm exec expo export --platform web`
- restarted web preview at `http://localhost:8081`
