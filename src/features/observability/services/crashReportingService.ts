import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { readClientEnv } from '@/utils/clientEnv';

import {
  sanitizeTelemetryProperties,
  sanitizeTelemetryText,
} from './telemetryPrivacy';

type CrashLevel = 'error' | 'fatal' | 'info' | 'warning';

type CrashContext = {
  extra?: Record<string, unknown>;
  level?: CrashLevel;
  source: string;
  tags?: Record<string, string>;
};

type CrashUser = {
  email?: string | null;
  id: string;
};

type SentryDsn = {
  dsn: string;
  envelopeUrl: string;
  publicKey: string;
};

let cachedDsn: SentryDsn | null | undefined;
let currentUser: CrashUser | null = null;
let globalHandlersInstalled = false;

function createEventId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
}

function getAppVersion() {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    Constants.manifest2?.extra?.expoClient?.version ??
    'unknown'
  );
}

function parseSentryDsn(dsn: string): SentryDsn | null {
  try {
    const url = new URL(dsn);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const projectId = pathParts[pathParts.length - 1];

    if (!projectId || !url.username) {
      return null;
    }

    return {
      dsn,
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
      publicKey: url.username,
    };
  } catch {
    return null;
  }
}

function getSentryDsn() {
  if (cachedDsn !== undefined) {
    return cachedDsn;
  }

  const env = readClientEnv();

  cachedDsn = env.ok
    ? parseSentryDsn(env.value.EXPO_PUBLIC_SENTRY_DSN ?? '')
    : null;

  return cachedDsn;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: sanitizeTelemetryText(error.message),
      name: error.name,
      stack: error.stack ? sanitizeTelemetryText(error.stack) : null,
    };
  }

  return {
    message:
      typeof error === 'string'
        ? sanitizeTelemetryText(error)
        : 'Unknown BarkLog error',
    name: 'Error',
    stack: null,
  };
}

async function sendSentryEvent(event: Record<string, unknown>) {
  const sentryDsn = getSentryDsn();

  if (!sentryDsn) {
    return;
  }

  const envelope = [
    JSON.stringify({
      dsn: sentryDsn.dsn,
      sent_at: new Date().toISOString(),
    }),
    JSON.stringify({ type: 'event' }),
    JSON.stringify(event),
  ].join('\n');

  try {
    await fetch(sentryDsn.envelopeUrl, {
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      method: 'POST',
    });
  } catch {
    // Crash reporting cannot interrupt caregiver workflows.
  }
}

export function initializeCrashReporting() {
  getSentryDsn();
}

export function setCrashReportingUser(user: CrashUser | null) {
  currentUser = user;
}

export function captureBarklogError(error: unknown, context: CrashContext) {
  const normalizedError = normalizeError(error);
  const eventId = createEventId();

  sendSentryEvent({
    contexts: {
      app: {
        app_identifier: Constants.expoConfig?.slug ?? 'barklog',
        app_name: Constants.expoConfig?.name ?? 'BarkLog',
        app_version: getAppVersion(),
      },
      barklog: {
        source: context.source,
        ...sanitizeTelemetryProperties(context.extra ?? {}),
      },
      device: {
        platform: Platform.OS,
      },
    },
    environment: __DEV__ ? 'development' : 'production',
    event_id: eventId,
    exception: {
      values: [
        {
          stacktrace: normalizedError.stack
            ? { frames: [{ function: normalizedError.stack }] }
            : undefined,
          type: normalizedError.name,
          value: sanitizeTelemetryText(normalizedError.message),
        },
      ],
    },
    level: context.level ?? 'error',
    message: sanitizeTelemetryText(normalizedError.message),
    platform: 'javascript',
    release: `barklog@${getAppVersion()}`,
    tags: context.tags,
    timestamp: new Date().toISOString(),
    user: currentUser
      ? {
          email: currentUser.email ?? undefined,
          id: currentUser.id,
        }
      : undefined,
  }).catch(() => undefined);

  return eventId;
}

export function captureBarklogMessage(message: string, context: CrashContext) {
  sendSentryEvent({
    contexts: {
      barklog: {
        source: context.source,
        ...sanitizeTelemetryProperties(context.extra ?? {}),
      },
      device: {
        platform: Platform.OS,
      },
    },
    environment: __DEV__ ? 'development' : 'production',
    event_id: createEventId(),
    level: context.level ?? 'info',
    message: sanitizeTelemetryText(message),
    platform: 'javascript',
    release: `barklog@${getAppVersion()}`,
    tags: context.tags,
    timestamp: new Date().toISOString(),
    user: currentUser ?? undefined,
  }).catch(() => undefined);
}

type GlobalErrorUtils = {
  getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler?: (
    handler: (error: Error, isFatal?: boolean) => void,
  ) => void;
};

export function installGlobalCrashHandlers() {
  if (globalHandlersInstalled) {
    return;
  }

  globalHandlersInstalled = true;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      captureBarklogError(event.error ?? event.message, {
        level: 'fatal',
        source: 'window_error',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      captureBarklogError(event.reason, {
        level: 'error',
        source: 'unhandled_rejection',
      });
    });

    return;
  }

  const errorUtils = (globalThis as { ErrorUtils?: GlobalErrorUtils })
    .ErrorUtils;
  const previousHandler = errorUtils?.getGlobalHandler?.();

  errorUtils?.setGlobalHandler?.((error, isFatal) => {
    captureBarklogError(error, {
      level: isFatal ? 'fatal' : 'error',
      source: 'react_native_global_error',
    });

    previousHandler?.(error, isFatal);
  });
}
