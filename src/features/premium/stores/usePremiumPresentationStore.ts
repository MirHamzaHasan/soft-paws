import { create } from 'zustand';

type PremiumPresentationState = {
  dismissedTrialExpiryPaywallForUserId: string | null;
  dismissTrialExpiryPaywall: (userId: string) => void;
  resetTrialExpiryPaywallDismissal: () => void;
};

export const usePremiumPresentationStore = create<PremiumPresentationState>()(
  (set) => ({
    dismissedTrialExpiryPaywallForUserId: null,
    dismissTrialExpiryPaywall: (userId) =>
      set({ dismissedTrialExpiryPaywallForUserId: userId }),
    resetTrialExpiryPaywallDismissal: () =>
      set({ dismissedTrialExpiryPaywallForUserId: null }),
  }),
);
