import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { OnboardingCirclePlate } from '../../onboarding/components/OnboardingCirclePlate';
import { PremiumLockIcon } from '../components/PremiumIcons';
import { PREMIUM_FEATURES } from '../data/premiumCatalog';
import type { PremiumFeatureKey } from '../utils/premiumAccess';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(236, 236, 236, 0.92)',
  },
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundStub: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 40,
    paddingHorizontal: 24,
    gap: 34,
  },
  sheet: {
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 34,
    gap: 24,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '400',
    letterSpacing: -1.6,
    textAlign: 'center',
  },
  body: {
    color: '#5D656D',
    fontSize: 18,
    lineHeight: 32,
    fontWeight: '400',
    textAlign: 'center',
  },
  maybeLater: {
    color: '#6E757D',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default function PremiumGateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ feature?: string }>();
  const featureKey =
    params.feature && params.feature in PREMIUM_FEATURES
      ? (params.feature as PremiumFeatureKey)
      : 'weekly-insights';
  const feature = PREMIUM_FEATURES[featureKey];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.screen}>
          <View style={styles.backgroundStub} pointerEvents="none">
            <View
              style={{
                height: 74,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
            />
            <View
              style={{
                height: 220,
                borderRadius: 26,
                backgroundColor: 'rgba(255,255,255,0.48)',
              }}
            />
            <View
              style={{
                height: 180,
                borderRadius: 26,
                backgroundColor: 'rgba(255,255,255,0.4)',
              }}
            />
          </View>

          <View style={styles.sheet}>
            <OnboardingCirclePlate size={96}>
              <PremiumLockIcon size={42} />
            </OnboardingCirclePlate>
            <Text style={styles.title}>{feature.label}</Text>
            <Text style={styles.body}>{feature.shortValue}</Text>

            <PrimaryButton
              label="Unlock with Premium"
              size="large"
              onPress={() =>
                router.push({
                  pathname: '/paywall',
                  params: { feature: feature.feature },
                })
              }
            />
            <Text style={styles.maybeLater} onPress={() => router.back()}>
              Maybe later
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
