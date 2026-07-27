import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

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
  return new LokiJSAdapter({
    dbName: BARKLOG_DATABASE_NAME,
    migrations: barklogMigrations,
    onSetUpError: logAdapterError,
    schema: barklogSchema,
    useIncrementalIndexedDB: true,
    useWebWorker: false,
  });
}
