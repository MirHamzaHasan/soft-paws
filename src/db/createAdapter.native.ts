import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { BARKLOG_DATABASE_NAME } from './constants';
import { barklogMigrations } from './migrations';
import { barklogSchema } from './schema';

function logAdapterError(error: Error) {
  // Watermelon surfaces adapter setup issues asynchronously, so log the failure
  // here until a dedicated observability path lands in task015.
  // eslint-disable-next-line no-console
  console.error('[BarkLog][WatermelonDB] adapter setup failed', error);
}

export function createBarklogAdapter() {
  return new SQLiteAdapter({
    dbName: BARKLOG_DATABASE_NAME,
    jsi: false,
    migrations: barklogMigrations,
    onSetUpError: logAdapterError,
    schema: barklogSchema,
  });
}
