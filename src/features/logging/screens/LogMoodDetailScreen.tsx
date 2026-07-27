import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  MOOD_ENERGY_OPTIONS,
  MOOD_OPTIONS,
  type MoodDetails,
  type MoodEnergy,
  type MoodValue,
} from '@/types/events';

import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { LogDetailLayout } from '../components/LogDetailLayout';
import { LogNotesCard } from '../components/LogNotesCard';
import { LogSegmentedControl } from '../components/LogSegmentedControl';
import {
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from '../hooks/useDetailedEventSave';

const styles = StyleSheet.create({
  content: {
    gap: 34,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: '#263136',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#5F6670',
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  section: {
    gap: 16,
  },
  sectionLabel: {
    color: '#263136',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodChip: {
    minWidth: 126,
    flexGrow: 1,
  },
  moodEmoji: {
    fontSize: 18,
    lineHeight: 20,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  energyItem: {
    flex: 1,
  },
  action: {
    marginTop: 10,
    gap: 14,
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

function renderMoodEmoji(emoji: string) {
  return <Text style={styles.moodEmoji}>{emoji}</Text>;
}

export default function LogMoodDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>('just-now');
  const [mood, setMood] = useState<MoodValue>('happy');
  const [energy, setEnergy] = useState<MoodEnergy>('normal');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const details = {
      energy,
      mood,
    } satisfies MoodDetails;

    try {
      const event = await saveEvent({
        details: {
          energy: details.energy,
          mood: details.mood,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        type: 'mood',
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="Log Mood" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Mood check-in</Text>
          <Text style={styles.subtitle}>
            Capture how your dog seems right now so patterns are easier to spot
            later.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>When</Text>
          <LogSegmentedControl
            value={when}
            variant="split"
            size="large"
            options={DETAIL_WHEN_OPTIONS}
            onChange={(value) => setWhen(value as DetailWhenValue)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mood</Text>
          <View style={styles.chipWrap}>
            {MOOD_OPTIONS.map((option) => (
              <View key={option.value} style={styles.moodChip}>
                <OnboardingChoiceChip
                  label={option.label}
                  leading={renderMoodEmoji(option.emoji)}
                  selected={mood === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#F5F0FF"
                  selectedBorderColor="#4A3580"
                  selectedLabelColor="#4A3580"
                  onPress={() => setMood(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Energy</Text>
          <View style={styles.energyRow}>
            {MOOD_ENERGY_OPTIONS.map((option) => (
              <View key={option.value} style={styles.energyItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  selected={energy === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#0A0A0A"
                  selectedBorderColor="#0A0A0A"
                  selectedLabelColor="#FAFAFA"
                  onPress={() => setEnergy(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <LogNotesCard
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything different about today?"
            label=""
            showPhotoRow={false}
            minHeight={122}
            borderRadius={18}
          />
        </View>

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Mood not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save mood'}
            size="large"
            disabled={!canSave || isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />
        </View>
      </View>
    </LogDetailLayout>
  );
}
