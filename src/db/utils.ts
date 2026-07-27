import type { Json } from '@/types/supabase';

import type { UnixTimestampInput } from './types';

export function toUnixTimestamp(
  input?: UnixTimestampInput | null,
): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }

  const value = input.getTime();

  return Number.isFinite(value) ? value : null;
}

export function isJsonValue(value: unknown): value is Json {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }

  if (typeof value === 'object') {
    return Object.values(value).every(
      (entry) => entry === undefined || isJsonValue(entry),
    );
  }

  return false;
}

export function sanitizeJsonValue(value: unknown, fallback: Json = {}): Json {
  return isJsonValue(value) ? value : fallback;
}

export function sanitizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
