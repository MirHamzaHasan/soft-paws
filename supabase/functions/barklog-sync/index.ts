import { getEdgeRuntimeEnv } from '../_shared/env.ts';
import {
  jsonResponse,
  optionsResponse,
  readJsonBody,
} from '../_shared/http.ts';

const SYNC_TABLES = [
  'users',
  'dogs',
  'events',
  'medications',
  'insights',
  'vaccinations',
  'expenses',
  'dog_training_enrollments',
  'training_sessions',
  'care_tasks',
  'photo_baselines',
] as const;

type SyncTableName = (typeof SYNC_TABLES)[number];
type RawSyncRecord = Record<string, unknown> & { id: string };
type SyncTableChangeSet = {
  created: RawSyncRecord[];
  deleted: string[];
  updated: RawSyncRecord[];
};
type SyncDatabaseChangeSet = Record<SyncTableName, SyncTableChangeSet>;
type SupabaseRow = Record<string, unknown> & {
  created_at?: string | null;
  id: string;
  updated_at?: string | null;
};
type AuthUser = {
  email: string;
  id: string;
};
type RuntimeEnv = {
  serviceRoleKey: string;
  supabaseUrl: string;
};
type RestFilter = readonly [key: string, value: string];
type SyncDeletedRecord = {
  deleted_at: string;
  record_id: string;
  table_name: SyncTableName;
};
type UserSubscriptionRow = {
  id: string;
  subscription_tier: 'active' | 'expired' | 'grandfathered' | 'trial' | null;
  trial_ends_at: string | null;
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function createEmptyChangeSet(): SyncDatabaseChangeSet {
  const changes = {} as SyncDatabaseChangeSet;

  SYNC_TABLES.forEach((table) => {
    changes[table] = {
      created: [],
      deleted: [],
      updated: [],
    };
  });

  return changes;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isSyncTableName(value: string): value is SyncTableName {
  return SYNC_TABLES.includes(value as SyncTableName);
}

function getRuntimeEnv(): RuntimeEnv {
  const env = getEdgeRuntimeEnv();

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new HttpError(
      500,
      'sync_env_missing',
      'Supabase sync environment is not configured.',
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
    throw new HttpError(401, 'missing_auth', 'Sign in before syncing.');
  }

  return match[1];
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
    throw new HttpError(401, 'invalid_auth', 'Sign in before syncing.');
  }

  const body = (await response.json()) as Record<string, unknown>;

  if (typeof body.id !== 'string') {
    throw new HttpError(401, 'invalid_auth', 'Unable to identify sync user.');
  }

  return {
    email: typeof body.email === 'string' ? body.email : '',
    id: body.id,
  } satisfies AuthUser;
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
      text || `Supabase REST request failed with ${response.status}.`,
    );
  }

  const text = await response.text();

  if (response.status === 204 || !text.trim()) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function createRestPath(table: string, filters: RestFilter[] = []) {
  const url = new URL(`/rest/v1/${table}`, 'https://barklog.local');

  filters.forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}

async function selectRows<T>(
  env: RuntimeEnv,
  table: string,
  filters: RestFilter[],
) {
  return requestRest<T[]>(
    env,
    createRestPath(table, [['select', '*'], ...filters]),
  );
}

