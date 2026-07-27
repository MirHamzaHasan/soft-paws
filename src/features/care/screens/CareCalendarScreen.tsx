import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import {
  type CareTaskModel,
  completeLocalCareTask,
  createLocalCareTask,
  listActiveMedicationsForDog,
  listLocalCareTasksForDog,
  type MedicationModel,
  updateLocalMedication,
} from '@/db';
import { scheduleCareTaskReminder } from '@/features/care/services/careTaskReminderService';
import {
  formatCareTaskDateInput,
  formatCareTaskDueLabel,
  getCareTaskDueState,
  getCareTaskTypeLabel,
  normalizeCareDateInput,
  sortCareTasksByDueAt,
} from '@/features/care/utils/careTaskSchedule';
import { ChevronRightIcon } from '@/features/home/components/HomeIcons';
import { HomeShell } from '@/features/home/components/HomeShell';
import { openPremiumGate } from '@/features/premium/utils/premiumNavigation';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useAuthSessionStore } from '@/stores';
import {
  CARE_TASK_OPTIONS,
  CARE_TASK_RECURRENCE_OPTIONS,
  type CareTaskRecurrence,
  type CareTaskType,
  getCareTaskOption,
} from '@/types/care';

const styles = StyleSheet.create({
  stack: {
    gap: 22,
  },
  hero: {
    gap: 8,
  },
  overline: {
    color: '#8D867F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.6,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0A0A0A',
    fontSize: 38,
    fontWeight: '400',
    letterSpacing: -1.1,
    lineHeight: 44,
  },
  body: {
    color: '#5F6670',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFCFA',
    borderColor: '#E4E0DC',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#1F2528',
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
  },
  emptyText: {
    color: '#687079',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#8D867F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  taskCard: {
    backgroundColor: '#FFFCFA',
    borderColor: '#E4E0DC',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    minHeight: 96,
    padding: 16,
  },
  taskTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  taskCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  taskTitle: {
    color: '#172026',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 23,
  },
  taskMeta: {
    color: '#697179',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  duePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  duePillText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  completeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#D8D4CF',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  completeText: {
    color: '#263136',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderColor: '#DDD8D2',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  chipText: {
    color: '#4F575F',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  chipTextSelected: {
    color: '#FFFCFA',
  },
  field: {
    borderBottomColor: '#DDD8D2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
    minHeight: 52,
    paddingVertical: 10,
  },
  formSection: {
    gap: 10,
  },
  formLabel: {
    color: '#6F777F',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  toggleTitle: {
    color: '#1F2528',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  toggleBody: {
    color: '#687079',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  toggle: {
    alignItems: 'center',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 58,
  },
  toggleOn: {
    backgroundColor: '#0A0A0A',
  },
  toggleOff: {
    backgroundColor: '#D7D3CF',
  },
  toggleKnob: {
    backgroundColor: '#FFFCFA',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  toggleKnobOn: {
    transform: [{ translateX: 12 }],
  },
  toggleKnobOff: {
    transform: [{ translateX: -12 }],
  },
  message: {
    color: '#687079',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  error: {
    color: '#A8342A',
  },
  premiumCard: {
    backgroundColor: '#F3F0FB',
    borderColor: '#E2DCEF',
  },
  premiumButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
  },
  scrollRow: {
    marginHorizontal: -4,
  },
  scrollContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
});

const DEFAULT_TASK_TYPE: CareTaskType = 'medication_refill';
const DEFAULT_RECURRENCE: CareTaskRecurrence = 'none';

function getTomorrowDateInput() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return formatCareTaskDateInput(tomorrow);
}

function getDefaultTitle(
  type: CareTaskType,
  medication?: MedicationModel | null,
) {
  if (type === 'medication_refill' && medication) {
    return `Refill ${medication.name}`;
  }

  return getCareTaskTypeLabel(type);
}

function getDueTone(task: CareTaskModel) {
  const state = getCareTaskDueState(task);

  if (state === 'overdue') {
    return {
      backgroundColor: '#FCEBEB',
      color: '#791F1F',
    };
  }

  if (state === 'due_today') {
    return {
      backgroundColor: '#FBF1DD',
      color: '#5C3F0F',
    };
  }

  if (state === 'completed') {
    return {
      backgroundColor: '#E8F5EE',
      color: '#166534',
    };
  }

  return {
    backgroundColor: '#F5F5F4',
    color: '#4F575F',
  };
}

function CareTaskRow({
  task,
  onComplete,
}: {
  onComplete: (task: CareTaskModel) => void;
  task: CareTaskModel;
}) {
  const option = getCareTaskOption(task.type);
  const dueTone = getDueTone(task);
  const meta = [
    option.label,
    task.recurrence !== 'none' ? `Repeats ${task.recurrence}` : null,
    task.remainingCount !== null ? `${task.remainingCount} left` : null,
    task.reminderEnabled ? 'Reminder on' : null,
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskTop}>
        <Text style={styles.emoji}>{option.emoji}</Text>
        <View style={styles.taskCopy}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskMeta}>{meta}</Text>
          {task.notes ? (
            <Text style={styles.taskMeta}>{task.notes}</Text>
          ) : null}
        </View>
        <View
          style={[styles.duePill, { backgroundColor: dueTone.backgroundColor }]}
        >
          <Text style={[styles.duePillText, { color: dueTone.color }]}>
            {formatCareTaskDueLabel(task)}
          </Text>
        </View>
      </View>
      {!task.completedAt ? (
        <Pressable
          accessibilityRole="button"
          style={styles.completeButton}
          onPress={() => onComplete(task)}
        >
          <Text style={styles.completeText}>Mark done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function CareCalendarScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [tasks, setTasks] = useState<CareTaskModel[]>([]);
  const [medications, setMedications] = useState<MedicationModel[]>([]);
  const [loadState, setLoadState] = useState<'error' | 'idle' | 'loading'>(
    'loading',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [taskType, setTaskType] = useState<CareTaskType>(DEFAULT_TASK_TYPE);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(getTomorrowDateInput);
  const [recurrence, setRecurrence] =
    useState<CareTaskRecurrence>(DEFAULT_RECURRENCE);
  const [remainingCount, setRemainingCount] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedMedication =
    medications.find((medication) => medication.id === selectedMedicationId) ??
    null;
  const sortedTasks = useMemo(() => sortCareTasksByDueAt(tasks), [tasks]);
  const openTasks = sortedTasks.filter((task) => !task.completedAt);
  const completedTasks = sortedTasks.filter((task) => task.completedAt);
  const overdueTasks = openTasks.filter(
    (task) => getCareTaskDueState(task) === 'overdue',
  );
  const dueTodayTasks = openTasks.filter(
    (task) => getCareTaskDueState(task) === 'due_today',
  );
  const upcomingTasks = openTasks.filter(
    (task) => getCareTaskDueState(task) === 'upcoming',
  );

  const loadCareData = useCallback(async () => {
    if (!selectedDog?.id) {
      setTasks([]);
      setMedications([]);
      setLoadState('idle');
      return;
    }

    setLoadState('loading');

    try {
      const [nextTasks, nextMedications] = await Promise.all([
        listLocalCareTasksForDog(selectedDog.id),
        listActiveMedicationsForDog(selectedDog.id),
      ]);

      setTasks(nextTasks);
      setMedications(nextMedications);
      setSelectedMedicationId(
        (current) => current ?? nextMedications[0]?.id ?? null,
      );
      setLoadState('idle');
    } catch {
      setLoadState('error');
    }
  }, [selectedDog?.id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      loadCareData().catch(() => {
        if (isActive) {
          setLoadState('error');
        }
      });

      return () => {
        isActive = false;
      };
    }, [loadCareData]),
  );

  const resetForm = () => {
    const medication = medications[0] ?? null;

    setTaskType(DEFAULT_TASK_TYPE);
    setSelectedMedicationId(medication?.id ?? null);
    setTitle(getDefaultTitle(DEFAULT_TASK_TYPE, medication));
    setDueDate(getTomorrowDateInput());
    setRecurrence(DEFAULT_RECURRENCE);
    setRemainingCount('');
    setReminderEnabled(false);
    setNotes('');
    setError(null);
  };

  const openForm = () => {
    resetForm();
    setFormOpen(true);
    HapticManager.light().catch(() => undefined);
  };

  const updateTaskType = (nextType: CareTaskType) => {
    setTaskType(nextType);
    setTitle(getDefaultTitle(nextType, selectedMedication));
    HapticManager.selectionChange().catch(() => undefined);
  };

  const updateMedication = (medication: MedicationModel) => {
    setSelectedMedicationId(medication.id);

    if (taskType === 'medication_refill') {
      setTitle(getDefaultTitle('medication_refill', medication));
    }
  };

  const handleSave = async () => {
    if (!selectedDog?.id || !barklogUser?.id) {
      setError('Complete BarkLog onboarding before adding care tasks.');
      return;
    }

    const normalizedDueDate = normalizeCareDateInput(dueDate);
    const parsedRemainingCount = remainingCount.trim()
      ? Number(remainingCount)
      : null;

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (
      !normalizedDueDate ||
      Number.isNaN(new Date(normalizedDueDate).getTime())
    ) {
      setError('Use a due date like 2026-05-02 or 5/2/2026.');
      return;
    }

    if (
      parsedRemainingCount !== null &&
      (!Number.isFinite(parsedRemainingCount) || parsedRemainingCount < 0)
    ) {
      setError('Remaining count must be zero or higher.');
      return;
    }

    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const careTask = await createLocalCareTask({
        dogId: selectedDog.id,
        dueAt: normalizedDueDate,
        notes,
        recurrence,
        relatedMedicationId:
          taskType === 'medication_refill' ? selectedMedicationId : null,
        remainingCount: parsedRemainingCount,
        reminderEnabled,
        title,
        type: taskType,
        userId: barklogUser.id,
      });

      if (taskType === 'medication_refill' && selectedMedicationId) {
        await updateLocalMedication({
          medicationId: selectedMedicationId,
          refillDate: normalizedDueDate,
        });
      }

      const reminderResult = await scheduleCareTaskReminder(careTask);

      await HapticManager.success();
      setMessage(
        reminderEnabled
          ? reminderResult.message
          : 'Care task saved on this device.',
      );
      setFormOpen(false);
      resetForm();
      await loadCareData();
    } catch (saveError) {
      await HapticManager.error();
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save this care task.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async (task: CareTaskModel) => {
    try {
      const updatedTask = await completeLocalCareTask({ careTaskId: task.id });
      const reminderResult = await scheduleCareTaskReminder(updatedTask);

      await HapticManager.success();
      setMessage(
        updatedTask.completedAt
          ? 'Care task marked complete.'
          : `Next ${getCareTaskTypeLabel(updatedTask.type).toLowerCase()} moved to ${
              updatedTask.dueAt
            }. ${reminderResult.scheduledCount > 0 ? reminderResult.message : ''}`,
      );
      await loadCareData();
    } catch {
      await HapticManager.error();
      setError('Unable to update this care task right now.');
    }
  };

  const renderTaskSection = (label: string, sectionTasks: CareTaskModel[]) => {
    if (sectionTasks.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        {sectionTasks.map((task) => (
          <CareTaskRow key={task.id} task={task} onComplete={handleComplete} />
        ))}
      </View>
    );
  };

  return (
    <HomeShell
      activeTab="profile"
      tabVariant="care"
      showTabBar={false}
      headerVariant="compact"
      headerTitle="Care Calendar"
      headerAvatarEmoji="✓"
      headerAvatarBackgroundColor="#2F4017"
    >
      <View style={styles.stack}>
        <View style={styles.hero}>
          <Text style={styles.overline}>Free local planning</Text>
          <Text style={styles.title}>Care calendar</Text>
          <Text style={styles.body}>
            Track refills, preventives, grooming, vet follow-ups, and recurring
            care on this device. Reminders are opt-in per task.
          </Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? (
          <Text style={[styles.message, styles.error]}>{error}</Text>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {selectedDog
                ? `${selectedDog.name}'s upcoming care`
                : 'Upcoming care'}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.completeButton}
              onPress={openForm}
            >
              <Text style={styles.completeText}>Add task</Text>
            </Pressable>
          </View>
          {loadState === 'loading' ? (
            <Text style={styles.emptyText}>Loading local care tasks...</Text>
          ) : null}
          {loadState === 'error' ? (
            <Text style={[styles.emptyText, styles.error]}>
              Unable to load care tasks on this device.
            </Text>
          ) : null}
          {loadState === 'idle' && openTasks.length === 0 ? (
            <Text style={styles.emptyText}>
              Add a refill, prevention, grooming, vet follow-up, or training
              practice task to start planning ahead.
            </Text>
          ) : null}
        </View>

        {formOpen ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New care task</Text>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.chipGrid}>
                {CARE_TASK_OPTIONS.map((option) => {
                  const selected = option.type === taskType;

                  return (
                    <Pressable
                      key={option.type}
                      accessibilityRole="button"
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : null,
                      ]}
                      onPress={() => updateTaskType(option.type)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextSelected : null,
                        ]}
                      >
                        {option.emoji} {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {taskType === 'medication_refill' && medications.length > 0 ? (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Medication</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.scrollRow}
                  contentContainerStyle={styles.scrollContent}
                >
                  {medications.map((medication) => {
                    const selected = medication.id === selectedMedicationId;

                    return (
                      <Pressable
                        key={medication.id}
                        accessibilityRole="button"
                        style={[
                          styles.chip,
                          selected ? styles.chipSelected : null,
                        ]}
                        onPress={() => updateMedication(medication)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected ? styles.chipTextSelected : null,
                          ]}
                        >
                          {medication.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                accessibilityLabel="Care task title"
                value={title}
                placeholder="e.g., Refill preventives"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Due date</Text>
              <TextInput
                accessibilityLabel="Care task due date"
                value={dueDate}
                placeholder="2026-05-02"
                placeholderTextColor="#A0A6AD"
                style={styles.field}
                onChangeText={setDueDate}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Recurrence</Text>
              <View style={styles.chipGrid}>
                {CARE_TASK_RECURRENCE_OPTIONS.map((option) => {
                  const selected = option.value === recurrence;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : null,
                      ]}
                      onPress={() => setRecurrence(option.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextSelected : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {taskType === 'medication_refill' ? (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Remaining count</Text>
                <TextInput
                  accessibilityLabel="Remaining medication count"
                  value={remainingCount}
                  keyboardType="number-pad"
                  placeholder="Optional"
                  placeholderTextColor="#A0A6AD"
                  style={styles.field}
                  onChangeText={setRemainingCount}
                />
              </View>
            ) : null}

            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Text style={styles.toggleTitle}>Reminder</Text>
                <Text style={styles.toggleBody}>
                  Ask permission only when this task needs a notification.
                </Text>
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: reminderEnabled }}
                style={[
                  styles.toggle,
                  reminderEnabled ? styles.toggleOn : styles.toggleOff,
                ]}
                onPress={() => setReminderEnabled((current) => !current)}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    reminderEnabled
                      ? styles.toggleKnobOn
                      : styles.toggleKnobOff,
                  ]}
                />
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                accessibilityLabel="Care task notes"
                value={notes}
                multiline
                placeholder="Optional caregiver note"
                placeholderTextColor="#A0A6AD"
                style={[
                  styles.field,
                  { minHeight: 82, textAlignVertical: 'top' },
                ]}
                onChangeText={setNotes}
              />
            </View>

            <PrimaryButton
              label={isSaving ? 'Saving...' : 'Save care task'}
              size="large"
              disabled={isSaving}
              onPress={() => {
                handleSave().catch(() => undefined);
              }}
            />
          </View>
        ) : null}

        {renderTaskSection('Overdue', overdueTasks)}
        {renderTaskSection('Due today', dueTodayTasks)}
        {renderTaskSection('Upcoming', upcomingTasks)}
        {renderTaskSection('Recently completed', completedTasks.slice(-3))}

        <Pressable
          accessibilityRole="button"
          style={[styles.card, styles.premiumCard]}
          onPress={() => openPremiumGate(router, 'care-automation')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.taskCopy}>
              <Text style={styles.cardTitle}>Smart care automation</Text>
              <Text style={styles.emptyText}>
                Premium can sync this calendar, coordinate household tasks, and
                generate smart checklists later.
              </Text>
            </View>
            <View style={styles.premiumButton}>
              <Sparkles size={20} />
              <ChevronRightIcon color="#534AB7" />
            </View>
          </View>
        </Pressable>

        <Text style={styles.emptyText}>
          BarkLog stores local care tasks as planning reminders only. Follow
          dosage and treatment instructions from your vet or the product label.
        </Text>
      </View>
    </HomeShell>
  );
}
