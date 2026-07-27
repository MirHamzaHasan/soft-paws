import { invokeAiAgent } from '@/features/assistant/api/aiAgentClient';

import { makeUserRow } from '../../../../test/utils/builders';

const mockInvoke = jest.fn();

jest.mock('@/api', () => ({
  getSupabaseClient: () => ({
    functions: {
      invoke: mockInvoke,
    },
  }),
}));

describe('AI agent client', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('does not invoke an agent Edge Function for non-premium users', async () => {
    await expect(
      invokeAiAgent({
        agentId: 'weekly-health-summary',
        body: {
          dogId: 'dog-1',
        },
        user: makeUserRow({
          subscription_tier: 'expired',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow('BarkLog Premium is required');

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it('invokes only the approved Edge Function for a premium agent', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        content: 'Milo had a steadier care rhythm this week.',
      },
      error: null,
    });

    await expect(
      invokeAiAgent({
        agentId: 'weekly-health-summary',
        body: {
          dogId: 'dog-1',
          weekStart: '2026-04-20',
        },
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).resolves.toMatchObject({
      content: 'Milo had a steadier care rhythm this week.',
    });

    expect(mockInvoke).toHaveBeenCalledWith('generate-weekly-insight', {
      body: {
        agentId: 'weekly-health-summary',
        dogId: 'dog-1',
        weekStart: '2026-04-20',
      },
    });
  });

  it('returns safe failure copy for provider or routed-surface errors', async () => {
    await expect(
      invokeAiAgent({
        agentId: 'vet-prep',
        body: {
          dogId: 'dog-1',
        },
        user: makeUserRow({
          subscription_tier: 'active',
          trial_ends_at: null,
        }),
      }),
    ).rejects.toThrow('BarkLog AI is unavailable right now');
  });
});
