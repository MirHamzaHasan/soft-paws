import { type Collection, Q } from '@nozbe/watermelondb';
import { startTransition, useEffect, useState } from 'react';

import {
  type BarklogEventType,
  createLocalEvent,
  type EventModel,
  getBarklogDatabase,
} from '@/db';
import {
  getBehaviorEmoji,
  getBehaviorLabel,
  getExpandedCareEventEmoji,
  getExpandedCareEventLabel,
  getMoodEmoji,
  getMoodLabel,
  isBehaviorIntensity,
  isBehaviorValue,
  isExpandedCareEventType,
  isMoodValue,
} from '@/types/events';
import type { Json } from '@/types/local';
import { getBarklogErrorMessage } from '@/utils/barklogErrorMessages';

const CORE_SUMMARY_EVENT_TYPES = ['meal', 'pee', 'poop', 'walk'] as const;

export type HomeInstantLogType =
  | 'behavior'
  | 'grooming'
  | 'meal'
  | 'mood'
  | 'pee'
  | 'poop'
  | 'walk'
  | 'weight';

export type HomeRecentEvent = {
  detail: string;
  emoji: string;
  id: string;
  timeLabel: string;
  title: string;
  type: BarklogEventType;
};

export type HomeLoggingSnapshot = {
  error: string | null;
  latestEntryLabel: string | null;
  recentEvents: HomeRecentEvent[];
  summaryCounts: Record<(typeof CORE_SUMMARY_EVENT_TYPES)[number], number>;
  todayEventCount: number;
  warningMessage: string | null;
};

const defaultSnapshot: HomeLoggingSnapshot = {
  error: null,
  latestEntryLabel: null,
  recentEvents: [],
  summaryCounts: {
    meal: 0,
    pee: 0,
    poop: 0,
    walk: 0,
  },
  todayEventCount: 0,
  warningMessage: null,
};

function formatEventTime(timestamp: number | null) {
  if (!timestamp) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

function asJsonObject(value: Json) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, Json | undefined>;
}

function formatRecentEvent(event: EventModel): HomeRecentEvent {
  const details = asJsonObject(event.details);
  const titleMap: Record<BarklogEventType, { emoji: string; title: string }> = {
    appetite: { emoji: '🥣', title: 'Appetite' },
    grooming: { emoji: '🛁', title: 'Grooming' },
    behavior: { emoji: '🐕', title: 'Behavior' },
    cough_sneeze: { emoji: '🤧', title: 'Cough / Sneeze' },
    dental: { emoji: '🦷', title: 'Dental' },
    meal: { emoji: '🍽️', title: 'Meal' },
    medication: { emoji: '💊', title: 'Medication' },
    mood: { emoji: '😊', title: 'Mood' },
    mobility: { emoji: '🐾', title: 'Mobility' },
    note: { emoji: '📝', title: 'Note' },
    parasite_prevention: { emoji: '🛡️', title: 'Prevention' },
    pee: { emoji: '💧', title: 'Pee' },
    poop: { emoji: '💩', title: 'Poop' },
    rest: { emoji: '💤', title: 'Rest' },
    symptom: { emoji: '🤕', title: 'Symptom' },
    training: { emoji: '🎓', title: 'Training' },
    vet_visit: { emoji: '🏥', title: 'Vet Visit' },
    vomit: { emoji: '🤢', title: 'Vomit' },
    walk: { emoji: '🚶', title: 'Walk' },
    water: { emoji: '💧', title: 'Water' },
    weight: { emoji: '⚖️', title: 'Weight' },
  };

  let detail = 'Logged';

  if (event.type === 'poop' && typeof details?.quality === 'string') {
    detail = `Quality: ${details.quality}`;
  } else if (
    event.type === 'walk' &&
    typeof details?.duration_min === 'number'
  ) {
    detail = `${details.duration_min} min walk`;
  } else if (
    event.type === 'weight' &&
    typeof details?.weight_lbs === 'number'
  ) {
    detail = `${details.weight_lbs} lbs`;
  } else if (
    event.type === 'grooming' &&
    typeof details?.grooming_type === 'string'
  ) {
    detail = details.grooming_type.replace(/_/g, ' ');
  } else if (event.type === 'mood' && isMoodValue(details?.mood)) {
    const moodLabel = getMoodLabel(details.mood);
    detail =
      typeof details.energy === 'string'
        ? `${moodLabel} mood · ${details.energy} energy`
        : `${moodLabel} mood`;
  } else if (event.type === 'behavior' && isBehaviorValue(details?.behavior)) {
    const behaviorLabel = getBehaviorLabel(details.behavior);
    detail = isBehaviorIntensity(details.intensity)
      ? `${behaviorLabel} · ${details.intensity} intensity`
      : behaviorLabel;
  } else if (
    event.type === 'training' &&
    typeof details?.step_title === 'string'
  ) {
    detail =
      typeof details.duration_min === 'number'
        ? `${details.step_title} · ${details.duration_min} min`
        : details.step_title;
  } else if (isExpandedCareEventType(event.type)) {
    detail = 'Observation saved';
  } else if (typeof event.notes === 'string' && event.notes.trim().length > 0) {
    detail = event.notes.trim();
  } else if (event.type === 'meal') {
    detail = 'Meal logged';
  } else if (event.type === 'pee') {
    detail = 'Quick log saved';
  } else if (event.type === 'walk') {
    detail = 'Walk logged';
  }

  const { emoji: defaultEmoji, title: defaultTitle } = titleMap[event.type];
  let emoji = defaultEmoji;
  let title = defaultTitle;

  if (event.type === 'behavior' && isBehaviorValue(details?.behavior)) {
    emoji = getBehaviorEmoji(details.behavior);
    title = `${getBehaviorLabel(details.behavior)} behavior`;
  } else if (event.type === 'mood' && isMoodValue(details?.mood)) {
    emoji = getMoodEmoji(details.mood);
    title = `${getMoodLabel(details.mood)} mood`;
  } else if (isExpandedCareEventType(event.type)) {
    emoji = getExpandedCareEventEmoji(event.type);
    title = getExpandedCareEventLabel(event.type);
  }

  return {
    detail,
    emoji,
    id: event.id,
    timeLabel: formatEventTime(event.occurredAt),
    title,
    type: event.type,
  };
}

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

