import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { LogDetailLayout } from '../components/LogDetailLayout';
import { LogNotesCard } from '../components/LogNotesCard';
import { LogOptionCard } from '../components/LogOptionCard';
import { LogSegmentedControl } from '../components/LogSegmentedControl';
import {
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from '../hooks/useDetailedEventSave';

type FlowValue = 'light' | 'normal' | 'heavy';

const FLOW_OPTIONS: { value: FlowValue; label: string; emoji: string }[] = [
  { value: 'light', label: 'Light', emoji: '💧' },
  { value: 'normal', label: 'Normal', emoji: '💧💧' },
  { value: 'heavy', label: 'A lot', emoji: '💧💧💧' },
];

const styles = StyleSheet.create({
  content: {
    gap: 40,
  },
  title: {
    color: '#263136',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '400',
    letterSpacing: -1.3,
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
  flowGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  flowItem: {
    flex: 1,
  },
  flowEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  action: {
    marginTop: 14,
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
});

function renderFlowIcon(emoji: string) {
  return <Text style={styles.flowEmoji}>{emoji}</Text>;
}

export default function LogPeeDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>('just-now');
  const [flow, setFlow] = useState<FlowValue>('normal');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    try {
      const event = await saveEvent({
        details: {
          amount: flow,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        type: 'pee',
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="BARKLOG" onBackPress={() => router.back()}>
      <View style={styles.content}>
        <Text style={styles.title}>Log pee</Text>

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
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.flowGrid}>
            {FLOW_OPTIONS.map((option) => (
              <View key={option.value} style={styles.flowItem}>
                <LogOptionCard
                  label={option.label}
                  icon={renderFlowIcon(option.emoji)}
                  selected={flow === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#0A0A0A"
                  selectedBackgroundColor="#EEF4FB"
                  selectedBorderColor="#D7E4F2"
                  selectedLabelColor="#1E3A5F"
                  onPress={() => setFlow(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <LogNotesCard
          label="Notes"
          labelVariant="body"
          value={notes}
          placeholder="Any urgency, accident details, or color notes..."
          photoPlacement="below"
          minHeight={120}
          borderRadius={18}
          borderColor="#111111"
          onChangeText={setNotes}
        />

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Event not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save event'}
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
