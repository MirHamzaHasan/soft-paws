import '../tamagui.generated.css';

import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';

import { AppProviders } from '@/app/providers/AppProviders';
import { BarklogFeedbackProvider } from '@/components/ui';
import { useBarklogSyncLifecycle } from '@/db';
import { AuthNavigationGate } from '@/features/auth/components/AuthNavigationGate';
import { useAuthSessionBootstrap } from '@/features/auth/hooks/useAuthSessionBootstrap';
import { configureMedicationNotificationHandler } from '@/features/medications/services/medicationReminderService';
import {
  identifyObservabilityUser,
  initializeObservability,
  ObservabilityBoundary,
  useRouteAnalytics,
} from '@/features/observability';
import { useAuthSessionStore } from '@/stores';
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

function BootstrapFallback() {
  return (
    <View style={styles.bootstrapScreen}>
      <Text style={styles.bootstrapTitle}>BarkLog</Text>
      <Text style={styles.bootstrapBody}>Opening your care journal...</Text>
    </View>
  );
}

export default function Layout() {
  const colorScheme = useColorScheme();
  const authBootstrapStatus = useAuthSessionStore(
    (state) => state.bootstrapStatus,
  );
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const [fontsLoaded] = useFonts({
    Inter_400Regular: interRegularFont,
    Inter_500Medium: interMediumFont,
  });
  const segments = useSegments();

  useAuthSessionBootstrap();
  useBarklogSyncLifecycle();
  useRouteAnalytics({
    enabled: fontsLoaded && authBootstrapStatus === 'ready',
  });

  useEffect(() => {
    initializeObservability();
    configureMedicationNotificationHandler();
  }, []);

  useEffect(() => {
    identifyObservabilityUser(
      barklogUser
        ? {
            email: barklogUser.email,
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
    if (fontsLoaded && authBootstrapStatus === 'ready') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authBootstrapStatus, fontsLoaded]);

  if (!fontsLoaded || authBootstrapStatus !== 'ready') {
    return <BootstrapFallback />;
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
                <AuthNavigationGate />
                <Stack screenOptions={{ headerShown: false }} />
              </BarklogFeedbackProvider>
            </ThemeProvider>
          </Theme>
        </TamaguiProvider>
      </AppProviders>
    </ObservabilityBoundary>
  );
}
