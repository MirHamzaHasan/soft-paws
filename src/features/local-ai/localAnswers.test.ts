import type { WeeklyDashboardSnapshot } from '@/features/insights/utils/insightSummaries';

import {
  buildLocalFactAnswer,
  classifyLocalQuestion,
  isLocalFactQuestion,
  isSupportedIntentQuestion,
  LOCAL_QUESTION_EXAMPLES,
} from './localAnswers';

describe('bounded on-device journal answers', () => {
  it('keeps clinical and advice questions out of the local model path', () => {
    expect(isLocalFactQuestion('Should I treat this symptom?')).toBe(false);
    expect(isLocalFactQuestion('Summarize the vomiting logs')).toBe(false);
    expect(isLocalFactQuestion('How many walks this week?')).toBe(true);
    expect(isSupportedIntentQuestion('walks', 'When did we walk?')).toBe(false);
  });

  it('requires a clear embedding match to a supported factual intent', () => {
    const examples = LOCAL_QUESTION_EXAMPLES.map((example) =>
      example.intent === 'walks' ? [1, 0] : [0, 1],
    );
    expect(classifyLocalQuestion([1, 0], examples)).toBe('walks');
    expect(classifyLocalQuestion([0.7, 0.7], examples)).toBeNull();
  });

  it('builds an answer from logged counts rather than model text', () => {
    const snapshot = {
      context: {
        dog: { name: 'Milo' },
        thisWeek: { eventCounts: { walk: 2 }, walkMinutes: 35 },
      },
    } as WeeklyDashboardSnapshot;
    expect(buildLocalFactAnswer('walks', snapshot)).toBe(
      'You logged 2 walks totaling 35 minutes this week. These are caregiver logs, not a diagnosis.',
    );
  });
});
