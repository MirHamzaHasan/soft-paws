# Task 021: RevenueCat Entitlements and Premium Enforcement

- Status: `completed`
- Priority: `P0`
- Phase: `Monetization`
- Depends on: `task017`, `task018`, `task019`

## Objective

Replace prototype subscription activation with real RevenueCat entitlement verification.

## Implementation Baseline

Use the existing `Tamagui` styling foundation and keep it as the active UI runtime. Do not introduce `NativeWind` or `Tailwind` as parallel styling systems.

## Scope

- integrate the RevenueCat SDK for offerings, purchase, restore, and entitlement reads
- remove direct `subscription_tier` activation from purchase button success
- centralize entitlement mapping to BarkLog premium features
- keep basic logging, timeline access, CSV export, and free guarantees always unlocked

## Initial Findings

Captured before remediation:

- the app has a RevenueCat-style service boundary and paywall screens
- current purchase behavior updates Supabase subscription state directly
- production premium access must depend on verified RevenueCat entitlement state

## Out of Scope

- changing BarkLog pricing
- launching the future family plan
- gating basic logging, timeline access, or CSV export

## Acceptance Criteria

- premium access depends on RevenueCat entitlement state, not local button success
- failed or cancelled purchases do not unlock premium
- restore works for active subscribers
- premium gates are covered by tests
- free guarantees remain enforced

## Deferred to Later Tasks

- AI premium enforcement is completed in `task022`
- release preflight checks are completed in `task024`

## Delivery Notes

- added the `react-native-purchases` RevenueCat SDK dependency
- replaced direct prototype subscription activation with a RevenueCat purchase
  flow that:
  - reads configured offerings
  - finds the selected annual or monthly package by product ID
  - purchases through RevenueCat
  - updates Supabase only after the `premium` entitlement is active
- added restore handling that activates subscribed users and expires stale
  cached active users when RevenueCat returns no active entitlement
- centralized RevenueCat entitlement reads through
  `readBarklogPremiumEntitlement`
- preserved free-mode guarantees for logging, timeline, CSV/PDF export, and
  safety tools
- updated subscription management copy to expose RevenueCat configuration state
- added mocked RevenueCat tests for purchase success, purchase cancellation,
  missing entitlement, restore success, and stale cache expiry
- added an iOS and Android sandbox purchase checklist under deployment docs

## Validation

- mocked RevenueCat purchase and restore tests
- sandbox purchase checklist for iOS and Android
- `corepack pnpm test -- --runInBand`
- `corepack pnpm check-types`
- `corepack pnpm lint --quiet`
