import { HttpError, requirePremiumAccess } from '../_shared/auth.ts';
import {
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from '../_shared/http.ts';

type HouseholdInviteRow = {
  accepted_at: string | null;
  dog_ids: string[] | null;
  email: string;
  expires_at: string;
  household_id: string;
  id: string;
  inviter_user_id: string;
  permissions: string[];
  revoked_at: string | null;
  role: 'caregiver' | 'sitter' | 'viewer';
};

type InsertedMembershipRow = {
  household_id: string;
  id: string;
};

type RuntimeEnv = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function sanitizeToken(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function hashInviteToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return bytesToHex(digest);
}

async function requestRest<T>(
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
    const text = await response.text();
    throw new HttpError(
      response.status,
      'supabase_rest_error',
      text || 'Unable to update household invite.',
    );
  }

  const text = await response.text();

  if (response.status === 204 || !text.trim()) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function createRestPath(table: string, params: Record<string, string>) {
  const url = new URL(`/rest/v1/${table}`, 'https://barklog.local');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}

function getActiveInvite(invite: HouseholdInviteRow | null) {
  if (!invite) {
    throw new HttpError(
      404,
      'invite_not_found',
      'This household invite could not be found.',
    );
  }

  if (invite.accepted_at || invite.revoked_at) {
    throw new HttpError(
      409,
      'invite_not_active',
      'This household invite is no longer active.',
    );
  }

  const expiresAt = new Date(invite.expires_at).getTime();

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new HttpError(
      410,
      'invite_expired',
      'This household invite has expired.',
    );
  }

  return invite;
}

function getSitterExpiresAt(role: HouseholdInviteRow['role']) {
  if (role !== 'sitter') {
    return null;
  }

  return new Date(Date.now() + 2 * 86_400_000).toISOString();
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST to accept a household invite.',
      },
      405,
    );
  }

  try {
    const body = await readJsonBody(request);

    if (!isObjectRecord(body)) {
      throw new HttpError(400, 'invalid_request', 'Expected a JSON body.');
    }

    const token = sanitizeToken(body.token);

    if (!token) {
      throw new HttpError(
        400,
        'missing_token',
        'Household invite token is required.',
      );
    }

    const { env, user } = await requirePremiumAccess({ request });
    const tokenHash = await hashInviteToken(token);
    const inviteRows = await requestRest<HouseholdInviteRow[]>(
      env,
      createRestPath('household_invites', {
        select:
          'id,household_id,inviter_user_id,email,role,permissions,dog_ids,expires_at,accepted_at,revoked_at',
        token_hash: `eq.${encodeURIComponent(tokenHash)}`,
      }),
    );
    const invite = getActiveInvite(inviteRows[0] ?? null);

    const membershipRows = await requestRest<InsertedMembershipRow[]>(
      env,
      createRestPath('household_members', {
        on_conflict: 'household_id,user_id',
        select: 'id,household_id',
      }),
      {
        body: JSON.stringify({
          email: user.email,
          allowed_dog_ids: invite.dog_ids ?? [],
          household_id: invite.household_id,
          invited_by_user_id: invite.inviter_user_id,
          permissions: invite.permissions,
          role: invite.role,
          sitter_expires_at: getSitterExpiresAt(invite.role),
          user_id: user.id,
        }),
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        method: 'POST',
      },
    );

    const membership = membershipRows[0];

    if (!membership) {
      throw new HttpError(
        500,
        'membership_create_failed',
        'Unable to add this household member.',
      );
    }

    await requestRest<null>(
      env,
      createRestPath('household_invites', {
        id: `eq.${encodeURIComponent(invite.id)}`,
      }),
      {
        body: JSON.stringify({
          accepted_at: new Date().toISOString(),
        }),
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        method: 'PATCH',
      },
    );

    return jsonResponse({
      householdId: membership.household_id,
      membershipId: membership.id,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        {
          error: error.code,
          message: error.message,
        },
        error.status,
      );
    }

    return jsonResponse(
      {
        error: 'invite_accept_failed',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to accept this household invite.',
      },
      500,
    );
  }
});
