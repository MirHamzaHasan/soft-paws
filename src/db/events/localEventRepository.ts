/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import type { Json } from '@/types/local';

import { getBarklogDatabase } from '../database';
import type { EventModel } from '../models';

type UpdateLocalEventInput = {
  details?: Json;
  eventId: string;
  notes?: string | null;
  occurredAt?: number;
  photoUrl?: string | null;
};

function getEventCollection() {
  return getBarklogDatabase().get('events') as Collection<EventModel>;
}

export async function getLocalEventById(eventId: string) {
  try {
    return await getEventCollection().find(eventId);
  } catch {
    return null;
  }
}

export async function listLocalEventsForDogDate(input: {
  dogId: string;
  endAt: number;
  startAt: number;
}) {
  const { dogId, endAt, startAt } = input;

  return getEventCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.where('occurred_at', Q.gte(startAt)),
      Q.where('occurred_at', Q.lt(endAt)),
      Q.sortBy('occurred_at', Q.desc),
    )
    .fetch();
}

export async function listLocalEventsForDogRange(input: {
  dogId: string;
  endAt: number;
  startAt: number;
}) {
  const { dogId, endAt, startAt } = input;

  return getEventCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.where('occurred_at', Q.gte(startAt)),
      Q.where('occurred_at', Q.lt(endAt)),
      Q.sortBy('occurred_at', Q.desc),
    )
    .fetch();
}

export async function listLocalEventsForDog(dogId: string) {
  return getEventCollection()
    .query(Q.where('dog_id', dogId), Q.sortBy('occurred_at', Q.desc))
    .fetch();
}

export async function updateLocalEvent(input: UpdateLocalEventInput) {
  const database = getBarklogDatabase();
  const eventCollection = getEventCollection();

  const event = await database.write(async () => {
    const existingEvent = await eventCollection.find(input.eventId);

    return existingEvent.update((record) => {
      if (input.details !== undefined) {
        record.details = input.details;
      }

      if (input.notes !== undefined) {
        record.notes = input.notes;
      }

      if (input.occurredAt !== undefined) {
        record.occurredAt = input.occurredAt;
      }

      if (input.photoUrl !== undefined) {
        record.photoUrl = input.photoUrl;
      }

    });
  }, 'updateLocalEvent');


  return event;
}

export async function deleteLocalEvent(eventId: string) {
  const database = getBarklogDatabase();
  const eventCollection = getEventCollection();

  await database.write(async () => {
    const existingEvent = await eventCollection.find(eventId);
    await existingEvent.destroyPermanently();
  }, 'deleteLocalEvent');

}
