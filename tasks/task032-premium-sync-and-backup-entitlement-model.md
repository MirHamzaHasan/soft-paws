# Task 032: Premium Sync and Backup Entitlement Model

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Monetization`
- Depends on: `task031`

## Objective

Rework BarkLog's cloud persistence boundary so local logging remains free and offline-first, while cloud backup, restore, cross-device sync, household sync, and share links require the single `premium` RevenueCat entitlement.

## Implementation Baseline

Use the existing WatermelonDB local persistence and Supabase sync engine. Do not replace the sync engine or create a parallel storage path.

Use [barklog-best-in-market-product-and-monetization-plan.md](../docs/product/barklog-best-in-market-product-and-monetization-plan.md) as the strategy input. Do not rewrite the canonical source-of-truth spec as part of this task.

## Scope

- define a single `premium` entitlement contract for sync and backup access
- gate cloud writes, pull sync, restore, cross-device sync, household sync, and cloud media backup behind Premium
- keep local WatermelonDB writes available to free users
- keep manual CSV/PDF export available to free users
- add an explicit local-only sync mode for non-premium users
- prevent background sync jobs from sending free-user care data to Supabase
- keep auth/session behavior compatible with local-only free mode
- add migration handling for existing users who already have synced data
- add tests for entitlement-gated sync behavior

## Out of Scope

- new Sync and Backup UI; task033 owns visible sync status and settings
- household invite UX; task039 owns collaborative sharing
- AI summaries; task036 owns generated summaries
- emergency or first-aid changes
- deleting existing cloud data without a separate migration decision

## Entitlement and Data Contracts

Use one entitlement:

```text
premium
```

Recommended sync state model:

```ts
type CloudSyncAccess = 'premium_enabled' | 'local_only' | 'unknown';

type SyncCapability = {
  canPushToCloud: boolean;
  canPullFromCloud: boolean;
  canRestoreFromCloud: boolean;
  reason: 'premium' | 'local_only' | 'loading' | 'error';
};
```

Rules:

- Premium users can push, pull, restore, and cloud-backup media.
- Free users can write locally and export manually.
- Free users cannot push new care records to Supabase.
- Free users cannot restore cloud records on a new device.
- Existing cloud data handling must be documented before launch if this task changes previous behavior.

## UX and Accessibility Requirements

- No new primary UI is required in this task.
- Any temporary user-facing status must use clear wording: "Saved on this device" and "Upgrade for backup and sync."
- Do not use fear-based copy around data loss.

## AI / Safety Requirements

- AI access remains premium and must continue through Supabase Edge Functions only.
- Emergency, first-aid, and core toxicity flows must remain available without Premium and must not depend on cloud sync.

## Premium / Free Behavior

- Free: offline local logs, local Timeline, manual CSV/PDF export, safety basics.
- Premium: cloud backup, cross-device sync, restore, household sync, share links, cloud media.

## Acceptance Criteria

- Completed: free users can log locally without network and without Premium.
- Completed: free users do not push new care records to Supabase through client sync or the `barklog-sync` Edge Function.
- Completed: premium and active-trial users can use the existing sync path.
- Completed: manual export remains available to free users; this task did not alter export code.
- Completed: background, foreground, manual refresh, and local-write sync triggers respect current entitlement state.
- Completed: entitlement loading state skips cloud sync without blocking local logging.
- Completed: tests prove cloud writes are blocked for free/local-only users and allowed for Premium users.

## Completion Notes

- Added `CloudSyncAccess`, `SyncCapability`, and sync-skipped metadata fields to the shared sync contract.
- Added `createCloudSyncCapability` and clear local-only copy: "Saved on this device. Upgrade for backup and sync."
- Updated the sync engine to skip WatermelonDB cloud pull/push when capability is `local_only` or `unknown`.
- Updated Home quick-log sync triggers and auth/foreground lifecycle sync triggers to pass entitlement-derived cloud sync capability.
- Added `cloud-sync` as a centralized Premium feature label and catalog entry under the single `premium` entitlement.
- Updated `barklog-sync` Edge Function to require Premium before executing pull or push, protecting the cloud boundary even if the client is bypassed.
- Existing synced user handling: this task blocks new free-user cloud pull/push after entitlement loss; it does not delete existing cloud data. Visible explanation and restore/backup UI are owned by `task033`.

## Validation

- Passed: `npm run check-types`
- Passed: targeted ESLint for entitlement, sync, persistence, Home hook/screen, and `barklog-sync` Edge Function files
- Passed: `npm test -- --coverage=false src/db/sync/engine.test.ts src/db/sync/transport.test.ts src/db/sync/syncEdgeFunctionContracts.test.ts src/db/events/createLocalEvent.test.ts src/features/premium/utils/premiumAccess.test.ts`
- Covered: free local-only sync skip, premium cloud sync path, entitlement loading skip, Edge Function premium gate, and local event creation regression

## Commit Boundary

One commit only: entitlement contract, sync gating, local-only mode, tests, and migration notes. Do not include user-facing sync settings UI.