async function readUserSubscription(env: RuntimeEnv, userId: string) {
  const rows = await requestRest<UserSubscriptionRow[]>(
    env,
    createRestPath('users', [
      ['id', `eq.${userId}`],
      ['select', 'id,subscription_tier,trial_ends_at'],
    ]),
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

async function requirePremiumSyncAccess(input: {
  env: RuntimeEnv;
  userId: string;
}) {
  const subscription = await readUserSubscription(input.env, input.userId);

  if (!hasPremiumAccess(subscription)) {
    throw new HttpError(
      402,
      'premium_required',
      'BarkLog Premium is required for cloud backup and sync.',
    );
  }
}

async function upsertRows(
  env: RuntimeEnv,
  table: SyncTableName,
  payloads: Record<string, unknown>[],
) {
  if (payloads.length === 0) {
    return;
  }

  await requestRest<null>(env, createRestPath(table, [['on_conflict', 'id']]), {
    body: JSON.stringify(payloads),
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    method: 'POST',
  });
}

async function deleteRows(
  env: RuntimeEnv,
  table: SyncTableName,
  filters: RestFilter[],
) {
  await requestRest<null>(env, createRestPath(table, filters), {
    headers: {
      Prefer: 'return=minimal',
    },
    method: 'DELETE',
  });
}

function idInFilter(ids: string[]): RestFilter {
  return ['id', `in.(${ids.join(',')})`];
}

function dateToMs(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function msToIso(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return null;
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function nullableNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function booleanOrDefault(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function parseJsonColumn(value: unknown, fallback: unknown) {
  if (typeof value !== 'string') {
    return value ?? fallback;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fallback;
  }
}

function stringifyJsonColumn(value: unknown, fallback: unknown) {
  return JSON.stringify(value ?? fallback);
}

function getRowTimestamp(row: SupabaseRow, key: 'created_at' | 'updated_at') {
  return dateToMs(row[key]) ?? 0;
}

function mapRemoteRowToRaw(table: SyncTableName, row: SupabaseRow) {
  switch (table) {
    case 'users':
      return {
        id: row.id,
        created_at: dateToMs(row.created_at) ?? Date.now(),
        email: String(row.email ?? ''),
        revenuecat_user_id: nullableString(row.revenuecat_user_id),
        subscription_tier: row.subscription_tier ?? 'trial',
        trial_ends_at: dateToMs(row.trial_ends_at),
      };
    case 'dogs':
      return {
        id: row.id,
        birthdate: nullableString(row.birthdate),
        breed: nullableString(row.breed),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        is_primary: booleanOrDefault(row.is_primary, true),
        name: String(row.name ?? ''),
        photo_url: nullableString(row.photo_url),
        sex: row.sex ?? null,
        user_id: String(row.user_id ?? ''),
        weight_lbs: nullableNumber(row.weight_lbs),
      };
    case 'events':
      return {
        id: row.id,
        created_at: dateToMs(row.created_at) ?? Date.now(),
        details: stringifyJsonColumn(row.details, {}),
        dog_id: String(row.dog_id ?? ''),
        logged_at: dateToMs(row.logged_at),
        notes: nullableString(row.notes),
        occurred_at: dateToMs(row.occurred_at) ?? Date.now(),
        photo_url: nullableString(row.photo_url),
        synced: true,
        type: String(row.type ?? 'note'),
        user_id: String(row.user_id ?? ''),
      };
    case 'medications':
      return {
        id: row.id,
        active: booleanOrDefault(row.active, true),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        dog_id: String(row.dog_id ?? ''),
        dose_mg: nullableNumber(row.dose_mg),
        end_date: nullableString(row.end_date),
        frequency: row.frequency ?? null,
        give_with_food: booleanOrDefault(row.give_with_food, false),
        name: String(row.name ?? ''),
        notes: nullableString(row.notes),
        refill_date: nullableString(row.refill_date),
        schedule_times: stringifyJsonColumn(row.schedule_times, []),
        start_date: nullableString(row.start_date),
      };
    case 'insights':
      return {
        id: row.id,
        content: String(row.content ?? ''),
        dog_id: String(row.dog_id ?? ''),
        generated_at: dateToMs(row.generated_at),
        prompt_version: nullableString(row.prompt_version),
        week_start: String(row.week_start ?? ''),
      };
    case 'vaccinations':
      return {
        id: row.id,
        created_at: dateToMs(row.created_at) ?? Date.now(),
        date_given: nullableString(row.date_given),
        dog_id: String(row.dog_id ?? ''),
        name: String(row.name ?? ''),
        next_due: nullableString(row.next_due),
        notes: nullableString(row.notes),
        record_photo_url: nullableString(row.record_photo_url),
        vet_name: nullableString(row.vet_name),
      };
    case 'expenses':
      return {
        id: row.id,
        amount: Number(row.amount ?? 0),
        category: String(row.category ?? 'other'),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        date: String(row.date ?? ''),
        description: nullableString(row.description),
        dog_id: String(row.dog_id ?? ''),
        receipt_photo_url: nullableString(row.receipt_photo_url),
        user_id: String(row.user_id ?? ''),
      };
    case 'dog_training_enrollments':
      return {
        id: row.id,
        completed_at: dateToMs(row.completed_at),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        current_step: Number(row.current_step ?? 1),
        dog_id: String(row.dog_id ?? ''),
        program_id: String(row.program_id ?? ''),
        started_at: dateToMs(row.started_at) ?? Date.now(),
        status: String(row.status ?? 'active'),
        user_id: String(row.user_id ?? ''),
      };
    case 'training_sessions':
      return {
        id: row.id,
        completed_at: dateToMs(row.completed_at) ?? Date.now(),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        dog_id: String(row.dog_id ?? ''),
        dog_mood: nullableString(row.dog_mood),
        duration_min: nullableNumber(row.duration_min),
        enrollment_id: String(row.enrollment_id ?? ''),
        notes: nullableString(row.notes),
        step_id: String(row.step_id ?? ''),
        success_rating: nullableNumber(row.success_rating),
        user_id: String(row.user_id ?? ''),
      };
    case 'care_tasks':
      return {
        id: row.id,
        completed_at: nullableString(row.completed_at),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        dog_id: String(row.dog_id ?? ''),
        due_at: String(row.due_at ?? ''),
        notes: nullableString(row.notes),
        recurrence: String(row.recurrence ?? 'none'),
        related_medication_id: nullableString(row.related_medication_id),
        remaining_count: nullableNumber(row.remaining_count),
        reminder_enabled: booleanOrDefault(row.reminder_enabled, false),
        title: String(row.title ?? ''),
        type: String(row.type ?? 'custom'),
        user_id: String(row.user_id ?? ''),
      };
    case 'photo_baselines':
      return {
        id: row.id,
        body_area: nullableString(row.body_area),
        captured_at: dateToMs(row.captured_at) ?? Date.now(),
        category: String(row.category ?? 'other'),
        created_at: dateToMs(row.created_at) ?? Date.now(),
        dog_id: String(row.dog_id ?? ''),
        notes: nullableString(row.notes),
        photo_uri: nullableString(row.photo_uri),
        title: String(row.title ?? ''),
        user_id: String(row.user_id ?? ''),
      };
    default:
      return row;
  }
}

function mapRawToRemotePayload(
  table: SyncTableName,
  raw: RawSyncRecord,
  user: AuthUser,
) {
  switch (table) {
    case 'users':
      return {
        id: user.id,
        email: user.email || nullableString(raw.email) || '',
      };
    case 'dogs':
      return {
        id: raw.id,
        birthdate: nullableString(raw.birthdate),
        breed: nullableString(raw.breed),
        created_at: msToIso(raw.created_at),
        is_primary: booleanOrDefault(raw.is_primary, true),
        name: String(raw.name ?? ''),
        photo_url: nullableString(raw.photo_url),
        sex: raw.sex ?? null,
        user_id: String(raw.user_id ?? ''),
        weight_lbs: nullableNumber(raw.weight_lbs),
      };
    case 'events':
      return {
        id: raw.id,
        created_at: msToIso(raw.created_at),
        details: parseJsonColumn(raw.details, {}),
        dog_id: String(raw.dog_id ?? ''),
        logged_at: msToIso(raw.logged_at),
        notes: nullableString(raw.notes),
        occurred_at: msToIso(raw.occurred_at) ?? new Date().toISOString(),
        photo_url: nullableString(raw.photo_url),
        synced: true,
        type: String(raw.type ?? 'note'),
        user_id: String(raw.user_id ?? ''),
      };
    case 'medications':
      return {
        id: raw.id,
        active: booleanOrDefault(raw.active, true),
        created_at: msToIso(raw.created_at),
        dog_id: String(raw.dog_id ?? ''),
        dose_mg: nullableNumber(raw.dose_mg),
        end_date: nullableString(raw.end_date),
        frequency: raw.frequency ?? null,
        give_with_food: booleanOrDefault(raw.give_with_food, false),
        name: String(raw.name ?? ''),
        notes: nullableString(raw.notes),
        refill_date: nullableString(raw.refill_date),
        schedule_times: parseJsonColumn(raw.schedule_times, []),
        start_date: nullableString(raw.start_date),
      };
    case 'insights':
      return {
        id: raw.id,
        content: String(raw.content ?? ''),
        dog_id: String(raw.dog_id ?? ''),
        generated_at: msToIso(raw.generated_at),
        prompt_version: nullableString(raw.prompt_version),
        week_start: String(raw.week_start ?? ''),
      };
    case 'vaccinations':
      return {
        id: raw.id,
        created_at: msToIso(raw.created_at),
        date_given: nullableString(raw.date_given),
        dog_id: String(raw.dog_id ?? ''),
        name: String(raw.name ?? ''),
        next_due: nullableString(raw.next_due),
        notes: nullableString(raw.notes),
        record_photo_url: nullableString(raw.record_photo_url),
        vet_name: nullableString(raw.vet_name),
      };
    case 'expenses':
      return {
        id: raw.id,
        amount: Number(raw.amount ?? 0),
        category: String(raw.category ?? 'other'),
        created_at: msToIso(raw.created_at),
        date: String(raw.date ?? ''),
        description: nullableString(raw.description),
        dog_id: String(raw.dog_id ?? ''),
        receipt_photo_url: nullableString(raw.receipt_photo_url),
        user_id: String(raw.user_id ?? ''),
      };
    case 'dog_training_enrollments':
      return {
        id: raw.id,
        completed_at: msToIso(raw.completed_at),
        created_at: msToIso(raw.created_at),
        current_step: Number(raw.current_step ?? 1),
        dog_id: String(raw.dog_id ?? ''),
        program_id: String(raw.program_id ?? ''),
        started_at: msToIso(raw.started_at) ?? new Date().toISOString(),
        status: String(raw.status ?? 'active'),
        user_id: String(raw.user_id ?? ''),
      };
    case 'training_sessions':
      return {
        id: raw.id,
        completed_at: msToIso(raw.completed_at) ?? new Date().toISOString(),
        created_at: msToIso(raw.created_at),
        dog_id: String(raw.dog_id ?? ''),
        dog_mood: nullableString(raw.dog_mood),
        duration_min: nullableNumber(raw.duration_min),
        enrollment_id: String(raw.enrollment_id ?? ''),
        notes: nullableString(raw.notes),
        step_id: String(raw.step_id ?? ''),
        success_rating: nullableNumber(raw.success_rating),
        user_id: String(raw.user_id ?? ''),
      };
    case 'care_tasks':
      return {
        id: raw.id,
        completed_at: nullableString(raw.completed_at),
        created_at: msToIso(raw.created_at),
        dog_id: String(raw.dog_id ?? ''),
        due_at: nullableString(raw.due_at) ?? new Date().toISOString(),
        notes: nullableString(raw.notes),
        recurrence: String(raw.recurrence ?? 'none'),
        related_medication_id: nullableString(raw.related_medication_id),
        remaining_count: nullableNumber(raw.remaining_count),
        reminder_enabled: booleanOrDefault(raw.reminder_enabled, false),
        title: String(raw.title ?? ''),
        type: String(raw.type ?? 'custom'),
        user_id: String(raw.user_id ?? ''),
      };
    case 'photo_baselines':
      return {
        id: raw.id,
        body_area: nullableString(raw.body_area),
        captured_at: msToIso(raw.captured_at) ?? new Date().toISOString(),
        category: String(raw.category ?? 'other'),
        created_at: msToIso(raw.created_at),
        dog_id: String(raw.dog_id ?? ''),
        notes: nullableString(raw.notes),
        photo_uri: nullableString(raw.photo_uri),
        title: String(raw.title ?? ''),
        user_id: String(raw.user_id ?? ''),
      };
    default:
      return raw;
  }
}

async function readOwnedDogIds(env: RuntimeEnv, userId: string) {
  const rows = await selectRows<{ id: string }>(env, 'dogs', [
    ['select', 'id'],
    ['user_id', `eq.${userId}`],
  ]);

  return rows.map((row) => row.id);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === 'string')
  );
}

type HouseholdMemberScopeRow = {
  allowed_dog_ids: unknown;
  household_id: string;
  permissions: unknown;
  role: string;
  sitter_expires_at: string | null;
};

function householdMemberCanAccess(
  member: HouseholdMemberScopeRow,
  permission: string,
) {
  if (member.role === 'sitter' && member.sitter_expires_at) {
    const expiresAt = Date.parse(member.sitter_expires_at);

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return false;
    }
  }

  if (member.role === 'owner') {
    return true;
  }

  return (
    isStringArray(member.permissions) && member.permissions.includes(permission)
  );
}

function memberCanAccessDog(member: HouseholdMemberScopeRow, dogId: string) {
  if (!isStringArray(member.allowed_dog_ids)) {
    return false;
  }

  return (
    member.allowed_dog_ids.length === 0 ||
    member.allowed_dog_ids.includes(dogId)
  );
}

async function readSharedDogIdsForPermission(input: {
  env: RuntimeEnv;
  permission: 'create_logs' | 'manage_medications' | 'view_logs';
  userId: string;
}) {
  const memberships = await selectRows<HouseholdMemberScopeRow>(
    input.env,
    'household_members',
    [
      [
        'select',
        'household_id,role,permissions,allowed_dog_ids,sitter_expires_at',
      ],
      ['user_id', `eq.${input.userId}`],
    ],
  );
  const permittedMemberships = memberships.filter((membership) =>
    householdMemberCanAccess(membership, input.permission),
  );
  const householdIds = permittedMemberships.map(
    (membership) => membership.household_id,
  );

  if (householdIds.length === 0) {
    return [];
  }

  const rows = await selectRows<{ dog_id: string; household_id: string }>(
    input.env,
    'household_dogs',
    [
      ['select', 'dog_id,household_id'],
      ['household_id', `in.(${householdIds.join(',')})`],
    ],
  );

  return rows
    .filter((row) => {
      const membership = permittedMemberships.find(
        (entry) => entry.household_id === row.household_id,
      );

      return membership ? memberCanAccessDog(membership, row.dog_id) : false;
    })
    .map((row) => row.dog_id);
}

async function readAccessibleDogIds(env: RuntimeEnv, userId: string) {
  const [ownedDogIds, sharedDogIds] = await Promise.all([
    readOwnedDogIds(env, userId),
    readSharedDogIdsForPermission({
      env,
      permission: 'view_logs',
      userId,
    }),
  ]);

  return Array.from(new Set([...ownedDogIds, ...sharedDogIds]));
}

async function readWritableDogIds(env: RuntimeEnv, userId: string) {
  const [ownedDogIds, sharedDogIds] = await Promise.all([
    readOwnedDogIds(env, userId),
    readSharedDogIdsForPermission({
      env,
      permission: 'create_logs',
      userId,
    }),
  ]);

  return Array.from(new Set([...ownedDogIds, ...sharedDogIds]));
}

async function readManageableDogRecordIds(env: RuntimeEnv, userId: string) {
  const [ownedDogIds, sharedDogIds] = await Promise.all([
    readOwnedDogIds(env, userId),
    readSharedDogIdsForPermission({
      env,
      permission: 'manage_medications',
      userId,
    }),
  ]);

  return Array.from(new Set([...ownedDogIds, ...sharedDogIds]));
}

function getPullScopeFilters(
  table: SyncTableName,
  userId: string,
  accessibleDogIds: string[],
) {
  if (table === 'users') {
    return [['id', `eq.${userId}`]] satisfies RestFilter[];
  }

  if (table === 'dogs') {
    if (accessibleDogIds.length === 0) {
      return [['user_id', `eq.${userId}`]] satisfies RestFilter[];
    }

    return [
      ['or', `(user_id.eq.${userId},id.in.(${accessibleDogIds.join(',')}))`],
    ] satisfies RestFilter[];
  }

  if (
    table === 'events' ||
    table === 'expenses' ||
    table === 'dog_training_enrollments' ||
    table === 'training_sessions' ||
    table === 'care_tasks' ||
    table === 'photo_baselines'
  ) {
    if (accessibleDogIds.length === 0) {
      return [['user_id', `eq.${userId}`]] satisfies RestFilter[];
    }

    return [
      [
        'or',
        `(user_id.eq.${userId},dog_id.in.(${accessibleDogIds.join(',')}))`,
      ],
    ] satisfies RestFilter[];
  }

  if (accessibleDogIds.length === 0) {
    return null;
  }

  return [
    ['dog_id', `in.(${accessibleDogIds.join(',')})`],
  ] satisfies RestFilter[];
}

function getChangedSinceFilter(lastPulledAt: number | null): RestFilter[] {
  if (!lastPulledAt) {
    return [];
  }

  const since = new Date(lastPulledAt).toISOString();

  return [['or', `(created_at.gt.${since},updated_at.gt.${since})`]];
}

async function pullTableChanges(input: {
  dogIds: string[];
  env: RuntimeEnv;
  lastPulledAt: number | null;
  table: SyncTableName;
  userId: string;
}) {
  const filters = getPullScopeFilters(input.table, input.userId, input.dogIds);

  if (!filters) {
    return {
      created: [],
      deleted: [],
      updated: [],
    } satisfies SyncTableChangeSet;
  }

  const rows = await selectRows<SupabaseRow>(input.env, input.table, [
    ...filters,
    ...getChangedSinceFilter(input.lastPulledAt),
  ]);

  return rows.reduce<SyncTableChangeSet>(
    (changeSet, row) => {
      const raw = mapRemoteRowToRaw(input.table, row);
      const createdAt = getRowTimestamp(row, 'created_at');

      if (!input.lastPulledAt || createdAt > input.lastPulledAt) {
        changeSet.created.push(raw);
      } else {
        changeSet.updated.push(raw);
      }

      return changeSet;
    },
    {
      created: [],
      deleted: [],
      updated: [],
    },
  );
}

async function readDeletedChanges(input: {
  env: RuntimeEnv;
  lastPulledAt: number | null;
  userId: string;
}) {
  if (!input.lastPulledAt) {
    return [];
  }

  return selectRows<SyncDeletedRecord>(input.env, 'sync_deleted_records', [
    ['user_id', `eq.${input.userId}`],
    ['deleted_at', `gt.${new Date(input.lastPulledAt).toISOString()}`],
  ]);
}

async function pullChanges(input: {
  body: Record<string, unknown>;
  env: RuntimeEnv;
  user: AuthUser;
}) {
  const lastPulledAt =
    typeof input.body.lastPulledAt === 'number'
      ? input.body.lastPulledAt
      : null;
  const accessibleDogIds = await readAccessibleDogIds(input.env, input.user.id);
  const tableEntries = await Promise.all(
    SYNC_TABLES.map(async (table) => {
      const changes = await pullTableChanges({
        dogIds: accessibleDogIds,
        env: input.env,
        lastPulledAt,
        table,
        userId: input.user.id,
      });

      return [table, changes] as const;
    }),
  );
  const changes = createEmptyChangeSet();

  tableEntries.forEach(([table, tableChanges]) => {
    changes[table] = tableChanges;
  });
  const deletedRows = await readDeletedChanges({
    env: input.env,
    lastPulledAt,
    userId: input.user.id,
  });

  deletedRows.forEach((row) => {
    if (isSyncTableName(row.table_name)) {
      changes[row.table_name].deleted.push(row.record_id);
    }
  });

  return jsonResponse({
    changes,
    timestamp: Date.now(),
  });
}

function getChangedRecordsForTable(
  body: Record<string, unknown>,
  table: SyncTableName,
) {
  const changes = isObjectRecord(body.changes) ? body.changes : {};
  const tableChanges = isObjectRecord(changes[table]) ? changes[table] : {};
  const created = Array.isArray(tableChanges.created)
    ? tableChanges.created.filter(isObjectRecord)
    : [];
  const updated = Array.isArray(tableChanges.updated)
    ? tableChanges.updated.filter(isObjectRecord)
    : [];
  const deleted = Array.isArray(tableChanges.deleted)
    ? tableChanges.deleted.filter((id): id is string => typeof id === 'string')
    : [];

  return {
    created: created.filter((record): record is RawSyncRecord => {
      return typeof record.id === 'string';
    }),
    deleted,
    updated: updated.filter((record): record is RawSyncRecord => {
      return typeof record.id === 'string';
    }),
  };
}

async function assertNoRemoteConflicts(input: {
  env: RuntimeEnv;
  ids: string[];
  lastPulledAt: number;
  table: SyncTableName;
}) {
  if (input.ids.length === 0 || !input.lastPulledAt) {
    return;
  }

  const rows = await selectRows<SupabaseRow>(input.env, input.table, [
    ['select', 'id,updated_at'],
    idInFilter(input.ids),
  ]);
  const hasConflict = rows.some((row) => {
    const updatedAt = getRowTimestamp(row, 'updated_at');

    return updatedAt > input.lastPulledAt;
  });

  if (hasConflict) {
    throw new HttpError(
      409,
      'sync_conflict',
      `Remote ${input.table} data changed after the last pull.`,
    );
  }
}

function assertRawRecordsBelongToUser(input: {
  records: RawSyncRecord[];
  table: SyncTableName;
  userId: string;
}) {
  input.records.forEach((record) => {
    if (
      (input.table === 'dogs' ||
        input.table === 'events' ||
        input.table === 'expenses' ||
        input.table === 'dog_training_enrollments' ||
        input.table === 'training_sessions' ||
        input.table === 'care_tasks' ||
        input.table === 'photo_baselines') &&
      record.user_id !== input.userId
    ) {
      throw new HttpError(
        403,
        'sync_scope_mismatch',
        `Cannot sync ${input.table} records for another user.`,
      );
    }
  });
}

function assertDogScopedRecordsAreAllowed(input: {
  allowedDogIds: Set<string>;
  records: RawSyncRecord[];
  table: SyncTableName;
}) {
  input.records.forEach((record) => {
    if (
      input.table !== 'users' &&
      input.table !== 'dogs' &&
      !input.allowedDogIds.has(String(record.dog_id ?? ''))
    ) {
      throw new HttpError(
        403,
        'sync_scope_mismatch',
        `Cannot sync ${input.table} records for another dog.`,
      );
    }
  });
}

type UpsertChangedRecordsInput = {
  env: RuntimeEnv;
  records: RawSyncRecord[];
  table: SyncTableName;
  user: AuthUser;
};

async function upsertChangedRecords(input: UpsertChangedRecordsInput) {
  const payloads = input.records.map((record) =>
    mapRawToRemotePayload(input.table, record, input.user),
  );

  await upsertRows(input.env, input.table, payloads);
}

async function deleteChangedRecords(input: {
  allowedDogIds: Set<string>;
  env: RuntimeEnv;
  ids: string[];
  table: SyncTableName;
  userId: string;
}) {
  if (input.ids.length === 0) {
    return;
  }

  if (input.table === 'users') {
    const ownUserDeleteIds = input.ids.filter((id) => id === input.userId);

    if (ownUserDeleteIds.length > 0) {
      await deleteRows(input.env, 'users', [
        idInFilter(ownUserDeleteIds),
        ['id', `eq.${input.userId}`],
      ]);
    }

    return;
  }

  if (input.table === 'dogs') {
    await deleteRows(input.env, 'dogs', [
      idInFilter(input.ids),
      ['user_id', `eq.${input.userId}`],
    ]);
    return;
  }

  if (
    input.table === 'events' ||
    input.table === 'expenses' ||
    input.table === 'dog_training_enrollments' ||
    input.table === 'training_sessions' ||
    input.table === 'care_tasks' ||
    input.table === 'photo_baselines'
  ) {
    await deleteRows(input.env, input.table, [
      idInFilter(input.ids),
      ['user_id', `eq.${input.userId}`],
    ]);
    return;
  }

  const existingRows = await selectRows<SupabaseRow>(input.env, input.table, [
    ['select', 'id,dog_id'],
    idInFilter(input.ids),
  ]);
  const allowedIds = existingRows
    .filter((row) => input.allowedDogIds.has(String(row.dog_id ?? '')))
    .map((row) => row.id);

  if (allowedIds.length > 0) {
    await deleteRows(input.env, input.table, [idInFilter(allowedIds)]);
  }
}

async function pushTableChanges(input: {
  allowedDogIds: Set<string>;
  body: Record<string, unknown>;
  env: RuntimeEnv;
  lastPulledAt: number;
  table: SyncTableName;
  user: AuthUser;
}) {
  const changes = getChangedRecordsForTable(input.body, input.table);
  const records = [...changes.created, ...changes.updated];

  await assertNoRemoteConflicts({
    env: input.env,
    ids: [...records.map((record) => record.id), ...changes.deleted],
    lastPulledAt: input.lastPulledAt,
    table: input.table,
  });

  assertRawRecordsBelongToUser({
    records,
    table: input.table,
    userId: input.user.id,
  });

  assertDogScopedRecordsAreAllowed({
    allowedDogIds: input.allowedDogIds,
    records,
    table: input.table,
  });

  await upsertChangedRecords({
    env: input.env,
    records,
    table: input.table,
    user: input.user,
  });
  await deleteChangedRecords({
    allowedDogIds: input.allowedDogIds,
    env: input.env,
    ids: changes.deleted,
    table: input.table,
    userId: input.user.id,
  });
}

function getAllowedDogIdsForPush(input: {
  manageableDogRecordIds: Set<string>;
  ownedDogIds: Set<string>;
  table: SyncTableName;
  writableDogIds: Set<string>;
}) {
  if (input.table === 'medications' || input.table === 'vaccinations') {
    return input.manageableDogRecordIds;
  }

  if (input.table === 'insights') {
    return input.ownedDogIds;
  }

  return input.writableDogIds;
}

async function pushChanges(input: {
  body: Record<string, unknown>;
  env: RuntimeEnv;
  user: AuthUser;
}) {
  const lastPulledAt =
    typeof input.body.lastPulledAt === 'number' ? input.body.lastPulledAt : 0;
  let ownedDogIds = new Set(await readOwnedDogIds(input.env, input.user.id));
  let writableDogIds = new Set(
    await readWritableDogIds(input.env, input.user.id),
  );
  let manageableDogRecordIds = new Set(
    await readManageableDogRecordIds(input.env, input.user.id),
  );
  const orderedTables: SyncTableName[] = [
    'users',
    'dogs',
    'events',
    'medications',
    'insights',
    'vaccinations',
    'expenses',
    'dog_training_enrollments',
    'training_sessions',
    'care_tasks',
    'photo_baselines',
  ];

  await orderedTables.reduce(async (previous, table) => {
    await previous;
    const allowedDogIds = getAllowedDogIdsForPush({
      manageableDogRecordIds,
      ownedDogIds,
      table,
      writableDogIds,
    });

    await pushTableChanges({
      allowedDogIds,
      body: input.body,
      env: input.env,
      lastPulledAt,
      table,
      user: input.user,
    });

    if (table === 'dogs') {
      ownedDogIds = new Set(await readOwnedDogIds(input.env, input.user.id));
      writableDogIds = new Set(
        await readWritableDogIds(input.env, input.user.id),
      );
      manageableDogRecordIds = new Set(
        await readManageableDogRecordIds(input.env, input.user.id),
      );
    }
  }, Promise.resolve());

  return jsonResponse({});
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'method_not_allowed',
        message: 'Use POST for barklog-sync.',
      },
      405,
    );
  }

  try {
    const env = getRuntimeEnv();
    const user = await requireAuthUser(request, env);
    const body = await readJsonBody(request);

    if (!isObjectRecord(body)) {
      throw new HttpError(400, 'invalid_request', 'Expected a JSON body.');
    }

    await requirePremiumSyncAccess({
      env,
      userId: user.id,
    });

    if (body.action === 'pull') {
      return await pullChanges({ body, env, user });
    }

    if (body.action === 'push') {
      return await pushChanges({ body, env, user });
    }

    throw new HttpError(
      400,
      'invalid_action',
      'Expected barklog-sync action pull or push.',
    );
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
        error: 'sync_failed',
        message:
          error instanceof Error ? error.message : 'BarkLog sync failed.',
      },
      500,
    );
  }
});
