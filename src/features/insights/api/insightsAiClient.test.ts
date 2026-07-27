import {
  ASK_BARKLOG_AI_PROMPT_VERSION,
  askBarkLogAi,
  CARE_SUMMARY_PROMPT_VERSION_CLIENT,
  generateCareSummary,
  generateTrainingInsight,
  generateVetReport,
  generateWeeklyInsight,
  TRAINING_INSIGHT_PROMPT_VERSION,
  VET_REPORT_PROMPT_VERSION_CLIENT,
  WEEKLY_INSIGHT_PROMPT_VERSION,
} from '@/features/insights/api/insightsAiClient';
import { BARKLOG_AI_SAFE_FAILURE_MESSAGE } from '@/features/insights/utils/aiSafety';
import type { WeeklyInsightContext } from '@/features/insights/utils/insightSummaries';

import { makeUserRow } from '../../../../test/utils/builders';

const mockInvoke = jest.fn();

jest.mock('@/api', () => ({
  getSupabaseClient: () => ({
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

const eventCounts = {
  appetite: 0,
  behavior: 1,
  cough_sneeze: 0,
  dental: 0,
  grooming: 0,
  meal: 2,
  medication: 1,
  mood: 2,
  mobility: 0,
  note: 0,
  parasite_prevention: 0,
  pee: 3,
  poop: 2,
  rest: 0,
  symptom: 0,
  training: 0,
  vet_visit: 0,
  vomit: 0,
  walk: 4,
  water: 0,
  weight: 0,
};

const weeklyContext: WeeklyInsightContext = {
  dog: {
    ageYears: 5,
    breed: 'Rescue mix',
    name: 'Milo',
    weightLbs: 28,
  },
  lastWeek: {
    eventCounts,
    eventsSummary: '10 total logs, 2 meals, 4 walks',
    behaviorCount: 0,
    behaviorSummary: 'No behavior logs recorded.',
    mealCount: 2,
    medicationCount: 1,
    moodCount: 1,
    moodSummary: 'Top mood: Calm (1), Top energy: normal (1)',
    poopAverage: 80,
    symptomCount: 0,
    trainingCount: 0,
    trainingSummary: 'No training sessions recorded.',
    walkMinutes: 120,
  },
  thisWeek: {
    eventCounts,
    eventsSummary: '12 total logs, 3 meals, 5 walks',
    behaviorCount: 1,
    behaviorSummary: 'Top behavior: Barking (1), Top trigger: Guests (1)',
    mealCount: 3,
    medicationCount: 1,
    moodCount: 2,
    moodSummary: 'Top mood: Happy (2), Top energy: high (1)',
    poopAverage: 90,
    symptomCount: 0,
    trainingCount: 0,
    trainingSummary: 'No training sessions recorded.',
    walkMinutes: 150,
  },
};

describe('insights AI client gates', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('does not invoke weekly insight Edge Function for expired users', async () => {
    await expect(
      generateWeeklyInsight({
        context: weeklyContext,
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
        weekStart: '2026-04-20',
      }),
    ).rejects.toThrow('BarkLog Premium is required');

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes weekly insight Edge Function without sending user subscription data', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        content: 'Milo logged a steadier walk rhythm this week.',
        generatedAt: '2026-04-26T00:00:00.000Z',
        promptVersion: WEEKLY_INSIGHT_PROMPT_VERSION,
      },
      error: null,
    });

    await expect(
      generateWeeklyInsight({
        context: weeklyContext,
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
        weekStart: '2026-04-20',
      }),
    ).resolves.toMatchObject({
      content: 'Milo logged a steadier walk rhythm this week.',
    });

    expect(mockInvoke).toHaveBeenCalledWith('generate-weekly-insight', {
      body: {
        context: weeklyContext,
        dogId: 'dog-1',
        promptVersion: WEEKLY_INSIGHT_PROMPT_VERSION,
        weekStart: '2026-04-20',
      },
    });
  });

  it('invokes Ask BarkLog AI through the Edge Function only for premium users', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        content: 'Milo had more walks this week. I cannot diagnose.',
        promptVersion: ASK_BARKLOG_AI_PROMPT_VERSION,
      },
      error: null,
    });

    await expect(
      askBarkLogAi({
        context: {
          currentMedicationsSummary: 'No active medications.',
          dog: weeklyContext.dog,
          last30DaysSummary: 'Milo logged walks and meals.',
          trainingContextSummary:
            'Active training programs: Loose leash walking. Recent training: 2 sessions.',
        },
        dogId: 'dog-1',
        question: 'What changed this week?',
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).resolves.toMatchObject({
      content: 'Milo had more walks this week. I cannot diagnose.',
    });

    expect(mockInvoke).toHaveBeenCalledWith('ask-barklog-ai', {
      body: {
        context: {
          currentMedicationsSummary: 'No active medications.',
          dog: weeklyContext.dog,
          last30DaysSummary: 'Milo logged walks and meals.',
          trainingContextSummary:
            'Active training programs: Loose leash walking. Recent training: 2 sessions.',
        },
        dogId: 'dog-1',
        promptVersion: ASK_BARKLOG_AI_PROMPT_VERSION,
        question: 'What changed this week?',
      },
    });
  });

  it('returns safe AI failure copy instead of provider errors', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error('AI provider prompt included raw symptom text'),
    });

    await expect(
      askBarkLogAi({
        context: {
          currentMedicationsSummary: 'No active medications.',
          dog: weeklyContext.dog,
          last30DaysSummary: 'Milo logged walks and meals.',
          trainingContextSummary:
            'Active training programs: Loose leash walking. Recent training: 2 sessions.',
        },
        dogId: 'dog-1',
        question: 'Summarize this week.',
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow(BARKLOG_AI_SAFE_FAILURE_MESSAGE);
  });

  it('does not invoke training insight Edge Function for expired users', async () => {
    await expect(
      generateTrainingInsight({
        context: {
          behavior_summary: 'Top behavior: Barking (2)',
          dog: {
            age: 5,
            breed: 'Rescue mix',
            id: 'dog-1',
            name: 'Milo',
            weight_lbs: 28,
          },
          enrollment: {
            current_step: 2,
            program_name: 'Loose leash walking',
            total_steps: 6,
          },
          mood_summary: 'Top mood: Calm (2)',
          training_summary:
            '2 training sessions, Average success rating: 4.5/5',
        },
        user: makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow('BarkLog Premium is required');

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes training insight Edge Function with safe structured context', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        generated_at: '2026-04-26T00:00:00.000Z',
        observation:
          'Milo completed two leash sessions with a steady success rating.',
        prompt_version: TRAINING_INSIGHT_PROMPT_VERSION,
      },
      error: null,
    });

    const context = {
      behavior_summary: 'Top behavior: Barking (2)',
      dog: {
        age: 5,
        breed: 'Rescue mix',
        id: 'dog-1',
        name: 'Milo',
        weight_lbs: 28,
      },
      enrollment: {
        current_step: 2,
        program_name: 'Loose leash walking',
        total_steps: 6,
      },
      mood_summary: 'Top mood: Calm (2)',
      training_summary: '2 training sessions, Average success rating: 4.5/5',
    };

    await expect(
      generateTrainingInsight({
        context,
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).resolves.toMatchObject({
      observation:
        'Milo completed two leash sessions with a steady success rating.',
    });

    expect(mockInvoke).toHaveBeenCalledWith('generate-training-insight', {
      body: {
        ...context,
        promptVersion: TRAINING_INSIGHT_PROMPT_VERSION,
      },
    });
  });

  it('does not invoke care summary Edge Function for expired users', async () => {
    await expect(
      generateCareSummary({
        context: {
          comparisonSummary: 'Last week had fewer logs.',
          currentPeriodSummary: 'This week had mood and behavior logs.',
          dog: weeklyContext.dog,
          expenseSummary: 'No expense records saved.',
          focusSummary: 'Top mood: Happy (2), Top energy: high (1)',
          kind: 'mood',
          medicationSummary: 'No active medications saved.',
          rangeEnd: '2026-04-27',
          rangeStart: '2026-04-20',
        },
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow('BarkLog Premium is required');

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes care summary Edge Function with premium structured context', async () => {
    const context = {
      comparisonSummary: 'Last week had fewer logs.',
      currentPeriodSummary: 'This week had mood and behavior logs.',
      dog: weeklyContext.dog,
      expenseSummary: 'No expense records saved.',
      focusSummary: 'Top behavior: Barking (2), Top trigger: Guests (1)',
      kind: 'behavior' as const,
      medicationSummary: 'No active medications saved.',
      rangeEnd: '2026-04-27',
      rangeStart: '2026-04-20',
    };

    mockInvoke.mockResolvedValue({
      data: {
        summary: {
          content: 'Milo logged barking most often around guests this week.',
          dog_id: 'dog-1',
          generated_at: '2026-04-27T00:00:00.000Z',
          id: 'summary-dog-1-behavior-2026-04-27T00:00:00.000Z',
          kind: 'behavior',
          prompt_version: CARE_SUMMARY_PROMPT_VERSION_CLIENT,
          range_end: '2026-04-27',
          range_start: '2026-04-20',
        },
      },
      error: null,
    });

    await expect(
      generateCareSummary({
        context,
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).resolves.toMatchObject({
      summary: {
        content: 'Milo logged barking most often around guests this week.',
        kind: 'behavior',
      },
    });

    expect(mockInvoke).toHaveBeenCalledWith('generate-care-summary', {
      body: {
        context,
        dogId: 'dog-1',
        promptVersion: CARE_SUMMARY_PROMPT_VERSION_CLIENT,
      },
    });
  });

  it('does not invoke vet report Edge Function for expired users', async () => {
    await expect(
      generateVetReport({
        context: {
          dog: {
            ageYears: 5,
            breed: 'Rescue mix',
            id: 'dog-1',
            name: 'Milo',
            weightLbs: 28,
          },
          eventCounts,
          range: {
            endIso: '2026-04-27T00:00:00.000Z',
            label: 'Last 30 days',
            startIso: '2026-03-29T00:00:00.000Z',
          },
          sections: {
            behaviorAndMood: ['2026-04-26: Mood: Calm.'],
            medications: ['No active medications recorded.'],
            nutritionAndElimination: ['2026-04-26: Meal logged.'],
            ownerNotes: ['No caregiver notes recorded.'],
            photos: ['No event photos attached.'],
            symptomsAndObservations: ['No symptom events recorded.'],
            training: ['No training sessions recorded.'],
          },
          urgentReviewNotes: [],
        },
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow('BarkLog Premium is required');

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes vet report Edge Function with structured report context', async () => {
    const context = {
      dog: {
        ageYears: 5,
        breed: 'Rescue mix',
        id: 'dog-1',
        name: 'Milo',
        weightLbs: 28,
      },
      eventCounts,
      range: {
        endIso: '2026-04-27T00:00:00.000Z',
        label: 'Last 30 days',
        startIso: '2026-03-29T00:00:00.000Z',
      },
      sections: {
        behaviorAndMood: ['2026-04-26: Mood: Calm.'],
        medications: ['No active medications recorded.'],
        nutritionAndElimination: ['2026-04-26: Meal logged.'],
        ownerNotes: ['No caregiver notes recorded.'],
        photos: ['No event photos attached.'],
        symptomsAndObservations: ['No symptom events recorded.'],
        training: ['No training sessions recorded.'],
      },
      urgentReviewNotes: [],
    };

    mockInvoke.mockResolvedValue({
      data: {
        report: {
          generatedAt: '2026-04-27T00:00:00.000Z',
          promptVersion: VET_REPORT_PROMPT_VERSION_CLIENT,
          questions: ['Do any logs need follow-up?'],
          summary: 'Milo had a steady care rhythm in this report range.',
        },
      },
      error: null,
    });

    await expect(
      generateVetReport({
        context,
        dogId: 'dog-1',
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).resolves.toMatchObject({
      report: {
        summary: 'Milo had a steady care rhythm in this report range.',
      },
    });

    expect(mockInvoke).toHaveBeenCalledWith('generate-vet-report', {
      body: {
        context,
        dogId: 'dog-1',
        promptVersion: VET_REPORT_PROMPT_VERSION_CLIENT,
      },
    });
  });
});
