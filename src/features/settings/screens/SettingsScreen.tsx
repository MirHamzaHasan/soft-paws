import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { signOutCurrentUser } from '@/api';
import {
  cancelAllMedicationReminderNotifications,
  rescheduleMedicationRemindersForDog,
} from '@/features/medications/services/medicationReminderService';
import { requestNativeCapability } from '@/features/native-integrations';
import { getPremiumEntitlementState } from '@/features/premium/utils/premiumAccess';
import { useSyncDisplayStatus } from '@/features/sync/hooks/useSyncDisplayStatus';
import {
  getSelectedDog,
  useAuthSessionStore,
  useOnboardingDraftStore,
} from '@/stores';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';
import { CloudSyncIcon, OfflineIcon } from '../../home/components/HomeIcons';
import { HomeShell } from '../../home/components/HomeShell';
import { SparklesIcon } from '../../insights/components/InsightsIcons';
import {
  ProfileEmergencyIcon,
  ProfileMedicationIcon,
} from '../../profile/components/ProfileIcons';
import {
  SettingsEmailIcon,
  SettingsMoonIcon,
  SettingsRulerIcon,
  SettingsSubscriptionIcon,
} from '../components/SettingsIcons';
import { SettingsRow } from '../components/SettingsRow';
import { SettingsSectionCard } from '../components/SettingsSectionCard';
import { useSettingsStore } from '../stores/useSettingsStore';

