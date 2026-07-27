import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarklogStatusBanner } from '@/components/ui';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { SearchIcon } from '../../onboarding/components/OnboardingIcons';
import { LogDetailLayout } from '../components/LogDetailLayout';
import { LogNotesCard } from '../components/LogNotesCard';
import { LogSegmentedControl } from '../components/LogSegmentedControl';
import { LogUnderlineField } from '../components/LogUnderlineField';
import {
  createLocalAttachmentUri,
  DETAIL_WHEN_OPTIONS,
  type DetailWhenValue,
  normalizeOptionalText,
  parseOptionalNumber,
  resolveDetailWhenTimestamp,
  useDetailedEventSave,
} from '../hooks/useDetailedEventSave';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat';
type AmountUnit = 'cups' | 'grams';

const MEAL_OPTIONS: {
  value: MealType;
  label: string;
  leading?: string;
}[] = [
  { value: 'breakfast', label: 'Breakfast', leading: '🦴' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'treat', label: 'Treat', leading: '🥓' },
];

const styles = StyleSheet.create({
  content: {
    gap: 34,
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 22,
  },
  amountField: {
    flex: 1,
  },
  unitControl: {
    paddingBottom: 10,
  },
  chipGrid: {
    gap: 16,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  chipItem: {
    minWidth: 126,
  },
  action: {
    marginTop: 18,
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  mealIcon: {
    fontSize: 18,
    lineHeight: 20,
  },
});

function renderMealLeading(emoji?: string) {
  if (!emoji) {
    return null;
  }

  return <Text style={styles.mealIcon}>{emoji}</Text>;
}

export default function LogMealDetailScreen() {
  const router = useRouter();
  const { canSave, error, isSaving, saveEvent } = useDetailedEventSave();
  const [when, setWhen] = useState<DetailWhenValue>('just-now');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [amountUnit, setAmountUnit] = useState<AmountUnit>('cups');
  const [amount, setAmount] = useState('1.5');
  const [brand, setBrand] = useState('Orijen Regional Red');
  const [notes, setNotes] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);

  const handleSave = async () => {
    try {
      const numericAmount = parseOptionalNumber(amount);
      const amountCups =
        amountUnit === 'cups' && numericAmount !== undefined
          ? numericAmount
          : undefined;
      const amountGrams =
        amountUnit === 'grams' && numericAmount !== undefined
          ? numericAmount
          : undefined;
      const event = await saveEvent({
        details: {
          amount_cups: amountCups,
          amount_grams: amountGrams,
          food_brand: brand.trim() || undefined,
          meal_type: mealType,
        },
        notes: normalizeOptionalText(notes),
        occurredAt: resolveDetailWhenTimestamp(when),
        photoUrl: photoAttached ? createLocalAttachmentUri('meal') : null,
        type: 'meal',
      });

      router.replace(`/event/${event.id}`);
    } catch {
      // The shared save hook exposes the error inline.
    }
  };

  return (
    <LogDetailLayout title="Log Meal" onBackPress={() => router.back()}>
      <View style={styles.content}>
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

        <View style={styles.chipGrid}>
          <Text
            style={{
              color: '#A7A099',
              fontSize: 12,
              lineHeight: 16,
              fontWeight: '500',
              letterSpacing: 1.8,
              textTransform: 'uppercase',
            }}
          >
            MEAL TYPE
          </Text>
          <View style={styles.chipWrap}>
            {MEAL_OPTIONS.map((option) => (
              <View key={option.value} style={styles.chipItem}>
                <OnboardingChoiceChip
                  label={option.label}
                  leading={renderMealLeading(option.leading)}
                  selected={mealType === option.value}
                  backgroundColor="#FFFCFA"
                  borderColor="#DDD8D2"
                  labelColor="#111111"
                  selectedBackgroundColor="#F3FAF1"
                  selectedBorderColor="#D2E8CD"
                  selectedLabelColor="#145E22"
                  onPress={() => setMealType(option.value)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountField}>
            <LogUnderlineField
              label="AMOUNT"
              value={amount}
              keyboardType="decimal-pad"
              onChangeText={setAmount}
              inputTextStyle={{
                fontSize: 24,
                lineHeight: 30,
                fontWeight: '500',
              }}
            />
          </View>

          <View style={styles.unitControl}>
            <LogSegmentedControl
              value={amountUnit}
              options={[
                { label: 'Cups', value: 'cups' },
                { label: 'Grams', value: 'grams' },
              ]}
              onChange={(value) => setAmountUnit(value as AmountUnit)}
            />
          </View>
        </View>

        <LogUnderlineField
          label="FOOD BRAND"
          value={brand}
          placeholder="Food brand"
          leading={<SearchIcon color="#A7A099" size={26} />}
          onChangeText={setBrand}
        />

        <LogNotesCard
          value={notes}
          photoSelected={photoAttached}
          onPhotoPress={() => setPhotoAttached((current) => !current)}
          onChangeText={setNotes}
        />

        <View style={styles.action}>
          {error ? (
            <BarklogStatusBanner
              tone="danger"
              title="Meal not saved"
              description={error}
            />
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save Meal'}
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
