/* eslint-disable no-param-reassign */
import type { Collection } from '@nozbe/watermelondb';

import { getBarklogDatabase } from '../database';
import type { EventModel } from '../models';
import { mergeBarklogSyncMetadata } from '../sync';
import type { CreateLocalEventInput } from '../types';
import { toUnixTimestamp } from '../utils';

export async function createLocalEvent(input: CreateLocalEventInput) {
  const database = getBarklogDatabase();
  const eventCollection = database.get('events') as Collection<EventModel>;
  const now = Date.now();

  const event = await database.write(
    async () =>
      eventCollection.create((record) => {
        record.createdAt = toUnixTimestamp(input.createdAt) ?? now;
        record.details = input.details ?? {};
        record.dogId = input.dogId;
        record.loggedAt = toUnixTimestamp(input.loggedAt) ?? now;
        record.notes = input.notes ?? null;
        record.occurredAt = toUnixTimestamp(input.occurredAt) ?? now;
        record.photoUrl = input.photoUrl ?? null;
        record.synced = input.synced ?? false;
        record.type = input.type;
        record.userId = input.userId;
      }),
    'createLocalEvent',
  );

  await mergeBarklogSyncMetadata(database, {
    lastLocalWriteAt: now,
  });

  return event;
}
