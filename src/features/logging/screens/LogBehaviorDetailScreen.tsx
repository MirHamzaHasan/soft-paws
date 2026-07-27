import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  BEHAVIOR_CONTEXT_OPTIONS,
  BEHAVIOR_INTENSITY_OPTIONS,
  BEHAVIOR_OPTIONS,
  BEHAVIOR_TRIGGER_OPTIONS,
  type BehaviorContext,
  type BehaviorDetails,
  type BehaviorIntensity,
  type BehaviorTrigger,
  type BehaviorValue,
} from '@/types/events';

import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { LogBoxField } from '../components/LogBoxField';
import { LogDetailLayout } from '../components/LogDetailLayout';
import { LogMediaUploadButton } from '../components/LogMediaUploadButton';
import { LogNotesCard } from '../components/LogNotesCard';
import { LogSegmentedControl } from '../components/LogSegmentedControl';
import {
  createLocalAttachmentUri,
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  parseOptionalNumber,
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
  safetyText: {
    color: '#7A4510',
    fontSize: 15,
    lineHeight: 22,
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
  chipItem: {
    minWidth: 118,
    flexGrow: 1,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityItem: {
    flex: 1,
  },
  behaviorEmoji: {
    fontSize: 17,
    lineHeight: 19,
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

function renderBehaviorEmoji(emoji: string) {
  return <Text style={styles.behaviorEmoji}>{emoji}</Text>;
}

export default function LogBehaviorDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>('just-now');
  const [behavior, setBehavior] = useState<BehaviorValue>('barking');
  const [trigger, setTrigger] = useState<BehaviorTrigger>('unknown');
  const [intensity, setIntensity] = useState<BehaviorIntensity>('mild');
  const [duration, setDuration] = useState('');
  const [context, setContext] = useState<BehaviorContext | null>(null);
  const [notes, setNotes] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleSave = async () => {
    const durationMin = duration.trim()
      ? parseOptionalNumber(duration)
      : undefined;
    const details = {
      behavior,
      context: context ?? undefined,
      duration_min: durationMin,
      intensity,
      trigger,
    } satisfies BehaviorDetails;

    try {
      const event = await saveEvent({
        details: {
          behavior: details.behavior,
          context: details.context,
          duration_min: details.duration_min,
          intensity: details.intensity,
          trigger: details.trigger,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri('behavior') : null,
        type: 'behavior',
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="Log Behavior" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Behavior log</Text>
          <Text style={styles.subtitle}>
            Capture what happened, what seemed to trigger it, and how intense it
            felt.
          </Text>
          <Text style={styles.safetyText}>
            If anyone may be hurt or the behavior feels unsafe, create distance
            and contact a qualified professional or your vet.
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
          <Text style={styles.sectionLabel}>Behavior</Text>
          <View style={styles.chipWrap}>
            {BEHAVIOR_OPTIONS.map((option) => (
              <View key={option.value} style={styles.chipItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  leading={renderBehaviorEmoji(option.emoji)}
                  selected={behavior === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#FFF5EC"
                  selectedBorderColor="#7A4510"
                  selectedLabelColor="#7A4510"
                  onPress={() => setBehavior(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trigger</Text>
          <View style={styles.chipWrap}>
            {BEHAVIOR_TRIGGER_OPTIONS.map((option) => (
              <View key={option.value} style={styles.chipItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  selected={trigger === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#FFF5EC"
                  selectedBorderColor="#7A4510"
                  selectedLabelColor="#7A4510"
                  onPress={() => setTrigger(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Intensity</Text>
          <View style={styles.intensityRow}>
            {BEHAVIOR_INTENSITY_OPTIONS.map((option) => (
              <View key={option.value} style={styles.intensityItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  selected={intensity === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#0A0A0A"
                  selectedBorderColor="#0A0A0A"
                  selectedLabelColor="#FAFAFA"
                  onPress={() => setIntensity(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Duration</Text>
          <LogBoxField
            label="How long?"
            unitLabel="Minutes"
            value={duration}
            keyboardType="number-pad"
            placeholder="5"
            labelColor="#7A4510"
            borderColor="#FFE0C2"
            inputColor="#7A4510"
            onChangeText={setDuration}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Context</Text>
          <View style={styles.chipWrap}>
            {BEHAVIOR_CONTEXT_OPTIONS.map((option) => (
              <View key={option.value} style={styles.chipItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  selected={context === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#263136"
                  selectedBackgroundColor="#FFF5EC"
                  selectedBorderColor="#7A4510"
                  selectedLabelColor="#7A4510"
                  onPress={() =>
                    setContext((current) =>
                      current === option.value ? null : option.value,
                    )
                  }
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
            placeholder="What happened right before or after?"
            label=""
            showPhotoRow={false}
            minHeight={122}
            borderRadius={18}
          />
          <LogMediaUploadButton
            label="Add Photo"
            selected={photoAttached}
            onPress={() => setPhotoAttached((current) => !current)}
          />
        </View>

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Behavior not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save behavior'}
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
