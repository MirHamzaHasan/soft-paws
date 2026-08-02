import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { completeOnboardingForCurrentUser } from '@/api';
import { BarklogStatusBanner, useBarklogFeedback } from '@/components/ui';
import HapticManager from '@/managers/HapticManager';
import {
  getPrimaryDog,
  useAuthSessionStore,
  useOnboardingDraftStore,
} from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { ArrowRightIcon } from '../../auth/components/AuthIcons';
import { OnboardingCirclePlate } from '../components/OnboardingCirclePlate';
import { OnboardingFeatureItem } from '../components/OnboardingFeatureItem';
import {
  CheckCircleIcon,
  PawIcon,
  TrialBadgeIcon,
} from '../components/OnboardingIcons';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { OnboardingPillBadge } from '../components/OnboardingPillBadge';

const FEATURES = [
  'Unlimited daily event tracking',
  'AI-powered health insights',
  'Exportable vet reports',
  'Behavioral pattern detection',
];

const styles = StyleSheet.create({
  heroContent: {
    alignItems: 'center',
    gap: 16,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 520,
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  stack: {
    gap: 48,
  },
  featureList: {
    gap: 16,
  },
  actions: {
    marginTop: 18,
  },
});

export default function TrialWelcomeScreen() {
  const router = useRouter();
  const feedback = useBarklogFeedback();
  const resetDraft = useOnboardingDraftStore((state) => state.resetDraft);
  const onboardingDraft = useOnboardingDraftStore((state) => ({
    age: state.age,
    breed: state.breed,
    healthSyncEnabled: state.healthSyncEnabled,
    name: state.name,
    notificationsEnabled: state.notificationsEnabled,
    sex: state.sex,
    status: state.status,
    weight: state.weight,
    weightUnit: state.weightUnit,
  }));
  const session = useAuthSessionStore((state) => state.session);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const setSignedIn = useAuthSessionStore((state) => state.setSignedIn);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dogName = useMemo(() => {
    const draftName = onboardingDraft.name.trim();
    if (draftName) {
      return draftName;
    }

    return getPrimaryDog(dogs)?.name ?? 'your dog';
  }, [dogs, onboardingDraft.name]);

  const handleStartTracking = async () => {
    if (!session) {
      const message = 'Sign in again to complete BarkLog setup.';

      setSubmitError(message);
      await HapticManager.warning();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const snapshot = await completeOnboardingForCurrentUser(
        session,
        onboardingDraft,
      );
      setSignedIn(snapshot);
      resetDraft();
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Setup complete',
        description: `${dogName}'s journal is ready.`,
      });
      router.replace('/(tabs)');
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'auth',
        fallback: 'Unable to finish setup right now.',
      });

      setSubmitError(message);
      await HapticManager.error();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      surfaceVariant="card"
      heroTopSpacing={40}
      bodyTopSpacing={40}
      heroContent={
        <View style={styles.heroContent}>
          <OnboardingCirclePlate size={64}>
            <PawIcon />
          </OnboardingCirclePlate>

          <OnboardingPillBadge
            label="FREE TRIAL ACTIVE"
            icon={<TrialBadgeIcon />}
          />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>You&apos;re all set!</Text>
            <Text style={styles.subtitle}>
              {dogName}&apos;s health journey starts now. We&apos;ve unlocked
              all features for you.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.stack}>
        <View style={styles.featureList}>
          {FEATURES.map((feature) => (
            <OnboardingFeatureItem
              key={feature}
              label={feature}
              icon={<CheckCircleIcon />}
            />
          ))}
        </View>

        {submitError ? (
          <BarklogStatusBanner
            tone="danger"
            title="Setup not finished"
            description={submitError}
          />
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label={
              submitting ? 'Preparing BarkLog...' : `Start tracking ${dogName}`
            }
            trailingIcon={<ArrowRightIcon />}
            disabled={submitting}
            onPress={() => {
              handleStartTracking().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}
