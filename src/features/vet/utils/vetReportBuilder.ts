import type { BarklogDogRow } from '@/api/localProfile';
import type { EventModel, MedicationModel } from '@/db';
import {
  formatDateTime,
  getEventDetailSummary,
  summarizeEventCounts,
} from '@/features/export/utils/exportBuilders';

export const VET_REPORT_PROMPT_VERSION = 'vet-report-v1';

export type VetReportRange = {
  endIso: string;
  label: string;
  startIso: string;
};

export type VetReportAiContext = {
  dog: {
    ageYears: number | null;
    breed: string | null;
    id: string;
    name: string;
    weightLbs: number | null;
  };
  eventCounts: ReturnType<typeof summarizeEventCounts>;
  range: VetReportRange;
  sections: {
    behaviorAndMood: string[];
    medications: string[];
    nutritionAndElimination: string[];
    ownerNotes: string[];
    photos: string[];
    symptomsAndObservations: string[];
    training: string[];
  };
  urgentReviewNotes: string[];
};

export type GeneratedVetReport = {
  generatedAt: string;
  promptVersion: typeof VET_REPORT_PROMPT_VERSION;
  questions: string[];
  summary: string;
};

const URGENT_EVENT_TYPES = new Set<EventModel['type']>([
  'symptom',
  'vomit',
  'cough_sneeze',
  'mobility',
]);

const NUTRITION_EVENT_TYPES = new Set<EventModel['type']>([
  'meal',
  'water',
  'appetite',
  'pee',
  'poop',
  'weight',
]);

const BEHAVIOR_MOOD_TYPES = new Set<EventModel['type']>(['behavior', 'mood']);

function getDogAgeYears(dog: BarklogDogRow) {
  if (!dog.birthdate) {
    return null;
  }

  const birthdate = new Date(dog.birthdate);

  if (!Number.isFinite(birthdate.getTime())) {
    return null;
  }

  const ageYears =
    (Date.now() - birthdate.getTime()) / (365.2425 * 24 * 60 * 60 * 1000);

  return Math.max(0, Math.round(ageYears * 10) / 10);
}

function eventLine(event: EventModel) {
  const timestamp = formatDateTime(event.occurredAt);
  const summary = getEventDetailSummary(event);
  const note = event.notes?.trim() ? ` Note: ${event.notes.trim()}` : '';

  return `${timestamp}: ${summary}.${note}`.trim();
}

function takeEventLines(events: EventModel[], limit = 8) {
  return events.slice(0, limit).map(eventLine);
}

function buildMedicationLines(medications: MedicationModel[]) {
  if (medications.length === 0) {
    return ['No active medications recorded.'];
  }

  return medications.slice(0, 8).map((medication) => {
    const frequency = (medication.frequency ?? 'as_needed').replace(/_/g, ' ');
    const dose =
      typeof medication.doseMg === 'number' ? `${medication.doseMg} mg` : null;
    const notes = medication.notes?.trim() ? ` Notes: ${medication.notes}` : '';

    return `${medication.name}: ${[dose, frequency]
      .filter(Boolean)
      .join(', ')}.${notes}`;
  });
}

function buildOwnerNotes(events: EventModel[]) {
  const notes = events
    .filter((event) => Boolean(event.notes?.trim()))
    .slice(0, 10)
    .map(
      (event) =>
        `${formatDateTime(event.occurredAt)} (${event.type}): ${
          event.notes?.trim() ?? ''
        }`,
    );

  return notes.length > 0 ? notes : ['No caregiver notes recorded.'];
}

function buildPhotoLines(events: EventModel[]) {
  const photos = events
    .filter((event) => Boolean(event.photoUrl))
    .slice(0, 8)
    .map(
      (event) =>
        `${formatDateTime(event.occurredAt)} (${event.type}): photo attached`,
    );

  return photos.length > 0 ? photos : ['No event photos attached.'];
}

function buildUrgentReviewNotes(events: EventModel[]) {
  const urgentEvents = events.filter((event) => {
    if (!URGENT_EVENT_TYPES.has(event.type)) {
      return false;
    }

    const text = `${getEventDetailSummary(event)} ${event.notes ?? ''}`;

    return /severe|blood|black|red|collapse|collapsed|seizure|poison|toxin|breathing|vomit/i.test(
      text,
    );
  });

  return takeEventLines(urgentEvents, 6);
}

export function buildVetReportAiContext(input: {
  dog: BarklogDogRow;
  events: EventModel[];
  medications: MedicationModel[];
  range: VetReportRange;
}): VetReportAiContext {
  const { dog, events, medications, range } = input;

  return {
    dog: {
      ageYears: getDogAgeYears(dog),
      breed: dog.breed,
      id: dog.id,
      name: dog.name,
      weightLbs: dog.weight_lbs,
    },
    eventCounts: summarizeEventCounts(events),
    range,
    sections: {
      behaviorAndMood: takeEventLines(
        events.filter((event) => BEHAVIOR_MOOD_TYPES.has(event.type)),
      ),
      medications: buildMedicationLines(medications),
      nutritionAndElimination: takeEventLines(
        events.filter((event) => NUTRITION_EVENT_TYPES.has(event.type)),
      ),
      ownerNotes: buildOwnerNotes(events),
      photos: buildPhotoLines(events),
      symptomsAndObservations: takeEventLines(
        events.filter((event) => URGENT_EVENT_TYPES.has(event.type)),
      ),
      training: takeEventLines(
        events.filter((event) => event.type === 'training'),
      ),
    },
    urgentReviewNotes: buildUrgentReviewNotes(events),
  };
}

export function buildLocalVetQuestions(context: VetReportAiContext) {
  const questions = [
    `Are ${context.dog.name}'s meal, water, bathroom, and walk logs aligned with the current care plan?`,
    'Do any symptom or observation logs in this range need follow-up or monitoring?',
    'Should any active medication schedule notes be updated in BarkLog after this visit?',
  ];

  if (context.eventCounts.behavior > 0 || context.eventCounts.mood > 0) {
    questions.push(
      'Are the mood or behavior notes useful context for home routines, training, or visit planning?',
    );
  }

  if (context.eventCounts.training > 0) {
    questions.push(
      'Are there any activity or training limits to keep in mind for upcoming sessions?',
    );
  }

  return questions.slice(0, 5);
}
