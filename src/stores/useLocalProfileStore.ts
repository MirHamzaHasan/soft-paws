import { create } from 'zustand';

import type { BarklogDogRow, BarklogUserRow } from '@/api/localProfile';

export type BarklogOnboardingStatus = 'complete' | 'required';
export type BarklogProfileStatus = 'loading' | 'needs_onboarding' | 'ready' | 'error';

type LocalProfileState = {
  barklogUser: BarklogUserRow | null;
  dogs: BarklogDogRow[];
  onboardingStatus: BarklogOnboardingStatus;
  profileError: string | null;
  profileStatus: BarklogProfileStatus;
  selectedDogId: string | null;
  addDog: (dog: BarklogDogRow) => void;
  resetProfile: () => void;
  setBarklogUser: (user: BarklogUserRow) => void;
  setDogs: (dogs: BarklogDogRow[]) => void;
  setProfile: (profile: { barklogUser: BarklogUserRow; dogs: BarklogDogRow[] }) => void;
  setProfileError: (error: string) => void;
  setSelectedDogId: (dogId: string | null) => void;
};

export function deriveOnboardingStatus(dogs: BarklogDogRow[]): BarklogOnboardingStatus {
  return dogs.length > 0 ? 'complete' : 'required';
}

export function getPrimaryDog(dogs: BarklogDogRow[]) {
  return dogs.find((dog) => dog.is_primary) ?? dogs[0] ?? null;
}

export function getSelectedDog(dogs: BarklogDogRow[], selectedDogId: string | null) {
  return dogs.find((dog) => dog.id === selectedDogId) ?? getPrimaryDog(dogs);
}

function selectedDogIdFor(dogs: BarklogDogRow[], current: string | null) {
  return getSelectedDog(dogs, current)?.id ?? null;
}

const initialState = {
  barklogUser: null,
  dogs: [],
  onboardingStatus: 'required' as const,
  profileError: null,
  profileStatus: 'loading' as const,
  selectedDogId: null,
};

export const useLocalProfileStore = create<LocalProfileState>()((set) => ({
  ...initialState,
  addDog: (dog) => set((state) => {
    const dogs = [...state.dogs.filter((item) => item.id !== dog.id), dog];
    return {
      dogs,
      onboardingStatus: 'complete',
      profileStatus: 'ready',
      selectedDogId: dog.id,
    };
  }),
  resetProfile: () => set(initialState),
  setBarklogUser: (barklogUser) => set({ barklogUser }),
  setDogs: (dogs) => set((state) => ({
    dogs,
    onboardingStatus: deriveOnboardingStatus(dogs),
    profileStatus: dogs.length ? 'ready' : 'needs_onboarding',
    selectedDogId: selectedDogIdFor(dogs, state.selectedDogId),
  })),
  setProfile: ({ barklogUser, dogs }) => set((state) => ({
    barklogUser,
    dogs,
    onboardingStatus: deriveOnboardingStatus(dogs),
    profileError: null,
    profileStatus: dogs.length ? 'ready' : 'needs_onboarding',
    selectedDogId: selectedDogIdFor(dogs, state.selectedDogId),
  })),
  setProfileError: (profileError) => set({ profileError, profileStatus: 'error' }),
  setSelectedDogId: (dogId) => set((state) => ({
    selectedDogId: selectedDogIdFor(state.dogs, dogId),
  })),
}));
