import type { BarklogDogRow } from '@/api/auth';
import type { TrainingProgramWithSteps } from '@/api/training';
import { listLocalEventsForDogRange } from '@/db';
import type { TrainingEnrollmentModel } from '@/db/models';
import { summarizeEvents } from '@/features/insights/utils/insightSummaries';
import type { TrainingInsightContext } from '@/types/training';

export type TrainingInsightEnrollmentLike = Pick<
  TrainingEnrollmentModel,
  'currentStep' | 'status'
>;

const TRAINING_LOOKBACK_DAYS = 14;

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

function normalizeCurrentStep(enrollment: TrainingInsightEnrollmentLike) {
  return Math.max(1, enrollment.currentStep);
}

export function buildTrainingInsightContext(input: {
  dog: BarklogDogRow;
  enrollment: TrainingInsightEnrollmentLike;
  events: Parameters<typeof summarizeEvents>[0];
  program: TrainingProgramWithSteps;
}): TrainingInsightContext {
  const summary = summarizeEvents(input.events);

  return {
    behavior_summary: summary.behaviorSummary,
    dog: {
      age: getDogAgeYears(input.dog),
      breed: input.dog.breed,
      id: input.dog.id,
      name: input.dog.name,
      weight_lbs: input.dog.weight_lbs,
    },
    enrollment: {
      current_step: normalizeCurrentStep(input.enrollment),
      program_name: input.program.name,
      total_steps: input.program.steps.length,
    },
    mood_summary: summary.moodSummary,
    training_summary: summary.trainingSummary,
  };
}

export function hasEnoughTrainingInsightActivity(
  context: TrainingInsightContext,
) {
  return !context.training_summary.startsWith('No training sessions recorded.');
}

export function buildAskAiTrainingContext(input: {
  activeProgramNames: string[];
  behaviorSummary: string;
  moodSummary: string;
  trainingSummary: string;
}) {
  const activePrograms =
    input.activeProgramNames.length > 0
      ? input.activeProgramNames.join(', ')
      : 'No active training programs saved.';

  return [
    `Active training programs: ${activePrograms}`,
    `Recent training: ${input.trainingSummary}`,
    `Recent behavior patterns: ${input.behaviorSummary}`,
    `Recent mood patterns: ${input.moodSummary}`,
  ].join(' ');
}

export async function loadTrainingInsightContext(input: {
  dog: BarklogDogRow;
  enrollment: TrainingInsightEnrollmentLike;
  now?: number;
  program: TrainingProgramWithSteps;
}) {
  const endAt = input.now ?? Date.now();
  const startAt = endAt - TRAINING_LOOKBACK_DAYS * 86_400_000;
  const events = await listLocalEventsForDogRange({
    dogId: input.dog.id,
    endAt,
    startAt,
  });

  return buildTrainingInsightContext({
    dog: input.dog,
    enrollment: input.enrollment,
    events,
    program: input.program,
  });
}
