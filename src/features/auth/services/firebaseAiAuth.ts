import { readClientEnv } from '@/utils/clientEnv';

type FirebaseSession = {
  email: string;
  uid: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

type FirebaseTokenResponse = {
  email?: string;
  localId?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
};

type FirebaseRefreshResponse = {
  user_id?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: string;
};

let session: FirebaseSession | null = null;
let refreshPromise: Promise<FirebaseSession> | null = null;
const listeners = new Set<() => void>();

function publish(next: FirebaseSession | null) {
  session = next;
  listeners.forEach((listener) => listener());
}

export function subscribeFirebaseAiAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFirebaseAiAuthEmail() {
  return session?.email ?? null;
}

export function isFirebaseAiAuthConfigured() {
  const result = readClientEnv();
  return (
    result.ok &&
    Boolean(
      result.value.EXPO_PUBLIC_FIREBASE_API_KEY &&
      result.value.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
      result.value.EXPO_PUBLIC_ATLAS_APP_ID,
    )
  );
}

function apiKey() {
  const result = readClientEnv();
  const key = result.ok ? result.value.EXPO_PUBLIC_FIREBASE_API_KEY : undefined;
  if (!key) throw new Error('AI sign-in is not configured for this build.');
  return key;
}

async function authPost(url: string, body: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new Error(
      'Unable to reach Firebase. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    let code = '';
    try {
      const parsed = (await response.json()) as {
        error?: { message?: string };
      };
      code = parsed.error?.message?.split(' : ')[0] ?? '';
    } catch {
      // Never surface remote error text.
    }
    if (
      [
        'EMAIL_NOT_FOUND',
        'INVALID_PASSWORD',
        'INVALID_LOGIN_CREDENTIALS',
      ].includes(code)
    ) {
      throw new Error('Email or password is incorrect.');
    }
    if (code === 'EMAIL_EXISTS')
      throw new Error('An account with this email already exists.');
    if (code === 'WEAK_PASSWORD')
      throw new Error('Choose a stronger password.');
    if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER')
      throw new Error('Too many attempts. Try again later.');
    throw new Error('Firebase sign-in is unavailable right now.');
  }
  return response.json() as Promise<unknown>;
}

export async function signInFirebaseAi(
  email: string,
  password: string,
  createAccount = false,
) {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized) || !password) {
    throw new Error('Enter a valid email and password.');
  }
  const operation = createAccount ? 'signUp' : 'signInWithPassword';
  const body = (await authPost(
    `https://identitytoolkit.googleapis.com/v1/accounts:${operation}?key=${encodeURIComponent(apiKey())}`,
    { email: normalized, password, returnSecureToken: true },
  )) as FirebaseTokenResponse;
  const lifetime = Number(body.expiresIn);
  if (
    !body.idToken ||
    !body.refreshToken ||
    !body.localId ||
    body.email?.toLowerCase() !== normalized ||
    !Number.isFinite(lifetime) ||
    lifetime <= 0
  ) {
    throw new Error('Firebase returned an incomplete sign-in session.');
  }
  publish({
    email: normalized,
    uid: body.localId,
    idToken: body.idToken,
    refreshToken: body.refreshToken,
    expiresAt: Date.now() + lifetime * 1000,
  });
}

export async function resetFirebaseAiPassword(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized))
    throw new Error('Enter a valid email first.');
  await authPost(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey())}`,
    { requestType: 'PASSWORD_RESET', email: normalized },
  );
}

export function signOutFirebaseAi() {
  publish(null);
}

export async function getFirebaseAiIdToken(
  forceRefresh = false,
): Promise<string> {
  if (!session) throw new Error('Sign in to use BarkLog AI.');
  if (!forceRefresh && session.expiresAt - Date.now() > 120_000)
    return session.idToken;
  if (!refreshPromise) {
    const current = session;
    refreshPromise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      let response: Response;
      try {
        response = await fetch(
          `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey())}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: current.refreshToken,
            }).toString(),
            signal: controller.signal,
          },
        );
      } catch {
        throw new Error('Unable to refresh AI sign-in. Check your connection.');
      } finally {
        clearTimeout(timer);
      }
      if (!response.ok) {
        if (session === current) publish(null);
        throw new Error('AI sign-in expired. Please sign in again.');
      }
      const body = (await response.json()) as FirebaseRefreshResponse;
      const lifetime = Number(body.expires_in);
      if (
        !body.id_token ||
        !body.refresh_token ||
        body.user_id !== current.uid ||
        !Number.isFinite(lifetime) ||
        lifetime <= 0
      ) {
        if (session === current) publish(null);
        throw new Error('AI sign-in expired. Please sign in again.');
      }
      const next = {
        ...current,
        idToken: body.id_token,
        refreshToken: body.refresh_token,
        expiresAt: Date.now() + lifetime * 1000,
      };
      if (session === current) publish(next);
      return next;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  const refreshed = await refreshPromise;
  if (session !== refreshed) throw new Error('Sign in to use BarkLog AI.');
  return refreshed.idToken;
}
