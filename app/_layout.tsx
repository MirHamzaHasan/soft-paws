import '../tamagui.generated.css';

import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';

import { bootstrapLocalProfile } from '@/api/localProfile';
import { AppProviders } from '@/app/providers/AppProviders';
import { BarklogFeedbackProvider } from '@/components/ui';
import { LocalProfileNavigationGate } from '@/features/auth/components/LocalProfileNavigationGate';
import { useLocalProfileBootstrap } from '@/features/auth/hooks/useLocalProfileBootstrap';
import { configureMedicationNotificationHandler } from '@/features/medications/services/medicationReminderService';
import {
  identifyObservabilityUser,
  initializeObservability,
  ObservabilityBoundary,
  useRouteAnalytics,
} from '@/features/observability';
import { useLocalProfileStore } from '@/stores';
import { getNavigationTheme } from '@/theme/navigationTheme';

import { tamaguiConfig } from '../tamagui.config';

const interRegularFont = require('../assets/fonts/Inter_400Regular.ttf');
const interMediumFont = require('../assets/fonts/Inter_500Medium.ttf');

SplashScreen.preventAutoHideAsync().catch(() => {});

const styles = StyleSheet.create({
  bootstrapScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F3EE',
    paddingHorizontal: 24,
  },
  bootstrapTitle: {
    color: '#0A0A0A',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '500',
  },
  bootstrapBody: {
    color: '#687079',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    marginTop: 8,
    textAlign: 'center',
  },
});

function BootstrapFallback({
  error,
  retry,
}: {
  error?: string | null;
  retry?: () => void;
}) {
  return (
    <View style={styles.bootstrapScreen}>
      <Text style={styles.bootstrapTitle}>BarkLog</Text>
      <Text style={styles.bootstrapBody}>
        {error ?? 'Opening your care journal...'}
      </Text>
      {retry ? (
        <Pressable accessibilityRole="button" onPress={retry}>
          <Text style={styles.bootstrapBody}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Layout() {
  const colorScheme = useColorScheme();
  const profileStatus = useLocalProfileStore((state) => state.profileStatus);
  const profileError = useLocalProfileStore((state) => state.profileError);
  const setProfile = useLocalProfileStore((state) => state.setProfile);
  const setProfileError = useLocalProfileStore(
    (state) => state.setProfileError,
  );
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const [fontsLoaded] = useFonts({
    Inter_400Regular: interRegularFont,
    Inter_500Medium: interMediumFont,
  });
  const segments = useSegments();

  useLocalProfileBootstrap();
  useRouteAnalytics({
    enabled: fontsLoaded && profileStatus === 'ready',
  });

  useEffect(() => {
    initializeObservability();
    configureMedicationNotificationHandler();
  }, []);

  useEffect(() => {
    identifyObservabilityUser(
      barklogUser
        ? {
            id: barklogUser.id,
            plan: barklogUser.subscription_tier,
          }
        : null,
    );
  }, [barklogUser]);

  const activeRouteSegment = segments[0] as string | undefined;
  const isEmergencyRoute =
    activeRouteSegment === 'emergency' ||
    activeRouteSegment === 'emergency-sos' ||
    activeRouteSegment === 'first-aid' ||
    activeRouteSegment === 'safety' ||
    activeRouteSegment === 'safety-center' ||
    activeRouteSegment === 'toxicity';
  let theme: 'light' | 'dark' = 'light';

  if (!isEmergencyRoute && colorScheme === 'dark') {
    theme = 'dark';
  }

  useEffect(() => {
    if (fontsLoaded && profileStatus !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [profileStatus, fontsLoaded]);

  if (!fontsLoaded || profileStatus === 'loading') {
    return <BootstrapFallback />;
  }
  if (profileStatus === 'error') {
    return (
      <BootstrapFallback
        error={profileError}
        retry={() => {
          bootstrapLocalProfile()
            .then(setProfile)
            .catch((error: unknown) => {
              setProfileError(
                error instanceof Error
                  ? error.message
                  : 'Unable to open local care journal.',
              );
            });
        }}
      />
    );
  }

  return (
    <ObservabilityBoundary>
      <AppProviders>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
          <Theme name={theme}>
            <ThemeProvider
              value={getNavigationTheme(theme, {
                forceLight: isEmergencyRoute,
              })}
            >
              <BarklogFeedbackProvider>
                <LocalProfileNavigationGate />
                <Stack screenOptions={{ headerShown: false }} />
              </BarklogFeedbackProvider>
            </ThemeProvider>
          </Theme>
        </TamaguiProvider>
      </AppProviders>
    </ObservabilityBoundary>
  );
}
