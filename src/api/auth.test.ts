import type { Session } from '@supabase/supabase-js';

import {
  BARKLOG_TRIAL_DURATION_DAYS,
  bootstrapAuthenticatedSession,
  completeOnboardingForCurrentUser,
  createDogForCurrentUser,
} from '@/api/auth';
import { getSupabaseClient } from '@/api/supabaseClient';
import { defaultOnboardingDraft } from '@/stores/useOnboardingDraftStore';

import {
  makeDogRow,
  makeSession,
  makeUserRow,
} from '../../test/utils/builders';

jest.mock('@/api/supabaseClient', () => ({
  getSupabaseClient: jest.fn(),
}));

type TerminalResponse = {
  data: unknown;
  error: Error | null;
};

type QueryResponse = {
  maybeSingle?: TerminalResponse;
  order?: TerminalResponse;
  single?: TerminalResponse;
};

type SupabaseMutationCall = {
  payload: unknown;
  table: string;
  type: 'insert' | 'update' | 'upsert';
};

function makeAuthSession(userId = 'user-1'): Session {
  const session = makeSession();

  return {
    ...session,
    user: {
      ...session.user,
      email: 'caregiver@example.com',
      id: userId,
    },
  };
}

function createSupabaseMock(responses: QueryResponse[]) {
  const responseQueue = [...responses];
  const mutationCalls: SupabaseMutationCall[] = [];
  const builders: Array<{
    builder: Record<string, jest.Mock>;
    table: string;
  }> = [];

  const supabase = {
    from: jest.fn((table: string) => {
      const response = responseQueue.shift();

      if (!response) {
        throw new Error(`Unexpected Supabase query for ${table}`);
      }

      const builder: Record<string, jest.Mock> = {};

      builder.eq = jest.fn(() => builder);
      builder.insert = jest.fn((payload: unknown) => {
        mutationCalls.push({
          payload,
          table,
          type: 'insert',
        });

        return builder;
      });
      builder.maybeSingle = jest.fn(async () => response.maybeSingle);
      builder.order = jest.fn(async () => response.order);
      builder.select = jest.fn(() => builder);
      builder.single = jest.fn(async () => response.single);
      builder.update = jest.fn((payload: unknown) => {
        mutationCalls.push({
          payload,
          table,
          type: 'update',
        });

        return builder;
      });
      builder.upsert = jest.fn((payload: unknown) => {
        mutationCalls.push({
          payload,
          table,
          type: 'upsert',
        });

        return builder;
      });

      builders.push({
        builder,
        table,
      });

      return builder;
    }),
  };

  jest
    .mocked(getSupabaseClient)
    .mockReturnValue(
      supabase as unknown as ReturnType<typeof getSupabaseClient>,
    );

  return {
    builders,
    mutationCalls,
    supabase,
  };
}

