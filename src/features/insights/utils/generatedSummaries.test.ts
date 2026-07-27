import {
  buildCareSummaryContext,
  buildExpenseSummary,
  hasEnoughDataForSummary,
} from '@/features/insights/utils/generatedSummaries';
import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

import { makeDogRow, makeExpenseModel } from '../../../../test/utils/builders';

function makeSnapshot(
  eventCountOverrides: Partial<
    WeeklyDashboardSnapshot['context']['thisWeek']['eventCounts']
  > = {},
  summaryOverrides: Partial<WeeklyDashboardSnapshot> = {},
): WeeklyDashboardSnapshot {
  const eventCounts = {
    appetite: 0,
    behavior: 0,
    cough_sneeze: 0,
    dental: 0,
    grooming: 0,
    meal: 0,
    medication: 0,
    mobility: 0,
    mood: 0,
    note: 0,
    parasite_prevention: 0,
    pee: 0,
    poop: 0,
    rest: 0,
    symptom: 0,
    training: 0,
    vet_visit: 0,
    vomit: 0,
    walk: 0,
    water: 0,
    weight: 0,
    ...eventCountOverrides,
  };
  const thisWeek = {
    behaviorCount: eventCounts.behavior,
    behaviorSummary:
      eventCounts.behavior > 0
        ? 'Top behavior: Barking (2), Top trigger: Guests (1)'
        : 'No behavior logs recorded.',
    eventCounts,
    eventsSummary: Object.values(eventCounts).some((count) => count > 0)
      ? 'Milo logged meals, mood, behavior, and training this week.'
      : 'No events recorded.',
    mealCount: eventCounts.meal,
    medicationCount: eventCounts.medication,
    moodCount: eventCounts.mood,
    moodSummary:
      eventCounts.mood > 0
        ? 'Top mood: Happy (2), Top energy: high (1)'
        : 'No mood check-ins recorded.',
    poopAverage: 0,
    symptomCount: eventCounts.symptom,
    trainingCount: eventCounts.training,
    trainingSummary:
      eventCounts.training > 0
        ? '2 training sessions, Average success rating: 4.5/5'
        : 'No training sessions recorded.',
    walkMinutes: 0,
  };

  return {
    anomalyAlerts: [],
    chartLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    context: {
      dog: {
        ageYears: 5,
        breed: 'Rescue mix',
        name: 'Milo',
        weightLbs: 28,
      },
      lastWeek: {
        ...thisWeek,
        eventsSummary: 'Milo logged fewer events last week.',
      },
      thisWeek,
    },
    currentMedicationsSummary: 'No active medications saved.',
    last30DaysSummary: 'No events logged in the last 30 days.',
    mealCount: eventCounts.meal,
    medicationCount: eventCounts.medication,
    poopAverage: 0,
    poopValues: [0, 0, 0, 0, 0, 0, 0],
    symptomCount: eventCounts.symptom,
    trainingContextSummary:
      'Recent training: No training sessions recorded. Recent behavior patterns: No behavior logs recorded. Recent mood patterns: No mood check-ins recorded.',
    walkMinutes: 0,
    walkValues: [0, 0, 0, 0, 0, 0, 0],
    weekEnd: new Date('2026-04-27T00:00:00.000Z'),
    weekLabel: 'Apr 20 - Apr 26',
    weekStart: new Date('2026-04-20T00:00:00.000Z'),
    weekStartKey: '2026-04-20',
    ...summaryOverrides,
  };
}

describe('generated summary builders', () => {
  it('summarizes expenses without exposing receipt metadata', () => {
    const summary = buildExpenseSummary([
      makeExpenseModel({
        amount: 25,
        category: 'food',
        receiptPhotoUrl: 'https://example.com/private-receipt.jpg',
      }),
      makeExpenseModel({
        amount: 125,
        category: 'vet',
        description: 'Annual visit',
      }),
    ]);

    expect(summary).toContain('2 expense records');
    expect(summary).toContain('Total logged: $150');
    expect(summary).toContain('Top category: vet ($125)');
    expect(summary).not.toContain('private-receipt');
    expect(summary).not.toContain('Annual visit');
  });

  it('requires relevant local data for each summary kind', () => {
    const emptySnapshot = makeSnapshot();
    const richSnapshot = makeSnapshot({
      appetite: 1,
      behavior: 2,
      meal: 2,
      medication: 1,
      mood: 2,
      training: 1,
      water: 1,
    });

    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'weekly_health',
        snapshot: emptySnapshot,
      }),
    ).toBe(false);
    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'weekly_health',
        snapshot: richSnapshot,
      }),
    ).toBe(true);
    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'mood',
        snapshot: richSnapshot,
      }),
    ).toBe(true);
    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'behavior',
        snapshot: richSnapshot,
      }),
    ).toBe(true);
    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'nutrition_consistency',
        snapshot: richSnapshot,
      }),
    ).toBe(true);
    expect(
      hasEnoughDataForSummary({
        expenses: [makeExpenseModel()],
        kind: 'expense',
        snapshot: emptySnapshot,
      }),
    ).toBe(true);
    expect(
      hasEnoughDataForSummary({
        expenses: [],
        kind: 'training',
        snapshot: richSnapshot,
      }),
    ).toBe(true);
  });

  it('builds focused summary context for Edge Functions', () => {
    const snapshot = makeSnapshot(
      {
        behavior: 2,
        mood: 2,
        training: 1,
      },
      {
        last30DaysSummary: 'Milo logged 42 care events over 30 days.',
      },
    );

    const context = buildCareSummaryContext({
      dog: makeDogRow({
        name: 'Milo',
      }),
      expenses: [makeExpenseModel()],
      kind: 'behavior',
      snapshot,
    });

    expect(context).toMatchObject({
      comparisonSummary: 'Milo logged fewer events last week.',
      focusSummary: 'Top behavior: Barking (2), Top trigger: Guests (1)',
      kind: 'behavior',
      rangeEnd: '2026-04-27',
      rangeStart: '2026-04-20',
    });
    expect(context.dog).toMatchObject({
      name: 'Milo',
      breed: 'Rescue mix',
    });
  });
});
