import { hmac } from '@noble/hashes/hmac.js'; // eslint-disable-line import/extensions -- Noble ESM export path.
import { sha256 } from '@noble/hashes/sha2.js'; // eslint-disable-line import/extensions -- Noble ESM export path.
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'; // eslint-disable-line import/extensions -- Noble ESM export path.
import * as Crypto from 'expo-crypto';
import { AppState, Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import { readClientEnv } from '@/utils/clientEnv';

type GameAnalyticsEvent = Record<string, boolean | number | string>;

type GameAnalyticsSession = {
  active: boolean;
  gameKey: string;
  localOwnerId: string;
  ready: boolean;
  secretKey: string;
  sessionId: string;
  sessionNumber: number;
  startedAt: number;
  userId: string;
  version: string;
};

const BATCH_SIZE = 50;
const MAX_QUEUED_EVENTS = 150;
const FLUSH_DELAY_MS = 20_000;
const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOG_TYPES = new Set([
  'appetite',
  'behavior',
  'cough_sneeze',
  'dental',
  'meal',
  'medication',
  'mobility',
  'mood',
  'parasite_prevention',
  'pee',
  'poop',
  'rest',
  'symptom',
  'vet_visit',
  'vomit',
  'walk',
  'water',
]);
const SCREEN_NAMES: Record<string, string> = {
  '/': 'home',
  '/home': 'home',
  '/timeline': 'timeline',
  '/insights': 'insights',
  '/profile': 'profile',
  '/settings': 'settings',
  '/safety': 'safety',
  '/training': 'training',
  '/care-calendar': 'care_calendar',
  '/photo-baselines': 'photo_baselines',
  '/memory-book': 'memory_book',
  '/expenses': 'expenses',
  '/ask-ai': 'ask_ai',
  '/vet-prep': 'vet_prep',
};

let session: GameAnalyticsSession | null = null;
let storage: ReturnType<typeof createMMKV> | null = null;
let flushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let initRetryTimer: ReturnType<typeof setTimeout> | null = null;
let appStateListenerInstalled = false;
let trackingUserEnabled = true;

function getStorage() {
  if (!storage) storage = createMMKV({ id: 'barklog-gameanalytics' });
  return storage;
}

function toBase64(bytes: Uint8Array) {
  let encoded = '';

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const combined = (first ?? 0) * 65536 + (second ?? 0) * 256 + (third ?? 0);

    encoded += BASE64_ALPHABET[Math.floor(combined / 262144) % 64];
    encoded += BASE64_ALPHABET[Math.floor(combined / 4096) % 64];
    encoded +=
      second === undefined
        ? '='
        : BASE64_ALPHABET[Math.floor(combined / 64) % 64];
    encoded += third === undefined ? '=' : BASE64_ALPHABET[combined % 64];
  }

  return encoded;
}

export function signGameAnalyticsBody(body: string, secretKey: string) {
  return toBase64(hmac(sha256, utf8ToBytes(secretKey), utf8ToBytes(body)));
}

