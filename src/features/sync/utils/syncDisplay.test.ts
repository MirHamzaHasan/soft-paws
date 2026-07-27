import type { BarklogSyncStatusSnapshot, SyncCapability } from '@/db/types';

import { getSyncDisplayContent, getSyncDisplayState } from './syncDisplay';

const localOnlyCapability: SyncCapability = {
  access: 'local_only',
  canPullFromCloud: false,
  canPushToCloud: false,
  canRestoreFromCloud: false,
  reason: 'local_only',
};

const loadingCapability: SyncCapability = {
  access: 'unknown',
  canPullFromCloud: false,
  canPushToCloud: false,
  canRestoreFromCloud: false,
  reason: 'loading',
};

const premiumCapability: SyncCapability = {
  access: 'premium_enabled',
  canPullFromCloud: true,
  canPushToCloud: true,
  canRestoreFromCloud: true,
  reason: 'premium',
};

function makeSnapshot(
  overrides: Partial<BarklogSyncStatusSnapshot>,
): BarklogSyncStatusSnapshot {
  return {
    pendingLocalChanges: false,
    phase: 'idle',
    ...overrides,
  };
}

describe('sync display state', () => {
  it('keeps free users in local-only copy with export reassurance', () => {
    const content = getSyncDisplayContent({
      capability: localOnlyCapability,
      entitlementKind: 'free',
    });

    expect(content.state).toBe('local_only');
    expect(content.title).toBe('Saved on this device');
    expect(content.body).toContain('Export your data anytime');
    expect(content.primaryActionLabel).toBe('Upgrade for backup and sync');
  });

  it('separates entitlement loading from broken sync states', () => {
    expect(
      getSyncDisplayState({
        capability: loadingCapability,
        entitlementKind: 'unknown',
      }),
    ).toBe('entitlement_loading');

    expect(
      getSyncDisplayContent({
        capability: loadingCapability,
        entitlementKind: 'unknown',
      }).body,
    ).toContain('Local logging still works');
  });

  it('uses local-only access after a trial expires', () => {
    const content = getSyncDisplayContent({
      capability: localOnlyCapability,
      entitlementKind: 'trial-expired',
    });

    expect(content.state).toBe('entitlement_expired');
    expect(content.title).toBe('Saved on this device');
    expect(content.compactBody).toBe('Upgrade for backup and sync');
  });

  it('shows premium synced copy with last sync context', () => {
    const content = getSyncDisplayContent({
      capability: premiumCapability,
      now: new Date('2026-04-27T12:00:00.000Z'),
      snapshot: makeSnapshot({
        lastSyncFinishedAt: new Date('2026-04-27T11:55:00.000Z').getTime(),
      }),
    });

    expect(content.state).toBe('premium_synced');
    expect(content.title).toBe('Backed up and synced');
    expect(content.compactBody).toBe('Last sync 5 min ago');
  });

  it('shows retry copy without blocking local records when premium sync fails', () => {
    const content = getSyncDisplayContent({
      capability: premiumCapability,
      snapshot: makeSnapshot({
        lastSyncError: 'Network unavailable',
        phase: 'error',
      }),
    });

    expect(content.state).toBe('premium_sync_error');
    expect(content.title).toBe('Saved on this device');
    expect(content.primaryActionLabel).toBe('Retry sync');
    expect(content.accessibilityLabel).toContain('Export your data anytime');
  });

  it('prompts premium users to run first sync before restore copy is concrete', () => {
    const content = getSyncDisplayContent({
      capability: premiumCapability,
      snapshot: makeSnapshot({ pendingLocalChanges: true }),
    });

    expect(content.state).toBe('premium_restore_available');
    expect(content.title).toBe('Backup and restore enabled');
    expect(content.primaryActionLabel).toBe('Sync now');
  });
});
