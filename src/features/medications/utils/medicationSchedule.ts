import type { MedicationModel } from '@/db';

import type { LocalMedicationFrequency } from '../../../db/medications';

export const MEDICATION_TIME_OPTIONS = [
  '06:00',
  '08:00',
  '12:00',
  '14:00',
  '18:00',
  '20:00',
  '22:00',
] as const;

const frequencyLabels: Record<LocalMedicationFrequency, string> = {
  as_needed: 'As needed',
  daily: 'Daily',
  every_other_day: 'Every other day',
  twice_daily: 'Twice daily',
  weekly: 'Weekly',
};

export function normalizeMedicationFrequency(
  frequency: MedicationModel['frequency'],
): LocalMedicationFrequency {
  if (
    frequency === 'daily' ||
    frequency === 'twice_daily' ||
    frequency === 'every_other_day' ||
    frequency === 'weekly' ||
    frequency === 'as_needed'
  ) {
    return frequency;
  }

  return 'daily';
}

export function formatMedicationFrequency(frequency: LocalMedicationFrequency) {
  return frequencyLabels[frequency];
}

export function buildScheduleTimes(count: number) {
  const boundedCount = Math.min(Math.max(Math.round(count), 1), 4);

  if (boundedCount === 4) {
    return ['06:00', '12:00', '18:00', '22:00'];
  }

  if (boundedCount === 3) {
    return ['08:00', '14:00', '20:00'];
  }

  if (boundedCount === 2) {
    return ['08:00', '20:00'];
  }

  return ['08:00'];
}

export function resolveScheduleTimesForFrequency(
  frequency: LocalMedicationFrequency,
  currentTimes: string[],
) {
  if (frequency === 'as_needed') {
    return [];
  }

  if (frequency === 'twice_daily') {
    return buildScheduleTimes(2);
  }

  return currentTimes.length > 0 ? currentTimes : buildScheduleTimes(1);
}

export function cycleMedicationTime(time: string) {
  const currentIndex = MEDICATION_TIME_OPTIONS.indexOf(
    time as (typeof MEDICATION_TIME_OPTIONS)[number],
  );
  const nextIndex =
    currentIndex >= 0 ? (currentIndex + 1) % MEDICATION_TIME_OPTIONS.length : 0;

  return MEDICATION_TIME_OPTIONS[nextIndex] ?? '08:00';
}

export function parseMedicationTime(time: string) {
  const [hourPart, minutePart] = time.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: 8, minute: 0 };
  }

  return { hour, minute };
}

export function formatScheduleTime(time: string) {
  const { hour, minute } = parseMedicationTime(time);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');

  return `${displayHour}:${displayMinute} ${suffix}`;
}

export function normalizeMedicationDateInput(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function parseDoseMg(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(/mg/i, '').trim());

  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDoseMg(doseMg: number | null) {
  if (typeof doseMg !== 'number') {
    return '';
  }

  return `${doseMg}`;
}

export function formatMedicationDoseLabel(doseMg: number | null) {
  if (typeof doseMg !== 'number') {
    return 'Dose not set';
  }

  return `${doseMg} mg`;
}

export function formatMedicationMeta(medication: MedicationModel) {
  const parts = [
    formatMedicationFrequency(
      normalizeMedicationFrequency(medication.frequency),
    ),
  ];

  if (medication.scheduleTimes.length > 0) {
    parts.push(medication.scheduleTimes.map(formatScheduleTime).join(', '));
  }

  if (typeof medication.doseMg === 'number') {
    parts.push(`${medication.doseMg} mg`);
  }

  return parts.join(' • ');
}
