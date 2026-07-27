import type { BarklogSupabaseClient } from '@/api';
import { getSupabaseClient } from '@/api';
import { getRequiredClientEnv } from '@/utils/clientEnv';

import type {
  BarklogSyncPullRequest,
  BarklogSyncPullResponse,
  BarklogSyncPushRequest,
  BarklogSyncPushResponse,
} from '../types';
import { BarklogSyncConflictError } from './errors';

type BarklogSyncAction = 'pull' | 'push';

export type BarklogSyncTransport = {
  pullChanges: (
    request: BarklogSyncPullRequest,
  ) => Promise<BarklogSyncPullResponse>;
  pushChanges: (
    request: BarklogSyncPushRequest,
  ) => Promise<BarklogSyncPushResponse>;
};

type SyncErrorBody = {
  error?: unknown;
  message?: unknown;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function isSyncErrorBody(value: unknown): value is SyncErrorBody {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function getSyncErrorMessage(body: unknown, fallback: string) {
  if (!isSyncErrorBody(body)) {
    return fallback;
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }

  return fallback;
}

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      message: text,
    } satisfies SyncErrorBody;
  }
}

async function getSupabaseAccessToken(supabase: BarklogSupabaseClient) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Sign in before syncing BarkLog data.');
  }

  return token;
}

async function invokeBarklogSyncFunction<TResponse>(input: {
  action: BarklogSyncAction;
  payload: BarklogSyncPullRequest | BarklogSyncPushRequest;
  supabase: BarklogSupabaseClient;
}): Promise<TResponse> {
  const env = getRequiredClientEnv();
  const accessToken = await getSupabaseAccessToken(input.supabase);
  const response = await fetch(
    `${trimTrailingSlash(env.EXPO_PUBLIC_SUPABASE_URL)}/functions/v1/barklog-sync`,
    {
      body: JSON.stringify({
        ...input.payload,
        action: input.action,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );
  const body = await readResponseBody(response);

  if (!response.ok) {
    const message = getSyncErrorMessage(
      body,
      `BarkLog sync failed with HTTP ${response.status}.`,
    );

    if (
      response.status === 409 ||
      (isSyncErrorBody(body) && body.error === 'sync_conflict')
    ) {
      throw new BarklogSyncConflictError(message);
    }

    throw new Error(message);
  }

  return body as TResponse;
}

export function createSupabaseBarklogSyncTransport(
  supabase: BarklogSupabaseClient = getSupabaseClient(),
): BarklogSyncTransport {
  return {
    pullChanges: (request) =>
      invokeBarklogSyncFunction<BarklogSyncPullResponse>({
        action: 'pull',
        payload: request,
        supabase,
      }),
    pushChanges: (request) =>
      invokeBarklogSyncFunction<BarklogSyncPushResponse>({
        action: 'push',
        payload: request,
        supabase,
      }),
  };
}
