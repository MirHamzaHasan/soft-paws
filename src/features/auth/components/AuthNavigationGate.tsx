import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { usePremiumPresentationStore } from "@/features/premium/stores/usePremiumPresentationStore";
import { useAuthSessionStore } from "@/stores";

import { getAuthRedirectTarget } from "../utils/authRouting";

export function AuthNavigationGate() {
  const router = useRouter();
  const segments = useSegments() as readonly string[];
  const rootNavigationState = useRootNavigationState();
  const bootstrapStatus = useAuthSessionStore((state) => state.bootstrapStatus);
  const onboardingStatus = useAuthSessionStore(
    (state) => state.onboardingStatus,
  );
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const contactPreferenceStatus = useAuthSessionStore(
    (state) => state.contactPreferenceStatus,
  );
  const sessionStatus = useAuthSessionStore((state) => state.sessionStatus);
  const dismissedTrialExpiryPaywallForUserId = usePremiumPresentationStore(
    (state) => state.dismissedTrialExpiryPaywallForUserId,
  );

  useEffect(() => {
    if (!rootNavigationState?.key || bootstrapStatus !== "ready") {
      return;
    }

    const target = getAuthRedirectTarget({
      barklogUser,
      bootstrapStatus,
      contactPreferenceStatus,
      dismissedTrialExpiryPaywallForUserId,
      firstSegment: segments[0],
      onboardingStatus,
      rootNavigationReady: Boolean(rootNavigationState.key),
      secondSegment: segments[1],
      sessionStatus,
    });

    if (target) {
      router.replace(target);
    }
  }, [
    barklogUser,
    bootstrapStatus,
    contactPreferenceStatus,
    dismissedTrialExpiryPaywallForUserId,
    onboardingStatus,
    rootNavigationState?.key,
    router,
    segments,
    sessionStatus,
  ]);

  return null;
}
