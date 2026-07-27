import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { queueBarklogEvent } from '@/features/observability';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { HomeShell } from '../../home/components/HomeShell';
import { SafetyChip } from '../components/SafetyChip';
import { ToxicWarningIcon } from '../components/SafetyIcons';
import { SafetySearchField } from '../components/SafetySearchField';
import { ToxicityResultCard } from '../components/ToxicityResultCard';
import {
  ASPCA_POISON_CONTROL_PHONE,
  getCommonToxicityHazards,
  lookupToxicityItem,
} from '../data/toxicityDatabase';
import { callPhoneNumber, openTrustedSource } from '../services/safetyActions';

const RECENT_SEARCHES = ['Apple slices', 'Peanut butter', 'Avocado'];
const SOURCE_URL = 'https://www.aspca.org/pet-care/aspca-poison-control';

const styles = StyleSheet.create({
  stack: {
    gap: 34,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '400',
    letterSpacing: -1.6,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 360,
    color: '#5F6670',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlign: 'center',
  },
  section: {
    gap: 18,
  },
  sectionLabel: {
    color: '#5F6670',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E2DC',
  },
  source: {
    color: '#A7A099',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4DDD6',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  emptyTitle: {
    color: '#0A0A0A',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
  },
  emptyBody: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  emergencyLink: {
    color: '#B2261B',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default function ToxicityScannerScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const dog = {
    name: selectedDog?.name ?? 'your dog',
    weightLbs: selectedDog?.weight_lbs ?? null,
  };
  const [query, setQuery] = useState(params.q ?? '');
  const result = lookupToxicityItem(query);
  const hasSearch = query.trim().length > 0;
  const commonHazards = getCommonToxicityHazards();

  const selectSearch = (item: string) => {
    setQuery(item);
    queueBarklogEvent('toxicity_search_selected', {
      source: 'suggested_chip',
    });
  };

  const callPoisonControl = () => {
    callPhoneNumber(ASPCA_POISON_CONTROL_PHONE).catch(() => {});
  };
  let resultContent = (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>Search before guessing</Text>
      <Text style={styles.emptyBody}>
        Use this as a quick lookup, not a diagnosis. If exposure already
        happened and symptoms are present, call now.
      </Text>
      <Pressable accessibilityRole="button" onPress={callPoisonControl}>
        <Text style={styles.emergencyLink}>
          ASPCA Poison Control: {ASPCA_POISON_CONTROL_PHONE}
        </Text>
      </Pressable>
    </View>
  );

  if (result) {
    resultContent = (
      <ToxicityResultCard
        dog={dog}
        item={result}
        onCallPoisonControl={callPoisonControl}
        onOpenSource={() => {
          openTrustedSource(result.sourceUrl).catch(() => {});
        }}
      />
    );
  } else if (hasSearch) {
    resultContent = (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No local match found</Text>
        <Text style={styles.emptyBody}>
          BarkLog cannot confirm whether this item is safe. If your dog ate it,
          contact a vet or poison control with the item name, amount, time, and
          your dog weight.
        </Text>
        <PrimaryButton
          label="Call Poison Control"
          size="large"
          backgroundColor="#B2261B"
          borderColor="#B2261B"
          onPress={callPoisonControl}
        />
      </View>
    );
  }

  return (
    <HomeShell
      activeTab="insights"
      headerVariant="compact"
      headerAvatarEmoji="🧑"
      headerAvatarBackgroundColor="#EAF1F8"
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.title}>Is this safe?</Text>
          <Text style={styles.subtitle}>
            Search to see if an item is toxic for your dog.
          </Text>
        </View>

        <SafetySearchField value={query} onChangeText={setQuery} />

        {resultContent}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
          <View style={styles.chipWrap}>
            {RECENT_SEARCHES.map((item) => (
              <SafetyChip
                key={item}
                label={item}
                onPress={() => selectSearch(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COMMON HAZARDS</Text>
          <View style={styles.chipWrap}>
            {commonHazards.map((item) => (
              <SafetyChip
                key={item.id}
                label={item.name}
                tone="hazard"
                trailing={<ToxicWarningIcon />}
                onPress={() => selectSearch(item.name)}
              />
            ))}
          </View>
        </View>

        <View style={styles.divider} />
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            openTrustedSource(SOURCE_URL).catch(() => {});
          }}
        >
          <Text style={styles.source}>
            SOURCES: ASPCA ANIMAL POISON CONTROL AND RED CROSS PET FIRST AID
          </Text>
        </Pressable>
      </View>
    </HomeShell>
  );
}
