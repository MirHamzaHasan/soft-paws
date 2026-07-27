export * from './expandedCareEvents';

export type MoodValue =
  | 'happy'
  | 'calm'
  | 'anxious'
  | 'lethargic'
  | 'hyper'
  | 'clingy'
  | 'off';

export type MoodEnergy = 'low' | 'normal' | 'high';

export type MoodDetails = {
  mood: MoodValue;
  energy: MoodEnergy;
};

export type BehaviorValue =
  | 'barking'
  | 'pulling'
  | 'jumping'
  | 'aggression'
  | 'anxiety'
  | 'destructive'
  | 'reactivity'
  | 'other';

export type BehaviorTrigger =
  | 'strangers'
  | 'dogs'
  | 'noises'
  | 'separation'
  | 'food'
  | 'guests'
  | 'car'
  | 'vet'
  | 'unknown'
  | 'other';

export type BehaviorIntensity = 'mild' | 'moderate' | 'severe';

export type BehaviorContext =
  | 'walk'
  | 'home'
  | 'car'
  | 'vet'
  | 'park'
  | 'guests'
  | 'alone';

export type BehaviorDetails = {
  behavior: BehaviorValue;
  trigger?: BehaviorTrigger;
  intensity: BehaviorIntensity;
  duration_min?: number;
  context?: BehaviorContext;
};

export type TrainingDetails = {
  enrollment_id: string;
  program_name: string;
  step_number: number;
  step_title: string;
  duration_min?: number;
  success_rating?: number;
  dog_mood?: MoodValue;
};

export type MoodOption = {
  emoji: string;
  label: string;
  value: MoodValue;
};

export type MoodEnergyOption = {
  label: string;
  value: MoodEnergy;
};

export type BehaviorOption = {
  emoji: string;
  label: string;
  value: BehaviorValue;
};

export type BehaviorTriggerOption = {
  label: string;
  value: BehaviorTrigger;
};

export type BehaviorIntensityOption = {
  label: string;
  value: BehaviorIntensity;
};

export type BehaviorContextOption = {
  label: string;
  value: BehaviorContext;
};

export const MOOD_OPTIONS: readonly MoodOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' },
  { emoji: '😴', label: 'Lethargic', value: 'lethargic' },
  { emoji: '🤪', label: 'Hyper', value: 'hyper' },
  { emoji: '🥺', label: 'Clingy', value: 'clingy' },
  { emoji: '😶', label: 'Off', value: 'off' },
] as const;

export const MOOD_ENERGY_OPTIONS: readonly MoodEnergyOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
] as const;

export const BEHAVIOR_OPTIONS: readonly BehaviorOption[] = [
  { emoji: '🐕', label: 'Barking', value: 'barking' },
  { emoji: '🦮', label: 'Pulling', value: 'pulling' },
  { emoji: '⬆️', label: 'Jumping', value: 'jumping' },
  { emoji: '⚠️', label: 'Aggression', value: 'aggression' },
  { emoji: '😟', label: 'Anxiety', value: 'anxiety' },
  { emoji: '🧸', label: 'Destructive', value: 'destructive' },
  { emoji: '👀', label: 'Reactivity', value: 'reactivity' },
  { emoji: '🐾', label: 'Other', value: 'other' },
] as const;

