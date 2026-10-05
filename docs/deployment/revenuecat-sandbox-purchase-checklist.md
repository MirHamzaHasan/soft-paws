# RevenueCat Sandbox Purchase Checklist

Historical purchase test. v1.0.0 is free and has no purchase flow; this checklist is not a release gate. Use [preflight-local.md](../release/preflight-local.md).

Use this checklist for preview builds before marking `task021` or release
preflight complete. RevenueCat is the premium source of truth; Supabase
`users.subscription_tier = active` is only a cached result after the RevenueCat
`premium` entitlement is verified.

## Dashboard Setup

- RevenueCat entitlement ID is `premium`.
- iOS product IDs exist and are attached to the entitlement:
  - `barklog_annual`
  - `barklog_monthly`
- Android product IDs exist and are attached to the entitlement:
  - `barklog_annual`
  - `barklog_monthly`
- The current/default offering contains annual and monthly packages mapped to
  those product IDs.
- Preview build environment includes only public RevenueCat client keys:
  - `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
  - `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- No RevenueCat secret key is included in Expo client env, `env.example`, or
  tracked docs.

## iOS Sandbox

- Install an EAS preview/dev-client build on a physical iOS device.
- Sign in with a sandbox Apple ID that is eligible to purchase.
- Open the BarkLog paywall and start the annual plan.
- Confirm successful purchase updates the local user row to
  `subscription_tier = active` only after RevenueCat returns the `premium`
  entitlement.
- Repeat with the monthly plan on a separate sandbox account or after clearing
  the sandbox subscription state.
- Cancel the purchase dialog and verify Premium is not unlocked.
- Restore purchases on a subscribed account and verify Premium is restored.
- Restore purchases on a non-subscribed account and verify Premium remains
  locked.
- Let a sandbox subscription expire or revoke it in App Store Connect, then
  restore and verify the stale active cache becomes `expired`.

## Android Sandbox

- Install an EAS preview/dev-client build on a physical Android device.
- Use a licensed Google Play test account.
- Open the BarkLog paywall and start the annual plan.
- Confirm successful purchase updates the local user row to
  `subscription_tier = active` only after RevenueCat returns the `premium`
  entitlement.
- Repeat with the monthly plan on a separate tester account or reset purchase
  state in Play Console.
- Cancel the purchase dialog and verify Premium is not unlocked.
- Restore purchases on a subscribed account and verify Premium is restored.
- Restore purchases on a non-subscribed account and verify Premium remains
  locked.
- Expire or cancel the sandbox subscription in Play Console, then restore and
  verify the stale active cache becomes `expired`.

## Free Rights Regression

- With a free or expired user, verify these remain available:
  - daily event logging
  - timeline access
  - CSV export
  - basic PDF export
  - emergency and toxicity safety tools
- Confirm premium-only surfaces still route through the paywall:
  - Ask BarkLog AI
  - AI weekly insights
  - monthly trends
  - expense tracker
  - memory book
  - multi-dog support

## Evidence To Record

- Build profile and build IDs tested for iOS and Android.
- RevenueCat offering ID and product IDs visible in the dashboard.
- Test account type used for each platform.
- Screenshot or short recording of purchase success, cancellation, restore
  success, restore miss, and free-rights access.
- Any RevenueCat, App Store Connect, or Play Console configuration mismatch
  opened as a blocking bug.
