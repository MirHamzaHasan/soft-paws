import {
  createTrainingQueryViewState,
  listTrainingProgramsWithSteps,
  trainingProgramsQueryOptions,
} from '@/api/training';
import { TRAINING_PROGRAMS, TRAINING_STEPS } from '@/features/training/data/trainingPrograms';

jest.mock('@/db/training', () => ({
  listLocalTrainingEnrollmentsForDog: jest.fn(),
  listLocalTrainingSessionsForEnrollment: jest.fn(),
}));

describe('bundled training programs', () => {
  it('ships complete, ordered positive-reinforcement content offline', async () => {
    expect(TRAINING_PROGRAMS).toHaveLength(8);
    expect(TRAINING_STEPS).toHaveLength(53);
    const programs = await listTrainingProgramsWithSteps();
    expect(programs.map((program) => program.sort_order)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
    programs.forEach((program) => {
      expect(program.steps.length).toBeGreaterThanOrEqual(5);
      expect(program.steps.length).toBeLessThanOrEqual(8);
      expect(program.steps.map((step) => step.step_number)).toEqual(
        program.steps.map((_, index) => index + 1),
      );
    });
    const copy = JSON.stringify({ programs: TRAINING_PROGRAMS, steps: TRAINING_STEPS });
    expect(copy).not.toMatch(/\b(punish|dominance|alpha|shock|prong|choke|aversive)\b/i);
  });

  it('keeps TanStack query options and empty states', async () => {
    expect(trainingProgramsQueryOptions().queryKey).toEqual(['training', 'programs-with-steps']);
    expect(createTrainingQueryViewState({ data: [] })).toMatchObject({
      isEmpty: true,
      status: 'success',
    });
  });
});
