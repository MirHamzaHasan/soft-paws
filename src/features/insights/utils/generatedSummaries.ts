import type { BarklogDogRow } from '@/api';
import type { ExpenseModel } from '@/db';

import type { WeeklyDashboardSnapshot } from './insightSummaries';

export const CARE_SUMMARY_PROMPT_VERSION = 'care-summary-v1';

export type SummaryKind =
  | 'behavior'
  | 'expense'
  | 'medication_adherence'
  | 'monthly_health'
  | 'mood'
  | 'nutrition_consistency'
  | 'training'
  | 'weekly_health';

export type GeneratedSummary = {
  content: string;
  dog_id: string;
  generated_at: string;
  id: string;
  kind: SummaryKind;
  prompt_version: typeof CARE_SUMMARY_PROMPT_VERSION;
  range_end: string;
  range_start: string;
};

export type CareSummaryContext = {
  comparisonSummary: string;
  currentPeriodSummary: string;
  dog: {
    ageYears: number | null;
    breed: string | null;
    name: string;
    weightLbs: number | null;
  };
  expenseSummary: string;
  focusSummary: string;
  kind: SummaryKind;
  medicationSummary: string;
  rangeEnd: string;
  rangeStart: string;
};

export type SummaryDefinition = {
  description: string;
  emptyMessage: string;
  kind: SummaryKind;
  title: string;
};

export const SUMMARY_DEFINITIONS: SummaryDefinition[] = [
  {
    description:
      'A concise weekly pattern across care logs, symptoms, mood, behavior, and routines.',
    emptyMessage: 'Log at least one event this week before generating this.',
    kind: 'weekly_health',
    title: 'Weekly health',
  },
  {
    description:
      'A broader local pattern summary using the last 30 days of BarkLog history.',
    emptyMessage: 'Log events across the month before generating this.',
    kind: 'monthly_health',
    title: 'Monthly health',
  },
  {
    description:
      'A short pattern summary from mood check-ins and energy observations.',
    emptyMessage: 'Add mood check-ins before generating this summary.',
    kind: 'mood',
    title: 'Mood',
  },
  {
    description:
      'A behavior summary organized by logged incidents, triggers, and intensity.',
    emptyMessage: 'Add behavior logs before generating this summary.',
    kind: 'behavior',
    title: 'Behavior',
  },
  {
    description:
      'A medication pattern summary based on logged doses and saved medications.',
    emptyMessage:
      'Add medications or medication logs before generating this summary.',
    kind: 'medication_adherence',
    title: 'Medication',
  },
  {
    description:
      'A nutrition rhythm summary from meals, appetite, water, and routine logs.',
    emptyMessage: 'Add meal or appetite logs before generating this summary.',
    kind: 'nutrition_consistency',
    title: 'Nutrition',
  },
  {
    description:
      'A simple care-cost summary from local expense records and categories.',
    emptyMessage: 'Add expense records before generating this summary.',
    kind: 'expense',
    title: 'Expenses',
  },
  {
    description:
      'A progress summary from training sessions, success ratings, mood, and behavior context.',
    emptyMessage: 'Log a training session before generating this summary.',
    kind: 'training',
    title: 'Training',
  },
];

