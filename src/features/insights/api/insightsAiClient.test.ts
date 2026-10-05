import { tryAnswerLocalChat } from '@/features/local-ai/localChatEngine';
import { tryAnswerLocalQuestion } from '@/features/local-ai/localQuestionEngine';

import { makeUserRow } from '../../../../test/utils/builders';
import { requestAtlasChat } from './atlasClient';
import { askBarkLogAi, generateWeeklyInsight } from './insightsAiClient';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-id' }));
jest.mock('./atlasClient', () => ({ requestAtlasChat: jest.fn() }));
jest.mock('@/features/local-ai/localQuestionEngine', () => ({
  tryAnswerLocalQuestion: jest.fn(),
}));
jest.mock('@/features/local-ai/localChatEngine', () => ({
  tryAnswerLocalChat: jest.fn(),
}));

describe('local-first BarkLog AI', () => {
  beforeEach(() => {
    jest.mocked(requestAtlasChat).mockReset();
    jest.mocked(tryAnswerLocalQuestion).mockReset();
    jest.mocked(tryAnswerLocalChat).mockReset();
  });

  it('keeps urgent questions from free users away from Atlas', async () => {
    const free = makeUserRow({
      subscription_tier: 'expired',
      trial_ends_at: null,
    });
    const urgent = await askBarkLogAi({
      user: free,
      question: 'My dog ate grapes and collapsed',
    } as never);
    expect(urgent.content).toContain('veterinarian');
    expect(requestAtlasChat).not.toHaveBeenCalled();
    expect(tryAnswerLocalQuestion).not.toHaveBeenCalled();
  });

  it('answers a supported journal question on device without contacting Atlas', async () => {
    const premium = makeUserRow({
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    jest
      .mocked(tryAnswerLocalQuestion)
      .mockResolvedValue('You logged two walks.');
    const response = await askBarkLogAi({
      user: premium,
      question: 'How many walks this week?',
      snapshot: { context: { dog: { name: 'Milo' } } },
    } as never);
    expect(response).toMatchObject({
      source: 'device',
      content: 'You logged two walks.',
    });
    expect(requestAtlasChat).not.toHaveBeenCalled();
  });

  it('uses Atlas for questions outside local capability', async () => {
    const premium = makeUserRow({
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    jest.mocked(tryAnswerLocalQuestion).mockResolvedValue(null);
    jest
      .mocked(requestAtlasChat)
      .mockResolvedValue('Ask your veterinarian about the new symptom.');
    const response = await askBarkLogAi({
      user: premium,
      question: 'What could this symptom mean?',
      context: { dog: { name: 'Milo' } },
      snapshot: { context: { dog: { name: 'Milo' } } },
    } as never);
    expect(response.source).toBe('atlas');
    expect(requestAtlasChat).toHaveBeenCalledTimes(1);
  });

  it('uses the local conversation model before Atlas when the starter cannot answer', async () => {
    const premium = makeUserRow({
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    jest.mocked(tryAnswerLocalQuestion).mockResolvedValue(null);
    jest
      .mocked(tryAnswerLocalChat)
      .mockResolvedValue('Milo had two walks in the recent logs.');
    const response = await askBarkLogAi({
      user: premium,
      question: 'How has Milo been doing lately?',
      context: {
        dog: { name: 'Milo' },
        last30DaysSummary: 'Two walks were logged.',
        trainingContextSummary: 'No training sessions logged.',
      },
      snapshot: { context: { dog: { name: 'Milo' } } },
    } as never);
    expect(response).toMatchObject({
      source: 'device',
      content: 'Milo had two walks in the recent logs.',
    });
    expect(requestAtlasChat).not.toHaveBeenCalled();
  });

  it('routes a premium weekly summary through Atlas and rejects diagnostic output', async () => {
    const premium = makeUserRow({
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    jest
      .mocked(requestAtlasChat)
      .mockResolvedValueOnce('Two walks were recorded this week.');
    const result = await generateWeeklyInsight({
      user: premium,
      dogId: 'dog-1',
      weekStart: '2026-09-28',
      context: { dog: { name: 'Milo' }, thisWeek: {}, lastWeek: {} },
    } as never);
    expect(result.content).toContain('Two walks');
    expect(requestAtlasChat).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'weekly-insight' }),
    );
    jest
      .mocked(requestAtlasChat)
      .mockResolvedValueOnce('Your dog has pancreatitis.');
    await expect(
      generateWeeklyInsight({
        user: premium,
        context: { dog: {}, thisWeek: {}, lastWeek: {} },
      } as never),
    ).rejects.toThrow('safe response');
  });
});
