import { create } from 'zustand';

export type OnboardingDogSexValue = 'female' | 'male';
export type OnboardingDogStatusValue = 'neutered' | 'spayed' | null;
export type OnboardingWeightUnitValue = 'kg' | 'lb';

export type OnboardingDraftState = {
  age: string;
  breed: string;
  healthSyncEnabled: boolean;
  name: string;
  notificationsEnabled: boolean;
  sex: OnboardingDogSexValue;
  status: OnboardingDogStatusValue;
  weight: string;
  weightUnit: OnboardingWeightUnitValue;
};

type OnboardingDraftStore = OnboardingDraftState & {
  patchDraft: (patch: Partial<OnboardingDraftState>) => void;
  resetDraft: () => void;
};

export const defaultOnboardingDraft: OnboardingDraftState = {
  age: '',
  breed: '',
  healthSyncEnabled: false,
  name: '',
  notificationsEnabled: true,
  sex: 'male',
  status: null,
  weight: '',
  weightUnit: 'lb',
};

export const useOnboardingDraftStore = create<OnboardingDraftStore>()(
  (set) => ({
    ...defaultOnboardingDraft,
    patchDraft: (patch) => set((state) => ({ ...state, ...patch })),
    resetDraft: () => set(defaultOnboardingDraft),
  }),
);
