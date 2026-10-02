import type { BarklogDogRow } from '@/api/localProfile';
import type {
  BarklogEventType,
  EventModel,
  ExpenseModel,
  MedicationModel,
} from '@/db';
import {
  formatDogMeta,
  formatDogWeight,
} from '@/features/dogs/utils/dogDisplay';
import {
  getAppetiteLabel,
  getBehaviorLabel,
  getBehaviorTriggerLabel,
  getCoughSneezeFrequencyLabel,
  getCoughSneezeTypeLabel,
  getDentalActionLabel,
  getMobilityObservationLabel,
  getMoodLabel,
  getObservationSeverityLabel,
  getParasitePreventionLabel,
  getRestQualityLabel,
  getVetVisitTypeLabel,
  getVomitAppearanceLabel,
  getVomitFrequencyLabel,
  getWaterSourceLabel,
  isAppetiteValue,
  isBehaviorIntensity,
  isBehaviorTrigger,
  isBehaviorValue,
  isCoughSneezeFrequency,
  isCoughSneezeType,
  isDentalAction,
  isMobilityObservation,
  isMoodValue,
  isObservationSeverity,
  isParasitePreventionType,
  isRestQuality,
  isVetVisitType,
  isVomitAppearance,
  isVomitFrequency,
  isWaterSource,
} from '@/types/events';
import type { Json } from '@/types/local';

export type VetReportHtmlInput = {
  dog: BarklogDogRow;
  events: EventModel[];
  generatedAt: Date;
  generatedSummary?: string | null;
  medications: MedicationModel[];
  suggestedQuestions?: string[];
  rangeLabel: string;
};

type MemoryBookTextInput = {
  activeHours: string;
  dogName: string;
  mealCount: number;
  monthLabel: string;
  narrative: string;
  photoCount: number;
  walkCount: number;
};

const EVENT_TYPES: BarklogEventType[] = [
  'meal',
  'pee',
  'poop',
  'walk',
  'medication',
  'symptom',
  'weight',
  'grooming',
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
  'note',
];

function csvEscape(value: unknown) {
  if (value == null) {
    return '';
  }

  const text =
    typeof value === 'string' ? value : JSON.stringify(value, null, 0);

  return `"${text.replace(/"/g, '""')}"`;
}

function htmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDateTime(timestamp: number | null | undefined) {
  if (!timestamp) {
    return '';
  }

  return new Date(timestamp).toISOString();
}

function asDetailsRecord(details: Json) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return {};
  }

  return details as Record<string, Json | undefined>;
}

