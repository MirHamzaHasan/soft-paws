import type { BarklogDogRow } from '@/api';
import {
  type BarklogEventType,
  type EventModel,
  listActiveMedicationsForDog,
  listLocalEventsForDogDate,
} from '@/db';
import {
  type BehaviorIntensity,
  type BehaviorTrigger,
  type BehaviorValue,
  getBehaviorLabel,
  getBehaviorTriggerLabel,
  getMoodLabel,
  isBehaviorIntensity,
  isBehaviorTrigger,
  isBehaviorValue,
  isMoodEnergy,
  isMoodValue,
  type MoodEnergy,
  type MoodValue,
} from '@/types/events';
import type { Json } from '@/types/local';

export type EventSummary = {
  behaviorCount: number;
  behaviorSummary: string;
  eventCounts: Record<BarklogEventType, number>;
  eventsSummary: string;
  mealCount: number;
  medicationCount: number;
  moodCount: number;
  moodSummary: string;
  poopAverage: number;
  symptomCount: number;
  trainingCount: number;
  trainingSummary: string;
  walkMinutes: number;
};

export type WeeklyInsightContext = {
  dog: {
    ageYears: number | null;
    breed: string | null;
    name: string;
    weightLbs: number | null;
  };
  lastWeek: EventSummary;
  thisWeek: EventSummary;
};

export type WeeklyDashboardSnapshot = {
  anomalyAlerts: string[];
  chartLabels: string[];
  context: WeeklyInsightContext;
  currentMedicationsSummary: string;
  last30DaysSummary: string;
  mealCount: number;
  medicationCount: number;
  poopAverage: number;
  poopValues: number[];
  symptomCount: number;
  trainingContextSummary: string;
  walkMinutes: number;
  walkValues: number[];
  weekEnd: Date;
  weekLabel: string;
  weekStart: Date;
  weekStartKey: string;
};

