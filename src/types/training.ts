import type { MoodValue } from './events';

export const TRAINING_PROGRAM_CATEGORIES = [
  'obedience',
  'behavior_modification',
  'socialization',
  'tricks',
  'puppy_basics',
  'leash_skills',
] as const;

export type TrainingProgramCategory =
  (typeof TRAINING_PROGRAM_CATEGORIES)[number];

export const TRAINING_PROGRAM_DIFFICULTIES = [
  'beginner',
  'intermediate',
  'advanced',
] as const;

export type TrainingProgramDifficulty =
  (typeof TRAINING_PROGRAM_DIFFICULTIES)[number];

export const TRAINING_ENROLLMENT_STATUSES = [
  'active',
  'paused',
  'completed',
  'abandoned',
] as const;

export type TrainingEnrollmentStatus =
  (typeof TRAINING_ENROLLMENT_STATUSES)[number];

export type TrainingSessionDogMood = MoodValue;

export type TrainingInsightContext = {
  behavior_summary: string;
  dog: {
    age: number | null;
    breed?: string | null;
    id: string;
    name: string;
    weight_lbs?: number | null;
  };
  enrollment: {
    current_step: number;
    program_name: string;
    total_steps: number;
  };
  mood_summary: string;
  training_summary: string;
};
