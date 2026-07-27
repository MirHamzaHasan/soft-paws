# Task 009: Medications, Reminders, and Settings Foundation

- Status: `completed`
- Priority: `P1`
- Phase: `Core Care Loop`
- Depends on: `task006`, `task008`

## Objective

Build the medication management and reminder foundation needed for daily reliability.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for medication, reminders, and settings work. Do not introduce a parallel styling system.

## Scope

- add/edit medication flow
- medication list integration with logging
- reminder schedule model
- Expo Notifications setup for medication reminders
- Settings screen foundation:
  - notifications
  - units
  - appearance
  - privacy and about placeholders

## Out of Scope

- advanced subscription settings
- full HealthKit and Google Fit integration

## Acceptance Criteria

- medications can be created and referenced during logging
- reminders can be scheduled from stored medication data
- Settings covers the canonical BarkLog baseline

## Validation

- reminder scheduling works in local testing
- settings state persists correctly

## Completed Work

- Added an offline-first medication repository for create, update, deactivate, and active medication listing.
- Wired add/edit medication to WatermelonDB with canonical frequencies, schedule times, refill dates, and with-food behavior.
- Connected the profile medication accordion to stored active medications with edit navigation.
- Connected medication logging to stored medications so saved events reference the real `med_id`.
- Added Expo Notifications medication reminder scheduling, cancellation, and app-level notification handling.
- Added persisted Settings state for medication reminders, anomaly alerts, units, appearance, and baseline privacy/about placeholders.

## Validation Notes

- `corepack pnpm check-types`
- targeted `corepack pnpm exec eslint ...`
