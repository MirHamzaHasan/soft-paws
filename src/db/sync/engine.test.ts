import type { Database } from '@nozbe/watermelondb';
import {
  type SyncDatabaseChangeSet,
  synchronize,
} from '@nozbe/watermelondb/sync';

import { createCloudSyncCapability } from './access';
import { resetActiveBarklogSyncForTests, syncBarklogData } from './engine';
import { BarklogSyncConflictError } from './errors';
import { getBarklogSyncMetadata } from './metadata';
import type { BarklogSyncTransport } from './transport';

jest.mock('@nozbe/watermelondb/sync', () => ({
  hasUnsyncedChanges: jest.fn(async () => false),
  synchronize: jest.fn(),
}));

jest.mock('../database', () => ({
  getBarklogDatabase: jest.fn(),
}));

jest.mock('./transport', () => ({
  createSupabaseBarklogSyncTransport: jest.fn(),
}));

const emptyChanges = {
  care_tasks: { created: [], deleted: [], updated: [] },
  dog_training_enrollments: { created: [], deleted: [], updated: [] },
  dogs: { created: [], deleted: [], updated: [] },
  events: { created: [], deleted: [], updated: [] },
  expenses: { created: [], deleted: [], updated: [] },
  insights: { created: [], deleted: [], updated: [] },
  medications: { created: [], deleted: [], updated: [] },
  photo_baselines: { created: [], deleted: [], updated: [] },
  training_sessions: { created: [], deleted: [], updated: [] },
  users: { created: [], deleted: [], updated: [] },
  vaccinations: { created: [], deleted: [], updated: [] },
} as unknown as SyncDatabaseChangeSet;

function createFakeDatabase() {
  const storage = new Map<unknown, unknown>();

  return {
    localStorage: {
      get: jest.fn(async (key: unknown) => storage.get(key)),
      set: jest.fn(async (key: unknown, value: unknown) => {
        storage.set(key, value);
      }),
    },
  } as unknown as Database;
}

function createTransport(): jest.Mocked<BarklogSyncTransport> {
  return {
    pullChanges: jest.fn(
      async (_request: Parameters<BarklogSyncTransport['pullChanges']>[0]) => ({
        changes: emptyChanges,
        timestamp: 123456,
      }),
    ),
    pushChanges: jest.fn(
      async (
        _request: Parameters<BarklogSyncTransport['pushChanges']>[0],
      ) => ({}),
    ),
  };
}

function mockSuccessfulSynchronize() {
  const synchronizeMock = synchronize as jest.MockedFunction<
    typeof synchronize
  >;

  synchronizeMock.mockImplementation(async (args) => {
    const pullResult = await args.pullChanges({
      lastPulledAt: 100,
      migration: null,
      schemaVersion: 2,
    });

    if ('timestamp' in pullResult) {
      await args.pushChanges?.({
        changes: emptyChanges,
        lastPulledAt: pullResult.timestamp,
      });
    }

    if (args.log) {
      const { log } = args;
      log.localChangeCount = 1;
      log.remoteChangeCount = 2;
    }
  });
}

