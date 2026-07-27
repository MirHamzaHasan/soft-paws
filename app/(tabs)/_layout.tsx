import { Redirect, Tabs } from 'expo-router';

import { useAuthSessionStore } from '@/stores';

export default function TabsLayout() {
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

  if (sessionStatus === 'signed_out') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (onboardingStatus !== 'complete') {
    return (
      <Redirect
        href={
          contactPreferenceStatus === 'required'
            ? '/(onboarding)/contact-preferences'
            : '/(onboarding)/dog-profile'
        }
      />
    );
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
