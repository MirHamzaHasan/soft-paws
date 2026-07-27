import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import {
  CalendarClock,
  GraduationCap,
  ImagePlus,
  Users,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type CareTaskModel,
  listActiveMedicationsForDog,
  listLocalEventsForDog,
  listOpenCareTasksForDog,
  type MedicationModel,
} from '@/db';
import {
  formatCareTaskDueLabel,
  getCareTaskDueState,
  getCareTaskTypeLabel,
  sortCareTasksByDueAt,
} from '@/features/care/utils/careTaskSchedule';
import {
  formatDogMeta,
  formatDogWeight,
  getDogAvatar,
} from '@/features/dogs/utils/dogDisplay';
import { shareTextDocument } from '@/features/export/services/exportDocumentService';
import { buildEventsCsv } from '@/features/export/utils/exportBuilders';
import { formatMedicationMeta } from '@/features/medications/utils/medicationSchedule';
import { SyncStatusPill } from '@/features/sync/components/SyncStatusPill';
import { useSyncDisplayStatus } from '@/features/sync/hooks/useSyncDisplayStatus';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { HomeAvatar } from '../../home/components/HomeAvatar';
import { HomeShell } from '../../home/components/HomeShell';
import { ProfileActionCard } from '../components/ProfileActionCard';
import {
  ProfileAllergyIcon,
  ProfileCheckStatusIcon,
  ProfileEmergencyIcon,
  ProfileExportIcon,
  ProfileGroomingIcon,
  ProfileMedicationIcon,
  ProfileVaccinationIcon,
  ProfileVetIcon,
  ProfileWarningStatusIcon,
} from '../components/ProfileIcons';
import { ProfileMedicationItem } from '../components/ProfileMedicationItem';
import { ProfileSectionCard } from '../components/ProfileSectionCard';
import { ProfileStatCard } from '../components/ProfileStatCard';

