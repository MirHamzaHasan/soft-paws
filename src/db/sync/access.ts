import type {
  CloudSyncAccess,
  SyncCapability,
  SyncCapabilityReason,
} from '../types';

export const LOCAL_ONLY_SYNC_STATUS_COPY =
  'Saved on this device. Upgrade for backup and sync.';

export const SYNC_LOADING_STATUS_COPY =
  'Checking backup and sync access. Local logging still works.';

export function createCloudSyncCapability(
  access: CloudSyncAccess,
  reason?: SyncCapabilityReason,
): SyncCapability {
  if (access === 'premium_enabled') {
    return {
      access,
      canPullFromCloud: true,
      canPushToCloud: true,
      canRestoreFromCloud: true,
      reason: 'premium',
    };
  }

  if (access === 'local_only') {
    return {
      access,
      canPullFromCloud: false,
      canPushToCloud: false,
      canRestoreFromCloud: false,
      reason: reason ?? 'local_only',
    };
  }

  return {
    access,
    canPullFromCloud: false,
    canPushToCloud: false,
    canRestoreFromCloud: false,
    reason: reason ?? 'loading',
  };
}

export function getCloudSyncStatusCopy(capability: SyncCapability) {
  if (capability.reason === 'premium') {
    return 'Backup and sync are enabled.';
  }

  if (capability.reason === 'loading') {
    return SYNC_LOADING_STATUS_COPY;
  }

  return LOCAL_ONLY_SYNC_STATUS_COPY;
}
