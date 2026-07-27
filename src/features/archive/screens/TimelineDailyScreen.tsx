import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  deleteLocalEvent,
  type EventModel,
  listLocalEventsForDogDate,
} from '@/db';
import { SyncStatusPill } from '@/features/sync/components/SyncStatusPill';
import { useSyncDisplayStatus } from '@/features/sync/hooks/useSyncDisplayStatus';
import HapticManager from '@/managers/HapticManager';
import { getSelectedDog, useAuthSessionStore } from '@/stores';

import { HomeBottomTabBar } from '../../home/components/HomeBottomTabBar';
import { LogDetailLayout } from '../../logging/components/LogDetailLayout';
import { TimelineEventRow } from '../components/TimelineEventRow';
import {
  formatEventClock,
  getEventPresentation,
} from '../utils/eventPresentation';

type DatePill = {
  day: string;
  key: string;
  value: string;
  date: Date;
};

const ONE_DAY = 24 * 60 * 60 * 1000;

const styles = StyleSheet.create({
  stack: {
    gap: 30,
  },
  title: {
    color: '#0A0A0A',
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '400',
    letterSpacing: -1.2,
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateCell: {
    alignItems: 'center',
    gap: 8,
    minWidth: 44,
  },
  dateLabel: {
    color: '#9C958E',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  dateLabelActive: {
    color: '#0A0A0A',
  },
  dateValue: {
    color: '#7A817F',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '400',
  },
  activeValueWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeValue: {
    color: '#FFFCFA',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '400',
  },
  eventList: {
    gap: 2,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E1DDD8',
    backgroundColor: '#FFFCFA',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    color: '#263136',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  emptyBody: {
    color: '#5F6670',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  emojiIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  summaryEntryCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8CCFF',
    backgroundColor: '#F7F4FF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 6,
  },
  summaryEntryEyebrow: {
    color: '#5A34C3',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryEntryTitle: {
    color: '#3E2A9E',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  summaryEntryBody: {
    color: '#5F6670',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
});

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDateKey(date: Date) {
  return startOfDay(date).toISOString();
}

function buildDatePills(selectedDate: Date): DatePill[] {
  const selectedStart = startOfDay(selectedDate).getTime();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(selectedStart + (index - 2) * ONE_DAY);

    return {
      date,
      day: new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
      })
        .format(date)
        .toUpperCase(),
      key: getDateKey(date),
      value: new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
      }).format(date),
    };
  });
}

function TimelineEmojiIcon({ emoji }: { emoji: string }) {
  return <Text style={styles.emojiIcon}>{emoji}</Text>;
}

export default function TimelineDailyScreen() {
  const router = useRouter();
  const dogs = useAuthSessionStore((state) => state.dogs);
  const barklogUser = useAuthSessionStore((state) => state.barklogUser);
  const selectedDogId = useAuthSessionStore((state) => state.selectedDogId);
  const selectedDog = getSelectedDog(dogs, selectedDogId);
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [events, setEvents] = useState<EventModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncStatus = useSyncDisplayStatus();

  const datePills = useMemo(() => buildDatePills(selectedDate), [selectedDate]);
  const selectedDateKey = getDateKey(selectedDate);

  const loadEvents = useCallback(async () => {
    if (!selectedDog?.id) {
      setEvents([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startAt = startOfDay(selectedDate).getTime();
      const nextEvents = await listLocalEventsForDogDate({
        dogId: selectedDog.id,
        endAt: startAt + ONE_DAY,
        startAt,
      });

      setEvents(nextEvents);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load timeline events.',
      );
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDog?.id, selectedDate]);

  useEffect(() => {
    loadEvents().catch(() => undefined);
  }, [loadEvents]);

  const handleDelete = async (eventId: string) => {
    await deleteLocalEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
  };

  const renderTimelineBody = () => {
    if (!selectedDog?.id) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Finish dog setup</Text>
          <Text style={styles.emptyBody}>
            Add a dog profile before reviewing Timeline events.
          </Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Loading Timeline</Text>
          <Text style={styles.emptyBody}>
            Reading saved BarkLog events from this device.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Timeline unavailable</Text>
          <Text style={styles.emptyBody}>{error}</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No events for this day</Text>
          <Text style={styles.emptyBody}>
            Detailed logs and one-tap events saved for this date will appear
            here newest first.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.eventList}>
        {events.map((event, index) => {
          const presentation = getEventPresentation(event);

          return (
            <TimelineEventRow
              key={event.id}
              accentColor={presentation.accentColor}
              cardBackgroundColor={presentation.cardBackgroundColor}
              detail={presentation.detail}
              icon={<TimelineEmojiIcon emoji={presentation.emoji} />}
              iconBackgroundColor={presentation.iconBackgroundColor}
              iconBorderColor={presentation.iconBorderColor}
              meta={
                barklogUser?.id && event.userId !== barklogUser.id
                  ? 'Logged by household member'
                  : undefined
              }
              showConnector={index < events.length - 1}
              time={formatEventClock(event.occurredAt)}
              title={presentation.title}
              titleColor={presentation.titleColor}
              onDelete={() => {
                handleDelete(event.id).catch(() => undefined);
              }}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          );
        })}
      </View>
    );
  };

  return (
    <LogDetailLayout
      title="BARKLOG"
      headerVariant="caps"
      footer={
        <HomeBottomTabBar
          activeTab="log"
          variant="journal"
          routes={{
            archive: '/timeline',
            gallery: '/photo-journal',
          }}
        />
      }
      onBackPress={() => router.back()}
    >
      <View style={styles.stack}>
        <Text style={styles.title}>Timeline</Text>

        <SyncStatusPill
          display={syncStatus.display}
          loading={syncStatus.isLoading}
          onPress={() => router.push('/sync-backup' as Href)}
        />

        <Pressable
          accessibilityHint="Opens Premium care summaries from your saved Timeline logs."
          accessibilityRole="button"
          style={styles.summaryEntryCard}
          onPress={() => {
            HapticManager.light().catch(() => undefined);
            router.push('/insights' as Href);
          }}
        >
          <Text style={styles.summaryEntryEyebrow}>Premium summaries</Text>
          <Text style={styles.summaryEntryTitle}>
            Summarize this care record
          </Text>
          <Text style={styles.summaryEntryBody}>
            Timeline stays free. Premium turns local logs into short health,
            mood, behavior, nutrition, expense, and training summaries.
          </Text>
        </Pressable>

        <View style={styles.dateStrip}>
          {datePills.map((item) => {
            const active = item.key === selectedDateKey;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                style={styles.dateCell}
                onPress={() => setSelectedDate(startOfDay(item.date))}
              >
                <Text
                  style={[
                    styles.dateLabel,
                    active ? styles.dateLabelActive : null,
                  ]}
                >
                  {item.day}
                </Text>
                {active ? (
                  <View style={styles.activeValueWrap}>
                    <Text style={styles.activeValue}>{item.value}</Text>
                  </View>
                ) : (
                  <Text style={styles.dateValue}>{item.value}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {renderTimelineBody()}
      </View>
    </LogDetailLayout>
  );
}