describe('syncBarklogData', () => {
  const premiumCapability = createCloudSyncCapability('premium_enabled');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-26T12:00:00.000Z'));
    resetActiveBarklogSyncForTests();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs Watermelon pull and push through the configured transport', async () => {
    const database = createFakeDatabase();
    const transport = createTransport();

    mockSuccessfulSynchronize();

    const result = await syncBarklogData({
      capability: premiumCapability,
      database,
      force: true,
      transport,
      trigger: 'manual',
    });

    const metadata = await getBarklogSyncMetadata(database);

    expect(result).toEqual({
      ok: true,
      retriedAfterConflict: false,
    });
    expect(transport.pullChanges).toHaveBeenCalledWith({
      lastPulledAt: 100,
      migration: null,
      schemaVersion: 2,
    });
    expect(transport.pushChanges).toHaveBeenCalledWith({
      changes: emptyChanges,
      lastPulledAt: 123456,
    });
    expect(metadata).toMatchObject({
      lastSyncError: null,
      lastSyncLocalChangeCount: 1,
      lastSyncRemoteChangeCount: 2,
      lastSyncTrigger: 'manual',
      phase: 'idle',
    });
  });

  it('pulls and retries once when the backend rejects a conflict', async () => {
    const database = createFakeDatabase();
    const transport = createTransport();
    const synchronizeMock = synchronize as jest.MockedFunction<
      typeof synchronize
    >;

    synchronizeMock
      .mockRejectedValueOnce(new BarklogSyncConflictError('Pull and retry.'))
      .mockImplementationOnce(async (args) => {
        await args.pullChanges({
          lastPulledAt: 200,
          migration: null,
          schemaVersion: 2,
        });

        if (args.log) {
          const { log } = args;
          log.localChangeCount = 0;
          log.remoteChangeCount = 1;
        }
      });

    const result = await syncBarklogData({
      capability: premiumCapability,
      database,
      force: true,
      transport,
      trigger: 'app_foreground',
    });

    const metadata = await getBarklogSyncMetadata(database);

    expect(result).toEqual({
      ok: true,
      retriedAfterConflict: true,
    });
    expect(synchronizeMock).toHaveBeenCalledTimes(2);
    expect(metadata).toMatchObject({
      lastSyncError: null,
      lastSyncLocalChangeCount: 0,
      lastSyncRemoteChangeCount: 1,
      lastSyncTrigger: 'app_foreground',
      phase: 'idle',
    });
  });

  it('records failed sync metadata without throwing by default', async () => {
    const database = createFakeDatabase();
    const transport = createTransport();
    const synchronizeMock = synchronize as jest.MockedFunction<
      typeof synchronize
    >;

    synchronizeMock.mockRejectedValueOnce(new Error('Network unavailable'));

    const result = await syncBarklogData({
      capability: premiumCapability,
      database,
      force: true,
      transport,
      trigger: 'local_write',
    });

    const metadata = await getBarklogSyncMetadata(database);

    expect(result).toMatchObject({
      ok: false,
      retriedAfterConflict: false,
    });
    expect(metadata).toMatchObject({
      lastSyncError: 'Network unavailable',
      lastSyncTrigger: 'local_write',
      phase: 'error',
    });
  });

  it('skips cloud sync for local-only users without touching the transport', async () => {
    const database = createFakeDatabase();
    const transport = createTransport();
    const synchronizeMock = synchronize as jest.MockedFunction<
      typeof synchronize
    >;

    const result = await syncBarklogData({
      capability: createCloudSyncCapability('local_only'),
      database,
      force: true,
      transport,
      trigger: 'local_write',
    });

    const metadata = await getBarklogSyncMetadata(database);

    expect(result).toEqual({
      message: 'Saved on this device. Upgrade for backup and sync.',
      ok: true,
      reason: 'local_only',
      retriedAfterConflict: false,
      skipped: true,
    });
    expect(synchronizeMock).not.toHaveBeenCalled();
    expect(transport.pullChanges).not.toHaveBeenCalled();
    expect(transport.pushChanges).not.toHaveBeenCalled();
    expect(metadata).toMatchObject({
      lastCloudSyncAccess: 'local_only',
      lastSyncError: null,
      lastSyncSkippedReason: 'local_only',
      lastSyncTrigger: 'local_write',
      phase: 'idle',
    });
  });

  it('does not attempt cloud sync while entitlement state is loading', async () => {
    const database = createFakeDatabase();
    const transport = createTransport();
    const synchronizeMock = synchronize as jest.MockedFunction<
      typeof synchronize
    >;

    const result = await syncBarklogData({
      capability: createCloudSyncCapability('unknown', 'loading'),
      database,
      force: true,
      transport,
      trigger: 'auth_bootstrap',
    });

    const metadata = await getBarklogSyncMetadata(database);

    expect(result).toMatchObject({
      ok: true,
      reason: 'loading',
      skipped: true,
    });
    expect(synchronizeMock).not.toHaveBeenCalled();
    expect(metadata).toMatchObject({
      lastCloudSyncAccess: 'unknown',
      lastSyncError: null,
      lastSyncSkippedReason: 'loading',
      lastSyncTrigger: 'auth_bootstrap',
      phase: 'idle',
    });
  });
});