const styles = StyleSheet.create({
  stack: {
    gap: 20,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 10,
  },
  name: {
    color: '#1B2327',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  meta: {
    color: '#5C646D',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  actionText: {
    color: '#5A6168',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#DEDAD6',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionMessage: {
    color: '#687079',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400',
  },
  sectionError: {
    color: '#A8342A',
  },
});

function isMedicationRefillSoon(medication: MedicationModel) {
  if (!medication.refillDate) {
    return false;
  }

  const refillDate = new Date(medication.refillDate);

  if (Number.isNaN(refillDate.getTime())) {
    return false;
  }

  const daysUntilRefill = Math.ceil(
    (refillDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );

  return daysUntilRefill >= 0 && daysUntilRefill <= 7;
}

function getTrackedDays(createdAt: string | null | undefined) {
  if (!createdAt) {
    return '0';
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return '0';
  }

  const dayCount = Math.ceil(
    (Date.now() - createdDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  return `${Math.max(dayCount, 1)}`;
}

export default function DogProfileHubScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const [medications, setMedications] = useState<MedicationModel[]>([]);
  const [careTasks, setCareTasks] = useState<CareTaskModel[]>([]);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [medicationLoadState, setMedicationLoadState] = useState<
    'error' | 'idle' | 'loading'
  >('idle');
  const [careTaskLoadState, setCareTaskLoadState] = useState<
    'error' | 'idle' | 'loading'
  >('idle');
  const [expandedSections, setExpandedSections] = useState({
    careCalendar: true,
    medications: true,
    vaccinations: false,
    grooming: false,
    allergies: false,
    vetInfo: false,
  });
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const dogName = selectedDog?.name ?? 'Your dog';
  const dogMeta = formatDogMeta(selectedDog);
  const dogWeight = formatDogWeight(selectedDog);
  const dogAvatar = selectedDog
    ? getDogAvatar(selectedDog)
    : { backgroundColor: '#173136', emoji: '🐶' };
  const syncStatus = useSyncDisplayStatus();
  const upcomingCareTasks = sortCareTasksByDueAt(careTasks).slice(0, 3);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!selectedDog?.id) {
        setMedications([]);
        setCareTasks([]);
        setMedicationLoadState('idle');
        setCareTaskLoadState('idle');

        return () => {
          isMounted = false;
        };
      }

      setMedicationLoadState('loading');
      setCareTaskLoadState('loading');

      Promise.all([
        listActiveMedicationsForDog(selectedDog.id),
        listOpenCareTasksForDog(selectedDog.id),
      ])
        .then(([nextMedications, nextCareTasks]) => {
          if (isMounted) {
            setMedications(nextMedications);
            setCareTasks(nextCareTasks);
            setMedicationLoadState('idle');
            setCareTaskLoadState('idle');
          }
        })
        .catch(() => {
          if (isMounted) {
            setMedicationLoadState('error');
            setCareTaskLoadState('error');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [selectedDog?.id]),
  );

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleExportData = async () => {
    if (!selectedDog) {
      setExportStatus('Add a dog before exporting data.');
      return;
    }

    try {
      const events = await listLocalEventsForDog(selectedDog.id);
      const message = await shareTextDocument({
        content: buildEventsCsv({ dog: selectedDog, events }),
        fileName: `${selectedDog.name}-barklog-events.csv`,
        mimeType: 'text/csv',
        title: `${selectedDog.name} BarkLog CSV export`,
        uti: 'public.comma-separated-values-text',
      });

      setExportStatus(message);
    } catch {
      setExportStatus('Unable to export BarkLog data right now.');
    }
  };

  return (
    <HomeShell
      activeTab="profile"
      tabVariant="care"
      headerVariant="compact"
      headerAvatarEmoji={dogAvatar.emoji}
      headerAvatarBackgroundColor={dogAvatar.backgroundColor}
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <HomeAvatar
            emoji={dogAvatar.emoji}
            backgroundColor={dogAvatar.backgroundColor}
            size={118}
          />
          <Text style={styles.name}>{dogName}</Text>
          <Text style={styles.meta}>{dogMeta}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push('/dog-switcher')}
          >
            <Text style={styles.actionText}>
              {dogs.length > 1 ? 'Switch Dog' : 'Manage Dog'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <ProfileStatCard label="Weight" value={dogWeight} />
          <ProfileStatCard
            label="Tracked"
            value={getTrackedDays(selectedDog?.created_at)}
            suffix="Days"
          />
          <ProfileStatCard
            label="Household"
            value={`${dogs.length}`}
            suffix={dogs.length === 1 ? 'Dog' : 'Dogs'}
          />
        </View>

        <ProfileSectionCard
          title="Care Calendar"
          leading={<CalendarClock size={22} />}
          expanded={expandedSections.careCalendar}
          onToggle={() => toggleSection('careCalendar')}
        >
          {careTaskLoadState === 'loading' ? (
            <Text style={styles.sectionMessage}>Loading care tasks...</Text>
          ) : null}
          {careTaskLoadState === 'error' ? (
            <Text style={[styles.sectionMessage, styles.sectionError]}>
              Unable to load care tasks.
            </Text>
          ) : null}
          {careTaskLoadState === 'idle' && upcomingCareTasks.length === 0 ? (
            <Text style={styles.sectionMessage}>
              Plan refills, preventives, grooming, vet follow-ups, and training
              practice reminders on this device.
            </Text>
          ) : null}
          {upcomingCareTasks.map((task) => (
            <ProfileMedicationItem
              key={task.id}
              title={task.title}
              meta={`${getCareTaskTypeLabel(task.type)} - ${formatCareTaskDueLabel(
                task,
              )}`}
              trailing={
                getCareTaskDueState(task) === 'overdue' ? (
                  <ProfileWarningStatusIcon />
                ) : (
                  <ProfileCheckStatusIcon />
                )
              }
              onPress={() => router.push('/care-calendar' as Href)}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push('/care-calendar' as Href)}
          >
            <Text style={styles.actionText}>Open Care Calendar</Text>
          </Pressable>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Medications"
          leading={<ProfileMedicationIcon />}
          expanded={expandedSections.medications}
          onToggle={() => toggleSection('medications')}
        >
          {medicationLoadState === 'loading' ? (
            <Text style={styles.sectionMessage}>Loading medications...</Text>
          ) : null}
          {medicationLoadState === 'error' ? (
            <Text style={[styles.sectionMessage, styles.sectionError]}>
              Unable to load medications.
            </Text>
          ) : null}
          {medicationLoadState === 'idle' && medications.length === 0 ? (
            <Text style={styles.sectionMessage}>
              No active medications yet.
            </Text>
          ) : null}
          {medications.map((medication) => (
            <ProfileMedicationItem
              key={medication.id}
              title={medication.name}
              meta={formatMedicationMeta(medication)}
              trailing={
                isMedicationRefillSoon(medication) ? (
                  <ProfileWarningStatusIcon />
                ) : (
                  <ProfileCheckStatusIcon />
                )
              }
              onPress={() =>
                router.push(
                  `/add-edit-medication?id=${encodeURIComponent(
                    medication.id,
                  )}`,
                )
              }
            />
          ))}
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push('/add-medication')}
          >
            <Text style={styles.actionText}>+ Add Medication</Text>
          </Pressable>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Vaccinations"
          leading={<ProfileVaccinationIcon />}
          badge="Set up"
          expanded={expandedSections.vaccinations}
          onToggle={() => toggleSection('vaccinations')}
        >
          <Text style={styles.sectionMessage}>
            Keep rabies, DHPP, bordetella, and other vaccine records here so
            they travel with {dogName}&apos;s profile.
          </Text>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Grooming"
          leading={<ProfileGroomingIcon />}
          expanded={expandedSections.grooming}
          onToggle={() => toggleSection('grooming')}
        >
          <Text style={styles.sectionMessage}>
            Track baths, brushing, nail trims, and future grooming cadence from
            the same dog-scoped profile.
          </Text>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Allergies & Conditions"
          leading={<ProfileAllergyIcon />}
          expanded={expandedSections.allergies}
          onToggle={() => toggleSection('allergies')}
        >
          <Text style={styles.sectionMessage}>
            Store known allergies, sensitivities, chronic conditions, and
            watch-list notes for safer handoffs.
          </Text>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Vet Info"
          leading={<ProfileVetIcon />}
          expanded={expandedSections.vetInfo}
          onToggle={() => toggleSection('vetInfo')}
        >
          <Text style={styles.sectionMessage}>
            Add clinic, veterinarian, phone, and after-hours notes before
            sharing reports or emergency summaries.
          </Text>
        </ProfileSectionCard>

        <View style={styles.divider} />

        <ProfileActionCard
          label="Training Programs"
          leading={<GraduationCap size={22} />}
          color="#362B68"
          backgroundColor="#F3F0FB"
          borderColor="#E2DCEF"
          showChevron
          onPress={() => router.push('/training' as Href)}
        />

        <ProfileActionCard
          label="Photo Baselines"
          leading={<ImagePlus size={22} />}
          color="#263136"
          backgroundColor="#FFFCFA"
          borderColor="#D7D3CF"
          showChevron
          onPress={() => router.push('/photo-baselines' as Href)}
        />

        <ProfileActionCard
          label="Household Sharing"
          leading={<Users size={22} />}
          color="#263136"
          backgroundColor="#FFFCFA"
          borderColor="#D7D3CF"
          showChevron
          onPress={() => router.push('/household' as Href)}
        />

        <SyncStatusPill
          display={syncStatus.display}
          loading={syncStatus.isLoading}
          onPress={() => router.push('/sync-backup' as Href)}
        />

        <ProfileActionCard
          label="Data Export"
          leading={<ProfileExportIcon />}
          onPress={() => {
            handleExportData().catch(() => undefined);
          }}
        />
        {exportStatus ? (
          <Text style={styles.sectionMessage}>{exportStatus}</Text>
        ) : null}

        <ProfileActionCard
          label="Safety Center"
          leading={<ProfileEmergencyIcon />}
          color="#B03A32"
          backgroundColor="#FFF1EF"
          borderColor="#F2C7C3"
          showChevron
          onPress={() => router.push('/safety' as Href)}
        />
      </View>
    </HomeShell>
  );
}
