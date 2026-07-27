import type { TrainingProgramWithSteps } from '@/api/training';
import StorageManager from '@/managers/StorageManager';

import {
  createFreeWeeklyTrainingProgramCache,
  type FreeWeeklyTrainingProgramCache,
  isFreshFreeWeeklyTrainingProgramCache,
} from './freeTrainingRotation';

const FREE_WEEKLY_TRAINING_PROGRAM_CACHE_KEY =
  'barklog.training.freeWeeklyProgram.v1';

export function cacheFreeWeeklyTrainingProgram(
  program: TrainingProgramWithSteps,
  date = new Date(),
) {
  StorageManager.setObject(
    FREE_WEEKLY_TRAINING_PROGRAM_CACHE_KEY,
    createFreeWeeklyTrainingProgramCache(program, date),
  );
}

export function getCachedFreeWeeklyTrainingProgram(date = new Date()) {
  const cachedProgram =
    StorageManager.getObject<FreeWeeklyTrainingProgramCache>(
      FREE_WEEKLY_TRAINING_PROGRAM_CACHE_KEY,
    );

  if (!isFreshFreeWeeklyTrainingProgramCache(cachedProgram, date)) {
    return null;
  }

  return cachedProgram?.program ?? null;
}
