import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import {
  createLocalMedication,
  deactivateLocalMedication,
  getLocalMedicationById,
  type LocalMedicationFrequency,
  updateLocalMedication,
} from '../../../db';
import { getSelectedDog, useAuthSessionStore } from '../../../stores';
import { LogNotesCard } from '../../logging/components/LogNotesCard';
import { LogSwitchRow } from '../../logging/components/LogSwitchRow';
import { LogUnderlineField } from '../../logging/components/LogUnderlineField';
import { OnboardingChoiceChip } from '../../onboarding/components/OnboardingChoiceChip';
import { useSettingsStore } from '../../settings/stores/useSettingsStore';
import { MedicationEditorLayout } from '../components/MedicationEditorLayout';
import {
  MedicationCalendarIcon,
  MedicationChevronDownIcon,
  MedicationForkIcon,
} from '../components/MedicationIcons';
import { MedicationScheduleCard } from '../components/MedicationScheduleCard';
import { MedicationStepper } from '../components/MedicationStepper';
import { MedicationTimeRow } from '../components/MedicationTimeRow';
import {
  cancelMedicationReminderNotifications,
  scheduleMedicationRemindersForMedication,
} from '../services/medicationReminderService';
import {
  buildScheduleTimes,
  cycleMedicationTime,
  formatDoseMg,
  formatScheduleTime,
  normalizeMedicationDateInput,
  normalizeMedicationFrequency,
  parseDoseMg,
  resolveScheduleTimesForFrequency,
} from '../utils/medicationSchedule';

const FREQUENCY_OPTIONS: { key: LocalMedicationFrequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'twice_daily', label: 'Twice Daily' },
  { key: 'every_other_day', label: 'Every Other Day' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'as_needed', label: 'As Needed' },
];