const styles = StyleSheet.create({
  stack: {
    gap: 28,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#8D867F',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  signOutButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  signOutText: {
    color: '#A8342A',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  signOutError: {
    color: '#791F1F',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  statusText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const dogs = useAuthSessionStore((state) => state.dogs);
  const setSignedOut = useAuthSessionStore((state) => state.setSignedOut);
  const resetDraft = useOnboardingDraftStore((state) => state.resetDraft);
  const anomalyAlertsEnabled = useSettingsStore(
    (state) => state.anomalyAlertsEnabled,
  );
  const appearance = useSettingsStore((state) => state.appearance);
  const healthDataConnected = useSettingsStore(
    (state) => state.healthDataConnected,
  );
  const medicationRemindersEnabled = useSettingsStore(
    (state) => state.medicationRemindersEnabled,
  );
  const setAnomalyAlertsEnabled = useSettingsStore(
    (state) => state.setAnomalyAlertsEnabled,
  );
  const setAppearance = useSettingsStore((state) => state.setAppearance);
  const setHealthDataConnected = useSettingsStore(
    (state) => state.setHealthDataConnected,
  );
  const setMedicationRemindersEnabled = useSettingsStore(
    (state) => state.setMedicationRemindersEnabled,
  );
  const setUnits = useSettingsStore((state) => state.setUnits);
  const units = useSettingsStore((state) => state.units);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const subscriptionState = getPremiumEntitlementState(barklogUser);
  const syncStatus = useSyncDisplayStatus();
  const [groomingScheduleEnabled, setGroomingScheduleEnabled] = useState(true);
  const showExtendedSettings = false;
  const syncIcon =
    syncStatus.capability.canPushToCloud &&
    syncStatus.display.tone !== 'local' ? (
      <CloudSyncIcon color="#7C858D" size={24} />
    ) : (
      <OfflineIcon color="#7C858D" size={24} />
    );

  const handleSignOut = async () => {
    setSignOutError(null);

    try {
      await signOutCurrentUser();
      resetDraft();
      setSignedOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      setSignOutError(
        getBarklogErrorMessage(error, {
          domain: 'auth',
          fallback: 'Unable to sign out right now.',
        }),
      );
    }
  };

  const handleMedicationReminderToggle = async () => {
    const enabled = !medicationRemindersEnabled;

    setMedicationRemindersEnabled(enabled);
    setSettingsMessage(null);

    if (!enabled) {
      const canceledCount = await cancelAllMedicationReminderNotifications();
      setSettingsMessage(
        canceledCount > 0
          ? `${canceledCount} medication reminders canceled.`
          : 'Medication reminders are turned off.',
      );
      return;
    }

    if (!selectedDog?.id) {
      setSettingsMessage(
        'Medication reminders are on after dog onboarding is complete.',
      );
      return;
    }

    const reminderResult = await rescheduleMedicationRemindersForDog(
      selectedDog.id,
    );
    setSettingsMessage(reminderResult.message);
  };

  const cycleUnits = () => {
    setUnits(units === 'imperial' ? 'metric' : 'imperial');
  };

  const cycleAppearance = () => {
    setAppearance(appearance === 'system' ? 'light' : 'system');
  };

  const handleHealthDataToggle = async () => {
    if (healthDataConnected) {
      setHealthDataConnected(false);
      setSettingsMessage('Health activity import is disconnected.');
      return;
    }

    const result = await requestNativeCapability('health_activity');

    setHealthDataConnected(result.status === 'granted');
    setSettingsMessage(result.message);
  };

  return (
    <HomeShell
      activeTab="profile"
      tabVariant="care"
      showTabBar={false}
      headerVariant="compact"
      headerTitle="The Living Archive"
      headerAvatarEmoji="🐶"
      headerAvatarBackgroundColor="#352919"
    >
      <View style={styles.stack}>
        <Text style={styles.title}>Settings</Text>
        {settingsMessage ? (
          <Text style={styles.statusText}>{settingsMessage}</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsSectionCard>
            <SettingsRow
              title="Email"
              subtitle={barklogUser?.email ?? 'No email available'}
              leading={<SettingsEmailIcon />}
              showDivider
            />
            <SettingsRow
              title="Subscription"
              subtitle={subscriptionState.label}
              leading={<SettingsSubscriptionIcon />}
              showDivider
              onPress={() => router.push('/subscription')}
            />
            {showExtendedSettings ? (
              <SettingsRow
                title="Sync and Backup"
                subtitle={
                  syncStatus.isLoading
                    ? 'Checking backup access'
                    : syncStatus.display.compactTitle
                }
                leading={syncIcon}
                onPress={() => router.push('/sync-backup' as Href)}
              />
            ) : null}
          </SettingsSectionCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingsSectionCard>
            <SettingsRow
              title="Medication Reminders"
              leading={<ProfileMedicationIcon />}
              trailing={
                <ToggleSwitch
                  checked={medicationRemindersEnabled}
                  onPress={() => {
                    handleMedicationReminderToggle().catch(() => {
                      setSettingsMessage(
                        'Unable to update medication reminders right now.',
                      );
                    });
                  }}
                />
              }
              showDivider
            />
            <SettingsRow
              title="Weekly Insights"
              leading={<SparklesIcon color="#7C858D" size={24} />}
              trailing={
                <ToggleSwitch
                  checked={anomalyAlertsEnabled}
                  onPress={() => setAnomalyAlertsEnabled(!anomalyAlertsEnabled)}
                />
              }
              showDivider
            />
            <SettingsRow
              title="Grooming Schedule"
              leading={<SparklesIcon color="#7C858D" size={24} />}
              trailing={
                <ToggleSwitch
                  checked={groomingScheduleEnabled}
                  onPress={() =>
                    setGroomingScheduleEnabled((current) => !current)
                  }
                />
              }
            />
          </SettingsSectionCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsSectionCard>
            <SettingsRow
              title="Units"
              value={units === 'imperial' ? 'lbs / mi' : 'kg / km'}
              leading={<SettingsRulerIcon />}
              onPress={cycleUnits}
              showDivider
            />
            <SettingsRow
              title="Appearance"
              value={appearance === 'system' ? 'System' : 'Light'}
              leading={<SettingsMoonIcon />}
              onPress={cycleAppearance}
              showDivider
            />
            {showExtendedSettings ? (
              <SettingsRow
                title="Health Data"
                subtitle={healthDataConnected ? 'Connected' : 'Not connected'}
                leading={<ProfileEmergencyIcon color="#7C858D" size={24} />}
                onPress={() => {
                  handleHealthDataToggle().catch(() => {
                    setSettingsMessage(
                      'Unable to update health activity settings right now.',
                    );
                  });
                }}
              />
            ) : null}
          </SettingsSectionCard>
        </View>

        {showExtendedSettings ? (
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy and About</Text>
          <SettingsSectionCard>
            <SettingsRow
              title="Privacy"
              subtitle="Export and account controls"
              leading={<SettingsSubscriptionIcon />}
              showDivider
            />
            <SettingsRow
              title="About BarkLog"
              subtitle="Care journal, not veterinary advice"
              leading={<SettingsEmailIcon />}
            />
          </SettingsSectionCard>
          </View>
        ) : null}

        {showExtendedSettings ? (
          <Pressable
            accessibilityRole="button"
            style={styles.signOutButton}
            onPress={() => {
              handleSignOut().catch(() => undefined);
            }}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        ) : null}

        {signOutError ? (
          <Text style={styles.signOutError}>{signOutError}</Text>
        ) : null}
      </View>
    </HomeShell>
  );
}
