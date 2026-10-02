import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { z } from 'zod';

import {
  getFirebaseAiIdToken,
  isFirebaseAiAuthConfigured,
} from '@/features/auth/services/firebaseAiAuth';
import { readClientEnv } from '@/utils/clientEnv';

const ATLAS_CHAT_URL = 'https://api.atlas.dracoarts.com/v1/chat';
const atlasResponseSchema = z.object({
  requestId: z.string().min(1),
  output: z.object({ content: z.string().min(1).max(16_000) }),
});

export type AtlasFeature =
  | 'ask-barklog-ai'
  | 'care-summary'
  | 'training-insight'
  | 'vet-report'
  | 'weekly-insight';

export class AtlasRequestError extends Error {
  constructor(
    readonly code: string,
    readonly requestId?: string,
  ) {
    let message =
      'BarkLog AI is unavailable right now. Please try again later.';
    if (code === 'authentication_required')
      message = 'Sign in to use BarkLog AI.';
    if (code === 'configuration_unavailable')
      message = 'BarkLog AI is not configured for this build.';
    super(message);
    this.name = 'AtlasRequestError';
  }
}

export async function requestAtlasChat(input: {
  feature: AtlasFeature;
  system: string;
  user: unknown;
  responseFormat?: 'json' | 'text';
  fetchImpl?: typeof fetch;
}): Promise<string> {
  if (!isFirebaseAiAuthConfigured())
    throw new AtlasRequestError('configuration_unavailable');
  const parsed = readClientEnv();
  const appId = parsed.ok ? parsed.value.EXPO_PUBLIC_ATLAS_APP_ID : undefined;
  if (!appId) throw new AtlasRequestError('configuration_unavailable');
  const platform = Platform.OS;
  if (platform !== 'web' && platform !== 'android' && platform !== 'ios') {
    throw new AtlasRequestError('configuration_unavailable');
  }
  const idempotencyKey = Crypto.randomUUID();
  const body = JSON.stringify({
    capability: 'chat',
    responseFormat: input.responseFormat ?? 'text',
    optimization: { mode: 'off' },
    maxTokens: 650,
    messages: [
      { role: 'system', content: input.system },
      { role: 'user', content: JSON.stringify(input.user) },
    ],
    metadata: {
      contextRequired: true,
      contextFeature: `barklog.${input.feature}`,
      feature: `barklog.${input.feature}`,
    },
  });
  if (body.length > 32_000) throw new AtlasRequestError('request_too_large');
  const fetchImpl = input.fetchImpl ?? fetch;
  const send = async (forceRefresh: boolean): Promise<string> => {
    let token: string;
    try {
      token = await getFirebaseAiIdToken(forceRefresh);
    } catch {
      throw new AtlasRequestError('authentication_required');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    let response: Response;
    try {
      response = await fetchImpl(
        platform === 'web' ? '/api/atlas-chat' : ATLAS_CHAT_URL,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
            'x-atlas-app-id': appId,
            'x-atlas-client-platform': platform,
            'idempotency-key': idempotencyKey,
          },
          body,
          signal: controller.signal,
        },
      );
    } catch {
      throw new AtlasRequestError('upstream_unavailable');
    } finally {
      clearTimeout(timer);
    }
    if (response.status === 401 && !forceRefresh) return send(true);
    const requestId = response.headers.get('x-request-id') ?? undefined;
    if (!response.ok) {
      let code = 'upstream_unavailable';
      try {
        const error = (await response.json()) as { error?: { code?: unknown } };
        if (
          typeof error.error?.code === 'string' &&
          /^[A-Z0-9_]{2,80}$/.test(error.error.code)
        ) {
          code = error.error.code;
        }
      } catch {
        // Never display or log upstream error messages.
      }
      throw new AtlasRequestError(code, requestId);
    }
    // BarkLog health summaries require Atlas's application context policy to pass.
    if (
      response.headers.get('x-atlas-context-checked') !== 'true' ||
      response.headers.get('x-atlas-context-feature') !==
        `barklog.${input.feature}`
    ) {
      throw new AtlasRequestError('context_unavailable', requestId);
    }
    const result = atlasResponseSchema.safeParse(await response.json());
    if (!result.success)
      throw new AtlasRequestError('invalid_response', requestId);
    return result.data.output.content;
  };
  return send(false);
}