export const BEHAVIOR_TRIGGER_OPTIONS: readonly BehaviorTriggerOption[] = [
  { label: 'Strangers', value: 'strangers' },
  { label: 'Dogs', value: 'dogs' },
  { label: 'Noises', value: 'noises' },
  { label: 'Separation', value: 'separation' },
  { label: 'Food', value: 'food' },
  { label: 'Guests', value: 'guests' },
  { label: 'Car', value: 'car' },
  { label: 'Vet', value: 'vet' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Other', value: 'other' },
] as const;

export const BEHAVIOR_INTENSITY_OPTIONS: readonly BehaviorIntensityOption[] = [
  { label: 'Mild', value: 'mild' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Severe', value: 'severe' },
] as const;

export const BEHAVIOR_CONTEXT_OPTIONS: readonly BehaviorContextOption[] = [
  { label: 'Walk', value: 'walk' },
  { label: 'Home', value: 'home' },
  { label: 'Car', value: 'car' },
  { label: 'Vet', value: 'vet' },
  { label: 'Park', value: 'park' },
  { label: 'Guests', value: 'guests' },
  { label: 'Alone', value: 'alone' },
] as const;

const MOOD_LABELS = MOOD_OPTIONS.reduce<Record<MoodValue, string>>(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {
    anxious: 'Anxious',
    calm: 'Calm',
    clingy: 'Clingy',
    happy: 'Happy',
    hyper: 'Hyper',
    lethargic: 'Lethargic',
    off: 'Off',
  },
);

const MOOD_EMOJIS = MOOD_OPTIONS.reduce<Record<MoodValue, string>>(
  (emojis, option) => ({
    ...emojis,
    [option.value]: option.emoji,
  }),
  {
    anxious: '😟',
    calm: '😌',
    clingy: '🥺',
    happy: '😊',
    hyper: '🤪',
    lethargic: '😴',
    off: '😶',
  },
);

const BEHAVIOR_LABELS = BEHAVIOR_OPTIONS.reduce<Record<BehaviorValue, string>>(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {
    aggression: 'Aggression',
    anxiety: 'Anxiety',
    barking: 'Barking',
    destructive: 'Destructive',
    jumping: 'Jumping',
    other: 'Other',
    pulling: 'Pulling',
    reactivity: 'Reactivity',
  },
);

const BEHAVIOR_EMOJIS = BEHAVIOR_OPTIONS.reduce<Record<BehaviorValue, string>>(
  (emojis, option) => ({
    ...emojis,
    [option.value]: option.emoji,
  }),
  {
    aggression: '⚠️',
    anxiety: '😟',
    barking: '🐕',
    destructive: '🧸',
    jumping: '⬆️',
    other: '🐾',
    pulling: '🦮',
    reactivity: '👀',
  },
);

const BEHAVIOR_TRIGGER_LABELS = BEHAVIOR_TRIGGER_OPTIONS.reduce<
  Record<BehaviorTrigger, string>
>(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {
    car: 'Car',
    dogs: 'Dogs',
    food: 'Food',
    guests: 'Guests',
    noises: 'Noises',
    other: 'Other',
    separation: 'Separation',
    strangers: 'Strangers',
    unknown: 'Unknown',
    vet: 'Vet',
  },
);

const BEHAVIOR_CONTEXT_LABELS = BEHAVIOR_CONTEXT_OPTIONS.reduce<
  Record<BehaviorContext, string>
>(
  (labels, option) => ({
    ...labels,
    [option.value]: option.label,
  }),
  {
    alone: 'Alone',
    car: 'Car',
    guests: 'Guests',
    home: 'Home',
    park: 'Park',
    vet: 'Vet',
    walk: 'Walk',
  },
);

export function isMoodValue(value: unknown): value is MoodValue {
  return MOOD_OPTIONS.some((option) => option.value === value);
}

export function isMoodEnergy(value: unknown): value is MoodEnergy {
  return MOOD_ENERGY_OPTIONS.some((option) => option.value === value);
}

export function getMoodLabel(value: MoodValue) {
  return MOOD_LABELS[value];
}

export function getMoodEmoji(value: MoodValue) {
  return MOOD_EMOJIS[value];
}

export function isBehaviorValue(value: unknown): value is BehaviorValue {
  return BEHAVIOR_OPTIONS.some((option) => option.value === value);
}

export function isBehaviorTrigger(value: unknown): value is BehaviorTrigger {
  return BEHAVIOR_TRIGGER_OPTIONS.some((option) => option.value === value);
}

export function isBehaviorIntensity(
  value: unknown,
): value is BehaviorIntensity {
  return BEHAVIOR_INTENSITY_OPTIONS.some((option) => option.value === value);
}

export function isBehaviorContext(value: unknown): value is BehaviorContext {
  return BEHAVIOR_CONTEXT_OPTIONS.some((option) => option.value === value);
}

export function getBehaviorLabel(value: BehaviorValue) {
  return BEHAVIOR_LABELS[value];
}

export function getBehaviorEmoji(value: BehaviorValue) {
  return BEHAVIOR_EMOJIS[value];
}

export function getBehaviorTriggerLabel(value: BehaviorTrigger) {
  return BEHAVIOR_TRIGGER_LABELS[value];
}

export function getBehaviorContextLabel(value: BehaviorContext) {
  return BEHAVIOR_CONTEXT_LABELS[value];
}
