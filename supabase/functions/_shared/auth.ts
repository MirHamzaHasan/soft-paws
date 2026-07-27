import { getEdgeRuntimeEnv } from './env.ts';

type AuthUser = {
  email: string;
  id: string;
};

type RuntimeEnv = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

type UserSubscriptionRow = {
  id: string;
  subscription_tier: 'active' | 'expired' | 'grandfathered' | 'trial' | null;
  trial_ends_at: string | null;
};

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function getRuntimeEnv(): RuntimeEnv {
  const env = getEdgeRuntimeEnv();

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new HttpError(
      500,
      'edge_env_missing',
      'Supabase Edge Function environment is not configured.',
    );
  }

  return {
    serviceRoleKey: env.supabaseServiceRoleKey,
    supabaseUrl: env.supabaseUrl.replace(/\/+$/, ''),
  };
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new HttpError(
      401,
      'missing_auth',
      'Sign in before using BarkLog AI.',
    );
  }

  return match[1];
}

async function requestSupabaseRest<T>(
  env: RuntimeEnv,
  path: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  headers.set('apikey', env.serviceRoleKey);
  headers.set('Authorization', `Bearer ${env.serviceRoleKey}`);

  const response = await fetch(`${env.supabaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new HttpError(
      response.status,
      'supabase_rest_error',
      'BarkLog could not verify account access.',
    );
  }

  return (await response.json()) as T;
}

async function requireAuthUser(request: Request, env: RuntimeEnv) {
  const token = getBearerToken(request);
  const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.serviceRoleKey,
    },
  });

  if (!response.ok) {
    throw new HttpError(
      401,
      'invalid_auth',
      'Sign in before using BarkLog AI.',
    );
  }

  const body = (await response.json()) as Record<string, unknown>;

  if (typeof body.id !== 'string') {
    throw new HttpError(
      401,
      'invalid_auth',
      'Unable to identify BarkLog AI user.',
    );
  }

  return {
    email: typeof body.email === 'string' ? body.email : '',
    id: body.id,
  } satisfies AuthUser;
}

async function readUserSubscription(env: RuntimeEnv, userId: string) {
  const rows = await requestSupabaseRest<UserSubscriptionRow[]>(
    env,
    `/rest/v1/users?id=eq.${encodeURIComponent(
      userId,
    )}&select=id,subscription_tier,trial_ends_at`,
  );

  return rows[0] ?? null;
}

function hasPremiumAccess(row: UserSubscriptionRow | null, now = new Date()) {
  if (!row) {
    return false;
  }

  if (
    row.subscription_tier === 'active' ||
    row.subscription_tier === 'grandfathered'
  ) {
    return true;
  }

  if (row.subscription_tier !== 'trial' || !row.trial_ends_at) {
    return false;
  }

  const trialEndsAt = new Date(row.trial_ends_at).getTime();

  return Number.isFinite(trialEndsAt) && trialEndsAt > now.getTime();
}

async function assertDogOwnership(input: {
  dogId: string;
  env: RuntimeEnv;
  userId: string;
}) {
  const rows = await requestSupabaseRest<Array<{ id: string }>>(
    input.env,
    `/rest/v1/dogs?id=eq.${encodeURIComponent(
      input.dogId,
    )}&user_id=eq.${encodeURIComponent(input.userId)}&select=id`,
  );

  if (!rows[0]) {
    throw new HttpError(
      403,
      'dog_access_denied',
      'BarkLog could not verify this dog record.',
    );
  }
}

export async function requirePremiumAccess(input: {
  dogId?: string | null;
  request: Request;
}) {
  const env = getRuntimeEnv();
  const user = await requireAuthUser(input.request, env);
  const subscription = await readUserSubscription(env, user.id);

  if (!hasPremiumAccess(subscription)) {
    throw new HttpError(
      402,
      'premium_required',
      'BarkLog Premium is required for this AI feature.',
    );
  }

  if (input.dogId) {
    await assertDogOwnership({
      dogId: input.dogId,
      env,
      userId: user.id,
    });
  }

  return {
    env,
    subscription,
    user,
  };
}
