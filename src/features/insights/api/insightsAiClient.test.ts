import { makeUserRow } from '../../../../test/utils/builders';
import { requestAtlasChat } from './atlasClient';
import { askBarkLogAi, generateWeeklyInsight } from './insightsAiClient';

jest.mock('expo-crypto', () => ({ randomUUID: () => 'test-id' }));
jest.mock('./atlasClient', () => ({ requestAtlasChat: jest.fn() }));

describe('Atlas-backed BarkLog AI', () => {
  beforeEach(() => jest.mocked(requestAtlasChat).mockReset());

  it('keeps free users and urgent questions away from Atlas', async () => {
    const free = makeUserRow({
      subscription_tier: 'expired',
      trial_ends_at: null,
    });
    await expect(askBarkLogAi({ user: free } as never)).rejects.toThrow(
      'Premium',
    );
    const premium = makeUserRow({
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    const urgent = await askBarkLogAi({
      user: premium,
      question: 'My dog ate grapes and collapsed',
    } as never);
    expect(urgent.content).toContain('veterinarian');
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
