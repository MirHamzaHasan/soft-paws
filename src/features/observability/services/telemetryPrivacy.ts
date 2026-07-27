type TelemetryPrimitive = boolean | number | string | null;

const SENSITIVE_KEY_PATTERN =
  /note|notes|symptom|symptoms|prompt|question|answer|content|transcript|export|csv|pdf|raw|preferred[_-]?name|contact[_-]?value|email|phone|handle/i;
const SENSITIVE_TEXT_PATTERN =
  /\b(note|notes|prompt|question|answer|transcript|export|csv|pdf|raw)\b/i;

export const TELEMETRY_REDACTED_VALUE = '[redacted]';

export function isSensitiveTelemetryKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function sanitizeTelemetryText(value: string) {
  if (SENSITIVE_TEXT_PATTERN.test(value)) {
    return TELEMETRY_REDACTED_VALUE;
  }

  return value;
}

function sanitizeTelemetryValue(value: unknown): TelemetryPrimitive {
  if (typeof value === 'string') {
    return sanitizeTelemetryText(value);
  }

  if (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    value === null
  ) {
    return value;
  }

  return TELEMETRY_REDACTED_VALUE;
}

export function sanitizeTelemetryProperties<T extends Record<string, unknown>>(
  properties: T,
) {
  return Object.entries(properties).reduce<Record<string, TelemetryPrimitive>>(
    (safeProperties, [key, value]) => ({
      ...safeProperties,
      [key]: isSensitiveTelemetryKey(key)
        ? TELEMETRY_REDACTED_VALUE
        : sanitizeTelemetryValue(value),
    }),
    {},
  );
}
