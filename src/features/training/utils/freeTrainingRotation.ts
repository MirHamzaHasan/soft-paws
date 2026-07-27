import type { TrainingProgramWithSteps } from '@/api/training';

export type FreeWeeklyTrainingProgramCache = {
  cachedAt: string;
  isoWeekKey: string;
  program: TrainingProgramWithSteps;
};

export type TrainingProgramReadAccess = 'free_this_week' | 'locked' | 'premium';

const MS_PER_DAY = 86_400_000;

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function getIsoWeekParts(date: Date) {
  const utcDate = startOfUtcDay(date);
  const dayOfWeek = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek);

  const isoYear = utcDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7,
  );

  return { isoWeek, isoYear };
}

export function getIsoWeekKey(date = new Date()) {
  const { isoWeek, isoYear } = getIsoWeekParts(date);

  return `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
}

export function sortTrainingProgramsForRotation(
  programs: TrainingProgramWithSteps[],
) {
  return [...programs].sort(
    (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name),
  );
}

export function getFreeWeeklyTrainingProgram(
  programs: TrainingProgramWithSteps[],
  date = new Date(),
) {
  const sortedPrograms = sortTrainingProgramsForRotation(programs);

  if (sortedPrograms.length === 0) {
    return null;
  }

  const { isoWeek, isoYear } = getIsoWeekParts(date);
  const rotationIndex = (isoYear * 53 + isoWeek - 1) % sortedPrograms.length;

  return sortedPrograms[rotationIndex] ?? null;
}

export function createFreeWeeklyTrainingProgramCache(
  program: TrainingProgramWithSteps,
  date = new Date(),
): FreeWeeklyTrainingProgramCache {
  return {
    cachedAt: new Date().toISOString(),
    isoWeekKey: getIsoWeekKey(date),
    program,
  };
}

export function isFreshFreeWeeklyTrainingProgramCache(
  cache: FreeWeeklyTrainingProgramCache | null | undefined,
  date = new Date(),
) {
  return Boolean(
    cache?.program?.slug && cache.isoWeekKey === getIsoWeekKey(date),
  );
}

export function getTrainingProgramReadAccess(input: {
  freeProgram: TrainingProgramWithSteps | null | undefined;
  premiumAccess: boolean;
  programSlug: string | null | undefined;
}): TrainingProgramReadAccess {
  if (input.premiumAccess) {
    return 'premium';
  }

  if (input.freeProgram?.slug && input.programSlug === input.freeProgram.slug) {
    return 'free_this_week';
  }

  return 'locked';
}
