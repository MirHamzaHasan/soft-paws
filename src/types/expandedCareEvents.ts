export type ExpandedCareEventType =
  | 'appetite'
  | 'cough_sneeze'
  | 'dental'
  | 'mobility'
  | 'parasite_prevention'
  | 'rest'
  | 'vet_visit'
  | 'vomit'
  | 'water';

export type WaterSource = 'bowl' | 'fountain' | 'outside' | 'other';
export type RestQuality = 'settled' | 'restless' | 'interrupted';
export type VomitAppearance = 'food' | 'bile' | 'foam' | 'water' | 'unknown';
export type VomitFrequency = 'once' | 'multiple';
export type CoughSneezeType = 'cough' | 'sneeze' | 'reverse_sneeze';
export type CoughSneezeFrequency = 'frequent' | 'occasional' | 'once';
export type MobilityObservation =
  | 'limping'
  | 'normal'
  | 'other'
  | 'reluctant_stairs'
  | 'slow_to_rise'
  | 'stiff';
export type ObservationSeverity = 'mild' | 'moderate' | 'severe';
export type AppetiteValue =
  | 'less_than_usual'
  | 'more_than_usual'
  | 'normal'
  | 'refused'
  | 'skipped';
export type DentalAction =
  | 'brushing'
  | 'chew'
  | 'gum_note'
  | 'odor_note'
  | 'tooth_note';
export type ParasitePreventionType =
  | 'dewormer'
  | 'flea_tick'
  | 'heartworm'
  | 'other';
export type VetVisitType =
  | 'dental'
  | 'follow_up'
  | 'other'
  | 'sick_visit'
  | 'vaccination'
  | 'wellness';

export type WaterDetails = {
  amount_oz?: number;
  source?: WaterSource;
};

export type RestDetails = {
  duration_min?: number;
  quality?: RestQuality;
};

export type VomitDetails = {
  appearance?: VomitAppearance;
  frequency?: VomitFrequency;
};

export type CoughSneezeDetails = {
  frequency?: CoughSneezeFrequency;
  type: CoughSneezeType;
};

export type MobilityDetails = {
  observation: MobilityObservation;
  severity?: ObservationSeverity;
};

export type AppetiteDetails = {
  appetite: AppetiteValue;
};

export type DentalDetails = {
  action: DentalAction;
};

export type ParasitePreventionDetails = {
  prevention_type: ParasitePreventionType;
  product_name?: string;
};

export type VetVisitDetails = {
  clinic_name?: string;
  visit_type: VetVisitType;
};

export type ExpandedCareOption<TValue extends string> = {
  label: string;
  value: TValue;
};

export type ExpandedCareLogOption = {
  description: string;
  emoji: string;
  eventType: ExpandedCareEventType;
  safetyNote?: string;
  title: string;
};

export const WATER_SOURCE_OPTIONS: readonly ExpandedCareOption<WaterSource>[] =
  [
    { label: 'Bowl', value: 'bowl' },
    { label: 'Fountain', value: 'fountain' },
    { label: 'Outside', value: 'outside' },
    { label: 'Other', value: 'other' },
  ] as const;

export const REST_QUALITY_OPTIONS: readonly ExpandedCareOption<RestQuality>[] =
  [
    { label: 'Settled', value: 'settled' },
    { label: 'Restless', value: 'restless' },
    { label: 'Interrupted', value: 'interrupted' },
  ] as const;

export const VOMIT_APPEARANCE_OPTIONS: readonly ExpandedCareOption<VomitAppearance>[] =
  [
    { label: 'Food', value: 'food' },
    { label: 'Bile', value: 'bile' },
    { label: 'Foam', value: 'foam' },
    { label: 'Water', value: 'water' },
    { label: 'Unknown', value: 'unknown' },
  ] as const;

export const VOMIT_FREQUENCY_OPTIONS: readonly ExpandedCareOption<VomitFrequency>[] =
  [
    { label: 'Once', value: 'once' },
    { label: 'Multiple', value: 'multiple' },
  ] as const;

export const COUGH_SNEEZE_TYPE_OPTIONS: readonly ExpandedCareOption<CoughSneezeType>[] =
  [
    { label: 'Cough', value: 'cough' },
    { label: 'Sneeze', value: 'sneeze' },
    { label: 'Reverse sneeze', value: 'reverse_sneeze' },
  ] as const;

export const COUGH_SNEEZE_FREQUENCY_OPTIONS: readonly ExpandedCareOption<CoughSneezeFrequency>[] =
  [
    { label: 'Once', value: 'once' },
    { label: 'Occasional', value: 'occasional' },
    { label: 'Frequent', value: 'frequent' },
  ] as const;

