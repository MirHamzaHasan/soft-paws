import type { TrainingProgramWithSteps } from '@/api/training';

import { makeDogRow, makeEventModel } from '../../../../test/utils/builders';
import {
  buildAskAiTrainingContext,
  buildTrainingInsightContext,
  hasEnoughTrainingInsightActivity,
} from './trainingInsightContext';

jest.mock('@/db', () => ({
  listActiveMedicationsForDog: jest.fn(),
  listLocalEventsForDogDate: jest.fn(),
  listLocalEventsForDogRange: jest.fn(),
}));

const program: TrainingProgramWithSteps = {
  category: 'leash_skills',
  created_at: '2026-04-01T00:00:00.000Z',
  description: 'Practice calm leash movement with rewards.',
  difficulty: 'beginner',
  estimated_days: 10,
  icon: '🚶',
  id: 'program-1',
  name: 'Loose leash walking',
  slug: 'loose-leash-walking',
  sort_order: 2,
  steps: [
    {
      created_at: '2026-04-01T00:00:00.000Z',
      estimated_duration_min: 10,
      id: 'step-1',
      instruction: 'Reward beside your leg for one quiet step.',
      program_id: 'program-1',
      step_number: 1,
      tip: 'Use high-value treats in busy places.',
      title: 'Reward position',
    },
    {
      created_at: '2026-04-01T00:00:00.000Z',
      estimated_duration_min: 12,
      id: 'step-2',
      instruction: 'Add two calm steps before the reward.',
      program_id: 'program-1',
      step_number: 2,
      tip: 'Short sessions count.',
      title: 'Add distance',
    },
  ],
};

describe('training insight context', () => {
  it('summarizes training, behavior, and mood events for the Edge Function', () => {
    const context = buildTrainingInsightContext({
      dog: makeDogRow({
        birthdate: null,
      }),
      enrollment: {
        currentStep: 2,
        status: 'active',
      },
      events: [
        makeEventModel({
          details: {
            behavior: 'barking',
            intensity: 'moderate',
            trigger: 'guests',
          },
          id: 'behavior-1',
          type: 'behavior',
        }),
        makeEventModel({
          details: {
            energy: 'normal',
            mood: 'calm',
          },
          id: 'mood-1',
          type: 'mood',
        }),
        makeEventModel({
          details: {
            dog_mood: 'calm',
            enrollment_id: 'enrollment-1',
            program_name: 'Loose leash walking',
            step_number: 2,
            step_title: 'Add distance',
            success_rating: 4,
          },
          id: 'training-1',
          type: 'training',
        }),
      ],
      program,
    });

    expect(context.dog).toMatchObject({
      age: null,
      id: 'dog-1',
      name: 'Milo',
    });
    expect(context.enrollment).toEqual({
      current_step: 2,
      program_name: 'Loose leash walking',
      total_steps: 2,
    });
    expect(context.behavior_summary).toContain('Top behavior: Barking (1)');
    expect(context.mood_summary).toContain('Top mood: Calm (1)');
    expect(context.training_summary).toContain('1 training session');
    expect(hasEnoughTrainingInsightActivity(context)).toBe(true);
  });

  it('detects when there is not enough training activity for AI generation', () => {
    const context = buildTrainingInsightContext({
      dog: makeDogRow(),
      enrollment: {
        currentStep: 1,
        status: 'active',
      },
      events: [],
      program,
    });

    expect(context.training_summary).toBe('No training sessions recorded.');
    expect(hasEnoughTrainingInsightActivity(context)).toBe(false);
  });

  it('builds an Ask BarkLog AI training context with active programs', () => {
    const context = buildAskAiTrainingContext({
      activeProgramNames: ['Loose leash walking'],
      behaviorSummary: 'Top behavior: Pulling (3)',
      moodSummary: 'Top mood: Calm (2)',
      trainingSummary: '3 training sessions, Average success rating: 4/5',
    });

    expect(context).toContain('Active training programs: Loose leash walking');
    expect(context).toContain('Recent training: 3 training sessions');
    expect(context).toContain('Recent behavior patterns: Top behavior');
    expect(context).toContain('Recent mood patterns: Top mood');
  });
});