const EVENT_TYPES: BarklogEventType[] = [
  'poop',
  'pee',
  'meal',
  'walk',
  'medication',
  'symptom',
  'grooming',
  'weight',
  'note',
  'mood',
  'behavior',
  'training',
  'water',
  'rest',
  'vomit',
  'cough_sneeze',
  'mobility',
  'appetite',
  'dental',
  'parasite_prevention',
  'vet_visit',
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function asDetailsRecord(value: Json | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function getNumber(value: Json | undefined) {
  return typeof value === 'number' ? value : null;
}

function getString(value: Json | undefined) {
  return typeof value === 'string' ? value : null;
}

function getStringArray(value: Json | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekRange(weekOffset = 0, now = new Date()) {
  const today = startOfLocalDay(now);
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset + weekOffset * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { end, start };
}

export function getMonthRange(monthOffset = 0, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);

  return { end, start };
}

export function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function formatRangeLabel(start: Date, end: Date) {
  const inclusiveEnd = new Date(end);
  inclusiveEnd.setDate(end.getDate() - 1);

  return `${new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(start)} - ${new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(inclusiveEnd)}`;
}

function buildEmptyCounts() {
  return EVENT_TYPES.reduce(
    (counts, type) => ({
      ...counts,
      [type]: 0,
    }),
    {} as Record<BarklogEventType, number>,
  );
}

function getPoopQualityScore(quality: string | null) {
  if (quality === 'normal') {
    return 90;
  }

  if (quality === 'loose' || quality === 'hard') {
    return 55;
  }

  return null;
}

function getTopCountLabel(
  counts: Partial<Record<MoodEnergy | MoodValue, number>>,
  labelForValue: (value: MoodEnergy | MoodValue) => string,
) {
  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  if (!topEntry) {
    return null;
  }

  const [value, count] = topEntry;

  return `${labelForValue(value as MoodEnergy | MoodValue)} (${count})`;
}

function buildMoodSummary(
  moodCounts: Partial<Record<MoodValue, number>>,
  energyCounts: Partial<Record<MoodEnergy, number>>,
) {
  const topMood = getTopCountLabel(moodCounts, (value) =>
    getMoodLabel(value as MoodValue),
  );
  const topEnergy = getTopCountLabel(energyCounts, (value) =>
    String(value).replace(/_/g, ' '),
  );

  if (!topMood && !topEnergy) {
    return 'No mood check-ins recorded.';
  }

  return [
    topMood ? `Top mood: ${topMood}` : null,
    topEnergy ? `Top energy: ${topEnergy}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

function getTopBehaviorCountLabel<TValue extends string>(
  counts: Partial<Record<TValue, number>>,
  labelForValue: (value: TValue) => string,
) {
  const topEntry = Object.entries(counts)
    .filter((entry): entry is [TValue, number] => typeof entry[1] === 'number')
    .sort((a, b) => b[1] - a[1])[0];

  if (!topEntry) {
    return null;
  }

  const [value, count] = topEntry;

  return `${labelForValue(value)} (${count})`;
}

function buildBehaviorSummary(
  behaviorCounts: Partial<Record<BehaviorValue, number>>,
  triggerCounts: Partial<Record<BehaviorTrigger, number>>,
  intensityCounts: Partial<Record<BehaviorIntensity, number>>,
) {
  const topBehavior = getTopBehaviorCountLabel(behaviorCounts, (value) =>
    getBehaviorLabel(value),
  );
  const topTrigger = getTopBehaviorCountLabel(triggerCounts, (value) =>
    getBehaviorTriggerLabel(value),
  );
  const topIntensity = getTopBehaviorCountLabel(intensityCounts, (value) =>
    String(value).replace(/_/g, ' '),
  );

  if (!topBehavior && !topTrigger && !topIntensity) {
    return 'No behavior logs recorded.';
  }

  return [
    topBehavior ? `Top behavior: ${topBehavior}` : null,
    topTrigger ? `Top trigger: ${topTrigger}` : null,
    topIntensity ? `Top intensity: ${topIntensity}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

function buildTrainingSummary(input: {
  dogMoodCounts: Partial<Record<MoodValue, number>>;
  programCounts: Partial<Record<string, number>>;
  sessionCount: number;
  successRatingCount: number;
  successRatingTotal: number;
}) {
  if (input.sessionCount === 0) {
    return 'No training sessions recorded.';
  }

  const topProgramEntry = Object.entries(input.programCounts)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .sort((a, b) => b[1] - a[1])[0];
  const topMood = getTopCountLabel(input.dogMoodCounts, (value) =>
    getMoodLabel(value as MoodValue),
  );
  const averageRating =
    input.successRatingCount > 0
      ? Math.round((input.successRatingTotal / input.successRatingCount) * 10) /
        10
      : null;

  return [
    `${input.sessionCount} training session${
      input.sessionCount === 1 ? '' : 's'
    }`,
    averageRating ? `Average success rating: ${averageRating}/5` : null,
    topProgramEntry
      ? `Top program: ${topProgramEntry[0]} (${topProgramEntry[1]})`
      : null,
    topMood ? `Top session mood: ${topMood}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

export function summarizeEvents(events: EventModel[]): EventSummary {
  const eventCounts = buildEmptyCounts();
  let walkMinutes = 0;
  let poopScoreTotal = 0;
  let poopScoreCount = 0;
  const moodCounts: Partial<Record<MoodValue, number>> = {};
  const energyCounts: Partial<Record<MoodEnergy, number>> = {};
  const behaviorCounts: Partial<Record<BehaviorValue, number>> = {};
  const triggerCounts: Partial<Record<BehaviorTrigger, number>> = {};
  const intensityCounts: Partial<Record<BehaviorIntensity, number>> = {};
  const trainingDogMoodCounts: Partial<Record<MoodValue, number>> = {};
  const trainingProgramCounts: Partial<Record<string, number>> = {};
  let trainingSuccessRatingTotal = 0;
  let trainingSuccessRatingCount = 0;

  events.forEach((event) => {
    eventCounts[event.type] += 1;

    const details = asDetailsRecord(event.details);

    if (event.type === 'walk') {
      walkMinutes += getNumber(details.duration_min) ?? 0;
    }

    if (event.type === 'poop') {
      const score = getPoopQualityScore(getString(details.quality));

      if (score !== null) {
        poopScoreTotal += score;
        poopScoreCount += 1;
      }
    }

    if (event.type === 'mood') {
      const { mood } = details;
      const { energy } = details;

      if (isMoodValue(mood)) {
        moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
      }

      if (isMoodEnergy(energy)) {
        energyCounts[energy] = (energyCounts[energy] ?? 0) + 1;
      }
    }

    if (event.type === 'behavior') {
      const { behavior } = details;
      const { trigger } = details;
      const { intensity } = details;

      if (isBehaviorValue(behavior)) {
        behaviorCounts[behavior] = (behaviorCounts[behavior] ?? 0) + 1;
      }

      if (isBehaviorTrigger(trigger)) {
        triggerCounts[trigger] = (triggerCounts[trigger] ?? 0) + 1;
      }

      if (isBehaviorIntensity(intensity)) {
        intensityCounts[intensity] = (intensityCounts[intensity] ?? 0) + 1;
      }
    }

    if (event.type === 'training') {
      const programName = getString(details.program_name);
      const successRating = getNumber(details.success_rating);
      const dogMood = getString(details.dog_mood);

      if (programName) {
        trainingProgramCounts[programName] =
          (trainingProgramCounts[programName] ?? 0) + 1;
      }

      if (typeof successRating === 'number') {
        trainingSuccessRatingTotal += successRating;
        trainingSuccessRatingCount += 1;
      }

      if (isMoodValue(dogMood)) {
        trainingDogMoodCounts[dogMood] =
          (trainingDogMoodCounts[dogMood] ?? 0) + 1;
      }
    }
  });

  const poopAverage =
    poopScoreCount > 0 ? Math.round(poopScoreTotal / poopScoreCount) : 0;
  const moodSummary = buildMoodSummary(moodCounts, energyCounts);
  const behaviorSummary = buildBehaviorSummary(
    behaviorCounts,
    triggerCounts,
    intensityCounts,
  );
  const trainingSummary = buildTrainingSummary({
    dogMoodCounts: trainingDogMoodCounts,
    programCounts: trainingProgramCounts,
    sessionCount: eventCounts.training,
    successRatingCount: trainingSuccessRatingCount,
    successRatingTotal: trainingSuccessRatingTotal,
  });
  const summaryParts = [
    `${events.length} total logs`,
    `${eventCounts.meal} meals`,
    `${eventCounts.walk} walks`,
    `${Math.round(walkMinutes)} walk minutes`,
    `${eventCounts.poop} poop logs`,
    `${eventCounts.medication} medication logs`,
    `${eventCounts.symptom} symptom logs`,
    `${eventCounts.mood} mood check-ins`,
    `${eventCounts.behavior} behavior logs`,
    `${eventCounts.training} training sessions`,
    moodSummary,
    behaviorSummary,
    trainingSummary,
  ];

  return {
    behaviorCount: eventCounts.behavior,
    behaviorSummary,
    eventCounts,
    eventsSummary: summaryParts.join(', '),
    mealCount: eventCounts.meal,
    medicationCount: eventCounts.medication,
    moodCount: eventCounts.mood,
    moodSummary,
    poopAverage,
    symptomCount: eventCounts.symptom,
    trainingCount: eventCounts.training,
    trainingSummary,
    walkMinutes,
  };
}

function buildDailyValues(
  events: EventModel[],
  weekStart: Date,
  type: 'poop' | 'walk',
) {
  return DAY_LABELS.map((_, dayIndex) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + dayIndex);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const dayEvents = events.filter(
      (event) =>
        event.type === type &&
        event.occurredAt >= dayStart.getTime() &&
        event.occurredAt < dayEnd.getTime(),
    );

    if (type === 'walk') {
      return dayEvents.reduce((total, event) => {
        const details = asDetailsRecord(event.details);
        return total + (getNumber(details.duration_min) ?? 0);
      }, 0);
    }

    const scores: number[] = [];

    dayEvents.forEach((event) => {
      const details = asDetailsRecord(event.details);
      const score = getPoopQualityScore(getString(details.quality));

      if (score !== null) {
        scores.push(score);
      }
    });

    if (scores.length === 0) {
      return 0;
    }

    return Math.round(
      scores.reduce((total, score) => total + score, 0) / scores.length,
    );
  });
}

function buildAnomalyAlerts(events: EventModel[], summary: EventSummary) {
  const alerts: string[] = [];

  if (summary.symptomCount > 0) {
    alerts.push(`${summary.symptomCount} symptom log(s) this week.`);
  }

  const concerningPoops = events.filter((event) => {
    if (event.type !== 'poop') {
      return false;
    }

    const details = asDetailsRecord(event.details);
    const color = getString(details.color);

    return color === 'red' || color === 'black';
  });

  if (concerningPoops.length > 0) {
    alerts.push('Red or black stool was logged. Contact a vet if this is new.');
  }

  if (summary.mealCount === 0 && events.length > 0) {
    alerts.push('No meal logs were recorded this week.');
  }

  return alerts;
}

function getDogAgeYears(dog: BarklogDogRow) {
  if (!dog.birthdate) {
    return null;
  }

  const birthdate = new Date(dog.birthdate);

  if (Number.isNaN(birthdate.getTime())) {
    return null;
  }

  const ageYears = (Date.now() - birthdate.getTime()) / 31_557_600_000;

  return Math.max(0, Math.round(ageYears * 10) / 10);
}

function summarizeLast30Days(events: EventModel[]) {
  if (events.length === 0) {
    return 'No events logged in the last 30 days.';
  }

  const summary = summarizeEvents(events);
  const symptomNames = events
    .flatMap((event) => {
      if (event.type !== 'symptom') {
        return [];
      }

      return getStringArray(asDetailsRecord(event.details).symptoms);
    })
    .slice(0, 6);

  return [
    summary.eventsSummary,
    symptomNames.length > 0
      ? `Symptoms noted: ${symptomNames.join(', ')}`
      : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join('. ');
}

function summarizeLast30DaysTrainingContext(events: EventModel[]) {
  if (events.length === 0) {
    return [
      'Recent training: No training sessions recorded.',
      'Recent behavior patterns: No behavior logs recorded.',
      'Recent mood patterns: No mood check-ins recorded.',
    ].join(' ');
  }

  const summary = summarizeEvents(events);

  return [
    `Recent training: ${summary.trainingSummary}`,
    `Recent behavior patterns: ${summary.behaviorSummary}`,
    `Recent mood patterns: ${summary.moodSummary}`,
  ].join(' ');
}

export async function loadWeeklyDashboardSnapshot(input: {
  dog: BarklogDogRow;
  weekOffset?: number;
}) {
  const { dog, weekOffset = 0 } = input;
  const { start: weekStart, end: weekEnd } = getWeekRange(weekOffset);
  const { start: previousWeekStart } = getWeekRange(weekOffset - 1);
  const last30Start = new Date();
  last30Start.setDate(last30Start.getDate() - 30);

  const [thisWeekEvents, lastWeekEvents, last30Events, medications] =
    await Promise.all([
      listLocalEventsForDogDate({
        dogId: dog.id,
        endAt: weekEnd.getTime(),
        startAt: weekStart.getTime(),
      }),
      listLocalEventsForDogDate({
        dogId: dog.id,
        endAt: weekStart.getTime(),
        startAt: previousWeekStart.getTime(),
      }),
      listLocalEventsForDogDate({
        dogId: dog.id,
        endAt: Date.now(),
        startAt: last30Start.getTime(),
      }),
      listActiveMedicationsForDog(dog.id),
    ]);
  const thisWeek = summarizeEvents(thisWeekEvents);
  const lastWeek = summarizeEvents(lastWeekEvents);

  return {
    anomalyAlerts: buildAnomalyAlerts(thisWeekEvents, thisWeek),
    chartLabels: DAY_LABELS,
    context: {
      dog: {
        ageYears: getDogAgeYears(dog),
        breed: dog.breed,
        name: dog.name,
        weightLbs: dog.weight_lbs,
      },
      lastWeek,
      thisWeek,
    },
    currentMedicationsSummary:
      medications.length > 0
        ? medications.map((medication) => medication.name).join(', ')
        : 'No active medications saved.',
    last30DaysSummary: summarizeLast30Days(last30Events),
    mealCount: thisWeek.mealCount,
    medicationCount: thisWeek.medicationCount,
    poopAverage: thisWeek.poopAverage,
    poopValues: buildDailyValues(thisWeekEvents, weekStart, 'poop'),
    symptomCount: thisWeek.symptomCount,
    trainingContextSummary: summarizeLast30DaysTrainingContext(last30Events),
    walkMinutes: Math.round(thisWeek.walkMinutes),
    walkValues: buildDailyValues(thisWeekEvents, weekStart, 'walk'),
    weekEnd,
    weekLabel: formatRangeLabel(weekStart, weekEnd),
    weekStart,
    weekStartKey: formatDateKey(weekStart),
  } satisfies WeeklyDashboardSnapshot;
}

export async function loadMonthlyEvents(input: {
  dogId: string;
  monthOffset?: number;
}) {
  const { end, start } = getMonthRange(input.monthOffset ?? 0);
  const events = await listLocalEventsForDogDate({
    dogId: input.dogId,
    endAt: end.getTime(),
    startAt: start.getTime(),
  });

  return {
    end,
    events,
    label: new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    }).format(start),
    start,
    summary: summarizeEvents(events),
  };
}
