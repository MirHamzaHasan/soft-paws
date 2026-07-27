import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import type { OnboardingDraftState } from '@/stores';
import type { Database } from '@/types/supabase';

import {
  type BarklogContactPreferenceStatus,
  getContactPreferenceStatus,
} from './contactPreferences';
import { getSupabaseClient } from './supabaseClient';

export type BarklogUserRow = Database['public']['Tables']['users']['Row'];
export type BarklogDogRow = Database['public']['Tables']['dogs']['Row'];
type BarklogDogInsert = Database['public']['Tables']['dogs']['Insert'];
type BarklogDogSex = NonNullable<BarklogDogInsert['sex']>;

export type CreateDogProfileInput = {
  age?: string;
  breed?: string;
  name: string;
  sex?: BarklogDogSex;
  weight?: string;
};

export type BarklogBootstrapResult = {
  barklogUser: BarklogUserRow;
  contactPreferenceStatus: BarklogContactPreferenceStatus;
  dogs: BarklogDogRow[];
  onboardingStatus: 'complete' | 'required';
  session: Session;
};

export type BarklogSignUpResult =
  | {
      bootstrap: BarklogBootstrapResult;
      requiresEmailConfirmation: false;
    }
  | {
      bootstrap: null;
      requiresEmailConfirmation: true;
    };

export const BARKLOG_TRIAL_DURATION_DAYS = 7;

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function deriveOnboardingStatus(dogs: BarklogDogRow[]) {
  return dogs.length > 0 ? 'complete' : 'required';
}

function assertDogsBelongToUser(
  dogs: BarklogDogRow[],
  userId: string,
): BarklogDogRow[] {
  const mismatchedDog = dogs.find((dog) => dog.user_id !== userId);

  if (mismatchedDog) {
    throw new Error('Dog ownership mismatch while restoring BarkLog data');
  }

  return dogs;
}

function mapDogSex(draft: OnboardingDraftState): BarklogDogInsert['sex'] {
  if (draft.sex === 'female' && draft.status === 'spayed') {
    return 'spayed_female';
  }

  if (draft.sex === 'male' && draft.status === 'neutered') {
    return 'neutered_male';
  }

  return draft.sex;
}

function parseWeightToLbs(draft: OnboardingDraftState) {
  const parsedWeight = Number.parseFloat(draft.weight);

  if (!Number.isFinite(parsedWeight)) {
    return null;
  }

  const weightInLbs =
    draft.weightUnit === 'kg' ? parsedWeight * 2.2046226218 : parsedWeight;

  return Math.round(weightInLbs * 100) / 100;
}

function parseDogWeightToLbs(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  const parsedWeight = Number.parseFloat(normalizedValue);

  if (!Number.isFinite(parsedWeight)) {
    return null;
  }

  const weightInLbs = normalizedValue.includes('kg')
    ? parsedWeight * 2.2046226218
    : parsedWeight;

  return Math.round(weightInLbs * 100) / 100;
}

function parseDogBirthdateFromAge(age: string | undefined) {
  if (!age) {
    return null;
  }

  const normalizedAge = age.trim().toLowerCase();
  const parsedAge = Number.parseFloat(normalizedAge);

  if (!Number.isFinite(parsedAge) || parsedAge < 0) {
    return null;
  }

  const birthdate = new Date();
  const monthCount = normalizedAge.includes('mo')
    ? Math.round(parsedAge)
    : Math.round(parsedAge * 12);

  birthdate.setMonth(birthdate.getMonth() - monthCount);

  return birthdate.toISOString().slice(0, 10);
}

function getReadableAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again.';
  }

  if (
    error.message === 'Invalid login credentials' ||
    error.message === 'Email not confirmed'
  ) {
    return 'Invalid email or password';
  }

  if (error.message.includes('User already registered')) {
    return 'An account with this email already exists';
  }

  return error.message;
}

