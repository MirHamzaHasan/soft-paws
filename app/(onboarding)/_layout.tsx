import { Redirect, Stack } from 'expo-router';

import { useLocalProfileStore } from '@/stores';

export default function OnboardingLayout() {
  const profileStatus = useLocalProfileStore((state) => state.profileStatus);
  const onboardingStatus = useLocalProfileStore(
    (state) => state.onboardingStatus,
  );
  if (profileStatus === 'loading') {
    return null;
  }

  if (onboardingStatus === 'complete') {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
