import { Redirect, Stack } from 'expo-router';

import { useAuthSessionStore } from '@/stores';

function getSignedInRedirectTarget({
  contactPreferenceStatus,
  onboardingStatus,
}: {
  contactPreferenceStatus: 'complete' | 'required';
  onboardingStatus: 'complete' | 'required';
}) {
  if (onboardingStatus === 'complete') {
    return '/(tabs)' as const;
  }

  if (contactPreferenceStatus === 'required') {
    return '/(onboarding)/contact-preferences' as const;
  }

  return '/(onboarding)/dog-profile' as const;
}

export default function AuthLayout() {
  const bootstrapStatus = useAuthSessionStore((state) => state.bootstrapStatus);
  const onboardingStatus = useAuthSessionStore(
    (state) => state.onboardingStatus,
  );
  const contactPreferenceStatus = useAuthSessionStore(
    (state) => state.contactPreferenceStatus,
  );
  const sessionStatus = useAuthSessionStore((state) => state.sessionStatus);

  if (bootstrapStatus !== 'ready') {
    return null;
  }

  if (sessionStatus === 'signed_in') {
    return (
      <Redirect
        href={getSignedInRedirectTarget({
          contactPreferenceStatus,
          onboardingStatus,
        })}
      />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