const styles = StyleSheet.create({
  stack: {
    gap: 24,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 24,
  },
  fieldHalf: {
    flex: 1,
  },
  sectionLabel: {
    color: '#5E6670',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  frequencyCell: {
    flexShrink: 0,
  },
  scheduleBlock: {
    gap: 12,
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timesLabel: {
    color: '#4E5660',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 24,
  },
  notesWrap: {
    marginTop: 2,
  },
  helperText: {
    color: '#687079',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  errorText: {
    color: '#B02921',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  secondaryButton: {
    paddingTop: 4,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#8C332B',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400',
  },
  saveWrap: {
    gap: 18,
    paddingTop: 26,
  },
});

type AddEditMedicationScreenProps = {
  medicationId?: string;
};

export default function AddEditMedicationScreen({
  medicationId,
}: AddEditMedicationScreenProps) {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const medicationRemindersEnabled = useSettingsStore(
    (state) => state.medicationRemindersEnabled,
  );
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [medicationName, setMedicationName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [frequency, setFrequency] = useState<LocalMedicationFrequency>('daily');
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [withFood, setWithFood] = useState(true);
  const [refillReminder, setRefillReminder] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [refillDate, setRefillDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(medicationId);

  useEffect(() => {
    if (!medicationId) {
      return undefined;
    }

    let isMounted = true;

    getLocalMedicationById(medicationId)
      .then((medication) => {
        if (!isMounted || !medication) {
          return;
        }

        setMedicationName(medication.name);
        setDoseAmount(formatDoseMg(medication.doseMg));
        setFrequency(normalizeMedicationFrequency(medication.frequency));
        setScheduleTimes(medication.scheduleTimes);
        setTimesPerDay(Math.max(medication.scheduleTimes.length, 1));
        setWithFood(medication.giveWithFood);
        setRefillReminder(Boolean(medication.refillDate));
        setStartDate(medication.startDate ?? '');
        setEndDate(medication.endDate ?? '');
        setRefillDate(medication.refillDate ?? '');
        setNotes(medication.notes ?? '');
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load this medication.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [medicationId]);

  const updateFrequency = (nextFrequency: LocalMedicationFrequency) => {
    const nextScheduleTimes = resolveScheduleTimesForFrequency(
      nextFrequency,
      scheduleTimes,
    );

    setFrequency(nextFrequency);
    setScheduleTimes(nextScheduleTimes);
    setTimesPerDay(Math.max(nextScheduleTimes.length, 1));
  };

  const updateTimesPerDay = (nextValue: number) => {
    const boundedValue = Math.min(Math.max(nextValue, 1), 4);

    setTimesPerDay(boundedValue);
    setScheduleTimes(buildScheduleTimes(boundedValue));

    if (boundedValue === 2) {
      setFrequency('twice_daily');
    } else if (frequency === 'twice_daily') {
      setFrequency('daily');
    }
  };

  const updateScheduleTime = (index: number) => {
    setScheduleTimes((current) =>
      current.map((time, timeIndex) =>
        timeIndex === index ? cycleMedicationTime(time) : time,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedDog?.id) {
      setError('Complete BarkLog onboarding before saving medications.');
      return;
    }

    const trimmedName = medicationName.trim();

    if (!trimmedName) {
      setError('Medication name is required.');
      return;
    }

    setError(null);
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const medicationInput = {
        doseMg: parseDoseMg(doseAmount),
        endDate: normalizeMedicationDateInput(endDate),
        frequency,
        giveWithFood: withFood,
        name: trimmedName,
        notes: notes.trim() ? notes.trim() : null,
        refillDate: refillReminder
          ? normalizeMedicationDateInput(refillDate)
          : null,
        scheduleTimes,
        startDate: normalizeMedicationDateInput(startDate),
      };
      const medication = medicationId
        ? await updateLocalMedication({
            ...medicationInput,
            medicationId,
          })
        : await createLocalMedication({
            ...medicationInput,
            dogId: selectedDog.id,
          });

      if (medicationRemindersEnabled) {
        const reminderResult =
          await scheduleMedicationRemindersForMedication(medication);
        setStatusMessage(reminderResult.message);
      }

      router.replace('/profile');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save this medication.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!medicationId) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await deactivateLocalMedication(medicationId);
      await cancelMedicationReminderNotifications(medicationId);
      router.replace('/profile');
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : 'Unable to deactivate this medication.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MedicationEditorLayout
      title={isEditing ? 'Edit Medication' : 'Add Medication'}
      actionLabel="Save"
      onClosePress={() => router.back()}
      onActionPress={() => {
        handleSave().catch(() => undefined);
      }}
    >
      <View style={styles.stack}>
        <LogUnderlineField
          label="Medication Name"
          value={medicationName}
          placeholder="e.g., NexGard, Apoquel"
          onChangeText={setMedicationName}
          rowBorderColor="#DDD8D2"
        />

        <View style={styles.doubleRow}>
          <View style={styles.fieldHalf}>
            <LogUnderlineField
              label="Dose"
              value={doseAmount}
              placeholder="Amount"
              keyboardType="decimal-pad"
              onChangeText={setDoseAmount}
              rowBorderColor="#DDD8D2"
            />
          </View>

          <View style={styles.fieldHalf}>
            <LogUnderlineField
              label="Unit"
              value="mg"
              placeholder="mg"
              editable={false}
              rowBorderColor="#DDD8D2"
              trailing={<MedicationChevronDownIcon />}
            />
          </View>
        </View>

        <MedicationScheduleCard>
          <View style={styles.scheduleBlock}>
            <View>
              <Text style={styles.sectionLabel}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <View key={option.key} style={styles.frequencyCell}>
                    <OnboardingChoiceChip
                      label={option.label}
                      size="compact"
                      selected={frequency === option.key}
                      backgroundColor="#F7F7F6"
                      borderColor="#DDD8D2"
                      labelColor="#4F575F"
                      selectedBackgroundColor="#FFFCFA"
                      selectedBorderColor="#DDD8D2"
                      selectedLabelColor="#0A0A0A"
                      onPress={() => updateFrequency(option.key)}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionLabel}>Times Per Day</Text>
              {frequency === 'as_needed' ? (
                <Text style={styles.helperText}>
                  As-needed medication stays available during logging without a
                  fixed reminder schedule.
                </Text>
              ) : (
                <View style={styles.timesRow}>
                  <MedicationStepper
                    value={timesPerDay}
                    onDecrease={() => updateTimesPerDay(timesPerDay - 1)}
                    onIncrease={() => updateTimesPerDay(timesPerDay + 1)}
                  />
                  <Text style={styles.timesLabel}>time(s)</Text>
                </View>
              )}
            </View>

            {scheduleTimes.map((time, index) => (
              <MedicationTimeRow
                key={time}
                label={`Dose ${index + 1}`}
                time={formatScheduleTime(time)}
                onPress={() => updateScheduleTime(index)}
              />
            ))}
          </View>
        </MedicationScheduleCard>

        <LogSwitchRow
          label="Give with food"
          value={withFood}
          leading={<MedicationForkIcon />}
          divider
          checkedTrackColor="#2563EB"
          uncheckedTrackColor="#0A0A0A"
          onToggle={() => setWithFood((current) => !current)}
        />

        <LogSwitchRow
          label="Refill Reminder"
          value={refillReminder}
          leading={<MedicationCalendarIcon />}
          divider
          checkedTrackColor="#2563EB"
          uncheckedTrackColor="#D0D7E0"
          onToggle={() => setRefillReminder((current) => !current)}
        />

        {refillReminder ? (
          <LogUnderlineField
            label="Refill Date"
            value={refillDate}
            placeholder="mm/dd/yyyy"
            onChangeText={setRefillDate}
            rowBorderColor="#DDD8D2"
            trailing={<MedicationCalendarIcon size={18} />}
          />
        ) : null}

        <View style={styles.dateRow}>
          <View style={styles.fieldHalf}>
            <LogUnderlineField
              label="Start Date"
              value={startDate}
              placeholder="mm/dd/yyyy"
              onChangeText={setStartDate}
              rowBorderColor="#DDD8D2"
              trailing={<MedicationCalendarIcon size={18} />}
            />
          </View>

          <View style={styles.fieldHalf}>
            <LogUnderlineField
              label="End Date (Optional)"
              value={endDate}
              placeholder="mm/dd/yyyy"
              onChangeText={setEndDate}
              rowBorderColor="#DDD8D2"
              trailing={<MedicationCalendarIcon size={18} />}
            />
          </View>
        </View>

        <View style={styles.notesWrap}>
          <LogNotesCard
            label="Notes"
            value={notes}
            placeholder="Any special instructions or observations..."
            showPhotoRow={false}
            minHeight={118}
            borderRadius={20}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.saveWrap}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {statusMessage ? (
            <Text style={styles.helperText}>{statusMessage}</Text>
          ) : null}
          <PrimaryButton
            label={isSaving ? 'Saving...' : 'Save Medication'}
            size="large"
            disabled={isSaving}
            onPress={() => {
              handleSave().catch(() => undefined);
            }}
          />

          {isEditing ? (
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => {
                handleDeactivate().catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>
                Deactivate medication
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </MedicationEditorLayout>
  );
}
