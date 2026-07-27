import type { TrainingProgramWithSteps } from '@/api/training';
import type { TrainingEnrollmentModel } from '@/db/models';
import type {
  TrainingEnrollmentStatus,
  TrainingProgramCategory,
  TrainingProgramDifficulty,
} from '@/types/training';

export type TrainingEnrollmentLike = Pick<
  TrainingEnrollmentModel,
  'completedAt' | 'currentStep' | 'id' | 'programId' | 'status'
>;

export type TrainingProgress = {
  completedSteps: number;
  currentStep: number;
  isComplete: boolean;
  label: string;
  percent: number;
  totalSteps: number;
};

export type TrainingProgramGroup = {
  category: TrainingProgramCategory;
  label: string;
  programs: TrainingProgramWithSteps[];
};

export type TrainingEnrollmentUpdatePlan = {
  completedAt?: number;
  currentStep: number;
  status: TrainingEnrollmentStatus;
};

const CATEGORY_ORDER: TrainingProgramCategory[] = [
  'obedience',
  'leash_skills',
  'socialization',
  'puppy_basics',
  'behavior_modification',
  'tricks',
];

const CATEGORY_LABELS: Record<TrainingProgramCategory, string> = {
  behavior_modification: 'Behavior support',
  leash_skills: 'Leash skills',
  obedience: 'Obedience',
  puppy_basics: 'Puppy basics',
  socialization: 'Socialization',
  tricks: 'Tricks',
};

const CATEGORY_EMOJIS: Record<TrainingProgramCategory, string> = {
  behavior_modification: '👀',
  leash_skills: '🚶',
  obedience: '🎓',
  puppy_basics: '🏠',
  socialization: '🤝',
  tricks: '⭐',
};

const DIFFICULTY_LABELS: Record<TrainingProgramDifficulty, string> = {
  advanced: 'Advanced',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getTrainingCategoryLabel(category: TrainingProgramCategory) {
  return CATEGORY_LABELS[category];
}

export function getTrainingCategoryEmoji(category: TrainingProgramCategory) {
  return CATEGORY_EMOJIS[category];
}

export function getTrainingDifficultyLabel(
  difficulty: TrainingProgramDifficulty,
) {
  return DIFFICULTY_LABELS[difficulty];
}

export function groupTrainingProgramsByCategory(
  programs: TrainingProgramWithSteps[],
): TrainingProgramGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    programs: programs.filter((program) => program.category === category),
  })).filter((group) => group.programs.length > 0);
}

export function getTrainingEnrollmentForProgram(
  enrollments: TrainingEnrollmentLike[],
  programId: string,
) {
  return (
    enrollments.find(
      (enrollment) =>
        enrollment.programId === programId && enrollment.status !== 'abandoned',
    ) ?? null
  );
}

export function getTrainingProgress(
  enrollment: TrainingEnrollmentLike | null | undefined,
  totalSteps: number,
): TrainingProgress {
  const safeTotalSteps = Math.max(totalSteps, 0);

  if (safeTotalSteps === 0) {
    return {
      completedSteps: 0,
      currentStep: 0,
      isComplete: false,
      label: 'No steps yet',
      percent: 0,
      totalSteps: 0,
    };
  }

  if (!enrollment) {
    return {
      completedSteps: 0,
      currentStep: 1,
      isComplete: false,
      label: `Step 1 of ${safeTotalSteps}`,
      percent: 0,
      totalSteps: safeTotalSteps,
    };
  }

  const isComplete = enrollment.status === 'completed';
  const currentStep = isComplete
    ? safeTotalSteps
    : clamp(enrollment.currentStep, 1, safeTotalSteps);
  const completedSteps = isComplete
    ? safeTotalSteps
    : clamp(currentStep - 1, 0, safeTotalSteps);
  const percent = Math.round((completedSteps / safeTotalSteps) * 100);

  return {
    completedSteps,
    currentStep,
    isComplete,
    label: isComplete
      ? `${safeTotalSteps} of ${safeTotalSteps} steps complete`
      : `Step ${currentStep} of ${safeTotalSteps}`,
    percent,
    totalSteps: safeTotalSteps,
  };
}

export function getCurrentTrainingStep(
  program: TrainingProgramWithSteps,
  enrollment: TrainingEnrollmentLike | null | undefined,
) {
  if (program.steps.length === 0) {
    return null;
  }

  const progress = getTrainingProgress(enrollment, program.steps.length);

  return (
    program.steps.find((step) => step.step_number === progress.currentStep) ??
    program.steps[0] ??
    null
  );
}

export function getNextTrainingEnrollmentUpdate(
  enrollment: TrainingEnrollmentLike,
  totalSteps: number,
  completedAt: number,
): TrainingEnrollmentUpdatePlan {
  const progress = getTrainingProgress(enrollment, totalSteps);

  if (progress.currentStep >= progress.totalSteps) {
    return {
      completedAt,
      currentStep: progress.totalSteps,
      status: 'completed',
    };
  }

  return {
    currentStep: progress.currentStep + 1,
    status: 'active',
  };
}

export function getActiveTrainingProgramPairs(
  programs: TrainingProgramWithSteps[],
  enrollments: TrainingEnrollmentLike[],
) {
  return enrollments
    .filter(
      (enrollment) =>
        enrollment.status === 'active' || enrollment.status === 'paused',
    )
    .map((enrollment) => ({
      enrollment,
      program:
        programs.find((program) => program.id === enrollment.programId) ?? null,
    }))
    .filter(
      (
        pair,
      ): pair is {
        enrollment: TrainingEnrollmentLike;
        program: TrainingProgramWithSteps;
      } => pair.program !== null,
    );
}
