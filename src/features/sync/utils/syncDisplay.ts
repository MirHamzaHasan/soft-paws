import type { BarklogSyncStatusSnapshot, SyncCapability } from '@/db/types';
import type { PremiumEntitlementState } from '@/features/premium/utils/premiumAccess';

export type SyncDisplayState =
  | 'local_only'
  | 'premium_syncing'
  | 'premium_synced'
  | 'premium_sync_error'
  | 'premium_restore_available'
  | 'entitlement_loading'
  | 'entitlement_expired';

export type SyncDisplayTone = 'loading' | 'local' | 'premium' | 'warning';

export type SyncDisplayContent = {
  accessibilityLabel: string;
  body: string;
  compactBody: string;
  compactTitle: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  state: SyncDisplayState;
  title: string;
  tone: SyncDisplayTone;
};

type SyncDisplayInput = {
  capability: SyncCapability;
  entitlementKind?: PremiumEntitlementState['kind'];
  now?: Date;
  snapshot?: BarklogSyncStatusSnapshot | null;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatLastSync(timestamp: number | undefined, now = new Date()) {
  if (!timestamp) {
    return 'No cloud sync yet';
  }

  const elapsed = Math.max(0, now.getTime() - timestamp);

  if (elapsed < MINUTE) {
    return 'Just now';
  }

  if (elapsed < HOUR) {
    const minutes = Math.max(1, Math.round(elapsed / MINUTE));
    return `${minutes} min ago`;
  }

  if (elapsed < DAY) {
    const hours = Math.max(1, Math.round(elapsed / HOUR));
    return `${hours} hr ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp));
}

export function getSyncDisplayState({
  capability,
  entitlementKind,
  snapshot,
}: SyncDisplayInput): SyncDisplayState {
  if (capability.reason === 'loading' || capability.access === 'unknown') {
    return 'entitlement_loading';
  }

  if (!capability.canPullFromCloud || !capability.canPushToCloud) {
    return entitlementKind === 'trial-expired'
      ? 'entitlement_expired'
      : 'local_only';
  }

  if (snapshot?.phase === 'syncing') {
    return 'premium_syncing';
  }

  if (snapshot?.phase === 'error' || snapshot?.lastSyncError) {
    return 'premium_sync_error';
  }

  if (snapshot?.lastSyncFinishedAt && !snapshot.pendingLocalChanges) {
    return 'premium_synced';
  }

  return 'premium_restore_available';
}

export function getSyncDisplayContent(
  input: SyncDisplayInput,
): SyncDisplayContent {
  const state = getSyncDisplayState(input);
  const lastSyncLabel = formatLastSync(
    input.snapshot?.lastSyncFinishedAt,
    input.now,
  );

  if (state === 'entitlement_loading') {
    return {
      accessibilityLabel:
        'Checking backup and sync access. Local logging still works.',
      body: 'Local logging still works while BarkLog checks backup and sync access.',
      compactBody: 'Local logging still works',
      compactTitle: 'Checking backup',
      primaryActionLabel: 'Checking access',
      secondaryActionLabel: 'Export your data anytime',
      state,
      title: 'Checking backup access',
      tone: 'loading',
    };
  }

  if (state === 'entitlement_expired') {
    return {
      accessibilityLabel:
        'Saved on this device. Trial ended. Upgrade for backup and sync. Export your data anytime.',
      body: 'Premium backup is paused, but your logs stay available here. Export your data anytime.',
      compactBody: 'Upgrade for backup and sync',
      compactTitle: 'Saved on this device',
      primaryActionLabel: 'Upgrade for backup and sync',
      secondaryActionLabel: 'Export your data anytime',
      state,
      title: 'Saved on this device',
      tone: 'local',
    };
  }

  if (state === 'local_only') {
    return {
      accessibilityLabel:
        'Saved on this device. Upgrade for backup and sync. Export your data anytime.',
      body: 'Your logs stay available on this device. Export your data anytime.',
      compactBody: 'Export your data anytime',
      compactTitle: 'Saved on this device',
      primaryActionLabel: 'Upgrade for backup and sync',
      secondaryActionLabel: 'Export your data anytime',
      state,
      title: 'Saved on this device',
      tone: 'local',
    };
  }

  if (state === 'premium_syncing') {
    return {
      accessibilityLabel:
        'Backup and sync are running. Local logging still works.',
      body: 'BarkLog is backing up recent changes and checking for cloud updates.',
      compactBody: 'Backing up recent changes',
      compactTitle: 'Syncing backup',
      primaryActionLabel: 'Syncing now',
      secondaryActionLabel: 'Export your data anytime',
      state,
      title: 'Syncing backup',
      tone: 'premium',
    };
  }

  if (state === 'premium_sync_error') {
    return {
      accessibilityLabel:
        'Saved on this device. Backup needs a retry. Export your data anytime.',
      body:
        input.snapshot?.lastSyncError ??
        'Backup needs a retry. Local logging still works, and you can export your data anytime.',
      compactBody: 'Backup needs a retry',
      compactTitle: 'Saved on this device',
      primaryActionLabel: 'Retry sync',
      secondaryActionLabel: 'Export your data anytime',
      state,
      title: 'Saved on this device',
      tone: 'warning',
    };
  }

  if (state === 'premium_synced') {
    return {
      accessibilityLabel: `Backed up and synced. Last sync ${lastSyncLabel}.`,
      body: `Last sync: ${lastSyncLabel}. New logs still save locally first before BarkLog backs them up.`,
      compactBody: `Last sync ${lastSyncLabel}`,
      compactTitle: 'Backed up and synced',
      primaryActionLabel: 'Sync now',
      secondaryActionLabel: 'Restore from cloud',
      state,
      title: 'Backed up and synced',
      tone: 'premium',
    };
  }

  return {
    accessibilityLabel:
      'Backup and restore are enabled. Sync now to back up local changes or pull your latest cloud copy.',
    body: 'Backup and restore are enabled. Sync now to back up local changes or pull your latest cloud copy.',
    compactBody: 'Sync now to update backup',
    compactTitle: 'Backup enabled',
    primaryActionLabel: 'Sync now',
    secondaryActionLabel: 'Restore from cloud',
    state,
    title: 'Backup and restore enabled',
    tone: 'premium',
  };
}
