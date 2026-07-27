import { Redirect, Stack, useSegments } from 'expo-router';

import { useAuthSessionStore } from '@/stores';

export default function OnboardingLayout() {
  const bootstrapStatus = useAuthSessionStore((state) => state.bootstrapStatus);
  const onboardingStatus = useAuthSessionStore(
    (state) => state.onboardingStatus,
  );
  const contactPreferenceStatus = useAuthSessionStore(
    (state) => state.contactPreferenceStatus,
  );
  const sessionStatus = useAuthSessionStore((state) => state.sessionStatus);
  const segments = useSegments();
  const onboardingRoute = String(segments[1] ?? '');

  if (bootstrapStatus !== 'ready') {
    return null;
  }

  if (sessionStatus === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboardingStatus === 'complete') {
    return <Redirect href="/(tabs)" />;
  }

  if (
    contactPreferenceStatus === 'required' &&
    onboardingRoute !== 'contact-preferences'
  ) {
    return <Redirect href="/(onboarding)/contact-preferences" />;
  }

  if (
    contactPreferenceStatus === 'complete' &&
    onboardingRoute === 'contact-preferences'
  ) {
    return <Redirect href="/(onboarding)/dog-profile" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
