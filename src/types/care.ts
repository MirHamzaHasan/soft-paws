export type CareTaskType =
  | 'medication_refill'
  | 'parasite_prevention'
  | 'grooming'
  | 'vaccination'
  | 'vet_follow_up'
  | 'training_practice'
  | 'custom';

export type CareTaskRecurrence =
  | 'custom'
  | 'daily'
  | 'monthly'
  | 'none'
  | 'weekly';

export type CareTaskDueState =
  | 'completed'
  | 'due_today'
  | 'overdue'
  | 'upcoming';

export type CareTaskOption = {
  description: string;
  emoji: string;
  label: string;
  type: CareTaskType;
};

export const CARE_TASK_OPTIONS: CareTaskOption[] = [
  {
    description: 'Plan refill dates or remaining-count follow-up.',
    emoji: '💊',
    label: 'Medication refill',
    type: 'medication_refill',
  },
  {
    description: 'Flea, tick, heartworm, or other preventive care.',
    emoji: '🛡️',
    label: 'Parasite prevention',
    type: 'parasite_prevention',
  },
  {
    description: 'Baths, nails, coat, ears, or dental grooming.',
    emoji: '🛁',
    label: 'Grooming',
    type: 'grooming',
  },
  {
    description: 'Vaccine due dates and record follow-up.',
    emoji: '📋',
    label: 'Vaccination',
    type: 'vaccination',
  },
  {
    description: 'Recheck appointments or caregiver notes from a visit.',
    emoji: '🏥',
    label: 'Vet follow-up',
    type: 'vet_follow_up',
  },
  {
    description: 'Practice sessions without noisy streak pressure.',
    emoji: '🎓',
    label: 'Training practice',
    type: 'training_practice',
  },
  {
    description: 'Any recurring care task you want on the calendar.',
    emoji: '✓',
    label: 'Custom',
    type: 'custom',
  },
];

export const CARE_TASK_RECURRENCE_OPTIONS: {
  label: string;
  value: CareTaskRecurrence;
}[] = [
  { label: 'Once', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Custom', value: 'custom' },
];

const careTaskTypes = new Set<CareTaskType>(
  CARE_TASK_OPTIONS.map((option) => option.type),
);
const careTaskRecurrences = new Set<CareTaskRecurrence>(
  CARE_TASK_RECURRENCE_OPTIONS.map((option) => option.value),
);

export function isCareTaskType(value: unknown): value is CareTaskType {
  return typeof value === 'string' && careTaskTypes.has(value as CareTaskType);
}

export function isCareTaskRecurrence(
  value: unknown,
): value is CareTaskRecurrence {
  return (
    typeof value === 'string' &&
    careTaskRecurrences.has(value as CareTaskRecurrence)
  );
}

export function getCareTaskOption(type: CareTaskType) {
  return (
    CARE_TASK_OPTIONS.find((option) => option.type === type) ?? {
      description: 'Any recurring care task you want on the calendar.',
      emoji: '✓',
      label: 'Custom',
      type: 'custom',
    }
  );
}
