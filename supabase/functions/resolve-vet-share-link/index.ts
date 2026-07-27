import { getEdgeRuntimeEnv } from '../_shared/env.ts';
import { jsonResponse, optionsResponse } from '../_shared/http.ts';

type VetShareLinkRow = {
  created_at: string | null;
  expires_at: string;
  report_snapshot: unknown;
  revoked_at: string | null;
};

async function hashToken(token: string) {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getRuntimeEnv() {
  const env = getEdgeRuntimeEnv();

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase Edge Function environment is not configured.');
  }

  return {
    serviceRoleKey: env.supabaseServiceRoleKey,
    supabaseUrl: env.supabaseUrl.replace(/\/+$/, ''),
  };
}

async function readShareLink(tokenHash: string) {
  const env = getRuntimeEnv();
  const response = await fetch(
    `${env.supabaseUrl}/rest/v1/vet_share_links?token_hash=eq.${encodeURIComponent(
      tokenHash,
    )}&select=created_at,expires_at,revoked_at,report_snapshot&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${env.serviceRoleKey}`,
        apikey: env.serviceRoleKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to read vet share link.');
  }

  const rows = (await response.json()) as VetShareLinkRow[];

  return rows[0] ?? null;
}

function getToken(request: Request) {
  if (request.method === 'GET') {
    return new URL(request.url).searchParams.get('token');
  }

  return null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'GET') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use GET for resolve-vet-share-link.',
      },
      405,
    );
  }

  const token = getToken(request);

  if (!token || token.length < 24) {
    return jsonResponse(
      {
        error: 'invalid_share_link',
        message: 'This BarkLog vet share link is invalid.',
      },
      400,
    );
  }

  try {
    const row = await readShareLink(await hashToken(token));

    if (!row || row.revoked_at) {
      return jsonResponse(
        {
          error: 'share_link_unavailable',
          message: 'This BarkLog vet share link is unavailable.',
        },
        404,
      );
    }

    if (new Date(row.expires_at).getTime() <= Date.now()) {
      return jsonResponse(
        {
          error: 'share_link_expired',
          message: 'This BarkLog vet share link has expired.',
        },
        410,
      );
    }

    return jsonResponse({
      created_at: row.created_at,
      expires_at: row.expires_at,
      report: row.report_snapshot,
    });
  } catch {
    return jsonResponse(
      {
        error: 'share_link_unavailable',
        message: 'This BarkLog vet share link is unavailable right now.',
      },
      502,
    );
  }
});
