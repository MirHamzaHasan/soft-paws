# Auth, Trial, and Data Lifecycle Smoke Test

Run this against a staging Supabase project before marking auth lifecycle work release-ready.

## Setup

- Use a staging Supabase project, staging EAS/Expo env, and a fresh test email.
- Confirm client env contains only staging `EXPO_PUBLIC_*` values.
- Confirm server-only secrets are configured in Supabase Edge Function secret management only.
- Start with no BarkLog `users` or `dogs` rows for the test email.

## Checklist

1. Create a new account with email/password.
2. Confirm the app routes to dog onboarding.
3. Confirm the staging `users` row exists with `subscription_tier = trial` and a `trial_ends_at` timestamp roughly 7 days after sign-up.
4. Force close and reopen the app before creating a dog.
5. Confirm auth restore returns to `/(onboarding)/dog-profile`, not the tabs.
6. Complete dog onboarding.
7. Confirm the app routes to `/(tabs)` and the staging `dogs` row has `user_id` equal to the signed-in user id.
8. Sign out from Settings.
9. Sign back in with the same account.
10. Confirm restore lands in `/(tabs)` with the existing dog selected.
11. Change the staging user to `subscription_tier = expired` and keep the existing dog row.
12. Reopen the app and verify the trial-ended paywall can be dismissed.
13. After dismissing, verify Home logging, Timeline access, and profile CSV export remain reachable.
14. Try to open a premium-only surface such as Monthly Trends and confirm it gates through Premium.

## Failure Handling

- If user or dog rows are missing, capture Supabase query responses and RLS policy state.
- If a dog row belongs to another user, treat it as a blocking data lifecycle bug.
- If free logging, timeline, or CSV export is blocked after paywall dismissal, treat it as a launch blocker.
