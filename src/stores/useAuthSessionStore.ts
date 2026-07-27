import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { BarklogDogRow, BarklogUserRow } from '@/api/auth';
import type { BarklogContactPreferenceStatus } from '@/api/contactPreferences';

export type BarklogAuthSessionStatus = 'signed_in' | 'signed_out';
export type BarklogAuthBootstrapStatus = 'loading' | 'ready';
export type BarklogOnboardingStatus = 'complete' | 'required';

type AuthSessionSnapshot = {
  barklogUser: BarklogUserRow;
  contactPreferenceStatus?: BarklogContactPreferenceStatus;
  dogs: BarklogDogRow[];
  session: Session;
};

type BarklogAuthSessionState = {
  authError: string | null;
  barklogUser: BarklogUserRow | null;
  bootstrapStatus: BarklogAuthBootstrapStatus;
  contactPreferenceStatus: BarklogContactPreferenceStatus;
  dogs: BarklogDogRow[];
  onboardingStatus: BarklogOnboardingStatus;
  selectedDogId: string | null;
  session: Session | null;
  sessionStatus: BarklogAuthSessionStatus;
  addDog: (dog: BarklogDogRow) => void;
  setBootstrapping: () => void;
  setBarklogUser: (barklogUser: BarklogUserRow) => void;
  setContactPreferenceStatus: (
    contactPreferenceStatus: BarklogContactPreferenceStatus,
  ) => void;
  setDogs: (dogs: BarklogDogRow[]) => void;
  setSelectedDogId: (dogId: string | null) => void;
  setSignedIn: (snapshot: AuthSessionSnapshot) => void;
  setSignedOut: (error?: string | null) => void;
};

export function deriveOnboardingStatus(dogs: BarklogDogRow[]) {
  return dogs.length > 0 ? 'complete' : 'required';
}

export function getPrimaryDog(dogs: BarklogDogRow[]) {
  return dogs.find((dog) => dog.is_primary) ?? dogs[0] ?? null;
}

export function getSelectedDog(
  dogs: BarklogDogRow[],
  selectedDogId: string | null,
) {
  return dogs.find((dog) => dog.id === selectedDogId) ?? getPrimaryDog(dogs);
}

function deriveSelectedDogId(
  dogs: BarklogDogRow[],
  selectedDogId: string | null,
) {
  return getSelectedDog(dogs, selectedDogId)?.id ?? null;
}

export const useAuthSessionStore = create<BarklogAuthSessionState>()((set) => ({
  authError: null,
  barklogUser: null,
  bootstrapStatus: 'loading',
  contactPreferenceStatus: 'required',
  dogs: [],
  onboardingStatus: 'required',
  selectedDogId: null,
  session: null,
  sessionStatus: 'signed_out',
  addDog: (dog) =>
    set((state) => {
      const dogs = [...state.dogs.filter((item) => item.id !== dog.id), dog];

      return {
        dogs,
        onboardingStatus: deriveOnboardingStatus(dogs),
        selectedDogId: dog.id,
      };
    }),
  setBootstrapping: () =>
    set((state) => ({
      ...state,
      authError: null,
      bootstrapStatus: 'loading',
    })),
  setBarklogUser: (barklogUser) => set({ barklogUser }),
  setContactPreferenceStatus: (contactPreferenceStatus) =>
    set({ contactPreferenceStatus }),
  setDogs: (dogs) =>
    set((state) => ({
      dogs,
      onboardingStatus: deriveOnboardingStatus(dogs),
      selectedDogId: deriveSelectedDogId(dogs, state.selectedDogId),
    })),
  setSelectedDogId: (dogId) =>
    set((state) => ({
      selectedDogId: deriveSelectedDogId(state.dogs, dogId),
    })),
  setSignedIn: ({ session, barklogUser, contactPreferenceStatus, dogs }) =>
    set((state) => ({
      authError: null,
      barklogUser,
      bootstrapStatus: 'ready',
      contactPreferenceStatus:
        contactPreferenceStatus ?? (dogs.length > 0 ? 'complete' : 'required'),
      dogs,
      onboardingStatus: deriveOnboardingStatus(dogs),
      selectedDogId: deriveSelectedDogId(dogs, state.selectedDogId),
      session,
      sessionStatus: 'signed_in',
    })),
  setSignedOut: (error) =>
    set({
      authError: error ?? null,
      barklogUser: null,
      bootstrapStatus: 'ready',
      contactPreferenceStatus: 'required',
      dogs: [],
      onboardingStatus: 'required',
      selectedDogId: null,
      session: null,
      sessionStatus: 'signed_out',
    }),
}));