function readQueue(): GameAnalyticsEvent[] {
  try {
    const parsed: unknown = JSON.parse(getStorage().getString('queue') ?? '[]');
    return Array.isArray(parsed) ? (parsed as GameAnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: GameAnalyticsEvent[]) {
  getStorage().set('queue', JSON.stringify(events.slice(-MAX_QUEUED_EVENTS)));
}

function enqueue(event: GameAnalyticsEvent) {
  writeQueue([...readQueue(), event]);
}

function annotations(current: GameAnalyticsSession): GameAnalyticsEvent {
  return {
    build: current.version,
    client_ts: Math.floor(Date.now() / 1000),
    device: 'unknown',
    manufacturer: 'unknown',
    os_version: `${Platform.OS} ${Platform.Version}`,
    platform: Platform.OS,
    sdk_version: 'rest api v2',
    session_id: current.sessionId,
    session_num: current.sessionNumber,
    user_id: current.userId,
    v: 2,
  };
}

async function post(
  path: 'events' | 'init',
  body: string,
  current: GameAnalyticsSession,
) {
  return fetch(`https://api.gameanalytics.com/v2/${current.gameKey}/${path}`, {
    body,
    headers: {
      Authorization: signGameAnalyticsBody(body, current.secretKey),
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
}

async function flush() {
  const current = session;
  if (!current?.ready || flushing) return;

  const batch = readQueue().slice(0, BATCH_SIZE);
  if (!batch.length) return;

  flushing = true;
  try {
    const response = await post('events', JSON.stringify(batch), current);
    if (response.ok) {
      writeQueue(readQueue().slice(batch.length));
      if (readQueue().length) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        scheduleFlush();
      }
    }
  } catch {
    // Analytics never blocks care actions. Keep the bounded queue for retry.
  } finally {
    flushing = false;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush().catch(() => undefined);
  }, FLUSH_DELAY_MS);
}

function getCredentials() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return null;
  const env = readClientEnv();
  if (!env.ok) return null;

  const gameKey =
    Platform.OS === 'android'
      ? env.value.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_GAME_KEY
      : env.value.EXPO_PUBLIC_GAMEANALYTICS_IOS_GAME_KEY;
  const secretKey =
    Platform.OS === 'android'
      ? env.value.EXPO_PUBLIC_GAMEANALYTICS_ANDROID_SECRET_KEY
      : env.value.EXPO_PUBLIC_GAMEANALYTICS_IOS_SECRET_KEY;

  return gameKey && secretKey ? { gameKey, secretKey } : null;
}

function endSession() {
  const current = session;
  if (!current?.active) return;
  enqueue({
    ...annotations(current),
    category: 'session_end',
    length: Math.min(
      172800,
      Math.floor((Date.now() - current.startedAt) / 1000),
    ),
  });
  current.active = false;
  flush().catch(() => undefined);
}

function installAppStateListener() {
  if (appStateListenerInstalled) return;
  appStateListenerInstalled = true;
  AppState.addEventListener('change', (state) => {
    if (state === 'background') endSession();
    if (
      state === 'active' &&
      trackingUserEnabled &&
      session &&
      !session.active
    ) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      startGameAnalyticsSession(session.localOwnerId, session.version);
    }
  });
}

function initializeSession(current: GameAnalyticsSession) {
  const initializedSession = current;
  const initBody = JSON.stringify({
    os_version: `${Platform.OS} ${Platform.Version}`,
    platform: Platform.OS,
    sdk_version: 'rest api v2',
  });
  const retry = () => {
    if (session !== current || !current.active || initRetryTimer) return;
    initRetryTimer = setTimeout(() => {
      initRetryTimer = null;
      if (session === current && current.active) initializeSession(current);
    }, 30_000);
  };
  post('init', initBody, current)
    .then((response) => {
      if (!response.ok) {
        retry();
        return;
      }
      if (session === initializedSession) {
        initializedSession.ready = true;
        flush().catch(() => undefined);
      }
    })
    .catch(retry);
}

export function startGameAnalyticsSession(userId: string, version: string) {
  const credentials = getCredentials();
  if (!credentials || (session?.active && session.localOwnerId === userId))
    return;
  if (session?.active) endSession();
  if (initRetryTimer) clearTimeout(initRetryTimer);
  initRetryTimer = null;
  trackingUserEnabled = true;

  const nextSessionNumber = (getStorage().getNumber('session_num') ?? 0) + 1;
  getStorage().set('session_num', nextSessionNumber);
  session = {
    active: true,
    ...credentials,
    localOwnerId: userId,
    ready: false,
    sessionId: Crypto.randomUUID().toLowerCase(),
    sessionNumber: nextSessionNumber,
    startedAt: Date.now(),
    userId: bytesToHex(sha256(utf8ToBytes(`barklog-ga:${userId}`))).slice(
      0,
      32,
    ),
    version,
  };
  const current = session;
  enqueue({ ...annotations(current), category: 'user' });
  installAppStateListener();
  initializeSession(current);
}

function designEventId(
  event: string,
  properties: Record<string, boolean | number | string | null>,
) {
  if (
    (event === 'quick_log_saved' || event === 'detail_log_saved') &&
    typeof properties.event_type === 'string' &&
    LOG_TYPES.has(properties.event_type)
  ) {
    return `BarkLog:${event}:${properties.event_type}`;
  }
  if (event === 'screen_viewed' && typeof properties.screen_name === 'string') {
    const screen = SCREEN_NAMES[properties.screen_name];
    if (screen) return `BarkLog:screen_viewed:${screen}`;
  }
  if (event === 'ai_answered' && typeof properties.source === 'string') {
    if (['atlas', 'device', 'safety'].includes(properties.source)) {
      return `BarkLog:ai_answered:${properties.source}`;
    }
  }
  if (
    event === 'export_completed' &&
    typeof properties.export_type === 'string'
  ) {
    if (properties.export_type === 'application/pdf')
      return 'BarkLog:export_completed:pdf';
    if (properties.export_type === 'text/csv')
      return 'BarkLog:export_completed:csv';
  }
  return `BarkLog:${event}`;
}

export function trackGameAnalyticsEvent(
  event: string,
  properties: Record<string, boolean | number | string | null> = {},
) {
  const current = session;
  if (!current?.active) return;
  // Only fixed event names enter the hierarchy. No dog IDs or care text leave the device.
  enqueue({
    ...annotations(current),
    category: 'design',
    event_id: designEventId(event, properties),
  });
  scheduleFlush();
}

export function stopGameAnalyticsSession() {
  trackingUserEnabled = false;
  if (flushTimer) clearTimeout(flushTimer);
  if (initRetryTimer) clearTimeout(initRetryTimer);
  flushTimer = null;
  initRetryTimer = null;
  session = null;
  // A local profile deletion must not leave its unsent events on this device.
  if (storage) storage.set('queue', '[]');
}
