import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { listActiveMedicationsForDog, type MedicationModel } from '@/db';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { HomeShell } from '../../home/components/HomeShell';
import { ShareIcon } from '../../insights/components/InsightsIcons';
import {
  CallEmergencyIcon,
  DirectionsIcon,
  InfoOutlineIcon,
} from '../components/SafetyEmergencyIcons';
import { ToxicWarningIcon } from '../components/SafetyIcons';
import { FIRST_AID_GUIDES } from '../data/firstAidGuides';
import {
  buildEmergencyCard,
  getSafetyMetadataSummary,
  OFFLINE_SAFETY_PACK,
} from '../data/offlineSafetyPack';
import { TOXICITY_ITEMS } from '../data/toxicityDatabase';
import {
  callPhoneNumber,
  openEmergencyVetSearch,
  openTrustedSource,
  shareEmergencySummary,
} from '../services/safetyActions';

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  hero: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 14,
  },
  eyebrow: {
    color: '#B2433E',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '400',
    letterSpacing: -1,
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  urgentRow: {
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  dangerCard: {
    borderColor: '#F1D0CA',
    backgroundColor: '#FFF7F5',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    color: '#263136',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  cardLabel: {
    color: '#5F6670',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#263136',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D7D3CF',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  hazardPill: {
    borderColor: '#F1D0CA',
    backgroundColor: '#FFF7F5',
  },
  pillText: {
    color: '#263136',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  checklist: {
    gap: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    gap: 10,
  },
  checklistNumber: {
    color: '#B2433E',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  metadata: {
    color: '#7C746C',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

function getHazardsById(ids: string[]) {
  const idSet = new Set(ids);

  return TOXICITY_ITEMS.filter((item) => idSet.has(item.id));
}

export default function SafetyCenterScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [medications, setMedications] = useState<MedicationModel[]>([]);
  const [medicationState, setMedicationState] = useState<
    'error' | 'idle' | 'loading'
  >('idle');
  const emergencyCard = useMemo(
    () =>
      buildEmergencyCard({
        dog: selectedDog,
        medications,
      }),
    [medications, selectedDog],
  );
  const hazards = useMemo(
    () => getHazardsById(OFFLINE_SAFETY_PACK.toxicityHazardIds),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      if (!selectedDog?.id) {
        setMedications([]);
        setMedicationState('idle');

        return () => {
          isMounted = false;
        };
      }

      setMedicationState('loading');
      listActiveMedicationsForDog(selectedDog.id)
        .then((nextMedications) => {
          if (isMounted) {
            setMedications(nextMedications);
            setMedicationState('idle');
          }
        })
        .catch(() => {
          if (isMounted) {
            setMedications([]);
            setMedicationState('error');
          }
        });

      return () => {
        isMounted = false;
      };
    }, [selectedDog?.id]),
  );

  const dogSafetyProfile = {
    name: selectedDog?.name ?? 'your dog',
    weightLbs: selectedDog?.weight_lbs ?? null,
  };

  const handleCall = async (phoneNumber: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await callPhoneNumber(phoneNumber);
  };

  return (
    <HomeShell
      activeTab="insights"
      headerVariant="compact"
      headerTitle="Safety"
      headerAvatarEmoji="⚕️"
      headerAvatarBackgroundColor="#FFF1EF"
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Free offline safety pack</Text>
          <Text style={styles.title}>Emergency help first</Text>
          <Text style={styles.body}>
            Safety tools stay available without Premium. Call a vet or poison
            control first when exposure, breathing trouble, collapse, seizure,
            or severe bleeding is involved.
          </Text>
          <View style={styles.urgentRow}>
            <PrimaryButton
              label="Open Emergency SOS"
              size="large"
              backgroundColor="#B2433E"
              borderColor="#B2433E"
              leadingIcon={<CallEmergencyIcon />}
              onPress={() => router.push('/emergency' as Href)}
            />
            <PrimaryButton
              label="Call Poison Control"
              size="large"
              backgroundColor="#FFFCFA"
              borderColor="#B2433E"
              labelColor="#B2433E"
              onPress={() => {
                handleCall(
                  OFFLINE_SAFETY_PACK.poisonControlAction.phone ?? '',
                ).catch(() => undefined);
              }}
            />
          </View>
        </View>

        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.cardTitleRow}>
            <InfoOutlineIcon color="#B2433E" />
            <Text style={styles.cardTitle}>Local emergency card</Text>
          </View>
          <Text style={styles.cardLabel}>Dog</Text>
          <Text style={styles.cardValue}>{emergencyCard.dogName}</Text>
          <Text style={styles.cardLabel}>Weight</Text>
          <Text style={styles.cardValue}>{emergencyCard.weightLabel}</Text>
          <Text style={styles.cardLabel}>Active medications</Text>
          {medicationState === 'loading' ? (
            <Text style={styles.cardValue}>Loading from this device...</Text>
          ) : null}
          {medicationState === 'error' ? (
            <Text style={styles.cardValue}>
              Medication list unavailable on this device right now.
            </Text>
          ) : null}
          {medicationState !== 'loading'
            ? emergencyCard.medications.map((medication) => (
                <Text key={medication} style={styles.cardValue}>
                  {medication}
                </Text>
              ))
            : null}
          <PrimaryButton
            label="Share Emergency Summary"
            size="large"
            leadingIcon={<ShareIcon />}
            onPress={() => {
              shareEmergencySummary(dogSafetyProfile).catch(() => undefined);
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offline first aid basics</Text>
          <Text style={styles.body}>
            These guides are stored in the app for quick reference while help is
            being contacted.
          </Text>
          <View style={styles.grid}>
            {OFFLINE_SAFETY_PACK.firstAidTopics.map((topic) => (
              <Pressable
                key={topic}
                accessibilityRole="button"
                style={styles.pill}
                onPress={() => router.push(`/first-aid/${topic}` as Href)}
              >
                <Text style={styles.pillText}>
                  {FIRST_AID_GUIDES[topic].title}
                </Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              style={[styles.pill, styles.hazardPill]}
              onPress={() =>
                router.push(
                  `/first-aid/${OFFLINE_SAFETY_PACK.cprTopic}` as Href,
                )
              }
            >
              <Text style={styles.pillText}>CPR timer</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ToxicWarningIcon color="#B2433E" />
            <Text style={styles.cardTitle}>Core toxicity lookup</Text>
          </View>
          <Text style={styles.body}>
            Search common hazards offline. If BarkLog cannot confirm an item and
            your dog ate it, contact a vet or poison control.
          </Text>
          <View style={styles.grid}>
            {hazards.slice(0, 8).map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                style={[styles.pill, styles.hazardPill]}
                onPress={() =>
                  router.push({
                    pathname: '/toxicity',
                    params: { q: item.name },
                  })
                }
              >
                <Text style={styles.pillText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label="Open Toxicity Lookup"
            size="large"
            backgroundColor="#FFFCFA"
            borderColor="#0A0A0A"
            labelColor="#0A0A0A"
            onPress={() => router.push('/toxicity' as Href)}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <DirectionsIcon color="#B2433E" />
            <Text style={styles.cardTitle}>Safe transport checklist</Text>
          </View>
          <View style={styles.checklist}>
            {OFFLINE_SAFETY_PACK.safeTransportChecklist.map((item, index) => (
              <View key={item} style={styles.checklistItem}>
                <Text style={styles.checklistNumber}>{index + 1}</Text>
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </View>
          <PrimaryButton
            label="Find Emergency Vet"
            size="large"
            backgroundColor="#FFFCFA"
            borderColor="#B2433E"
            labelColor="#B2433E"
            onPress={() => {
              openEmergencyVetSearch().catch(() => undefined);
            }}
          />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => {
            openTrustedSource(FIRST_AID_GUIDES.choking.sourceUrl).catch(
              () => undefined,
            );
          }}
        >
          <Text style={styles.metadata}>
            Sources: {getSafetyMetadataSummary()}
          </Text>
        </Pressable>
      </View>
    </HomeShell>
  );
}
