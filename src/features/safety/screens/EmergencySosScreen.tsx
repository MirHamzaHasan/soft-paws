import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { getSelectedDog, useLocalProfileStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { AssistantAlertIcon } from '../../assistant/components/AssistantIcons';
import { AssistantLayout } from '../../assistant/components/AssistantLayout';
import { ShareIcon } from '../../insights/components/InsightsIcons';
import { EmergencyClinicCard } from '../components/EmergencyClinicCard';
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { QuickAidTile } from '../components/QuickAidTile';
import {
  CallEmergencyIcon,
  DirectionsIcon,
  EmergencyTriangleIllustration,
  MapPreviewIllustration,
} from '../components/SafetyEmergencyIcons';
import {
  FIRST_AID_GUIDES,
  QUICK_FIRST_AID_TOPICS,
} from '../data/firstAidGuides';
import { ASPCA_POISON_CONTROL_PHONE } from '../data/toxicityDatabase';
import {
  callPhoneNumber,
  openEmergencyVetSearch,
  shareEmergencySummary,
} from '../services/safetyActions';

const styles = StyleSheet.create({
  stack: {
    gap: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#B2433E',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: -1.1,
  },
  subtitle: {
    color: '#5E6670',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  aidGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  aidCell: {
    width: '47%',
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F1D0CA',
    backgroundColor: '#FFF7F5',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  statusTitle: {
    color: '#9A1F16',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  statusBody: {
    color: '#5E6670',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
});

export default function EmergencySosScreen() {
  const router = useRouter();
  const dogs = useLocalProfileStore((state) => state.dogs);
  const selectedDogId = useLocalProfileStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const dog = {
    name: selectedDog?.name ?? 'your dog',
    weightLbs: selectedDog?.weight_lbs ?? null,
  };

  return (
    <AssistantLayout
      title="BarkLog"
      trailing={<AssistantAlertIcon />}
      onBackPress={() => router.back()}
      footer={
        <View
          style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}
        >
          <PrimaryButton
            label="Share medical summary"
            size="large"
            leadingIcon={<ShareIcon />}
            onPress={() => {
              shareEmergencySummary(dog).catch(() => {});
            }}
          />
        </View>
      }
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <EmergencyTriangleIllustration />
          <Text style={styles.title}>Emergency</Text>
          <Text style={styles.subtitle}>
            Call first. Use guides only while help is being contacted.
          </Text>
        </View>

        <EmergencyContactCard
          label="ASPCA Poison Control"
          number={ASPCA_POISON_CONTROL_PHONE}
          backgroundColor="#B2433E"
          borderColor="#B2433E"
          labelColor="#FFFCFA"
          numberColor="#FFFCFA"
          leading={<CallEmergencyIcon />}
          onPress={() => {
            callPhoneNumber(ASPCA_POISON_CONTROL_PHONE).catch(() => {});
          }}
        />

        <EmergencyContactCard
          label="Saved Vet"
          number="Add in profile"
          backgroundColor="#E8EFF2"
          borderColor="#C4CDD2"
          labelColor="#606870"
          numberColor="#1E2428"
          onPress={() => router.push('/dog-profile-hub')}
        />

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Offline-ready safety actions</Text>
          <Text style={styles.statusBody}>
            Phone actions and first-aid guides stay visible without network.
            Nearby clinic search needs maps or browser access.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Nearest 24/7 Vet</Text>

        <EmergencyClinicCard
          title="City Emergency Animal Hospital"
          meta="Search nearby emergency clinics"
          illustration={<MapPreviewIllustration />}
          actionIcon={<DirectionsIcon />}
          onDirectionsPress={() => {
            openEmergencyVetSearch().catch(() => {});
          }}
        />

        <Text style={styles.sectionTitle}>Quick First Aid</Text>

        <View style={styles.aidGrid}>
          {QUICK_FIRST_AID_TOPICS.map((topic) => {
            const guide = FIRST_AID_GUIDES[topic];

            return (
              <View key={topic} style={styles.aidCell}>
                <QuickAidTile
                  label={guide.title}
                  icon={guide.icon}
                  onPress={() => router.push(`/first-aid/${topic}`)}
                />
              </View>
            );
          })}
        </View>
      </View>
    </AssistantLayout>
  );
}
