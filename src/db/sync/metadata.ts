import { type Database, localStorageKey } from '@nozbe/watermelondb';
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync';

import { getBarklogDatabase } from '../database';
import type {
  BarklogSyncMetadata,
  BarklogSyncStatusSnapshot,
  BarklogSyncTrigger,
  SyncCapability,
} from '../types';

const barklogSyncMetadataKey = localStorageKey<BarklogSyncMetadata>(
  'barklog.sync.metadata',
);

const defaultSyncMetadata: BarklogSyncMetadata = {
  phase: 'idle',
};

function resolveDatabase(database?: Database): Database {
  return database ?? getBarklogDatabase();
}

export async function getBarklogSyncMetadata(
  database?: Database,
): Promise<BarklogSyncMetadata> {
  const resolvedDatabase = resolveDatabase(database);
  const metadata = await resolvedDatabase.localStorage.get(
    barklogSyncMetadataKey,
  );

  return (metadata as BarklogSyncMetadata | undefined) ?? defaultSyncMetadata;
}

export async function setBarklogSyncMetadata(
  metadata: BarklogSyncMetadata,
  database?: Database,
) {
  const resolvedDatabase = resolveDatabase(database);
  await resolvedDatabase.localStorage.set(barklogSyncMetadataKey, metadata);
}

export async function mergeBarklogSyncMetadata(
  database: Database | undefined,
  patch: Partial<BarklogSyncMetadata>,
) {
  const resolvedDatabase = resolveDatabase(database);
  const previous = await getBarklogSyncMetadata(resolvedDatabase);
  const nextMetadata: BarklogSyncMetadata = {
    ...previous,
    ...patch,
    phase: patch.phase ?? previous.phase ?? 'idle',
  };

  await setBarklogSyncMetadata(nextMetadata, resolvedDatabase);
}

export async function hasPendingLocalChanges(database?: Database) {
  const resolvedDatabase = resolveDatabase(database);
  return hasUnsyncedChanges({ database: resolvedDatabase });
}

export async function getBarklogSyncStatusSnapshot(
  database?: Database,
): Promise<BarklogSyncStatusSnapshot> {
  const resolvedDatabase = resolveDatabase(database);
  const [metadata, pendingLocalChanges] = await Promise.all([
    getBarklogSyncMetadata(resolvedDatabase),
    hasPendingLocalChanges(resolvedDatabase),
  ]);

  return {
    ...metadata,
    pendingLocalChanges,
  };
}

export async function markBarklogSyncStarted(
  database?: Database,
  options?: {
    trigger?: BarklogSyncTrigger;
  },
) {
  const resolvedDatabase = resolveDatabase(database);

  await mergeBarklogSyncMetadata(resolvedDatabase, {
    lastSyncAttemptAt: Date.now(),
    lastSyncError: null,
    lastSyncTrigger: options?.trigger,
    phase: 'syncing',
  });
}

export async function markBarklogSyncCompleted(
  database?: Database,
  options?: {
    lastPullCompletedAt?: number;
    lastPushCompletedAt?: number;
    lastSyncFinishedAt?: number;
    lastSyncLocalChangeCount?: number;
    lastSyncRemoteChangeCount?: number;
  },
) {
  const resolvedDatabase = resolveDatabase(database);

  await mergeBarklogSyncMetadata(resolvedDatabase, {
    lastCloudSyncAccess: 'premium_enabled',
    lastPullCompletedAt: options?.lastPullCompletedAt,
    lastPushCompletedAt: options?.lastPushCompletedAt,
    lastSyncFinishedAt: options?.lastSyncFinishedAt ?? Date.now(),
    lastSyncLocalChangeCount: options?.lastSyncLocalChangeCount,
    lastSyncRemoteChangeCount: options?.lastSyncRemoteChangeCount,
    lastSyncError: null,
    lastSyncSkippedReason: undefined,
    phase: 'idle',
  });
}

export async function markBarklogSyncSkipped(
  database: Database | undefined,
  options: {
    capability: SyncCapability;
    trigger?: BarklogSyncTrigger;
  },
) {
  const resolvedDatabase = resolveDatabase(database);

  await mergeBarklogSyncMetadata(resolvedDatabase, {
    lastCloudSyncAccess: options.capability.access,
    lastSyncAttemptAt: Date.now(),
    lastSyncError: null,
    lastSyncSkippedReason:
      options.capability.reason === 'premium'
        ? undefined
        : options.capability.reason,
    lastSyncTrigger: options.trigger,
    phase: 'idle',
  });
}

export async function markBarklogSyncFailed(
  error: Error | string,
  database?: Database,
) {
  const resolvedDatabase = resolveDatabase(database);

  await mergeBarklogSyncMetadata(resolvedDatabase, {
    lastSyncError: typeof error === 'string' ? error : error.message,
    phase: 'error',
  });
}
