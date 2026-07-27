import type { Database } from '@nozbe/watermelondb';
import { synchronize, type SyncLog } from '@nozbe/watermelondb/sync';

import { getBarklogDatabase } from '../database';
import type { BarklogSyncTrigger, SyncCapability } from '../types';
import { createCloudSyncCapability, getCloudSyncStatusCopy } from './access';
import { BARKLOG_SYNC_MIGRATIONS_ENABLED_AT_VERSION } from './contract';
import { isBarklogSyncConflictError } from './errors';
import {
  markBarklogSyncCompleted,
  markBarklogSyncFailed,
  markBarklogSyncSkipped,
  markBarklogSyncStarted,
} from './metadata';
import {
  type BarklogSyncTransport,
  createSupabaseBarklogSyncTransport,
} from './transport';

export type BarklogSyncRunResult =
  | {
      ok: true;
      retriedAfterConflict: boolean;
      skipped?: false;
    }
  | {
      message: string;
      ok: true;
      reason: Exclude<SyncCapability['reason'], 'premium'>;
      retriedAfterConflict: false;
      skipped: true;
    }
  | {
      error: Error;
      ok: false;
      retriedAfterConflict: boolean;
    };

export type BarklogSyncOptions = {
  capability?: SyncCapability;
  database?: Database;
  force?: boolean;
  retryOnConflict?: boolean;
  throwOnError?: boolean;
  transport?: BarklogSyncTransport;
  trigger?: BarklogSyncTrigger;
};

let activeSyncPromise: Promise<BarklogSyncRunResult> | null = null;

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function readSyncCount(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

async function runWatermelonSync(input: {
  database: Database;
  transport: BarklogSyncTransport;
}) {
  const log: SyncLog = {};

  await synchronize({
    database: input.database,
    log,
    migrationsEnabledAtVersion: BARKLOG_SYNC_MIGRATIONS_ENABLED_AT_VERSION,
    pullChanges: input.transport.pullChanges,
    pushChanges: input.transport.pushChanges,
  });

  return log;
}

async function markSyncSuccess(input: {
  database: Database;
  log: SyncLog;
  syncFinishedAt: number;
}) {
  await markBarklogSyncCompleted(input.database, {
    lastPullCompletedAt: input.syncFinishedAt,
    lastPushCompletedAt: input.syncFinishedAt,
    lastSyncFinishedAt: input.syncFinishedAt,
    lastSyncLocalChangeCount: readSyncCount(input.log.localChangeCount),
    lastSyncRemoteChangeCount: readSyncCount(input.log.remoteChangeCount),
  });
}

async function executeBarklogSync(
  options: BarklogSyncOptions,
): Promise<BarklogSyncRunResult> {
  const database = options.database ?? getBarklogDatabase();
  const transport = options.transport ?? createSupabaseBarklogSyncTransport();
  const retryOnConflict = options.retryOnConflict ?? true;
  const capability =
    options.capability ?? createCloudSyncCapability('unknown', 'loading');

  if (!capability.canPullFromCloud || !capability.canPushToCloud) {
    await markBarklogSyncSkipped(database, {
      capability,
      trigger: options.trigger ?? 'manual',
    });

    return {
      message: getCloudSyncStatusCopy(capability),
      ok: true,
      reason: capability.reason === 'premium' ? 'loading' : capability.reason,
      retriedAfterConflict: false,
      skipped: true,
    };
  }

  await markBarklogSyncStarted(database, {
    trigger: options.trigger ?? 'manual',
  });

  try {
    const log = await runWatermelonSync({ database, transport });
    await markSyncSuccess({
      database,
      log,
      syncFinishedAt: Date.now(),
    });

    return {
      ok: true,
      retriedAfterConflict: false,
    };
  } catch (error) {
    if (retryOnConflict && isBarklogSyncConflictError(error)) {
      try {
        const retryLog = await runWatermelonSync({ database, transport });
        await markSyncSuccess({
          database,
          log: retryLog,
          syncFinishedAt: Date.now(),
        });

        return {
          ok: true,
          retriedAfterConflict: true,
        };
      } catch (retryError) {
        const resolvedRetryError = toError(retryError);
        await markBarklogSyncFailed(resolvedRetryError, database);

        if (options.throwOnError) {
          throw resolvedRetryError;
        }

        return {
          error: resolvedRetryError,
          ok: false,
          retriedAfterConflict: true,
        };
      }
    }

    const resolvedError = toError(error);
    await markBarklogSyncFailed(resolvedError, database);

    if (options.throwOnError) {
      throw resolvedError;
    }

    return {
      error: resolvedError,
      ok: false,
      retriedAfterConflict: false,
    };
  }
}

export function syncBarklogData(
  options: BarklogSyncOptions = {},
): Promise<BarklogSyncRunResult> {
  if (activeSyncPromise && !options.force) {
    return activeSyncPromise;
  }

  activeSyncPromise = executeBarklogSync(options).finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}

export function resetActiveBarklogSyncForTests() {
  activeSyncPromise = null;
}
