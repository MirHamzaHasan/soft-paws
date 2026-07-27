import type { TrainingProgramWithSteps } from '@/api/training';

import {
  getActiveTrainingProgramPairs,
  getNextTrainingEnrollmentUpdate,
  getTrainingEnrollmentForProgram,
  getTrainingProgress,
  groupTrainingProgramsByCategory,
  type TrainingEnrollmentLike,
} from './trainingPresentation';

function makeProgram(
  overrides: Partial<TrainingProgramWithSteps>,
): TrainingProgramWithSteps {
  return {
    category: 'obedience',
    created_at: '2026-04-27T00:00:00.000Z',
    description: 'Build a useful training skill.',
    difficulty: 'beginner',
    estimated_days: 7,
    icon: 'graduation-cap',
    id: 'program-1',
    name: 'Training program',
    slug: 'training-program',
    sort_order: 10,
    steps: [],
    ...overrides,
  };
}

function makeEnrollment(
  overrides: Partial<TrainingEnrollmentLike>,
): TrainingEnrollmentLike {
  return {
    completedAt: null,
    currentStep: 1,
    id: 'enrollment-1',
    programId: 'program-1',
    status: 'active',
    ...overrides,
  };
}

describe('training presentation helpers', () => {
  it('groups programs by caregiver-facing category order', () => {
    const grouped = groupTrainingProgramsByCategory([
      makeProgram({
        category: 'behavior_modification',
        id: 'program-2',
        name: 'Reactivity management',
      }),
      makeProgram({
        category: 'obedience',
        id: 'program-1',
        name: 'Recall',
      }),
    ]);

    expect(grouped.map((group) => group.label)).toEqual([
      'Obedience',
      'Behavior support',
    ]);
  });

  it('matches enrollments to programs while ignoring abandoned progress', () => {
    const enrollments = [
      makeEnrollment({ programId: 'program-1', status: 'abandoned' }),
      makeEnrollment({ id: 'enrollment-2', programId: 'program-1' }),
    ];

    expect(
      getTrainingEnrollmentForProgram(enrollments, 'program-1'),
    ).toMatchObject({ id: 'enrollment-2' });
  });

  it('calculates active and completed progress labels', () => {
    expect(
      getTrainingProgress(makeEnrollment({ currentStep: 3 }), 7),
    ).toMatchObject({
      completedSteps: 2,
      currentStep: 3,
      isComplete: false,
      label: 'Step 3 of 7',
      percent: 29,
    });

    expect(
      getTrainingProgress(makeEnrollment({ status: 'completed' }), 7),
    ).toMatchObject({
      completedSteps: 7,
      isComplete: true,
      label: '7 of 7 steps complete',
      percent: 100,
    });
  });

  it('plans local-first enrollment advancement and completion updates', () => {
    expect(
      getNextTrainingEnrollmentUpdate(
        makeEnrollment({ currentStep: 2 }),
        7,
        1_777_777,
      ),
    ).toEqual({
      currentStep: 3,
      status: 'active',
    });

    expect(
      getNextTrainingEnrollmentUpdate(
        makeEnrollment({ currentStep: 7 }),
        7,
        1_777_777,
      ),
    ).toEqual({
      completedAt: 1_777_777,
      currentStep: 7,
      status: 'completed',
    });
  });

  it('builds active program pairs for the hub', () => {
    const programs = [
      makeProgram({ id: 'program-1' }),
      makeProgram({ id: 'program-2' }),
    ];
    const pairs = getActiveTrainingProgramPairs(programs, [
      makeEnrollment({ id: 'active', programId: 'program-1' }),
      makeEnrollment({
        id: 'completed',
        programId: 'program-2',
        status: 'completed',
      }),
    ]);

    expect(pairs).toHaveLength(1);
    expect(pairs[0]?.enrollment.id).toBe('active');
  });
});