export const MOBILITY_OBSERVATION_OPTIONS: readonly ExpandedCareOption<MobilityObservation>[] =
  [
    { label: 'Normal', value: 'normal' },
    { label: 'Stiff', value: 'stiff' },
    { label: 'Limping', value: 'limping' },
    { label: 'Slow to rise', value: 'slow_to_rise' },
    { label: 'Reluctant stairs', value: 'reluctant_stairs' },
    { label: 'Other', value: 'other' },
  ] as const;

export const OBSERVATION_SEVERITY_OPTIONS: readonly ExpandedCareOption<ObservationSeverity>[] =
  [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
  ] as const;

export const APPETITE_OPTIONS: readonly ExpandedCareOption<AppetiteValue>[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Less than usual', value: 'less_than_usual' },
  { label: 'More than usual', value: 'more_than_usual' },
  { label: 'Skipped', value: 'skipped' },
  { label: 'Refused', value: 'refused' },
] as const;

export const DENTAL_ACTION_OPTIONS: readonly ExpandedCareOption<DentalAction>[] =
  [
    { label: 'Brushing', value: 'brushing' },
    { label: 'Chew', value: 'chew' },
    { label: 'Odor note', value: 'odor_note' },
    { label: 'Gum note', value: 'gum_note' },
    { label: 'Tooth note', value: 'tooth_note' },
  ] as const;

export const PARASITE_PREVENTION_OPTIONS: readonly ExpandedCareOption<ParasitePreventionType>[] =
  [
    { label: 'Flea/tick', value: 'flea_tick' },
    { label: 'Heartworm', value: 'heartworm' },
    { label: 'Dewormer', value: 'dewormer' },
    { label: 'Other', value: 'other' },
  ] as const;

