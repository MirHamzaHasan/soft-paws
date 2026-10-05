import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { completeOnboardingForCurrentUser } from '@/api';
import { BarklogStatusBanner, useBarklogFeedback } from '@/components/ui';
import { queueBarklogEvent } from '@/features/observability';
import HapticManager from '@/managers/HapticManager';
import {
  getPrimaryDog,
  useLocalProfileStore,
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
  'Care patterns from local logs',
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
  const onboardingDraft = useOnboardingDraftStore(
    useShallow((state) => ({
      age: state.age,
      breed: state.breed,
      healthSyncEnabled: state.healthSyncEnabled,
      name: state.name,
      notificationsEnabled: state.notificationsEnabled,
      sex: state.sex,
      status: state.status,
      weight: state.weight,
      weightUnit: state.weightUnit,
    })),
  );
  const barklogUser = useLocalProfileStore((state) => state.barklogUser);
  const dogs = useLocalProfileStore((state) => state.dogs);
  const setDogs = useLocalProfileStore((state) => state.setDogs);
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
    if (!barklogUser) {
      const message = 'Your local profile is still loading.';

      setSubmitError(message);
      await HapticManager.warning();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const snapshot = await completeOnboardingForCurrentUser(
        barklogUser.id,
        onboardingDraft,
      );
      setDogs(snapshot.dogs);
      queueBarklogEvent('onboarding_completed');
      resetDraft();
      await HapticManager.success();
      feedback.showSuccess({
        title: 'Setup complete',
        description: `${dogName}'s journal is ready.`,
      });
      router.replace('/(tabs)');
    } catch (error) {
      const message = getBarklogErrorMessage(error, {
        domain: 'local_profile',
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
            label="ALL FEATURES INCLUDED"
            icon={<TrialBadgeIcon />}
          />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>You&apos;re all set!</Text>
            <Text style={styles.subtitle}>
              {dogName}&apos;s care journal is ready on this device. Export a
              copy before deleting the app.
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
