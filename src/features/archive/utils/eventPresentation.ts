import type { BarklogEventType, EventModel } from '@/db';
import {
  getAppetiteLabel,
  getBehaviorContextLabel,
  getBehaviorEmoji,
  getBehaviorLabel,
  getBehaviorTriggerLabel,
  getCoughSneezeFrequencyLabel,
  getCoughSneezeTypeLabel,
  getDentalActionLabel,
  getExpandedCareEventEmoji,
  getExpandedCareEventLabel,
  getMobilityObservationLabel,
  getMoodEmoji,
  getMoodLabel,
  getObservationSeverityLabel,
  getParasitePreventionLabel,
  getRestQualityLabel,
  getVetVisitTypeLabel,
  getVomitAppearanceLabel,
  getVomitFrequencyLabel,
  getWaterSourceLabel,
  isAppetiteValue,
  isBehaviorContext,
  isBehaviorIntensity,
  isBehaviorTrigger,
  isBehaviorValue,
  isCoughSneezeFrequency,
  isCoughSneezeType,
  isDentalAction,
  isExpandedCareEventType,
  isMobilityObservation,
  isMoodEnergy,
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

type EventLike = Pick<
  EventModel,
  'details' | 'notes' | 'occurredAt' | 'photoUrl' | 'type'
>;

type EventPresentation = {
  accentColor?: string;
  cardBackgroundColor?: string;
  detail: string;
  emoji: string;
  iconBackgroundColor: string;
  iconBorderColor: string;
  title: string;
  titleColor: string;
};

export type EventDetailRow = {
  label: string;
  value: string;
};

const EVENT_STYLE: Record<
  BarklogEventType,
  Omit<EventPresentation, 'detail' | 'title'>
> = {
  appetite: {
    emoji: '🥣',
    iconBackgroundColor: '#F0F5E8',
    iconBorderColor: '#DCE6C8',
    titleColor: '#2F4017',
  },
  grooming: {
    emoji: '🛁',
    iconBackgroundColor: '#F2F4F6',
    iconBorderColor: '#DDE2E6',
    titleColor: '#1F2528',
  },
  behavior: {
    emoji: '🐕',
    iconBackgroundColor: '#FFF5EC',
    iconBorderColor: '#FFE0C2',
    titleColor: '#7A4510',
  },
  cough_sneeze: {
    emoji: '🤧',
    iconBackgroundColor: '#FCEBEB',
    iconBorderColor: '#F7C1C1',
    titleColor: '#791F1F',
  },
  dental: {
    emoji: '🦷',
    iconBackgroundColor: '#EEF4FB',
    iconBorderColor: '#D7E4F2',
    titleColor: '#1E3A5F',
  },
  meal: {
    emoji: '🍽️',
    iconBackgroundColor: '#F5FCF2',
    iconBorderColor: '#D3E9CD',
    titleColor: '#0F6A22',
  },
  medication: {
    accentColor: '#DCCBFF',
    cardBackgroundColor: '#F7F3FF',
    emoji: '💊',
    iconBackgroundColor: '#FBF7FF',
    iconBorderColor: '#D9CCFF',
    titleColor: '#5A34C3',
  },
  mood: {
    emoji: '😊',
    iconBackgroundColor: '#F5F0FF',
    iconBorderColor: '#E0D4F5',
    titleColor: '#4A3580',
  },
  mobility: {
    emoji: '🐾',
    iconBackgroundColor: '#F1EFE8',
    iconBorderColor: '#D3D1C7',
    titleColor: '#444441',
  },
  note: {
    emoji: '📝',
    iconBackgroundColor: '#F2F4F6',
    iconBorderColor: '#DDE2E6',
    titleColor: '#1F2528',
  },
  parasite_prevention: {
    emoji: '🛡️',
    iconBackgroundColor: '#F3F0FB',
    iconBorderColor: '#E2DCEF',
    titleColor: '#362B68',
  },
  pee: {
    emoji: '💧',
    iconBackgroundColor: '#EEF4FB',
    iconBorderColor: '#D7E4F2',
    titleColor: '#1E3A5F',
  },
  poop: {
    emoji: '💩',
    iconBackgroundColor: '#FFF6F4',
    iconBorderColor: '#FFD4CF',
    titleColor: '#9D3123',
  },
  symptom: {
    emoji: '⚕️',
    iconBackgroundColor: '#F2F4F6',
    iconBorderColor: '#DDE2E6',
    titleColor: '#1F2528',
  },
  training: {
    emoji: '🎓',
    iconBackgroundColor: '#EEF8EE',
    iconBorderColor: '#C8E6C8',
    titleColor: '#1B5E20',
  },
  rest: {
    emoji: '💤',
    iconBackgroundColor: '#F4F3EE',
    iconBorderColor: '#DDD9CE',
    titleColor: '#4B4638',
  },
  vet_visit: {
    emoji: '🏥',
    iconBackgroundColor: '#E1F5EE',
    iconBorderColor: '#9FE1CB',
    titleColor: '#085041',
  },
  vomit: {
    emoji: '🤢',
    iconBackgroundColor: '#FFF4E8',
    iconBorderColor: '#F3D3AD',
    titleColor: '#7A4510',
  },
  walk: {
    emoji: '🚶',
    iconBackgroundColor: '#FFF8E5',
    iconBorderColor: '#F2D37E',
    titleColor: '#9A6800',
  },
  water: {
    emoji: '💧',
    iconBackgroundColor: '#ECF7FF',
    iconBorderColor: '#CFE8FA',
    titleColor: '#145179',
  },
  weight: {
    emoji: '⚖️',
    iconBackgroundColor: '#F2F4F6',
    iconBorderColor: '#DDE2E6',
    titleColor: '#1F2528',
  },
};

function asDetailsRecord(value: Json | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json | undefined>;
}

function labelize(value: string) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getString(value: Json | undefined) {
  return typeof value === 'string' ? value : null;
}

function getNumber(value: Json | undefined) {
  return typeof value === 'number' ? value : null;
}

function getBoolean(value: Json | undefined) {
  return typeof value === 'boolean' ? value : null;
}

function getStringArray(value: Json | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function joinParts(parts: Array<string | null | undefined>, fallback: string) {
  const cleanParts = parts.filter((part): part is string =>
    Boolean(part && part.trim().length > 0),
  );

  return cleanParts.length > 0 ? cleanParts.join(' • ') : fallback;
}

function getEventTitle(event: EventLike) {
  const details = asDetailsRecord(event.details);

  if (event.type === 'meal') {
    const mealType = getString(details.meal_type);
    return mealType ? labelize(mealType) : 'Meal';
  }

  if (event.type === 'walk') {
    return 'Walk';
  }

  if (event.type === 'medication') {
    return 'Medication';
  }

  if (event.type === 'symptom') {
    const symptoms = getStringArray(details.symptoms);
    return symptoms[0] ? labelize(symptoms[0]) : 'Symptom';
  }

  if (event.type === 'mood') {
    const { mood } = details;
    return isMoodValue(mood) ? `${getMoodLabel(mood)} mood` : 'Mood';
  }

  if (event.type === 'behavior') {
    const { behavior } = details;
    return isBehaviorValue(behavior)
      ? `${getBehaviorLabel(behavior)} behavior`
      : 'Behavior';
  }

  if (event.type === 'training') {
    const stepTitle = getString(details.step_title);
    return stepTitle ? `Training: ${stepTitle}` : 'Training session';
  }

  if (isExpandedCareEventType(event.type)) {
    if (event.type === 'cough_sneeze') {
      const coughSneezeType = details.type;
      return isCoughSneezeType(coughSneezeType)
        ? getCoughSneezeTypeLabel(coughSneezeType)
        : getExpandedCareEventLabel(event.type);
    }

    return getExpandedCareEventLabel(event.type);
  }

  if (event.type === 'poop') {
    return 'Poop';
  }

  if (event.type === 'pee') {
    return 'Pee';
  }

  return labelize(event.type);
}

function getEventDetail(event: EventLike) {
  const details = asDetailsRecord(event.details);

  if (event.type === 'poop') {
    const quality = getString(details.quality);
    const color = getString(details.color);
    return joinParts(
      [quality ? `Quality: ${labelize(quality)}` : null, color],
      'Poop logged',
    );
  }

  if (event.type === 'pee') {
    const amount = getString(details.amount);
    return amount ? `${labelize(amount)} amount` : 'Quick log saved';
  }

  if (event.type === 'meal') {
    const amountCups = getNumber(details.amount_cups);
    const amountGrams = getNumber(details.amount_grams);
    const brand = getString(details.food_brand);
    return joinParts(
      [
        amountCups ? `${amountCups} cups` : null,
        amountGrams ? `${amountGrams} g` : null,
        brand && brand.trim().length > 0 ? brand : null,
      ],
      'Meal logged',
    );
  }

  if (event.type === 'walk') {
    const duration = getNumber(details.duration_min);
    const distance = getNumber(details.distance_mi);
    const energy = getString(details.energy_level);
    return joinParts(
      [
        duration ? `${duration} min` : null,
        distance ? `${distance} mi` : null,
        energy ? labelize(energy) : null,
      ],
      'Walk logged',
    );
  }

  if (event.type === 'medication') {
    const dose = getNumber(details.dose_mg);
    const withFood = getBoolean(details.given_with_food);
    const sideEffects = getStringArray(details.side_effects);
    return joinParts(
      [
        dose ? `${dose} mg` : null,
        withFood === true ? 'With food' : null,
        sideEffects.length > 0
          ? `${sideEffects.length} side effect note`
          : null,
      ],
      'Medication logged',
    );
  }

  if (event.type === 'symptom') {
    const severity = getString(details.severity);
    const symptoms = getStringArray(details.symptoms);
    return joinParts(
      [
        severity ? labelize(severity) : null,
        symptoms.length > 0 ? symptoms.map(labelize).join(', ') : null,
      ],
      'Observation saved',
    );
  }

  if (event.type === 'mood') {
    const { mood } = details;
    const { energy } = details;
    return joinParts(
      [
        isMoodValue(mood)
          ? `${getMoodEmoji(mood)} ${getMoodLabel(mood)}`
          : null,
        isMoodEnergy(energy) ? `${labelize(energy)} energy` : null,
      ],
      'Mood logged',
    );
  }

  if (event.type === 'behavior') {
    const { behavior } = details;
    const { trigger } = details;
    const { intensity } = details;
    return joinParts(
      [
        isBehaviorValue(behavior)
          ? `${getBehaviorEmoji(behavior)} ${getBehaviorLabel(behavior)}`
          : null,
        isBehaviorIntensity(intensity)
          ? `${labelize(intensity)} intensity`
          : null,
        isBehaviorTrigger(trigger)
          ? `Trigger: ${getBehaviorTriggerLabel(trigger)}`
          : null,
      ],
      'Behavior logged',
    );
  }

  if (event.type === 'training') {
    const programName = getString(details.program_name);
    const stepNumber = getNumber(details.step_number);
    const duration = getNumber(details.duration_min);
    const successRating = getNumber(details.success_rating);
    return joinParts(
      [
        programName,
        stepNumber ? `Step ${stepNumber}` : null,
        duration ? `${duration} min` : null,
        successRating ? `${successRating}/5 success` : null,
      ],
      'Training session logged',
    );
  }

  if (event.type === 'water') {
    const amount = getNumber(details.amount_oz);
    const { source } = details;
    return joinParts(
      [
        amount ? `${amount} oz` : null,
        isWaterSource(source) ? getWaterSourceLabel(source) : null,
      ],
      'Water logged',
    );
  }

  if (event.type === 'rest') {
    const duration = getNumber(details.duration_min);
    const { quality } = details;
    return joinParts(
      [
        duration ? `${duration} min` : null,
        isRestQuality(quality) ? getRestQualityLabel(quality) : null,
      ],
      'Rest logged',
    );
  }

  if (event.type === 'vomit') {
    const { appearance } = details;
    const { frequency } = details;
    return joinParts(
      [
        isVomitAppearance(appearance)
          ? getVomitAppearanceLabel(appearance)
          : null,
        isVomitFrequency(frequency) ? getVomitFrequencyLabel(frequency) : null,
      ],
      'Vomit observation logged',
    );
  }

  if (event.type === 'cough_sneeze') {
    const coughSneezeType = details.type;
    const { frequency } = details;
    return joinParts(
      [
        isCoughSneezeType(coughSneezeType)
          ? getCoughSneezeTypeLabel(coughSneezeType)
          : null,
        isCoughSneezeFrequency(frequency)
          ? getCoughSneezeFrequencyLabel(frequency)
          : null,
      ],
      'Cough or sneeze logged',
    );
  }

  if (event.type === 'mobility') {
    const { observation } = details;
    const { severity } = details;
    return joinParts(
      [
        isMobilityObservation(observation)
          ? getMobilityObservationLabel(observation)
          : null,
        isObservationSeverity(severity)
          ? getObservationSeverityLabel(severity)
          : null,
      ],
      'Mobility observation logged',
    );
  }

  if (event.type === 'appetite') {
    const { appetite } = details;
    return isAppetiteValue(appetite)
      ? getAppetiteLabel(appetite)
      : 'Appetite logged';
  }

  if (event.type === 'dental') {
    const { action } = details;
    return isDentalAction(action)
      ? getDentalActionLabel(action)
      : 'Dental care logged';
  }

  if (event.type === 'parasite_prevention') {
    const preventionType = details.prevention_type;
    const productName = getString(details.product_name);
    return joinParts(
      [
        isParasitePreventionType(preventionType)
          ? getParasitePreventionLabel(preventionType)
          : null,
        productName,
      ],
      'Prevention logged',
    );
  }

  if (event.type === 'vet_visit') {
    const visitType = details.visit_type;
    const clinicName = getString(details.clinic_name);
    return joinParts(
      [
        isVetVisitType(visitType) ? getVetVisitTypeLabel(visitType) : null,
        clinicName,
      ],
      'Vet visit logged',
    );
  }

  if (typeof event.notes === 'string' && event.notes.trim().length > 0) {
    return event.notes.trim();
  }

  return `${labelize(event.type)} logged`;
}

function pushRow(rows: EventDetailRow[], label: string, value?: string | null) {
  if (!value || value.trim().length === 0) {
    return;
  }

  rows.push({ label, value });
}

export function formatEventClock(timestamp: number | null | undefined) {
  if (!timestamp) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

export function formatEventDateTime(timestamp: number | null | undefined) {
  if (!timestamp) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

export function getEventPresentation(event: EventLike) {
  const style = EVENT_STYLE[event.type];
  const details = asDetailsRecord(event.details);
  const { mood } = details;
  const { behavior } = details;
  const { emoji: defaultEmoji } = style;
  let emoji = defaultEmoji;

  if (event.type === 'behavior' && isBehaviorValue(behavior)) {
    emoji = getBehaviorEmoji(behavior);
  } else if (event.type === 'mood' && isMoodValue(mood)) {
    emoji = getMoodEmoji(mood);
  } else if (isExpandedCareEventType(event.type)) {
    emoji = getExpandedCareEventEmoji(event.type);
  }

  return {
    ...style,
    emoji,
    detail: getEventDetail(event),
    title: getEventTitle(event),
  } satisfies EventPresentation;
}

export function buildEventDetailRows(event: EventLike) {
  const details = asDetailsRecord(event.details);
  const rows: EventDetailRow[] = [];
  const formatBoolean = (value: boolean | null) => {
    if (value === null) {
      return null;
    }

    return value ? 'Yes' : 'No';
  };

  pushRow(rows, 'Logged at', formatEventDateTime(event.occurredAt));

  if (event.type === 'poop') {
    pushRow(rows, 'Quality', labelize(getString(details.quality) ?? ''));
    pushRow(rows, 'Color', labelize(getString(details.color) ?? ''));
  } else if (event.type === 'pee') {
    pushRow(rows, 'Amount', labelize(getString(details.amount) ?? ''));
  } else if (event.type === 'meal') {
    pushRow(rows, 'Meal type', labelize(getString(details.meal_type) ?? ''));
    const amountCups = getNumber(details.amount_cups);
    const amountGrams = getNumber(details.amount_grams);
    pushRow(rows, 'Amount', amountCups ? `${amountCups} cups` : null);
    pushRow(rows, 'Amount', amountGrams ? `${amountGrams} g` : null);
    pushRow(rows, 'Food brand', getString(details.food_brand));
  } else if (event.type === 'walk') {
    const duration = getNumber(details.duration_min);
    const distance = getNumber(details.distance_mi);
    pushRow(rows, 'Duration', duration ? `${duration} minutes` : null);
    pushRow(rows, 'Distance', distance ? `${distance} miles` : null);
    pushRow(
      rows,
      'Energy level',
      labelize(getString(details.energy_level) ?? ''),
    );
    pushRow(rows, 'Source', labelize(getString(details.source) ?? 'manual'));
  } else if (event.type === 'medication') {
    pushRow(rows, 'Medication ID', getString(details.med_id));
    const dose = getNumber(details.dose_mg);
    pushRow(rows, 'Dose', dose ? `${dose} mg` : null);
    const withFood = getBoolean(details.given_with_food);
    pushRow(rows, 'Given with food', formatBoolean(withFood));
    const sideEffects = getStringArray(details.side_effects);
    pushRow(
      rows,
      'Side effects',
      sideEffects.length > 0 ? sideEffects.map(labelize).join(', ') : 'None',
    );
  } else if (event.type === 'symptom') {
    const categories = getStringArray(details.categories);
    const symptoms = getStringArray(details.symptoms);
    const bodyZones = getStringArray(details.body_zones);
    pushRow(rows, 'Severity', labelize(getString(details.severity) ?? ''));
    pushRow(
      rows,
      'Categories',
      categories.length > 0 ? categories.map(labelize).join(', ') : null,
    );
    pushRow(
      rows,
      'Symptoms',
      symptoms.length > 0 ? symptoms.map(labelize).join(', ') : null,
    );
    pushRow(
      rows,
      'Body zones',
      bodyZones.length > 0 ? bodyZones.map(labelize).join(', ') : null,
    );
  } else if (event.type === 'mood') {
    const { mood } = details;
    const { energy } = details;
    pushRow(rows, 'Mood', isMoodValue(mood) ? getMoodLabel(mood) : null);
    pushRow(rows, 'Energy', isMoodEnergy(energy) ? labelize(energy) : null);
  } else if (event.type === 'behavior') {
    const { behavior } = details;
    const { trigger } = details;
    const { intensity } = details;
    const duration = getNumber(details.duration_min);
    const { context } = details;
    pushRow(
      rows,
      'Behavior',
      isBehaviorValue(behavior) ? getBehaviorLabel(behavior) : null,
    );
    pushRow(
      rows,
      'Trigger',
      isBehaviorTrigger(trigger) ? getBehaviorTriggerLabel(trigger) : null,
    );
    pushRow(
      rows,
      'Intensity',
      isBehaviorIntensity(intensity) ? labelize(intensity) : null,
    );
    pushRow(rows, 'Duration', duration ? `${duration} minutes` : null);
    pushRow(
      rows,
      'Context',
      isBehaviorContext(context) ? getBehaviorContextLabel(context) : null,
    );
  } else if (event.type === 'water') {
    const amount = getNumber(details.amount_oz);
    const { source } = details;
    pushRow(rows, 'Amount', amount ? `${amount} oz` : null);
    pushRow(
      rows,
      'Source',
      isWaterSource(source) ? getWaterSourceLabel(source) : null,
    );
  } else if (event.type === 'rest') {
    const duration = getNumber(details.duration_min);
    const { quality } = details;
    pushRow(rows, 'Duration', duration ? `${duration} minutes` : null);
    pushRow(
      rows,
      'Quality',
      isRestQuality(quality) ? getRestQualityLabel(quality) : null,
    );
  } else if (event.type === 'vomit') {
    const { appearance } = details;
    const { frequency } = details;
    pushRow(
      rows,
      'Appearance',
      isVomitAppearance(appearance)
        ? getVomitAppearanceLabel(appearance)
        : null,
    );
    pushRow(
      rows,
      'Frequency',
      isVomitFrequency(frequency) ? getVomitFrequencyLabel(frequency) : null,
    );
  } else if (event.type === 'cough_sneeze') {
    const coughSneezeType = details.type;
    const { frequency } = details;
    pushRow(
      rows,
      'Type',
      isCoughSneezeType(coughSneezeType)
        ? getCoughSneezeTypeLabel(coughSneezeType)
        : null,
    );
    pushRow(
      rows,
      'Frequency',
      isCoughSneezeFrequency(frequency)
        ? getCoughSneezeFrequencyLabel(frequency)
        : null,
    );
  } else if (event.type === 'mobility') {
    const { observation } = details;
    const { severity } = details;
    pushRow(
      rows,
      'Observation',
      isMobilityObservation(observation)
        ? getMobilityObservationLabel(observation)
        : null,
    );
    pushRow(
      rows,
      'Severity',
      isObservationSeverity(severity)
        ? getObservationSeverityLabel(severity)
        : null,
    );
  } else if (event.type === 'appetite') {
    const { appetite } = details;
    pushRow(
      rows,
      'Appetite',
      isAppetiteValue(appetite) ? getAppetiteLabel(appetite) : null,
    );
  } else if (event.type === 'dental') {
    const { action } = details;
    pushRow(
      rows,
      'Action',
      isDentalAction(action) ? getDentalActionLabel(action) : null,
    );
  } else if (event.type === 'parasite_prevention') {
    const preventionType = details.prevention_type;
    pushRow(
      rows,
      'Prevention type',
      isParasitePreventionType(preventionType)
        ? getParasitePreventionLabel(preventionType)
        : null,
    );
    pushRow(rows, 'Product', getString(details.product_name));
  } else if (event.type === 'vet_visit') {
    const visitType = details.visit_type;
    pushRow(
      rows,
      'Visit type',
      isVetVisitType(visitType) ? getVetVisitTypeLabel(visitType) : null,
    );
    pushRow(rows, 'Clinic', getString(details.clinic_name));
  } else if (event.type === 'training') {
    const duration = getNumber(details.duration_min);
    const successRating = getNumber(details.success_rating);
    const dogMood = getString(details.dog_mood);
    pushRow(rows, 'Program', getString(details.program_name));
    pushRow(
      rows,
      'Step',
      getNumber(details.step_number)
        ? `Step ${getNumber(details.step_number)}`
        : null,
    );
    pushRow(rows, 'Step title', getString(details.step_title));
    pushRow(rows, 'Duration', duration ? `${duration} minutes` : null);
    pushRow(
      rows,
      'Success rating',
      successRating ? `${successRating} of 5` : null,
    );
    pushRow(
      rows,
      'Dog mood',
      isMoodValue(dogMood) ? getMoodLabel(dogMood) : null,
    );
    pushRow(rows, 'Enrollment ID', getString(details.enrollment_id));
  }

  pushRow(rows, 'Notes', event.notes);
  pushRow(rows, 'Photo', event.photoUrl ? 'Attached' : null);

  return rows;
}
