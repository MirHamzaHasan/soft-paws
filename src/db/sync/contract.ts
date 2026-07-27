import { BARKLOG_SYNC_COLLECTIONS } from '../constants';
import { BARKLOG_SCHEMA_VERSION } from '../schema';
import type {
  BarklogSyncPullRequest,
  BarklogSyncPullResponse,
  BarklogSyncPushRequest,
  BarklogSyncPushResponse,
} from '../types';

export const BARKLOG_SYNC_PROTOCOL_VERSION = 1;
export const BARKLOG_SYNC_MIGRATIONS_ENABLED_AT_VERSION =
  BARKLOG_SCHEMA_VERSION;

export const barklogSyncConflictPolicy = {
  clientIdStrategy: 'uuid_v4_from_expo_crypto',
  localDirtyColumnsWinDuringPull: true,
  remoteConflictBehavior: 'reject_push_then_pull_and_retry',
  syncedCollections: BARKLOG_SYNC_COLLECTIONS,
} as const;

export type BarklogSyncContract = {
  migrationsEnabledAtVersion: typeof BARKLOG_SYNC_MIGRATIONS_ENABLED_AT_VERSION;
  protocolVersion: typeof BARKLOG_SYNC_PROTOCOL_VERSION;
  pull: {
    request: BarklogSyncPullRequest;
    response: BarklogSyncPullResponse;
  };
  push: {
    request: BarklogSyncPushRequest;
    response: BarklogSyncPushResponse;
  };
};

export const barklogSyncContract: BarklogSyncContract = {
  migrationsEnabledAtVersion: BARKLOG_SYNC_MIGRATIONS_ENABLED_AT_VERSION,
  protocolVersion: BARKLOG_SYNC_PROTOCOL_VERSION,
  pull: {
    request: {} as BarklogSyncPullRequest,
    response: {} as BarklogSyncPullResponse,
  },
  push: {
    request: {} as BarklogSyncPushRequest,
    response: {} as BarklogSyncPushResponse,
  },
};
