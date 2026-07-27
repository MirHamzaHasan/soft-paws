import { getAuthRedirectTarget } from '@/features/auth/utils/authRouting';

import { makeUserRow } from '../../../../test/utils/builders';

const baseInput = {
  barklogUser: null,
  bootstrapStatus: 'ready' as const,
  contactPreferenceStatus: 'complete' as const,
  dismissedTrialExpiryPaywallForUserId: null,
  firstSegment: undefined,
  onboardingStatus: 'required' as const,
  rootNavigationReady: true,
  sessionStatus: 'signed_out' as const,
};

describe('auth routing decisions', () => {
  it('waits until root navigation and bootstrap are ready', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        rootNavigationReady: false,
      }),
    ).toBeNull();
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        bootstrapStatus: 'loading',
      }),
    ).toBeNull();
  });

  it('routes signed-out users to auth without redirect loops', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        firstSegment: '(tabs)',
      }),
    ).toBe('/(auth)/welcome');
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        firstSegment: '(auth)',
      }),
    ).toBeNull();
  });

  it('allows public vet share links without a signed-in session', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        firstSegment: 'vet-share',
      }),
    ).toBeNull();
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: 'vet-share',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
  });

  it('routes signed-in users without dogs to contact preferences first when needed', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        contactPreferenceStatus: 'required',
        firstSegment: '(tabs)',
        sessionStatus: 'signed_in',
      }),
    ).toBe('/(onboarding)/contact-preferences');
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        contactPreferenceStatus: 'required',
        firstSegment: '(onboarding)',
        secondSegment: 'contact-preferences',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
  });

  it('routes signed-in users without dogs to dog profile after contact preferences', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: '(tabs)',
        sessionStatus: 'signed_in',
      }),
    ).toBe('/(onboarding)/dog-profile');
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: '(onboarding)',
        secondSegment: 'dog-profile',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: '(onboarding)',
        secondSegment: 'contact-preferences',
        sessionStatus: 'signed_in',
      }),
    ).toBe('/(onboarding)/dog-profile');
  });

  it('routes fully onboarded signed-in users away from auth and onboarding', () => {
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: '(auth)',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toBe('/(tabs)');
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: makeUserRow(),
        firstSegment: '(tabs)',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
  });

  it('shows an expired-trial paywall once while preserving free mode after dismissal', () => {
    const expiredTrialUser = makeUserRow({
      subscription_tier: 'trial',
      trial_ends_at: '2026-04-25T00:00:00.000Z',
    });

    jest.useFakeTimers({
      now: new Date('2026-04-26T00:00:00.000Z'),
    });

    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: expiredTrialUser,
        firstSegment: '(tabs)',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toEqual({
      pathname: '/paywall',
      params: { reason: 'trial-ended' },
    });
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: expiredTrialUser,
        dismissedTrialExpiryPaywallForUserId: expiredTrialUser.id,
        firstSegment: '(tabs)',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: expiredTrialUser,
        firstSegment: 'paywall',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();
    expect(
      getAuthRedirectTarget({
        ...baseInput,
        barklogUser: expiredTrialUser,
        firstSegment: 'vet-share',
        onboardingStatus: 'complete',
        sessionStatus: 'signed_in',
      }),
    ).toBeNull();

    jest.useRealTimers();
  });
});
