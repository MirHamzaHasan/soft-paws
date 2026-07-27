import type { BarklogUserRow } from '@/api/auth';
import type {
  BarklogAuthBootstrapStatus,
  BarklogAuthSessionStatus,
  BarklogOnboardingStatus,
} from '@/stores/useAuthSessionStore';

import { shouldPromptForExpiredTrial } from '../../premium/utils/premiumAccess';

type TrialEndedPaywallTarget = {
  params: {
    reason: 'trial-ended';
  };
  pathname: '/paywall';
};

export type AuthRedirectTarget =
  | '/(auth)/welcome'
  | '/(onboarding)/contact-preferences'
  | '/(onboarding)/dog-profile'
  | '/(tabs)'
  | TrialEndedPaywallTarget;

export type AuthRouteDecisionInput = {
  barklogUser: BarklogUserRow | null;
  bootstrapStatus: BarklogAuthBootstrapStatus;
  contactPreferenceStatus: 'complete' | 'required';
  dismissedTrialExpiryPaywallForUserId: string | null;
  firstSegment: string | undefined;
  onboardingStatus: BarklogOnboardingStatus;
  rootNavigationReady: boolean;
  secondSegment?: string | undefined;
  sessionStatus: BarklogAuthSessionStatus;
};

const paidRouteSegments = new Set(['paywall', 'premium-gate', 'subscription']);
const publicRouteSegments = new Set(['vet-share']);

export function getAuthRedirectTarget(
  input: AuthRouteDecisionInput,
): AuthRedirectTarget | null {
  if (!input.rootNavigationReady || input.bootstrapStatus !== 'ready') {
    return null;
  }

  const inAuthGroup = input.firstSegment === '(auth)';
  const inOnboardingGroup = input.firstSegment === '(onboarding)';
  const isSignedIn = input.sessionStatus === 'signed_in';
  const isPublicRoute = publicRouteSegments.has(input.firstSegment ?? '');

  if (!isSignedIn) {
    return inAuthGroup || isPublicRoute ? null : '/(auth)/welcome';
  }

  if (isPublicRoute) {
    return null;
  }

  if (input.onboardingStatus !== 'complete') {
    if (input.contactPreferenceStatus === 'required') {
      return inOnboardingGroup && input.secondSegment === 'contact-preferences'
        ? null
        : '/(onboarding)/contact-preferences';
    }

    return inOnboardingGroup && input.secondSegment !== 'contact-preferences'
      ? null
      : '/(onboarding)/dog-profile';
  }

  if (inAuthGroup || inOnboardingGroup) {
    return '/(tabs)';
  }

  if (
    shouldPromptForExpiredTrial(input.barklogUser) &&
    input.barklogUser?.id !== input.dismissedTrialExpiryPaywallForUserId &&
    !paidRouteSegments.has(input.firstSegment ?? '') &&
    !isPublicRoute
  ) {
    return {
      pathname: '/paywall',
      params: { reason: 'trial-ended' },
    };
  }

  return null;
}
