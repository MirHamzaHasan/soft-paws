import {
  AI_AGENT_CATALOG,
  APPROVED_AI_AGENT_EDGE_FUNCTIONS,
  groupAiAgentsByCategory,
  isApprovedAiAgentEdgeFunctionName,
} from '@/features/assistant/data/aiAgentCatalog';
import {
  createAiAgentDataAvailability,
  getAiAgentCardState,
} from '@/features/assistant/utils/aiAgentAvailability';
import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

function makeSnapshot(
  eventCountOverrides: Partial<
    WeeklyDashboardSnapshot['context']['thisWeek']['eventCounts']
  > = {},
): WeeklyDashboardSnapshot {
  const eventCounts = {
    appetite: 0,
    behavior: 0,
    cough_sneeze: 0,
    dental: 0,
    grooming: 0,
    meal: 0,
    medication: 0,
    mobility: 0,
    mood: 0,
    note: 0,
    parasite_prevention: 0,
    pee: 0,
    poop: 0,
    rest: 0,
    symptom: 0,
    training: 0,
    vet_visit: 0,
    vomit: 0,
    walk: 0,
    water: 0,
    weight: 0,
    ...eventCountOverrides,
  };
  const thisWeek = {
    behaviorCount: eventCounts.behavior,
    behaviorSummary: 'No behavior logs recorded.',
    eventCounts,
    eventsSummary: 'No events recorded.',
    mealCount: eventCounts.meal,
    medicationCount: eventCounts.medication,
    moodCount: eventCounts.mood,
    moodSummary: 'No mood check-ins recorded.',
    poopAverage: 0,
    symptomCount: eventCounts.symptom,
    trainingCount: eventCounts.training,
    trainingSummary: 'No training sessions recorded.',
    walkMinutes: 0,
  };

  return {
    anomalyAlerts: [],
    chartLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    context: {
      dog: {
        ageYears: 5,
        breed: 'Rescue mix',
        name: 'Milo',
        weightLbs: 28,
      },
      lastWeek: thisWeek,
      thisWeek,
    },
    currentMedicationsSummary: 'No active medications saved.',
    last30DaysSummary: 'No events logged in the last 30 days.',
    mealCount: eventCounts.meal,
    medicationCount: eventCounts.medication,
    poopAverage: 0,
    poopValues: [0, 0, 0, 0, 0, 0, 0],
    symptomCount: eventCounts.symptom,
    trainingContextSummary:
      'Recent training: No training sessions recorded. Recent behavior patterns: No behavior logs recorded. Recent mood patterns: No mood check-ins recorded.',
    walkMinutes: 0,
    walkValues: [0, 0, 0, 0, 0, 0, 0],
    weekEnd: new Date('2026-04-27T00:00:00.000Z'),
    weekLabel: 'Apr 20 - Apr 26',
    weekStart: new Date('2026-04-20T00:00:00.000Z'),
    weekStartKey: '2026-04-20',
  };
}

describe('AI agent catalog', () => {
  it('defines the expected specialist agents as premium only', () => {
    expect(AI_AGENT_CATALOG).toHaveLength(10);
    expect(AI_AGENT_CATALOG.map((agent) => agent.id)).toEqual([
      'weekly-health-summary',
      'vet-prep',
      'training-observer',
      'behavior-pattern',
      'mood-pattern',
      'medication-adherence',
      'nutrition-consistency',
      'expense-summary',
      'memory-book',
      'care-coordinator',
    ]);
    expect(AI_AGENT_CATALOG.every((agent) => agent.premium)).toBe(true);
  });

  it('keeps client-callable agent functions on the approved allowlist', () => {
    expect(APPROVED_AI_AGENT_EDGE_FUNCTIONS).toEqual([
      'ask-barklog-ai',
      'generate-care-summary',
      'generate-training-insight',
      'generate-weekly-insight',
    ]);

    AI_AGENT_CATALOG.filter((agent) => agent.edgeFunctionName).forEach(
      (agent) => {
        expect(
          isApprovedAiAgentEdgeFunctionName(agent.edgeFunctionName ?? ''),
        ).toBe(true);
      },
    );
  });

  it('groups agents into scannable categories', () => {
    const groups = groupAiAgentsByCategory();

    expect(groups.map((group) => group.category)).toEqual([
      'health',
      'behavior',
      'training',
      'records',
      'lifestyle',
      'household',
    ]);
    const healthGroup = groups[0];

    if (!healthGroup) {
      throw new Error('Health group missing');
    }

    expect(healthGroup.agents.map((agent) => agent.id)).toContain(
      'weekly-health-summary',
    );
  });

  it('locks cards for free users before checking data readiness', () => {
    const availability = createAiAgentDataAvailability({
      hasDog: true,
      snapshot: makeSnapshot({ behavior: 2, mood: 2 }),
    });
    const behaviorAgent = AI_AGENT_CATALOG.find(
      (agent) => agent.id === 'behavior-pattern',
    );

    if (!behaviorAgent) {
      throw new Error('Behavior agent missing');
    }

    const state = getAiAgentCardState({
      agent: behaviorAgent,
      availability,
      hasPremiumAccess: false,
      isLoadingContext: false,
      loadError: null,
    });

    expect(state).toMatchObject({
      actionLabel: 'Unlock Premium',
      disabled: false,
      kind: 'locked',
    });
  });

  it('marks premium agents ready only when required local data exists', () => {
    const behaviorAgent = AI_AGENT_CATALOG.find(
      (agent) => agent.id === 'behavior-pattern',
    );

    if (!behaviorAgent) {
      throw new Error('Behavior agent missing');
    }

    const emptyAvailability = createAiAgentDataAvailability({
      hasDog: true,
      snapshot: makeSnapshot(),
    });
    const readyAvailability = createAiAgentDataAvailability({
      hasDog: true,
      snapshot: makeSnapshot({ behavior: 2 }),
    });

    expect(
      getAiAgentCardState({
        agent: behaviorAgent,
        availability: emptyAvailability,
        hasPremiumAccess: true,
        isLoadingContext: false,
        loadError: null,
      }),
    ).toMatchObject({
      actionLabel: 'Needs more logs',
      disabled: true,
      kind: 'needs_data',
      missingData: ['behavior_logs'],
    });

    expect(
      getAiAgentCardState({
        agent: behaviorAgent,
        availability: readyAvailability,
        hasPremiumAccess: true,
        isLoadingContext: false,
        loadError: null,
      }),
    ).toMatchObject({
      actionLabel: 'Open agent',
      disabled: false,
      kind: 'ready',
    });
  });
});
