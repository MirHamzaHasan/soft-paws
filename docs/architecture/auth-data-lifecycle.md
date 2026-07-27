# Architecture: Auth, Trial, and Data Lifecycle

## Canonical Source

Primary source: [../source-of-truth/barklog-product-engineering.md](../source-of-truth/barklog-product-engineering.md)

## Restore Rules

- If Supabase has no active session, BarkLog routes to `/(auth)/welcome`.
- If a session restores but the user has no dog rows, BarkLog routes to `/(onboarding)/dog-profile`.
- If a session restores and at least one owned dog exists, BarkLog routes to `/(tabs)`.
- If bootstrap fails because client env, auth, user row, trial, or dog reads fail, BarkLog signs out locally and preserves the readable bootstrap error in auth state.

## Trial Rules

- New and legacy users with `subscription_tier = trial` and no `trial_ends_at` receive a deterministic 7-day trial window during auth bootstrap.
- Users with `active`, `grandfathered`, or `expired` subscription tiers are not silently moved back into trial.
- Trial expiry may show the paywall once on app open, but dismissing it returns the user to free mode.

## Dog Ownership Rules

- Dog rows loaded during bootstrap, onboarding completion, and add-dog flows must match the current BarkLog user id.
- A dog ownership mismatch is treated as a lifecycle failure and should force a fresh sign-in rather than showing another user's dog data.
- If a newly created dog is not immediately present in the follow-up read, the client keeps the created dog in memory so onboarding can complete without waiting for remote read consistency.

## Local Hydration And Sync

- Auth bootstrap hydrates the Supabase user row and owned dog rows into Zustand auth state, then the sync lifecycle starts WatermelonDB pull/push in the background.
- WatermelonDB remains the local-first source for event, medication, expense, insight, vaccination, and export data created on the device.
- Signing in does not clear WatermelonDB local records. Remote-to-local hydration is handled by the authenticated WatermelonDB sync engine.
- Missing dog rows block app tabs because local events need a dog scope before sync can safely reconcile data.

## Free Mode Rights

Free users retain:

- daily event logging
- timeline access
- CSV export
- emergency and toxicity safety tools

Premium gates should apply only to leverage, intelligence, automation, multi-dog, and richer export/report features.
