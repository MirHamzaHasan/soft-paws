/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import type { PhotoBaselineCategory } from '@/types/photoBaseline';

import { getBarklogDatabase } from '../database';
import type { PhotoBaselineModel } from '../models';

export type LocalPhotoBaselineInput = {
  bodyArea?: string | null;
  capturedAt?: Date | number;
  category: PhotoBaselineCategory;
  dogId: string;
  notes?: string | null;
  photoUri?: string | null;
  title: string;
  userId: string;
};

function getPhotoBaselineCollection() {
  return getBarklogDatabase().get(
    'photo_baselines',
  ) as Collection<PhotoBaselineModel>;
}

function normalizeTimestamp(input: Date | number | undefined) {
  if (input instanceof Date) {
    return input.getTime();
  }

  if (typeof input === 'number') {
    return input;
  }

  return Date.now();
}

export function createPhotoBaselineAttachmentUri(
  category: PhotoBaselineCategory,
) {
  return `local-photo://baseline/${category}/${Date.now()}`;
}

export async function listLocalPhotoBaselinesForDog(dogId: string) {
  return getPhotoBaselineCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.sortBy('captured_at', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}

export async function listLocalPhotoBaselinesForDogCategory(
  dogId: string,
  category: PhotoBaselineCategory,
) {
  return getPhotoBaselineCollection()
    .query(
      Q.where('dog_id', dogId),
      Q.where('category', category),
      Q.sortBy('captured_at', Q.desc),
      Q.sortBy('created_at', Q.desc),
    )
    .fetch();
}

export async function createLocalPhotoBaseline(input: LocalPhotoBaselineInput) {
  const database = getBarklogDatabase();
  const collection = getPhotoBaselineCollection();
  const now = Date.now();

  const photoBaseline = await database.write(
    async () =>
      collection.create((record) => {
        record.bodyArea = input.bodyArea?.trim() || null;
        record.capturedAt = normalizeTimestamp(input.capturedAt);
        record.category = input.category;
        record.createdAt = now;
        record.dogId = input.dogId;
        record.notes = input.notes?.trim() || null;
        record.photoUri = input.photoUri?.trim() || null;
        record.title = input.title.trim();
        record.userId = input.userId;
      }),
    'createLocalPhotoBaseline',
  );


  return photoBaseline;
}

export async function deleteLocalPhotoBaseline(photoBaselineId: string) {
  const database = getBarklogDatabase();
  const collection = getPhotoBaselineCollection();

  await database.write(async () => {
    const existingPhotoBaseline = await collection.find(photoBaselineId);
    await existingPhotoBaseline.destroyPermanently();
  }, 'deleteLocalPhotoBaseline');

}