describe('auth lifecycle API', () => {
  const now = new Date('2026-04-26T00:00:00.000Z');
  const trialEndsAt = new Date(
    now.getTime() + BARKLOG_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  beforeEach(() => {
    jest.useFakeTimers({
      now,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('initializes missing trial state during auth bootstrap', async () => {
    const existingUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'trial',
      trial_ends_at: null,
    });
    const trialUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'trial',
      trial_ends_at: trialEndsAt,
    });
    const { mutationCalls } = createSupabaseMock([
      {
        maybeSingle: {
          data: existingUser,
          error: null,
        },
      },
      {
        single: {
          data: trialUser,
          error: null,
        },
      },
      {
        order: {
          data: [],
          error: null,
        },
      },
      {
        maybeSingle: {
          data: null,
          error: null,
        },
      },
    ]);

    const snapshot = await bootstrapAuthenticatedSession(
      makeAuthSession('user-1'),
    );

    expect(snapshot).toMatchObject({
      barklogUser: trialUser,
      contactPreferenceStatus: 'required',
      dogs: [],
      onboardingStatus: 'required',
    });
    expect(mutationCalls).toContainEqual({
      payload: {
        subscription_tier: 'trial',
        trial_ends_at: trialEndsAt,
      },
      table: 'users',
      type: 'update',
    });
  });

  it('does not silently reactivate expired users', async () => {
    const expiredUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'expired',
      trial_ends_at: null,
    });
    const { mutationCalls } = createSupabaseMock([
      {
        maybeSingle: {
          data: expiredUser,
          error: null,
        },
      },
      {
        order: {
          data: [makeDogRow({ user_id: 'user-1' })],
          error: null,
        },
      },
      {
        maybeSingle: {
          data: { user_id: 'user-1' },
          error: null,
        },
      },
    ]);

    const snapshot = await bootstrapAuthenticatedSession(
      makeAuthSession('user-1'),
    );

    expect(snapshot.barklogUser.subscription_tier).toBe('expired');
    expect(snapshot.contactPreferenceStatus).toBe('complete');
    expect(snapshot.onboardingStatus).toBe('complete');
    expect(mutationCalls).toEqual([]);
  });

  it('rejects dog rows that do not belong to the signed-in user', async () => {
    createSupabaseMock([
      {
        maybeSingle: {
          data: makeUserRow({
            id: 'user-1',
            subscription_tier: 'active',
            trial_ends_at: null,
          }),
          error: null,
        },
      },
      {
        order: {
          data: [makeDogRow({ user_id: 'other-user' })],
          error: null,
        },
      },
    ]);

    await expect(
      bootstrapAuthenticatedSession(makeAuthSession('user-1')),
    ).rejects.toThrow('Dog ownership mismatch');
  });

  it('creates missing user rows, starts trial, and completes onboarding with owned dog state', async () => {
    const createdUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'trial',
      trial_ends_at: null,
    });
    const trialUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'trial',
      trial_ends_at: trialEndsAt,
    });
    const createdDog = makeDogRow({
      id: 'dog-created',
      is_primary: true,
      name: 'Milo',
      user_id: 'user-1',
    });
    const { mutationCalls } = createSupabaseMock([
      {
        maybeSingle: {
          data: null,
          error: null,
        },
      },
      {
        maybeSingle: {
          data: null,
          error: null,
        },
      },
      {
        maybeSingle: {
          data: null,
          error: null,
        },
      },
      {
        single: {
          data: createdUser,
          error: null,
        },
      },
      {
        single: {
          data: trialUser,
          error: null,
        },
      },
      {
        single: {
          data: createdDog,
          error: null,
        },
      },
      {
        order: {
          data: [],
          error: null,
        },
      },
      {
        maybeSingle: {
          data: null,
          error: null,
        },
      },
    ]);

    const onboardingPromise = completeOnboardingForCurrentUser(
      makeAuthSession('user-1'),
      {
        ...defaultOnboardingDraft,
        breed: 'Rescue mix',
        name: ' Milo ',
        sex: 'male',
        status: 'neutered',
        weight: '10',
        weightUnit: 'kg',
      },
    );

    await jest.advanceTimersByTimeAsync(500);

    const snapshot = await onboardingPromise;

    expect(snapshot).toMatchObject({
      barklogUser: trialUser,
      contactPreferenceStatus: 'required',
      dogs: [createdDog],
      onboardingStatus: 'complete',
    });
    expect(mutationCalls).toEqual(
      expect.arrayContaining([
        {
          payload: {
            email: 'caregiver@example.com',
            id: 'user-1',
          },
          table: 'users',
          type: 'upsert',
        },
        {
          payload: {
            subscription_tier: 'trial',
            trial_ends_at: expect.stringMatching(
              /^2026-05-03T00:00:00\.\d{3}Z$/,
            ),
          },
          table: 'users',
          type: 'update',
        },
        {
          payload: {
            breed: 'Rescue mix',
            id: undefined,
            is_primary: true,
            name: 'Milo',
            photo_url: null,
            sex: 'neutered_male',
            user_id: 'user-1',
            weight_lbs: 22.05,
          },
          table: 'dogs',
          type: 'insert',
        },
      ]),
    );
  });

  it('keeps newly added dogs in memory if the follow-up read lags', async () => {
    const premiumUser = makeUserRow({
      id: 'user-1',
      subscription_tier: 'active',
      trial_ends_at: null,
    });
    const existingDog = makeDogRow({
      id: 'dog-1',
      is_primary: true,
      user_id: 'user-1',
    });
    const createdDog = makeDogRow({
      id: 'dog-2',
      is_primary: false,
      name: 'Poppy',
      user_id: 'user-1',
    });
    createSupabaseMock([
      {
        maybeSingle: {
          data: premiumUser,
          error: null,
        },
      },
      {
        single: {
          data: createdDog,
          error: null,
        },
      },
      {
        order: {
          data: [existingDog],
          error: null,
        },
      },
    ]);

    const result = await createDogForCurrentUser(makeAuthSession('user-1'), {
      name: 'Poppy',
    });

    expect(result).toEqual({
      dog: createdDog,
      dogs: [existingDog, createdDog],
    });
  });
});
