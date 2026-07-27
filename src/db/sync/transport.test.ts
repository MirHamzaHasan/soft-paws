import type { BarklogSupabaseClient } from '@/api';

import { BarklogSyncConflictError } from './errors';
import { createSupabaseBarklogSyncTransport } from './transport';

jest.mock('@/api', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('@/utils/clientEnv', () => ({
  getRequiredClientEnv: jest.fn(() => ({
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    EXPO_PUBLIC_SUPABASE_URL: 'https://barklog.supabase.co',
  })),
}));

const emptyChanges = {
  care_tasks: { created: [], deleted: [], updated: [] },
  dog_training_enrollments: { created: [], deleted: [], updated: [] },
  dogs: { created: [], deleted: [], updated: [] },
  events: { created: [], deleted: [], updated: [] },
  expenses: { created: [], deleted: [], updated: [] },
  insights: { created: [], deleted: [], updated: [] },
  medications: { created: [], deleted: [], updated: [] },
  photo_baselines: { created: [], deleted: [], updated: [] },
  training_sessions: { created: [], deleted: [], updated: [] },
  users: { created: [], deleted: [], updated: [] },
  vaccinations: { created: [], deleted: [], updated: [] },
};

function createSupabaseMock() {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: {
          session: {
            access_token: 'user-access-token',
          },
        },
        error: null,
      })),
    },
  } as unknown as BarklogSupabaseClient;
}

describe('createSupabaseBarklogSyncTransport', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('posts pull requests to the authenticated barklog-sync function', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          changes: emptyChanges,
          timestamp: 500,
        }),
        { status: 200 },
      );
    });
    global.fetch = fetchMock as typeof fetch;

    const transport = createSupabaseBarklogSyncTransport(createSupabaseMock());
    const result = await transport.pullChanges({
      lastPulledAt: 100,
      migration: null,
      schemaVersion: 2,
    });

    expect(result).toEqual({
      changes: emptyChanges,
      timestamp: 500,
    });
    const firstFetchCall = fetchMock.mock.calls[0] as
      | [string, RequestInit]
      | undefined;
    const requestInit = firstFetchCall?.[1];

    expect(requestInit).toBeDefined();
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      action: 'pull',
      lastPulledAt: 100,
      migration: null,
      schemaVersion: 2,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://barklog.supabase.co/functions/v1/barklog-sync',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer user-access-token',
          apikey: 'anon-key',
        }),
        method: 'POST',
      }),
    );
  });

  it('maps backend conflict responses to BarklogSyncConflictError', async () => {
    global.fetch = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          error: 'sync_conflict',
          message: 'Remote dogs changed during push.',
        }),
        { status: 409 },
      );
    }) as typeof fetch;

    const transport = createSupabaseBarklogSyncTransport(createSupabaseMock());

    await expect(
      transport.pushChanges({
        changes: emptyChanges,
        lastPulledAt: 100,
      }),
    ).rejects.toThrow(BarklogSyncConflictError);
  });
});