function hasAnyCount(counts: Record<string, number>) {
  return Object.values(counts).some((count) => count > 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatSummaryDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function buildExpenseSummary(expenses: ExpenseModel[]) {
  if (expenses.length === 0) {
    return 'No expense records saved.';
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => ({
      ...totals,
      [expense.category]: (totals[expense.category] ?? 0) + expense.amount,
    }),
    {},
  );
  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return [
    `${expenses.length} expense record${expenses.length === 1 ? '' : 's'}`,
    `Total logged: ${formatCurrency(total)}`,
    topCategory
      ? `Top category: ${topCategory[0]} (${formatCurrency(topCategory[1])})`
      : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

export function hasEnoughDataForSummary(input: {
  expenses: ExpenseModel[];
  kind: SummaryKind;
  snapshot: WeeklyDashboardSnapshot;
}) {
  const { eventCounts } = input.snapshot.context.thisWeek;

  if (input.kind === 'weekly_health') {
    return hasAnyCount(eventCounts);
  }

  if (input.kind === 'monthly_health') {
    return (
      input.snapshot.last30DaysSummary !==
      'No events logged in the last 30 days.'
    );
  }

  if (input.kind === 'mood') {
    return input.snapshot.context.thisWeek.moodCount > 0;
  }

  if (input.kind === 'behavior') {
    return input.snapshot.context.thisWeek.behaviorCount > 0;
  }

  if (input.kind === 'medication_adherence') {
    return (
      input.snapshot.context.thisWeek.medicationCount > 0 ||
      input.snapshot.currentMedicationsSummary !==
        'No active medications saved.'
    );
  }

  if (input.kind === 'nutrition_consistency') {
    return (
      eventCounts.meal > 0 || eventCounts.appetite > 0 || eventCounts.water > 0
    );
  }

  if (input.kind === 'expense') {
    return input.expenses.length > 0;
  }

  if (input.kind === 'training') {
    return input.snapshot.context.thisWeek.trainingCount > 0;
  }

  return false;
}

function buildFocusSummary(input: {
  expenseSummary: string;
  kind: SummaryKind;
  snapshot: WeeklyDashboardSnapshot;
}) {
  const { thisWeek } = input.snapshot.context;
  const counts = thisWeek.eventCounts;

  switch (input.kind) {
    case 'weekly_health':
      return thisWeek.eventsSummary;
    case 'monthly_health':
      return input.snapshot.last30DaysSummary;
    case 'mood':
      return thisWeek.moodSummary;
    case 'behavior':
      return thisWeek.behaviorSummary;
    case 'medication_adherence':
      return [
        `Medication logs this week: ${thisWeek.medicationCount}`,
        `Current medications: ${input.snapshot.currentMedicationsSummary}`,
      ].join(', ');
    case 'nutrition_consistency':
      return [
        `Meal logs: ${counts.meal}`,
        `Appetite logs: ${counts.appetite}`,
        `Water logs: ${counts.water}`,
        thisWeek.eventsSummary,
      ].join(', ');
    case 'expense':
      return input.expenseSummary;
    case 'training':
      return thisWeek.trainingSummary;
    default:
      return thisWeek.eventsSummary;
  }
}

function getSummaryRange(input: {
  kind: SummaryKind;
  snapshot: WeeklyDashboardSnapshot;
}) {
  if (input.kind === 'monthly_health') {
    const rangeStart = new Date(input.snapshot.weekEnd);
    rangeStart.setDate(rangeStart.getDate() - 30);

    return {
      rangeEnd: formatSummaryDateKey(input.snapshot.weekEnd),
      rangeStart: formatSummaryDateKey(rangeStart),
    };
  }

  return {
    rangeEnd: formatSummaryDateKey(input.snapshot.weekEnd),
    rangeStart: input.snapshot.weekStartKey,
  };
}

export function buildCareSummaryContext(input: {
  dog: BarklogDogRow;
  expenses: ExpenseModel[];
  kind: SummaryKind;
  snapshot: WeeklyDashboardSnapshot;
}): CareSummaryContext {
  const expenseSummary = buildExpenseSummary(input.expenses);
  const range = getSummaryRange({
    kind: input.kind,
    snapshot: input.snapshot,
  });

  return {
    comparisonSummary: input.snapshot.context.lastWeek.eventsSummary,
    currentPeriodSummary:
      input.kind === 'monthly_health'
        ? input.snapshot.last30DaysSummary
        : input.snapshot.context.thisWeek.eventsSummary,
    dog: input.snapshot.context.dog,
    expenseSummary,
    focusSummary: buildFocusSummary({
      expenseSummary,
      kind: input.kind,
      snapshot: input.snapshot,
    }),
    kind: input.kind,
    medicationSummary: input.snapshot.currentMedicationsSummary,
    rangeEnd: range.rangeEnd,
    rangeStart: range.rangeStart,
  };
}