export function getEventDetailSummary(event: EventModel) {
  const details = asDetailsRecord(event.details);

  if (event.type === 'walk' && typeof details.duration_min === 'number') {
    return `${details.duration_min} minute walk`;
  }

  if (event.type === 'poop' && typeof details.quality === 'string') {
    return `Poop quality: ${details.quality}`;
  }

  if (event.type === 'weight' && typeof details.weight_lbs === 'number') {
    return `Weight: ${details.weight_lbs} lbs`;
  }

  if (event.type === 'symptom' && Array.isArray(details.symptoms)) {
    return details.symptoms.join(', ');
  }

  if (event.type === 'mood' && isMoodValue(details.mood)) {
    const energy =
      typeof details.energy === 'string' ? `, ${details.energy} energy` : '';
    return `Mood: ${getMoodLabel(details.mood)}${energy}`;
  }

  if (event.type === 'behavior' && isBehaviorValue(details.behavior)) {
    const trigger = isBehaviorTrigger(details.trigger)
      ? `, trigger: ${getBehaviorTriggerLabel(details.trigger)}`
      : '';
    const intensity = isBehaviorIntensity(details.intensity)
      ? `, ${details.intensity} intensity`
      : '';
    return `Behavior: ${getBehaviorLabel(details.behavior)}${intensity}${trigger}`;
  }

  if (event.type === 'training') {
    const program =
      typeof details.program_name === 'string' ? details.program_name : null;
    const step =
      typeof details.step_title === 'string' ? details.step_title : null;
    const context = [program, step]
      .filter((part): part is string => Boolean(part))
      .join(' - ');
    const rating =
      typeof details.success_rating === 'number'
        ? `, success rating: ${details.success_rating}/5`
        : '';

    return `Training: ${context || 'Logged'}${rating}`;
  }

  if (event.type === 'water') {
    const amount =
      typeof details.amount_oz === 'number' ? `${details.amount_oz} oz` : null;
    const source = isWaterSource(details.source)
      ? getWaterSourceLabel(details.source)
      : null;

    return `Water: ${[amount, source].filter(Boolean).join(', ') || 'Logged'}`;
  }

  if (event.type === 'rest') {
    const duration =
      typeof details.duration_min === 'number'
        ? `${details.duration_min} minutes`
        : null;
    const quality = isRestQuality(details.quality)
      ? getRestQualityLabel(details.quality)
      : null;

    return `Rest: ${[duration, quality].filter(Boolean).join(', ') || 'Logged'}`;
  }

  if (event.type === 'vomit') {
    const appearance = isVomitAppearance(details.appearance)
      ? getVomitAppearanceLabel(details.appearance)
      : null;
    const frequency = isVomitFrequency(details.frequency)
      ? getVomitFrequencyLabel(details.frequency)
      : null;

    return `Vomit observation: ${
      [appearance, frequency].filter(Boolean).join(', ') || 'Logged'
    }`;
  }

  if (event.type === 'cough_sneeze') {
    const coughSneezeType = isCoughSneezeType(details.type)
      ? getCoughSneezeTypeLabel(details.type)
      : null;
    const frequency = isCoughSneezeFrequency(details.frequency)
      ? getCoughSneezeFrequencyLabel(details.frequency)
      : null;

    return `Cough/sneeze: ${
      [coughSneezeType, frequency].filter(Boolean).join(', ') || 'Logged'
    }`;
  }

  if (event.type === 'mobility') {
    const observation = isMobilityObservation(details.observation)
      ? getMobilityObservationLabel(details.observation)
      : null;
    const severity = isObservationSeverity(details.severity)
      ? getObservationSeverityLabel(details.severity)
      : null;

    return `Mobility: ${
      [observation, severity].filter(Boolean).join(', ') || 'Logged'
    }`;
  }

  if (event.type === 'appetite' && isAppetiteValue(details.appetite)) {
    return `Appetite: ${getAppetiteLabel(details.appetite)}`;
  }

  if (event.type === 'dental' && isDentalAction(details.action)) {
    return `Dental: ${getDentalActionLabel(details.action)}`;
  }

  if (
    event.type === 'parasite_prevention' &&
    isParasitePreventionType(details.prevention_type)
  ) {
    const product =
      typeof details.product_name === 'string' ? details.product_name : null;

    return `Prevention: ${[
      getParasitePreventionLabel(details.prevention_type),
      product,
    ]
      .filter(Boolean)
      .join(', ')}`;
  }

  if (event.type === 'vet_visit' && isVetVisitType(details.visit_type)) {
    const clinic =
      typeof details.clinic_name === 'string' ? details.clinic_name : null;

    return `Vet visit: ${[getVetVisitTypeLabel(details.visit_type), clinic]
      .filter(Boolean)
      .join(', ')}`;
  }

  return event.notes?.trim() || 'Logged';
}

export function summarizeEventCounts(events: EventModel[]) {
  return EVENT_TYPES.reduce<Record<BarklogEventType, number>>(
    (counts, type) => ({
      ...counts,
      [type]: events.filter((event) => event.type === type).length,
    }),
    {
      grooming: 0,
      appetite: 0,
      cough_sneeze: 0,
      dental: 0,
      meal: 0,
      medication: 0,
      behavior: 0,
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
    },
  );
}

export function getWalkMinutes(events: EventModel[]) {
  return events.reduce((total, event) => {
    if (event.type !== 'walk') {
      return total;
    }

    const details = asDetailsRecord(event.details);

    return typeof details.duration_min === 'number'
      ? total + details.duration_min
      : total;
  }, 0);
}

