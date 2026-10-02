export const BARKLOG_DATABASE_NAME = 'barklog';

export const BARKLOG_COLLECTIONS = [
  'users',
  'dogs',
  'events',
  'medications',
  'insights',
  'vaccinations',
  'expenses',
  'dog_training_enrollments',
  'training_sessions',
  'care_tasks',
  'photo_baselines',
] as const;

export type BarklogCollectionName = (typeof BARKLOG_COLLECTIONS)[number];
