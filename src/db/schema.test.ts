import { BARKLOG_COLLECTIONS, BARKLOG_SYNC_COLLECTIONS } from './constants';
import { BARKLOG_SCHEMA_VERSION } from './schema';
import { barklogSyncConflictPolicy } from './sync/contract';

describe('BarkLog local schema contract', () => {
  it('includes training, care, and photo user-data tables in local schema and sync', () => {
    expect(BARKLOG_SCHEMA_VERSION).toBe(4);
    expect(BARKLOG_COLLECTIONS).toEqual(
      expect.arrayContaining([
        'dog_training_enrollments',
        'training_sessions',
        'care_tasks',
        'photo_baselines',
      ]),
    );
    expect(BARKLOG_SYNC_COLLECTIONS).toEqual(
      expect.arrayContaining([
        'dog_training_enrollments',
        'training_sessions',
        'care_tasks',
        'photo_baselines',
      ]),
    );
    expect(barklogSyncConflictPolicy.syncedCollections).toEqual(
      BARKLOG_SYNC_COLLECTIONS,
    );
  });
});
