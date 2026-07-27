# Task 033: Local-Only Free Mode and Sync Status UI

- Status: `completed`
- Priority: `P1`
- Phase: `Best-In-Market Monetization`
- Depends on: `task032`

## Objective

Make BarkLog's local-only free mode understandable and trustworthy by showing clear sync, backup, restore, and Premium upgrade states across Home, Profile, Settings, and a dedicated Sync and Backup surface.

## Implementation Baseline

Use existing Expo Router, Tamagui, RevenueCat premium gate, toast, skeleton, and settings patterns. Do not introduce a separate design system or a new paywall implementation.

## Scope

- create or update a Sync and Backup screen
- show local-only state for free users
- show cloud-backed sync state for Premium users
- add sync status entry points from Settings and Profile
- add compact sync indicators where relevant on Home and Timeline
- add restore and connected-device affordances for Premium users
- add Premium Gate for enabling backup or restore from free mode
- add copy explaining "Saved on this device" versus "Backed up and synced"
- add loading, offline, entitlement-expired, sync-error, and restore-unavailable states
- add accessibility labels for sync status

## Out of Scope

- low-level sync entitlement changes; task032 owns the backend boundary
- household sharing; task039 owns shared care collaboration
- AI summaries
- changing raw export behavior

## Data Contracts / Screen States

Recommended visible states:

```ts
type SyncDisplayState =
  | 'local_only'
  | 'premium_syncing'
  | 'premium_synced'
  | 'premium_sync_error'
  | 'premium_restore_available'
  | 'entitlement_loading'
  | 'entitlement_expired';
```

Required copy:

- local-only: "Saved on this device"
- export reassurance: "Export your data anytime"
- backup gate: "Upgrade for backup and sync"
- premium synced: "Backed up and synced"

## UX and Accessibility Requirements

- Sync status must be visible without creating anxiety.
- Never imply that local-only data is broken or unsafe.
- Premium Gate appears only after the user taps a cloud feature.
- Skeletons appear while entitlement or sync status loads.
- Error states offer retry and manual export.
- Touch targets must remain at least 44x44pt.
- Color must not be the only sync-state indicator.

## AI / Safety Requirements

- No AI generation is introduced.
- Emergency and first-aid flows must not show sync paywalls.
- Any safety record needed in an emergency should remain viewable locally.

## Premium / Free Behavior

- Free users see local state and manual export.
- Premium users see backup, restore, last sync, and connected-device information.
- Expired users return to local-only mode for new cloud actions while keeping local access.

## Acceptance Criteria

- Free users see clear local-only status.
- Premium users see clear synced or syncing status.
- Tapping backup, restore, connected devices, or cloud sync from free mode opens the existing Premium Gate.
- Manual export remains available from sync status surfaces.
- Sync errors do not block local logging.
- Screen reader labels communicate local-only and cloud-backed states.

## Validation

- `pnpm check-types`
- targeted lint for sync UI routes/components
- UI tests for free, premium, loading, error, and expired states
- small and large phone layout checks for Sync and Backup screen
- copy review confirming no fear-based data-loss messaging

## Completion Notes

- Added a shared sync display-state mapper for local-only, loading, expired, synced, syncing, retry, and restore-ready states.
- Added a compact Sync Status pill and wired it into Home and Timeline.
- Added a dedicated `Sync and Backup` route with local-only copy, Premium cloud actions, manual CSV export, restore affordance, connected-device affordance, skeleton loading, retry copy, and screen-reader labels.
- Added Settings and Profile entry points into the Sync and Backup surface.
- Kept free logging, local Timeline access, and manual export available without a premium gate.
- Routed cloud sync, backup, restore, and connected-device actions for free or expired users through the existing `cloud-sync` Premium Gate.

## Validation Notes

- Passed: `corepack pnpm check-types`
- Passed: `corepack pnpm exec eslint app/sync-backup.tsx src/features/sync/utils/syncDisplay.ts src/features/sync/utils/syncDisplay.test.ts src/features/sync/components/SyncStatusPill.tsx src/features/sync/hooks/useSyncDisplayStatus.ts src/features/sync/screens/SyncBackupScreen.tsx src/features/home/screens/HomeScreen.tsx src/features/archive/screens/TimelineDailyScreen.tsx src/features/settings/screens/SettingsScreen.tsx src/features/profile/screens/DogProfileHubScreen.tsx`
- Passed: `corepack pnpm test -- --coverage=false src/features/sync/utils/syncDisplay.test.ts`
- Passed: `corepack pnpm web -- --port 8089` with route checks returning `200 OK` for `/sync-backup`, `/settings`, `/timeline`, and `/`.
- Covered: free local-only copy, entitlement loading, expired trial local-only mode, premium synced state, premium sync error retry state, and first-sync/restore-ready state.
- Not run: native small and large phone screenshots in this CLI pass.

## Commit Boundary

One commit only: user-facing sync status UI, Sync and Backup screen, settings/profile entry points, copy, Premium Gate hooks, and tests.