export function buildEventsCsv(input: {
  dog: BarklogDogRow;
  events: EventModel[];
}) {
  const rows = [
    [
      'dog_id',
      'dog_name',
      'event_id',
      'type',
      'occurred_at',
      'logged_at',
      'notes',
      'details_json',
      'photo_url',
    ],
    ...input.events.map((event) => [
      input.dog.id,
      input.dog.name,
      event.id,
      event.type,
      formatDateTime(event.occurredAt),
      formatDateTime(event.loggedAt),
      event.notes ?? '',
      event.details,
      event.photoUrl ?? '',
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function buildExpensesCsv(input: {
  dog: BarklogDogRow;
  expenses: ExpenseModel[];
}) {
  const rows = [
    [
      'dog_id',
      'dog_name',
      'expense_id',
      'date',
      'category',
      'amount',
      'description',
      'receipt_photo_url',
    ],
    ...input.expenses.map((expense) => [
      input.dog.id,
      input.dog.name,
      expense.id,
      expense.date,
      expense.category,
      expense.amount.toFixed(2),
      expense.description ?? '',
      expense.receiptPhotoUrl ?? '',
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function buildMemoryBookText(input: MemoryBookTextInput) {
  return [
    `${input.dogName}'s ${input.monthLabel} BarkLog Memory Book`,
    '',
    input.narrative,
    '',
    `Walks logged: ${input.walkCount}`,
    `Meals served: ${input.mealCount}`,
    `Active time: ${input.activeHours}`,
    `Photos captured: ${input.photoCount}`,
  ].join('\n');
}

export function buildVetReportHtml(input: VetReportHtmlInput) {
  const counts = summarizeEventCounts(input.events);
  const symptoms = input.events.filter((event) => event.type === 'symptom');
  const generatedLabel = input.generatedAt.toLocaleString();
  const eventRows = input.events.slice(0, 24);
  const suggestedQuestions = input.suggestedQuestions?.filter(Boolean) ?? [];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${htmlEscape(input.dog.name)} BarkLog Vet Report</title>
  <style>
    body { color: #1f2528; font-family: -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif; margin: 40px; }
    h1 { font-size: 34px; margin: 0 0 8px; }
    h2 { border-top: 1px solid #ddd8d2; font-size: 20px; margin-top: 28px; padding-top: 18px; }
    .meta { color: #5d656d; font-size: 14px; margin-bottom: 24px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
    .card { border: 1px solid #ddd8d2; border-radius: 12px; padding: 14px; }
    .label { color: #6b727a; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
    .value { font-size: 22px; margin-top: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #eee9e3; font-size: 13px; padding: 9px; text-align: left; vertical-align: top; }
    th { color: #5d656d; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
    .disclaimer { background: #fff7e7; border: 1px solid #eedcb4; border-radius: 12px; color: #5c3f0f; padding: 14px; }
    .summary { background: #f8f6ff; border: 1px solid #e2dcef; border-radius: 12px; color: #362b68; padding: 14px; }
    .questions li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>${htmlEscape(input.dog.name)} Patient Summary</h1>
  <div class="meta">Generated ${htmlEscape(generatedLabel)} · ${htmlEscape(input.rangeLabel)}</div>
  <div class="disclaimer">BarkLog organizes caregiver-entered records and observed patterns. It is not a diagnosis or substitute for veterinary care.</div>

  ${
    input.generatedSummary
      ? `<h2>Caregiver Summary</h2><div class="summary">${htmlEscape(input.generatedSummary)}</div>`
      : ''
  }

  <h2>Profile</h2>
  <div class="grid">
    <div class="card"><div class="label">Breed & Age</div><div class="value">${htmlEscape(formatDogMeta(input.dog))}</div></div>
    <div class="card"><div class="label">Weight</div><div class="value">${htmlEscape(formatDogWeight(input.dog))}</div></div>
    <div class="card"><div class="label">Events</div><div class="value">${input.events.length}</div></div>
    <div class="card"><div class="label">Active Meds</div><div class="value">${input.medications.length}</div></div>
  </div>

  <h2>Range Averages</h2>
  <div class="grid">
    <div class="card"><div class="label">Meals</div><div class="value">${counts.meal}</div></div>
    <div class="card"><div class="label">Walks</div><div class="value">${counts.walk}</div></div>
    <div class="card"><div class="label">Poops</div><div class="value">${counts.poop}</div></div>
    <div class="card"><div class="label">Symptoms</div><div class="value">${counts.symptom}</div></div>
  </div>

  <h2>Active Medications</h2>
  <table>
    <thead><tr><th>Name</th><th>Schedule</th><th>Notes</th></tr></thead>
    <tbody>
      ${
        input.medications.length
          ? input.medications
              .map(
                (medication) =>
                  `<tr><td>${htmlEscape(medication.name)}</td><td>${htmlEscape(medication.frequency)}</td><td>${htmlEscape(medication.notes ?? '')}</td></tr>`,
              )
              .join('')
          : '<tr><td colspan="3">No active medications recorded.</td></tr>'
      }
    </tbody>
  </table>

  <h2>Symptoms & Observations</h2>
  <table>
    <thead><tr><th>Date</th><th>Summary</th><th>Notes</th></tr></thead>
    <tbody>
      ${
        symptoms.length
          ? symptoms
              .slice(0, 12)
              .map(
                (event) =>
                  `<tr><td>${htmlEscape(formatDateTime(event.occurredAt))}</td><td>${htmlEscape(getEventDetailSummary(event))}</td><td>${htmlEscape(event.notes ?? '')}</td></tr>`,
              )
              .join('')
          : '<tr><td colspan="3">No symptom events recorded in this range.</td></tr>'
      }
    </tbody>
  </table>

  ${
    suggestedQuestions.length > 0
      ? `<h2>Questions to Discuss</h2><ol class="questions">${suggestedQuestions
          .map((question) => `<li>${htmlEscape(question)}</li>`)
          .join('')}</ol>`
      : ''
  }

  <h2>Recent Event Timeline</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Summary</th></tr></thead>
    <tbody>
      ${
        eventRows.length
          ? eventRows
              .map(
                (event) =>
                  `<tr><td>${htmlEscape(formatDateTime(event.occurredAt))}</td><td>${htmlEscape(event.type)}</td><td>${htmlEscape(getEventDetailSummary(event))}</td></tr>`,
              )
              .join('')
          : '<tr><td colspan="3">No events recorded in this range.</td></tr>'
      }
    </tbody>
  </table>
</body>
</html>`;
}
