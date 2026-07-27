# Task 050: Consented Signup Contact Preferences

- Status: `completed`
- Priority: `P1`
- Phase: `Onboarding Growth And Consent`
- Depends on: `task049`
- Blocks: first-party lifecycle/contact operations for opted-in new accounts

## Objective

Add an optional, consent-based post-signup onboarding step that captures the account owner's preferred name, contact channel, setup goal, and product-update consent without blocking BarkLog's free care-record access.

## User Problem

New BarkLog users may want setup help, account support, or product updates, but BarkLog currently only captures email/password during account creation. The business needs a trustworthy way to understand and contact opted-in account owners while preserving signup momentum, privacy expectations, and the free logging promise.

## Implementation Baseline

- Use the existing Expo Router, Tamagui, Zustand, Supabase auth/database, shared feedback, haptic, analytics, and safe-error-copy foundations.
- Keep signup itself limited to email/password.
- Add the contact capture as an optional post-auth onboarding step before dog-profile setup.
- Store contact preference PII in Supabase only for v1; do not add a WatermelonDB collection or sync the data through the local care database.
- Never send phone numbers, chat handles, preferred names, or freeform contact values to analytics, logs, Sentry, or user-visible error copy.

## Scope

- Add route `/(onboarding)/contact-preferences`.
- After successful signup with an active session, route users to contact preferences before `/(onboarding)/dog-profile`.
- If email confirmation is required, preserve the existing confirmation flow and show the contact step after first confirmed sign-in when onboarding is still required.
- Allow users to skip the step; skipping must route to dog-profile onboarding and prevent repeated prompts.
- Add a Supabase migration for `public.user_contact_preferences`:
  - `user_id uuid primary key references public.users(id) on delete cascade`
  - `preferred_name text`
  - `primary_goal text`
  - `preferred_contact_channel text`
  - `contact_value text`
  - `support_contact_consent boolean default false`
  - `marketing_contact_consent boolean default false`
  - `consent_source text default 'signup_contact_preferences'`
  - `support_consented_at timestamptz`
  - `marketing_consented_at timestamptz`
  - `skipped_at timestamptz`
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()`
- Add owner-only RLS so authenticated users can select, insert, and update only their own row.
- Add typed API helpers:
  - `getContactPreferenceStatus(userId)`
  - `saveContactPreferences(input)`
  - `skipContactPreferences()`
- Extend auth bootstrap, auth store, and route decision utilities with contact preference status so onboarding routes to contact preferences only when needed.
- Update privacy/release documentation to disclose contact info collection, purpose, consent, and opt-out expectations.

## Contact Preferences UX

- Screen fields:
  - preferred name
  - primary BarkLog goal: health patterns, training, medications, vet prep, multi-caregiver, or other
  - preferred contact channel: email, WhatsApp, SMS, Telegram, Signal, or other
  - contact value only when the selected channel is not email
  - consent toggles for onboarding/support contact and product or premium updates
- Account email can be used as the default contact channel without asking for duplicate email input.
- Saving a non-email channel requires a non-empty contact value and explicit support or marketing consent.
- Use `BarklogStatusBanner` for blocking validation or API errors.
- Use polished bottom toast feedback only for saved or skipped confirmation.
- UI copy must use professional language such as "setup help", "account support", and "product updates". Do not use aggressive sales or conversion language.

## Free And Premium Behavior

- This feature is not premium-gated.
- Free users keep all free rights whether they save, skip, or decline marketing contact.
- The step must not block the 7-day trial, first dog profile setup, one-tap logging, Timeline, manual export, Safety Center, Care Calendar, or Photo Baseline Tracker.
- No paywall, upsell, or forced notification prompt belongs in this contact step.

## Analytics And Privacy

- Track only non-PII events:
  - `contact_preferences_viewed`
  - `contact_preferences_saved`
  - `contact_preferences_skipped`
  - `contact_preferences_validation_failed`
  - `contact_preferences_save_failed`
- Event properties may include selected channel, selected goal, and consent booleans.
- Event properties must not include preferred name, phone number, chat handle, email address, or freeform contact value.
- Unexpected failures should use existing observability with sanitized domain-level metadata only.
- Raw Supabase, provider, JWT, RLS, or stack messages must be routed through `getBarklogErrorMessage`.

## Out Of Scope

- No CRM, admin dashboard, lead export, or outbound messaging workflow.
- No WhatsApp, SMS, email marketing, Telegram, Signal, or third-party messaging provider integration.
- No collection of relatives' or third-party contact details.
- No change to RevenueCat entitlements or free versus Premium rights.
- No WatermelonDB schema migration for contact preferences in v1.

## Acceptance Criteria

- Signup still only requires email and password.
- Newly signed-up users with an active session see contact preferences before dog-profile onboarding.
- Confirmed-email users who first sign in with onboarding still required see contact preferences before dog-profile onboarding.
- Users can skip and continue to dog-profile onboarding without repeated interruption.
- Users can save preferred name, primary goal, email contact preference, and consent choices.
- Users choosing WhatsApp, SMS, Telegram, Signal, or other must enter a contact value and grant at least one contact consent before save succeeds.
- Blocking validation and save failures render as one inline `BarklogStatusBanner` without duplicate toast errors.
- Saved or skipped confirmation uses one polished toast and then routes to dog-profile onboarding.
- Contact preference status is included in auth routing tests so complete onboarding still routes existing users to tabs normally.
- PII fields are excluded from analytics, logs, Sentry breadcrumbs, and visible error messages.
- Privacy/release docs explain contact info collection and that app users do not receive Supabase keys or backend credentials.

## Validation

Required automated checks:

```sh
corepack pnpm check-types
corepack pnpm jest src/features/auth/utils/authRouting.test.ts --runInBand --coverage=false
```

Add or update targeted tests for:

- contact preference validation
- `saveContactPreferences` and `skipContactPreferences` payload behavior
- contact preference status routing before dog-profile onboarding
- safe error copy for contact preference API failures
- analytics payload redaction for contact preference events

Manual onboarding smoke:

- successful signup with active session routes to contact preferences
- skip routes to dog-profile onboarding and does not prompt again
- save routes to dog-profile onboarding and does not prompt again
- invalid non-email contact shows inline banner only
- confirmed-email sign-in with onboarding required routes to contact preferences
- existing users with completed onboarding route to Home
- no raw Supabase/provider errors or PII appear in UI, telemetry, or logs

## Completion Notes

- Added Supabase-only `user_contact_preferences` storage with owner-only RLS, update timestamp trigger, and generated TypeScript table definitions.
- Added typed contact preference helpers for status lookup, validation, save, and skip behavior.
- Extended auth bootstrap, Zustand auth state, Expo Router layouts, and auth routing decisions so incomplete onboarding users see contact preferences before dog-profile setup only when the step is still required.
- Added `/(onboarding)/contact-preferences` with optional preferred name, primary goal, contact channel, consent toggles, inline validation errors, and save/skip success toasts.
- Added non-PII contact preference analytics events and telemetry redaction for contact-value, preferred-name, email, phone, and handle keys.
- Updated release privacy docs so optional signup contact info is covered by store and preflight checks.

## Validation Notes

- `corepack pnpm check-types` passed.
- Targeted ESLint passed for the contact preference API/tests, auth bootstrap/routing/screens, onboarding contact screen, route layouts, and telemetry files.
- `corepack pnpm test -- src/api/contactPreferences.test.ts src/api/auth.test.ts src/features/auth/utils/authRouting.test.ts src/features/auth/screens/SignInScreen.test.tsx src/features/observability/services/telemetryPrivacy.test.ts --runInBand --coverage=false` passed with 5 suites and 22 tests.
- `corepack pnpm release:check-env-boundary` passed.
- Manual onboarding smoke was not run in this local session.

## Commit Boundary

One focused commit for the contact preference migration, typed API helpers, onboarding route, auth routing/store changes, UI screen, privacy/release doc updates, and targeted tests.