async function readCurrentUserRow(authUserId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function attemptReadCurrentUserRow(
  authUserId: string,
  attemptsLeft: number,
) {
  const data = await readCurrentUserRow(authUserId);

  if (data || attemptsLeft <= 1) {
    return data;
  }

  await sleep(250);

  return attemptReadCurrentUserRow(authUserId, attemptsLeft - 1);
}

async function ensureCurrentUserRow(authUser: User) {
  const supabase = getSupabaseClient();
  const existingUser = await attemptReadCurrentUserRow(authUser.id, 3);

  if (existingUser) {
    return existingUser;
  }

  const { email } = authUser;

  if (!email) {
    throw new Error('Missing email address for authenticated user');
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        email,
        id: authUser.id,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function fetchDogsForUser(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return assertDogsBelongToUser(data ?? [], userId);
}

function userNeedsTrialInitialization(user: BarklogUserRow) {
  if (user.subscription_tier === 'active') {
    return false;
  }

  if (user.subscription_tier === 'grandfathered') {
    return false;
  }

  if (user.subscription_tier === 'expired') {
    return false;
  }

  return !user.trial_ends_at;
}

async function ensureUserLifecycle(user: BarklogUserRow) {
  if (!userNeedsTrialInitialization(user)) {
    return user;
  }

  const supabase = getSupabaseClient();
  const trialEndsAt = new Date(
    Date.now() + BARKLOG_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'trial',
      trial_ends_at: trialEndsAt,
    })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function bootstrapAuthenticatedSession(
  session: Session,
): Promise<BarklogBootstrapResult> {
  const barklogUser = await ensureUserLifecycle(
    await ensureCurrentUserRow(session.user),
  );
  const dogs = await fetchDogsForUser(barklogUser.id);
  const contactPreferenceStatus = await getContactPreferenceStatus(
    barklogUser.id,
  );

  return {
    barklogUser,
    contactPreferenceStatus,
    dogs,
    onboardingStatus: deriveOnboardingStatus(dogs),
    session,
  };
}

export async function signInWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }

  if (!data.session) {
    throw new Error('Unable to establish a session');
  }

  return bootstrapAuthenticatedSession(data.session);
}

export async function signUpWithEmailPassword(input: {
  email: string;
  password: string;
}): Promise<BarklogSignUpResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp(input);

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }

  let { session } = data;

  if (!session) {
    const signInResult = await supabase.auth.signInWithPassword(input);

    if (signInResult.error || !signInResult.data.session) {
      return {
        bootstrap: null,
        requiresEmailConfirmation: true,
      };
    }

    session = signInResult.data.session;
  }

  return {
    bootstrap: await bootstrapAuthenticatedSession(session),
    requiresEmailConfirmation: false,
  };
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = getSupabaseClient();
  const redirectTo = Linking.createURL('/sign-in');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }
}

export async function completeOnboardingForCurrentUser(
  session: Session,
  draft: OnboardingDraftState,
) {
  const supabase = getSupabaseClient();
  const barklogUser = await ensureUserLifecycle(
    await ensureCurrentUserRow(session.user),
  );
  const trimmedName = draft.name.trim();

  if (!trimmedName) {
    throw new Error('Dog name is required');
  }

  const { data: createdDog, error } = await supabase
    .from('dogs')
    .insert({
      breed: draft.breed.trim() || null,
      id: undefined,
      is_primary: true,
      name: trimmedName,
      photo_url: null,
      sex: mapDogSex(draft),
      user_id: barklogUser.id,
      weight_lbs: parseWeightToLbs(draft),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }

  const existingDogs = await fetchDogsForUser(barklogUser.id);
  let dogs = existingDogs;

  if (createdDog && !dogs.some((dog) => dog.id === createdDog.id)) {
    dogs = [...dogs, createdDog];
  }

  return {
    barklogUser,
    contactPreferenceStatus: await getContactPreferenceStatus(barklogUser.id),
    dogs,
    onboardingStatus: deriveOnboardingStatus(dogs),
    session,
  } satisfies BarklogBootstrapResult;
}

export async function createDogForCurrentUser(
  session: Session,
  input: CreateDogProfileInput,
) {
  const supabase = getSupabaseClient();
  const barklogUser = await ensureUserLifecycle(
    await ensureCurrentUserRow(session.user),
  );
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    throw new Error('Dog name is required');
  }

  const { data: createdDog, error } = await supabase
    .from('dogs')
    .insert({
      birthdate: parseDogBirthdateFromAge(input.age),
      breed: input.breed?.trim() || null,
      is_primary: false,
      name: trimmedName,
      photo_url: null,
      sex: input.sex ?? null,
      user_id: barklogUser.id,
      weight_lbs: parseDogWeightToLbs(input.weight),
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }

  const dogs = await fetchDogsForUser(barklogUser.id);
  const resolvedDogs =
    createdDog && !dogs.some((dog) => dog.id === createdDog.id)
      ? [...dogs, createdDog]
      : dogs;

  return {
    dog: createdDog,
    dogs: assertDogsBelongToUser(resolvedDogs, barklogUser.id),
  };
}

export async function signOutCurrentUser() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(getReadableAuthErrorMessage(error));
  }
}
