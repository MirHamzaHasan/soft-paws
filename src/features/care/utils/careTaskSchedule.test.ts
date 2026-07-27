import {
  formatCareTaskDateInput,
  formatCareTaskDueLabel,
  getCareTaskDueState,
  getNextCareTaskDueAt,
  normalizeCareDateInput,
} from './careTaskSchedule';

describe('careTaskSchedule', () => {
  const now = new Date('2026-04-27T12:00:00.000Z');

  it('normalizes caregiver-entered date formats', () => {
    expect(normalizeCareDateInput('4/7/2026')).toBe('2026-04-07');
    expect(normalizeCareDateInput('2026-4-7')).toBe('2026-04-07');
    expect(normalizeCareDateInput('')).toBeNull();
  });

  it('classifies overdue, due today, upcoming, and completed tasks', () => {
    expect(
      getCareTaskDueState({ completedAt: null, dueAt: '2026-04-26' }, now),
    ).toBe('overdue');
    expect(
      getCareTaskDueState({ completedAt: null, dueAt: '2026-04-27' }, now),
    ).toBe('due_today');
    expect(
      getCareTaskDueState({ completedAt: null, dueAt: '2026-04-30' }, now),
    ).toBe('upcoming');
    expect(
      getCareTaskDueState(
        { completedAt: '2026-04-27', dueAt: '2026-04-26' },
        now,
      ),
    ).toBe('completed');
  });

  it('advances recurring tasks beyond the completion moment', () => {
    expect(
      getNextCareTaskDueAt({
        completedAt: now,
        dueAt: '2026-04-20',
        recurrence: 'weekly',
      }),
    ).toBe('2026-05-04');
    expect(
      getNextCareTaskDueAt({
        completedAt: now,
        dueAt: '2026-04-27',
        recurrence: 'monthly',
      }),
    ).toBe('2026-05-27');
    expect(
      getNextCareTaskDueAt({
        completedAt: now,
        dueAt: '2026-04-27',
        recurrence: 'none',
      }),
    ).toBeNull();
  });

  it('formats due labels without guilt-heavy language', () => {
    expect(
      formatCareTaskDueLabel({ completedAt: null, dueAt: '2026-04-27' }, now),
    ).toBe('Due today');
    expect(
      formatCareTaskDueLabel({ completedAt: null, dueAt: '2026-04-29' }, now),
    ).toBe('Due in 2 days');
    expect(formatCareTaskDateInput(new Date('2026-04-05T18:30:00.000Z'))).toBe(
      '2026-04-05',
    );
  });
});
