import { Platform } from 'react-native';

import { getFirebaseAiIdToken } from '@/features/auth/services/firebaseAiAuth';

import { requestAtlasChat } from './atlasClient';

jest.mock('expo-crypto', () => ({
  randomUUID: () => '9a3856fd-6970-4f8d-99ca-5f084c6170e7',
}));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('@/utils/clientEnv', () => ({
  readClientEnv: () => ({
    ok: true,
    value: { EXPO_PUBLIC_ATLAS_APP_ID: 'abddca6a-e9b7-459c-a5d5-d32d43254e50' },
  }),
}));
jest.mock('@/features/auth/services/firebaseAiAuth', () => ({
  getFirebaseAiIdToken: jest.fn(async () => 'test-token'),
  isFirebaseAiAuthConfigured: () => true,
}));

const checkedHeaders = {
  'x-request-id': 'request-1',
  'x-atlas-context-checked': 'true',
  'x-atlas-context-feature': 'barklog.weekly-insight',
};

describe('Atlas Firebase request boundary', () => {
  beforeEach(() => {
    jest.mocked(getFirebaseAiIdToken).mockClear();
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });
  });

  it('refreshes once after 401 and retains the mutation idempotency key', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            requestId: 'request-1',
            output: { content: 'Observed two walks.' },
          }),
          { status: 200, headers: checkedHeaders },
        ),
      );
    const content = await requestAtlasChat({
      feature: 'weekly-insight',
      system: 'Summarize facts.',
      user: { walks: 2 },
      fetchImpl,
    });
    expect(content).toBe('Observed two walks.');
    expect(getFirebaseAiIdToken).toHaveBeenNthCalledWith(1, false);
    expect(getFirebaseAiIdToken).toHaveBeenNthCalledWith(2, true);
    const first = fetchImpl.mock.calls[0][1];
    const second = fetchImpl.mock.calls[1][1];
    expect(first.headers['idempotency-key']).toBe(
      second.headers['idempotency-key'],
    );
    expect(first.headers['x-atlas-app-id']).toBe(
      'abddca6a-e9b7-459c-a5d5-d32d43254e50',
    );
    expect(first.headers['x-atlas-client-platform']).toBe('android');
    expect(JSON.parse(first.body).metadata.contextRequired).toBe(true);
  });

  it('rejects a response without verified BarkLog context', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          requestId: 'request-1',
          output: { content: 'Unverified' },
        }),
        { status: 200 },
      ),
    );
    await expect(
      requestAtlasChat({
        feature: 'weekly-insight',
        system: 'Facts',
        user: {},
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'context_unavailable' });
  });

  it('sends web requests through the same-origin Pages bridge', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
    const fetchImpl = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          requestId: 'request-1',
          output: { content: 'Observed two walks.' },
        }),
        { status: 200, headers: checkedHeaders },
      ),
    );
    await requestAtlasChat({
      feature: 'weekly-insight',
      system: 'Facts',
      user: {},
      fetchImpl,
    });
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/atlas-chat');
    expect(fetchImpl.mock.calls[0][1].headers['x-atlas-client-platform']).toBe(
      'web',
    );
  });
});
