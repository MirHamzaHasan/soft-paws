# Task 012: Paywall, Entitlements, and Premium Gating

- Status: `completed`
- Priority: `P1`
- Phase: `Intelligence and Safety`
- Depends on: `task004`, `task006`

## Objective

Implement subscription purchase flow and feature gating around RevenueCat entitlements.

## Implementation Baseline

Use the existing `Tamagui` styling foundation for paywall and premium surfaces. Do not introduce a parallel styling system.

## Scope

- RevenueCat client setup
- paywall screen
- subscription management screen
- premium gate surface
- trial expiration behavior
- entitlement-aware feature checks

## Out of Scope

- family plan implementation
- long-term pricing experiments

## Acceptance Criteria

- trial and post-trial paths match the canonical logic
- premium-only features are gated consistently
- free users retain logging, timeline, and export access
- restore purchases and plan management are wired

## Validation

- premium entitlements toggle features correctly
- free-path guarantees remain intact

## Completed Work

- Added a centralized premium catalog for RevenueCat product IDs, premium feature metadata, paywall rows, and always-free guarantees.
- Added entitlement helpers for trial, active, expired, free, and grandfathered access states.
- Added a RevenueCat-style service boundary for plan offerings, purchase activation, restore purchases, and native subscription management links.
- Replaced the static paywall with annual and monthly CTA handling, trial status copy, data-freedom assurances, and entitlement updates.
- Replaced the generic premium gate copy with feature-aware gate messaging.
- Wired subscription management to show current access state, restore purchases, manage subscription, and RevenueCat configuration status.
- Added trial-expiration paywall prompting with a dismiss-to-free-mode path for the current app session.
- Applied feature-aware gates to AI weekly insights, Ask BarkLog AI, monthly trends, Memory Book, Expense Tracker, multi-dog add flow, photo compare, and vet PDF export while preserving free logging, timeline, CSV/export, and safety access.

## Validation Notes

- `corepack pnpm check-types`
- targeted `eslint` on task012 files
- `corepack pnpm exec expo export --platform web`
- restarted web preview at `http://localhost:8081`
