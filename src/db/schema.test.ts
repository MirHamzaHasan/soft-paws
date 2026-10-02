import { BARKLOG_COLLECTIONS } from './constants';
import { BARKLOG_SCHEMA_VERSION } from './schema';

describe('BarkLog local schema contract', () => {
  it('includes training, care, and photo user-data tables in the local schema', () => {
    expect(BARKLOG_SCHEMA_VERSION).toBe(4);
    expect(BARKLOG_COLLECTIONS).toEqual(
      expect.arrayContaining([
        'dog_training_enrollments',
        'training_sessions',
        'care_tasks',
        'photo_baselines',
      ]),
    );
  });
});
