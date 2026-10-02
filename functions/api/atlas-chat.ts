type Environment = {
  ATLAS_APP_ID?: string;
  ATLAS_BASE_URL?: string;
};

const json = (code: string, status: number) =>
  new Response(JSON.stringify({ error: { code } }), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
    },
  });

/** Cloudflare Pages same-origin bridge for BarkLog web; Atlas verifies Firebase identity. */
export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Environment;
}): Promise<Response> {
  if (request.method !== 'POST') return json('METHOD_NOT_ALLOWED', 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return json('ORIGIN_NOT_ALLOWED', 403);
  }
  if (!env.ATLAS_APP_ID || !/^[0-9a-f-]{36}$/i.test(env.ATLAS_APP_ID)) {
    return json('CONFIGURATION_UNAVAILABLE', 503);
  }
  const authorization = request.headers.get('authorization');
  if (
    !authorization ||
    !/^Bearer\s+\S+$/i.test(authorization) ||
    request.headers.get('x-atlas-app-id') !== env.ATLAS_APP_ID
  ) {
    return json('UNAUTHENTICATED', 401);
  }
  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
    return json('INVALID_REQUEST', 400);
  }

  let body: string;
  try {
    body = await request.text();
    if (body.length > 32_000) return json('PAYLOAD_TOO_LARGE', 413);
    const parsed = JSON.parse(body) as {
      capability?: unknown;
      metadata?: {
        contextRequired?: unknown;
        contextFeature?: unknown;
        feature?: unknown;
      };
    };
    if (
      parsed.capability !== 'chat' ||
      parsed.metadata?.contextRequired !== true ||
      typeof parsed.metadata.contextFeature !== 'string' ||
      !/^barklog\.(ask-barklog-ai|care-summary|training-insight|vet-report|weekly-insight)$/.test(
        parsed.metadata.contextFeature,
      ) ||
      parsed.metadata.feature !== parsed.metadata.contextFeature
    ) {
      return json('INVALID_REQUEST', 400);
    }
  } catch {
    return json('INVALID_REQUEST', 400);
  }

  let base: URL;
  try {
    base = new URL(env.ATLAS_BASE_URL ?? 'https://api.atlas.dracoarts.com');
    if (
      base.protocol !== 'https:' ||
      base.hostname !== 'api.atlas.dracoarts.com'
    ) {
      return json('CONFIGURATION_UNAVAILABLE', 503);
    }
  } catch {
    return json('CONFIGURATION_UNAVAILABLE', 503);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  let upstream: Response;
  try {
    upstream = await fetch(new URL('/v1/chat', base), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization,
        'content-type': 'application/json',
        'idempotency-key': idempotencyKey,
        'x-atlas-app-id': env.ATLAS_APP_ID,
        'x-atlas-client-platform': 'web',
        ...(request.headers.get('x-firebase-appcheck')
          ? {
              'x-firebase-appcheck': request.headers.get(
                'x-firebase-appcheck',
              )!,
            }
          : {}),
      },
      body,
      signal: controller.signal,
    });
  } catch {
    return json('UPSTREAM_UNAVAILABLE', 502);
  } finally {
    clearTimeout(timer);
  }
  let result: string;
  try {
    result = await upstream.text();
  } catch {
    return json('UPSTREAM_UNAVAILABLE', 502);
  }
  if (result.length > 64_000) return json('INVALID_UPSTREAM_RESPONSE', 502);
  const headers = new Headers({
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
  });
  for (const name of [
    'x-request-id',
    'x-atlas-context-checked',
    'x-atlas-context-feature',
  ]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(result, { status: upstream.status, headers });
}
