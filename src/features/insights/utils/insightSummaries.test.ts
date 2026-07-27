import { summarizeEvents } from '@/features/insights/utils/insightSummaries';

import { makeEventModel } from '../../../../test/utils/builders';

jest.mock('@/db', () => ({
  listActiveMedicationsForDog: jest.fn(),
  listLocalEventsForDogDate: jest.fn(),
}));

describe('insight summaries', () => {
  it('includes mood check-ins in weekly AI context summaries', () => {
    const summary = summarizeEvents([
      makeEventModel({
        details: {
          energy: 'high',
          mood: 'happy',
        },
        id: 'mood-1',
        type: 'mood',
      }),
      makeEventModel({
        details: {
          energy: 'normal',
          mood: 'happy',
        },
        id: 'mood-2',
        type: 'mood',
      }),
    ]);

    expect(summary.eventCounts.mood).toBe(2);
    expect(summary.moodCount).toBe(2);
    expect(summary.moodSummary).toContain('Top mood: Happy (2)');
    expect(summary.eventsSummary).toContain('2 mood check-ins');
  });

  it('includes behavior logs in weekly AI context summaries', () => {
    const summary = summarizeEvents([
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
          behavior: 'barking',
          intensity: 'mild',
          trigger: 'guests',
        },
        id: 'behavior-2',
        type: 'behavior',
      }),
    ]);

    expect(summary.eventCounts.behavior).toBe(2);
    expect(summary.behaviorCount).toBe(2);
    expect(summary.behaviorSummary).toContain('Top behavior: Barking (2)');
    expect(summary.behaviorSummary).toContain('Top trigger: Guests (2)');
    expect(summary.eventsSummary).toContain('2 behavior logs');
  });

  it('includes training sessions in weekly AI context summaries', () => {
    const summary = summarizeEvents([
      makeEventModel({
        details: {
          dog_mood: 'calm',
          duration_min: 12,
          enrollment_id: 'enrollment-1',
          program_name: 'Loose leash walking',
          step_number: 2,
          step_title: 'Reward beside your leg',
          success_rating: 4,
        },
        id: 'training-1',
        type: 'training',
      }),
      makeEventModel({
        details: {
          dog_mood: 'happy',
          enrollment_id: 'enrollment-1',
          program_name: 'Loose leash walking',
          step_number: 2,
          step_title: 'Reward beside your leg',
          success_rating: 5,
        },
        id: 'training-2',
        type: 'training',
      }),
    ]);

    expect(summary.eventCounts.training).toBe(2);
    expect(summary.trainingCount).toBe(2);
    expect(summary.trainingSummary).toContain('2 training sessions');
    expect(summary.trainingSummary).toContain('Average success rating: 4.5/5');
    expect(summary.trainingSummary).toContain(
      'Top program: Loose leash walking (2)',
    );
    expect(summary.eventsSummary).toContain('2 training sessions');
  });
});
