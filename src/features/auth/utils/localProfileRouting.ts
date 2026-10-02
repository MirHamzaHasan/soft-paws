import type { BarklogProfileStatus } from '@/stores/useLocalProfileStore';

export function getLocalProfileRedirectTarget(input: {
  firstSegment: string | undefined;
  profileStatus: BarklogProfileStatus;
  rootNavigationReady: boolean;
}): '/(onboarding)/dog-profile' | '/(tabs)' | null {
  if (!input.rootNavigationReady || input.profileStatus === 'loading') return null;
  if (input.profileStatus === 'needs_onboarding') {
    return input.firstSegment === '(onboarding)' ? null : '/(onboarding)/dog-profile';
  }
  if (input.firstSegment === '(onboarding)' || input.firstSegment === '(auth)') return '/(tabs)';
  return null;
}
