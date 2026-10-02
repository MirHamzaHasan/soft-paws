import { Redirect, Tabs } from 'expo-router';

import { useLocalProfileStore } from '@/stores';

export default function TabsLayout() {
  const profileStatus = useLocalProfileStore((state) => state.profileStatus);
  const onboardingStatus = useLocalProfileStore(
    (state) => state.onboardingStatus,
  );
  if (profileStatus === 'loading') {
    return null;
  }

  if (onboardingStatus !== 'complete') {
    return <Redirect href="/(onboarding)/dog-profile" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
