/* eslint-disable no-param-reassign */
import { type Collection, Q } from '@nozbe/watermelondb';

import { getBarklogDatabase } from '@/db/database';
import { FREE_V1_RELEASE } from '@/config/releaseMode';
import type { DogModel, UserModel } from '@/db/models';
import type { OnboardingDraftState } from '@/stores/useOnboardingDraftStore';
import type { Database } from '@/types/local';

export type BarklogUserRow = Database['public']['Tables']['users']['Row'];
export type BarklogDogRow = Database['public']['Tables']['dogs']['Row'];
export type CreateDogProfileInput = {
  age?: string;
  breed?: string;
  name: string;
  sex?: BarklogDogRow['sex'];
  weight?: string;
};

export const BARKLOG_TRIAL_DURATION_DAYS = 7;

function userCollection() {
  return getBarklogDatabase().get('users') as Collection<UserModel>;
}

function dogCollection() {
  return getBarklogDatabase().get('dogs') as Collection<DogModel>;
}

function toUserRow(user: UserModel): BarklogUserRow {
  return {
    id: user.id,
    email: user.email,
    created_at: new Date(user.createdAt).toISOString(),
    revenuecat_user_id: user.revenuecatUserId,
    subscription_tier: user.subscriptionTier,
    trial_ends_at: user.trialEndsAt
      ? new Date(user.trialEndsAt).toISOString()
      : null,
  };
}

function toDogRow(dog: DogModel): BarklogDogRow {
  return {
    id: dog.id,
    user_id: dog.userId,
    name: dog.name,
    breed: dog.breed,
    birthdate: dog.birthdate,
    weight_lbs: dog.weightLbs,
    sex: dog.sex,
    photo_url: dog.photoUrl,
    is_primary: dog.isPrimary,
    created_at: new Date(dog.createdAt).toISOString(),
  };
}

function parseWeight(value: string | undefined, unit: 'kg' | 'lb' = 'lb') {
  const weight = Number.parseFloat(value ?? '');
  if (!Number.isFinite(weight) || weight <= 0) return null;
  return (
    Math.round((unit === 'kg' ? weight * 2.2046226218 : weight) * 100) / 100
  );
}

function parseBirthdate(age: string | undefined) {
  const years = Number.parseFloat(age ?? '');
  if (!Number.isFinite(years) || years < 0) return null;
  const date = new Date();
  date.setMonth(date.getMonth() - Math.round(years * 12));
  return date.toISOString().slice(0, 10);
}

function mapDraftSex(draft: OnboardingDraftState): BarklogDogRow['sex'] {
  if (draft.sex === 'female' && draft.status === 'spayed')
    return 'spayed_female';
  if (draft.sex === 'male' && draft.status === 'neutered')
    return 'neutered_male';
  return draft.sex;
}

let pendingOwner: Promise<BarklogUserRow> | null = null;

async function readOrCreateLocalOwner(): Promise<BarklogUserRow> {
  const users = await userCollection().query().fetch();
  if (users[0]) return toUserRow(users[0]);

  const now = Date.now();
  const user = await getBarklogDatabase().write(() =>
    userCollection().create((record) => {
      record.email = '';
      record.createdAt = now;
      record.subscriptionTier = FREE_V1_RELEASE ? null : 'trial';
      record.trialEndsAt = FREE_V1_RELEASE
        ? null
        : now + BARKLOG_TRIAL_DURATION_DAYS * 86_400_000;
      record.revenuecatUserId = null;
    }),
  );
  return toUserRow(user);
}

export function getOrCreateLocalOwner(): Promise<BarklogUserRow> {
  if (!pendingOwner) {
    pendingOwner = readOrCreateLocalOwner().finally(() => {
      pendingOwner = null;
    });
  }
  return pendingOwner;
}

export async function listLocalDogs(userId: string): Promise<BarklogDogRow[]> {
  const dogs = await dogCollection()
    .query(Q.where('user_id', userId), Q.sortBy('created_at', Q.asc))
    .fetch();
  return dogs.map(toDogRow);
}

export async function bootstrapLocalProfile() {
  const barklogUser = await getOrCreateLocalOwner();
  const dogs = await listLocalDogs(barklogUser.id);
  return {
    barklogUser,
    dogs,
    onboardingStatus: dogs.length
      ? ('complete' as const)
      : ('required' as const),
  };
}

async function createDog(input: {
  birthdate: string | null;
  breed: string | null;
  isPrimary: boolean;
  name: string;
  sex: BarklogDogRow['sex'];
  userId: string;
  weightLbs: number | null;
}) {
  const name = input.name.trim();
  if (!name) throw new Error('Dog name is required');
  const now = Date.now();
  const dog = await getBarklogDatabase().write(() =>
    dogCollection().create((record) => {
      record.userId = input.userId;
      record.name = name;
      record.breed = input.breed;
      record.birthdate = input.birthdate;
      record.weightLbs = input.weightLbs;
      record.sex = input.sex;
      record.photoUrl = null;
      record.isPrimary = input.isPrimary;
      record.createdAt = now;
    }),
  );
  return toDogRow(dog);
}

export async function completeOnboardingForCurrentUser(
  userId: string,
  draft: OnboardingDraftState,
) {
  const dog = await createDog({
    birthdate: parseBirthdate(draft.age),
    breed: draft.breed.trim() || null,
    isPrimary: true,
    name: draft.name,
    sex: mapDraftSex(draft),
    userId,
    weightLbs: parseWeight(draft.weight, draft.weightUnit),
  });
  return { dog, dogs: await listLocalDogs(userId) };
}

export async function createDogForCurrentUser(
  userId: string,
  input: CreateDogProfileInput,
) {
  const dog = await createDog({
    birthdate: parseBirthdate(input.age),
    breed: input.breed?.trim() || null,
    isPrimary: false,
    name: input.name,
    sex: input.sex ?? null,
    userId,
    weightLbs: parseWeight(
      input.weight,
      input.weight?.includes('kg') ? 'kg' : 'lb',
    ),
  });
  return { dog, dogs: await listLocalDogs(userId) };
}

export async function updateLocalUserSubscription(input: {
  userId: string;
  subscriptionTier: BarklogUserRow['subscription_tier'];
  revenueCatUserId: string;
}): Promise<BarklogUserRow> {
  const user = await userCollection().find(input.userId);
  await getBarklogDatabase().write(() =>
    user.update((record) => {
      record.subscriptionTier = input.subscriptionTier;
      record.revenuecatUserId = input.revenueCatUserId;
    }),
  );
  return toUserRow(user);
}

export async function deleteAllLocalData() {
  await getBarklogDatabase().write(() =>
    getBarklogDatabase().unsafeResetDatabase(),
  );
}
