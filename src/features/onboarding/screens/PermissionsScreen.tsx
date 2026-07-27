import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getHealthActivityCapabilityLabel,
  requestNativeCapability,
} from '@/features/native-integrations';
import { useOnboardingDraftStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { BellIcon, HealthIcon } from '../components/OnboardingIcons';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { PermissionToggleCard } from '../components/PermissionToggleCard';

const styles = StyleSheet.create({
  stack: {
    gap: 28,
  },
  actions: {
    marginTop: 72,
    gap: 26,
  },
  skipRow: {
    alignItems: 'center',
  },
  skipText: {
    color: '#5F6670',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export default function PermissionsScreen() {
  const router = useRouter();
  const { healthSyncEnabled, notificationsEnabled, patchDraft } =
    useOnboardingDraftStore((state) => ({
      healthSyncEnabled: state.healthSyncEnabled,
      notificationsEnabled: state.notificationsEnabled,
      patchDraft: state.patchDraft,
    }));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const healthActivityLabel = getHealthActivityCapabilityLabel();

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      patchDraft({ notificationsEnabled: false });
      setStatusMessage('Notifications can be enabled later in Settings.');
      return;
    }

    const result = await requestNativeCapability('notifications');

    patchDraft({ notificationsEnabled: result.status === 'granted' });
    setStatusMessage(result.message);
  };

  const handleHealthToggle = async () => {
    if (healthSyncEnabled) {
      patchDraft({ healthSyncEnabled: false });
      setStatusMessage('Health activity import is off.');
      return;
    }

    const result = await requestNativeCapability('health_activity');

    patchDraft({ healthSyncEnabled: result.status === 'granted' });
    setStatusMessage(result.message);
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      title="Stay in the loop"
      subtitle="Enable permissions to get the most out of BarkLog and never miss an important update for your dog."
      heroTopSpacing={44}
      bodyTopSpacing={50}
      subtitleMaxWidth={610}
    >
      <View style={styles.stack}>
        <PermissionToggleCard
          title="Push Notifications"
          description="Get medication reminder alerts after you save a scheduled medication."
          icon={<BellIcon />}
          enabled={notificationsEnabled}
          onToggle={() => {
            handleNotificationToggle().catch(() => {
              setStatusMessage(
                'Unable to update notification permissions right now.',
              );
            });
          }}
        />

        <PermissionToggleCard
          title={healthActivityLabel}
          description={`${healthActivityLabel} activity import is not connected in this build. BarkLog will not request health data yet.`}
          icon={<HealthIcon />}
          enabled={healthSyncEnabled}
          onToggle={() => {
            handleHealthToggle().catch(() => {
              setStatusMessage(
                'Unable to update health activity permissions right now.',
              );
            });
          }}
        />

        {statusMessage ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Continue"
            onPress={() => router.replace('/(onboarding)/trial-welcome')}
          />

          <View style={styles.skipRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(onboarding)/trial-welcome')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
