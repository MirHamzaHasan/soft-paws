import {
  buildScheduleTimes,
  cycleMedicationTime,
  formatMedicationDoseLabel,
  formatMedicationFrequency,
  formatMedicationMeta,
  formatScheduleTime,
  normalizeMedicationDateInput,
  normalizeMedicationFrequency,
  parseDoseMg,
  parseMedicationTime,
  resolveScheduleTimesForFrequency,
} from '@/features/medications/utils/medicationSchedule';

import { makeMedicationModel } from '../../../../test/utils/builders';

describe('medication schedule helpers', () => {
  it('builds bounded default schedules for reminder counts', () => {
    expect(buildScheduleTimes(0)).toEqual(['08:00']);
    expect(buildScheduleTimes(2)).toEqual(['08:00', '20:00']);
    expect(buildScheduleTimes(3)).toEqual(['08:00', '14:00', '20:00']);
    expect(buildScheduleTimes(99)).toEqual([
      '06:00',
      '12:00',
      '18:00',
      '22:00',
    ]);
  });

  it('resolves schedule times when frequency changes', () => {
    expect(resolveScheduleTimesForFrequency('as_needed', ['08:00'])).toEqual(
      [],
    );
    expect(resolveScheduleTimesForFrequency('twice_daily', [])).toEqual([
      '08:00',
      '20:00',
    ]);
    expect(resolveScheduleTimesForFrequency('daily', ['09:30'])).toEqual([
      '09:30',
    ]);
    expect(resolveScheduleTimesForFrequency('weekly', [])).toEqual(['08:00']);
  });

  it('formats and parses medication times safely', () => {
    expect(parseMedicationTime('07:05')).toEqual({
      hour: 7,
      minute: 5,
    });
    expect(parseMedicationTime('25:99')).toEqual({
      hour: 8,
      minute: 0,
    });
    expect(formatScheduleTime('20:00')).toBe('8:00 PM');
    expect(cycleMedicationTime('22:00')).toBe('06:00');
    expect(cycleMedicationTime('not-a-time')).toBe('06:00');
  });

  it('normalizes frequency, dose, and date display helpers', () => {
    expect(normalizeMedicationFrequency(null)).toBe('daily');
    expect(formatMedicationFrequency('every_other_day')).toBe(
      'Every other day',
    );
    expect(normalizeMedicationDateInput(' 2026-04-26 ')).toBe('2026-04-26');
    expect(normalizeMedicationDateInput('   ')).toBeNull();
    expect(parseDoseMg('5 mg')).toBe(5);
    expect(parseDoseMg('not a dose')).toBeNull();
    expect(formatMedicationDoseLabel(null)).toBe('Dose not set');
    expect(formatMedicationDoseLabel(7.5)).toBe('7.5 mg');
  });

  it('builds medication metadata for profile and reminder surfaces', () => {
    expect(
      formatMedicationMeta(
        makeMedicationModel({
          doseMg: 5,
          frequency: 'twice_daily',
          scheduleTimes: ['08:00', '20:00'],
        }),
      ),
    ).toBe('Twice daily • 8:00 AM, 8:00 PM • 5 mg');
  });
});
