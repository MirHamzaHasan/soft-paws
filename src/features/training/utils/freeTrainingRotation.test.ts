import type { TrainingProgramWithSteps } from '@/api/training';

import {
  createFreeWeeklyTrainingProgramCache,
  getFreeWeeklyTrainingProgram,
  getIsoWeekKey,
  getTrainingProgramReadAccess,
  isFreshFreeWeeklyTrainingProgramCache,
  sortTrainingProgramsForRotation,
} from './freeTrainingRotation';

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

describe('free training rotation', () => {
  const programs = [
    makeProgram({
      id: 'program-3',
      name: 'Recall',
      slug: 'recall',
      sort_order: 30,
    }),
    makeProgram({
      id: 'program-1',
      name: 'Sit and stay',
      slug: 'sit-and-stay',
      sort_order: 10,
    }),
    makeProgram({
      id: 'program-2',
      name: 'Loose leash',
      slug: 'loose-leash',
      sort_order: 20,
    }),
  ];

  it('sorts programs by sort order before rotating', () => {
    expect(
      sortTrainingProgramsForRotation(programs).map((item) => item.slug),
    ).toEqual(['sit-and-stay', 'loose-leash', 'recall']);
  });

  it('selects exactly one deterministic free program for an ISO week', () => {
    const monday = new Date('2026-04-27T12:00:00.000Z');
    const sunday = new Date('2026-05-03T12:00:00.000Z');
    const nextWeek = new Date('2026-05-04T12:00:00.000Z');
    const mondayProgram = getFreeWeeklyTrainingProgram(programs, monday);
    const sundayProgram = getFreeWeeklyTrainingProgram(programs, sunday);
    const nextWeekProgram = getFreeWeeklyTrainingProgram(programs, nextWeek);

    expect(getIsoWeekKey(monday)).toBe('2026-W18');
    expect(getIsoWeekKey(sunday)).toBe('2026-W18');
    expect(mondayProgram).not.toBeNull();
    expect(sundayProgram?.slug).toBe(mondayProgram?.slug);
    expect(nextWeekProgram?.slug).not.toBe(mondayProgram?.slug);
  });

  it('returns null when no training programs are available', () => {
    expect(getFreeWeeklyTrainingProgram([], new Date('2026-04-27'))).toBeNull();
  });

  it('keeps free users limited to the selected weekly program', () => {
    const freeProgram = programs[0];

    if (!freeProgram) {
      throw new Error('Expected a free training program fixture.');
    }

    expect(
      getTrainingProgramReadAccess({
        freeProgram,
        premiumAccess: false,
        programSlug: freeProgram?.slug,
      }),
    ).toBe('free_this_week');
    expect(
      getTrainingProgramReadAccess({
        freeProgram,
        premiumAccess: false,
        programSlug: 'loose-leash',
      }),
    ).toBe('locked');
    expect(
      getTrainingProgramReadAccess({
        freeProgram,
        premiumAccess: true,
        programSlug: 'loose-leash',
      }),
    ).toBe('premium');
  });

  it('marks cached free programs stale after the week changes', () => {
    const freeProgram = programs[0];

    if (!freeProgram) {
      throw new Error('Expected a free training program fixture.');
    }

    const cached = createFreeWeeklyTrainingProgramCache(
      freeProgram,
      new Date('2026-04-27T12:00:00.000Z'),
    );

    expect(
      isFreshFreeWeeklyTrainingProgramCache(
        cached,
        new Date('2026-04-29T12:00:00.000Z'),
      ),
    ).toBe(true);
    expect(
      isFreshFreeWeeklyTrainingProgramCache(
        cached,
        new Date('2026-05-04T12:00:00.000Z'),
      ),
    ).toBe(false);
  });
});