export const VET_VISIT_TYPE_OPTIONS: readonly ExpandedCareOption<VetVisitType>[] =
  [
    { label: 'Wellness', value: 'wellness' },
    { label: 'Sick visit', value: 'sick_visit' },
    { label: 'Follow-up', value: 'follow_up' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Dental', value: 'dental' },
    { label: 'Other', value: 'other' },
  ] as const;

const HEALTH_ESCALATION_COPY =
  'If this is repeated, severe, or your dog seems unwell or in distress, contact your vet or use Emergency/SOS.';

export const EXPANDED_CARE_LOG_OPTIONS: readonly ExpandedCareLogOption[] = [
  {
    description: 'Water intake source and amount.',
    emoji: '💧',
    eventType: 'water',
    title: 'Water',
  },
  {
    description: 'Rest duration and whether sleep seemed settled.',
    emoji: '💤',
    eventType: 'rest',
    title: 'Rest',
  },
  {
    description: 'Vomit appearance and frequency as an observation.',
    emoji: '🤢',
    eventType: 'vomit',
    safetyNote: HEALTH_ESCALATION_COPY,
    title: 'Vomit',
  },
  {
    description: 'Coughing, sneezing, or reverse-sneeze notes.',
    emoji: '🤧',
    eventType: 'cough_sneeze',
    safetyNote: HEALTH_ESCALATION_COPY,
    title: 'Cough / Sneeze',
  },
  {
    description: 'Movement observations like stiffness or stairs.',
    emoji: '🐾',
    eventType: 'mobility',
    safetyNote: HEALTH_ESCALATION_COPY,
    title: 'Mobility',
  },
  {
    description: 'Appetite changes without replacing meal logs.',
    emoji: '🥣',
    eventType: 'appetite',
    safetyNote: HEALTH_ESCALATION_COPY,
    title: 'Appetite',
  },
  {
    description: 'Brushing, chews, odor, gum, or tooth notes.',
    emoji: '🦷',
    eventType: 'dental',
    title: 'Dental',
  },
  {
    description: 'Flea/tick, heartworm, dewormer, or other prevention.',
    emoji: '🛡️',
    eventType: 'parasite_prevention',
    title: 'Prevention',
  },
  {
    description: 'Vet visit type and clinic notes.',
    emoji: '🏥',
    eventType: 'vet_visit',
    title: 'Vet Visit',
  },
] as const;

function includesOption<TValue extends string>(
  options: readonly ExpandedCareOption<TValue>[],
  value: unknown,
): value is TValue {
  return options.some((option) => option.value === value);
}

export function isExpandedCareEventType(
  value: unknown,
): value is ExpandedCareEventType {
  return EXPANDED_CARE_LOG_OPTIONS.some((option) => option.eventType === value);
}

export function isWaterSource(value: unknown): value is WaterSource {
  return includesOption(WATER_SOURCE_OPTIONS, value);
}

export function isRestQuality(value: unknown): value is RestQuality {
  return includesOption(REST_QUALITY_OPTIONS, value);
}

export function isVomitAppearance(value: unknown): value is VomitAppearance {
  return includesOption(VOMIT_APPEARANCE_OPTIONS, value);
}

export function isVomitFrequency(value: unknown): value is VomitFrequency {
  return includesOption(VOMIT_FREQUENCY_OPTIONS, value);
}

export function isCoughSneezeType(value: unknown): value is CoughSneezeType {
  return includesOption(COUGH_SNEEZE_TYPE_OPTIONS, value);
}

export function isCoughSneezeFrequency(
  value: unknown,
): value is CoughSneezeFrequency {
  return includesOption(COUGH_SNEEZE_FREQUENCY_OPTIONS, value);
}

export function isMobilityObservation(
  value: unknown,
): value is MobilityObservation {
  return includesOption(MOBILITY_OBSERVATION_OPTIONS, value);
}

export function isObservationSeverity(
  value: unknown,
): value is ObservationSeverity {
  return includesOption(OBSERVATION_SEVERITY_OPTIONS, value);
}

export function isAppetiteValue(value: unknown): value is AppetiteValue {
  return includesOption(APPETITE_OPTIONS, value);
}

export function isDentalAction(value: unknown): value is DentalAction {
  return includesOption(DENTAL_ACTION_OPTIONS, value);
}

export function isParasitePreventionType(
  value: unknown,
): value is ParasitePreventionType {
  return includesOption(PARASITE_PREVENTION_OPTIONS, value);
}

export function isVetVisitType(value: unknown): value is VetVisitType {
  return includesOption(VET_VISIT_TYPE_OPTIONS, value);
}

function getLabel<TValue extends string>(
  options: readonly ExpandedCareOption<TValue>[],
  value: TValue,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getExpandedCareEventOption(type: ExpandedCareEventType) {
  return EXPANDED_CARE_LOG_OPTIONS.find((option) => option.eventType === type);
}

export function getExpandedCareEventLabel(type: ExpandedCareEventType) {
  return getExpandedCareEventOption(type)?.title ?? type;
}

export function getExpandedCareEventEmoji(type: ExpandedCareEventType) {
  return getExpandedCareEventOption(type)?.emoji ?? '🐾';
}

export function getExpandedCareEventDescription(type: ExpandedCareEventType) {
  return getExpandedCareEventOption(type)?.description ?? 'Care observation.';
}

export function getExpandedCareEventSafetyNote(type: ExpandedCareEventType) {
  return getExpandedCareEventOption(type)?.safetyNote ?? null;
}

export function getWaterSourceLabel(value: WaterSource) {
  return getLabel(WATER_SOURCE_OPTIONS, value);
}

export function getRestQualityLabel(value: RestQuality) {
  return getLabel(REST_QUALITY_OPTIONS, value);
}

export function getVomitAppearanceLabel(value: VomitAppearance) {
  return getLabel(VOMIT_APPEARANCE_OPTIONS, value);
}

export function getVomitFrequencyLabel(value: VomitFrequency) {
  return getLabel(VOMIT_FREQUENCY_OPTIONS, value);
}

export function getCoughSneezeTypeLabel(value: CoughSneezeType) {
  return getLabel(COUGH_SNEEZE_TYPE_OPTIONS, value);
}

export function getCoughSneezeFrequencyLabel(value: CoughSneezeFrequency) {
  return getLabel(COUGH_SNEEZE_FREQUENCY_OPTIONS, value);
}

export function getMobilityObservationLabel(value: MobilityObservation) {
  return getLabel(MOBILITY_OBSERVATION_OPTIONS, value);
}

export function getObservationSeverityLabel(value: ObservationSeverity) {
  return getLabel(OBSERVATION_SEVERITY_OPTIONS, value);
}

export function getAppetiteLabel(value: AppetiteValue) {
  return getLabel(APPETITE_OPTIONS, value);
}

export function getDentalActionLabel(value: DentalAction) {
  return getLabel(DENTAL_ACTION_OPTIONS, value);
}

export function getParasitePreventionLabel(value: ParasitePreventionType) {
  return getLabel(PARASITE_PREVENTION_OPTIONS, value);
}

export function getVetVisitTypeLabel(value: VetVisitType) {
  return getLabel(VET_VISIT_TYPE_OPTIONS, value);
}
