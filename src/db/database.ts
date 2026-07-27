import { Database } from '@nozbe/watermelondb';
import { setGenerator } from '@nozbe/watermelondb/utils/common/randomId';
import * as Crypto from 'expo-crypto';

import { createBarklogAdapter } from './createAdapter';
import { barklogModelClasses } from './modelClasses';

let didConfigureIdGenerator = false;
let databaseInstance: Database | null = null;

function configureWatermelonIds() {
  if (didConfigureIdGenerator) {
    return;
  }

  setGenerator(() => Crypto.randomUUID());
  didConfigureIdGenerator = true;
}

export function createBarklogDatabase() {
  configureWatermelonIds();

  return new Database({
    adapter: createBarklogAdapter(),
    modelClasses: barklogModelClasses,
  });
}

export function getBarklogDatabase() {
  if (!databaseInstance) {
    databaseInstance = createBarklogDatabase();
  }

  return databaseInstance;
}

export function resetBarklogDatabaseForTests() {
  databaseInstance = null;
}
