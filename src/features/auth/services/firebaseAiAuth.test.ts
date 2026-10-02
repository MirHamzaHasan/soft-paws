import {
  getFirebaseAiAuthEmail,
  getFirebaseAiIdToken,
  signInFirebaseAi,
  signOutFirebaseAi,
} from './firebaseAiAuth';

jest.mock('@/utils/clientEnv', () => ({
  readClientEnv: () => ({
    ok: true,
    value: { EXPO_PUBLIC_FIREBASE_API_KEY: 'public-test-key' },
  }),
}));

describe('Firebase AI session', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    signOutFirebaseAi();
    global.fetch = originalFetch;
  });

  it('keeps credentials in memory and refreshes the same user', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            idToken: 'token-one',
            refreshToken: 'refresh-one',
            localId: 'uid-one',
            email: 'owner@example.com',
            expiresIn: '3600',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id_token: 'token-two',
            refresh_token: 'refresh-two',
            user_id: 'uid-one',
            expires_in: '3600',
          }),
          { status: 200 },
        ),
      );
    global.fetch = fetchImpl;
    await signInFirebaseAi(' Owner@Example.com ', 'password');
    expect(getFirebaseAiAuthEmail()).toBe('owner@example.com');
    expect(await getFirebaseAiIdToken()).toBe('token-one');
    expect(await getFirebaseAiIdToken(true)).toBe('token-two');
    const refresh = fetchImpl.mock.calls[1][1];
    expect(refresh.body).toContain('grant_type=refresh_token');
    signOutFirebaseAi();
    await expect(getFirebaseAiIdToken()).rejects.toThrow('Sign in');
  });
});