function getInstantEventDetails(
  type: HomeInstantLogType,
  weightLbs?: number | null,
) {
  if (type === 'poop') {
    return { color: 'brown', quality: 'normal' } satisfies Json;
  }

  if (type === 'walk') {
    return { source: 'manual' } satisfies Json;
  }

  if (type === 'weight' && typeof weightLbs === 'number') {
    return { weight_lbs: weightLbs } satisfies Json;
  }

  return {};
}

async function loadHomeSnapshot(dogId: string) {
  const database = getBarklogDatabase();
  const eventCollection = database.get('events') as Collection<EventModel>;
  const startOfToday = getStartOfToday();

  const [todayEvents, recentEvents, lastPoopEvents] =
    await Promise.all([
      eventCollection
        .query(
          Q.where('dog_id', dogId),
          Q.where('occurred_at', Q.gte(startOfToday)),
          Q.sortBy('occurred_at', Q.desc),
        )
        .fetch(),
      eventCollection
        .query(
          Q.where('dog_id', dogId),
          Q.sortBy('occurred_at', Q.desc),
          Q.take(4),
        )
        .fetch(),
      eventCollection
        .query(
          Q.where('dog_id', dogId),
          Q.where('type', 'poop'),
          Q.sortBy('occurred_at', Q.desc),
          Q.take(1),
        )
        .fetch(),
    ]);

  const summaryCounts = todayEvents.reduce<
    HomeLoggingSnapshot['summaryCounts']
  >(
    (counts, event) => {
      if (!(event.type in counts)) {
        return counts;
      }

      return {
        ...counts,
        [event.type]: counts[event.type as keyof typeof counts] + 1,
      };
    },
    {
      meal: 0,
      pee: 0,
      poop: 0,
      walk: 0,
    },
  );

  const latestEntry = recentEvents[0] ?? null;
  const lastPoop = lastPoopEvents[0] ?? null;
  const hasPoopGap =
    lastPoop && Date.now() - lastPoop.occurredAt >= 24 * 60 * 60 * 1000;

  return {
    error: null,
    latestEntryLabel: latestEntry
      ? `${formatRecentEvent(latestEntry).title} at ${formatEventTime(latestEntry.occurredAt)}`
      : null,
    recentEvents: recentEvents.map(formatRecentEvent),
    summaryCounts,
    todayEventCount: todayEvents.length,
    warningMessage: hasPoopGap ? "Hasn't pooped in 24 hours" : null,
  } satisfies HomeLoggingSnapshot;
}

export function useHomeLoggingLoop(input: {
  dogId: string | null;
  userId: string | null;
  weightLbs?: number | null;
}) {
  const {
    dogId,
    userId,
    weightLbs,
  } = input;
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] =
    useState<HomeLoggingSnapshot>(defaultSnapshot);

  useEffect(() => {
    let isActive = true;

    if (!dogId) {
      setSnapshot(defaultSnapshot);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    const hydrate = async () => {
      setIsLoading(true);

      try {
        const nextSnapshot = await loadHomeSnapshot(dogId);

        if (isActive) {
          startTransition(() => {
            setSnapshot(nextSnapshot);
            setIsLoading(false);
          });
        }
      } catch (error) {
        if (isActive) {
          startTransition(() => {
            setSnapshot({
              ...defaultSnapshot,
              error: getBarklogErrorMessage(error, {
                domain: 'local_save',
                fallback: 'Unable to load local BarkLog activity.',
              }),
            });
            setIsLoading(false);
          });
        }
      }
    };

    hydrate().catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [dogId]);

  const refresh = async () => {
    if (!dogId) {
      return;
    }

    const nextSnapshot = await loadHomeSnapshot(dogId);
    startTransition(() => {
      setSnapshot(nextSnapshot);
      setIsLoading(false);
    });
  };

  const logInstantEvent = async (
    type: HomeInstantLogType,
    options?: {
      details?: Json;
      notes?: string | null;
      occurredAt?: number;
    },
  ) => {
    if (!dogId || !userId) {
      throw new Error('Complete BarkLog onboarding before logging events.');
    }

    if (type === 'weight' && typeof weightLbs !== 'number') {
      throw new Error(
        "Add your dog's weight in Profile before using quick log.",
      );
    }

    await createLocalEvent({
      details: options?.details ?? getInstantEventDetails(type, weightLbs),
      dogId,
      notes: options?.notes ?? null,
      occurredAt: options?.occurredAt ?? Date.now(),
      source: 'instant',
      type,
      userId,
    });

    await refresh();
  };

  return {
    isLoading,
    logInstantEvent,
    refresh,
    snapshot,
  };
}
